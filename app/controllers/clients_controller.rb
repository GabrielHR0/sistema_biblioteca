class ClientsController < ApplicationController
  before_action :authorize_request
  before_action :require_staff, only: %i[new create edit update destroy]
  before_action :set_client, only: %i[show update destroy loans]

  # GET /clients
  def index
    if params[:search].present?
      query = params[:search].strip
      @clients = Client.where(
          "\"fullName\" ILIKE :q OR cpf ILIKE :q OR email ILIKE :q",
          q: "%#{query}%"
      )
    else
      @clients = Client.all
    end

    render json: @clients
  end


  # GET /clients/:id
  def show
    render json: @client
  end

  #GET /clients/:id/loans
  def loans
    loans = @client.loans.includes(copy: :book)

    render json: loans.as_json(
      include: {
        copy: {
          include: {
            book: {
              only: [:id, :title, :author, :description]
            }
          },
          only: [:id, :edition, :status, :number, :book_id]
        }
      },
      except: [:created_at, :updated_at]
    )
  end

  # POST /clients
  def create
    @client = Client.new(client_params)
    if @client.save
      render json: { message: "Cliente criado com sucesso.", client: @client }, status: :created
    else
      render json: { errors: @client.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /clients/:id
  def update
    if @client.update(client_params)
      render json: { message: "Cliente atualizado com sucesso.", client: @client }
    else
      render json: { errors: @client.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /clients/:id
  def destroy
    @client.destroy
    render json: { message: "Cliente removido com sucesso." }
  end

  private

  def set_client
    @client = Client.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Cliente não encontrado." }, status: :not_found
    return
  end

  def client_params
    params.permit(:fullName, :cpf, :phone, :email)
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
