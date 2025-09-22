import React, { useEffect, useState } from "react";
import { BaseLayout } from "@layouts/BaseLayout";
import { apiGetCategories, apiCreateCategory } from "./BooksService";
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

  // -------------------- FETCH CATEGORIAS --------------------
  useEffect(() => {
    if (!token) return;
    const fetchCategories = async () => {
      try {
        const data = await apiGetCategories(token);
        setCategories(data);
        setFilteredCategories(data);
      } catch (err) {
        console.error(err);
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

  // -------------------- CRIAR CATEGORIA --------------------
  const handleCreateCategory = async (name: string) => {
    if (!token) return;
    try {
      await apiCreateCategory(token, { name });
      const data = await apiGetCategories(token);
      setCategories(data);
      setShowCategoryModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <BaseLayout userName={userName} isAdmin={isAdmin}>
      <div className="container p-4">
        <h1 className="mb-4">Categorias</h1>

        {/* ---------------- FILTRO DE PESQUISA ---------------- */}
        <div className="row mb-3">
          <div className="col-md-6 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Pesquisar categorias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-6 mb-2 text-md-end">
            <button
              className="btn btn-success"
              onClick={() => setShowCategoryModal(true)}
            >
              + Nova Categoria
            </button>
          </div>
        </div>

        {/* ---------------- CARDS DE CATEGORIAS ---------------- */}
        <div className="row">
          {filteredCategories.length === 0 && (
            <div className="text-center text-muted">
              Nenhuma categoria encontrada
            </div>
          )}

          {filteredCategories.map((cat) => (
            <div key={cat.id} className="col-md-3 mb-3">
              <div className="card shadow-sm h-100">
                <div className="card-body text-center">
                  <h5>{cat.name}</h5>
                  <p className="text-muted">{cat.book_count} livro(s)</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- MODAL ---------------- */}
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
