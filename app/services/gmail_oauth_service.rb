# app/services/gmail_oauth_service.rb
class GmailOauthService
  include Rails.application.routes.url_helpers

  def initialize(email, state = nil)
    @email = email
    @state = state
    @library_id = extract_library_id(state)&.to_s  # garante string

    # Configure as opções padrão
    @default_url_options = {
      host: 'localhost',
      port: 3000,
      protocol: 'http'
    }
  end

  def authorization_url
    generate_authorization_url
  end

  def fetch_credentials(code)
    require 'net/http'
    require 'uri'
    
    uri = URI('https://oauth2.googleapis.com/token')
    
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    
    request = Net::HTTP::Post.new(uri.path)
    request.set_form_data(
      code: code,
      client_id: client_id,
      client_secret: client_secret,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    )
    
    response = http.request(request)
    
    if response.code == '200'
      JSON.parse(response.body)
    else
      raise "Erro ao obter token: #{response.body}"
    end
  end

  private

  def client_id
    "441010142207-90e8tjleptuol7itb8793qs1bithmcrh.apps.googleusercontent.com"
  end

  def client_secret
    "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"
  end

  def extract_library_id(state)
    return nil unless state

    begin
      state_data = JSON.parse(state)
      state_data['library_id']  # pode ser número ou string
    rescue JSON::ParserError
      nil
    end
  end

  def redirect_uri
    # Converte library_id para string para evitar TypeError
    callback_library_email_account_url(
      library_id: @library_id.to_s,
      host: 'localhost',
      port: 3000
    )
  end

  def generate_authorization_url
    base_url = "https://accounts.google.com/o/oauth2/auth"
    params = {
      client_id: client_id,
      redirect_uri: redirect_uri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/gmail.send',
      access_type: 'offline',
      prompt: 'consent',
      state: @state
    }
    
    "#{base_url}?#{params.to_query}"
  end
end
