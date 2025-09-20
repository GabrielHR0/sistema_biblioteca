import React from "react";
import { NavLink } from "react-router-dom";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAuth } from "@pages/auth/authContext";

interface AdminNavbarProps {
  userName: string | null;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = (userName) => {
  const { user, logout } = useAuth();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm mb-4">
      <Container fluid>
        <Navbar.Brand as={NavLink} to="/admin" className="d-flex align-items-center">
          <i className="bi bi-journal-bookmark-fill me-2" style={{ fontSize: "1.5rem" }}></i>
          Biblioteca Ney Pontes
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbarNav" />
        <Navbar.Collapse id="navbarNav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/dashboard" end>
              Dashboard
            </Nav.Link>
            <Nav.Link as={NavLink} to="/livros">
              Livros
            </Nav.Link>
            <Nav.Link as={NavLink} to="/usuarios">
              Usuários
            </Nav.Link>
            <Nav.Link as={NavLink} to="/emprestimos">
              Empréstimos
            </Nav.Link>
          </Nav>

          <Nav>
            <NavDropdown
              title={
                <span className="d-flex align-items-center">
                  <i className="bi bi-person-circle me-2" style={{ fontSize: "1.5rem" }}></i>
                  {user?.name || "Usuário"}
                </span>
              }
              id="userDropdown"
              align="end"
            >
              <NavDropdown.Item as={NavLink} to={`/password-reset/${token}`}>
                Alterar senha
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                Sair
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
