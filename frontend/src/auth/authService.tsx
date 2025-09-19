
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function apiLogin(email: string, password: string ){

    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({email, password})
    });

    if(!res.ok){ throw new Error("Email ou senha inválidos")};
    return res.json();

};

export async function apiForgotPassword(email: string){
    const res = await fetch(`${API_URL}/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({email})
    });

    if(!res.ok){ throw new Error("Email ou senha inválidos")};
    return res.json();
}

export async function apiResetPassword(token: string, password: string, password_confirmation: string){
    const res = await fetch(`${API_URL}/password/reset`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({token, password, password_confirmation})
    });

    if(!res.ok){ throw new Error("Email ou senha inválidos")};
    return res.json();
}

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