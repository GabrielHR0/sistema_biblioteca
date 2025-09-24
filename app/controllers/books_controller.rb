class BooksController < ApplicationController
  before_action :authorize_request
  before_action :require_staff, only: %i[new create edit update destroy]
  before_action :set_book, only: %i[show update destroy copies]

  def index
    if params[:search].present?
      search_term = "%#{params[:search]}%"
      @books = Book.includes(:categories, :copies)
                  .where("title ILIKE ? OR author ILIKE ?", search_term, search_term)
                  .references(:categories, :copies)
    else
      @books = Book.includes(:categories, :copies).all
    end

    render json: @books.as_json(
      methods: [:total_copies, :available_copies],
      include: {
        categories: { only: [:id, :name] },
        copies: { only: [:id, :edition, :status, :number] }
      }
    )
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


  # NOVO ENDPOINT: GET /books/:id/copies
  def copies
    copies = @book.copies

    render json: copies.as_json(
      only: [:id, :edition, :status, :number],
      methods: [:book_id]
    )
  end

  def create
    book_attrs = {
      title: params[:title],
      author: params[:author],
      description: params[:description]
    }.compact

    @book = Book.new(book_attrs)
    
    if @book.save
      assign_categories(@book) if params[:category_ids].present?
      create_copies(@book) if params[:copies].present?
      
      render json: { 
        message: "Livro cadastrado com sucesso.", 
        book: @book.as_json(
          methods: [:total_copies],
          include: {
            categories: { only: [:id, :name] },
            copies: { only: [:id, :edition, :status, :number] }
          }
        )
      }, status: :created
    else
      render json: { errors: @book.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def update
    book_attrs = {
      title: params[:title],
      author: params[:author],
      description: params[:description]
    }.compact

    if book_attrs.blank? && params[:category_ids].blank?
      render json: { message: "Nenhuma alteração recebida" }, status: :no_content
      return
    end

    if @book.update(book_attrs)
      assign_categories(@book) if params[:category_ids].present?
      render json: { 
        message: "Livro atualizado com sucesso.", 
        book: @book.as_json(
          methods: [:total_copies],
          include: {
            categories: { only: [:id, :name] },
            copies: { only: [:id, :edition, :status, :number] }
          }
        )
      }
    else
      render json: { errors: @book.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @book.destroy
    render json: { message: "Livro removido com sucesso." }, status: :ok
  end

  private

  def set_book
    @book = Book.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Livro não encontrado." }, status: :not_found
  end

  def book_params
    params.permit(:title, :author, :description, category_ids: [], copies: [:edition, :status, :number])
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

  def assign_categories(book)
    return unless params[:category_ids].present?

    new_category_ids = Array(params[:category_ids]).map(&:to_i).reject(&:zero?)
    book.category_ids = new_category_ids
  end

  def create_copies(book)
    return unless params[:copies].present?

    Array(params[:copies]).each do |copy_params|
      copy_attrs = copy_params.permit(:edition, :status, :number).merge(book_id: book.id)
      Copy.create(copy_attrs)
    end
  end
end
