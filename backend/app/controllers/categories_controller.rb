class CategoriesController < ApplicationController
  before_action :authorize_request
  before_action :require_staff, only: %i[new create edit update destroy]
  before_action :set_category, only: %i[show update destroy]

  # GET /categories
  def index
    categories = Category.all.includes(:books)
    render json: categories.map { |cat| category_with_count(cat) }
  end

  # GET /categories/:id
  def show
    render json: category_with_count(@category)
  end

  # POST /categories
  def create
    @category = Category.new(category_params)

    if @category.save
      render json: category_with_count(@category), status: :created
      return
    end

    render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
  end

  # PATCH/PUT /categories/:id
  def update
    if @category.update(category_params)
      render json: category_with_count(@category)
      return
    end

    render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
  end

  # DELETE /categories/:id
  def destroy
    @category.destroy
    head :no_content
  end

  private

  def category_with_count(category)
    {
      id: category.id,
      name: category.name,
      book_count: category.books.count
    }
  end

  def authorize_request
    header = request.headers['Authorization']
    token = header.split(' ').last if header

    begin
      decoded = JsonWebToken.decode(token)
      @current_user = User.find(decoded[:user_id]) if decoded
      puts "Usuário logado realizando requisição: #{@current_user.inspect}"
    rescue ActiveRecord::RecordNotFound, JWT::DecodeError
      render json: { errors: 'Token inválido ou expirado' }, status: :unauthorized
      return
    end
  end

  def require_admin!
    unless @current_user&.has_access?(:Administrator)
      render json: { error: "Acesso negado: precisa ser administrador" }, status: :forbidden
      return
    end
  end

  def require_staff
    unless @current_user&.has_access?(:Administrator) || @current_user&.has_access?(:Librarian)
      render json: { error: "Acesso negado: precisa ser funcionário" }, status: :forbidden
      return
    end
  end

  def set_category
    @category = Category.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Categoria não encontrada" }, status: :not_found
    return
  end

  def category_params
    params.permit(:name)
  end
end
