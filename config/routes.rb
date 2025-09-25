Rails.application.routes.draw do
  #auth routes
  resources :users
  post '/auth/login', to: 'auth#login'
  post 'users/verify_password', to: 'users#verify_password'
  post '/password/forgot', to: 'passwords#forgot'
  patch '/password/reset', to: 'passwords#reset'

  #other routes
  resources :loans
  resources :categories
  resources :roles

  resources :libraries do
    resource :fine_policy, only: [:show, :create, :update]
    resource :notification_setting, only: [:show, :create, :update]
    resource :loan_policy, only: [:show, :create, :update]
    
    resource :email_account, only: [:show, :create, :update], controller: 'email_accounts' do
      get 'authorize_google', on: :member
      get 'callback', on: :member
    end
  end

  # Rotas para livros e suas cópias
  resources :books
  resources :copies
  get '/books/:id/copies', to: 'books#copies'
  
  # Rotas para clients
  resources :clients
  get "clients/:id/loans", to: "clients#loans"
  post "clients/login", to: "clients_auth#login"
  post "clients/check_password", to: "clients_auth#check_password"
end
