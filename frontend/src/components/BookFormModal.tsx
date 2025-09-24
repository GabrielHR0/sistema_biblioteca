import React, { useState, useEffect } from "react";

export interface Category {
  id: number;
  name: string;
}

export interface BookCopy {
  id?: number ;
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
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    book?.categories?.map(cat => cat.id) || []
  );
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Estados para os exemplares
  const [createCopies, setCreateCopies] = useState(false);
  const [copies, setCopies] = useState<BookCopy[]>([
    { edition: "1ª Edição", status: "available", number: 1 }
  ]);

  // Estados para o dropdown de categorias
  const [categorySearch, setCategorySearch] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Filtrar categorias baseado na pesquisa
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Categorias selecionadas (para display)
  const selectedCategoryObjects = categories.filter(cat => 
    selectedCategories.includes(cat.id)
  );

  useEffect(() => {
    // Atualiza o modal se o book mudar
    setTitle(book?.title || "");
    setAuthor(book?.author || "");
    setDescription(book?.description || "");
    setSelectedCategories(book?.categories?.map(cat => cat.id) || []);
    
    // Se estiver editando, não permite criar cópias
    if (book) {
      setCreateCopies(false);
      setCopies(book.copies || []);
    } else {
      setCreateCopies(true);
    }
  }, [book]);

  const handleSave = async () => {
    if (!title || !author || selectedCategories.length === 0) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (createCopies && copies.some(copy => !copy.edition.trim())) {
      setError("Preencha a edição de todos os exemplares.");
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

      // Se estiver criando exemplares junto com o livro
      if (createCopies && copies.length > 0) {
        bookData.copies = copies.map(copy => ({
          edition: copy.edition.trim(),
          status: copy.status,
          number: copy.number
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

  const handleCreateCategoryInline = async () => {
    if (!newCategoryName.trim()) {
      setError("Digite o nome da nova categoria.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const newCategory = await onCreateCategory(newCategoryName.trim());
      
      if (newCategory && newCategory.id) {
        setSelectedCategories(prev => [...prev, newCategory.id]);
      }
      
      setNewCategoryName("");
      setCreatingCategory(false);
      setCategorySearch(""); // Limpar a pesquisa
    } catch (err: any) {
      setError(err.message || "Erro ao criar categoria.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleCategorySelect = (category: Category) => {
    toggleCategory(category.id);
    setCategorySearch("");
    setIsCategoryDropdownOpen(false);
  };

  // Funções para gerenciar exemplares
  const addCopy = () => {
    const nextNumber = copies.length > 0 ? Math.max(...copies.map(c => c.number || 0)) + 1 : 1;
    setCopies([...copies, { 
      edition: "1ª Edição", 
      status: "available", 
      number: nextNumber 
    }]);
  };

  const removeCopy = (index: number) => {
    if (copies.length > 1) {
      const newCopies = copies.filter((_, i) => i !== index);
      // Reorganizar os números
      const renumberedCopies = newCopies.map((copy, i) => ({
        ...copy,
        number: i + 1
      }));
      setCopies(renumberedCopies);
    }
  };

  const updateCopy = (index: number, field: keyof BookCopy, value: any) => {
    const newCopies = [...copies];
    newCopies[index] = { ...newCopies[index], [field]: value };
    setCopies(newCopies);
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
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title">{book ? "Editar Livro" : "Novo Livro"}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

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

            <div className="mb-3">
              <label className="form-label">Categorias *</label>
              
              {/* Categorias selecionadas */}
              {selectedCategoryObjects.length > 0 && (
                <div className="mb-2">
                  <div className="d-flex flex-wrap gap-1">
                    {selectedCategoryObjects.map(category => (
                      <span key={category.id} className="badge bg-primary d-flex align-items-center">
                        {category.name}
                        <button 
                          type="button"
                          className="btn-close btn-close-white ms-1"
                          style={{fontSize: '0.5rem'}}
                          onClick={() => toggleCategory(category.id)}
                          disabled={loading}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dropdown pesquisável de categorias */}
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
                  <div 
                    className="dropdown-menu show w-100"
                    style={{ maxHeight: '200px', overflowY: 'auto' }}
                  >
                    {/* Opção de criar nova categoria */}
                    {categorySearch && !categories.some(cat => 
                      cat.name.toLowerCase() === categorySearch.toLowerCase()
                    ) && (
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

                    {/* Lista de categorias filtradas */}
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map(category => (
                        <button
                          key={category.id}
                          className={`dropdown-item d-flex justify-content-between align-items-center ${
                            selectedCategories.includes(category.id) ? 'active' : ''
                          }`}
                          onClick={() => handleCategorySelect(category)}
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

              {/* Criar categoria inline (quando aberto manualmente) */}
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
                      onClick={handleCreateCategoryInline}
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

              {/* Botão para abrir criação manual de categoria */}
              {!creatingCategory && (
                <div className="mt-1">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setCreatingCategory(true)}
                    disabled={loading}
                    style={{ fontSize: '0.75rem' }}
                  >
                    + Criar categoria manualmente
                  </button>
                </div>
              )}
            </div>

            {/* Seção para criar exemplares */}
            {!book && (
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
                    Criar exemplares
                  </label>
                </div>

                {createCopies && (
                  <div className="border p-3 rounded bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">Exemplares</h6>
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
                              placeholder="Edição"
                              value={copy.edition}
                              onChange={(e) => updateCopy(index, 'edition', e.target.value)}
                              disabled={loading}
                            />
                          </div>
                          <div className="col-md-4">
                            <select
                              className="form-select form-select-sm"
                              value={copy.status}
                              onChange={(e) => updateCopy(index, 'status', e.target.value)}
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
                              {copies.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => removeCopy(index)}
                                  disabled={loading}
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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