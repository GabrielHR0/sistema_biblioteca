// components/public/loanModal/ReturnModal.tsx
import React, { useState, useEffect } from "react";
import { LoanService } from "@pages/loan/LoanService";
import { CopySelectionStep } from "./LoanModalSteps/CopySelectionStep";
import { ReturnConfirmationStep } from "./LoanModalSteps/ReturnConfirmationStep";
import { ProgressIndicator } from "./LoanModalComponents/ProgressIndicator";
import { ErrorAlert } from "./LoanModalComponents/ErrorAlert";

export interface BookCopy {
  id?: number;
  number?: number | any;
  edition: string;
  status: "available" | "borrowed" | "lost";
  due_date?: string;
  book_id?: number;
  created_at?: string;
  updated_at?: string;
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

interface ReturnModalProps {
  book: Book;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

export interface LoanDetails {
  id: number;
  copy_id: number;
  client_id: number;
  user_id: number | null;
  loan_date: string;
  due_date: string;
  status: "ongoing" | "returned" | "overdue";
  created_at: string;
  updated_at: string;
  renewals_count: number;
  return_date: string | null;
  "overdue?"?: boolean;
  client: {
    id: number;
    fullName: string;
    cpf?: string;
    email?: string;
  };
  copy: {
    id: number;
    number: number;
    status: "available" | "borrowed" | "lost";
  };
}

export interface CopyWithLoanHistory {
  id: number;
  book_id: number;
  number: number;
  edition: string;
  status: "available" | "borrowed" | "lost";
  created_at: string;
  updated_at: string;
  loans: Array<{
    id: number;
    client_id: number;
    user_id: number | null;
    loan_date: string;
    due_date: string;
    status: "ongoing" | "returned" | "overdue";
    renewals_count: number;
    return_date?: string | null;
  }>;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  book,
  token,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState(0);
  const [selectedCopy, setSelectedCopy] = useState<BookCopy | null>(null);
  const [loading, setLoading] = useState(false);
  const [copies, setCopies] = useState<BookCopy[]>(book.copies || []);
  const [error, setError] = useState<string | null>(null);
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);
  const [copyWithHistory, setCopyWithHistory] = useState<CopyWithLoanHistory | null>(null);
  const [renewing, setRenewing] = useState(false);

  // Carregar cópias do livro específico - apenas as emprestadas
  useEffect(() => {
    const fetchCopies = async () => {
      if (!book.id) {
        setError("ID do livro não encontrado");
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log('📚 Buscando cópias do livro ID:', book.id);
        const copiesData = await LoanService.getBookCopies(token, book.id);
        console.log('✅ Cópias carregadas:', copiesData);
        
        // Filtrar apenas cópias emprestadas
        const borrowedCopies = copiesData.filter((copy: any) => copy.status === 'borrowed');
        
        // Transformar os dados para o formato esperado
        const formattedCopies: BookCopy[] = borrowedCopies.map((copy: any) => ({
          id: copy.id,
          number: copy.number,
          edition: copy.edition,
          status: copy.status,
          book_id: copy.book_id,
          due_date: copy.due_date,
        }));
        
        console.log('📊 Cópias emprestadas encontradas:', formattedCopies.length);
        setCopies(formattedCopies);
        
        if (formattedCopies.length === 0) {
          setError("Nenhuma cópia emprestada encontrada para este livro");
        }
      } catch (err: any) {
        console.error("❌ Erro ao buscar cópias:", err);
        setError(err.message || "Erro ao buscar cópias do livro");
      } finally {
        setLoading(false);
      }
    };

    fetchCopies();
  }, [book.id, token]);

