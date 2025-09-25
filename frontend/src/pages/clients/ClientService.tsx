const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface Client {
  id?: number;
  fullName: string;
  cpf: string;
  phone?: string;
  email?: string;
  created_at?: string | any;
}

interface Loan {
  id: number;
  bookTitle: string;
  dueDate: string;
  returnedAt?: string | null;
  status: "active" | "returned";
}

export const apiGetClients = async (token: string) => {
  const response = await fetch(`${API_URL}/clients`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Erro ao buscar membros");
  return response.json();
};

export async function loginClient(login: string, password: string) {
  const response = await fetch(`${API_URL}/clients/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password })
  })

  if (!response.ok) throw new Error("Falha no login")

  return response.json()
}

export async function createClient(client: Client): Promise<Client> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(client),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.errors?.join(", ") || "Erro ao criar membro");
  }

  return res.json();
}

export async function checkClientPassword(token: string, password: string, id: number) {
  const response = await fetch(`${API_URL}/clients/check_password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ password, id })
  })

  return response.json()
}

export async function apiGetClientById(id: number, token: string): Promise<Client> {
  const res = await fetch(`${API_URL}/clients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Erro ao buscar cliente");
  return res.json();
}

export async function apiGetLoansByClient(id: number, token: string): Promise<Loan[]> {
  const res = await fetch(`${API_URL}/clients/${id}/loans`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Erro ao buscar empréstimos");
  return res.json();
}


