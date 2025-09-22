class Loan < ApplicationRecord
  belongs_to :copy
  belongs_to :client
  belongs_to :user, optional: true

  STATUSES = %w[ongoing returned overdue].freeze

  validates :loan_date, :due_date, :status, presence: true
  validates :status, inclusion: { in: STATUSES }
  validate :due_date_after_loan_date
  validate :copy_available, on: :create

  def overdue?
    return false if due_date.blank?
    due_date < Date.today && status != "returned"
  end

  private

  def due_date_after_loan_date
    return if due_date.blank? || loan_date.blank?
    errors.add(:due_date, "Precisa ser depois da data de empréstimo") if due_date < loan_date
  end

  def copy_available
    if copy.borrowed?
      errors.add(:copy, "Ja está emprestado")
    end
  end
end
