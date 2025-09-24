class AddRenewalsCountToLoans < ActiveRecord::Migration[8.0]
  def change
    add_column :loans, :renewals_count, :integer
  end
end
