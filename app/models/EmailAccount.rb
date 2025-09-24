class EmailAccount < ApplicationRecord
  belongs_to :library

  validates :gmail_user_email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
end
