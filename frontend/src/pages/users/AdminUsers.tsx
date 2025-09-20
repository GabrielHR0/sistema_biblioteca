import React, { useEffect, useState } from "react";
import { BaseLayout } from "@layouts/BaseLayout";
import { useAuth } from "../auth/authContext";
import {
  apiGetUsers,
  apiGetRoles,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
  apiVerifyPassword,
} from "./UsersService";
import { EditUserModal } from "@components/admin/EditUserModal";
import { NewUserModal } from "@components/admin/NewUserModal";
import "bootstrap/dist/css/bootstrap.min.css";

interface AdminUsersProps {
  userName: string;
  isAdmin: boolean;
}

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ userName, isAdmin }) => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<number | "">(""); 
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // senha temporária e ação pendente
  const [actionPassword, setActionPassword] = useState("");
  const [pendingAction, setPendingAction] = useState<{
    type: "delete" | "edit";
    user: User | null;
    newData?: any;
  } | null>(null);

  // mensagens de feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const usersPerPage = 10;

  // -------------------- FETCH USERS --------------------
  useEffect(() => {
    if (!token) return;
    const fetchUsers = async () => {
      try {
        const data = await apiGetUsers(token);
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [token]);

  // -------------------- FETCH ROLES --------------------
  useEffect(() => {
    if (!token) return;
    const fetchRoles = async () => {
      try {
        const data = await apiGetRoles(token);
        setRoles(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRoles();
  }, [token]);

  // -------------------- FILTER --------------------
  useEffect(() => {
    let filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (roleFilter) {
      filtered = filtered.filter((u) =>
        u.roles.some((r) => r.id === roleFilter)
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [search, roleFilter, users]);

  // -------------------- CRUD --------------------
  const handleSaveUser = async (userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role_ids?: number[];
  }) => {
    try {
      if (!token) return;
      await apiCreateUser(token, userData);
      const data = await apiGetUsers(token);
      setUsers(data);
      setFilteredUsers(data);
      setFeedback({ type: "success", message: "Usuário criado com sucesso!" });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: "error", message: "Erro ao criar usuário: " + err.message });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // -------------------- CONFIRM ACTION --------------------
  const handleConfirmAction = async () => {
    if (!token || !pendingAction) return;
    if (!actionPassword) {
      setFeedback({ type: "error", message: "Digite a senha para confirmar." });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    try {
      const valid = await apiVerifyPassword(token, actionPassword);
      if (!valid) {
        setFeedback({ type: "error", message: "Senha incorreta!" });
        setTimeout(() => setFeedback(null), 3000);
        return;
      }

      if (pendingAction.type === "delete" && pendingAction.user) {
        await apiDeleteUser(token, pendingAction.user.id);
        setFeedback({ type: "success", message: "Usuário deletado com sucesso!" });
      } else if (pendingAction.type === "edit" && pendingAction.user && pendingAction.newData) {
        await apiUpdateUser(token, { id: pendingAction.user.id, ...pendingAction.newData });
        setSelectedUser(null);
        setFeedback({ type: "success", message: "Usuário atualizado com sucesso!" });
      }

      const data = await apiGetUsers(token);
      setUsers(data);
      setFilteredUsers(data);

      setPendingAction(null);
      setActionPassword("");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: "error", message: "Erro ao processar ação: " + err.message });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const confirmDeleteUser = (user: User) => {
    setPendingAction({ type: "delete", user });
  };

  const confirmUpdateUser = (user: User, newData: any) => {
    setPendingAction({ type: "edit", user, newData });
  };

  // -------------------- PAGINAÇÃO --------------------
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <BaseLayout userName={userName} isAdmin={isAdmin}>
      <div className="container p-4">
        <h1 className="mb-4">Gerenciar Usuários</h1>

        {/* ---------------- FEEDBACK ---------------- */}
        {feedback && (
          <div className={`alert alert-${feedback.type === "success" ? "success" : "danger"}`}>
            {feedback.message}
          </div>
        )}

        {/* ---------------- FILTROS ---------------- */}
        <div className="row mb-3">
          <div className="col-md-6 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Pesquisar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="col-md-6 mb-2">
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value ? Number(e.target.value) : "")
              }
              autoComplete="off"
            >
              <option value="">Todas as funções</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ---------------- TABELA ---------------- */}
        <div className="card shadow-lg">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">Usuários cadastrados</h5>
              <button className="btn btn-success" onClick={() => setShowModal(true)}>
                + Novo Usuário
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Funções</th>
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
                      <td>{user.roles.map((r) => r.name).join(", ")}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => setSelectedUser(user)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => confirmDeleteUser(user)}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <nav>
              <ul className="pagination justify-content-center mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                    Anterior
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                    Próximo
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* ---------------- MODAL DE CONFIRMAÇÃO DE SENHA ---------------- */}
      {pendingAction && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmação de Segurança</h5>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <span className="me-2">
                    Digite sua senha para {pendingAction.type === "delete" ? "deletar usuário" : "salvar alterações"}:
                  </span>
                  <input type="password" name="fake-password" style={{ display: "none" }} autoComplete="new-password" />
                  <input
                    type="password"
                    className="form-control mt-2"
                    value={actionPassword}
                    onChange={(e) => setActionPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleConfirmAction}>
                  Confirmar
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => { setPendingAction(null); setActionPassword(""); }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAIS ---------------- */}
      {showModal && (
        <NewUserModal
          roles={roles}
          onClose={() => setShowModal(false)}
          onSave={handleSaveUser}
        />
      )}

      <EditUserModal
        user={selectedUser}
        roles={roles}
        onClose={() => setSelectedUser(null)}
        onSave={(newData) => {
          if (selectedUser) confirmUpdateUser(selectedUser, newData);
        }}
      />
    </BaseLayout>
  );
};
