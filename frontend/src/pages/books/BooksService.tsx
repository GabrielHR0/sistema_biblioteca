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
    throw new Error(errorData.errors || errorData.error || "Erro ao criar livro");
  }

  return response.json();
};

export const apiUpdateBook = async (token: string, bookId: number, bookData: any) => {
  const response = await fetch(`${API_URL}/books/${bookId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(bookData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errors || errorData.error || "Erro ao atualizar livro");
  }

  return response.json();
};

export const apiDeleteBook = async (token: string, bookId: number) => {
  const response = await fetch(`${API_URL}/books/${bookId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || errorData.message || "Erro ao deletar livro");
  }

  if (response.status === 204) {
    return { message: "Livro deletado com sucesso" };
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

export const apiCreateCategory = async (token: string, name: string | any) => {
  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ name: name  }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errors || errorData.error || "Erro ao criar categoria");
  }

  return response.json();
};

export const apiUpdateCategory = async (token: string, categoryId: number, categoryData: any) => {
  const response = await fetch(`${API_URL}/categories/${categoryId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ name: categoryData.name }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errors || errorData.error || "Erro ao atualizar categoria");
  }

  return response.json();
};

export const apiDeleteCategory = async (token: string, categoryId: number) => {
  const response = await fetch(`${API_URL}/categories/${categoryId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao excluir categoria");
  }

  return response.json();
};

// -------------------- COPIES --------------------
export const apiGetCopies = async (token: string, bookId?: number) => {
  const url = bookId ? `${API_URL}/copies?book_id=${bookId}` : `${API_URL}/copies`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao buscar cópias");
  }

  return response.json();
};

export const apiCreateCopy = async (token: string, copy: any) => {
  const response = await fetch(`${API_URL}/copies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(copy),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errors || errorData.error || "Erro ao criar cópia");
  }

  return response.json();
};

export const apiCreateMultipleCopies = async (token: string, bookId: number, quantity: number, edition: string) => {
  const copies = Array.from({ length: quantity }, () => ({
    book_id: bookId,
    edition: edition,
    status: "available"
  }));

  const responses = await Promise.all(
    copies.map(copy => 
      fetch(`${API_URL}/copies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(copy),
      })
    )
  );

  const errors = responses.filter(response => !response.ok);
  if (errors.length > 0) {
    const errorData = await errors[0].json();
    throw new Error(errorData.errors || errorData.error || "Erro ao criar cópias");
  }

  return Promise.all(responses.map(r => r.json()));
};

export const apiDeleteCopy = async (token: string, copyId: number) => {
  const response = await fetch(`${API_URL}/copies/${copyId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao deletar cópia");
  }

  return response.json();
};

// -------------------- BOOK CATEGORIES --------------------
export const apiUpdateBookCategories = async (token: string, bookId: number, categoryIds: number[]) => {
  const response = await fetch(`${API_URL}/books/${bookId}/categories`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ category_ids: categoryIds }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errors || errorData.error || "Erro ao atualizar categorias do livro");
  }

  return response.json();
};

export const apiGetCopiesByBook = async (token: string, bookId: number) => {
  const response = await fetch(`${API_URL}/books/${bookId}/copies`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao buscar exemplares");
  }

  return response.json();
};

export const apiUpdateCopy = async (token: string, copyId: number, copyData: any) => {
  const response = await fetch(`${API_URL}/copies/${copyId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ copy: copyData }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errors || errorData.error || "Erro ao atualizar exemplar");
  }

  return response.json();
};