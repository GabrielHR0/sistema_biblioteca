import React, { useState, useEffect } from "react";
import { BaseLayout } from "@layouts/BaseLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";

import {
  apiGetDashboardSummary,
  apiGetRecentActivities,
  apiGetTodayAlerts,
  DashboardSummary,
  RecentActivity,
  Alert
} from "./DashboardService";

interface AdminDashboardProps {
  userName: string;
  isAdmin: boolean;
}

interface DashboardStats {
  totalBooks: number;
  activeClients: number;
  activeLoans: number;
  overdueLoans: number;
}

interface ProcessedActivity {
  id: number;
  client_name: string;
  book_title: string;
  time: string;
  description: string;
  icon: string;
  color: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userName, isAdmin }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    activeClients: 0,
    activeLoans: 0,
    overdueLoans: 0
  });

  const [recentActivities, setRecentActivities] = useState<ProcessedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do modal de cliente
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClient, setNewClient] = useState({
    fullName: "",
    email: "",
    cpf: "",
    phone: ""
  });

  // Verificar se deve abrir modal via query parameter
  useEffect(() => {
    const modalType = searchParams.get('modal');
    if (modalType === 'cliente') {
      setShowClientModal(true);
      // Limpar query parameter
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, navigate]);

  // Função para processar as atividades e adicionar icon, color e description
  const processActivities = (activities: RecentActivity[]): ProcessedActivity[] => {
    return activities.map(activity => {
      // Determinar se é empréstimo ou devolução baseado no ID
      const isReturn = activity.id < 0;
      
      return {
        ...activity,
        description: isReturn 
          ? `Devolveu "${activity.book_title}"`
          : `Levou "${activity.book_title}"`,
        icon: isReturn ? "bi-arrow-return-left" : "bi-book",
        color: isReturn ? "#059669" : "#2563eb"
      };
    });
  };

  // Buscar estatísticas, atividades e alertas do backend
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      apiGetDashboardSummary(token),
      apiGetRecentActivities(token),
      apiGetTodayAlerts(token)
    ])
      .then(([summary, activities, todayAlerts]) => {
        setStats({
          totalBooks: summary.total_books,
          activeClients: summary.total_clients,
          activeLoans: summary.active_loans,
          overdueLoans: summary.overdue_loans // Usando o valor direto do backend
        });
        
        const processedActivities = processActivities(activities);
        setRecentActivities(processedActivities);
        setAlerts(todayAlerts);
      })
      .catch(() => alert("Erro ao carregar dados do dashboard"))
      .finally(() => setLoading(false));
  }, [token]);

  // Função para limitar a exibição do nome do cliente
  const truncateName = (name: string, maxLength: number = 38): string => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  const statsCards = [
    { 
      title: "Livros", 
      value: stats.totalBooks, 
      description: "Total no acervo",
      color: "#2563eb",
      icon: "bi-journal-bookmark"
    },
    { 
      title: "Clientes", 
      value: stats.activeClients, 
      description: "Cadastrados",
      color: "#059669",
      icon: "bi-people"
    },
    { 
      title: "Empréstimos", 
      value: stats.activeLoans, 
      description: "Ativos",
      color: "#0891b2",
      icon: "bi-book"
    },
    { 
      title: "Em Atraso", 
      value: stats.overdueLoans, 
      description: "Vencidos",
      color: "#dc2626",
      icon: "bi-exclamation-triangle"
    },
  ];

  const quickActions = [
    {
      title: "Empréstimos",
      icon: "bi-plus-circle",
      color: "#2563eb",
      action: () => navigate("/emprestimos")
    },
    {
      title: "Cadastrar Cliente",
      icon: "bi-person-plus", 
      color: "#0891b2",
      action: () => navigate("/membros?modal=cliente") 
    },
    {
      title: "Adicionar Livro",
      icon: "bi-journal-plus",
      color: "#d97706",
      action: () => navigate("/livros?modal=livro")
    },
    {
      title: "Buscar Catálogo",
      icon: "bi-search",
      color: "#64748b",
      action: () => navigate("/livros")
    },
  ];

  // -------------------- CRIAR NOVO CLIENTE --------------------
  const handleCreateClient = async () => {
    if (!token) return;
    
    if (!newClient.fullName.trim()) {
      alert("O nome completo é obrigatório");
      return;
    }

    setLoading(true);
    try {
      // Aqui iria chamada real da API para criar cliente
      console.log("Cliente criado:", newClient);
      
      alert("Cliente criado com sucesso!");
      setShowClientModal(false);
      setNewClient({ fullName: "", email: "", cpf: "", phone: "" });

      // Atualizar estatísticas localmente
      setStats(prev => ({ ...prev, activeClients: prev.activeClients + 1 }));
    } catch (err: any) {
      console.error("Erro ao criar cliente:", err);
      alert(err.message || "Erro ao criar cliente");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BaseLayout userName={userName} isAdmin={isAdmin}>
        <div className="container-fluid p-4">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-3">Carregando dashboard...</p>
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout userName={userName} isAdmin={isAdmin}>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1 fw-bold">
              <i className="bi bi-house me-2"></i>
              Dashboard
            </h2>
            <p className="text-muted mb-0">Bem-vindo, {userName}!</p>
          </div>
          <div className="text-muted">
            <i className="bi bi-calendar3 me-1"></i>
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="row g-4 mb-4">
          {statsCards.map((stat, index) => (
            <div key={index} className="col-12 col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex align-items-center">
                  <div 
                    className="rounded-circle p-3 me-3 text-white d-flex align-items-center justify-content-center"
                    style={{ 
                      backgroundColor: stat.color,
                      width: '60px',
                      height: '60px'
                    }}
                  >
                    <i className={`${stat.icon} fs-4`}></i>
                  </div>
                  <div>
                    <h6 className="text-muted mb-1 small">{stat.title}</h6>
                    <h3 className="mb-0 fw-bold">{stat.value.toLocaleString()}</h3>
                    <small className="text-muted">{stat.description}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ações Rápidas */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom-0">
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-lightning me-2"></i>
              Ações Rápidas
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              {quickActions.map((action, index) => (
                <div key={index} className="col-12 col-md-4 col-sm-6 col-lg-3">
                  <button
                    className="btn w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 border-0 shadow-sm"
                    style={{ 
                      backgroundColor: action.color,
                      color: 'white',
                      minHeight: '100px',
                      borderRadius: '8px'
                    }}
                    onClick={action.action}
                    disabled={loading}
                  >
                    <i className={`${action.icon} fs-3 mb-2`}></i>
                    <small className="text-center" style={{ fontSize: '0.8rem' }}>
                      {action.title}
                    </small>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alertas e Atividades */}
        <div className="row g-4">
          {/* Alertas */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-bottom-0">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Alertas de Hoje
                </h5>
              </div>
              <div className="card-body">
                {alerts.length === 0 ? (
                  <p className="text-muted">Nenhum alerta para hoje.</p>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="alert alert-warning mb-2 py-2">
                      <i className={`${alert.icon} me-2`}></i>
                      {alert.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Atividades Recentes dinâmicas - AJUSTADO */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-bottom-0">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-clock-history me-2"></i>
                  Atividades Recentes
                </h5>
              </div>
              <div className="card-body">
                {recentActivities.length === 0 ? (
                  <p className="text-muted">Nenhuma atividade recente.</p>
                ) : (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="d-flex align-items-start mb-3">
                      <div 
                        className="rounded-circle p-2 me-3 text-white d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ 
                          backgroundColor: activity.color,
                          width: '40px',
                          height: '40px'
                        }}
                      >
                        <i className={`${activity.icon} small`}></i>
                      </div>
                      <div className="flex-grow-1">
                        {/* Nome do cliente com limite de exibição e tooltip */}
                        <h6 
                          className="mb-1 fw-semibold small"
                          title={activity.client_name} 
                        >
                          {truncateName(activity.client_name)}
                        </h6>
                        {/* Descrição da atividade */}
                        <span className="small text-muted">
                          {activity.description}
                        </span>
                      </div>
                      <small className="text-muted flex-shrink-0 ms-2">
                        {activity.time}
                      </small>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Links Rápidos */}
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-header bg-white border-bottom-0">
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-link-45deg me-2"></i>
              Acesso Rápido
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <button
                  className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-start p-3"
                  onClick={() => navigate('/relatorios')}
                >
                  <i className="bi bi-bar-chart me-3 fs-5"></i>
                  <div className="text-start">
                    <div className="fw-semibold">Relatórios</div>
                    <small className="text-muted">Estatísticas detalhadas</small>
                  </div>
                </button>
              </div>
              <div className="col-12 col-md-4">
                <button
                  className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-start p-3"
                  onClick={() => navigate('/configuracoes')}
                >
                  <i className="bi bi-gear me-3 fs-5"></i>
                  <div className="text-start">
                    <div className="fw-semibold">Configurações</div>
                    <small className="text-muted">Ajustes do sistema</small>
                  </div>
                </button>
              </div>
              <div className="col-12 col-md-4">
                <button
                  className="btn btn-outline-info w-100 d-flex align-items-center justify-content-start p-3"
                  onClick={() => navigate('/livros')}
                >
                  <i className="bi bi-list-ul me-3 fs-5"></i>
                  <div className="text-start">
                    <div className="fw-semibold">Catálogo</div>
                    <small className="text-muted">Ver todos os livros</small>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Cadastrar Cliente */}
      {showClientModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-person-plus me-2"></i>
                  Novo Cliente
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowClientModal(false)}
                  disabled={loading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nome Completo *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newClient.fullName}
                    onChange={(e) => setNewClient({...newClient, fullName: e.target.value})}
                    disabled={loading}
                    placeholder="Digite o nome completo"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    disabled={loading}
                    placeholder="Digite o email"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">CPF</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newClient.cpf}
                    onChange={(e) => setNewClient({...newClient, cpf: e.target.value})}
                    disabled={loading}
                    placeholder="Digite o CPF"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Telefone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    disabled={loading}
                    placeholder="Digite o telefone"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowClientModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleCreateClient}
                  disabled={loading || !newClient.fullName.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Criando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Criar Cliente
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </BaseLayout>
  );
};