import React, { useState, useEffect } from "react";

export interface Category {
  id: number;
  name: string;
}

export interface BookCopy {
  id?: number;
  number?: number | any;
  edition: string;
  status: "available" | "borrowed" | "lost";
  loan_due_date?: string | any;
}

export interface Book {
  id?: number;
  title: string;
  author: string;
  description?: string;
  categories?: Category[];
  copies?: BookCopy[];
  total_copies?: number | any;
  available_copies?: number;
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
  const [description, setDescription] = useState(book?.description || "");
  const [selectedCategory, setSelectedCategory] = useState<number>(
    book?.categories?.[0]?.id || 0
  );
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [copies, setCopies] = useState<BookCopy[]>(
    book?.copies?.length
      ? book.copies
      : [{ number: 1, edition: "1ª Edição", status: "available" }]
  );

  useEffect(() => {
    setTitle(book?.title || "");
    setAuthor(book?.author || "");
    setDescription(book?.description || "");
    setSelectedCategory(book?.categories?.[0]?.id || 0);
    setCopies(
      book?.copies?.length
        ? book.copies
        : [{ number: 1, edition: "1ª Edição", status: "available" }]
    );
  }, [book]);

  const handleSave = async () => {
    if (!title || !author || !selectedCategory) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (copies.length === 0 || copies.some(c => !c.edition.trim())) {
      setError("Digite a edição de todos os exemplares.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const bookData: any = {
        title,
        author,
        description: description.trim() || undefined,
        category_ids: [selectedCategory],
        copies: copies.map(c => ({
          edition: c.edition.trim(),
          status: c.status
        }))
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

  const addCopy = () => {
    setCopies(prev => [
      ...prev,
      { number: prev.length + 1, edition: "", status: "available" }
    ]);
  };

  const removeCopy = (index: number) => {
    setCopies(prev => prev.filter((_, i) => i !== index));
  };

  const updateCopy = (index: number, field: keyof BookCopy, value: any) => {
    setCopies(prev => {
      const newCopies = [...prev];
      newCopies[index][field] = value;
      return newCopies;
    });
  };

  const getStatusTranslation = (status: string) => {
    const translations = {
      available: "Disponível",
      borrowed: "Emprestado",
      lost: "Perdido"
    };
    return translations[status as keyof typeof translations] || status;
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
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
                onChange={e => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Autor *</label>
              <input
                type="text"
                className="form-control"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Observações</label>
              <textarea
                className="form-control"
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Informações adicionais sobre o livro..."
                disabled={loading}
              />
              <div className="form-text">Campo opcional para observações sobre o livro.</div>
            </div>

            {/* Dropdown de categorias */}
            <div className="mb-3">
              <label className="form-label">Categoria *</label>
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(Number(e.target.value))}
                  disabled={loading}
                >
                  <option value={0}>Selecione...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>

                <button
                  className="btn btn-outline-primary"
                  onClick={() => setCreatingCategory(true)}
                  disabled={loading}
                >
                  + Nova categoria
                </button>
              </div>

              {creatingCategory && (
                <div className="input-group mt-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nome da nova categoria"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
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

            {/* Seção de Exemplares */}
            <div className="mb-3">
              <h6>Exemplares</h6>
              {copies.map((copy, index) => (
                <div key={index} className="border rounded p-2 mb-2 bg-light">
                  <div className="d-flex gap-2 align-items-center">
                    <div style={{ width: "60px" }}>
                      <label className="form-label">#</label>
                      <input
                        type="text"
                        className="form-control"
                        value={copy.number}
                        disabled
                      />
                    </div>
                    <div className="flex-grow-1">
                      <label className="form-label">Edição *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={copy.edition}
                        onChange={e => updateCopy(index, "edition", e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="form-label">Status *</label>
                      <select
                        className="form-select"
                        value={copy.status}
                        onChange={e => updateCopy(index, "status", e.target.value)}
                        disabled={loading}
                      >
                        <option value="available">Disponível</option>
                        <option value="borrowed">Emprestado</option>
                        <option value="lost">Perdido</option>
                      </select>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeCopy(index)}
                        disabled={loading}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-sm btn-success"
                onClick={addCopy}
                disabled={loading}
              >
                + Adicionar exemplar
              </button>
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
