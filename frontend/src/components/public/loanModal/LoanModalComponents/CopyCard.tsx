// components/LoanModalComponents/CopyCard.tsx
import React from 'react';
import { BookCopy } from '../LoanModal';

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
  const handleClick = () => {
    console.log('🖱️ CopyCard clicada:', {
      copyId: copy.id,
      copyNumber: copy.number,
      status: copy.status,
      hasLoans: copy.loans?.length || 0,
      loans: copy.loans
    });
    onSelect(copy);
  };

  const getStatusBadge = () => {
    switch (copy.status) {
      case 'available':
        return <span className="badge bg-success">Disponível</span>;
      case 'borrowed':
        return <span className="badge bg-warning">Emprestada</span>;
      case 'lost':
        return <span className="badge bg-danger">Perdida</span>;
      default:
        return <span className="badge bg-secondary">{copy.status}</span>;
    }
  };

  const getDueDateInfo = () => {
    if (copy.status !== 'borrowed' || !copy.due_date) return null;
    
    const dueDate = new Date(copy.due_date);
    const today = new Date();
    const isOverdue = dueDate < today;
    
    return (
      <div className={`mt-2 p-2 rounded ${isOverdue ? 'bg-danger text-white' : 'bg-warning'}`}>
        <small>
          <i className="bi bi-calendar-x me-1"></i>
          <strong>Vencimento:</strong> {new Date(copy.due_date).toLocaleDateString('pt-BR')}
          {isOverdue && ' (Atrasada)'}
        </small>
      </div>
    );
  };

  return (
    <div
      className={`card cursor-pointer ${isSelected ? 'border-primary shadow' : ''}`}
      onClick={handleClick}
      style={{ transition: 'all 0.2s' }}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="card-title mb-1">
              <i className="bi bi-journal me-1"></i>
              Cópia #{copy.number}
            </h6>
            <p className="card-text mb-1">
              <small className="text-muted">
                <i className="bi bi-journal-code me-1"></i>
                Edição: {copy.edition}
              </small>
            </p>
          </div>
          {getStatusBadge()}
        </div>
        
        {getDueDateInfo()}
        
        {copy.loans && copy.loans.length > 0 && (
          <div className="mt-2">
            <small className="text-muted">
              <i className="bi bi-clock-history me-1"></i>
              {copy.loans.length} empréstimo(s) registrado(s)
            </small>
          </div>
        )}

        <div className="mt-2">
          <small className={`badge ${isSelected ? 'bg-primary' : 'bg-light text-dark'}`}>
            {isSelected ? '✓ Selecionada' : 'Clique para selecionar'}
          </small>
        </div>
      </div>
    </div>
  );
};