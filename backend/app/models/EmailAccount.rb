class EmailAccount < ApplicationRecord
  belongs_to :library

  VALID_STATUSES = %w[not_authorized authorized expired failed revoked].freeze

  validates :gmail_user_email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :authorization_status, inclusion: { in: VALID_STATUSES }

  def authorization_valid?
    authorization_status == 'authorized' && gmail_oauth_token.present? &&
      (token_expires_at.nil? || token_expires_at > Time.current)
  end

  def needs_refresh?
    gmail_refresh_token.present? &&
      (token_expires_at.nil? || token_expires_at <= Time.current + 5.minutes)
  end
end
