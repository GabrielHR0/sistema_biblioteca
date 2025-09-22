class LoansController < ApplicationController
  before_action :authorize_request
  before_action :require_staff, only: %i[index create update destroy]
  before_action :set_loan, only: %i[show update destroy]

  # GET /loans
  def index
    @loans = Loan.includes(:client, :copy).all
    render json: @loans.as_json(
      include: {
        client: { only: [:id, :fullName, :cpf] },
        copy: { only: [:id, :number, :status] }
      },
      methods: [:overdue?]
    )
  end

  # GET /loans/:id
  def show
    render json: @loan.as_json(
      include: {
        client: { only: [:id, :fullName, :cpf] },
        copy: { only: [:id, :number, :status] },
        user: { only: [:id, :name] }
      },
      methods: [:overdue?]
    )
  end

  # POST /loans
  def create
    copy = Copy.find(params[:copy_id])

    if copy.status != "available"
      return render json: { error: "Este exemplar não está disponível para empréstimo." }, status: :unprocessable_entity
    end

    @loan = Loan.new(
      client_id: params[:client_id],
      copy_id: copy.id,
      loan_date: Date.today,
      due_date: Date.today + 15.days,
      status: "ongoing"
    )

    if @loan.save
      copy.update(status: "borrowed")
      render json: { message: "Empréstimo criado com sucesso.", loan: @loan }, status: :created
    else
      render json: { errors: @loan.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /loans/:id
  def update
    if params[:status] == "returned"
      @loan.status = "returned"
      @loan.user_id = @current_user.id
      @loan.copy.update(status: "available")
    end

    if @loan.update(loan_params)
      render json: { message: "Empréstimo atualizado com sucesso.", loan: @loan }
    else
      render json: { errors: @loan.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /loans/:id
  def destroy
    @loan.copy.update(status: "available") if @loan.status == "ongoing"
    @loan.destroy
    render json: { message: "Empréstimo removido com sucesso." }
  end

  private

  def set_loan
    @loan = Loan.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Empréstimo não encontrado." }, status: :not_found
  end

  def loan_params
    params.permit(:status, :due_date)
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
      render json: { errors: 'Token inválido ou expirado' }, status: :unauthorized
    end
  end
end
