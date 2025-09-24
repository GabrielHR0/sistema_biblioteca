class CreateFinePolicies < ActiveRecord::Migration[8.0]
  def change
    create_table :fine_policies do |t|
      t.references :library, null: false, foreign_key: true
      t.decimal :daily_fine
      t.decimal :max_fine

      t.timestamps
    end
  end
end
