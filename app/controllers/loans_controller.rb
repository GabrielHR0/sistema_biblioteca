class LoansController < ApplicationController
  before_action :authorize_request
  before_action :require_staff, only: %i[index create update destroy renew]
  before_action :set_loan, only: %i[show update destroy renew]
  before_action :set_library_policy, only: %i[create renew]

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
    copy = Copy.find(loan_params[:copy_id])
    client = Client.find(loan_params[:client_id])

    if copy.status != "available"
      return render json: { error: "Este exemplar não está disponível para empréstimo." }, status: :unprocessable_entity
    end

    # Verifica limite de empréstimos
    active_loans_count = client.loans.where(status: "ongoing").count
    if active_loans_count >= @loan_policy.loan_limit
      return render json: { error: "Cliente atingiu o limite de #{@loan_policy.loan_limit} empréstimos simultâneos." }, status: :unprocessable_entity
    end

    @loan = Loan.new(
      client_id: client.id,
      copy_id: copy.id,
      loan_date: Date.today,
      due_date: Date.today + @loan_policy.loan_period_days.days,
      status: "ongoing",
      renewals_count: 0
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

  # POST /loans/:id/renew
  def renew
    if @loan.status != "ongoing"
      return render json: { error: "Somente empréstimos ativos podem ser renovados." }, status: :unprocessable_entity
    end

    if @loan.renewals_count >= @loan_policy.renewals_allowed
      return render json: { error: "Limite de renovações atingido (#{@loan_policy.renewals_allowed})." }, status: :unprocessable_entity
    end

    @loan.due_date += @loan_policy.loan_period_days.days
    @loan.renewals_count += 1
    if @loan.save
      render json: { message: "Empréstimo renovado com sucesso.", loan: @loan }
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
    params.require(:loan).permit(:copy_id, :client_id)
  end

  def set_library_policy
    library = Library.first # ou pegue a biblioteca correta se tiver multi-biblioteca
    @loan_policy = library.loan_policy
    unless @loan_policy
      render json: { error: "Política de empréstimo não configurada." }, status: :unprocessable_entity
    end
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
