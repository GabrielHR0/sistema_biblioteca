class Copy < ApplicationRecord
  has_many :loans
  belongs_to :book

  enum status: { available: "available", borrowed: "borrowed", lost: "lost" }

  validates :edition, :status, presence: true
  validates :number, uniqueness: { scope: :book_id }

  before_create :assign_sequential_number
  after_save :update_total_copies
  after_destroy :update_total_copies

  private

  def assign_sequential_number
    self.number = (book.copies.maximum(:number) || 0) + 1
  end

  def update_book_total
    book.update_total_copies
  end
end
