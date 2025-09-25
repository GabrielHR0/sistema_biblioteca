import React, { useState } from "react";
import { Book, BookCopy } from "@components/public/BookFormModal";
import { LoanService } from "@pages/loan/LoanService";

interface CopyLoanModalProps {
  book: Book;
  onClose: () => void;
  onLoanConfirmed: () => void;
}

export const CopyLoanModal: React.FC<CopyLoanModalProps> = ({ book, onClose, onLoanConfirmed }) => {
  const [step, setStep] = useState(1);
  const [copies, setCopies] = useState<BookCopy[]>(book.copies || []);
  const [filteredCopies, setFilteredCopies] = useState<BookCopy[]>(book.copies || []);
  const [selectedCopy, setSelectedCopy] = useState<BookCopy | null>(null);

  const [readerSearch, setReaderSearch] = useState("");
  const [reader, setReader] = useState<any>(null);

  const [password, setPassword] = useState("");

  // Filtrar por edição ou number
  const handleSearchCopy = (query: string) => {
    const filtered = copies.filter(
      c =>
        c.edition.toLowerCase().includes(query.toLowerCase()) ||
        (c.number && c.number.toString().includes(query))
    );
    setFilteredCopies(filtered);
  };

  const handleSelectCopy = (copy: BookCopy) => {
    if (copy.status !== "available") return;
    setSelectedCopy(copy);
    setStep(2);
  };

  const handleSearchReader = async () => {
    // 🔧 Chamada ao backend para buscar leitor pelo query
    console.log("🔎 Buscar leitor:", readerSearch);
  };

  const handleConfirmLoan = async () => {
    if (!selectedCopy || !reader) return;

    // 🔧 Chamada ao backend para criar o empréstimo
    console.log("✅ Confirmar empréstimo:", {
      copy_id: selectedCopy.id,
      client_id: reader.id,
      password,
    });

    // Após sucesso
    onLoanConfirmed();
    onClose();
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Empréstimo: {book.title}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {step === 1 && (
              <>
                <h6>Passo 1: Selecionar cópia</h6>
                <input
                  type="text"
                  placeholder="Pesquisar por edição ou número..."
                  className="form-control mb-2"
                  onChange={e => handleSearchCopy(e.target.value)}
                />
                <div className="list-group" style={{ maxHeight: 300, overflowY: "auto" }}>
                  {filteredCopies.map(copy => (
                    <button
                      key={copy.id}
                      className={`list-group-item list-group-item-action ${
                        copy.status !== "available" ? "disabled" : ""
                      }`}
                      onClick={() => handleSelectCopy(copy)}
                    >
                      {copy.edition} |{" "}
                      {copy.status === "available"
                        ? "Disponível"
                        : `Indisponível - Vencimento: ${copy.loan_due_date}`}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h6>Passo 2: Selecionar leitor</h6>
                <input
                  type="text"
                  placeholder="Pesquisar leitor por nome ou CPF..."
                  className="form-control mb-2"
                  value={readerSearch}
                  onChange={e => setReaderSearch(e.target.value)}
                />
                <button className="btn btn-primary mb-2 w-100" onClick={handleSearchReader}>
                  Buscar leitor
                </button>
                {!reader && (
                  <button className="btn btn-outline-secondary w-100" onClick={() => console.log("Cadastrar leitor")}>
                    ➕ Cadastrar novo leitor
                  </button>
                )}
                {reader && <div className="alert alert-success">Leitor selecionado: {reader.fullName}</div>}
              </>
            )}

            {step === 3 && (
              <>
                <h6>Passo 3: Confirmar empréstimo</h6>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Digite a senha do leitor"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            {step === 1 && <button className="btn btn-primary" disabled={!selectedCopy}>Próximo</button>}
            {step === 2 && (
              <button className="btn btn-primary" disabled={!reader} onClick={() => setStep(3)}>
                Próximo
              </button>
            )}
            {step === 3 && (
              <button className="btn btn-success" onClick={handleConfirmLoan}>
                Confirmar Empréstimo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
