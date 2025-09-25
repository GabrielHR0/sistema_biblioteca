# app/services/gmail_oauth_service.rb
require 'googleauth'
require 'googleauth/stores/file_token_store'
require 'google/apis/gmail_v1'

class GmailOauthService
  OOB_URI = 'urn:ietf:wg:oauth:2.0:oob'.freeze
  APPLICATION_NAME = 'Sistema Biblioteca'.freeze
  CREDENTIALS_PATH = 'config/credentials.json'.freeze
  SCOPE = Google::Apis::GmailV1::AUTH_GMAIL_SEND

  attr_reader :user_email

  def initialize(user_email)
    @user_email = user_email
  end

  # Gera URL para o usuário autorizar a aplicação
  def authorization_url
    client_id = Google::Auth::ClientId.from_file(CREDENTIALS_PATH)
    token_store = Google::Auth::Stores::FileTokenStore.new(file: 'token.yaml')
    authorizer = Google::Auth::UserAuthorizer.new(client_id, SCOPE, token_store)

    authorizer.get_authorization_url(base_url: OOB_URI)
  end

  # Troca o código de autorização pelo token e refresh token
  def fetch_credentials(code)
    client_id = Google::Auth::ClientId.from_file(CREDENTIALS_PATH)
    token_store = Google::Auth::Stores::FileTokenStore.new(file: 'token.yaml')
    authorizer = Google::Auth::UserAuthorizer.new(client_id, SCOPE, token_store)

    credentials = authorizer.get_and_store_credentials_from_code(
      user_id: user_email,
      code: code,
      base_url: OOB_URI
    )

    credentials
  end
end
