class UserMailer < ApplicationMailer
  def reset_password_email(user, token)
    front_url = Rails.application.credentials.front_url || "http://localhost:3000"
    @user = user
    @token = token
    @url  = "#{front_url}/password-reset/#{@token}"

    mail(to: @user.email, subject: "Alteração de senha")
  end
end
