class FinePolicy < ApplicationRecord
  belongs_to :library

  validates :daily_fine, :max_fine, numericality: { greater_than_or_equal_to: 0 }
end
