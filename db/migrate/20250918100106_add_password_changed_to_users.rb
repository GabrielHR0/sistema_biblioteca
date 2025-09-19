class AddPasswordChangedToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :password_changed, :boolean
  end
end
