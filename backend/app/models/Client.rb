class Client < ApplicationRecord
  has_secure_password

  has_many :loans, dependent: :destroy
  has_many :copies, through: :loans

  validates :fullName, :cpf, :phone, :email, presence: true
  validates :email, uniqueness: true
  validates :cpf, uniqueness: true
  validates :password, length: { minimum: 6 }, if: -> { password.present? }

  before_validation :set_password, on: :create

  after_create :send_welcome_email

  # Método público para poder ser chamado no controller
  def generatePassword
    SecureRandom.alphanumeric(6)
  end

  private

  def set_password
    if password.blank?
      generated_password = generatePassword
      puts "Generated password for client #{fullName} (#{email}): #{generated_password}"
      self.password = generated_password
      self.password_confirmation = generated_password
    end
  end

  def send_welcome_email
    ClientMailer.send_password(self, password).deliver_later
  end
end