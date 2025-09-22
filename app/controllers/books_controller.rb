class BooksController < ApplicationController
  before_action :authorize_request
  before_action :require_staff, only: %i[new create edit update destroy]
  before_action :set_book, only: %i[show update destroy]

  def index
    if params[:search].present?
      search_term = "%#{params[:search]}%"
      @books = Book.includes(:categories, :copies)
                   .where("title ILIKE ? OR author ILIKE ?", search_term, search_term)
    else
      @books = Book.includes(:categories, :copies).all
    end

    render json: @books.map do |book|
      book.as_json(
        methods: [:total_copies],
        include: {
          categories: { only: [:id, :name] },
          copies: { only: [:id, :edition, :status, :number] } # inclui cópias no resultado
        }
      )
    end
  end

  def show
    render json: @book.as_json(
      methods: [:total_copies],
      include: {
        categories: { only: [:id, :name] },
        copies: { only: [:id, :edition, :status, :number] }
      }
    )
  end

  def new
    @book = Book.new(book_params)
  end

  def create
    @book = Book.new(book_params)
    if @book.save
      assign_categories(@book)
      render json: { message: "Livro cadastrado com sucesso.", book: @book }, status: :created
    else
      render json: { errors: @book.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def update
    book_attrs = book_params.to_h.compact
    category_ids = params[:category_ids] || (params[:book] && params[:book][:category_ids])

    if book_attrs.blank? && category_ids.blank?
      render json: { message: "Nenhuma alteração recebida" }, status: :no_content
      return
    end

    if @book.update(book_params)
      assign_categories(@book) if category_ids.present?
      render json: { message: "Livro atualizado com sucesso.", book: @book }
    else
      render json: { errors: @book.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @book.destroy
    render json: { message: "Livro removido com sucesso." }
  end

  private

  def set_book
    @book = Book.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Livro não encontrado." }, status: :not_found
  end

  def book_params
    params.require(:book).permit(:title, :author, :published_at, category_ids: [])
  end

  def require_staff
    unless @current_user&.has_access?(:Administrator) || @current_user&.has_access?(:Librarian)
      render json: { error: "Aceso negado: precisa ser funcionpario" }, status: :forbidden
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

  def assign_categories(book)
    return unless params[:categories_ids].present? || (params[:book] && params[:book][:categories_ids].present?)

    new_categories_ids = params[:categories_ids] || params[:book][:categories_ids]
    new_categories_ids = Array(new_categories_ids).map(&:to_i).reject(&:blank?)
    current_categories_ids = book.categories.pluck(:id)

    to_add = new_categories_ids - current_categories_ids
    to_add.each do |category_id|
      BookCategory.create(book_id: book.id, category_id: category_id)
    end

    to_remove = current_categories_ids - new_categories_ids
    BookCategory.where(book_id: book.id, category_id: to_remove).destroy_all
  end
end
