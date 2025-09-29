# app/controllers/oauth_controller.rb
class OauthController < ApplicationController
  skip_before_action :authorize_request

  def callback
    code = params[:code]
    raw_state = params[:state]
    unless code.present?
      return render json: { error: 'Código de autorização não fornecido' }, status: :bad_request
    end

    state = JSON.parse(raw_state || '{}') rescue {}
    library = Library.find_by(id: state['library_id'])
    return render json: { error: 'Biblioteca não encontrada' }, status: :not_found unless library&.email_account

    email_account = library.email_account

    service = GmailOauthService.new(email_account)
    creds = service.fetch_and_store_credentials(code)

    email_account.update!(
      gmail_oauth_token: creds[:access_token],
      gmail_refresh_token: creds[:refresh_token].presence || email_account.gmail_refresh_token,
      token_expires_at: Time.at(creds[:expires_at]),
      authorized_at: Time.current,
      authorization_status: 'authorized'
    )

    render json: {
      message: 'Conta autorizada com sucesso!',
      email: email_account.gmail_user_email,
      authorized_at: email_account.authorized_at
    }
  rescue => e
    email_account&.update(authorization_status: 'failed') if defined?(email_account) && email_account
    Rails.logger.error "OAuth callback error: #{e.message}"
    render json: { error: "Erro ao autorizar conta: #{e.message}" }, status: :internal_server_error
  end
end
