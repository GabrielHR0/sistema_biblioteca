# app/mailers/user_mailer.rb
class UserMailer < ApplicationMailer
  def reset_password_email(user, token)
    @user = user
    @token = token
    @front_url = ENV['FRONT_URL'] || "http://localhost:3000"
    @reset_url = "#{@front_url}/password-reset/#{@token}"

    email_account = EmailAccount.first
    gmail_service = GmailEmailService.new(email_account)
    
    gmail_service.send_email(
      to: @user.email,
      subject: "Redefinição de senha - Sistema Biblioteca",
      body: render_to_string(template: 'user_mailer/reset_password_email', layout: false)
    )
  rescue => e
    Rails.logger.error "UserMailer error: #{e.message}"
    raise
  end
end