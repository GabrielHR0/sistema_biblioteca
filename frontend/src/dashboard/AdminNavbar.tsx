import React from "react";
import { NavLink } from "react-router-dom";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

interface AdminNavbarProps {
  userName: string;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ userName }) => {
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm mb-4">
      <Container fluid>
        {/* Logo e nome da biblioteca */}
        <Navbar.Brand as={NavLink} to="/admin" className="d-flex align-items-center">
          <i className="bi bi-journal-bookmark-fill me-2" style={{ fontSize: "1.5rem" }}></i>
          Biblioteca Ney Pontes
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbarNav" />
        <Navbar.Collapse id="navbarNav">
          {/* Itens de navegação */}
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/admin" end>
              Dashboard
            </Nav.Link>
            <Nav.Link as={NavLink} to="/admin/livros">
              Livros
            </Nav.Link>
            <Nav.Link as={NavLink} to="/admin/usuarios">
              Usuários
            </Nav.Link>
            <Nav.Link as={NavLink} to="/admin/emprestimos">
              Empréstimos
            </Nav.Link>
          </Nav>

          {/* Dropdown do usuário */}
          <Nav>
            <NavDropdown
              title={
                <span className="d-flex align-items-center">
                  <i className="bi bi-person-circle me-2" style={{ fontSize: "1.5rem" }}></i>
                  {userName}
                </span>
              }
              id="userDropdown"
              align="end"
            >
              <NavDropdown.Item as={NavLink} to="/password-reset">
                Alterar senha
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={NavLink} to="/logout" className="text-danger">
                Sair
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
