import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";

import { Login } from "@pages/auth/login";
import { ForgotPassword } from "@pages/auth/forgotPassword";
import { ResetPassword } from "@pages/auth/resetPassword";
import { AdminDashboard } from "@pages/dashboard/AdminDashboard";
import { AdminUsers } from "@pages/users/AdminUsers";
import { Books } from "@pages/books/Books";
import { Categories } from "@pages/books/Categories";
import { LoanPage } from "@pages/loan/LoanPage";
import { MembersPage } from "@pages/clients/Cients";
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const App = () => {
  const [user, setUser] = useState(() => {
    const userString = localStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  });

  const [isAdmin, setIsAdmin] = useState(() => user?.roles?.includes("Administrator") || false);

  useEffect(() => {
    const handleStorageChange = () => {
      const userString = localStorage.getItem("user");
      const newUser = userString ? JSON.parse(userString) : null;
      setUser(newUser);
      setIsAdmin(newUser?.roles?.includes("Administrator") || false);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const userName = user?.name || "";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/password-reset/:token" element={<ResetPassword />} />

        <Route
          path="/membros"
          element={
            <ProtectedRoute>
              <MembersPage userName={userName} isAdmin={isAdmin} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Categories userName={userName} isAdmin={isAdmin} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/emprestimos"
          element={
            <ProtectedRoute>
              <LoanPage userName={userName} isAdmin={isAdmin} />
            </ProtectedRoute>
          }
        />        

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard userName={userName} isAdmin={isAdmin} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <AdminUsers userName={userName} isAdmin={isAdmin} />
            </ProtectedRoute>
          }
        />

        <Route
          path="livros"
          element={
            <ProtectedRoute>
              <Books userName={userName} isAdmin={isAdmin}></Books>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<h1>404 - Página não encontrada</h1>} />
      </Routes>
    </BrowserRouter>
  );
};
