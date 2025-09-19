// src/dashboard/Dashboard.tsx
import React from "react";
import { useAuth } from "../auth/authContext";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

export const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container-fluid vh-100 d-flex justify-content-center align-items-center bg-light">
      <div className="card shadow-lg text-center" style={{ width: "100%", maxWidth: "500px" }}>
        <div className="card-body p-4">
          <h1 className="card-title mb-4">Bem-vindo!</h1>
          <p className="mb-4">
            Você está logado e pode acessar o sistema.
          </p>

          <div className="mb-4">
            <span className="badge bg-success">Token ativo</span>
          </div>

          <button 
            className="btn btn-danger w-50"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
