import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BaseLayout } from "@layouts/BaseLayout";
import {
  apiGetBooks,
  apiCreateBook,
  apiUpdateBook,
  apiDeleteBook,
  apiGetCategories,
  apiCreateCategory,
  apiGetCopiesByBook,
  apiUpdateCopy,
  apiDeleteCopy,
  apiGetCopies,
  apiCreateCopy
} from "./BooksService";
import { BookFormModal } from "@components/public/BookFormModal";
import { CopiesModal } from "@components/public/CopiesModal";
import { useAuth } from "../auth/authContext";
import "bootstrap/dist/css/bootstrap.min.css";

interface LibraryProps {
  userName: string;
  isAdmin: boolean;
}

export interface Category {
  id: number;
  name: string;
}

export interface Loan {
  id?: number;
  copy_id: number;
  user_id: number | null;
  client_id: number;
  loan_date: string;
  due_date: string;
  return_date?: string | null;
  status: string;
  renewals_count?: number | null;
}

export interface BookCopy {
  id?: number;
  edition: string;
  status: "available" | "borrowed" | "lost";
  number?: number;
  book_id?: number;
  loans?: Loan[];
  created_at?: string;
  updated_at?: string;
}

export interface Book {
  id?: number;
  title: string;
  author: string;
  description?: string;
  categories?: Category[];
  copies?: BookCopy[];
  total_copies?: number;
  available_copies?: number;
}

