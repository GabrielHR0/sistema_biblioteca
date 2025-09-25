import React, { useState, useEffect } from "react";
import { BaseLayout } from "@layouts/BaseLayout";
import { LoanService } from "./LoanService";
import { LoanModal } from "@components/public/loanModal/LoanModal";
import { useAuth } from "../auth/authContext";
import "bootstrap/dist/css/bootstrap.min.css";

export interface BookCopy {
  id?: number;
  number?: number | any;
  edition: string;
  status: "available" | "borrowed" | "lost";
  due_date?: string;
}

export interface Category {
  id: number;
  name: string;
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

interface LibraryProps {
  userName: string;
  isAdmin: boolean;
}

export const LoanPage: React.FC<LibraryProps> = ({ userName, isAdmin }) => {
  const { token } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  // Estados para filtros (igual ao Books)
  const [titleSearch, setTitleSearch] = useState("");
  const [authorSearch, setAuthorSearch] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  // -------------------- FETCH BOOKS --------------------
  const fetchBooks = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Usando o endpoint específico para interseção
      const data = await LoanService.searchBooks(token, {
        title: titleSearch,
        author: authorSearch,
        category_id: selectedCategoryIds.length > 0 ? selectedCategoryIds[0] : undefined
      });
      
      const booksWithCalculations = data.map((book: Book) => {
        const total = book.copies?.length || book.total_copies || 0;
        const available = book.copies?.filter(copy => copy.status === 'available').length || book.available_copies || 0;
        
        return {
          ...book,
          total_copies: total,
          available_copies: available
        };
      });
      
      setBooks(booksWithCalculations);
      setFilteredBooks(booksWithCalculations);
    } catch (err: any) {
      alert(err.message || "Erro ao buscar livros");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- FETCH CATEGORIES --------------------
  useEffect(() => {
    if (!token) return;
    const fetchCategories = async () => {
      try {
        const categoriesData = await LoanService.getCategories(token);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
      }
    };
    fetchCategories();
  }, [token]);

  // -------------------- FILTRO LOCAL (igual ao Books) --------------------
  useEffect(() => {
    let filtered = books;
    
    // Filtro por título
    if (titleSearch) {
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(titleSearch.toLowerCase())
      );
    }
    
    // Filtro por autor
    if (authorSearch) {
      filtered = filtered.filter(b =>
        b.author.toLowerCase().includes(authorSearch.toLowerCase())
      );
    }
    
    // Filtro por categorias (AND - múltiplas categorias)
    if (selectedCategoryIds.length > 0) {
      filtered = filtered.filter(b =>
        selectedCategoryIds.every(catId => 
          b.categories?.some(cat => cat.id === catId)
        )
      );
    }
    
    setFilteredBooks(filtered);
  }, [titleSearch, authorSearch, selectedCategoryIds, books]);

  // -------------------- MANIPULAÇÃO DE CATEGORIAS (igual ao Books) --------------------
  const toggleCategory = (categoryId: number) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const clearFilters = () => {
    setTitleSearch("");
    setAuthorSearch("");
    setSelectedCategoryIds([]);
  };

  const getSelectedCategoriesText = () => {
    if (selectedCategoryIds.length === 0) return "Todas as categorias";
    if (selectedCategoryIds.length === 1) {
      const category = categories.find(c => c.id === selectedCategoryIds[0]);
      return category?.name || "1 categoria";
    }
    return `${selectedCategoryIds.length} categorias`;
  };

  // -------------------- HANDLE BOOK SELECT --------------------
  const handleBookSelect = async (book: Book) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const copiesData = await LoanService.getBookCopies(token, book.id!);
      const bookWithCopies = {
        ...book,
        copies: copiesData
      };
      
      const availableCopies = copiesData.filter((copy: BookCopy) => copy.status === "available");
      
      if (availableCopies.length === 0) {
        alert("Nenhuma cópia disponível para empréstimo!");
        return;
      }
      
