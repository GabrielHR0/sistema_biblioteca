class LoanMailer < ApplicationMailer
  def return_reminder(loan)
    setup_smtp

    @loan = loan
    @client = loan.client
    @copy = loan.copy
    @due_date = loan.due_date

    mail(
      to: @client.email,
      subject: "Lembrete: livro #{@copy.title} vence em #{@due_date.strftime('%d/%m/%Y')}"
    ) do |format|
      format.text do
        render plain: <<~MESSAGE
          Olá #{@client.fullName},

          Este é um lembrete de que o livro "#{@copy.title}" que você pegou emprestado deve ser devolvido até #{@due_date.strftime('%d/%m/%Y')}.

          Por favor, devolva dentro do prazo para evitar multas.

          Biblioteca
        MESSAGE
      end
    end
  end

  private

  def setup_smtp
    library = Library.first
    email_account = library.email_account
    raise "Conta de email não configurada" unless email_account

    smtp_settings = {
      address:              "smtp.gmail.com",
      port:                 587,
      domain:               "gmail.com",
      authentication:       :xoauth2,
      user_name:            email_account.gmail_user_email,
      oauth2_token:         email_account.gmail_oauth_token,
      enable_starttls_auto: true
    }

    self.class.smtp_settings = smtp_settings
    self.default from: email_account.gmail_user_email
  end
end
