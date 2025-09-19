import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { Login } from "./auth/login";
import { ForgotPassword } from "./auth/forgotPassword";
import { ResetPassword } from "./auth/resetPassword";
import { AdminDashboard } from "./dashboard/AdminDashboard";
import { AdminUsers } from "./dashboard/AdminUsers"; // página de gerenciamento de usuários
//import { Logout } from "./auth/logout"; // página ou componente de logout

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const App = () => (
  <BrowserRouter>
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/password-reset" element={<ResetPassword />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
    </Routes>
  </BrowserRouter>
);