  // CORREÇÃO PRINCIPAL: Nova função para buscar empréstimos ativos por cópia
  const loadActiveLoansByCopy = async (copy: BookCopy) => {
    if (!copy.id) {
      setError("ID da cópia não encontrado");
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('📖 Buscando empréstimos ativos da cópia ID:', copy.id);
      
      // USAR O NOVO MÉTODO: Buscar empréstimos ativos específicos desta cópia
      const activeLoans = await LoanService.getActiveLoansByCopy(token, copy.id);
      console.log('✅ Empréstimos ativos encontrados:', activeLoans);

      if (!activeLoans || activeLoans.length === 0) {
        setError("Nenhum empréstimo ativo encontrado para esta cópia");
        return null;
      }

      // Pegar o primeiro empréstimo ativo (deveria ter apenas um por cópia)
      const activeLoan = activeLoans[0];
      
      // Buscar detalhes completos do empréstimo
      console.log('📡 Buscando detalhes do empréstimo ID:', activeLoan.id);
      const loanDetails = await LoanService.getLoan(token, activeLoan.id);
      console.log('✅ Detalhes do empréstimo carregados:', loanDetails);
      
      setLoanDetails(loanDetails);
      return loanDetails;
    } catch (err: any) {
      console.error('❌ Erro ao carregar empréstimos ativos:', err);
      setError(err.message || "Erro ao carregar empréstimos ativos");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função para renovar empréstimo
  const handleRenewLoan = async () => {
    if (!loanDetails) {
      setError("Nenhum empréstimo selecionado para renovação");
      return;
    }

    setRenewing(true);
    setError(null);
    try {
      console.log('🔄 Renovando empréstimo ID:', loanDetails.id);
      
      const response = await LoanService.renewLoan(token, loanDetails);
      const newLoan = response.loan;
      
      setLoanDetails(prev => prev ? {
        ...prev,
        due_date: newLoan.due_date,
        renewals_count: (prev.renewals_count || 0) + 1,
        "overdue?": false
      } : null);
      
      alert("Empréstimo renovado com sucesso! Nova data de vencimento: " + new Date(newLoan.due_date).toLocaleDateString('pt-BR'));
      
    } catch (err: any) {
      console.error('❌ Erro ao renovar empréstimo:', err);
      setError(err.message || "Erro ao renovar empréstimo");
    } finally {
      setRenewing(false);
    }
  };

  // Manipular seleção de cópia - USANDO A NOVA FUNÇÃO
  const handleCopySelection = async (copy: BookCopy) => {
    console.log('🎯 Cópia selecionada para devolução:', {
      id: copy.id,
      number: copy.number,
      edition: copy.edition,
      status: copy.status
    });
    
    setSelectedCopy(copy);
    setError(null);
    
    try {
      // USAR A NOVA FUNÇÃO para buscar empréstimos ativos
      const details = await loadActiveLoansByCopy(copy);
      if (details) {
        console.log('✅ Indo para etapa de confirmação');
        setStep(1);
      }
    } catch (error) {
      console.error('❌ Erro ao processar cópia selecionada:', error);
    }
  };

  // Confirmar devolução
  const handleConfirmReturn = async () => {
    if (!selectedCopy || !loanDetails) {
      setError("Dados incompletos para confirmar a devolução");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('✅ Confirmando devolução do empréstimo ID:', loanDetails.id);
      
      console.log('🔄 Tentando método POST...');
      await LoanService.returnLoanPost(token, loanDetails.id);
      
      alert("Devolução confirmada com sucesso!");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('❌ Erro ao confirmar devolução:', err);
      setError(err.message || "Erro ao registrar devolução");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSelection = () => {
    setStep(0);
    setError(null);
    setLoanDetails(null);
    setCopyWithHistory(null);
    setRenewing(false);
  };

  // Mostrar apenas cópias emprestadas
  const borrowedCopies = copies.filter(copy => copy.status === "borrowed");

  console.log('📊 Estado do ReturnModal:', {
    step,
    selectedCopy: selectedCopy?.id,
    loanDetails: loanDetails?.id,
    copyWithHistory: copyWithHistory?.id,
    borrowedCopies: borrowedCopies.length
  });

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <CopySelectionStep
            book={book}
            availableCopies={[]} // Não mostrar cópias disponíveis
            borrowedCopies={borrowedCopies}
            selectedCopy={selectedCopy}
            onCopySelect={handleCopySelection}
            onNext={() => {}} // Não usado no return modal
            onClose={onClose}
            loading={loading}
            actionType="return"
          />
        );
      case 1:
        return (
          <ReturnConfirmationStep
            book={book}
            selectedCopy={selectedCopy}
            loanDetails={loanDetails}
            copyWithHistory={copyWithHistory}
            loading={loading}
            renewing={renewing}
            onConfirm={handleConfirmReturn}
            onRenew={handleRenewLoan}
            onBack={handleBackToSelection}
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
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title">
              <i className="bi bi-arrow-return-left me-2"></i>
              Devolução - {book.title}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading || renewing}
            ></button>
          </div>
          
          <div className="modal-body">
            <ErrorAlert error={error} />
            
            <ProgressIndicator 
              step={step} 
              actionType="return" 
            />
            
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
};