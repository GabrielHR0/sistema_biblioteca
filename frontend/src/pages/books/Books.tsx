import React, { useEffect, useState } from "react";
import { BaseLayout } from "@layouts/BaseLayout";
import {
  apiGetBooks,
  apiCreateBook,
  apiDeleteBook,
  apiCreateMultipleCopies,
  apiGetCategories
} from "./BooksService";
import { BookFormModal } from "@components/BookFormModal";
import { useAuth } from "../auth/authContext";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

interface LibraryProps {
  userName: string;
  isAdmin: boolean;
}

export interface Category {
  id: number;
  name: string;
}

export interface BookCopy {
  id?: number;
  edition: string;
  status: "available" | "borrowed" | "lost";
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

export const Books: React.FC<LibraryProps> = ({ userName, isAdmin }) => {
  const { token } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [search, setSearch] = useState("");
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10;
  const navigate = useNavigate();

  // -------------------- FETCH BOOKS --------------------
  useEffect(() => {
    if (!token) return;
    const fetchBooks = async () => {
      try {
        const data = await apiGetBooks(token);
        console.log(data);
        const booksWithCalculations = data.map((book: Book) => ({
          ...book,
          total_copies: book.copies?.length || 0,
          available_copies: book.copies?.filter(copy => copy.status === 'available').length || 0
        }));
        setBooks(booksWithCalculations);
        setFilteredBooks(booksWithCalculations);
      } catch (err) {
        console.error(err);
      }
    };
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
        console.error(err);
      }
    };
    fetchCategories();
  }, [token]);

  // -------------------- FILTRO --------------------
  useEffect(() => {
    let filtered = books;
    if (search) {
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.author.toLowerCase().includes(search.toLowerCase()) ||
          b.categories?.some(cat => 
            cat.name.toLowerCase().includes(search.toLowerCase())
          )
      );
    }
    setFilteredBooks(filtered);
    setCurrentPage(1);
  }, [search, books]);

  // -------------------- CRUD --------------------
  const handleSaveBook = async (bookData: any) => {
  if (!token) return;
    try {
      // Preparar payload com livros + cópias
      const bookPayload: any = {
        title: bookData.title,
        author: bookData.author,
        description: bookData.description,
        category_ids: bookData.category_ids,
      };

      if (bookData.copies && bookData.copies.length > 0) {
        bookPayload.copies = bookData.copies.map((copy: BookCopy) => ({
          edition: copy.edition,
          status: copy.status
        }));
      }

      await apiCreateBook(token, bookPayload);

      const data = await apiGetBooks(token);
      const booksWithCalculations = data.map((book: Book) => ({
        ...book,
        total_copies: book.copies?.length || 0,
        available_copies: book.copies?.filter(copy => copy.status === 'available').length || 0
      }));
      setBooks(booksWithCalculations);
      setShowBookModal(false);
    } catch (err) {
      console.error(err);
    }
  };


  const handleDeleteBook = async (book: Book) => {
    if (!token || !book.id) return;
    if (!window.confirm(`Tem certeza que deseja remover o livro "${book.title}"?`)) {
      return;
    }

    try {
      await apiDeleteBook(token, book.id);
      const data = await apiGetBooks(token);
      const booksWithCalculations = data.map((book: Book) => ({
        ...book,
        total_copies: book.copies?.length || 0,
        available_copies: book.copies?.filter(copy => copy.status === 'available').length || 0
      }));
      setBooks(booksWithCalculations);
    } catch (err) {
      console.error(err);
      alert("Erro ao remover livro.");
    }
  };

  const handleEditBook = (book: Book) => {
    setSelectedBook(book);
    setShowBookModal(true);
  };

  const handleViewCopies = (bookId: number) => {
    navigate(`/books/${bookId}/copies`);
  };

  const handleCreateCategory = async (name: string) => {
    if (!token) return;
    try {
      // Você precisará implementar apiCreateCategory
      // await apiCreateCategory(token, name);
      console.log('Criar categoria:', name);
      // Após criar, recarregar as categorias
      // const categoriesData = await apiGetCategories(token);
      // setCategories(categoriesData);
    } catch (err) {
      console.error(err);
      throw new Error("Erro ao criar categoria");
    }
  };

  // -------------------- PAGINAÇÃO --------------------
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // -------------------- RENDER --------------------
  return (
    <BaseLayout userName={userName} isAdmin={isAdmin}>
      <div className="container p-4">
        <h1 className="mb-4">Biblioteca</h1>

        {/* ---------------- FILTRO DE PESQUISA ---------------- */}
        <div className="row mb-3">
          <div className="col-md-6 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Pesquisar por título, autor ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ---------------- LISTA DE LIVROS ---------------- */}
        <div className="card shadow-lg mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">Livros</h5>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/categories")}
                >
                  Categorias
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    setSelectedBook(null);
                    setShowBookModal(true);
                  }}
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
                  {currentBooks.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center">
                        Nenhum livro encontrado
                      </td>
                    </tr>
                  )}
                  {currentBooks.map((book) => (
                    <tr key={book.id}>
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
                            book.categories.map(category => (
                              <span key={category.id} className="badge bg-secondary">
                                {category.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted">Sem categorias</span>
                          )}
                        </div>
                      </td>
                      <td>{book.total_copies || 0}</td>
                      <td>
                        <span className={`badge ${(book.available_copies || 0) > 0 ? 'bg-success' : 'bg-danger'}`}>
                          {book.available_copies || 0}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => handleViewCopies(book.id!)}
                            title="Ver exemplares"
                          >
                            Exemplares
                          </button>
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEditBook(book)}
                            title="Editar livro"
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteBook(book)}
                            title="Remover livro"
                          >
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ---------------- PAGINAÇÃO ---------------- */}
            {totalPages > 1 && (
              <nav>
                <ul className="pagination justify-content-center mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Anterior
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i + 1}
                      className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                    >
                      <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
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

      {/* ---------------- MODAL ---------------- */}
      {showBookModal && token && (
        <BookFormModal
          book={selectedBook}
          categories={categories}
          onClose={() => setShowBookModal(false)}
          onSave={handleSaveBook}
          onCreateCategory={handleCreateCategory}
        />
      )}
    </BaseLayout>
  );
};