export const Books: React.FC<LibraryProps> = ({ userName, isAdmin }) => {
  const { token } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showCopiesModal, setShowCopiesModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedBookCopies, setSelectedBookCopies] = useState<Book | null>(null);

  // Filtros
  const [titleSearch, setTitleSearch] = useState("");
  const [authorSearch, setAuthorSearch] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const booksPerPage = 10;
  const navigate = useNavigate();
  const location = useLocation();

  // -------------------- FETCH BOOKS --------------------
  const fetchBooks = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiGetBooks(token);
      const booksWithCalculations = data.map((book: Book) => {
        const total = book.copies?.length || book.total_copies || 0;
        const available =
          book.copies?.filter((copy) => copy.status === "available").length ||
          book.available_copies ||
          0;
        return {
          ...book,
          total_copies: total,
          available_copies: available
        };
      });
      setBooks(booksWithCalculations);
      setFilteredBooks(booksWithCalculations);
    } catch (err) {
      console.error("Erro ao buscar livros:", err);
      alert("Erro ao carregar livros");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const modalParam = searchParams.get("modal");
    if (modalParam === "livro") {
      setSelectedBook(null); // para abrir novo livro, não editar
      setShowBookModal(true);

      searchParams.delete("modal");
      navigate({
        pathname: location.pathname,
        search: searchParams.toString()
      }, { replace: true });
    }
  }, [location.search, navigate, location.pathname]);


  useEffect(() => {
    fetchBooks();
  }, [token]);

  // -------------------- FETCH CATEGORIES --------------------
  useEffect(() => {
    if (!token) return;
    const fetchCategories = async () => {
      try {
        const categoriesData = await apiGetCategories(token);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
      }
    };
    fetchCategories();
  }, [token]);

  // -------------------- CÓPIAS COM EMPRÉSTIMOS --------------------
  const fetchCopiesWithLoans = async (bookId: number) => {
    if (!token) return [];
    try {
      const allCopies = await apiGetCopies(token);
      const bookCopies = allCopies.filter((copy: BookCopy) => copy.book_id === bookId);
      return bookCopies;
    } catch (err) {
      try {
        return await apiGetCopiesByBook(token, bookId);
      } catch (fallbackErr) {
        console.error("Erro ao buscar cópias:", err, fallbackErr);
        return [];
      }
    }
  };

  // -------------------- CRIAR CÓPIA (novas) --------------------
  const handleCreateCopy = async (bookId: number, copyData: any) => {
    if (!token) return;
    try {
      const newCopy = await apiCreateCopy(token, { ...copyData, book_id: bookId });
      return newCopy;
    } catch (err: any) {
      console.error("Erro ao criar cópia:", err);
      throw new Error(err.message || "Erro ao criar cópia");
    }
  };

  // -------------------- FILTROS --------------------
  useEffect(() => {
    let filtered = books;
    if (titleSearch) {
      filtered = filtered.filter((b) =>
        b.title.toLowerCase().includes(titleSearch.toLowerCase())
      );
    }
    if (authorSearch) {
      filtered = filtered.filter((b) =>
        b.author.toLowerCase().includes(authorSearch.toLowerCase())
      );
    }
    if (selectedCategoryIds.length > 0) {
      filtered = filtered.filter((b) =>
        b.categories?.some((cat) => selectedCategoryIds.includes(cat.id))
      );
    }
    setFilteredBooks(filtered);
    setCurrentPage(1);
  }, [titleSearch, authorSearch, selectedCategoryIds, books]);

  // -------------------- MANIPULAÇÃO DE CATEGORIAS --------------------
  const toggleCategory = (categoryId: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setTitleSearch("");
    setAuthorSearch("");
    setSelectedCategoryIds([]);
  };

  const getSelectedCategoriesText = () => {
    if (selectedCategoryIds.length === 0) return "Todas as categorias";
    if (selectedCategoryIds.length === 1) {
      const category = categories.find((c) => c.id === selectedCategoryIds[0]);
      return category?.name || "1 categoria";
    }
    return `${selectedCategoryIds.length} categorias`;
  };

  // -------------------- CRUD LIVROS --------------------
  const handleSaveBook = async (bookData: any) => {
    if (!token) return;
    setLoading(true);
    try {
      const bookPayload: any = {
        title: bookData.title,
        author: bookData.author,
        description: bookData.description,
        category_ids: bookData.category_ids
      };

      if (bookData.copies && bookData.copies.length > 0) {
        bookPayload.copies = bookData.copies.map((copy: BookCopy) => ({
          edition: copy.edition,
          status: copy.status,
          number: copy.number
        }));
      }

      if (bookData.id) {
        await apiUpdateBook(token, bookData.id, bookPayload);
        alert("Livro atualizado com sucesso!");
      } else {
        await apiCreateBook(token, bookPayload);
        alert("Livro criado com sucesso!");
      }

      await fetchBooks();
      setShowBookModal(false);
    } catch (err: any) {
      console.error("Erro ao salvar livro:", err);
      alert(err.message || "Erro ao salvar livro");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (name: string) => {
    if (!token) return;
    try {
      const newCategory = await apiCreateCategory(token, name);
      const categoriesData = await apiGetCategories(token);
      setCategories(categoriesData);
      return newCategory;
    } catch (err: any) {
      console.error("Erro ao criar categoria:", err);
      throw new Error(err.message || "Erro ao criar categoria");
    }
  };


  const handleUpdateBook = async (bookData: any) => {
    if (!token || !bookData.id) return;
    setLoading(true);
    try {
      // Atualiza dados do livro
      const bookPayload: any = {
        title: bookData.title,
        author: bookData.author,
        description: bookData.description,
        category_ids: bookData.category_ids
      };
      await apiUpdateBook(token, bookData.id, bookPayload);

      // Cria somente novas cópias (se houver)
      if (bookData.copies && bookData.copies.length > 0) {
        const copyPromises = bookData.copies.map((copy: BookCopy) =>
          handleCreateCopy(bookData.id, copy)
        );
        await Promise.all(copyPromises);
      }

      await fetchBooks();
      setShowBookModal(false);
      alert("Livro atualizado com sucesso!");
    } catch (err: any) {
      console.error("Erro ao atualizar livro:", err);
      alert(err.message || "Erro ao atualizar livro");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async (bookData: any) => {
    if (!token) return;
    setLoading(true);
    try {
      const bookPayload: any = {
        title: bookData.title,
        author: bookData.author,
        description: bookData.description,
        category_ids: bookData.category_ids
      };

      if (bookData.copies && bookData.copies.length > 0) {
        bookPayload.copies = bookData.copies.map((copy: BookCopy) => ({
          edition: copy.edition,
          status: copy.status,
          number: copy.number
        }));
      }

      await apiCreateBook(token, bookPayload);
      await fetchBooks();
      setShowBookModal(false);
      alert("Livro criado com sucesso!");
    } catch (err: any) {
      console.error("Erro ao criar livro:", err);
      alert(err.message || "Erro ao criar livro");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (book: Book) => {
    if (!token || !book.id) return;
    if (!window.confirm(`Tem certeza que deseja remover o livro "${book.title}"?`)) return;

    setLoading(true);
    try {
      await apiDeleteBook(token, book.id);
      await fetchBooks();
      alert("Livro removido com sucesso!");
    } catch (err: any) {
      console.error("Erro ao deletar livro:", err);
      alert(err.message || "Erro ao remover livro");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- CÓPIAS: UPDATE/DELETE --------------------
  const handleDeleteCopy = async (copyId: number) => {
    if (!token) return;
    if (!window.confirm("Tem certeza que deseja excluir este exemplar?")) return;

    setLoading(true);
    try {
      await apiDeleteCopy(token, copyId);
      // Atualiza o modal de cópias, se aberto
      if (selectedBookCopies?.id) {
        const copiesData = await fetchCopiesWithLoans(selectedBookCopies.id);
        setSelectedBookCopies({ ...selectedBookCopies, copies: copiesData });
      }
      await fetchBooks();
      alert("Exemplar excluído com sucesso!");
    } catch (err: any) {
      console.error("Erro ao deletar exemplar:", err);
      alert(err.message || "Erro ao excluir exemplar");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCopy = async (copyId: number, copyData: any) => {
    if (!token) return;
    setLoading(true);
    try {
      await apiUpdateCopy(token, copyId, copyData);
      if (selectedBookCopies?.id) {
        const copiesData = await fetchCopiesWithLoans(selectedBookCopies.id);
        setSelectedBookCopies({ ...selectedBookCopies, copies: copiesData });
      }
      await fetchBooks();
      alert("Exemplar atualizado com sucesso!");
    } catch (err: any) {
      console.error("Erro ao atualizar exemplar:", err);
      alert(err.message || "Erro ao atualizar exemplar");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Ações de UI --------------------
  const handleEditBook = async (book: Book) => {
    if (!token || !book.id) {
      setSelectedBook(book);
      setShowBookModal(true);
      return;
    }
    setLoading(true);
    try {
      // Carrega cópias do livro antes de abrir o modal, para permitir editar/deletar no próprio modal
      const copiesData = await fetchCopiesWithLoans(book.id);
      setSelectedBook({ ...book, copies: copiesData });
      setShowBookModal(true);
    } catch (err) {
      console.error("Erro ao carregar exemplares para edição:", err);
      setSelectedBook(book);
      setShowBookModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCopies = async (book: Book) => {
    if (!token || !book.id) return;
    setLoading(true);
    try {
      const copiesData = await fetchCopiesWithLoans(book.id);
      setSelectedBookCopies({ ...book, copies: copiesData });
      setShowCopiesModal(true);
    } catch (err) {
      console.error("Erro ao buscar exemplares:", err);
      alert("Erro ao carregar exemplares");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Paginação --------------------
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // -------------------- Render --------------------
  return (
    <BaseLayout userName={userName} isAdmin={isAdmin}>
      <div className="container py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <h2>
              <i className="bi bi-book me-2"></i>Livros
            </h2>
            <p className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Cadastre e edite os livros da biblioteca
            </p>
          </div>
        </div>

        {loading && <div className="alert alert-info">Carregando...</div>}

        {/* FILTROS */}
        <div className="row mb-3">
          <div className="col-md-3 mb-2">
            <label className="form-label">Título</label>
            <input
              type="text"
              className="form-control"
              placeholder="Pesquisar por título..."
              value={titleSearch}
              onChange={(e) => setTitleSearch(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="col-md-3 mb-2">
            <label className="form-label">Autor</label>
            <input
              type="text"
              className="form-control"
              placeholder="Pesquisar por autor..."
              value={authorSearch}
              onChange={(e) => setAuthorSearch(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="col-md-4 mb-2">
            <label className="form-label">Categorias</label>
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
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  <div className="row">
                    {categories.map((category) => (
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

          <div className="col-md-2 mb-2 d-flex align-items-end">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={clearFilters}
              disabled={loading}
            >
              Limpar
            </button>
          </div>
        </div>

        {/* LISTA DE LIVROS */}
        <div className="card shadow-lg mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">
                Livros ({filteredBooks.length})
                {(titleSearch || authorSearch || selectedCategoryIds.length > 0) && (
                  <small className="text-muted ms-2">(filtrado)</small>
                )}
              </h5>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/categories")}
                  disabled={loading}
                >
                  Categorias
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    setSelectedBook(null);
                    setShowBookModal(true);
                  }}
                  disabled={loading}
                >
                  + Novo Livro
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>Categorias</th>
                    <th>Total de Cópias</th>
                    <th>Disponíveis</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBooks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        {loading ? "Carregando..." : "Nenhum livro encontrado"}
                      </td>
                    </tr>
                  ) : (
                    currentBooks.map((book) => (
                      <tr
                        key={book.id}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleViewCopies(book)}
                        title="Clique para ver os exemplares"
                      >
                        <td>
                          <div>
                            <strong>{book.title}</strong>
                            {book.description && (
                              <small className="d-block text-muted">
                                {book.description.length > 50
                                  ? `${book.description.substring(0, 50)}...`
                                  : book.description}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>{book.author}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {book.categories && book.categories.length > 0 ? (
                              book.categories.map((category) => (
                                <span key={category.id} className="badge bg-secondary">
                                  {category.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted">Sem categorias</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-primary">
                            {book.total_copies || 0}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              (book.available_copies || 0) > 0 ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {book.available_copies || 0}
                          </span>
                        </td>
                        <td>
                          <div
                            className="d-flex gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => handleEditBook(book)}
                              title="Editar livro"
                              disabled={loading}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteBook(book)}
                              title="Remover livro"
                              disabled={loading}
                            >
                              Remover
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <nav>
                <ul className="pagination justify-content-center mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={loading}
                    >
                      Anterior
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i + 1}
                      className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(i + 1)}
                        disabled={loading}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={loading}
                    >
                      Próximo
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE LIVRO: com edição/remoção de cópias existentes via callbacks */}
      {showBookModal && token && (
        <BookFormModal
          book={selectedBook}
          categories={categories}
          onClose={() => setShowBookModal(false)}
          onSave={selectedBook ? handleUpdateBook : handleCreateBook}
          onCreateCategory={handleCreateCategory}
          onUpdateCopy={isAdmin ? handleUpdateCopy : undefined}
          onDeleteCopy={isAdmin ? handleDeleteCopy : undefined}
        />
      )}

      {/* MODAL DE EXEMPLARES: visualização detalhada (opcional) */}
      {showCopiesModal && selectedBookCopies && token && (
        <CopiesModal
          book={selectedBookCopies}
          copies={selectedBookCopies.copies || []}
          onClose={() => {
            setShowCopiesModal(false);
            setSelectedBookCopies(null);
          }}
          onUpdateCopy={isAdmin ? handleUpdateCopy : undefined}
          onDeleteCopy={isAdmin ? handleDeleteCopy : undefined}
        />
      )}
    </BaseLayout>
  );
};
