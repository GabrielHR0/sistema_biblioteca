class NotificationSetting < ApplicationRecord
  belongs_to :library

  validates :return_reminder_days, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
