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
  loans?: any[];
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
  const [loadingLoanDetails, setLoadingLoanDetails] = useState(false);
  const [detailedLoanInfo, setDetailedLoanInfo] = useState<any>(null);
  const [actionType, setActionType] = useState<"loan" | "return">("loan");

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

  const handleConfirmReturn = async () => {
    if (!selectedCopy) {
      setError("Nenhuma cópia selecionada!");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Encontrar o empréstimo ativo
      const activeLoan = selectedCopy.loans?.find((loan: any) => 
        loan.status === 'ongoing' || !loan.return_date
      );

      if (!activeLoan) {
        throw new Error("Nenhum empréstimo ativo encontrado para esta cópia");
      }

      await LoanService.returnLoan(token, activeLoan.id);

      alert("Devolução confirmada com sucesso!");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erro ao confirmar devolução:", err);
      setError(err.message || "Erro ao confirmar devolução");
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

  const loadLoanDetails = async (copy: BookCopy) => {
    if (copy.status !== 'borrowed' || !copy.loans || copy.loans.length === 0) {
      return null;
    }
    
    const activeLoan = copy.loans.find((loan: any) => 
      loan.status === 'ongoing' || !loan.return_date
    );

    if (!activeLoan || !activeLoan.id) return null;

    setLoadingLoanDetails(true);
    try {
      const loanDetails = await LoanService.getLoan(token, activeLoan.id);
      setDetailedLoanInfo(loanDetails);
      console.log("Detalhes do empréstimo:", loanDetails);
      return loanDetails;
    } catch (err: any) {
      console.error("Erro ao carregar detalhes do empréstimo:", err);
      setError("Erro ao carregar informações do empréstimo");
      return null;
    } finally {
      setLoadingLoanDetails(false);
    }
  };

  const getCurrentLoanInfo = (copy: BookCopy) => {
    // Se temos informações detalhadas para esta cópia, use-as
    if (detailedLoanInfo && detailedLoanInfo.copy_id === copy.id) {
      const dueDate = new Date(detailedLoanInfo.due_date);
      const isOverdue = dueDate < new Date();

      return {
        dueDate: dueDate.toLocaleDateString('pt-BR'),
        isOverdue,
        loanDate: new Date(detailedLoanInfo.loan_date).toLocaleDateString('pt-BR'),
        clientName: detailedLoanInfo.client?.fullName || "Cliente não encontrado",
        clientId: detailedLoanInfo.client_id,
        loanId: detailedLoanInfo.id,
        clientEmail: detailedLoanInfo.client?.email,
        clientCpf: detailedLoanInfo.client?.cpf,
        renewalsCount: detailedLoanInfo.renewals_count || 0,
        overdue: detailedLoanInfo['overdue?'] || false
      };
    }

    // Fallback para os dados básicos se não tiver os detalhados
    if (copy.status !== 'borrowed' || !copy.loans || copy.loans.length === 0) {
      return null;
    }
    
    const activeLoan = copy.loans.find((loan: any) => 
      loan.status === 'ongoing' || !loan.return_date
    );

    if (!activeLoan) return null;

    const dueDate = new Date(activeLoan.due_date);
    const isOverdue = dueDate < new Date();

    return {
      dueDate: dueDate.toLocaleDateString('pt-BR'),
      isOverdue,
      loanDate: new Date(activeLoan.loan_date).toLocaleDateString('pt-BR'),
      clientName: activeLoan.client?.name || activeLoan.client?.fullName || "Cliente não encontrado",
      clientId: activeLoan.client_id,
      loanId: activeLoan.id,
      renewalsCount: activeLoan.renewals_count || 0
    };
  };

  const handleCopySelection = async (copy: BookCopy) => {
    setSelectedCopy(copy);
    
    if (copy.status === 'available') {
      setActionType('loan');
      setStep(1); // Vai para seleção de leitor
    } else if (copy.status === 'borrowed') {
      setActionType('return');
      // Carrega os detalhes completos do empréstimo
      setLoadingLoanDetails(true);
      try {
        await loadLoanDetails(copy);
        setStep(2); // Vai para confirmação
      } catch (error) {
        setError("Erro ao carregar detalhes do empréstimo");
      }
    }
  };

  const availableCopies = copies.filter(copy => copy.status === "available");
  const borrowedCopies = copies.filter(copy => copy.status === "borrowed");

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
          <div className={`modal-header ${actionType === 'loan' ? 'bg-primary' : 'bg-success'} text-white`}>
            <h5 className="modal-title">
              <i className={`bi ${actionType === 'loan' ? 'bi-book' : 'bi-arrow-return-left'} me-2`}></i>
              {actionType === 'loan' ? 'Empréstimo' : 'Devolução'} - {book.title}
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
                className={`progress-bar ${actionType === 'loan' ? 'bg-primary' : 'bg-success'}`} 
                style={{width: `${((step + 1) / 3) * 100}%`}}
              ></div>
            </div>
            
            <div className="d-flex justify-content-between mb-4">
              <span className={`badge ${step >= 0 ? (actionType === 'loan' ? 'bg-primary' : 'bg-success') : 'bg-secondary'} fs-6 p-2`}>
                <i className="bi bi-1-circle me-1"></i>
                1. Selecionar Cópia
              </span>
              <span className={`badge ${step >= 1 ? (actionType === 'loan' ? 'bg-primary' : 'bg-success') : 'bg-secondary'} fs-6 p-2`}>
                <i className="bi bi-2-circle me-1"></i>
                2. {actionType === 'loan' ? 'Selecionar Leitor' : 'Informações do Empréstimo'}
              </span>
              <span className={`badge ${step >= 2 ? (actionType === 'loan' ? 'bg-primary' : 'bg-success') : 'bg-secondary'} fs-6 p-2`}>
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
                      <strong>Total de cópias:</strong> {copies.length} 
                      ({availableCopies.length} disponíveis, {borrowedCopies.length} emprestadas)
                    </p>
                  </div>
                </div>

                {/* Cópias Disponíveis */}
                {availableCopies.length > 0 && (
                  <>
                    <h6 className="fw-semibold mb-3 text-success">
                      <i className="bi bi-check-circle me-1"></i>
                      Cópias Disponíveis para Empréstimo:
                    </h6>
                    <div className="row g-3 mb-4">
                      {availableCopies.map((copy) => (
                        <div key={copy.id} className="col-md-6">
                          <div 
                            className={`card cursor-pointer ${selectedCopy?.id === copy.id ? 'border-primary' : ''}`}
                            style={{ 
                              cursor: 'pointer',
                              border: selectedCopy?.id === copy.id ? '2px solid #0d6efd' : '1px solid #dee2e6'
                            }}
                            onClick={() => handleCopySelection(copy)}
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
                                  Selecionada para Empréstimo
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Cópias Emprestadas */}
                {borrowedCopies.length > 0 && (
                  <>
                    <h6 className="fw-semibold mb-3 text-warning">
                      <i className="bi bi-arrow-return-left me-1"></i>
                      Cópias Emprestadas para Devolução:
                    </h6>
                    <div className="row g-3">
                      {borrowedCopies.map((copy) => {
                        const loanInfo = getCurrentLoanInfo(copy);
                        
                        return (
                          <div key={copy.id} className="col-md-6">
                            <div 
                              className={`card cursor-pointer ${selectedCopy?.id === copy.id ? 'border-success' : ''} ${loanInfo?.isOverdue ? 'border-danger' : ''}`}
                              style={{ 
                                cursor: 'pointer',
                                border: selectedCopy?.id === copy.id ? '2px solid #198754' : loanInfo?.isOverdue ? '2px solid #dc3545' : '1px solid #dee2e6'
                              }}
                              onClick={() => handleCopySelection(copy)}
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
                                  {loanInfo?.isOverdue && (
                                    <span className="badge bg-danger ms-1">Atrasado</span>
                                  )}
                                </div>
                                
                                {loanInfo && (
                                  <div className="small text-muted mt-2">
                                    <div>
                                      <strong>Emprestado para:</strong> {loanInfo.clientName}
                                    </div>
                                    <div>
                                      <strong>Data do empréstimo:</strong> {loanInfo.loanDate}
                                    </div>
                                    <div className={loanInfo.isOverdue ? 'text-danger fw-bold' : ''}>
                                      <strong>Vencimento:</strong> {loanInfo.dueDate}
                                    </div>
                                    {loanInfo.renewalsCount > 0 && (
                                      <div>
                                        <strong>Renovações:</strong> {loanInfo.renewalsCount}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {selectedCopy?.id === copy.id && (
                                  <div className="text-success mt-2">
                                    <i className="bi bi-check-circle-fill me-1"></i>
                                    Selecionada para Devolução
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
                
                {copies.length === 0 && !loading && (
                  <div className="alert alert-warning text-center">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Nenhuma cópia cadastrada para este livro.
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
                    className={`btn ${actionType === 'loan' ? 'btn-primary' : 'btn-success'}`} 
                    onClick={nextStep}
                    disabled={!selectedCopy || loading}
                  >
                    {actionType === 'loan' ? 'Avançar' : 'Confirmar Devolução'} 
                    <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Etapa 2: Seleção de Leitor (apenas para empréstimo) */}
            {step === 1 && actionType === 'loan' && (
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
                  {actionType === 'loan' ? 'Confirmar Empréstimo' : 'Confirmar Devolução'}
                </h6>

                {/* Loading para devolução */}
                {actionType === 'return' && loadingLoanDetails && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p>Carregando detalhes do empréstimo...</p>
                  </div>
                )}

                {/* Conteúdo principal da etapa 3 */}
                {!loadingLoanDetails && (
                  <>
                    {/* Informações COMPLETAS do empréstimo para devolução */}
                    {actionType === 'return' && detailedLoanInfo && (
                      <>
                        <div className="card mb-3">
                          <div className="card-body">
                            <h6 className="card-title text-success">
                              <i className="bi bi-file-text me-2"></i>
                              Informações Completas do Empréstimo
                            </h6>
                            <div className="row">
                              <div className="col-md-6">
                                <strong>ID do Empréstimo:</strong><br/>
                                #{detailedLoanInfo.id}
                              </div>
                              <div className="col-md-6">
                                <strong>Status:</strong><br/>
                                <span className={`badge ${
                                  detailedLoanInfo.status === 'ongoing' ? 'bg-warning' : 
                                  detailedLoanInfo.status === 'returned' ? 'bg-success' : 'bg-secondary'
                                }`}>
                                  {detailedLoanInfo.status === 'ongoing' ? 'Em Andamento' : 
                                  detailedLoanInfo.status === 'returned' ? 'Devolvido' : detailedLoanInfo.status}
                                </span>
                              </div>
                              
                              <div className="col-md-6 mt-2">
                                <strong>Data do Empréstimo:</strong><br/>
                                {new Date(detailedLoanInfo.loan_date).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="col-md-6 mt-2">
                                <strong>Data de Vencimento:</strong><br/>
                                <span className={detailedLoanInfo['overdue?'] ? 'text-danger fw-bold' : ''}>
                                  {new Date(detailedLoanInfo.due_date).toLocaleDateString('pt-BR')}
                                  {detailedLoanInfo['overdue?'] && ' (Atrasado)'}
                                </span>
                              </div>
                              
                              <div className="col-md-6 mt-2">
                                <strong>Renovações:</strong><br/>
                                {detailedLoanInfo.renewals_count || 0}
                              </div>
                              <div className="col-md-6 mt-2">
                                <strong>Situação:</strong><br/>
                                {detailedLoanInfo['overdue?'] ? (
                                  <span className="badge bg-danger">Atrasado</span>
                                ) : (
                                  <span className="badge bg-success">Em Dia</span>
                                )}
                              </div>
                              
                              <div className="col-md-6 mt-2">
                                <strong>ID da Cópia:</strong><br/>
                                #{detailedLoanInfo.copy_id}
                              </div>
                              <div className="col-md-6 mt-2">
                                <strong>ID do Cliente:</strong><br/>
                                #{detailedLoanInfo.client_id}
                              </div>
                              
                              {detailedLoanInfo.user_id && (
                                <div className="col-md-6 mt-2">
                                  <strong>ID do Usuário:</strong><br/>
                                  #{detailedLoanInfo.user_id}
                                </div>
                              )}
                              
                              <div className="col-md-6 mt-2">
                                <strong>Criado em:</strong><br/>
                                {new Date(detailedLoanInfo.created_at).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="col-md-6 mt-2">
                                <strong>Atualizado em:</strong><br/>
                                {new Date(detailedLoanInfo.updated_at).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Informações do Leitor */}
                        {detailedLoanInfo.client && (
                          <div className="card mb-3">
                            <div className="card-body">
                              <h6 className="card-title text-primary">
                                <i className="bi bi-person-badge me-2"></i>
                                Informações do Leitor
                              </h6>
                              <div className="row">
                                <div className="col-md-6">
                                  <strong>Nome Completo:</strong><br/>
                                  {detailedLoanInfo.client.fullName}
                                </div>
                                <div className="col-md-6">
                                  <strong>CPF:</strong><br/>
                                  {detailedLoanInfo.client.cpf || 'Não informado'}
                                </div>
                                <div className="col-md-6 mt-2">
                                  <strong>ID do Cliente:</strong><br/>
                                  #{detailedLoanInfo.client.id}
                                </div>
                                {detailedLoanInfo.client.email && (
                                  <div className="col-md-6 mt-2">
                                    <strong>Email:</strong><br/>
                                    {detailedLoanInfo.client.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Informações da Cópia */}
                        {detailedLoanInfo.copy && (
                          <div className="card mb-3">
                            <div className="card-body">
                              <h6 className="card-title text-info">
                                <i className="bi bi-journal me-2"></i>
                                Informações da Cópia
                              </h6>
                              <div className="row">
                                <div className="col-md-6">
                                  <strong>Número da Cópia:</strong><br/>
                                  #{detailedLoanInfo.copy.number}
                                </div>
                                <div className="col-md-6">
                                  <strong>Status:</strong><br/>
                                  <span className={`badge ${
                                    detailedLoanInfo.copy.status === 'available' ? 'bg-success' : 
                                    detailedLoanInfo.copy.status === 'borrowed' ? 'bg-warning' : 'bg-danger'
                                  }`}>
                                    {detailedLoanInfo.copy.status === 'available' ? 'Disponível' : 
                                    detailedLoanInfo.copy.status === 'borrowed' ? 'Emprestada' : 'Perdida'}
                                  </span>
                                </div>
                                <div className="col-md-6 mt-2">
                                  <strong>ID da Cópia:</strong><br/>
                                  #{detailedLoanInfo.copy.id}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Resumo Simples */}
                    <div className="card mb-3">
                      <div className="card-body">
                        <h6 className="card-title">
                          <i className="bi bi-list-check me-2"></i>
                          Resumo da {actionType === 'loan' ? 'Empréstimo' : 'Devolução'}
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
                          
                          {actionType === 'loan' ? (
                            <>
                              <div className="col-md-6 mt-2">
                                <strong>
                                  <i className="bi bi-person me-1"></i>
                                  Leitor:
                                </strong><br/>
                                {selectedClient?.name || selectedClient?.fullName}
                              </div>
                              <div className="col-md-6 mt-2">
                                <strong>
                                  <i className="bi bi-calendar me-1"></i>
                                  Data de Devolução:
                                </strong><br/>
                                {new Date(new Date().setDate(new Date().getDate() + 14)).toLocaleDateString('pt-BR')}
                              </div>
                            </>
                          ) : (
                            detailedLoanInfo && (
                              <>
                                <div className="col-md-6 mt-2">
                                  <strong>
                                    <i className="bi bi-person me-1"></i>
                                    Leitor:
                                  </strong><br/>
                                  {detailedLoanInfo.client?.fullName}
                                </div>
                                <div className="col-md-6 mt-2">
                                  <strong>
                                    <i className="bi bi-calendar me-1"></i>
                                    Devolução em:
                                  </strong><br/>
                                  {new Date().toLocaleDateString('pt-BR')}
                                </div>
                                <div className="col-md-6 mt-2">
                                  <strong>
                                    <i className="bi bi-arrow-repeat me-1"></i>
                                    Renovações:
                                  </strong><br/>
                                  {detailedLoanInfo.renewals_count || 0}
                                </div>
                                <div className="col-md-6 mt-2">
                                  <strong>
                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                    Situação:
                                  </strong><br/>
                                  {detailedLoanInfo['overdue?'] ? (
                                    <span className="badge bg-danger">Atrasado</span>
                                  ) : (
                                    <span className="badge bg-success">Em Dia</span>
                                  )}
                                </div>
                              </>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {actionType === 'loan' ? (
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
                    ) : (
                      <div className="alert alert-info">
                        <i className="bi bi-info-circle me-2"></i>
                        Ao confirmar a devolução, o exemplar ficará disponível para novos empréstimos.
                      </div>
                    )}
                    
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
                        className={`btn ${actionType === 'loan' ? 'btn-success' : 'btn-success'}`}
                        onClick={actionType === 'loan' ? handleConfirmLoan : handleConfirmReturn}
                        disabled={loading || (actionType === 'loan' && !password.trim())}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <i className={`bi ${actionType === 'loan' ? 'bi-check-lg' : 'bi-arrow-return-left'} me-2`}></i>
                            {actionType === 'loan' ? 'Confirmar Empréstimo' : 'Confirmar Devolução'}
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
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