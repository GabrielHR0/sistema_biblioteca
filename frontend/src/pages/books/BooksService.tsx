const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// -------------------- BOOKS --------------------
export const apiGetBooks = async (token: string) => {
  const response = await fetch(`${API_URL}/books`, {
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
};

export const apiCreateBook = async (token: string, book: any) => {
  const response = await fetch(`${API_URL}/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(book),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao criar livro");
  }

  return response.json();
};

export const apiUpdateBook = async (token: string, book: any) => {
  const response = await fetch(`${API_URL}/books/${book.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(book),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao atualizar livro");
  }

  return response.json();
};

export const apiDeleteBook = async (token: string, bookId: number | any) => {
  const response = await fetch(`${API_URL}/books/${bookId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao deletar livro");
  }

  return response.json();
};

// -------------------- CATEGORIES --------------------
export const apiGetCategories = async (token: string) => {
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
};

export const apiCreateCategory = async (token: string, category: any) => {
  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(category),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao criar categoria");
  }

  return response.json();
};

export const apiCreateMultipleCopies = async (token: string, bookId: number, quantity: number, edition: string) => {
    const response = await fetch(`${API_URL}/copys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });

};

export const apiCreateCopy = async (token: string, copy: any) => {
  const response = await fetch(`${API_URL}/copys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({copy}),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao criar categoria");
  }

  return response.json();
};

