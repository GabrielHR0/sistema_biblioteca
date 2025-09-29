class ClientsAuthController < ApplicationController
  skip_before_action :authorize_request
  before_action :authorize_request, only: %i[check_password]


  # POST /clients/login
  def login
    client = Client.find_by(cpf: params[:login]) || Client.find_by(email: params[:login])

    if client&.authenticate(params[:password])
      token = JsonWebToken.encode(client_id: client.id, type: "client")
      render json: { token:, client: client }, status: :ok
    else
      render json: { error: "Login ou senha inválidos" }, status: :unauthorized
    end
  end

  # POST /clients/check_password
  def check_password
    client = Client.find(params[:id])
    puts "#{client}"
    if client&.authenticate(params[:password])
      render json: { valid: true, message: "Login bem-sucedido" }, status: :ok
    else
      render json: { valid: false, message: "Senha incorreta" }, status: :unauthorized
    end
  end

  private

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

end
