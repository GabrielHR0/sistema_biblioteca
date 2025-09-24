class LoanPoliciesController < ApplicationController
  before_action :authorize_request
  before_action :require_admin, only: [:create, :update]
  before_action :require_staff, only: [:show]
  before_action :set_library
  before_action :set_loan_policy, only: [:show, :edit, :update]

  def show
    render json: @loan_policy
  end

  def new
    @loan_policy = @library.build_loan_policy
  end

  def create
    @loan_policy = @library.build_loan_policy(loan_policy_params)
    if @loan_policy.save
      render json: @loan_policy, status: :created
    else
      render json: { error: @loan_policy.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def edit; end

  def update
    if @loan_policy.update(loan_policy_params)
      render json: @loan_policy
    else
      render json: { error: @loan_policy.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  private

  def set_library
    @library = Library.find(params[:library_id])
  end

  def set_loan_policy
    @loan_policy = @library.loan_policy
  end

  def loan_policy_params
    params.require(:loan_policy).permit(:loan_limit, :loan_period_days, :renewals_allowed)
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
