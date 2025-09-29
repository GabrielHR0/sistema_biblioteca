# app/mailers/client_mailer.rb
class ClientMailer < ApplicationMailer
  def send_password(client, password)
    @client = client
    @password = password
    
    email_account = EmailAccount.first
    if email_account.nil?
      Rails.logger.error "EmailAccount não configurado"
      return
    end
    
    gmail_service = GmailEmailService.new(email_account)
    
    gmail_service.send_email(
      to: @client.email,
      subject: 'Sua senha de acesso à biblioteca',
      body: render_to_string(template: 'client_mailer/send_password', layout: false)
    )
  rescue => e
    Rails.logger.error "ClientMailer error: #{e.message}"
    raise
  end
end