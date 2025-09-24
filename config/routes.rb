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

  # Rotas para livros e suas cópias
  resources :books
  resources :copies
  get '/books/:id/copies', to: 'books#copies'
  
  
  resources :clients
  # Autenticação para clients
  post "clients/login", to: "clients_auth#login"
  post "clients/check_password", to: "clients_auth#check_password"
end
