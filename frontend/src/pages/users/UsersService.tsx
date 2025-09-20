const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiGetUsers = async (token: string) => {
  const response = await fetch(`${API_URL}/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao buscar usuários");
  }

  return response.json();
};

export const apiGetRoles = async(token: string) => {
  const response = await fetch(`${API_URL}/roles`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao buscar funções");
  }

  return response.json();
}

export const apiCreateUser = async(token: string, user: any) => {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(({...user}))
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao criar usuario");
  }

  return response.json();
}

export const apiUpdateUser = async(token: string, user: any) => {
  const response = await fetch(`${API_URL}/users/${user.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(({...user}))
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro ao criar usuario");
  }

  return response.json();
}

export const apiDeleteUser = async (token: string, userId: number) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao deletar usuário");
  }

  if (response.status === 204) {
    return { success: true };
  }

  return response.json().catch(() => ({}));
};


export const apiVerifyPassword = async (token: string, password: string) => {
  const response = await fetch(`${API_URL}/users/verify_password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(({password}))
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro confirmar senha");
  }

  return response.json();
};


