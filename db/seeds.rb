# db/seeds.rb

library = Library.find_or_create_by!(name: "Biblioteca Municipal Central") do |lib|
  lib.phone = "(11) 3333-4444"
  lib.address = "Rua das Flores, 123 - Centro"
  lib.logo_url = nil
end

library.create_notification_setting(
  notify_email: true,
  notify_sms: false,
  return_reminder_days: 3
) unless library.notification_setting

library.create_fine_policy(
  daily_fine: 2.50,
  max_fine: 25.00
) unless library.fine_policy

library.create_email_account(
  gmail_user_email: "biblioteca@dominio.com",
  gmail_oauth_token: "default_token",
  gmail_refresh_token: "default_refresh_token"
) unless library.email_account

library.create_loan_policy(
  loan_limit: 3,        
  loan_period_days: 15, 
  renewals_allowed: true   
) unless library.loan_policy

puts "Biblioteca padrão criada com sucesso!"
