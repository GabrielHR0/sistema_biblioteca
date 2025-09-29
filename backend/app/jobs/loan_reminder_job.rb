# app/jobs/loan_reminder_job.rb
class LoanReminderJob < ApplicationJob
  queue_as :default

  def perform
    Rails.logger.info "[LoanReminderJob] Iniciando job de lembrete de devolução"
    library = Library.order(:id).first
    return Rails.logger.info "[LoanReminderJob] Nenhuma biblioteca configurada" unless library

    email_account = library.email_account
    return Rails.logger.info "[LoanReminderJob] Conta de email não configurada" unless email_account

    settings = library.notification_setting

    days_before =
      if settings.nil?
        3
      elsif settings.respond_to?(:return_reminder_days)
        (settings.return_reminder_days || 2).to_i
      else
        Rails.logger.warn "[LoanReminderJob] Campo 'return_reminder_days' não encontrado; usando default 2"
        2
      end

    today = Date.current
    target_due = today + days_before

    loans = Loan.where(status: 'ongoing').includes(:client, copy: :book)
    emails_sent = 0
    needing = 0

    service = GmailEmailService.new(email_account)

    loans.find_each do |loan|
      due = loan.due_date&.to_date
      next unless due == target_due

      needing += 1
      client = loan.client
      copy = loan.copy
      book = copy&.book
      next unless client&.email.present? && book.present?

      subject = "Lembrete: livro #{book.title} vence em #{due.strftime('%d/%m/%Y')}"
      body = <<~HTML
        <p>Olá #{client.fullName},</p>
        <p>Este é um lembrete de que o livro "<strong>#{book.title}</strong>" deve ser devolvido até #{due.strftime('%d/%m/%Y')}.</p>
        <p>Por favor, devolva dentro do prazo para evitar multas.</p>
        <p>#{library.name}</p>
      HTML

      service.send_email(to: client.email, subject: subject, body: body)
      emails_sent += 1
    end

    Rails.logger.info "[LoanReminderJob] Finalizado: needing=#{needing} emails_sent=#{emails_sent}"
  end
end
