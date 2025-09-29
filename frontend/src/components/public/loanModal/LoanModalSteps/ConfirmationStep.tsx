// components/LoanModalSteps/ConfirmationStep.tsx
import React from 'react';

interface ConfirmationStepProps {
  book: any;
  selectedCopy: any;
  selectedClient: any;
  password: string;
  setPassword: (password: string) => void;
  detailedLoanInfo: any;
  loading: boolean;
  loadingLoanDetails: boolean;
  actionType: 'loan' | 'return';
  generatedPassword?: string | null;
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
  generatedPassword,
  onConfirm,
  onBack
}) => {
  if (loadingLoanDetails) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-2">Carregando informações do empréstimo...</p>
      </div>
    );
  }

  return (
    <div>
      <h6 className="fw-semibold mb-3">
        <i className="bi bi-check-circle me-1"></i>
        Confirmação de {actionType === 'loan' ? 'Empréstimo' : 'Devolução'}
      </h6>
      
      <div className="card mb-3">
        <div className="card-body">
          <h6 className="card-title">Detalhes do Livro</h6>
          <p className="mb-1"><strong>Título:</strong> {book.title}</p>
          <p className="mb-1"><strong>Autor:</strong> {book.author}</p>
          <p className="mb-0"><strong>Cópia:</strong> Edição {selectedCopy?.edition} - Nº {selectedCopy?.number}</p>
        </div>
      </div>

      {actionType === 'loan' && selectedClient && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title">Detalhes do Leitor</h6>
            <p className="mb-1"><strong>Nome:</strong> {selectedClient.name || selectedClient.fullName}</p>
            <p className="mb-1"><strong>Email:</strong> {selectedClient.email}</p>
            {selectedClient.cpf && <p className="mb-0"><strong>CPF:</strong> {selectedClient.cpf}</p>}
          </div>
        </div>
      )}

      {actionType === 'return' && detailedLoanInfo && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title">Detalhes do Empréstimo</h6>
            <p className="mb-1"><strong>Leitor:</strong> {detailedLoanInfo.client?.name || detailedLoanInfo.client?.fullName}</p>
            <p className="mb-1"><strong>Data do empréstimo:</strong> {new Date(detailedLoanInfo.loan_date).toLocaleDateString()}</p>
            <p className="mb-1"><strong>Data de vencimento:</strong> {new Date(detailedLoanInfo.due_date).toLocaleDateString()}</p>
            <p className="mb-0"><strong>Renovações:</strong> {detailedLoanInfo.renewals_count || 0}</p>
          </div>
        </div>
      )}

      {actionType === 'loan' && (
        <div className="mb-3">
          <label className="form-label">
            <i className="bi bi-key me-1"></i>
            Senha do Leitor *
          </label>
          <input
            type="password"
            className="form-control"
            placeholder="Digite a senha do leitor"
            value={generatedPassword || password} // Alteração aqui
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          {generatedPassword && (
            <div className="form-text text-info">
              <i className="bi bi-info-circle me-1"></i>
              Senha gerada recentemente: <strong>{generatedPassword}</strong>
            </div>
          )}
        </div>
      )}
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {actionType === 'loan' 
          ? 'Confirme os dados antes de realizar o empréstimo.' 
          : 'Confirme os dados antes de registrar a devolução.'}
      </div>

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
          className={`btn ${actionType === 'loan' ? 'btn-primary' : 'btn-success'}`}
          onClick={onConfirm}
          disabled={loading || (actionType === 'loan' && !password && !generatedPassword)}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm me-2" />
          ) : (
            <i className={`bi ${actionType === 'loan' ? 'bi-check-lg' : 'bi-arrow-return-left'} me-2`}></i>
          )}
          {actionType === 'loan' ? 'Confirmar Empréstimo' : 'Confirmar Devolução'}
        </button>
      </div>
    </div>
  );
};