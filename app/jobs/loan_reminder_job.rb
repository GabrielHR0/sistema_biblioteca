class LoanReminderJob < ApplicationJob
  queue_as :default

  def perform(*args)
    library = Library.first
    return unless library&.notification_setting

    days_before = library.notification_setting.return_reminder_days
    reminder_date = Date.today + days_before.days

    Loan.includes(:client, :copy).where(status: "ongoing").find_each do |loan|
      next unless loan.due_date.to_date == reminder_date.to_date

      LoanMailer.return_reminder(loan).deliver_later(queue: :mailers)
      Rails.logger.info "Lembrete enviado para #{loan.client.email} sobre #{loan.copy.title}"
    end
  end
end
