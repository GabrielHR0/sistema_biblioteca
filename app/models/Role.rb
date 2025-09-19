class Role < ApplicationRecord
  has_many :user_roles
  has_many :user, through: :user_roles


  def access
    case name
    when "Administrator"
      :Administrator
    when "Librarian"
      :Librarian
    else
      :unknown
    end
  end
end
