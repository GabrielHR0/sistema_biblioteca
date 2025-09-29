class Library < ApplicationRecord
  has_one :loan_policy, dependent: :destroy
  has_one :fine_policy, dependent: :destroy
  has_one :notification_setting, dependent: :destroy
  has_one :email_account, dependent: :destroy

  validates :name, presence: true
end
