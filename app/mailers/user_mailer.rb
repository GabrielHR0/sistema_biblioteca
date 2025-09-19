class UserMailer < ApplicationMailer
  default from: ENV["GMAIL_USERNAME"]

  # Método para enviar link de reset de senha
  def reset_password_email(user, token)
    frontUrl = ENV["FRONT_URL"]
    @user = user
    @token = token
    @url  = "#{frontUrl}/password-reset/?token=#{@token}"
    mail(to: @user.email, subject: "Alteração de senha")
  end
end
