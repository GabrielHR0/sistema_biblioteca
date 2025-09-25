// components/LoanModalComponents/CopyCard.tsx (atualizado)
import React from 'react';
import { BookCopy } from '../LoanModal';
import { StatusBadge } from './StatusBadge';

interface CopyCardProps {
  copy: BookCopy;
  isSelected: boolean;
  onSelect: (copy: BookCopy) => void;
  actionType: 'loan' | 'return';
  loanInfo?: any;
}

export const CopyCard: React.FC<CopyCardProps> = ({ 
  copy, 
  isSelected, 
  onSelect, 
  actionType,
  loanInfo 
}) => {
  const getCurrentLoanInfo = (copy: BookCopy) => {
    // Se temos informações detalhadas para esta cópia, use-as
    if (loanInfo && loanInfo.copy_id === copy.id) {
      const dueDate = new Date(loanInfo.due_date);
      const isOverdue = dueDate < new Date();

      return {
        dueDate: dueDate.toLocaleDateString('pt-BR'),
        isOverdue,
        loanDate: new Date(loanInfo.loan_date).toLocaleDateString('pt-BR'),
        clientName: loanInfo.client?.fullName || "Cliente não encontrado",
        clientId: loanInfo.client_id,
        loanId: loanInfo.id,
        renewalsCount: loanInfo.renewals_count || 0,
        overdue: loanInfo['overdue?'] || false
      };
    }

    // Fallback para os dados básicos se não tiver os detalhados
    if (copy.status !== 'borrowed' || !copy.loans || copy.loans.length === 0) {
      return null;
    }
    
    const activeLoan = copy.loans.find((loan: any) => 
      loan.status === 'ongoing' || !loan.return_date
    );

    if (!activeLoan) return null;

    const dueDate = new Date(activeLoan.due_date);
    const isOverdue = dueDate < new Date();

    return {
      dueDate: dueDate.toLocaleDateString('pt-BR'),
      isOverdue,
      loanDate: new Date(activeLoan.loan_date).toLocaleDateString('pt-BR'),
      clientName: activeLoan.client?.name || activeLoan.client?.fullName || "Cliente não encontrado",
      clientId: activeLoan.client_id,
      loanId: activeLoan.id,
      renewalsCount: activeLoan.renewals_count || 0
    };
  };

  const loanInfoData = getCurrentLoanInfo(copy);
  const borderColor = actionType === 'loan' ? 'border-primary' : 'border-success';
  const isOverdue = loanInfoData?.isOverdue;

  return (
    <div 
      className={`card cursor-pointer ${isSelected ? borderColor : ''} ${isOverdue ? 'border-danger' : ''}`}
      style={{ 
        cursor: 'pointer',
        border: isSelected ? '2px solid #0d6efd' : isOverdue ? '2px solid #dc3545' : '1px solid #dee2e6',
        transition: 'all 0.2s ease-in-out'
      }}
      onClick={() => onSelect(copy)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
    >
      <div className="card-body text-center">
        <h5 className="card-title">
          <i className="bi bi-journal me-2"></i>
          Cópia #{copy.number}
        </h5>
        <p className="card-text">
          <strong>Edição:</strong> {copy.edition}
        </p>
        <div className="mb-2">
          <StatusBadge status={copy.status} />
          {isOverdue && (
            <span className="badge bg-danger ms-1">Atrasado</span>
          )}
        </div>
        
        {loanInfoData && (
          <div className="small text-muted mt-2">
            <div>
              <strong>Emprestado para:</strong> {loanInfoData.clientName}
            </div>
            <div>
              <strong>Data do empréstimo:</strong> {loanInfoData.loanDate}
            </div>
            <div className={loanInfoData.isOverdue ? 'text-danger fw-bold' : ''}>
              <strong>Vencimento:</strong> {loanInfoData.dueDate}
            </div>
            {loanInfoData.renewalsCount > 0 && (
              <div>
                <strong>Renovações:</strong> {loanInfoData.renewalsCount}
              </div>
            )}
          </div>
        )}
        
        {isSelected && (
          <div className={`mt-2 ${actionType === 'loan' ? 'text-primary' : 'text-success'}`}>
            <i className="bi bi-check-circle-fill me-1"></i>
            {actionType === 'loan' ? 'Selecionada para Empréstimo' : 'Selecionada para Devolução'}
          </div>
        )}
      </div>
    </div>
  );
};