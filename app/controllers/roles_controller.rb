class RolesController < ApplicationController
  before_action :authorize_request
  before_action :set_role, only: %i[show update destroy]

  # GET /roles
  def index
    roles = Role.all
    render json: roles
  end

  # GET /roles/:id
  def show
    render json: @role
  end

  # POST /roles
  def create
    require_admin!

    @role = Role.new(role_params)
    if @role.save
      render json: @role, status: :created
    else
      render json: @role.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /roles/:id
  def update
    require_admin!

    if @role.update(role_params)
      render json: @role
    else
      render json: @role.errors, status: :unprocessable_entity
    end
  end

  # DELETE /roles/:id
  def destroy
    require_admin!

    @role.destroy
    head :no_content
  end

  private

  def authorize_request
    header = request.headers['Authorization']
    token = header.split(' ').last if header

    begin
      decoded = JsonWebToken.decode(token)
      @current_user = User.find(decoded[:user_id]) if decoded
      puts "Usuario logado realizando requisição: #{@current_user.inspect}"
    rescue ActiveRecord::RecordNotFound, JWT::DecodeError
      render json: { errors: 'Token inválido ou expirado' }, status: :unauthorized
    end
  end

  def require_admin!
    unless @current_user&.has_access?(:Administrator)
      render json: { error: "Acesso negado: precisa ser administrador" }, status: :forbidden
    end
  end

  def set_role
    @role = Role.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Role não encontrada" }, status: :not_found
  end

  def role_params
    if params[:role].present?
      params.require(:role).permit(:name)
    else
      params.permit(:name)
    end
  end
end
