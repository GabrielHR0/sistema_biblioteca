class ReplaceBooksWithCopiesInLoansAssociation < ActiveRecord::Migration[8.0]
  def up
    if column_exists?(:loans, :copy_id)
    else
      puts "Coluna copy_id não existe em loans"
    end
  end

  def down
  end
end