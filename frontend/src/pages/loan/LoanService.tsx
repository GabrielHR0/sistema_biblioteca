// LoanService.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const LoanService = {
  async getCategories(token: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao buscar categorias");
    }

    return response.json();
  },

  async searchBooks(token: string, params: {
    title?: string;
    author?: string;
    category_id?: number;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    
    if (params.title) queryParams.append('title', params.title);
    if (params.author) queryParams.append('author', params.author);
    if (params.category_id) queryParams.append('category_id', params.category_id.toString());

    const response = await fetch(`${API_URL}/books?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao buscar livros");
    }

    return response.json();
  },

  async getBookCopies(token: string, bookId: number): Promise<any[]> {
    const response = await fetch(`${API_URL}/books/${bookId}/copies`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao buscar cópias do livro");
    }

    return response.json();
  },

  async createLoan(token: string, loanData: {
    copy_id: number;
    client_id: number;
  }): Promise<any> {
    const response = await fetch(`${API_URL}/loans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ loan: loanData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors || errorData.error || "Erro ao realizar empréstimo");
    }

    return response.json();
  },

  async searchClients(token: string, searchTerm: string): Promise<any[]> {
    const response = await fetch(`${API_URL}/clients?search=${encodeURIComponent(searchTerm)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao buscar clientes");
    }

    return response.json();
  },

  async createClient(token: string, clientData: {
    name: string;
    email: string;
  }): Promise<any> {
    const response = await fetch(`${API_URL}/clients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ client: clientData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors || errorData.error || "Erro ao criar cliente");
    }

    return response.json();
  }
};