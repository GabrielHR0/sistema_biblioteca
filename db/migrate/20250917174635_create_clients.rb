class CreateClients < ActiveRecord::Migration[8.0]
  def change
    create_table :clients do |t|
      t.string :full_name, null: false
      t.string :cpf, null: false
      t.string :phone, null: false
      t.string :email, null: false
      t.string :password_digest, null: false

      t.timestamps
    end

    add_index :clients, :email, unique: true
    add_index :clients, :cpf, unique: true
  end
end
