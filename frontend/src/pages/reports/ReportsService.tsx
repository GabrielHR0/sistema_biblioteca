const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface LoansByMonth {
  [key: string]: number;
}

export interface BooksCategory {
  category: string;
  books_count: number;
}

export interface ClientLoans {
  client: string;
  active_loans: number;
}

export interface BookAvailability {
  title: string;
  available_copies: number;
}

export interface Activity {
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

export interface LoanDetail {
  id: number;
  client_name: string;
  book_title: string;
  due_date: string;
  days_overdue?: number;
  days_until?: number;
}

export interface ReportSummary {
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

async function fetchJson<T>(endpoint: string, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Erro ao buscar ${endpoint}`);
  return res.json();
}

export const apiReportSummary = (token: string) =>
  fetchJson<ReportSummary>("/dashboard", token);

export const apiLoansByMonth = (token: string) =>
  fetchJson<LoansByMonth>("/dashboard/loans_month", token);

export const apiBooksCategory = (token: string) =>
  fetchJson<BooksCategory[]>("/dashboard/books_category", token);

export const apiActiveClientLoans = (token: string) =>
  fetchJson<ClientLoans[]>("/dashboard/active_loans_per_client", token);

export const apiBookAvailability = (token: string) =>
  fetchJson<BookAvailability[]>("/dashboard/available_books", token);

export const apiRecentActivities = (token: string) =>
  fetchJson<Activity[]>("/dashboard/recent_activities", token);

export const apiTodayAlerts = (token: string) =>
  fetchJson<Alert[]>("/dashboard/today_alerts", token);

export const apiOverdueLoansDetail = (token: string) =>
  fetchJson<LoanDetail[]>("/dashboard/overdue_loans_detail", token);

export const apiTodayDueLoansDetail = (token: string) =>
  fetchJson<LoanDetail[]>("/dashboard/today_due_loans_detail", token);

export const apiActiveLoansDetail = (token: string) =>
  fetchJson<LoanDetail[]>("/dashboard/active_loans_detail", token);

export const apiBooksRegistered = (token: string) =>
  fetchJson<LoansByMonth>("/dashboard/books_registered", token);

export const apiTopClientsLoans = (token: string) =>
  fetchJson<ClientLoans[]>("/dashboard/top_clients_loans", token);
