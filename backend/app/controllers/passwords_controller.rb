class PasswordsController < ApplicationController
  skip_before_action :authorize_request

  # POST /password/forgot
  def forgot
    user = User.find_by(email: params[:email])
    if user
      payload = { user_id: user.id, exp: 15.minutes.from_now.to_i }
      token = JsonWebToken.encode(payload)
      
      UserMailer.reset_password_email(user, token).deliver_now

      Rails.logger.info "Password reset token sent to: #{user.email}"
    end

    render json: { message: "Se o email existir, enviamos um link para alterar a senha" }
  end

  # POST /password/reset
  def reset
    token = params[:token]
    new_password = params[:password]
    new_password_confirmation = params[:password_confirmation]

    if new_password.length < 6
      return render json: { error: "Senha deve ter no mínimo 6 caracteres" }, status: :unprocessable_entity
    end

    if new_password != new_password_confirmation
      return render json: { error: "Senha e confirmação não coincidem" }, status: :unprocessable_entity
    end

    if new_password.blank?
      return render json: { error: "Senha não pode ficar em branco" }, status: :unprocessable_entity
    end

    begin
      decoded = JsonWebToken.decode(token)
      user = User.find(decoded[:user_id])
      
      if user.update(password: new_password, password_confirmation: new_password_confirmation)
        user.update(password_changed: true)
        render json: { message: "Senha alterada com sucesso" }
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    rescue JWT::DecodeError, JWT::ExpiredSignature, ActiveRecord::RecordNotFound
      render json: { error: "Token inválido ou expirado" }, status: :unauthorized
    end
  end
end