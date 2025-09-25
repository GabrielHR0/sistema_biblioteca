class CreateNotificationSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :notification_settings do |t|
      t.references :library, null: false, foreign_key: true
      t.boolean :notify_email
      t.boolean :notify_sms
      t.integer :return_reminder_days

      t.timestamps
    end
  end
end
