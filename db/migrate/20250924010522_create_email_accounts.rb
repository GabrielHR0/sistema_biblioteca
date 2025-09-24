class CreateEmailAccounts < ActiveRecord::Migration[8.0]
  def change
    create_table :email_accounts do |t|
      t.references :library, null: false, foreign_key: true
      t.string :gmail_user_email
      t.text :gmail_oauth_token
      t.text :gmail_refresh_token

      t.timestamps
    end
  end
end
