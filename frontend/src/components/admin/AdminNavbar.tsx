import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@pages/auth/authContext"; 
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export const AdminNavbar: React.FC<{ userName?: string }> = ({ userName }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const currentPath = location.pathname;

  const mainItems = [
    { title: "Dashboard", url: "/dashboard", icon: "bi-house" },
    { title: "Livros", url: "/livros", icon: "bi-journal-bookmark" },
    { title: "Empréstimos", url: "/emprestimos", icon: "bi-book" },
    { title: "Membros", url: "/membros", icon: "bi-people" },
  ];

  const managementItems = [
    { title: "Bibliotecários", url: "/usuarios", icon: "bi-person-check" },
    { title: "Reservas", url: "/reservas", icon: "bi-calendar" },
    { title: "Relatórios", url: "/relatorios", icon: "bi-bar-chart" },
    { title: "Configurações", url: "/configuracoes", icon: "bi-gear" },
  ];

  const isActive = (url: string) => currentPath === url;

  const handleLogout = () => {
    logout(); // limpa token e usuário
    navigate("/login"); // redireciona para login
  };

  return (
    <div className="d-flex flex-column bg-light" style={{ width: "250px", height: "100vh", position: "fixed" }}>
      {/* Cabeçalho */}
      <div className="d-flex align-items-center p-3 border-bottom">
        <i className="bi bi-person-circle fs-3 me-2"></i>
        <span className="fw-bold">{userName || "Usuário"}</span>
      </div>

      {/* Conteúdo da sidebar */}
      <div className="flex-grow-1 overflow-auto">
        {/* Principal */}
        <div className="mt-3">
          <h6 className="text-muted px-3">Principal</h6>
          <ul className="nav flex-column">
            {mainItems.map((item) => (
              <li key={item.title} className="nav-item">
                <NavLink
                  to={item.url}
                  className={`nav-link d-flex align-items-center px-3 py-2 ${isActive(item.url) ? "active fw-bold bg-primary text-white" : "text-dark"}`}
                >
                  <i className={`${item.icon} me-2`}></i>
                  {item.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Administração */}
        <div className="mt-4">
          <h6 className="text-muted px-3">Administração</h6>
          <ul className="nav flex-column">
            {managementItems.map((item) => (
              <li key={item.title} className="nav-item">
                <NavLink
                  to={item.url}
                  className={`nav-link d-flex align-items-center px-3 py-2 ${isActive(item.url) ? "active fw-bold bg-primary text-white" : "text-dark"}`}
                >
                  <i className={`${item.icon} me-2`}></i>
                  {item.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Rodapé com logout */}
      <div className="p-3 border-top">
        <button onClick={handleLogout} className="btn btn-outline-danger w-100">
          <i className="bi bi-box-arrow-right me-2"></i>Sair
        </button>
      </div>
    </div>
  );
};
