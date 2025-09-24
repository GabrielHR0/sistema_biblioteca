import React, { useEffect, useState } from "react";
import { BaseLayout } from "@layouts/BaseLayout";
import { apiGetCategories, apiCreateCategory, apiUpdateCategory, apiDeleteCategory } from "./BooksService";
import { CategoryFormModal } from "@components/CategoryFormModal";
import { useAuth } from "../auth/authContext";
import "bootstrap/dist/css/bootstrap.min.css";

interface CategoriesProps {
  userName: string;
  isAdmin: boolean;
}

export interface Category {
  id: number;
  name: string;
  book_count: number;
}

export const Categories: React.FC<CategoriesProps> = ({ userName, isAdmin }) => {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  // -------------------- FETCH CATEGORIAS --------------------
  useEffect(() => {
    if (!token) return;
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await apiGetCategories(token);
        setCategories(data);
        setFilteredCategories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [token]);

  // -------------------- FILTRO --------------------
  useEffect(() => {
    let filtered = categories;
    if (search) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredCategories(filtered);
  }, [search, categories]);

  const handleCreateCategory = async (name: string) => {
    if (!token) return;
    setLoading(true);
    try {
      await apiCreateCategory(token, { name });
      const data = await apiGetCategories(token);
      setCategories(data);
      setShowCategoryModal(false);
    } catch (err) {
      console.error(err);
      throw err; // Propaga o erro para o modal
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (categoryId: number, newName: string) => {
    if (!token) return;
    setLoading(true);
    try {
      await apiUpdateCategory(token, categoryId, { name: newName });
      const data = await apiGetCategories(token);
      setCategories(data);
      setEditingCategory(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar categoria");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!token) return;
    
    if (category.book_count > 0) {
      alert("Não é possível excluir uma categoria que possui livros associados.");
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      return;
    }

    setLoading(true);
    try {
      await apiDeleteCategory(token, category.id);
      const data = await apiGetCategories(token);
      setCategories(data);
      alert("Categoria excluída com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir categoria");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
  };

  const saveEditing = async () => {
    if (!editingCategory) return;
    
    const newName = editingCategory.name.trim();
    if (!newName) {
      alert("O nome da categoria não pode estar vazio.");
      return;
    }

    // Verificar se o nome já existe (excluindo a categoria atual)
    const nameExists = categories.some(
      cat => cat.name.toLowerCase() === newName.toLowerCase() && cat.id !== editingCategory.id
    );

    if (nameExists) {
      alert("Já existe uma categoria com este nome.");
      return;
    }

    await handleUpdateCategory(editingCategory.id, newName);
  };

  return (
    <BaseLayout userName={userName} isAdmin={isAdmin}>
      <div className="container p-4">
        <h1 className="mb-4">Categorias</h1>

        {loading && (
          <div className="alert alert-info">Carregando...</div>
        )}

        <div className="row mb-3">
          <div className="col-md-6 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Pesquisar categorias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="col-md-6 mb-2 text-md-end">
            <button
              className="btn btn-success"
              onClick={() => setShowCategoryModal(true)}
              disabled={loading}
            >
              + Nova Categoria
            </button>
          </div>
        </div>

        <div className="row">
          {filteredCategories.length === 0 ? (
            <div className="col-12 text-center text-muted py-4">
              {loading ? "Carregando..." : "Nenhuma categoria encontrada"}
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.id} className="col-md-4 mb-3">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    {editingCategory?.id === cat.id ? (
                      // Modo edição
                      <div>
                        <input
                          type="text"
                          className="form-control mb-2"
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({
                            ...editingCategory,
                            name: e.target.value
                          })}
                          disabled={loading}
                          autoFocus
                        />
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={saveEditing}
                            disabled={loading}
                          >
                            ✓ Salvar
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={cancelEditing}
                            disabled={loading}
                          >
                            ✗ Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Modo visualização
                      <div className="text-center">
                        <h5 className="card-title">{cat.name}</h5>
                        <p className="text-muted mb-3">{cat.book_count} livro(s)</p>
                        
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => startEditing(cat)}
                            disabled={loading}
                            title="Editar categoria"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteCategory(cat)}
                            disabled={loading || cat.book_count > 0}
                            title={cat.book_count > 0 ? "Categoria possui livros" : "Excluir categoria"}
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                        
                        {cat.book_count > 0 && (
                          <small className="text-muted d-block mt-2">
                            Não pode ser excluída (possui livros)
                          </small>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ---------------- MODAL PARA NOVA CATEGORIA ---------------- */}
      {showCategoryModal && (
        <CategoryFormModal
          categories={categories}
          onClose={() => setShowCategoryModal(false)}
          onSave={handleCreateCategory}
        />
      )}
    </BaseLayout>
  );
};