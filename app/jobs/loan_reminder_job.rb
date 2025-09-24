class LoanReminderJob < ApplicationJob
  queue_as :default

  def perform(*args)
    Loan.includes(:client, :copy).where(status: "ongoing").find_each do |loan|
      library = Library.first
      next unless library&.notification_setting

      days_before = library.notification_setting.return_reminder_days
      if loan.due_date == Date.today + days_before.days
        LoanMailer.return_reminder(loan).deliver_later
        puts "Lembrete enviado para #{loan.client.email} sobre #{loan.copy.title}"
      end
    end
  end
end
