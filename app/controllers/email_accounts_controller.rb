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

  private

  def set_library
    @library = Library.find(params[:library_id])
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
