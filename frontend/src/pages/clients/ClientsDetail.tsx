import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BaseLayout } from "@layouts/BaseLayout";
import { useAuth } from "../auth/authContext";
import { Client } from "./ClientService";
import { apiGetClientById, apiGetLoansByClient } from "./ClientService";
import "bootstrap/dist/css/bootstrap.min.css";
import dayjs from "dayjs";

interface Loan {
  id: number;
  bookTitle: string;
  dueDate: string;
  returnedAt?: string | null;
  status: "active" | "returned" | "overdue";
  daysOverdue?: number;
}

export const MemberDetailsPage: React.FC<{ userName: string; isAdmin: boolean }> = ({
  userName,
  isAdmin,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateLoanStatus = (dueDate: string, returnedAt?: string | null): "active" | "returned" | "overdue" => {
    if (returnedAt) return "returned";
    
    const today = dayjs();
    const due = dayjs(dueDate);
    
    if (today.isAfter(due, 'day')) {
      return "overdue";
    }
    
    return "active";
  };

  const calculateDaysOverdue = (dueDate: string): number => {
    const today = dayjs();
    const due = dayjs(dueDate);
    return Math.max(0, today.diff(due, 'day'));
  };

  const fetchData = async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const clientData = await apiGetClientById(Number(id), token);
      setClient(clientData);

      const clientLoansRaw = await apiGetLoansByClient(Number(id), token);

      // Transformar dados da API para o formato do front-end
      const clientLoans: Loan[] = clientLoansRaw.map((loan: any) => {
        const status = calculateLoanStatus(loan.due_date, loan.status === "returned" ? loan.return_date || null : null);
        
        return {
          id: loan.id,
          bookTitle: loan.copy.book.title,
          dueDate: loan.due_date,
          returnedAt: loan.status === "returned" ? loan.return_date || null : null,
          status: status,
          daysOverdue: status === "overdue" ? calculateDaysOverdue(loan.due_date) : undefined,
        };
      });

      setLoans(clientLoans);
    } catch (err: any) {
      console.error("Erro ao carregar detalhes do membro:", err);
      alert(err.message || "Erro ao carregar detalhes do membro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-3 text-muted">Carregando detalhes do membro...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center mt-5">
        <h4 className="text-danger">Membro não encontrado</h4>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/members")}>
          Voltar
        </button>
      </div>
    );
  }

  const overdueLoans = loans.filter((l) => l.status === "overdue");
  const activeLoans = loans.filter((l) => l.status === "active");
  const pastLoans = loans.filter((l) => l.status === "returned");

  return (
    <BaseLayout userName={userName} isAdmin={isAdmin}>
      <div className="container py-4">
        {/* Header */}
        <div className="mb-4">
          <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2"></i>Voltar
          </button>
          <h2 className="mb-2">
            <i className="bi bi-person-circle me-2"></i>
            Detalhes do Membro
          </h2>
          <p className="text-muted">Informações e histórico de empréstimos</p>
        </div>

        {/* Dados do Membro */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title">
              <i className="bi bi-info-circle me-2"></i>Informações Pessoais
            </h5>
            <div className="row">
              <div className="col-md-6 mb-3">
                <strong>Nome:</strong>
                <p className="mb-0">{client.fullName}</p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Email:</strong>
                <p className="mb-0">{client.email || "Não informado"}</p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>CPF:</strong>
                <p className="mb-0">{client.cpf}</p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Telefone:</strong>
                <p className="mb-0">{client.phone || "Não informado"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Empréstimos Atrasados - DESTAQUE */}
        {overdueLoans.length > 0 && (
          <div className="mb-4">
            <div className="d-flex align-items-center mb-3">
              <h4 className="mb-0 text-danger">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>Empréstimos Atrasados
              </h4>
              <span className="badge bg-danger ms-2 fs-6">{overdueLoans.length}</span>
            </div>
            
            <div className="alert alert-danger border-danger">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-octagon-fill me-2 fs-5"></i>
                <strong>Atenção: {overdueLoans.length} empréstimo(s) em atraso</strong>
              </div>
            </div>

            <div className="row g-3">
              {overdueLoans.map((loan) => (
                <div key={loan.id} className="col-md-6 col-lg-4">
                  <div className="card border-danger shadow-lg h-100">
                    <div className="card-header bg-danger text-white">
                      <h6 className="mb-0">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        ATRASADO
                      </h6>
                    </div>
                    <div className="card-body">
                      <h6 className="card-title text-danger">
                        <i className="bi bi-book me-2"></i>
                        {loan.bookTitle}
                      </h6>
                      <div className="mb-2">
                        <strong>Data de vencimento:</strong>
                        <p className="mb-1 text-danger fw-bold">
                          {dayjs(loan.dueDate).format("DD/MM/YYYY")}
                        </p>
                      </div>
                      <div className="mb-2">
                        <strong>Dias em atraso:</strong>
                        <p className="mb-1 text-danger fw-bold">
                          {loan.daysOverdue} {loan.daysOverdue === 1 ? 'dia' : 'dias'}
                        </p>
                      </div>
                      <div className="alert alert-danger py-1 mb-0">
                        <small>
                          <i className="bi bi-info-circle me-1"></i>
                          Entre em contato com o membro
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empréstimos Ativos */}
        <div className="mb-4">
          <h4 className="mb-3">
            <i className="bi bi-book-half me-2"></i>Empréstimos Ativos
          </h4>
          {activeLoans.length > 0 ? (
            <div className="row g-3">
              {activeLoans.map((loan) => (
                <div key={loan.id} className="col-md-6 col-lg-4">
                  <div className="card border-warning shadow-sm h-100">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-book me-2 text-warning"></i>
                        {loan.bookTitle}
                      </h6>
                      <p className="mb-1">
                        <strong>Devolução até:</strong>{" "}
                        {dayjs(loan.dueDate).format("DD/MM/YYYY")}
                      </p>
                      <span className="badge bg-warning text-dark">
                        <i className="bi bi-hourglass-split me-1"></i>Em andamento
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">Nenhum empréstimo em andamento</p>
          )}
        </div>

        {/* Histórico de Empréstimos */}
        <div>
          <h4 className="mb-3">
            <i className="bi bi-clock-history me-2"></i>Histórico de Empréstimos
          </h4>
          {pastLoans.length > 0 ? (
            <div className="row g-3">
              {pastLoans.map((loan) => (
                <div key={loan.id} className="col-md-6 col-lg-4">
                  <div className="card border-secondary shadow-sm h-100">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-book me-2 text-secondary"></i>
                        {loan.bookTitle}
                      </h6>
                      <p className="mb-1">
                        <strong>Devolvido em:</strong>{" "}
                        {loan.returnedAt
                          ? dayjs(loan.returnedAt).format("DD/MM/YYYY")
                          : "Data não registrada"}
                      </p>
                      <span className="badge bg-success">
                        <i className="bi bi-check-circle me-1"></i>Devolvido
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">Nenhum empréstimo anterior</p>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};