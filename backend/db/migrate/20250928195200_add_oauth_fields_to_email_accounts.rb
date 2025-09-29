class AddOauthFieldsToEmailAccounts < ActiveRecord::Migration[8.0]
  def change
    add_column :email_accounts, :token_expires_at, :datetime
    add_column :email_accounts, :authorized_at, :datetime
    add_column :email_accounts, :authorization_status, :string, default: 'not_authorized'
    
    add_index :email_accounts, :authorization_status
  end
end
