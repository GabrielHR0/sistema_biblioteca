import React, { useState, useEffect } from "react";
import { BaseLayout } from "@layouts/BaseLayout";
import { useAuth } from "../auth/authContext";
import {
  apiReportSummary,
  apiLoansByMonth,
  apiBooksCategory,
  apiActiveClientLoans,
  apiTodayAlerts,
  apiOverdueLoansDetail,
  ReportSummary,
  LoansByMonth,
  BooksCategory,
  ClientLoans,
  Alert,
  LoanDetail,
} from "./ReportsService";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const ReportsPage: React.FC<{userName: string, isAdmin: boolean}> = ({
  userName,
  isAdmin
}) => {
  const { token } = useAuth();

  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loansByMonth, setLoansByMonth] = useState<LoansByMonth>({});
  const [booksCategory, setBooksCategory] = useState<BooksCategory[]>([]);
  const [activeClientLoans, setActiveClientLoans] = useState<ClientLoans[]>([]);
  const [overdueLoans, setOverdueLoans] = useState<LoanDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      apiReportSummary(token),
      apiTodayAlerts(token),
      apiLoansByMonth(token),
      apiBooksCategory(token),
      apiActiveClientLoans(token),
      apiOverdueLoansDetail(token),
    ])
      .then(
        ([
          sum,
          alerts,
          loansMonth,
          booksCat,
          activeClients,
          overdue,
        ]) => {
          setSummary(sum);
          setAlerts(alerts);
          setLoansByMonth(loansMonth);
          setBooksCategory(booksCat);
          setActiveClientLoans(activeClients);
          setOverdueLoans(overdue);
          setError(null);
        }
      )
      .catch(() => setError("Erro ao carregar os relatórios"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading)
    return (
      <BaseLayout userName={userName} isAdmin={isAdmin}>
        <div className="text-center p-5">Carregando relatórios...</div>
      </BaseLayout>
    );
  if (error)
    return (
      <BaseLayout userName="" isAdmin>
        <div className="alert alert-danger p-3">{error}</div>
      </BaseLayout>
    );

  // Preparar dados para gráficos
  const loanMonthsLabels = Object.keys(loansByMonth);
  const loanMonthsData = Object.values(loansByMonth);

  const loansByMonthData = {
    labels: loanMonthsLabels,
    datasets: [
      {
        label: "Empréstimos por Mês",
        data: loanMonthsData,
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderRadius: 5,
      },
    ],
  };

  const loansByMonthOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Empréstimos por Mês" },
    },
    scales: { y: { beginAtZero: true } },
  };

  const booksCategoryLabels = booksCategory.map((b) => b.category);
  const booksCategoryDataValues = booksCategory.map((b) => b.books_count);

  const booksCategoryData = {
    labels: booksCategoryLabels,
    datasets: [
      {
        label: "Livros por Categoria",
        data: booksCategoryDataValues,
        backgroundColor: [
          "#36a2eb",
          "#ff6384",
          "#ff9f40",
          "#4bc0c0",
          "#9966ff",
          "#c9cbcf",
          "#ffcd56",
          "#fd6b19",
          "#8fd9a8",
          "#a8d6e6",
        ],
      },
    ],
  };

  const booksCategoryOptions: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: { position: "right" },
      title: { display: true, text: "Livros por Categoria" },
    },
  };

  return (
    <BaseLayout userName="" isAdmin>
      <div className="container py-4">
        <h2 className="mb-4">Relatórios do Sistema</h2>

        {/* Resumo Geral */}
        {summary && (
          <section className="mb-4">
            <h4>Resumo Geral</h4>
            <div className="row g-3">
              {[
                { label: "Livros", value: summary.total_books },
                { label: "Clientes", value: summary.total_clients },
                { label: "Empréstimos", value: summary.total_loans },
                { label: "Categorias", value: summary.total_categories },
                { label: "Cópias Disponíveis", value: summary.available_copies },
                { label: "Empréstimos Ativos", value: summary.active_loans },
                { label: "Empréstimos Atrasados", value: summary.overdue_loans },
              ].map(({ label, value }) => (
                <div className="col-6 col-md-3" key={label}>
                  <div className="border rounded p-3 text-center shadow-sm h-100 d-flex flex-column justify-content-center">
                    <h5 className="mb-0">{value}</h5>
                    <small className="text-muted">{label}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Alertas */}
        <section className="mb-4">
          <h4>Alertas de Hoje</h4>
          {alerts.length === 0 ? (
            <p>Sem alertas</p>
          ) : (
            <ul className="list-group shadow">
              {alerts.map((alert) => (
                <li key={alert.id} className="list-group-item d-flex align-items-center">
                  <i className={`bi ${alert.icon} me-3 fs-4 text-warning`}></i> {alert.message}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Gráficos */}
        <section className="row g-4 mb-4">
          <div className="col-lg-6">
            <Bar options={loansByMonthOptions} data={loansByMonthData} />
          </div>
          <div className="col-lg-6">
            <Pie options={booksCategoryOptions} data={booksCategoryData} />
          </div>
        </section>

        {/* Empréstimos Ativos por Cliente */}
        <section className="mb-4">
          <h4>Empréstimos Ativos por Cliente</h4>
          {activeClientLoans.length === 0 ? (
            <p>Nenhum empréstimo ativo.</p>
          ) : (
            <ul className="list-group shadow">
              {activeClientLoans.map((client) => (
                <li
                  key={client.client}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {client.client}
                  <span className="badge bg-primary rounded-pill">{client.active_loans}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Empréstimos Atrasados Detalhes */}
        <section>
          <h4>Empréstimos Atrasados Detalhes</h4>
          {overdueLoans.length === 0 ? (
            <p>Não há empréstimos atrasados</p>
          ) : (
            <div className="table-responsive shadow">
              <table className="table table-striped">
                <thead className="table-light">
                  <tr>
                    <th>Cliente</th>
                    <th>Livro</th>
                    <th>Data de Vencimento</th>
                    <th>Dias Atrasados</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueLoans.map((loan) => (
                    <tr key={loan.id}>
                      <td>{loan.client_name}</td>
                      <td>{loan.book_title}</td>
                      <td>{new Date(loan.due_date).toLocaleDateString()}</td>
                      <td>{loan.days_overdue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </BaseLayout>
  );
};
