const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface DashboardSummary {
  total_books: number;
  total_clients: number;
  total_loans: number;
  total_categories: number;
  total_copies: number;
  active_loans: number;
  returned_loans: number;
  overdue_loans: number;
  available_copies: number;
  borrowed_copies: number;
  lost_copies: number;
}

export interface LoansByMonth {
  [yyyy_mm: string]: number;
}

export interface BooksByCategory {
  category: string;
  books_count: number;
}

export interface ActiveLoansPerClient {
  client: string;
  active_loans: number;
}

export interface AvailableByBook {
  title: string;
  available_copies: number;
}

export interface RecentActivity {
  id: number;
  client_name: string;
  book_title: string;
  time: string;
}

export interface Alert {
  id: number;
  message: string;
  icon: string;
}

export interface OverdueLoanDetail {
  id: number;
  client_name: string;
  book_title: string;
  due_date: string;
  days_overdue: number;
}

export interface TodayDueLoanDetail {
  id: number;
  client_name: string;
  book_title: string;
  due_date: string;
}

// Funções para buscar dados do dashboard
export const apiGetDashboardSummary = async (token: string): Promise<DashboardSummary> => {
  const response = await fetch(`${API_URL}/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Erro ao buscar estatísticas do dashboard");
  return response.json();
};

export const apiGetRecentActivities = async (token: string): Promise<RecentActivity[]> => {
  const response = await fetch(`${API_URL}/dashboard/recent_activities`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  });
  if (!response.ok) throw new Error("Erro ao buscar atividades recentes");
  return response.json();
};

export const apiGetLoansByMonth = async (token: string): Promise<LoansByMonth> => {
  const response = await fetch(`${API_URL}/dashboard/loans_by_month`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Erro ao buscar empréstimos por mês");
  return response.json();
};

export const apiGetBooksByCategory = async (token: string): Promise<BooksByCategory[]> => {
  const response = await fetch(`${API_URL}/dashboard/books_by_category`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Erro ao buscar livros por categoria");
  return response.json();
};

export const apiGetActiveLoansPerClient = async (token: string): Promise<ActiveLoansPerClient[]> => {
  const response = await fetch(`${API_URL}/dashboard/active_loans_per_client`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Erro ao buscar empréstimos ativos por cliente");
  return response.json();
};

export const apiGetAvailableByBook = async (token: string): Promise<AvailableByBook[]> => {
  const response = await fetch(`${API_URL}/dashboard/available_by_book`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Erro ao buscar cópias disponíveis por livro");
  return response.json();
};

// Novas funções para alertas
export const apiGetTodayAlerts = async (token: string): Promise<Alert[]> => {
  const response = await fetch(`${API_URL}/dashboard/today_alerts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Erro ao buscar alertas do dia");
  return response.json();
};

export const apiGetOverdueLoansDetail = async (token: string): Promise<OverdueLoanDetail[]> => {
  const response = await fetch(`${API_URL}/dashboard/overdue_loans_detail`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Erro ao buscar detalhes de empréstimos em atraso");
  return response.json();
};

export const apiGetTodayDueLoansDetail = async (token: string): Promise<TodayDueLoanDetail[]> => {
  const response = await fetch(`${API_URL}/dashboard/today_due_loans_detail`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Erro ao buscar detalhes de empréstimos que vencem hoje");
  return response.json();
};