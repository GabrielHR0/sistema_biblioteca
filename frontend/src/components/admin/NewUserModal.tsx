import React, { useState } from "react";

interface Role {
  id: number;
  name: string;
}

interface NewUserModalProps {
  roles: Role[];
  onClose: () => void;
  onSave: (newUser: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role_ids?: number[];
  }) => Promise<void>;
}

export const NewUserModal: React.FC<NewUserModalProps> = ({ roles, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setConfirmPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== password_confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name,
        email,
        password,
        password_confirmation: password_confirmation,
        role_ids: selectedRoles,
      });
      onClose();
    } catch (err: any) {
      if (err?.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro ao criar o usuário.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  return (
    <div className="modal show fade d-block" tabIndex={-1} role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title">Novo Usuário</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit} autoComplete="off">
            {/* Campo falso para senha para evitar autofill */}
            <input type="password" name="fake-password" style={{ display: "none" }} autoComplete="new-password" />

            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">
                <label className="form-label">Nome</label>
                <input
                  className="form-control"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="off"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="off"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Senha</label>
                <input
                  className="form-control"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Confirmar Senha</label>
                <input
                  className="form-control"
                  type="password"
                  value={password_confirmation}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Funções</label>
                <div>
                  {roles.map((role) => (
                    <div key={role.id} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`role-${role.id}`}
                        value={role.id}
                        checked={selectedRoles.includes(role.id)}
                        onChange={() => handleRoleChange(role.id)}
                        disabled={loading}
                        autoComplete="off"
                      />
                      <label className="form-check-label" htmlFor={`role-${role.id}`}>
                        {role.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Criando..." : "Criar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
