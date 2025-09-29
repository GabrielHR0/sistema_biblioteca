// components/public/BookFormModal.tsx
import React, { useState, useEffect } from "react";

export interface Category {
  id: number;
  name: string;
}

export interface BookCopy {
  id?: number;
  edition: string;
  status: "available" | "borrowed" | "lost";
  number?: number;
  loan_due_date?: string;
}

export interface Book {
  id?: number;
  title: string;
  author: string;
  description?: string;
  categories?: Category[];
  copies?: BookCopy[];
}

interface BookFormModalProps {
  book: Book | null;
  categories: Category[];
  onSave: (bookData: any) => Promise<void>;
  onClose: () => void;
  onCreateCategory: (name: string) => Promise<any>;
  onUpdateCopy?: (copyId: number, copyData: Partial<BookCopy>) => Promise<void>;
  onDeleteCopy?: (copyId: number) => Promise<void>;
}

export const BookFormModal: React.FC<BookFormModalProps> = ({
  book,
  categories,
  onSave,
  onClose,
  onCreateCategory,
  onUpdateCopy,
  onDeleteCopy,
}) => {
  const [title, setTitle] = useState(book?.title || "");
  const [author, setAuthor] = useState(book?.author || "");
  const [description, setDescription] = useState(book?.description || "");
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    book?.categories?.map((cat) => cat.id) || []
  );
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Cópias existentes (editar/excluir via callbacks)
  const [existingCopies, setExistingCopies] = useState<BookCopy[]>([]);
  const [editingExistingId, setEditingExistingId] = useState<number | null>(null);
  const [editExistingEdition, setEditExistingEdition] = useState("");
  const [editExistingStatus, setEditExistingStatus] =
    useState<"available" | "borrowed" | "lost">("available");

  // Novas cópias (somente criação)
  const [createCopies, setCreateCopies] = useState(false);
  const [copies, setCopies] = useState<BookCopy[]>([]);

  const [categorySearch, setCategorySearch] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const selectedCategoryObjects = categories.filter((cat) =>
    selectedCategories.includes(cat.id)
  );

  useEffect(() => {
    setTitle(book?.title || "");
    setAuthor(book?.author || "");
    setDescription(book?.description || "");
    setSelectedCategories(book?.categories?.map((cat) => cat.id) || []);

    // carregar SOMENTE cópias existentes para edição/remoção
    setExistingCopies(book?.copies || []);

    // seção de criação limpa/desligada
    setCreateCopies(false);
    setCopies([]);

    // limpa modo de edição
    setEditingExistingId(null);
    setEditExistingEdition("");
    setEditExistingStatus("available");
  }, [book]);

  const getStatusTranslation = (status: string) => {
    const translations = { available: "Disponível", borrowed: "Emprestado", lost: "Perdido" };
    return translations[status as keyof typeof translations] || status;
  };

  // EXISTENTES: editar/excluir via callbacks do pai
  const handleStartEditExisting = (copy: BookCopy) => {
    if (!copy.id) return;
    setEditingExistingId(copy.id);
    setEditExistingEdition(copy.edition);
    setEditExistingStatus(copy.status);
  };

  const handleCancelEditExisting = () => {
    setEditingExistingId(null);
    setEditExistingEdition("");
    setEditExistingStatus("available");
  };

  const handleSaveEditExisting = async () => {
    if (editingExistingId == null || !onUpdateCopy) {
      setError("Ação indisponível no momento.");
      return;
    }
    try {
      setLoading(true);
      await onUpdateCopy(editingExistingId, {
        edition: editExistingEdition,
        status: editExistingStatus,
      });
      setExistingCopies((prev) =>
        prev.map((c) =>
          c.id === editingExistingId ? { ...c, edition: editExistingEdition, status: editExistingStatus } : c
        )
      );
      handleCancelEditExisting();
    } catch (e: any) {
      setError(e?.message || "Erro ao atualizar exemplar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExisting = async (copyId: number) => {
    if (!onDeleteCopy) {
      setError("Ação indisponível no momento.");
      return;
    }
    try {
      setLoading(true);
      await onDeleteCopy(copyId);
      setExistingCopies((prev) => prev.filter((c) => c.id !== copyId));
    } catch (e: any) {
      setError(e?.message || "Erro ao excluir exemplar.");
    } finally {
      setLoading(false);
    }
  };

  // NOVOS: criação
  const addCopy = () => {
    const nextNumberBase =
      existingCopies.length > 0 ? Math.max(...existingCopies.map((c) => c.number || 0)) : 0;
    const nextNumber =
      copies.length > 0
        ? Math.max(nextNumberBase, Math.max(...copies.map((c) => c.number || 0))) + 1
        : nextNumberBase + 1;

    setCopies((prev) => [...prev, { edition: "1ª Edição", status: "available", number: nextNumber }]);
  };

  const removeNewCopy = (index: number) => {
    setCopies((prev) => {
      const list = prev.filter((_, i) => i !== index);
      return list.map((copy, i) => ({
        ...copy,
        number: (existingCopies.length || 0) + i + 1,
      }));
    });
  };

  const updateNewCopy = (index: number, field: keyof BookCopy, value: any) => {
    setCopies((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSave = async () => {
    if (!title || !author || selectedCategories.length === 0) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (createCopies && copies.some((c) => !c.edition?.trim())) {
      setError("Preencha a edição de todos os exemplares novos.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const bookData: any = {
        title,
        author,
        description: description.trim() || undefined,
        category_ids: selectedCategories,
      };

      if (book?.id) {
        bookData.id = book.id;
      }

      // SOMENTE novas cópias no payload
      if (createCopies && copies.length > 0) {
        bookData.copies = copies.map((copy) => ({
          edition: copy.edition.trim(),
          status: copy.status,
          number: copy.number,
        }));
      }

      await onSave(bookData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar livro.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title">{book ? "Editar Livro" : "Novo Livro"}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Campos principais */}
            <div className="row">
              <div className="col-md-6">
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
              </div>

              <div className="col-md-6">
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
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Observações</label>
              <textarea
                className="form-control"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Informações adicionais sobre o livro..."
                disabled={loading}
              />
            </div>

            {/* Categorias */}
            <div className="mb-3">
              <label className="form-label">Categorias *</label>

              {selectedCategoryObjects.length > 0 && (
                <div className="mb-2">
                  <div className="d-flex flex-wrap gap-1">
                    {selectedCategoryObjects.map((category) => (
                      <span key={category.id} className="badge bg-primary d-flex align-items-center">
                        {category.name}
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-1"
                          style={{ fontSize: "0.5rem" }}
                          onClick={() => toggleCategory(category.id)}
                          disabled={loading}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dropdown pesquisável */}
              <div className="dropdown">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Pesquisar categorias..."
                    value={categorySearch}
                    onChange={(e) => {
                      setCategorySearch(e.target.value);
                      setIsCategoryDropdownOpen(true);
                    }}
                    onFocus={() => setIsCategoryDropdownOpen(true)}
                    disabled={loading}
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    disabled={loading}
                  >
                    ⌄
                  </button>
                </div>

                {isCategoryDropdownOpen && (
                  <div className="dropdown-menu show w-100" style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {/* Criar nova categoria */}
                    {categorySearch &&
                      !categories.some((cat) => cat.name.toLowerCase() === categorySearch.toLowerCase()) && (
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setNewCategoryName(categorySearch);
                            setCreatingCategory(true);
                            setIsCategoryDropdownOpen(false);
                          }}
                          type="button"
                        >
                          <small>+ Criar "{categorySearch}"</small>
                        </button>
                      )}

                    {/* Lista filtrada */}
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <button
                          key={category.id}
                          className={`dropdown-item d-flex justify-content-between align-items-center ${
                            selectedCategories.includes(category.id) ? "active" : ""
                          }`}
                          onClick={() => {
                            toggleCategory(category.id);
                            setIsCategoryDropdownOpen(false);
                            setCategorySearch("");
                          }}
                          type="button"
                        >
                          <span>{category.name}</span>
                          {selectedCategories.includes(category.id) && (
                            <span className="badge bg-white text-dark">✓</span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="dropdown-item text-muted">
                        <small>Nenhuma categoria encontrada</small>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Criar categoria inline */}
              {creatingCategory && (
                <div className="mt-2 p-2 border rounded bg-light">
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nome da nova categoria"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      className="btn btn-success btn-sm"
                      onClick={async () => {
                        if (!newCategoryName.trim()) {
                          setError("Digite o nome da nova categoria.");
                          return;
                        }
                        setLoading(true);
                        setError("");
                        try {
                          const newCategory = await onCreateCategory(newCategoryName.trim());
                          if (newCategory?.id) {
                            setSelectedCategories((prev) => [...prev, newCategory.id]);
                          }
                          setNewCategoryName("");
                          setCreatingCategory(false);
                          setCategorySearch("");
                        } catch (err: any) {
                          setError(err.message || "Erro ao criar categoria.");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                    >
                      ✓
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setCreatingCategory(false);
                        setNewCategoryName("");
                      }}
                      disabled={loading}
                    >
                      ✗
                    </button>
                  </div>
                </div>
              )}

              {!creatingCategory && (
                <div className="mt-1">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setCreatingCategory(true)}
                    disabled={loading}
                    style={{ fontSize: "0.75rem" }}
                  >
                    + Criar categoria manualmente
                  </button>
                </div>
              )}
            </div>

            {/* EXISTENTES: edição/remoção via callbacks (não entram no payload) */}
            {existingCopies.length > 0 && (
              <div className="mb-3">
                <h6 className="mb-2">Exemplares existentes</h6>
                <div className="border rounded bg-light p-2">
                  {existingCopies.map((copy) => {
                    const isEditing = editingExistingId === copy.id;
                    return (
                      <div key={copy.id} className="bg-white border rounded p-2 mb-2">
                        <div className="row g-2 align-items-center">
                          <div className="col-md-1">
                            <small className="text-muted">#{copy.number}</small>
                          </div>
                          <div className="col-md-4">
                            {isEditing ? (
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={editExistingEdition}
                                onChange={(e) => setEditExistingEdition(e.target.value)}
                                disabled={loading}
                              />
                            ) : (
                              <span>{copy.edition}</span>
                            )}
                          </div>
                          <div className="col-md-3">
                            {isEditing ? (
                              <select
                                className="form-select form-select-sm"
                                value={editExistingStatus}
                                onChange={(e) =>
                                  setEditExistingStatus(
                                    e.target.value as "available" | "borrowed" | "lost"
                                  )
                                }
                                disabled={loading}
                              >
                                <option value="available">Disponível</option>
                                <option value="borrowed">Emprestado</option>
                                <option value="lost">Perdido</option>
                              </select>
                            ) : (
                              <span className="badge bg-secondary">{getStatusTranslation(copy.status)}</span>
                            )}
                          </div>
                          <div className="col-md-4 d-flex gap-1 justify-content-end">
                            {isEditing ? (
                              <>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={handleSaveEditExisting}
                                  disabled={loading || !onUpdateCopy}
                                  title="Salvar alterações"
                                >
                                  ✓
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={handleCancelEditExisting}
                                  disabled={loading}
                                  title="Cancelar"
                                >
                                  ✗
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() => handleStartEditExisting(copy)}
                                  disabled={loading || !onUpdateCopy}
                                  title="Editar exemplar"
                                >
                                  editar
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => copy.id && handleDeleteExisting(copy.id)}
                                  disabled={loading || !onDeleteCopy}
                                  title="Excluir exemplar"
                                >
                                  excluir
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NOVOS: enviados somente no onSave */}
            <div className="mb-3">
              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={createCopies}
                  onChange={(e) => setCreateCopies(e.target.checked)}
                  id="createCopiesSwitch"
                  disabled={loading}
                />
                <label className="form-check-label" htmlFor="createCopiesSwitch">
                  {book ? "Adicionar novos exemplares" : "Criar exemplares"}
                </label>
              </div>

              {createCopies && (
                <div className="border p-3 rounded bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                      {book ? "Novos Exemplares" : "Exemplares"}
                      {existingCopies.length > 0 && (
                        <small className="text-muted ms-2">
                          (Já existem {existingCopies.length} exemplar
                          {existingCopies.length !== 1 ? "es" : ""})
                        </small>
                      )}
                    </h6>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={addCopy}
                      disabled={loading}
                    >
                      + Adicionar Exemplar
                    </button>
                  </div>

                  {copies.map((copy, index) => (
                    <div key={index} className="border rounded p-2 mb-2 bg-white">
                      <div className="row align-items-center">
                        <div className="col-md-1">
                          <small className="text-muted">#{copy.number}</small>
                        </div>
                        <div className="col-md-4">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Edição (ex: 1ª Edição, 2ª Edição)"
                            value={copy.edition}
                            onChange={(e) => updateNewCopy(index, "edition", e.target.value)}
                            disabled={loading}
                          />
                        </div>
                        <div className="col-md-4">
                          <select
                            className="form-select form-select-sm"
                            value={copy.status}
                            onChange={(e) => updateNewCopy(index, "status", e.target.value)}
                            disabled={loading}
                          >
                            <option value="available">Disponível</option>
                            <option value="borrowed">Emprestado</option>
                            <option value="lost">Perdido</option>
                          </select>
                        </div>
                        <div className="col-md-3">
                          <div className="d-flex gap-1">
                            <span className="badge bg-secondary small">
                              {getStatusTranslation(copy.status)}
                            </span>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => removeNewCopy(index)}
                              disabled={loading}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {copies.length === 0 && (
                    <div className="text-center text-muted py-3">
                      <small>Nenhum exemplar adicionado</small>
                    </div>
                  )}
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
