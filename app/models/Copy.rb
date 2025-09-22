class Copy < ApplicationRecord
  belongs_to :book
  has_many :loans

  # Lista de status válidos
  VALID_STATUSES = %w[available borrowed lost].freeze

  validates :edition, :status, presence: true
  validates :number, uniqueness: { scope: :book_id }
  validates :status, inclusion: { in: VALID_STATUSES, message: "%{value} is not a valid status" }

  before_create :assign_sequential_number
  after_commit :update_book_total
  after_destroy :update_book_total

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
    book&.update_total_copies
  end
end
