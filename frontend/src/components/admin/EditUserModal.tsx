import React, { useState, useEffect } from "react";

interface Role {
  id: number;
  name: string;
}

interface EditUserModalProps {
  user: {
    id: number;
    name: string;
    email: string;
    roles?: Role[];
  } | null;
  roles: Role[];
  onClose: () => void;
  onSave: (updatedUser: {
    id: number;
    name: string;
    email: string;
    password?: string;
    role_ids?: number[];
  }) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  roles,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword("");
      setSelectedRoles(user.roles?.map((r) => r.id) || []);
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      id: user.id,
      name,
      email,
      password: password || undefined, // só envia se foi preenchido
      role_ids: selectedRoles,
    });

    onClose();
  };

  const handleRoleChange = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  return (
    <div className="modal show fade d-block" tabIndex={-1} role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title">Editar Usuário</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Nome</label>
                <input
                  className="form-control"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
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
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Nova Senha (opcional)</label>
                <div className="input-group">
                  <input
                    className="form-control"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Deixe em branco para não alterar"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
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
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`role-${role.id}`}
                      >
                        {role.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
