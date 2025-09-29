class LoanPolicy < ApplicationRecord
  belongs_to :library

  validates :loan_limit, :loan_period_days, :renewals_allowed, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
