const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiGetClients = async (token: string) => {
  const response = await fetch(`${API_URL}/clients`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
}