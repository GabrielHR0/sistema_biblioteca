// components/LoanModalSteps/ConfirmationStep.tsx
import React from 'react';
import { Book, BookCopy } from '../LoanModal';
import { LoanDetails } from '../LoanModalComponents/LoanDetails';
import { ConfirmationSummary } from '../LoanModalComponents/ConfirmationSummary';

interface ConfirmationStepProps {
  book: Book;
  selectedCopy: BookCopy | null;
  selectedClient: any;
  password: string;
  setPassword: (password: string) => void;
  detailedLoanInfo: any;
  loading: boolean;
  loadingLoanDetails: boolean;
  actionType: 'loan' | 'return';
  onConfirm: () => void;
  onBack: () => void;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  book,
  selectedCopy,
  selectedClient,
  password,
  setPassword,
  detailedLoanInfo,
  loading,
  loadingLoanDetails,
  actionType,
  onConfirm,
  onBack
}) => {
  return (
    <div>
      <h6 className="fw-semibold mb-3">
        <i className="bi bi-check-circle me-1"></i>
        {actionType === 'loan' ? 'Confirmar Empréstimo' : 'Confirmar Devolução'}
      </h6>

      {actionType === 'return' && loadingLoanDetails && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p>Carregando detalhes do empréstimo...</p>
        </div>
      )}

      {!loadingLoanDetails && (
        <>
          {actionType === 'return' && detailedLoanInfo && (
            <LoanDetails detailedLoanInfo={detailedLoanInfo} />
          )}

          <ConfirmationSummary
            book={book}
            selectedCopy={selectedCopy}
            selectedClient={selectedClient}
            detailedLoanInfo={detailedLoanInfo}
            actionType={actionType}
          />
          
          {actionType === 'loan' ? (
            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-semibold">
                <i className="bi bi-shield-lock me-1"></i>
                Senha do Leitor para Confirmação
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-key"></i>
                </span>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="Digite a senha do leitor"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onConfirm();
                  }}
                  disabled={loading}
                />
              </div>
              <div className="form-text">
                A senha é necessária para confirmar a identidade do leitor.
              </div>
            </div>
          ) : (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              Ao confirmar a devolução, o exemplar ficará disponível para novos empréstimos.
            </div>
          )}
          
          <div className="d-flex justify-content-between">
            <button 
              className="btn btn-outline-secondary" 
              onClick={onBack}
              disabled={loading}
            >
              <i className="bi bi-arrow-left me-1"></i>
              Voltar
            </button>
            <button
              className={`btn ${actionType === 'loan' ? 'btn-success' : 'btn-success'}`}
              onClick={onConfirm}
              disabled={loading || (actionType === 'loan' && !password.trim())}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Processando...
                </>
              ) : (
                <>
                  <i className={`bi ${actionType === 'loan' ? 'bi-check-lg' : 'bi-arrow-return-left'} me-2`}></i>
                  {actionType === 'loan' ? 'Confirmar Empréstimo' : 'Confirmar Devolução'}
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};