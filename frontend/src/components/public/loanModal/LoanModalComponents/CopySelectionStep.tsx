// components/LoanModalSteps/CopySelectionStep.tsx
import React from 'react';
import { Book, BookCopy } from '../LoanModal';
import { StatusBadge } from '../LoanModalComponents/StatusBadge';
import { CopyCard } from '../LoanModalComponents/CopyCard';

interface CopySelectionStepProps {
  book: Book;
  availableCopies: BookCopy[];
  borrowedCopies: BookCopy[];
  selectedCopy: BookCopy | null;
  onCopySelect: (copy: BookCopy) => void;
  onNext: () => void;
  onClose: () => void;
  loading: boolean;
  actionType: 'loan' | 'return';
}

export const CopySelectionStep: React.FC<CopySelectionStepProps> = ({
  book,
  availableCopies,
  borrowedCopies,
  selectedCopy,
  onCopySelect,
  onNext,
  onClose,
  loading,
  actionType
}) => {
  return (
    <div>
      <h6 className="fw-semibold mb-3">
        <i className="bi bi-book me-1"></i>
        Selecionar Cópia do Livro
      </h6>
      
      <div className="card bg-light mb-3">
        <div className="card-body">
          <h6 className="card-title">
            <i className="bi bi-bookmark text-primary me-2"></i>
            {book.title}
          </h6>
          <p className="card-text mb-1">
            <i className="bi bi-person me-1"></i>
            <strong>Autor:</strong> {book.author}
          </p>
          <p className="card-text mb-0">
            <i className="bi bi-journal me-1"></i>
            <strong>Total de cópias:</strong> {availableCopies.length + borrowedCopies.length} 
            ({availableCopies.length} disponíveis, {borrowedCopies.length} emprestadas)
          </p>
        </div>
      </div>

      {availableCopies.length > 0 && (
        <>
          <h6 className="fw-semibold mb-3 text-success">
            <i className="bi bi-check-circle me-1"></i>
            Cópias Disponíveis para Empréstimo:
          </h6>
          <div className="row g-3 mb-4">
            {availableCopies.map((copy) => (
              <div key={copy.id} className="col-md-6">
                <CopyCard
                  copy={copy}
                  isSelected={selectedCopy?.id === copy.id}
                  onSelect={onCopySelect}
                  actionType="loan"
                />
              </div>
            ))}
          </div>
        </>
      )}

      {borrowedCopies.length > 0 && (
        <>
          <h6 className="fw-semibold mb-3 text-warning">
            <i className="bi bi-arrow-return-left me-1"></i>
            Cópias Emprestadas para Devolução:
          </h6>
          <div className="row g-3">
            {borrowedCopies.map((copy) => (
              <div key={copy.id} className="col-md-6">
                <CopyCard
                  copy={copy}
                  isSelected={selectedCopy?.id === copy.id}
                  onSelect={onCopySelect}
                  actionType="return"
                />
              </div>
            ))}
          </div>
        </>
      )}
      
      {(availableCopies.length === 0 && borrowedCopies.length === 0) && !loading && (
        <div className="alert alert-warning text-center">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Nenhuma cópia cadastrada para este livro.
        </div>
      )}
      
      <div className="d-flex justify-content-between mt-4">
        <button 
          className="btn btn-outline-secondary" 
          onClick={onClose}
          disabled={loading}
        >
          <i className="bi bi-x-circle me-1"></i>
          Cancelar
        </button>
        <button 
          className={`btn ${actionType === 'loan' ? 'btn-primary' : 'btn-success'}`} 
          onClick={onNext}
          disabled={!selectedCopy || loading}
        >
          {actionType === 'loan' ? 'Avançar' : 'Confirmar Devolução'} 
          <i className="bi bi-arrow-right ms-1"></i>
        </button>
      </div>
    </div>
  );
};