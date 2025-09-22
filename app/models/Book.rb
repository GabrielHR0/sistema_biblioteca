class Book < ApplicationRecord
  has_many :copies, dependent: :destroy
  has_many :book_categories, dependent: :destroy
  has_many :categories, through: :book_categories
  
  validates :title, :author, presence: true

  def update_total_copies
    update(total_copies: copies.count)
  end

  def total_copies
    read_attribute(:total_copies) || 0
  end
end
