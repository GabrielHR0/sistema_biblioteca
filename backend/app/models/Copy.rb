# app/models/copy.rb
class Copy < ApplicationRecord
  belongs_to :book
  has_many :loans, dependent: :destroy

  VALID_STATUSES = %w[available borrowed lost].freeze

  validates :edition, :status, presence: true
  validates :number, uniqueness: { scope: :book_id }
  validates :status, inclusion: { in: VALID_STATUSES, message: "%{value} is not a valid status" }

  before_create :assign_sequential_number
  after_commit :update_book_total, on: [:create, :update]


  VALID_STATUSES.each do |s|
    define_method("#{s}?") do
      status == s
    end
  end

  private

  def assign_sequential_number
    self.number = (book.copies.maximum(:number) || 0) + 1
  end

  def update_book_total
    return unless book && book.persisted?
    book.update_columns(total_copies: book.copies.count, updated_at: Time.current)
  end
end