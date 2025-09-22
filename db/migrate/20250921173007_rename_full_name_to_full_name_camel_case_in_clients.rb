class RenameFullNameToFullNameCamelCaseInClients < ActiveRecord::Migration[8.0]
  def change
    rename_column :clients, :full_name, :fullName
  end
end
