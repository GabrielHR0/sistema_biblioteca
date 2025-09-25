
class EmailAccountsController < ApplicationController
  before_action :authorize_request
  before_action :require_admin, only: [:create, :update]
  before_action :require_staff, only: [:show]
  before_action :set_library
  before_action :set_email_account, only: [:show, :edit, :update]

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

  def authorize_google
  Rails.logger.info "=== AUTHORIZE_GOOGLE INICIADO ==="
  Rails.logger.info "Library ID: #{@library.id}"
  Rails.logger.info "Email Account: #{@library.email_account.inspect}"

  unless @library.email_account
    error_msg = 'Conta de email não configurada.'
    Rails.logger.error error_msg
    return render json: { error: error_msg }, status: :unprocessable_entity
  end

  unless @library.email_account.gmail_user_email.present?
    error_msg = 'Email do Gmail não configurado.'
    Rails.logger.error error_msg
    return render json: { error: error_msg }, status: :unprocessable_entity
  end

  begin
    # Use a versão simples que recebe library_id diretamente
    service = GmailOauthService.new(@library.email_account.gmail_user_email, @library.id)
    url = service.authorization_url
    
    Rails.logger.info "✅ URL de autorização gerada com sucesso"
    Rails.logger.info "URL: #{url}"
    
    render json: { url: url }
    
  rescue => e
    error_msg = "Erro ao gerar URL: #{e.message}"
    Rails.logger.error "❌ ERRO NO AUTHORIZE_GOOGLE: #{error_msg}"
    Rails.logger.error e.backtrace.join("\n")
    render json: { error: error_msg }, status: :internal_server_error
  end
end

def callback
  code = params[:code]
  state = params[:state]
  
  Rails.logger.info "=== CALLBACK RECEBIDO ==="
  Rails.logger.info "Params: #{params.inspect}"
  Rails.logger.info "Library: #{@library.inspect}"

  unless @library.email_account
    return render json: { error: 'Conta de email não configurada' }, status: :unprocessable_entity
  end

  begin
    # Use o método de classe para buscar credenciais
    credentials = GmailOauthService.fetch_credentials(code, @library.id)
    
    Rails.logger.info "✅ Credenciais obtidas com sucesso"
    Rails.logger.info "Access Token: #{credentials['access_token'] ? 'PRESENTE' : 'AUSENTE'}"
    Rails.logger.info "Refresh Token: #{credentials['refresh_token'] ? 'PRESENTE' : 'AUSENTE'}"

    if @library.email_account.update(
      gmail_oauth_token: credentials['access_token'],
      gmail_refresh_token: credentials['refresh_token'],
      gmail_token_expires_at: Time.current + credentials['expires_in'].seconds
    )
      render json: { message: 'Conta autorizada com sucesso!' }
    else
      render json: { error: @library.email_account.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  rescue => e
    Rails.logger.error "❌ ERRO NO CALLBACK: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    render json: { error: "Erro ao autorizar conta: #{e.message}" }, status: :internal_server_error
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
  end

  def email_account_params
    params.require(:email_account).permit(:gmail_user_email, :gmail_oauth_token, :gmail_refresh_token)
  end

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
