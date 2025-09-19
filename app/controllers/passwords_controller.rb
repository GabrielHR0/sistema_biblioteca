class PasswordsController < ApplicationController
  skip_before_action :authorize_request

  # POST /password/forgot
  def forgot
    user = User.find_by(email: params[:email])
    if user
      token = JsonWebToken.encode({ user_id: user.id }, 15.minutes.from_now)
      
      UserMailer.reset_password_email(user, token).deliver_now

    end

    render json: { message: "Se o email existir, enviamos um link para alterar a senha" }
  end

  # POST /password/reset
  def reset
    token = params[:token]
    new_password = params[:password]
    new_password_confirmation = params[:password_confirmation]

    begin
      decoded = JsonWebToken.decode(token)
      user = User.find(decoded[:user_id])
      
      if user.update(password: new_password, password_confirmation: new_password_confirmation)
        user.update(password_changed: true)
        render json: { message: "Senha alterada com sucesso" }
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      render json: { error: "Token inválido ou expirado" }, status: :unauthorized
    end
  end
end
