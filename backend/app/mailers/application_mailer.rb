class ApplicationMailer < ActionMailer::Base
  default from: -> { Library.first&.email_account&.gmail_user_email || 'no-reply@example.com' }
  layout 'mailer'
end
