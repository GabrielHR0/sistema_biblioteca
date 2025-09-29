class CreateLoans < ActiveRecord::Migration[8.0]
  def change
    create_table :loans do |t|
      t.references :copy, null: false, foreign_key: true
      t.references :client, null: false, foreign_key: true
      t.references :user, foreign_key: true 

      t.date :loan_date, null: false
      t.date :due_date, null: false
      t.string :status, null: false, default: "ongoing"

      t.timestamps
    end
  end
end
