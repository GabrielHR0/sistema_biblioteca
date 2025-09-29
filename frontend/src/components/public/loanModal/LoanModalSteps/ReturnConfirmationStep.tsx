// components/LoanModalSteps/ReturnConfirmationStep.tsx
import React from 'react';
import { Book, BookCopy } from '../LoanModal';
import { LoanDetails, CopyWithLoanHistory } from '../ReturnModal';

import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

interface ReturnConfirmationStepProps {
  book: Book;
  selectedCopy: BookCopy | null;
  loanDetails: LoanDetails | null;
  copyWithHistory: CopyWithLoanHistory | null;
  loading: boolean;
  renewing: boolean;
  onConfirm: () => void;
  onRenew: () => void;
  onBack: () => void;
}

// Função para formatar datas com dayjs
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const d = dayjs(dateString);
  if (!d.isValid()) return dateString;
  return d.format('DD/MM/YYYY');
};

// Função para calcular dias de atraso com dayjs
const calculateDaysOverdue = (dueDate: string) => {
  const due = dayjs(dueDate).startOf('day');
  const today = dayjs().startOf('day');
  const diffDays = today.diff(due, 'day');
  return diffDays > 0 ? diffDays : 0;
};

export const ReturnConfirmationStep: React.FC<ReturnConfirmationStepProps> = ({
  book,
  selectedCopy,
  loanDetails,
  copyWithHistory,
  loading,
  renewing,
  onConfirm,
  onRenew,
  onBack
}) => {
  if (!loanDetails) {
    return (
      <div className="alert alert-danger text-center">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Erro: Detalhes do empréstimo não encontrados
      </div>
    );
  }

  const isOverdue = loanDetails['overdue?'] || false;
  const daysOverdue = isOverdue ? calculateDaysOverdue(loanDetails.due_date) : 0;
  const canRenew = !isOverdue && loanDetails.renewals_count < 3; // Exemplo: máximo 3 renovações

  return (
    <div>
      <h6 className="fw-semibold mb-3 text-success">
        <i className="bi bi-check-circle me-1"></i>
        Confirmação de Devolução
      </h6>
      
      {/* Informações do Livro */}
      <div className="card mb-3">
        <div className="card-body">
          <h6 className="card-title">
            <i className="bi bi-book me-2"></i>
            Informações do Livro
          </h6>
          <div className="row">
            <div className="col-md-6">
              <strong>Título:</strong><br />
              {book.title}
            </div>
            <div className="col-md-6">
              <strong>Autor:</strong><br />
              {book.author}
            </div>
            <div className="col-md-6 mt-2">
              <strong>Cópia:</strong><br />
              Edição {selectedCopy?.edition} - Nº {selectedCopy?.number}
            </div>
            <div className="col-md-6 mt-2">
              <strong>Status:</strong><br />
              <span className={`badge ${isOverdue ? 'bg-danger' : 'bg-warning'}`}>
                {isOverdue ? 'ATRASADO' : 'EM EMPRÉSTIMO'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informações do Empréstimo */}
      <div className="card mb-3">
        <div className="card-body">
          <h6 className="card-title">
            <i className="bi bi-file-text me-2"></i>
            Detalhes do Empréstimo
          </h6>
          <div className="row">
            <div className="col-md-6">
              <strong>ID do Empréstimo:</strong><br />
              #{loanDetails.id}
            </div>
            <div className="col-md-6">
              <strong>Data do Empréstimo:</strong><br />
              {formatDate(loanDetails.loan_date)}
            </div>
            <div className="col-md-6 mt-2">
              <strong>Data de Vencimento:</strong><br />
              <span className={isOverdue ? 'text-danger fw-bold' : ''}>
                {formatDate(loanDetails.due_date)}
                {isOverdue && ` (${daysOverdue} dia(s) atrasado)`}
              </span>
            </div>
            <div className="col-md-6 mt-2">
              <strong>Renovações:</strong><br />
              {loanDetails.renewals_count || 0} / 3
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
              <strong>Renovação Disponível:</strong><br />
              {canRenew ? (
                <span className="badge bg-info">Sim</span>
              ) : (
                <span className="badge bg-secondary">Não</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informações do Leitor */}
      <div className="card mb-3">
        <div className="card-body">
          <h6 className="card-title">
            <i className="bi bi-person me-2"></i>
            Informações do Leitor
          </h6>
          <div className="row">
            <div className="col-md-6">
              <strong>Nome:</strong><br />
              {loanDetails.client.fullName}
            </div>
            <div className="col-md-6">
              <strong>CPF:</strong><br />
              {loanDetails.client.cpf || 'Não informado'}
            </div>
            <div className="col-md-6 mt-2">
              <strong>ID do Cliente:</strong><br />
              #{loanDetails.client.id}
            </div>
            {loanDetails.client.email && (
              <div className="col-md-6 mt-2">
                <strong>Email:</strong><br />
                {loanDetails.client.email}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="card mb-3">
        <div className="card-body">
          <h6 className="card-title">
            <i className="bi bi-lightning me-2"></i>
            Ações Disponíveis
          </h6>
          <div className="d-grid gap-2">
            <button 
              className="btn btn-success" 
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" />
              ) : (
                <i className="bi bi-check-lg me-2"></i>
              )}
              Confirmar Devolução
            </button>
            
            {canRenew && (
              <button 
                className="btn btn-info text-white" 
                onClick={onRenew}
                disabled={renewing || loading}
              >
                {renewing ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <i className="bi bi-arrow-clockwise me-2"></i>
                )}
                Renovar Empréstimo
              </button>
            )}
          </div>
          
          {!canRenew && (
            <div className="alert alert-warning mt-2 mb-0">
              <small>
                <i className="bi bi-info-circle me-1"></i>
                {isOverdue 
                  ? 'Empréstimo em atraso não pode ser renovado. Realize a devolução.'
                  : 'Limite de renovações atingido (máximo 3 renovações).'
                }
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Alerta de Confirmação */}
      <div className={`alert ${isOverdue ? 'alert-danger' : 'alert-warning'}`}>
        <i className={`bi ${isOverdue ? 'bi-exclamation-triangle' : 'bi-info-circle'} me-2`}></i>
        {isOverdue 
          ? `ATENÇÃO: Esta devolução está ${daysOverdue} dia(s) atrasada.`
          : 'Confirme os dados antes de registrar a devolução ou renove o empréstimo.'
        }
      </div>

      {/* Botão Voltar */}
      <div className="d-flex justify-content-between">
        <button 
          className="btn btn-outline-secondary" 
          onClick={onBack}
          disabled={loading || renewing}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Voltar para Seleção
        </button>
        
        <div className="text-muted">
          <small>
            <i className="bi bi-info-circle me-1"></i>
            Selecione uma ação acima
          </small>
        </div>
      </div>
    </div>
  );
};
