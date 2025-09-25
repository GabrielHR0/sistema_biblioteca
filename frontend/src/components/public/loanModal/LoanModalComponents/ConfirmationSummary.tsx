// components/LoanModalComponents/ConfirmationSummary.tsx
import React from 'react';
import { Book, BookCopy } from '../LoanModal';

interface ConfirmationSummaryProps {
  book: Book;
  selectedCopy: BookCopy | null;
  selectedClient: any;
  detailedLoanInfo: any;
  actionType: 'loan' | 'return';
}

export const ConfirmationSummary: React.FC<ConfirmationSummaryProps> = ({
  book,
  selectedCopy,
  selectedClient,
  detailedLoanInfo,
  actionType
}) => {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <h6 className="card-title">
          <i className="bi bi-list-check me-2"></i>
          Resumo da {actionType === 'loan' ? 'Empréstimo' : 'Devolução'}
        </h6>
        <div className="row">
          <div className="col-md-6">
            <strong>
              <i className="bi bi-book me-1"></i>
              Livro:
            </strong><br/>
            {book.title}
          </div>
          <div className="col-md-6">
            <strong>
              <i className="bi bi-journal me-1"></i>
              Cópia:
            </strong><br/>
            #{selectedCopy?.number} - {selectedCopy?.edition}
          </div>
          
          {actionType === 'loan' ? (
            <>
              <div className="col-md-6 mt-2">
                <strong>
                  <i className="bi bi-person me-1"></i>
                  Leitor:
                </strong><br/>
                {selectedClient?.name || selectedClient?.fullName}
              </div>
              <div className="col-md-6 mt-2">
                <strong>
                  <i className="bi bi-calendar me-1"></i>
                  Data de Devolução:
                </strong><br/>
                {new Date(new Date().setDate(new Date().getDate() + 14)).toLocaleDateString('pt-BR')}
              </div>
            </>
          ) : (
            detailedLoanInfo && (
              <>
                <div className="col-md-6 mt-2">
                  <strong>
                    <i className="bi bi-person me-1"></i>
                    Leitor:
                  </strong><br/>
                  {detailedLoanInfo.client?.fullName}
                </div>
                <div className="col-md-6 mt-2">
                  <strong>
                    <i className="bi bi-calendar me-1"></i>
                    Devolução em:
                  </strong><br/>
                  {new Date().toLocaleDateString('pt-BR')}
                </div>
                <div className="col-md-6 mt-2">
                  <strong>
                    <i className="bi bi-arrow-repeat me-1"></i>
                    Renovações:
                  </strong><br/>
                  {detailedLoanInfo.renewals_count || 0}
                </div>
                <div className="col-md-6 mt-2">
                  <strong>
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    Situação:
                  </strong><br/>
                  {detailedLoanInfo['overdue?'] ? (
                    <span className="badge bg-danger">Atrasado</span>
                  ) : (
                    <span className="badge bg-success">Em Dia</span>
                  )}
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};