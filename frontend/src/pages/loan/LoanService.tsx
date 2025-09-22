const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const LoanService = {
  async searchBooks(query: string) {
    const token = localStorage.getItem("token");
    console.log(query);
    const res = await fetch(`${API_URL}/books?search=${encodeURIComponent(query)}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Erro ao buscar livros");
    }
    return await res.json();
  },

  async searchClient(query: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/clients?search=${encodeURIComponent(query)}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Erro ao buscar clientes");
    }
    return await res.json();
  },

  async createLoan(data: { client_id: number; copy_id: number; password: string }) {
    const token = localStorage.getItem("token");
    const res = await fetch("/loans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Erro ao criar empréstimo");
    }

    return await res.json();
  },
};
