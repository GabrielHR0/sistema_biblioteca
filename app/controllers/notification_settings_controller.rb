class NotificationSettingsController < ApplicationController
  before_action :authorize_request
  before_action :require_admin, only: [:create, :update]
  before_action :require_staff, only: [:show]
  before_action :set_library
  before_action :set_notification_setting, only: [:show, :edit, :update]

  def show
    render json: @notification_setting
  end

  def new
    @notification_setting = @library.build_notification_setting
  end

  def create
    @notification_setting = @library.build_notification_setting(notification_setting_params)
    if @notification_setting.save
      render json: @notification_setting, status: :created
    else
      render json: { error: @notification_setting.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def edit; end

  def update
    if @notification_setting.update(notification_setting_params)
      render json: @notification_setting
    else
      render json: { error: @notification_setting.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  private

  def set_library
    @library = Library.find(params[:library_id])
  end

  def set_notification_setting
    @notification_setting = @library.notification_setting
  end

  def notification_setting_params
    params.require(:notification_setting).permit(:notify_email, :notify_sms, :return_reminder_days)
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
