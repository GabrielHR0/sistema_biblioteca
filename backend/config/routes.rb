# config/routes.rb
Rails.application.routes.draw do
  # Rotas de autenticação
  resources :users
  post '/auth/login', to: 'auth#login'
  post 'users/verify_password', to: 'users#verify_password'
  post '/password/forgot', to: 'passwords#forgot'
  patch '/password/reset', to: 'passwords#reset'

  # Rotas do Dashboard
  get '/dashboard', to: 'dashboard#index'
  get '/dashboard/loans_month', to: 'dashboard#loans_by_month'
  get '/dashboard/books_category', to: 'dashboard#books_by_category'
  get '/dashboard/active_loans_per_client', to: 'dashboard#active_loans_per_client'
  get '/dashboard/available_books', to: 'dashboard#available_books'
  get '/dashboard/recent_activities', to: 'dashboard#recent_activities'
  get '/dashboard/active_loans_detail', to: 'dashboard#active_loans_detail'
  get '/dashboard/books_registered', to: 'dashboard#books_registered'
  get '/dashboard/books_registered_by_month', to: 'dashboard#books_registered_by_month'
  get '/dashboard/top_clients', to: 'dashboard#top_clients'
  get '/dashboard/top_clients_loans', to: 'dashboard#top_clients_loans'

  # Rotas de alertas do dashboard
  get '/dashboard/today_alerts', to: 'dashboard#today_alerts'
  get '/dashboard/overdue_loans', to: 'dashboard#overdue_loans'
  get '/dashboard/overdue_loans_detail', to: 'dashboard#overdue_loans_detail'
  get '/dashboard/today_due_loans', to: 'dashboard#today_due_loans'
  get '/dashboard/today_due_loans_detail', to: 'dashboard#today_due_loans_detail'

  # Rotas de empréstimos
  resources :loans do
    member do
      post 'renew'
      post 'return'
      patch 'return'
    end
    collection do
      get 'active_by_copy'
    end
  end

  # Rotas de categorias e cargos
  resources :categories
  resources :roles

  # Callback OAuth (estático)
  get '/auth/google/callback', to: 'oauth#callback'

  # Rotas de configurações da biblioteca
  resources :libraries do
    resource :email_account do
      get :authorize_google, on: :member
      # remove a linha antiga: post :oauth_callback, on: :member
      get :authorization_status, on: :member
      post :refresh_token, on: :member
      delete :revoke_authorization, on: :member
      post :test_email, on: :member
    end

    resource :notification_setting
    resource :fine_policy
    resource :loan_policy
  end

  # Rotas de livros e cópias
  resources :books
  resources :copies
  get '/books/:id/copies', to: 'books#copies'

  # Rotas de clientes
  resources :clients
  get 'clients/:id/loans', to: 'clients#loans'
  post 'clients/login', to: 'clients_auth#login'
  post 'clients/check_password', to: 'clients_auth#check_password'
end
