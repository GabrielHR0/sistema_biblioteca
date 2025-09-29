// components/LoanModalComponents/LoanDetails.tsx
import React from 'react';

// Tipos locais para evitar dependências externas
export interface LoanClient {
  id: number;
  fullName: string;
  cpf?: string;
  email?: string;
}

export interface LoanCopy {
  id: number;
  number: number;
  status: 'available' | 'borrowed' | 'lost';
}

export interface Loan {
  id: number;
  copy_id: number;
  client_id: number;
  user_id: number | null;
  loan_date: string;     // "YYYY-MM-DD"
  due_date: string;      // "YYYY-MM-DD"
  status: 'ongoing' | 'returned' | 'overdue';
  created_at: string;    // ISO
  updated_at: string;    // ISO
  renewals_count: number;
  return_date: string | null;
  ['overdue?']?: boolean; // chave com "?" deve ser acessada via bracket notation
  client?: LoanClient;
  copy?: LoanCopy;
}

// Utilitário de data: evita parse UTC de "YYYY-MM-DD" e formata em pt-BR
function formatDateBR(dateStr?: string | null) {
  if (!dateStr) return '-';
  // Para ISO "YYYY-MM-DDTHH:mm": pega só a parte da data
  const onlyDate = dateStr.length > 10 ? dateStr.slice(0, 10) : dateStr;
  const [y, m, d] = onlyDate.split('-').map(Number);
  if (!y || !m || !d) return '-';
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
}

interface LoanDetailsProps {
  detailedLoanInfo: Loan | null;
}

const statusMap: Record<Loan['status'], { text: string; cls: string }> = {
  ongoing:  { text: 'Em Andamento', cls: 'bg-warning' },
  returned: { text: 'Devolvido',    cls: 'bg-success' },
  overdue:  { text: 'Atrasado',     cls: 'bg-danger'  },
};

export const LoanDetails: React.FC<LoanDetailsProps> = ({ detailedLoanInfo }) => {
  if (!detailedLoanInfo) return null;

  const isOverdue = !!detailedLoanInfo['overdue?'];
  const statusCfg = statusMap[detailedLoanInfo.status] ?? {
    text: detailedLoanInfo.status,
    cls: 'bg-secondary',
  };

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
              <strong>ID do Empréstimo:</strong><br />
              #{detailedLoanInfo.id}
            </div>

            <div className="col-md-6">
              <strong>Status:</strong><br />
              <span className={`badge ${statusCfg.cls}`}>{statusCfg.text}</span>
            </div>

            <div className="col-md-6 mt-2">
              <strong>Data do Empréstimo:</strong><br />
              {formatDateBR(detailedLoanInfo.loan_date)}
            </div>

            <div className="col-md-6 mt-2">
              <strong>Data de Vencimento:</strong><br />
              <span className={isOverdue ? 'text-danger fw-bold' : ''}>
                {formatDateBR(detailedLoanInfo.due_date)}
                {isOverdue && ' (Atrasado)'}
              </span>
            </div>

            <div className="col-md-6 mt-2">
              <strong>Renovações:</strong><br />
              {detailedLoanInfo.renewals_count || 0}
            </div>

            <div className="col-md-6 mt-2">
              <strong>Situação:</strong><br />
              {isOverdue ? (
                <span className="badge bg-danger">Atrasado</span>
              ) : (
                <span className="badge bg-success">Em Dia</span>
              )}
            </div>

            <div className="col-md-6 mt-2">
              <strong>ID da Cópia:</strong><br />
              #{detailedLoanInfo.copy_id}
            </div>

            <div className="col-md-6 mt-2">
              <strong>ID do Cliente:</strong><br />
              #{detailedLoanInfo.client_id}
            </div>

            {!!detailedLoanInfo.user_id && (
              <div className="col-md-6 mt-2">
                <strong>ID do Usuário:</strong><br />
                #{detailedLoanInfo.user_id}
              </div>
            )}

            <div className="col-md-6 mt-2">
              <strong>Criado em:</strong><br />
              {formatDateBR(detailedLoanInfo.created_at)}
            </div>

            <div className="col-md-6 mt-2">
              <strong>Atualizado em:</strong><br />
              {formatDateBR(detailedLoanInfo.updated_at)}
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
                <strong>Nome Completo:</strong><br />
                {detailedLoanInfo.client.fullName}
              </div>
              <div className="col-md-6">
                <strong>CPF:</strong><br />
                {detailedLoanInfo.client.cpf || 'Não informado'}
              </div>
              <div className="col-md-6 mt-2">
                <strong>ID do Cliente:</strong><br />
                #{detailedLoanInfo.client.id}
              </div>
              {detailedLoanInfo.client.email && (
                <div className="col-md-6 mt-2">
                  <strong>Email:</strong><br />
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
                <strong>Número da Cópia:</strong><br />
                #{detailedLoanInfo.copy.number}
              </div>
              <div className="col-md-6">
                <strong>Status:</strong><br />
                <span className={`badge ${
                  detailedLoanInfo.copy.status === 'available' ? 'bg-success' :
                  detailedLoanInfo.copy.status === 'borrowed'  ? 'bg-warning' :
                  'bg-danger'
                }`}>
                  {detailedLoanInfo.copy.status === 'available' ? 'Disponível' :
                   detailedLoanInfo.copy.status === 'borrowed'  ? 'Emprestada' :
                   'Perdida'}
                </span>
              </div>
              <div className="col-md-6 mt-2">
                <strong>ID da Cópia:</strong><br />
                #{detailedLoanInfo.copy.id}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
