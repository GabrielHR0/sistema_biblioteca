# app/controllers/email_accounts_controller.rb
# encoding: utf-8

class EmailAccountsController < ApplicationController
  before_action :authorize_request
  before_action :require_admin, only: [:create, :update, :destroy]
  before_action :require_staff, only: [:show]
  before_action :set_library
  before_action :set_email_account, only: [:show, :edit, :update, :destroy, :revoke_authorization, :authorization_status, :refresh_token, :test_email]

  def show
    render json: @email_account
  end

  def new
    @email_account = @library.build_email_account
  end

  def create
    @email_account = @library.build_email_account(email_account_params)
    if @email_account.save
      render json: @email_account, status: :created
    else
      render json: { error: @email_account.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def edit; end

  def update
    if @email_account.update(email_account_params)
      render json: @email_account
    else
      render json: { error: @email_account.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def destroy
    @email_account.destroy
    render json: { message: 'Conta de email removida com sucesso' }
  end

  # Gerar URL de autorização OAuth 2.0
  def authorize_google
    unless @library.email_account
      return render json: { error: 'Conta de email não configurada.' }, status: :unprocessable_entity
    end

    begin
      service = GmailOauthService.new(@library.email_account)
      authorization_url = service.authorization_url
      render json: {
        authorization_url: authorization_url,
        message: 'Acesse a URL para autorizar a aplicação'
      }
    rescue => e
      Rails.logger.error "Erro ao gerar URL de autorização: #{e.message}"
      render json: { error: "Erro ao gerar URL: #{e.message}" }, status: :internal_server_error
    end
  end

  # Verificar status da autorização
  def authorization_status
    unless @email_account
      return render json: {
        status: 'not_configured',
        message: 'Conta de email não configurada'
      }
    end

    begin
      service = GmailOauthService.new(@email_account)
      is_valid = service.valid_credentials?

      status = if is_valid
        'authorized'
      elsif @email_account.gmail_refresh_token.present?
        'expired_but_renewable'
      else
        'not_authorized'
      end

      render json: {
        status: status,
        email: @email_account.gmail_user_email,
        authorized_at: @email_account.authorized_at,
        expires_at: @email_account.token_expires_at,
        needs_reauthorization: !is_valid
      }
    rescue => e
      Rails.logger.error "Erro ao verificar status: #{e.message}"
      render json: {
        status: 'error',
        message: "Erro ao verificar autorização: #{e.message}"
      }, status: :internal_server_error
    end
  end

  # Renovar token de acesso
  def refresh_token
    unless @email_account&.gmail_refresh_token.present?
      return render json: {
        error: 'Token de renovação não disponível. Reautorização necessária.'
      }, status: :unprocessable_entity
    end

    begin
      service = GmailOauthService.new(@email_account)
      new_credentials = service.refresh_access_token

      @email_account.update!(
        gmail_oauth_token: new_credentials[:access_token],
        token_expires_at: Time.at(new_credentials[:expires_at]),
        authorization_status: 'authorized'
      )

      render json: {
        message: 'Token renovado com sucesso!',
        expires_at: @email_account.token_expires_at
      }
    rescue => e
      Rails.logger.error "Erro ao renovar token: #{e.message}"
      @email_account.update(authorization_status: 'expired') if @email_account

      render json: {
        error: "Erro ao renovar token: #{e.message}. Reautorização necessária."
      }, status: :internal_server_error
    end
  end

  # Revogar autorização
  def revoke_authorization
    begin
      service = GmailOauthService.new(@email_account)
      service.revoke_authorization

      @email_account.update!(
        gmail_oauth_token: nil,
        gmail_refresh_token: nil,
        token_expires_at: nil,
        authorization_status: 'revoked'
      )

      render json: { message: 'Autorização revogada com sucesso!' }
    rescue => e
      Rails.logger.error "Erro ao revogar autorização: #{e.message}"
      render json: {
        error: "Erro ao revogar autorização: #{e.message}"
      }, status: :internal_server_error
    end
  end

  # Testar envio de email
  def test_email
    to_email = params[:to_email]
    subject = params[:subject] || "Email de teste - #{Time.current.strftime('%d/%m/%Y %H:%M')}"
    body = params[:body] || "Este é um email de teste enviado via Gmail API."

    unless to_email.present?
      return render json: { error: 'Email de destino é obrigatório' }, status: :bad_request
    end

    unless @email_account&.authorization_valid?
      return render json: {
        error: 'Conta não autorizada. Autorize primeiro com o Google.'
      }, status: :unprocessable_entity
    end

    begin
      service = GmailEmailService.new(@email_account)
      result = service.send_email(
        to: to_email,
        subject: subject,
        body: body
      )

      render json: {
        message: 'Email enviado com sucesso!',
        message_id: result.id,
        to: to_email,
        subject: subject
      }
    rescue => e
      Rails.logger.error "Erro ao enviar email de teste: #{e.message}"
      render json: {
        error: "Erro ao enviar email: #{e.message}"
      }, status: :internal_server_error
    end
  end

  private

  def set_library
    @library = Library.find(params[:library_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Biblioteca não encontrada' }, status: :not_found
  end

  def set_email_account
    @email_account = @library.email_account
    unless @email_account
      render json: { error: 'Conta de email não encontrada' }, status: :not_found
    end
  end

  def email_account_params
    params.require(:email_account).permit(
      :gmail_user_email,
      :gmail_oauth_token,
      :gmail_refresh_token,
      :token_expires_at,
      :authorization_status
    )
  end

  # JWT auth simplificado de exemplo
  def authorize_request
    header = request.headers['Authorization']
    token = header.split(' ').last if header
    begin
      decoded = JsonWebToken.decode(token)
      @current_user = User.find(decoded[:user_id]) if decoded
    rescue ActiveRecord::RecordNotFound, JWT::DecodeError
      render json: { errors: 'Token inválido ou expirado' }, status: :unauthorized
    end
  end

  def require_admin
    unless @current_user&.has_access?(:Administrator)
      render json: { error: "Acesso negado: precisa ser administrador" }, status: :forbidden
    end
  end

  def require_staff
    unless @current_user&.has_access?(:Administrator) || @current_user&.has_access?(:Librarian)
      render json: { error: "Acesso negado: precisa ser funcionário" }, status: :forbidden
    end
  end
end
