// pages/loan/LoanPage.tsx
import React, { useState, useEffect } from "react";
import { BaseLayout } from "@layouts/BaseLayout";
import { LoanService } from "./LoanService";
import { LoanModal } from "@components/public/loanModal/LoanModal";
import { ReturnModal } from "@components/public/loanModal/ReturnModal";
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
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [actionType, setActionType] = useState<"loan" | "return">("loan");
  
  // Estados para filtros
  const [titleSearch, setTitleSearch] = useState("");
  const [authorSearch, setAuthorSearch] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  // -------------------- FETCH BOOKS --------------------
  const fetchBooks = async () => {
    if (!token) {
      console.log('❌ Token não disponível');
      return;
    }
    
    setLoading(true);
    console.log('📚 Buscando livros com filtros:', {
      title: titleSearch,
      author: authorSearch,
      categories: selectedCategoryIds
    });
    
    try {
      const data = await LoanService.searchBooks(token, {
        title: titleSearch,
        author: authorSearch,
        category_id: selectedCategoryIds.length > 0 ? selectedCategoryIds[0] : undefined
      });
      
      console.log('✅ Livros recebidos:', data.length);
      
      const booksWithCalculations = data.map((book: Book) => {
        const total = book.copies?.length || book.total_copies || 0;
        const available = book.copies?.filter(copy => copy.status === 'available').length || book.available_copies || 0;
        const borrowed = book.copies?.filter(copy => copy.status === 'borrowed').length || 0;
        
        return {
          ...book,
          total_copies: total,
          available_copies: available,
          borrowed_copies: borrowed
        };
      });
      
      setBooks(booksWithCalculations);
      setFilteredBooks(booksWithCalculations);
    } catch (err: any) {
      console.error('❌ Erro ao buscar livros:', err);
      alert(err.message || "Erro ao buscar livros");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- FETCH CATEGORIES --------------------
  useEffect(() => {
    if (!token) return;
    
    const fetchCategories = async () => {
      console.log('📋 Buscando categorias...');
      try {
        const categoriesData = await LoanService.getCategories(token);
        console.log('✅ Categorias carregadas:', categoriesData.length);
        setCategories(categoriesData);
      } catch (err) {
        console.error("❌ Erro ao buscar categorias:", err);
      }
    };
    
    fetchCategories();
  }, [token]);

  // -------------------- FILTRO LOCAL --------------------
  useEffect(() => {
    console.log('🔍 Aplicando filtros locais...');
    let filtered = books;
    
    if (titleSearch) {
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(titleSearch.toLowerCase())
      );
    }
    
    if (authorSearch) {
      filtered = filtered.filter(b =>
        b.author.toLowerCase().includes(authorSearch.toLowerCase())
      );
    }
    
    if (selectedCategoryIds.length > 0) {
      filtered = filtered.filter(b =>
        selectedCategoryIds.every(catId => 
          b.categories?.some(cat => cat.id === catId)
        )
      );
    }
    
    console.log('📊 Resultado do filtro:', `${filtered.length} de ${books.length} livros`);
    setFilteredBooks(filtered);
  }, [titleSearch, authorSearch, selectedCategoryIds, books]);

  // -------------------- MANIPULAÇÃO DE CATEGORIAS --------------------
  const toggleCategory = (categoryId: number) => {
    setSelectedCategoryIds(prev => {
      const newSelection = prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      
      console.log('🏷️ Categorias selecionadas:', newSelection);
      return newSelection;
    });
  };

  const clearFilters = () => {
    console.log('🧹 Limpando filtros');
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

  // -------------------- HANDLE BOOK ACTIONS --------------------
  const handleBookAction = async (book: Book, action: "loan" | "return") => {
    if (!token) {
      console.log('❌ Token não disponível para ação do livro');
      return;
    }
    
    console.log('🎯 Ação solicitada:', action, 'para livro:', book.title);
    
    setLoading(true);
    try {
      console.log('📖 Buscando cópias do livro ID:', book.id);
      const copiesData = await LoanService.getBookCopies(token, book.id!);
      console.log('✅ Cópias recebidas:', copiesData.length);
      
      const bookWithCopies = {
        ...book,
        copies: copiesData
      };
      
      const availableCopies = copiesData.filter((copy: BookCopy) => copy.status === "available");
      const borrowedCopies = copiesData.filter((copy: BookCopy) => copy.status === "borrowed");
      
      console.log('📊 Resumo de cópias:', {
        disponíveis: availableCopies.length,
        emprestadas: borrowedCopies.length,
        totais: copiesData.length
      });
      
      if (action === "loan" && availableCopies.length === 0) {
        console.log('❌ Nenhuma cópia disponível para empréstimo');
        alert("Nenhuma cópia disponível para empréstimo!");
        return;
      }
      
      if (action === "return" && borrowedCopies.length === 0) {
        console.log('❌ Nenhuma cópia emprestada para devolução');
        alert("Nenhuma cópia emprestada para devolução!");
        return;
      }
      
      setSelectedBook(bookWithCopies);
      setActionType(action);
      
      if (action === "loan") {
        console.log('📖 Abrindo modal de empréstimo');
        setShowLoanModal(true);
      } else {
        console.log('📚 Abrindo modal de devolução');
        setShowReturnModal(true);
      }
    } catch (err: any) {
      console.error('❌ Erro ao buscar cópias do livro:', err);
      alert(err.message || "Erro ao buscar cópias do livro");
    } finally {
      setLoading(false);
    }
  };

  const handleModalSuccess = () => {
    console.log('✅ Modal concluído com sucesso, atualizando lista...');
    setShowLoanModal(false);
    setShowReturnModal(false);
    setSelectedBook(null);
    fetchBooks(); // Recarrega os dados atualizados
  };

  const getAvailableCopies = (book: Book) => {
    return book.copies?.filter(copy => copy.status === "available").length || 0;
  };

  const getBorrowedCopies = (book: Book) => {
    return book.copies?.filter(copy => copy.status === "borrowed").length || 0;
  };

  // Carregar livros inicialmente
  useEffect(() => {
    if (token) {
      console.log('🚀 Inicializando página de empréstimos...');
      fetchBooks();
    }
  }, [token]);

  return (
    <BaseLayout userName={userName} isAdmin={isAdmin}>
      <div className="container py-4">
        <div className="row mb-4">
          <div className="col">
            <h2 className="mb-2">
              <i className="bi bi-arrow-left-right me-2"></i>
              Gestão de Empréstimos
            </h2>
            <p className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Realize empréstimos e devoluções de livros de forma rápida e simples
            </p>
          </div>
        </div>

        {/* Pesquisa de livros - Versão simplificada */}
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">
              <i className="bi bi-search me-2"></i>
              Pesquisar Livros
            </h5>
            
            <div className="row g-3">
              <div className="col-md-4">
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
              
              <div className="col-md-4">
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
            </div>

            {/* Botões de ação da pesquisa */}
            <div className="row mt-3">
              <div className="col-md-6">
                <button 
                  className="btn btn-primary" 
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
                      <i className="bi bi-search me-2"></i>
                      Buscar Livros
                    </>
                  )}
                </button>
                
                <button 
                  className="btn btn-outline-secondary ms-2"
                  onClick={clearFilters}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Limpar Filtros
                </button>
              </div>
              
              <div className="col-md-6 text-end">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  {filteredBooks.length} livro(s) encontrado(s)
                </small>
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
                      <div className="d-flex flex-column align-items-end">
                        <span className="badge bg-primary mb-1">
                          {getAvailableCopies(book)}/{book.copies?.length || 0}
                        </span>
                        {getBorrowedCopies(book) > 0 && (
                          <span className="badge bg-warning text-dark small">
                            {getBorrowedCopies(book)} emprestada(s)
                          </span>
                        )}
                      </div>
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
                          Disponível: <strong>{getAvailableCopies(book)}</strong> • 
                          Emprestada: <strong>{getBorrowedCopies(book)}</strong>
                        </small>
                      </div>
                      
                      <div className="d-grid gap-2">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleBookAction(book, "loan")}
                          disabled={loading || getAvailableCopies(book) === 0}
                        >
                          <i className="bi bi-book me-2"></i>
                          Realizar Empréstimo
                        </button>
                        
                        <button
                          className="btn btn-warning"
                          onClick={() => handleBookAction(book, "return")}
                          disabled={loading || getBorrowedCopies(book) === 0}
                        >
                          <i className="bi bi-arrow-return-left me-2"></i>
                          Registrar Devolução
                        </button>
                      </div>
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
        ) : !loading ? (
          <div className="text-center py-5">
            <div className="text-muted">
              <i className="bi bi-book display-4"></i>
              <h4 className="mt-3">Nenhum livro cadastrado</h4>
              <p>Comece adicionando livros ao sistema</p>
            </div>
          </div>
        ) : null}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="mt-2">Carregando livros...</p>
          </div>
        )}

        {/* Modais */}
        {showLoanModal && selectedBook && token && (
          <LoanModal
            book={selectedBook}
            token={token}
            onClose={() => {
              console.log('📖 Fechando modal de empréstimo');
              setShowLoanModal(false);
              setSelectedBook(null);
            }}
            onSuccess={handleModalSuccess}
          />
        )}

        {showReturnModal && selectedBook && token && (
          <ReturnModal
            book={selectedBook}
            token={token}
            onClose={() => {
              console.log('📚 Fechando modal de devolução');
              setShowReturnModal(false);
              setSelectedBook(null);
            }}
            onSuccess={handleModalSuccess}
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
        
        .card-title {
          font-size: 1.1rem;
        }
      `}</style>
    </BaseLayout>
  );
};