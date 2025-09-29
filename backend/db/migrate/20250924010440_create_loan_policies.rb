class CreateLoanPolicies < ActiveRecord::Migration[8.0]
  def change
    create_table :loan_policies do |t|
      t.references :library, null: false, foreign_key: true
      t.integer :loan_limit
      t.integer :loan_period_days
      t.integer :renewals_allowed

      t.timestamps
    end
  end
end
