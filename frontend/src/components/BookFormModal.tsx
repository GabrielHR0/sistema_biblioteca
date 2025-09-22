import React, { useState, useEffect } from "react";

export interface Category {
  id: number;
  name: string;
}

export interface Book {
  id?: number;
  title: string;
  author: string;
  total_copies: number; 
  category?: Category;
}

interface BookFormModalProps {
  book: Book | null;
  categories: Category[];
  onSave: (bookData: any) => Promise<void>;
  onClose: () => void;
  onCreateCategory: (name: string) => Promise<void>;
}

export const BookFormModal: React.FC<BookFormModalProps> = ({
  book,
  categories,
  onSave,
  onClose,
  onCreateCategory,
}) => {
  const [title, setTitle] = useState(book?.title || "");
  const [author, setAuthor] = useState(book?.author || "");
  const [copies, setCopies] = useState(book?.copies || 1);
  const [edition, setEdition] = useState("1ª Edição");
  const [selectedCategory, setSelectedCategory] = useState<number | "">(
    book?.category?.id ?? ""
  );
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Atualiza o modal se o book mudar
    setTitle(book?.title || "");
    setAuthor(book?.author || "");
    setCopies(book?.copies || 1);
    setSelectedCategory(book?.category?.id ?? "");
  }, [book]);

  const handleSave = async () => {
    if (!title || !author || !selectedCategory) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Envia os dados no formato que o backend espera
      const bookData = {
        title,
        author,
        category_ids: [selectedCategory],
        copies: book ? undefined : copies, // só envia quantidade para novo livro
        edition: book ? undefined : edition // só envia edição para novo livro
      };
      
      await onSave(bookData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar livro.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategoryInline = async () => {
    if (!newCategoryName.trim()) {
      setError("Digite o nome da nova categoria.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onCreateCategory(newCategoryName.trim());
      setNewCategoryName("");
      setCreatingCategory(false);
    } catch (err: any) {
      setError(err.message || "Erro ao criar categoria.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title">{book ? "Editar Livro" : "Novo Livro"}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3">
              <label className="form-label">Título *</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Autor *</label>
              <input
                type="text"
                className="form-control"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={loading}
              />
            </div>

            {!book && (
              <>
                <div className="mb-3">
                  <label className="form-label">Número de cópias *</label>
                  <input
                    type="number"
                    min={1}
                    className="form-control"
                    value={copies}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setCopies(value > 0 ? value : 1);
                    }}
                    disabled={loading}
                  />
                  <div className="form-text">Serão criadas {copies} cópia(s) idênticas deste livro.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Edição *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={edition}
                    onChange={(e) => setEdition(e.target.value)}
                    placeholder="Ex: 1ª Edição, 2ª Edição, etc."
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <div className="mb-3">
              <label className="form-label">Categoria *</label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value ? Number(e.target.value) : "")
                }
                disabled={loading}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {!creatingCategory && (
                <button
                  className="btn btn-sm btn-link mt-1"
                  onClick={() => setCreatingCategory(true)}
                  disabled={loading}
                >
                  + Criar nova categoria
                </button>
              )}

              {creatingCategory && (
                <div className="input-group mt-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nome da nova categoria"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateCategoryInline}
                    disabled={loading}
                  >
                    Adicionar
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => { setCreatingCategory(false); setNewCategoryName(""); }}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};