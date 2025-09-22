class ClientMailer < ApplicationMailer
  default from: ENV["GMAIL_USERNAME"]

  def send_password(client, password)
    @client = client
    @password = password
    mail(to: @client.email, subject: 'Sua senha de acesso à biblioteca')
  end
end
