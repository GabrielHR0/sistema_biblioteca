import React, { useEffect, useState } from "react";
import { BaseLayout } from "@layouts/BaseLayout";
import {
  apiGetBooks,
  apiCreateBook,
  apiDeleteBook,
  apiCreateMultipleCopies
} from "./BooksService";
import { BookFormModal } from "@components/BookFormModal";
import { useAuth } from "../auth/authContext";
import { useNavigate } from "react-router-dom"; // <-- IMPORTANTE
import "bootstrap/dist/css/bootstrap.min.css";

interface LibraryProps {
  userName: string;
  isAdmin: boolean;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  total_copies: number;
  created_at: string;
  updated_at: string;
  available_copies?: number;
}

export const Books: React.FC<LibraryProps> = ({ userName, isAdmin }) => {
  const { token } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [search, setSearch] = useState("");
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10;
  const navigate = useNavigate(); // <-- PARA NAVEGAR

  // -------------------- FETCH BOOKS --------------------
  useEffect(() => {
    if (!token) return;
    const fetchBooks = async () => {
      try {
        const data = await apiGetBooks(token);
        const booksWithAvailable = data.map((book: Book) => ({
          ...book,
          available_copies: book.available_copies || 0
        }));
        setBooks(booksWithAvailable);
        setFilteredBooks(booksWithAvailable);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooks();
  }, [token]);

  // -------------------- FILTRO --------------------
  useEffect(() => {
    let filtered = books;
    if (search) {
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.author.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredBooks(filtered);
    setCurrentPage(1);
  }, [search, books]);

  // -------------------- CRUD --------------------
  const handleSaveBook = async (bookData: any) => {
    if (!token) return;
    try {
      const newBook = await apiCreateBook(token, {
        title: bookData.title,
        author: bookData.author
      });

      if (bookData.copies > 0) {
        await apiCreateMultipleCopies(
          token,
          newBook.id,
          bookData.copies,
          bookData.edition || "1ª Edição"
        );
      }

      const data = await apiGetBooks(token);
      const booksWithAvailable = data.map((book: Book) => ({
        ...book,
        available_copies: book.available_copies || 0
      }));
      setBooks(booksWithAvailable);
      setShowBookModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBook = async (book: Book) => {
    if (!token) return;
    try {
      await apiDeleteBook(token, book.id);
      const data = await apiGetBooks(token);
      const booksWithAvailable = data.map((book: Book) => ({
        ...book,
        available_copies: book.available_copies || 0
      }));
      setBooks(booksWithAvailable);
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------- PAGINAÇÃO --------------------
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

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
              placeholder="Pesquisar por título ou autor..."
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
                  onClick={() => navigate("/categories")} // <-- NAVEGAÇÃO
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
                    <th>Cópias</th>
                    <th>Disponível</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBooks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center">
                        Nenhum livro encontrado
                      </td>
                    </tr>
                  )}
                  {currentBooks.map((book) => (
                    <tr key={book.id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.total_copies}</td>
                      <td>{book.available_copies || 0}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteBook(book)}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ---------------- PAGINAÇÃO ---------------- */}
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
          </div>
        </div>
      </div>

      {/* ---------------- MODAL ---------------- */}
      {showBookModal && token && (
        <BookFormModal
          book={selectedBook}
          categories={[]} 
          onClose={() => setShowBookModal(false)}
          onSave={handleSaveBook}
          onCreateCategory={() => {}}
        />
      )}
    </BaseLayout>
  );
};
