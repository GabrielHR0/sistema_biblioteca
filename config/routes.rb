Rails.application.routes.draw do
  post '/auth/login', to: 'auth#login'
  post 'users/verify_password', to: 'users#verify_password'
  post '/password/forgot', to: 'passwords#forgot'
  patch '/password/reset', to: 'passwords#reset'
  resources :categories
  resources :books
  resources :users
  resources :clients
  resources :roles
end
