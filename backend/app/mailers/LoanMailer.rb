class LoanMailer < ApplicationMailer
  def return_reminder(loan)
    @loan = loan
    @client = loan.client
    @copy = loan.copy
    @book = @copy&.book
    @due_date = loan.due_date
    mail(
      to: @client.email,
      subject: "Lembrete: livro #{@book&.title} vence em #{@due_date.strftime('%d/%m/%Y')}"
    )
  end
end
