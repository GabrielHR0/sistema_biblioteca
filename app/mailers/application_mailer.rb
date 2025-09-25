class ApplicationMailer < ActionMailer::Base
  layout 'mailer'

  before_action :setup_smtp

  private

  def setup_smtp
    email_account = Library.first&.email_account
    raise "Conta de email não configurada" unless email_account

    self.class.smtp_settings = {
      address:              "smtp.gmail.com",
      port:                 587,
      domain:               "gmail.com",
      authentication:       :plain, 
      user_name:            email_account.gmail_user_email,
      password:             email_account.gmail_oauth_token,
      enable_starttls_auto: true
    }

    self.class.default from: email_account.gmail_user_email
  end
end
