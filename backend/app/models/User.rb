class User < ApplicationRecord
  has_secure_password

  has_many :user_roles, dependent: :destroy
  has_many :roles, through: :user_roles

  validates :name, :email, presence: true
  validates :email, uniqueness: true
  validates :password, length: { minimum: 6 }, if: -> { password.present? }
  
  def access_levels
    roles.map(&:access)
  end

  def has_access?(level)
    access_levels.include?(level)
  end

  def must_change_password?
    primary_access_level == :Librarian && !password_changed
  end
  
  def primary_access_level
    priorities = { admin: 1, librarian: 2, unknown: 99 }
    
    roles
      .map(&:access)
      .min_by { |role| priorities[role] || 99 }
  end

end