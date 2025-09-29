class LibrariesController < ApplicationController
  before_action :authorize_request
  before_action :require_admin, only: [:create, :update, :destroy]
  before_action :set_library, only: [:show, :edit, :update, :destroy]

  def index
    @libraries = Library.all
    render json: @libraries
  end

  def show
    render json: @library
  end

  def new
    @library = Library.new
  end

  def create
    @library = Library.new(library_params)
    if @library.save
      render json: @library, status: :created
    else
      render json: { error: @library.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @library.update(library_params)
      render json: @library
    else
      render json: { error: @library.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def destroy
    @library.destroy
    head :no_content
  end

  private

  def set_library
    @library = Library.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Biblioteca não encontrada" }, status: :not_found
  end

  def library_params
    params.permit(:name, :phone, :address, :logo_url)
  end

  # Reaproveitando os métodos do UsersController
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
end
