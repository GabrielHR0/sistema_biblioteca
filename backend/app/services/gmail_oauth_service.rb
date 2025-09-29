# app/services/gmail_oauth_service.rb
require 'net/http'
require 'uri'
require 'json'
require 'cgi'
require 'securerandom'

class GmailOauthService
  SCOPE = 'https://www.googleapis.com/auth/gmail.send'.freeze
  GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'.freeze
  GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'.freeze
  GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke'.freeze

  REDIRECT_URI = ENV.fetch('GOOGLE_REDIRECT_URI', 'http://localhost:3000/auth/google/callback')

  def initialize(email_account)
    @e = email_account
    @client_id = ENV['GOOGLE_CLIENT_ID']
    @client_secret = ENV['GOOGLE_CLIENT_SECRET']

    Rails.logger.info "GmailOauthService init: client_id=#{@client_id.present? ? 'present' : 'missing'} client_secret=#{@client_secret.present? ? 'present' : 'missing'}"

    raise 'Missing required client identifier.' if @client_id.blank?
    raise 'Missing required client secret.' if @client_secret.blank?
  end

  # Gera a URL de autorização com state para CSRF e referência da biblioteca
  def authorization_url
    state = { library_id: @e.library_id, nonce: SecureRandom.hex(16) }.to_json
    params = {
      client_id: @client_id,
      redirect_uri: REDIRECT_URI,
      scope: SCOPE,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      login_hint: @e.gmail_user_email,
      state: state
    }
    "#{GOOGLE_AUTH_URL}?#{params.map { |k, v| "#{k}=#{CGI.escape(v.to_s)}" }.join('&')}"
  end

  # Troca code por tokens
  def fetch_and_store_credentials(code)
    uri = URI(GOOGLE_TOKEN_URL)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Post.new(uri)
    request['Content-Type'] = 'application/x-www-form-urlencoded'
    params = {
      code: code,
      client_id: @client_id,
      client_secret: @client_secret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    request.body = params.map { |k, v| "#{k}=#{CGI.escape(v.to_s)}" }.join('&')

    response = http.request(request)
    Rails.logger.info "Token endpoint status=#{response.code}"

    unless response.code == '200'
      error_data = JSON.parse(response.body) rescue {}
      error_message = error_data['error_description'] || error_data['error'] || 'Erro desconhecido'
      raise "Erro ao trocar código por tokens: #{error_message}"
    end

    data = JSON.parse(response.body)

    {
      access_token: data['access_token'],
      refresh_token: data['refresh_token'],
      expires_at: Time.current.to_i + data['expires_in'].to_i
    }
  end

  # Credenciais válidas?
  def valid_credentials?
    return false unless @e.gmail_oauth_token.present?
    return true if @e.token_expires_at && @e.token_expires_at > Time.current
    @e.gmail_refresh_token.present?
  end

  # Renova o access token usando refresh token
  def refresh_access_token
    return nil unless @e.gmail_refresh_token.present?

    uri = URI(GOOGLE_TOKEN_URL)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Post.new(uri)
    request['Content-Type'] = 'application/x-www-form-urlencoded'
    params = {
      client_id: @client_id,
      client_secret: @client_secret,
      refresh_token: @e.gmail_refresh_token,
      grant_type: 'refresh_token'
    }
    request.body = params.map { |k, v| "#{k}=#{CGI.escape(v.to_s)}" }.join('&')

    response = http.request(request)
    Rails.logger.info "Refresh endpoint status=#{response.code}"

    unless response.code == '200'
      error_data = JSON.parse(response.body) rescue {}
      error_message = error_data['error_description'] || error_data['error'] || 'Erro desconhecido'
      raise "Erro ao renovar token: #{error_message}"
    end

    data = JSON.parse(response.body)
    {
      access_token: data['access_token'],
      expires_at: Time.current.to_i + data['expires_in'].to_i
    }
  end

  # Revoga autorização (prefere refresh token)
  def revoke_authorization
    token_to_revoke = @e.gmail_refresh_token.presence || @e.gmail_oauth_token
    return unless token_to_revoke

    uri = URI(GOOGLE_REVOKE_URL)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Post.new(uri)
    request['Content-Type'] = 'application/x-www-form-urlencoded'
    request.body = "token=#{CGI.escape(token_to_revoke)}"

    response = http.request(request)
    Rails.logger.info "Revocation status=#{response.code}"
  rescue => e
    Rails.logger.error "Erro ao revogar autorização: #{e.message}"
  end
end
