import React, { useState } from "react";

interface Category {
  id: number;
  name: string;
}

interface CategoryFormModalProps {
  categories: Category[];
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  categories,
  onClose,
  onSave,
  onDelete,
}) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!newCategoryName.trim()) {
      setError("Digite o nome da categoria.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onSave(newCategoryName.trim());
      setNewCategoryName("");
    } catch (err: any) {
      if (err?.message) setError(err.message);
      else setError("Ocorreu um erro ao criar a categoria.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!onDelete) return;
    if (!window.confirm("Tem certeza que deseja remover esta categoria?")) return;

    setLoading(true);
    try {
      await onDelete(id);
    } catch (err: any) {
      if (err?.message) setError(err.message);
      else setError("Erro ao deletar a categoria.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title">Gerenciar Categorias</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3 d-flex">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Nova categoria"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={loading}
              />
              <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
                {loading ? "Salvando..." : "Adicionar"}
              </button>
            </div>

            <ul className="list-group">
              {categories.map((cat) => (
                <li key={cat.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {cat.name}
                  {onDelete && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(cat.id)}
                      disabled={loading}
                    >
                      Remover
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
