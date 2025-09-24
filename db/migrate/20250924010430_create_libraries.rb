class CreateLibraries < ActiveRecord::Migration[8.0]
  def change
    create_table :libraries do |t|
      t.string :name
      t.string :phone
      t.string :address
      t.string :logo_url

      t.timestamps
    end
  end
end
