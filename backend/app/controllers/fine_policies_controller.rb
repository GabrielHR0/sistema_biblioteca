# app/controllers/fine_policies_controller.rb
class FinePoliciesController < ApplicationController
  before_action :authorize_request
  before_action :require_admin, only: [:create, :update, :destroy]
  before_action :require_staff, only: [:show]
  before_action :set_library
  before_action :set_fine_policy, only: [:show, :update, :destroy]

  def show
    if @fine_policy
      render json: @fine_policy
    else
      render json: { error: 'Política de multa não encontrada' }, status: :not_found
    end
  end

  def create
    @fine_policy = @library.build_fine_policy(fine_policy_params)
    if @fine_policy.save
      render json: @fine_policy, status: :created
    else
      render json: { error: @fine_policy.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def update
    if @fine_policy.update(fine_policy_params)
      render json: @fine_policy
    else
      render json: { error: @fine_policy.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def destroy
    @fine_policy.destroy
    render json: { message: 'Política de multa removida com sucesso' }
  end

  private

  def set_library
    @library = Library.find(params[:library_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Biblioteca não encontrada' }, status: :not_found
  end

  def set_fine_policy
    @fine_policy = @library.fine_policy
  end

  def fine_policy_params
    params.require(:fine_policy).permit(:daily_fine, :max_fine)
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
