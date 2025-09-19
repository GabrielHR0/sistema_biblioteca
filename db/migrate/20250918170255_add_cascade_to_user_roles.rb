class AddCascadeToUserRoles < ActiveRecord::Migration[8.0]
  def change
    # Remove a foreign key antiga
    remove_foreign_key :user_roles, :users

    # Adiciona a foreign key com cascade
    add_foreign_key :user_roles, :users, on_delete: :cascade
  end
end