      setSelectedBook(bookWithCopies);
      setShowLoanModal(true);
    } catch (err: any) {
      alert(err.message || "Erro ao buscar cópias do livro");
    } finally {
      setLoading(false);
    }
  };

  const handleLoanSuccess = () => {
    setShowLoanModal(false);
    setSelectedBook(null);
    fetchBooks(); // Recarrega a lista
  };

  const getAvailableCopies = (book: Book) => {
    return book.copies?.filter(copy => copy.status === "available").length || 0;
  };

  return (
    <BaseLayout userName={userName} isAdmin={isAdmin}>
      <div className="container py-4">
        <div className="row mb-4">
          <div className="col">
            <h2 className="mb-2">
              <i className="bi bi-book me-2"></i>
              Empréstimos
            </h2>
            <p className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Realize empréstimos de livros de forma rápida e simples
            </p>
          </div>
        </div>

        {/* Pesquisa de livros - Filtros iguais ao Books */}
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">
              <i className="bi bi-search me-2"></i>
              Pesquisar Livros
            </h5>
            
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Título</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Digite o título..."
                  value={titleSearch}
                  onChange={(e) => setTitleSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="col-md-3">
                <label className="form-label fw-semibold">Autor</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Digite o autor..."
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="col-md-4">
                <label className="form-label fw-semibold">Categorias</label>
                <div className="dropdown">
                  <button
                    className="form-control text-start dropdown-toggle"
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    disabled={loading}
                  >
                    {getSelectedCategoriesText()}
                  </button>
                  
                  {isCategoryDropdownOpen && (
                    <div 
                      className="dropdown-menu show w-100 p-3"
                      style={{ maxHeight: '300px', overflowY: 'auto' }}
                    >
                      <div className="row">
                        {categories.map(category => (
                          <div key={category.id} className="col-md-6 mb-2">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={selectedCategoryIds.includes(category.id)}
                                onChange={() => toggleCategory(category.id)}
                                id={`filter-category-${category.id}`}
                              />
                              <label 
                                className="form-check-label" 
                                htmlFor={`filter-category-${category.id}`}
                              >
                                {category.name}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {categories.length === 0 && (
                        <div className="text-muted text-center">
                          Nenhuma categoria disponível
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
                <div className="col-md-2 d-flex align-items-end gap-2">
                  <button 
                    className="btn btn-primary btn-sm w-100" 
                    onClick={fetchBooks}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Buscando
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search me-2 fs-7"></i>
                        Buscar
                      </>
                    )}
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={clearFilters}
                    disabled={loading}
                  >
                    Limpar
                  </button>
                </div>
            </div>
          </div>
        </div>

        {/* Lista de livros */}
        {filteredBooks.length > 0 ? (
          <div className="row g-4">
            {filteredBooks.map((book) => (
              <div key={book.id} className="col-md-6 col-lg-4">
                <div className="card h-100 book-card">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title text-truncate" title={book.title}>
                        <i className="bi bi-bookmark me-2 text-primary"></i>
                        {book.title}
                      </h5>
                      <span className="badge bg-primary fs-6">
                        {getAvailableCopies(book)}/{book.copies?.length || 0}
                      </span>
                    </div>
                    
                    <p className="card-text text-muted small mb-2">
                      <i className="bi bi-person me-1"></i>
                      por <strong>{book.author}</strong>
                    </p>
                    
                    {book.description && (
                      <p className="card-text small text-muted mb-3">
                        <i className="bi bi-text-paragraph me-1"></i>
                        {book.description.length > 100 
                          ? `${book.description.substring(0, 100)}...` 
                          : book.description}
                      </p>
                    )}
                    
                    {book.categories && book.categories.length > 0 && (
                      <div className="mb-3">
                        <div className="d-flex flex-wrap gap-1">
                          <i className="bi bi-tags me-1 text-muted"></i>
                          {book.categories.slice(0, 3).map((category) => (
                            <span key={category.id} className="badge bg-light text-dark border small">
                              {category.name}
                            </span>
                          ))}
                          {book.categories.length > 3 && (
                            <span className="badge bg-light text-muted border small">
                              +{book.categories.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                          <i className="bi bi-copy me-1"></i>
                          Cópias disponíveis: <strong>{getAvailableCopies(book)}</strong>
                        </small>
                        {getAvailableCopies(book) > 0 ? (
                          <span className="badge bg-success">
                            <i className="bi bi-check-circle me-1"></i>
                            Disponível
                          </span>
                        ) : (
                          <span className="badge bg-secondary">
                            <i className="bi bi-clock me-1"></i>
                            Indisponível
                          </span>
                        )}
                      </div>
                      
                      <button
                        className="btn btn-primary w-100"
                        onClick={() => handleBookSelect(book)}
                        disabled={loading || getAvailableCopies(book) === 0}
                      >
                        {getAvailableCopies(book) > 0 ? (
                          <>
                            <i className="bi me-2"></i>
                            Empréstimos
                          </>
                        ) : (
                          <>
                            <i className="bi bi-clock me-2"></i>
                            Indisponível
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (titleSearch || authorSearch || selectedCategoryIds.length > 0) && !loading ? (
          <div className="text-center py-5">
            <div className="text-muted">
              <i className="bi bi-book-x display-4"></i>
              <h4 className="mt-3">Nenhum livro encontrado</h4>
              <p>Tente alterar os termos da pesquisa</p>
            </div>
          </div>
        ) : null}

        {showLoanModal && selectedBook && token && (
          <LoanModal
            book={selectedBook}
            token={token}
            onClose={() => {
              setShowLoanModal(false);
              setSelectedBook(null);
            }}
            onSuccess={handleLoanSuccess}
          />
        )}
      </div>

      <style>{`
        .book-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          border: 1px solid #e0e0e0;
        }
        
        .book-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .badge {
          font-size: 0.75em;
        }
        
        .bi {
          font-size: 0.9em;
        }
      `}</style>
    </BaseLayout>
  );
};