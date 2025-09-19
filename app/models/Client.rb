class Client < ApplicationRecord
  has_secure_password

  validates :fullName, :cpf, :phone, :email, presence: true
  validates :email, uniqueness: true
  validates :cpf, uniqueness: true
  validates :password, length: { minimum: 6 }, if: -> { password.present? }

end