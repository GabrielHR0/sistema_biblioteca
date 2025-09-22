class CreateCopies < ActiveRecord::Migration[8.0]
  def change
    create_table :copies do |t|
      t.references :book, null: false, foreign_key: true
      t.integer :number, null: false
      t.string :edition, null: false
      t.string :status, null: false, default: "available"

      t.timestamps
    end

    add_index :copies, [:book_id, :number], unique: true
  end
end
