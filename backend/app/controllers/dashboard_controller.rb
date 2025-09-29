class DashboardController < ApplicationController
  before_action :authorize_request

  # GET /dashboard
  def index
    available_copies_count = Copy.where(status: 'available').count
    borrowed_copies_count = Copy.where(status: 'borrowed').count
    lost_copies_count = Copy.where(status: 'lost').count

    active_books_count = Book.joins(:copies)
                             .where(copies: { status: ['available', 'borrowed'] })
                             .distinct
                             .count

    render json: {
      total_books: active_books_count,
      total_clients: Client.count,
      total_loans: Loan.count,
      total_categories: Category.count,
      total_copies: available_copies_count + borrowed_copies_count, # exclui perdidas
      active_loans: Loan.where(status: "ongoing").count,
      returned_loans: Loan.where(status: "returned").count,
      overdue_loans: Loan.where(status: "overdue").count,
      available_copies: available_copies_count,
      borrowed_copies: borrowed_copies_count,
      lost_copies: lost_copies_count
    }
  end

  # GET /dashboard/loans_by_month
  def loans_by_month
    loans = Loan.group_by_month(:created_at, format: "%Y-%m").count
    render json: loans
  end

  # GET /dashboard/books_by_category
  def books_by_category
    data = Category.left_joins(books: :copies)
                   .where('copies.status IN (?) OR copies.id IS NULL', ['available', 'borrowed'])
                   .group("categories.id", "categories.name")
                   .select("categories.name, COUNT(DISTINCT books.id) AS books_count")
    render json: data.map { |c| { category: c.name, books_count: c.books_count } }
  end

  # GET /dashboard/active_loans_per_client
  def active_loans_per_client
    data = Client.joins(loans: :copy)
                 .where(loans: { status: 'active' })
                 .where(copies: { status: ['available', 'borrowed'] })
                 .group("clients.id", "clients.\"fullName\"")
                 .select("clients.\"fullName\", COUNT(loans.id) AS active_loans")
    render json: data.map { |c| { client: c.fullName, active_loans: c.active_loans } }
  end

  # GET /dashboard/available_by_book
  def active_loans_per_client
    data = Client.joins(loans: :copy)
                .where(loans: { status: 'ongoing' })  # usa status correto
                .where(copies: { status: ['available', 'borrowed'] })
                .group("clients.id", "clients.\"fullName\"")
                .select("clients.\"fullName\", COUNT(loans.id) AS active_loans")
    render json: data.map { |c| { client: c.fullName, active_loans: c.active_loans } }
  end


  # GET /dashboard/recent_activities
  def recent_activities
    activities = []

    recent_loans = Loan.includes(copy: :book, client: [])
                       .where(copies: { status: ['available', 'borrowed'] })
                       .order(created_at: :desc)
                       .limit(5)

    recent_loans.each do |loan|
      book_title = loan.copy&.book&.title || "Livro desconhecido"
      client_name = loan.client&.fullName || "Cliente desconhecido"

      activities << {
        id: loan.id,
        client_name: client_name,
        book_title: book_title,
        time: loan.created_at.strftime("%H:%M")
      }
    end

    recent_returns = Loan.includes(copy: :book, client: [])
                         .where.not(return_date: nil)
                         .where(copies: { status: ['available', 'borrowed'] })
                         .order(return_date: :desc)
                         .limit(5)

    recent_returns.each do |loan|
      book_title = loan.copy&.book&.title || "Livro desconhecido"
      client_name = loan.client&.fullName || "Cliente desconhecido"

      activities << {
        id: -loan.id,
        client_name: client_name,
        book_title: book_title,
        time: loan.return_date.strftime("%H:%M")
      }
    end

    activities = activities.sort_by { |a| a[:time] }.reverse.first(5)

    render json: activities
  end

  # GET /dashboard/today_alerts
  def today_alerts
    alerts = []

    loans_due_today = Loan.joins(:copy)
                          .where(due_date: Date.today.all_day, status: 'ongoing')
                          .where(copies: { status: ['available', 'borrowed'] })
                          .count

    if loans_due_today > 0
      alerts << {
        id: 1,
        message: "#{loans_due_today} empréstimo(s) vence(m) hoje",
        icon: "bi-calendar-x"
      }
    end

    overdue_loans = Loan.joins(:copy)
                        .where("due_date < ?", Date.today)
                        .where(status: 'ongoing')
                        .where(copies: { status: ['available', 'borrowed'] })
                        .count

    if overdue_loans > 0
      alerts << {
        id: 2,
        message: "#{overdue_loans} empréstimo(s) estão em atraso",
        icon: "bi-exclamation-triangle"
      }
    end

    loans_due_tomorrow = Loan.joins(:copy)
                             .where(due_date: Date.tomorrow.all_day, status: 'ongoing')
                             .where(copies: { status: ['available', 'borrowed'] })
                             .count

    if loans_due_tomorrow > 0
      alerts << {
        id: 3,
        message: "#{loans_due_tomorrow} empréstimo(s) vence(m) amanhã",
        icon: "bi-calendar-check"
      }
    end

    low_stock_books = Book.joins(:copies)
                          .where(copies: { status: 'available' })
                          .group('books.id, books.title')
                          .having('COUNT(copies.id) < 2')
                          .count

    if low_stock_books.any?
      alerts << {
        id: 4,
        message: "#{low_stock_books.size} livro(s) com poucas cópias disponíveis",
        icon: "bi-exclamation-circle"
      }
    end

    render json: alerts
  end

  # GET /dashboard/overdue_loans_detail
  def overdue_loans_detail
    overdue_loans = Loan.includes(:client, copy: :book)
                        .where("due_date < ?", Date.today)
                        .where(status: 'ongoing')
                        .where(copies: { status: ['available', 'borrowed'] })
                        .order(due_date: :asc)
                        .limit(10)

    result = overdue_loans.map do |loan|
      {
        id: loan.id,
        client_name: loan.client&.fullName || "Cliente desconhecido",
        book_title: loan.copy&.book&.title || "Livro desconhecido",
        due_date: loan.due_date,
        days_overdue: (Date.today - loan.due_date).to_i
      }
    end

    render json: result
  end

  # GET /dashboard/today_due_loans_detail
  def today_due_loans_detail
    today_due_loans = Loan.includes(:client, copy: :book)
                         .where(due_date: Date.today.all_day)
                         .where(status: 'ongoing')
                         .where(copies: { status: ['available', 'borrowed'] })
                         .order(created_at: :asc)

    result = today_due_loans.map do |loan|
      {
        id: loan.id,
        client_name: loan.client&.fullName || "Cliente desconhecido",
        book_title: loan.copy&.book&.title || "Livro desconhecido",
        due_date: loan.due_date
      }
    end

    render json: result
  end

  # GET /dashboard/active_loans_detail
  def active_loans_detail
    loans = Loan.includes(:client, copy: :book)
                .where(status: 'ongoing')
                .where(copies: { status: ['available', 'borrowed'] })
                .order(due_date: :asc)
                .limit(10)

    render json: loans.map do |loan|
      {
        id: loan.id,
        client_name: loan.client&.fullName || "Cliente desconhecido",
        book_title: loan.copy&.book&.title || "Livro desconhecido",
        due_date: loan.due_date,
        days_until_due: (loan.due_date - Date.today).to_i
      }
    end
  end

  # GET /dashboard/books_registered_by_month
  def books_registered_by_month
    books = Book.group_by_month(:created_at, format: "%Y-%m").count
    render json: books
  end

  # GET /dashboard/top_clients_active_loans
  def top_clients_active_loans
    data = Client.joins(loans: :copy)
                 .where(loans: { status: 'ongoing' })
                 .where(copies: { status: ['available', 'borrowed'] })
                 .group("clients.id", "clients.\"fullName\"")
                 .order('COUNT(loans.id) DESC')
                 .limit(10)
                 .select("clients.\"fullName\", COUNT(loans.id) AS active_loans_count")

    render json: data.map { |c| { client: c.fullName, active_loans: c.active_loans_count } }
  end
end
