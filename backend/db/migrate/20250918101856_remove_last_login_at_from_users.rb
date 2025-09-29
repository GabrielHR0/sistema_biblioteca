class RemoveLastLoginAtFromUsers < ActiveRecord::Migration[8.0]
  def change
    remove_column :users, :last_login_at, :datetime
  end
end
