class MarkOverdueLoansJob < ApplicationJob
  queue_as :default

  def perform
    loans = Loan.where(status: "ongoing").where("due_date < ?", Date.today)
    Rails.logger.info "Encontrados #{loans.count} loans atrasados"
    
    loans.find_each do |loan|
      Rails.logger.info "Atualizando loan #{loan.id}"
      result = loan.set_status_overdue
      
      if result
        Rails.logger.info "Loan #{loan.id} atualizado para overdue"
      else
        Rails.logger.error "Falha ao atualizar loan #{loan.id}: #{loan.errors.full_messages.join(', ')}"
      end
    end
  end
end