require 'google/apis/gmail_v1'
require 'googleauth'
require 'mail'
require 'stringio'

class GmailEmailService
  SCOPE = 'https://www.googleapis.com/auth/gmail.send'.freeze

  def initialize(email_account)
    @email_account = email_account
    @gmail = Google::Apis::GmailV1::GmailService.new
    @gmail.client_options.application_name = "LibraryMailer"
    @gmail.authorization = build_authorization
  end

  def send_email(to:, subject:, body:)
    message = create_message(to: to, subject: subject, body: body)

    @gmail.send_user_message(
      'me',
      upload_source: StringIO.new(message),
      content_type: 'message/rfc822'
    )
  rescue Google::Apis::AuthorizationError => e
    # Tentar refresh se houver erro de autorização
    refresh_authorization
    retry
  end

  private

  def build_authorization
    credentials = Google::Auth::UserRefreshCredentials.new(
      client_id: ENV['GOOGLE_CLIENT_ID'],
      client_secret: ENV['GOOGLE_CLIENT_SECRET'],
      scope: SCOPE,
      access_token: @email_account.gmail_oauth_token,
      refresh_token: @email_account.gmail_refresh_token,
      token_credential_uri: 'https://oauth2.googleapis.com/token'
    )

    # Verificar se o token expirou e fazer refresh se necessário
    if token_expired? && @email_account.gmail_refresh_token.present?
      refresh_credentials(credentials)
    end

    credentials
  end

  def token_expired?
    @email_account.token_expires_at && @email_account.token_expires_at <= Time.current
  end

  def refresh_credentials(credentials)
    credentials.refresh!
    update_account_tokens(credentials)
  rescue Signet::AuthorizationError => e
    Rails.logger.error "Failed to refresh token: #{e.message}"
    # Se o refresh falhar, pode ser necessário reautenticar
    raise
  end

  def refresh_authorization
    credentials = Google::Auth::UserRefreshCredentials.new(
      client_id: ENV['GOOGLE_CLIENT_ID'],
      client_secret: ENV['GOOGLE_CLIENT_SECRET'],
      refresh_token: @email_account.gmail_refresh_token,
      scope: SCOPE,
      token_credential_uri: 'https://oauth2.googleapis.com/token'
    )
    
    credentials.refresh!
    update_account_tokens(credentials)
    @gmail.authorization = credentials
  end

  def update_account_tokens(credentials)
    @email_account.update!(
      gmail_oauth_token: credentials.access_token,
      token_expires_at: credentials.expires_at,
      gmail_refresh_token: credentials.refresh_token || @email_account.gmail_refresh_token
    )
  end

  def create_message(to:, subject:, body:)
    mail = Mail.new
    mail.to = to
    mail.from = @email_account.gmail_user_email
    mail.subject = subject
    mail.body = body
    mail.content_type = 'text/html; charset=UTF-8'
    mail.to_s
  end
end