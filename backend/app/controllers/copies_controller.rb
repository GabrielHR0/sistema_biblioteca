class CopiesController < ApplicationController
  before_action :authorize_request
  before_action :require_staff, only: %i[new create update destroy]
  before_action :set_copy, only: %i[show update destroy]

def index
  @copies = Copy.includes(:loans).all

  render json: @copies.as_json(
    include: {
      loans: {
        only: [:id, :client_id, :user_id, :loan_date, :due_date, :status, :renewals_count]
      }
    }
  )
end

  def show
    render json: @copy.as_json(
    include: {
      loans: {
        only: [:id, :client_id, :user_id, :loan_date, :due_date, :status, :renewals_count]
      }
    }
  )
  end

  def new
    @copy = Copy.new(copy_params)
  end

  def create
    @copy = Copy.new(copy_params)
    if @copy.save
      render json: { message: "Cópia cadastrada com sucesso.", copy: @copy }, status: :created
    else
      render json: { errors: @copy.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def update
    copy_attrs = copy_params.to_h.compact

    if copy_attrs.blank?
      render json: { message: "Nenhuma alteração recebida" }, status: :no_content
      return
    end

    if @copy.update(copy_params)
      render json: { message: "Cópia atualizada com sucesso.", copy: @copy }
    else
      render json: { errors: @copy.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @copy.destroy
    render json: { message: "Cópia removida com sucesso." }
  end

  private

  def set_copy
    @copy = Copy.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Cópia não encontrada." }, status: :not_found
  end

  def copy_params
    params.require(:copy).permit(:book_id, :edition, :status, :number, :acquisition_date, :condition)
  end

  def require_staff
    unless @current_user&.has_access?(:Administrator) || @current_user&.has_access?(:Librarian)
      render json: { error: "Acesso negado: precisa ser funcionário" }, status: :forbidden
    end
  end

  def authorize_request
    header = request.headers['Authorization']
    token = header.split(' ').last if header

    begin 
      decoded = JsonWebToken.decode(token)
      @current_user = User.find(decoded[:user_id]) if decoded
    rescue ActiveRecord::RecordNotFound, JWT::DecodeError
      render json: { errors: "Token inválido ou expirado" }, status: :unauthorized
    end
  end
end