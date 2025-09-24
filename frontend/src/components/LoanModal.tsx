// components/LoanModal.tsx
import React, { useState, useEffect } from "react";
import { LoanService } from "@pages/loan/LoanService";
import { checkClientPassword } from "@pages/clients/ClientService";

export interface BookCopy {
  id?: number;
  number?: number | any;
  edition: string;
  status: "available" | "borrowed" | "lost";
  due_date?: string;
}

export interface Book {
  id?: number;
  title: string;
  author: string;
  description?: string;
  categories?: any[];
  copies?: BookCopy[];
}

interface LoanModalProps {
  book: Book;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  book,
  token,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState(0);
  const [selectedCopy, setSelectedCopy] = useState<BookCopy | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [copies, setCopies] = useState<BookCopy[]>(book.copies || []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCopies = async () => {
      if (!book.id) return;
      
      try {
        setLoading(true);
        const copiesData = await LoanService.getBookCopies(token, book.id);
        setCopies(copiesData);
      } catch (err: any) {
        console.error("Erro ao buscar cópias:", err);
        setError(err.message || "Erro ao buscar cópias do livro");
      } finally {
        setLoading(false);
      }
    };

    fetchCopies();
  }, [book.id, token]);

  const handleSearchClients = async () => {
    if (!clientSearch.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const clientsData = await LoanService.searchClients(token, clientSearch);
      setClients(clientsData);
    } catch (err: any) {
      console.error("Erro ao buscar clientes:", err);
      setError(err.message || "Erro ao buscar clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    if (!clientSearch.trim()) {
      setError("Digite um nome para o novo cliente");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Cria um email baseado no nome (você pode modificar esta lógica)
      const email = `${clientSearch.toLowerCase().replace(/\s+/g, '.')}@biblioteca.com`;
      
      const newClient = await LoanService.createClient(token, {
        name: clientSearch,
        email: email
      });

      setSelectedClient(newClient);
      setClients([newClient]);
      setError(null);
    } catch (err: any) {
      console.error("Erro ao criar cliente:", err);
      setError(err.message || "Erro ao criar cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLoan = async () => {
    if (!selectedClient || !selectedCopy || !password) {
      setError("Preencha todos os campos obrigatórios!");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const passwordCheck = await checkClientPassword(token, password, selectedClient.id);
      
      if (!passwordCheck.valid) {
        throw new Error("Senha do cliente incorreta");
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15); 

      await LoanService.createLoan(token, {
        copy_id: selectedCopy.id!,
        client_id: selectedClient.id,
      });

      alert("Empréstimo realizado com sucesso!");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erro ao realizar empréstimo:", err);
      setError(err.message || "Erro ao realizar empréstimo");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setError(null);
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setError(null);
    setStep(prev => Math.max(prev - 1, 0));
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
    return (
      <span className={`badge ${styles[status as keyof typeof styles]}`}>
        {texts[status as keyof typeof texts]}
      </span>
    );
  };

  const availableCopies = copies.filter(copy => copy.status === "available");

  return (
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
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="bi bi-book me-2"></i>
              Empréstimo - {book.title}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          
          <div className="modal-body">
            {/* Exibição de erro */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{error}</div>
              </div>
            )}

            {/* Indicador de progresso */}
            <div className="progress mb-4" style={{height: '8px'}}>
              <div 
                className="progress-bar bg-primary" 
                style={{width: `${((step + 1) / 3) * 100}%`}}
              ></div>
            </div>
            
            <div className="d-flex justify-content-between mb-4">
              <span className={`badge ${step >= 0 ? 'bg-primary' : 'bg-secondary'} fs-6 p-2`}>
                <i className="bi bi-1-circle me-1"></i>
                1. Selecionar Cópia
              </span>
              <span className={`badge ${step >= 1 ? 'bg-primary' : 'bg-secondary'} fs-6 p-2`}>
                <i className="bi bi-2-circle me-1"></i>
                2. Selecionar Leitor
              </span>
              <span className={`badge ${step >= 2 ? 'bg-primary' : 'bg-secondary'} fs-6 p-2`}>
                <i className="bi bi-3-circle me-1"></i>
                3. Confirmação
              </span>
            </div>

            {/* Etapa 1: Seleção de Cópia */}
            {step === 0 && (
              <div>
                <h6 className="fw-semibold mb-3">
                  <i className="bi bi-book me-1"></i>
                  Selecionar Cópia do Livro
                </h6>
                
                <div className="card bg-light mb-3">
                  <div className="card-body">
                    <h6 className="card-title">
                      <i className="bi bi-bookmark text-primary me-2"></i>
                      {book.title}
                    </h6>
                    <p className="card-text mb-1">
                      <i className="bi bi-person me-1"></i>
                      <strong>Autor:</strong> {book.author}
                    </p>
                    <p className="card-text mb-0">
                      <i className="bi bi-journal me-1"></i>
                      <strong>Cópias disponíveis:</strong> {availableCopies.length}
                    </p>
                  </div>
                </div>

                <h6 className="fw-semibold mb-3">Cópias Disponíveis:</h6>
                
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="mt-2">Carregando cópias...</p>
                  </div>
                ) : availableCopies.length === 0 ? (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Nenhuma cópia disponível no momento.
                  </div>
                ) : (
                  <div className="row g-3">
                    {availableCopies.map((copy) => (
                      <div key={copy.id} className="col-md-6">
                        <div 
                          className={`card cursor-pointer ${selectedCopy?.id === copy.id ? 'border-primary' : ''}`}
                          style={{ 
                            cursor: 'pointer',
                            border: selectedCopy?.id === copy.id ? '2px solid #0d6efd' : '1px solid #dee2e6'
                          }}
                          onClick={() => setSelectedCopy(copy)}
                        >
                          <div className="card-body text-center">
                            <h5 className="card-title">
                              <i className="bi bi-journal me-2"></i>
                              Cópia #{copy.number}
                            </h5>
                            <p className="card-text">
                              <strong>Edição:</strong> {copy.edition}
                            </p>
                            <div className="mb-2">
                              {getStatusBadge(copy.status)}
                            </div>
                            {selectedCopy?.id === copy.id && (
                              <div className="text-success">
                                <i className="bi bi-check-circle-fill me-1"></i>
                                Selecionada
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="d-flex justify-content-between mt-4">
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={onClose}
                    disabled={loading}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Cancelar
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={nextStep}
                    disabled={!selectedCopy || loading}
                  >
                    Avançar <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Etapa 2: Seleção de Leitor */}
            {step === 1 && (
              <div>
                <h6 className="fw-semibold mb-3">
                  <i className="bi bi-person me-1"></i>
                  Selecionar Leitor
                </h6>
                
                {!selectedClient ? (
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
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchClients()}
                        disabled={loading}
                      />
                      <button
                        className="btn btn-outline-primary"
                        onClick={handleSearchClients}
                        disabled={loading || !clientSearch.trim()}
                      >
                        {loading ? (
                          <span className="spinner-border spinner-border-sm me-1" />
                        ) : (
                          <i className="bi bi-search me-1"></i>
                        )}
                        Buscar
                      </button>
                    </div>
                    
                    {/* Lista de clientes encontrados */}
                    {clients.length > 0 && (
                      <div className="mb-3">
                        <h6 className="fw-semibold">Clientes encontrados:</h6>
                        <div className="list-group">
                          {clients.map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              className="list-group-item list-group-item-action"
                              onClick={() => setSelectedClient(client)}
                              disabled={loading}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>{client.name || client.fullName}</strong>
                                  <br />
                                  <small className="text-muted">
                                    {client.email} {client.cpf && `• ${client.cpf}`}
                                  </small>
                                </div>
                                <i className="bi bi-chevron-right"></i>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={handleCreateClient}
                        disabled={loading || !clientSearch.trim()}
                      >
                        {loading ? (
                          <span className="spinner-border spinner-border-sm me-2" />
                        ) : (
                          <i className="bi bi-person-plus me-2"></i>
                        )}
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
                    <strong>{selectedClient.name || selectedClient.fullName}</strong><br/>
                    <small className="text-muted">
                      <i className="bi bi-envelope me-1"></i>
                      {selectedClient.email}
                    </small>
                    <button
                      className="btn btn-sm btn-outline-secondary mt-2"
                      onClick={() => setSelectedClient(null)}
                      disabled={loading}
                    >
                      <i className="bi bi-arrow-repeat me-1"></i>
                      Alterar
                    </button>
                  </div>
                )}
                
                <div className="d-flex justify-content-between mt-4">
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={prevStep}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Voltar
                  </button>
                  {selectedClient && (
                    <button 
                      className="btn btn-primary" 
                      onClick={nextStep}
                      disabled={loading}
                    >
                      Avançar <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Etapa 3: Confirmação */}
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
                    <div className="row">
                      <div className="col-md-6">
                        <strong>
                          <i className="bi bi-book me-1"></i>
                          Livro:
                        </strong><br/>
                        {book.title}
                      </div>
                      <div className="col-md-6">
                        <strong>
                          <i className="bi bi-journal me-1"></i>
                          Cópia:
                        </strong><br/>
                        #{selectedCopy?.number} - {selectedCopy?.edition}
                      </div>
                      <div className="col-md-6 mt-2">
                        <strong>
                          <i className="bi bi-person me-1"></i>
                          Leitor:
                        </strong><br/>
                        {selectedClient.name || selectedClient.fullName}
                      </div>
                      <div className="col-md-6 mt-2">
                        <strong>
                          <i className="bi bi-calendar me-1"></i>
                          Data de Devolução:
                        </strong><br/>
                        {new Date(new Date().setDate(new Date().getDate() + 14)).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-semibold">
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleConfirmLoan();
                      }}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-text">
                    A senha é necessária para confirmar a identidade do leitor.
                  </div>
                </div>
                
                <div className="d-flex justify-content-between">
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={prevStep}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Voltar
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handleConfirmLoan}
                    disabled={loading || !password.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        Confirmar Empréstimo
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .cursor-pointer {
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        
        .cursor-pointer:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .progress-bar {
          transition: width 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};