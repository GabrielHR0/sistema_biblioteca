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

interface PublicDashboardProps {
  userName: string;
  isAdmin: boolean;
}

interface DashboardStats {
  totalBooks: number;
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

export const PublicDashboard: React.FC<PublicDashboardProps> = ({ userName, isAdmin }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    activeLoans: 0,
    overdueLoans: 0
  });

  const [recentActivities, setRecentActivities] = useState<ProcessedActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Verificar se deve abrir modal via query parameter
  useEffect(() => {
    const modalType = searchParams.get('modal');
    // Limpar query parameter se houver
    if (modalType) {
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
          activeLoans: summary.active_loans,
          overdueLoans: summary.overdue_loans
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
      title: "Livros Disponíveis", 
      value: stats.totalBooks, 
      description: "No acervo",
      color: "#2563eb",
      icon: "bi-journal-bookmark"
    },
    { 
      title: "Meus Empréstimos", 
      value: stats.activeLoans, 
      description: "Ativos",
      color: "#0891b2",
      icon: "bi-book"
    },
    { 
      title: "Em Atraso", 
      value: stats.overdueLoans, 
      description: "Precisa devolver",
      color: "#dc2626",
      icon: "bi-exclamation-triangle"
    },
  ];

  const quickActions = [
    {
      title: "Buscar Livros",
      icon: "bi-search",
      color: "#2563eb",
      action: () => navigate("/livros")
    },
    {
      title: "Meus Empréstimos",
      icon: "bi-list-ul", 
      color: "#059669",
      action: () => navigate("/meus-emprestimos")
    },
    {
      title: "Histórico",
      icon: "bi-clock-history",
      color: "#d97706",
      action: () => navigate("/historico")
    },
    {
      title: "Perfil",
      icon: "bi-person",
      color: "#64748b",
      action: () => navigate("/perfil")
    },
  ];

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
              Minha Biblioteca
            </h2>
            <p className="text-muted mb-0">Olá, {userName}!</p>
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
            <div key={index} className="col-12 col-sm-6 col-lg-4">
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
          {/* Meus Alertas */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-bottom-0">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-bell me-2"></i>
                  Meus Alertas
                </h5>
              </div>
              <div className="card-body">
                {alerts.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-check-circle display-4 text-success mb-3"></i>
                    <p className="mb-0">Tudo em dia! Nenhum alerta para hoje.</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="alert alert-warning mb-2 py-2 d-flex align-items-center">
                      <i className={`${alert.icon} me-2`}></i>
                      <span className="small">{alert.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Minhas Atividades Recentes */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-bottom-0">
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-clock-history me-2"></i>
                  Minhas Atividades
                </h5>
              </div>
              <div className="card-body">
                {recentActivities.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-inbox display-4 text-muted mb-3"></i>
                    <p className="mb-0">Nenhuma atividade recente.</p>
                    <small>Seus empréstimos aparecerão aqui</small>
                  </div>
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
                        <h6 className="mb-1 fw-semibold small">
                          {truncateName(activity.client_name)}
                        </h6>
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

        {/* Links Rápidos - Versão Pública */}
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-header bg-white border-bottom-0">
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-link-45deg me-2"></i>
              Explorar Biblioteca
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <button
                  className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-start p-3"
                  onClick={() => navigate('/livros')}
                >
                  <i className="bi bi-search me-3 fs-5"></i>
                  <div className="text-start">
                    <div className="fw-semibold">Buscar Livros</div>
                    <small className="text-muted">Explorar catálogo</small>
                  </div>
                </button>
              </div>
              <div className="col-12 col-md-4">
                <button
                  className="btn btn-outline-success w-100 d-flex align-items-center justify-content-start p-3"
                  onClick={() => navigate('/meus-emprestimos')}
                >
                  <i className="bi bi-book me-3 fs-5"></i>
                  <div className="text-start">
                    <div className="fw-semibold">Meus Empréstimos</div>
                    <small className="text-muted">Ver livros atuais</small>
                  </div>
                </button>
              </div>
              <div className="col-12 col-md-4">
                <button
                  className="btn btn-outline-info w-100 d-flex align-items-center justify-content-start p-3"
                  onClick={() => navigate('/perfil')}
                >
                  <i className="bi bi-person me-3 fs-5"></i>
                  <div className="text-start">
                    <div className="fw-semibold">Meu Perfil</div>
                    <small className="text-muted">Dados pessoais</small>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Destaques */}
        <div className="card border-0 shadow-sm mt-4 bg-light">
          <div className="card-body text-center py-5">
            <i className="bi bi-book text-primary display-4 mb-3"></i>
            <h4 className="fw-bold mb-3">Biblioteca Online</h4>
            <p className="text-muted mb-4">
              Explore nosso acervo de livros e gerencie seus empréstimos de forma simples e prática.
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/livros')}
            >
              <i className="bi bi-search me-2"></i>
              Começar a Explorar
            </button>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};