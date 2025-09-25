// components/LoanModalComponents/ProgressIndicator.tsx
import React from 'react';

interface ProgressIndicatorProps {
  step: number;
  actionType: 'loan' | 'return';
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ step, actionType }) => {
  return (
    <>
      <div className="progress mb-4" style={{height: '8px'}}>
        <div 
          className={`progress-bar ${actionType === 'loan' ? 'bg-primary' : 'bg-success'}`} 
          style={{width: `${((step + 1) / 3) * 100}%`}}
        ></div>
      </div>
      
      <div className="d-flex justify-content-between mb-4">
        <span className={`badge ${step >= 0 ? (actionType === 'loan' ? 'bg-primary' : 'bg-success') : 'bg-secondary'} fs-6 p-2`}>
          <i className="bi bi-1-circle me-1"></i>
          1. Selecionar Cópia
        </span>
        <span className={`badge ${step >= 1 ? (actionType === 'loan' ? 'bg-primary' : 'bg-success') : 'bg-secondary'} fs-6 p-2`}>
          <i className="bi bi-2-circle me-1"></i>
          2. {actionType === 'loan' ? 'Selecionar Leitor' : 'Informações do Empréstimo'}
        </span>
        <span className={`badge ${step >= 2 ? (actionType === 'loan' ? 'bg-primary' : 'bg-success') : 'bg-secondary'} fs-6 p-2`}>
          <i className="bi bi-3-circle me-1"></i>
          3. Confirmação
        </span>
      </div>
    </>
  );
};