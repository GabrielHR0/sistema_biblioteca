class AddReturnDateToLoans < ActiveRecord::Migration[8.0]
  def change
    add_column :loans, :return_date, :date
  end
end
