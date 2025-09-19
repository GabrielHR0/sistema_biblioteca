class AuthController < ApplicationController
  skip_before_action :authorize_request, only: :login
  
  def login
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      token = JsonWebToken.encode(user_id: user.id)
      response = { token: token, user: user}

      if user.must_change_password?
        response[:must_change_password] = true
      end

      render json: response, status: :ok
    else
      render json: { error: 'Email ou senha inválidos' }, status: :unauthorized
    end
  end

end
