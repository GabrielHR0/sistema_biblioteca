import React from "react";
import { AdminLayout } from "./AdminLayout";
import { useAuth } from "../auth/authContext";

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth(); // supondo que seu context retorne o usuário
  const userName = user?.name

  return (
    <AdminLayout userName={userName}>
      <div className="p-4">
        <h1>Dashboard</h1>
        <p>Bem-vindo ao painel de administração da Biblioteca Ney Pontes.</p>
      </div>
    </AdminLayout>
  );
};