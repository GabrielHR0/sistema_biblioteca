class UserMailer < ApplicationMailer
  def reset_password_email(user, token)
    setup_smtp
    frontUrl = Rails.application.credentials.front_url || "http://localhost:3000" # fallback se precisar
    @user = user
    @token = token
    @url  = "#{frontUrl}/password-reset/#{@token}"
    mail(to: @user.email, subject: "Alteração de senha")
  end

  private

  
  def setup_smtp
    email_account = Library.first.email_account
    raise "Conta de email não configurada" unless email_account

    smtp_settings = {
      address:              "smtp.gmail.com",
      port:                 587,
      domain:               "gmail.com",
      authentication:       :xoauth2,
      user_name:            email_account.gmail_user_email,
      oauth2_token:         email_account.gmail_oauth_token,
      enable_starttls_auto: true
    }

    self.class.smtp_settings = smtp_settings
    self.default from: email_account.gmail_user_email
  end
end
