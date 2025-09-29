// components/public/loanModal/LoanModal.tsx
import React, { useState, useEffect } from "react";
import { LoanService } from "@pages/loan/LoanService";
import { checkClientPassword, createClient } from "@pages/clients/ClientService";
import { CopySelectionStep } from "./LoanModalSteps/CopySelectionStep";
import { ClientSelectionStep } from "./LoanModalSteps/ClientSelectionStep";
import { ConfirmationStep } from "./LoanModalSteps/ConfirmationStep";
import { ProgressIndicator } from "./LoanModalComponents/ProgressIndicator";
import { ErrorAlert } from "./LoanModalComponents/ErrorAlert";

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
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  useEffect(() => {
    const fetchCopies = async () => {
      if (!book.id) return;
      
      try {
        setLoading(true);
        console.log('📚 Buscando cópias do livro ID:', book.id);
        const copiesData = await LoanService.getBookCopies(token, book.id);
        console.log('✅ Cópias carregadas no LoanModal:', copiesData);
        setCopies(copiesData);
      } catch (err: any) {
        console.error("❌ Erro ao buscar cópias:", err);
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
      console.error("❌ Erro ao buscar clientes:", err);
      setError(err.message || "Erro ao buscar clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClientWithDetails = async (clientData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createClient({
          fullName: clientData.fullName,
          email: clientData.email,
          cpf: clientData.cpf,
          phone: clientData.phone,
      });
      
      const newClient = response.client;
      const password = response.generated_password;

      console.log('✅ Cliente criado:', newClient);
      
      setSelectedClient(newClient);
      setClients([newClient]);
      setGeneratedPassword(password);
      setError(null);
      
      alert(`Cliente criado com sucesso! Senha gerada: ${password}\n\nEsta senha foi enviada por email para o cliente.`);
      
      return newClient;
    } catch (err: any) {
      console.error("❌ Erro ao criar cliente:", err);
      setError(err.message || "Erro ao criar cliente");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLoan = async () => {
    const currentPassword = generatedPassword || password;
    
    if (!selectedClient || !selectedCopy || !currentPassword) {
      setError("Preencha todos os campos obrigatórios!");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const passwordCheck = await checkClientPassword(token, currentPassword, selectedClient.id);
      
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
      console.error("❌ Erro ao realizar empréstimo:", err);
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
      console.error("❌ Erro ao confirmar devolução:", err);
      setError(err.message || "Erro ao confirmar devolução");
    } finally {
      setLoading(false);
    }
  };

  const loadLoanDetails = async (copy: BookCopy) => {
    console.log('🔄 loadLoanDetails chamada no LoanModal com cópia:', {
      id: copy.id,
      status: copy.status,
      loansCount: copy.loans?.length || 0,
      loans: copy.loans
    });
    
    if (copy.status !== 'borrowed') {
      console.log('❌ Cópia não está com status "borrowed":', copy.status);
      return null;
    }
    
    if (!copy.loans || !Array.isArray(copy.loans) || copy.loans.length === 0) {
      console.log('❌ Cópia não tem array de empréstimos válido no LoanModal');
      return null;
    }

    const activeLoan = copy.loans.find((loan: any) => {
      const isActive = loan.status === 'ongoing' || 
                      !loan.return_date || 
                      loan.return_date === null ||
                      loan.return_date === 'null';
      console.log('🔍 Verificando loan no LoanModal:', { 
        id: loan.id, 
        status: loan.status, 
        return_date: loan.return_date,
        isActive 
      });
      return isActive;
    });

    console.log('🎯 Active loan encontrado no LoanModal:', activeLoan);

    if (!activeLoan) {
      console.log('❌ Nenhum empréstimo ativo encontrado no LoanModal');
      return null;
    }

    if (!activeLoan.id) {
      console.log('❌ Empréstimo ativo não tem ID no LoanModal:', activeLoan);
      return null;
    }

    setLoadingLoanDetails(true);
    try {
      console.log('📡 Chamando LoanService.getLoan para ID:', activeLoan.id);
      const loanDetails = await LoanService.getLoan(token, activeLoan.id);
      console.log('✅ Detalhes do empréstimo carregados no LoanModal:', loanDetails);
      setDetailedLoanInfo(loanDetails);
      return loanDetails;
    } catch (err: any) {
      console.error('❌ Erro ao carregar detalhes do empréstimo no LoanModal:', err);
      setError("Erro ao carregar informações do empréstimo");
      throw err;
    } finally {
      setLoadingLoanDetails(false);
    }
  };

  const handleCopySelection = async (copy: BookCopy) => {
    console.log('🎯 handleCopySelection no LoanModal com cópia:', {
      id: copy.id,
      number: copy.number,
      edition: copy.edition,
      status: copy.status
    });
    
    setSelectedCopy(copy);
    setError(null);
    
    if (copy.status === 'available') {
      setActionType('loan');
      console.log('📖 Indo para etapa 1 (seleção de cliente)');
      setStep(1);
    } else if (copy.status === 'borrowed') {
      setActionType('return');
      try {
        const loanDetails = await loadLoanDetails(copy);
        console.log('📋 Loan details retornado no LoanModal:', loanDetails);
        
        if (loanDetails) {
          console.log('✅ Indo para etapa 2 (confirmação de devolução)');
          setStep(2);
        } else {
          console.log('❌ Loan details é null, mostrando erro');
          setError("Não foi possível carregar os detalhes do empréstimo");
        }
      } catch (error) {
        console.error('❌ Erro em handleCopySelection no LoanModal:', error);
        setError("Erro ao carregar detalhes do empréstimo");
      }
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

  const resetClientSelection = () => {
    setSelectedClient(null);
    setClients([]);
    setClientSearch("");
    setPassword("");
    setGeneratedPassword(null);
  };

  const availableCopies = copies.filter(copy => copy.status === "available");
  const borrowedCopies = copies.filter(copy => copy.status === "borrowed");

  console.log('📊 Estado atual do LoanModal:', {
    step,
    actionType,
    selectedCopy: selectedCopy?.id,
    selectedClient: selectedClient?.id,
    availableCopies: availableCopies.length,
    borrowedCopies: borrowedCopies.length
  });

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <CopySelectionStep
            book={book}
            availableCopies={availableCopies}
            borrowedCopies={borrowedCopies}
            selectedCopy={selectedCopy}
            onCopySelect={handleCopySelection}
            onNext={nextStep}
            onClose={onClose}
            loading={loading}
            actionType={actionType}
            detailedLoanInfo={detailedLoanInfo}
          />
        );
      case 1:
        return actionType === 'loan' ? (
          <ClientSelectionStep
            clientSearch={clientSearch}
            setClientSearch={setClientSearch}
            clients={clients}
            selectedClient={selectedClient}
            loading={loading}
            onSearchClients={handleSearchClients}
            onCreateClientWithDetails={handleCreateClientWithDetails}
            onClientSelect={setSelectedClient}
            onResetClient={resetClientSelection}
            onNext={nextStep}
            onBack={prevStep}
          />
        ) : null;
      case 2:
        return (
          <ConfirmationStep
            book={book}
            selectedCopy={selectedCopy}
            selectedClient={selectedClient}
            password={password}
            setPassword={setPassword}
            detailedLoanInfo={detailedLoanInfo}
            loading={loading}
            loadingLoanDetails={loadingLoanDetails}
            actionType={actionType}
            generatedPassword={generatedPassword}
            onConfirm={actionType === 'loan' ? handleConfirmLoan : handleConfirmReturn}
            onBack={prevStep}
          />
        );
      default:
        return null;
    }
  };

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
            <ErrorAlert error={error} />
            
            <ProgressIndicator 
              step={step} 
              actionType={actionType} 
            />
            
            {renderStep()}
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