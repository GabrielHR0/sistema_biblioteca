// components/LoanModalComponents/LoanDetails.tsx
import React from 'react';

interface LoanDetailsProps {
  detailedLoanInfo: any;
}

export const LoanDetails: React.FC<LoanDetailsProps> = ({ detailedLoanInfo }) => {
  if (!detailedLoanInfo) return null;

  return (
    <>
      <div className="card mb-3">
        <div className="card-body">
          <h6 className="card-title text-success">
            <i className="bi bi-file-text me-2"></i>
            Informações Completas do Empréstimo
          </h6>
          <div className="row">
            <div className="col-md-6">
              <strong>ID do Empréstimo:</strong><br/>
              #{detailedLoanInfo.id}
            </div>
            <div className="col-md-6">
              <strong>Status:</strong><br/>
              <span className={`badge ${
                detailedLoanInfo.status === 'ongoing' ? 'bg-warning' : 
                detailedLoanInfo.status === 'returned' ? 'bg-success' : 'bg-secondary'
              }`}>
                {detailedLoanInfo.status === 'ongoing' ? 'Em Andamento' : 
                detailedLoanInfo.status === 'returned' ? 'Devolvido' : detailedLoanInfo.status}
              </span>
            </div>
            
            <div className="col-md-6 mt-2">
              <strong>Data do Empréstimo:</strong><br/>
              {new Date(detailedLoanInfo.loan_date).toLocaleDateString('pt-BR')}
            </div>
            <div className="col-md-6 mt-2">
              <strong>Data de Vencimento:</strong><br/>
              <span className={detailedLoanInfo['overdue?'] ? 'text-danger fw-bold' : ''}>
                {new Date(detailedLoanInfo.due_date).toLocaleDateString('pt-BR')}
                {detailedLoanInfo['overdue?'] && ' (Atrasado)'}
              </span>
            </div>
            
            <div className="col-md-6 mt-2">
              <strong>Renovações:</strong><br/>
              {detailedLoanInfo.renewals_count || 0}
            </div>
            <div className="col-md-6 mt-2">
              <strong>Situação:</strong><br/>
              {detailedLoanInfo['overdue?'] ? (
                <span className="badge bg-danger">Atrasado</span>
              ) : (
                <span className="badge bg-success">Em Dia</span>
              )}
            </div>
            
            <div className="col-md-6 mt-2">
              <strong>ID da Cópia:</strong><br/>
              #{detailedLoanInfo.copy_id}
            </div>
            <div className="col-md-6 mt-2">
              <strong>ID do Cliente:</strong><br/>
              #{detailedLoanInfo.client_id}
            </div>
            
            {detailedLoanInfo.user_id && (
              <div className="col-md-6 mt-2">
                <strong>ID do Usuário:</strong><br/>
                #{detailedLoanInfo.user_id}
              </div>
            )}
            
            <div className="col-md-6 mt-2">
              <strong>Criado em:</strong><br/>
              {new Date(detailedLoanInfo.created_at).toLocaleDateString('pt-BR')}
            </div>
            <div className="col-md-6 mt-2">
              <strong>Atualizado em:</strong><br/>
              {new Date(detailedLoanInfo.updated_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      </div>

      {detailedLoanInfo.client && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title text-primary">
              <i className="bi bi-person-badge me-2"></i>
              Informações do Leitor
            </h6>
            <div className="row">
              <div className="col-md-6">
                <strong>Nome Completo:</strong><br/>
                {detailedLoanInfo.client.fullName}
              </div>
              <div className="col-md-6">
                <strong>CPF:</strong><br/>
                {detailedLoanInfo.client.cpf || 'Não informado'}
              </div>
              <div className="col-md-6 mt-2">
                <strong>ID do Cliente:</strong><br/>
                #{detailedLoanInfo.client.id}
              </div>
              {detailedLoanInfo.client.email && (
                <div className="col-md-6 mt-2">
                  <strong>Email:</strong><br/>
                  {detailedLoanInfo.client.email}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {detailedLoanInfo.copy && (
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title text-info">
              <i className="bi bi-journal me-2"></i>
              Informações da Cópia
            </h6>
            <div className="row">
              <div className="col-md-6">
                <strong>Número da Cópia:</strong><br/>
                #{detailedLoanInfo.copy.number}
              </div>
              <div className="col-md-6">
                <strong>Status:</strong><br/>
                <span className={`badge ${
                  detailedLoanInfo.copy.status === 'available' ? 'bg-success' : 
                  detailedLoanInfo.copy.status === 'borrowed' ? 'bg-warning' : 'bg-danger'
                }`}>
                  {detailedLoanInfo.copy.status === 'available' ? 'Disponível' : 
                  detailedLoanInfo.copy.status === 'borrowed' ? 'Emprestada' : 'Perdida'}
                </span>
              </div>
              <div className="col-md-6 mt-2">
                <strong>ID da Cópia:</strong><br/>
                #{detailedLoanInfo.copy.id}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};