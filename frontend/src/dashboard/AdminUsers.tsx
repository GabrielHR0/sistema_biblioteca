import React, { useEffect, useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { useAuth } from "../auth/authContext";
import { apiGetUsers } from "../auth/authService";
import "bootstrap/dist/css/bootstrap.min.css";

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: Array<Role>;
}

export const AdminUsers: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      try {
        const data = await apiGetUsers(token);
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [token]);

  useEffect(() => {
    const filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [search, users]);

  // Paginação
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <AdminLayout userName="Administrador">
      <div className="container p-4">
        <h1 className="mb-4">Gerenciar Usuários</h1>

        {/* Pesquisa */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Pesquisar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Card grande */}
        <div className="card shadow-lg">
          <div className="card-body">
            {/* Cabeçalho com botão de adicionar */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">Usuários cadastrados</h5>
              <button className="btn btn-success">+ Novo Usuário</button>
            </div>

            {/* Lista de usuários */}
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Função</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center">
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  )}
                  {currentUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.roles.map(r => r.name).join(", ")}</td>
                      <td>
                        <button className="btn btn-sm btn-primary me-2">Editar</button>
                        <button className="btn btn-sm btn-danger">Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <nav>
              <ul className="pagination justify-content-center mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Anterior
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li
                    key={i + 1}
                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Próximo
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
