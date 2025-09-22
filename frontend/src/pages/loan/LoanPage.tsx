import React, { useState } from "react";
import { BaseLayout } from "@layouts/BaseLayout";
import { LoanService } from "./LoanService";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedCopy, setSelectedCopy] = useState<BookCopy | null>(null);

  const [step, setStep] = useState(0);
  const [showLoanModal, setShowLoanModal] = useState(false);

  const [clientSearch, setClientSearch] = useState("");
  const [client, setClient] = useState<any>(null);

  const handleSearchBooks = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const data = await LoanService.searchBooks(searchTerm);
      setBooks(data);
    } catch (err: any) {
      alert(err.message || "Erro ao buscar livros");
    } finally {
      setLoading(false);
    }
  };

  const startLoan = (book: Book) => {
    const availableCopy = book.copies?.find(copy => copy.status === "available");
    if (!availableCopy) {
      alert("Nenhuma cópia disponível para empréstimo!");
      return;
    }
    setSelectedBook(book);
    setSelectedCopy(availableCopy);
    setStep(0);
    setClient(null);
    setClientSearch("");
    setShowLoanModal(true);
  };

  const handleSearchClient = async () => {
    // 🔧 Chamada ao backend para buscar cliente
    console.log("🔎 Buscar cliente:", clientSearch);
    // Simulação de busca
    if (clientSearch.trim()) {
      setClient({
        id: 1,
        fullName: "João Silva",
        email: "joao@email.com"
      });
    }
  };

  const handleRegisterClient = async () => {
    // 🔧 Abrir modal de cadastro de cliente
    console.log("📋 Abrir modal de cadastro de cliente");
    // Simulação de cadastro
    setClient({
      id: 2,
      fullName: "Novo Leitor",
      email: "novo@email.com"
    });
  };

  const handleConfirmLoan = async (password: string) => {
    if (!password) {
      alert("Digite a senha para confirmar!");
      return;
    }
    
    // 🔧 Validar senha e registrar empréstimo
    console.log("✅ Confirmar empréstimo:", {
      book: selectedBook,
      copy: selectedCopy,
      client,
      password,
    });
    
    alert("Empréstimo realizado com sucesso!");
    setShowLoanModal(false);
    setSelectedBook(null);
    setSelectedCopy(null);
    setClient(null);
    setClientSearch("");
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const getAvailableCopies = (book: Book) => {
    return book.copies?.filter(copy => copy.status === "available").length || 0;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      available: "bg-success",
      borrowed: "bg-warning text-dark",
      lost: "bg-danger"
    };
    const texts = {
      available: "Disponível",
      borrowed: "Emprestado",
      lost: "Perdido"
    };
    return <span className={`badge ${styles[status as keyof typeof styles]}`}>
      {texts[status as keyof typeof texts]}
    </span>;
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

        {/* Pesquisa de livros */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-md-8">
                <label htmlFor="bookSearch" className="form-label fw-semibold">
                  <i className="bi bi-search me-1"></i>
                  Pesquisar livros
                </label>
                <input
                  id="bookSearch"
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Digite título, autor ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchBooks()}
                />
              </div>
              <div className="col-md-4">
                <button 
                  className="btn btn-primary btn-lg w-100" 
                  onClick={handleSearchBooks}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search me-2"></i>
                      Buscar Livros
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de livros */}
        {books.length > 0 ? (
          <div className="row g-4">
            {books.map((book) => (
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
                        onClick={() => startLoan(book)}
                        disabled={getAvailableCopies(book) === 0}
                      >
                        {getAvailableCopies(book) > 0 ? (
                          <>
                            <i className="bi bi-cart-check me-2"></i>
                            Realizar Empréstimo
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
        ) : searchTerm && !loading ? (
          <div className="text-center py-5">
            <div className="text-muted">
              <i className="bi bi-book-x display-4"></i>
              <h4 className="mt-3">Nenhum livro encontrado</h4>
              <p>Tente alterar os termos da pesquisa</p>
            </div>
          </div>
        ) : null}

        {/* Modal de empréstimo */}
        {showLoanModal && selectedBook && selectedCopy && (
          <div
            className="modal fade show d-block"
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1050,
            }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-light">
                  <h5 className="modal-title">
                    <i className="bi bi-book me-2"></i>
                    Empréstimo - {selectedBook.title}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowLoanModal(false)}
                  ></button>
                </div>
                
                <div className="modal-body">
                  {/* Indicador de progresso */}
                  <div className="progress mb-4" style={{height: '6px'}}>
                    <div 
                      className="progress-bar" 
                      style={{width: `${((step + 1) / 3) * 100}%`}}
                    ></div>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-3">
                    <span className={`badge ${step >= 0 ? 'bg-primary' : 'bg-secondary'}`}>
                      <i className="bi bi-1-circle me-1"></i>
                      1. Livro
                    </span>
                    <span className={`badge ${step >= 1 ? 'bg-primary' : 'bg-secondary'}`}>
                      <i className="bi bi-2-circle me-1"></i>
                      2. Leitor
                    </span>
                    <span className={`badge ${step >= 2 ? 'bg-primary' : 'bg-secondary'}`}>
                      <i className="bi bi-3-circle me-1"></i>
                      3. Confirmação
                    </span>
                  </div>

                  {step === 0 && (
                    <div>
                      <h6 className="fw-semibold mb-3">
                        <i className="bi bi-book me-1"></i>
                        Livro Selecionado
                      </h6>
                      <div className="card bg-light border-0">
                        <div className="card-body">
                          <h6 className="card-title">
                            <i className="bi bi-bookmark text-primary me-2"></i>
                            {selectedBook.title}
                          </h6>
                          <p className="card-text small text-muted mb-1">
                            <i className="bi bi-person me-1"></i>
                            Autor: {selectedBook.author}
                          </p>
                          <p className="card-text small text-muted mb-1">
                            <i className="bi bi-journal me-1"></i>
                            Edição: {selectedCopy.edition} | Nº: {selectedCopy.number}
                          </p>
                          <p className="card-text small">
                            <i className="bi bi-info-circle me-1"></i>
                            Status: {getStatusBadge(selectedCopy.status)}
                          </p>
                        </div>
                      </div>
                      <div className="d-flex justify-content-end mt-4">
                        <button className="btn btn-primary" onClick={nextStep}>
                          Avançar <i className="bi bi-arrow-right ms-1"></i>
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div>
                      <h6 className="fw-semibold mb-3">
                        <i className="bi bi-person me-1"></i>
                        Selecionar Leitor
                      </h6>
                      
                      {!client ? (
                        <>
                          <div className="input-group mb-3">
                            <span className="input-group-text">
                              <i className="bi bi-search"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Buscar leitor por nome, email ou CPF"
                              value={clientSearch}
                              onChange={(e) => setClientSearch(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearchClient()}
                            />
                            <button
                              className="btn btn-outline-primary"
                              onClick={handleSearchClient}
                            >
                              <i className="bi bi-search me-1"></i>
                              Buscar
                            </button>
                          </div>
                          
                          <div className="d-grid gap-2">
                            <button
                              className="btn btn-outline-secondary"
                              onClick={handleRegisterClient}
                            >
                              <i className="bi bi-person-plus me-2"></i>
                              Cadastrar Novo Leitor
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="alert alert-success">
                          <h6 className="alert-heading">
                            <i className="bi bi-person-check me-1"></i>
                            Leitor Selecionado
                          </h6>
                          <strong>{client.fullName}</strong><br/>
                          <small className="text-muted">
                            <i className="bi bi-envelope me-1"></i>
                            {client.email}
                          </small>
                          <button
                            className="btn btn-sm btn-outline-secondary mt-2"
                            onClick={() => setClient(null)}
                          >
                            <i className="bi bi-arrow-repeat me-1"></i>
                            Alterar
                          </button>
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-between mt-4">
                        <button className="btn btn-outline-secondary" onClick={prevStep}>
                          <i className="bi bi-arrow-left me-1"></i>
                          Voltar
                        </button>
                        {client && (
                          <button className="btn btn-primary" onClick={nextStep}>
                            Avançar <i className="bi bi-arrow-right ms-1"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <h6 className="fw-semibold mb-3">
                        <i className="bi bi-check-circle me-1"></i>
                        Confirmar Empréstimo
                      </h6>
                      
                      <div className="card mb-3">
                        <div className="card-body">
                          <h6 className="card-title">
                            <i className="bi bi-list-check me-2"></i>
                            Resumo do Empréstimo
                          </h6>
                          <div className="row small">
                            <div className="col-6">
                              <strong>
                                <i className="bi bi-book me-1"></i>
                                Livro:
                              </strong><br/>
                              {selectedBook.title}
                            </div>
                            <div className="col-6">
                              <strong>
                                <i className="bi bi-person me-1"></i>
                                Leitor:
                              </strong><br/>
                              {client.fullName}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label small fw-semibold">
                          <i className="bi bi-shield-lock me-1"></i>
                          Senha do Leitor para Confirmação
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-key"></i>
                          </span>
                          <input
                            id="password"
                            type="password"
                            className="form-control"
                            placeholder="Digite a senha do leitor"
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                handleConfirmLoan((e.target as HTMLInputElement).value);
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="d-flex justify-content-between">
                        <button className="btn btn-outline-secondary" onClick={prevStep}>
                          <i className="bi bi-arrow-left me-1"></i>
                          Voltar
                        </button>
                        <button
                          className="btn btn-success"
                          onClick={() =>
                            handleConfirmLoan(
                              (document.querySelector("input[type=password]") as HTMLInputElement)
                                ?.value || ""
                            )
                          }
                        >
                          <i className="bi bi-check-lg me-2"></i>
                          Confirmar Empréstimo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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
        
        .progress-bar {
          transition: width 0.3s ease-in-out;
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