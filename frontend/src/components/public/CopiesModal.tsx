import React, { useState, useEffect } from "react";
import dayjs from "dayjs";

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
}

interface CopiesModalProps {
  book: Book;
  copies: BookCopy[];
  onClose: () => void;
  onUpdateCopy?: (copyId: number, copyData: any) => Promise<void>;
  onDeleteCopy?: (copyId: number) => Promise<void>;
}

export const CopiesModal: React.FC<CopiesModalProps> = ({
  book,
  copies,
  onClose,
  onUpdateCopy,
  onDeleteCopy,
}) => {
  const [searchNumber, setSearchNumber] = useState("");
  const [searchEdition, setSearchEdition] = useState("");
  const [searchStatus, setSearchStatus] = useState<string>("all");
  const [filteredCopies, setFilteredCopies] = useState<BookCopy[]>(copies);
  const [loading, setLoading] = useState(false);

  // Estados para edição
  const [editingCopy, setEditingCopy] = useState<BookCopy | null>(null);
  const [editEdition, setEditEdition] = useState("");
  const [editStatus, setEditStatus] = useState<"available" | "borrowed" | "lost">("available");

  useEffect(() => {
    filterCopies();
  }, [searchNumber, searchEdition, searchStatus, copies]);

  const filterCopies = () => {
    let filtered = copies;

    // Filtro por número
    if (searchNumber) {
      filtered = filtered.filter((copy) => copy.number?.toString().includes(searchNumber));
    }

    // Filtro por edição
    if (searchEdition) {
      filtered = filtered.filter((copy) =>
        copy.edition.toLowerCase().includes(searchEdition.toLowerCase())
      );
    }

    // Filtro por status
    if (searchStatus !== "all") {
      filtered = filtered.filter((copy) => copy.status === searchStatus);
    }

    setFilteredCopies(filtered);
  };

  // Badges maiores (pill) para status do exemplar
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { class: "bg-success", text: "Disponível" },
      borrowed: { class: "bg-warning text-dark", text: "Emprestado" },
      lost: { class: "bg-danger", text: "Perdido" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;

    return (
      <span
        className={`badge rounded-pill ${config.class} text-nowrap`}
        style={{ fontSize: "0.9rem", padding: "0.45rem 0.6rem" }}
      >
        {config.text}
      </span>
    );
  };

  const getStatusOptions = () => {
    return [
      { value: "all", label: "Todos os status" },
      { value: "available", label: "Disponível" },
      { value: "borrowed", label: "Emprestado" },
      { value: "lost", label: "Perdido" },
    ];
  };

  const getEditStatusOptions = () => {
    return [
      { value: "available", label: "Disponível" },
      { value: "lost", label: "Perdido" },
    ];
  };

  const getCurrentLoan = (copy: BookCopy): Loan | null => {
    if (copy.status !== "borrowed" || !copy.loans || copy.loans.length === 0) {
      return null;
    }

    return (
      copy.loans.find((loan) => loan.status === "ongoing" || !loan.return_date) || null
    );
  };

  // Agora usando isBefore com granularidade 'day'
  const getLoanInfo = (copy: BookCopy) => {
    const currentLoan = getCurrentLoan(copy);
    if (!currentLoan) return null;

    const dueDate = dayjs(currentLoan.due_date);
    const isOverdue = dueDate.isBefore(dayjs(), "day"); // vencido se data < hoje (por dia)

    const renewalCount = currentLoan.renewals_count || 0;

    return {
      dueDate: dueDate.format("DD/MM/YYYY"),
      isOverdue,
      renewalCount,
      loanDate: dayjs(currentLoan.loan_date).format("DD/MM/YYYY"),
      clientId: currentLoan.client_id,
      userId: currentLoan.user_id,
      loanStatus: currentLoan.status, 
    };
  };


  const renderLoanStatusBadge = (loanInfo: ReturnType<typeof getLoanInfo>) => {
    if (!loanInfo) return <span className="text-muted">-</span>;

    const overdue = loanInfo.isOverdue || loanInfo.loanStatus === "overdue";
    const label = overdue
      ? "Atrasado"
      : loanInfo.loanStatus === "ongoing"
      ? "Ativo"
      : loanInfo.loanStatus === "returned"
      ? "Devolvido"
      : loanInfo.loanStatus;

    const badgeClass = overdue
      ? "bg-danger"
      : loanInfo.loanStatus === "ongoing"
      ? "bg-warning text-dark"
      : "bg-secondary";

    return (
      <span
        className={`badge rounded-pill ${badgeClass} text-nowrap`}
        style={{ fontSize: "0.9rem", padding: "0.45rem 0." }}
        title={overdue ? "Atrasado" : label}
      >
        {overdue && (
          <span
            className="me-2-centered"
            style={{
              display: "inline-flex", 
              alignItems: "center", 
              justifyContent: "center",
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#dc3545",
              verticalAlign: "middle",
            }}
          />
        )}
        {label}
      </span>
    );
  };

  const handleEdit = (copy: BookCopy) => {
    setEditingCopy(copy);
    setEditEdition(copy.edition);
    setEditStatus(copy.status);
  };

  const handleSaveEdit = async () => {
    if (!editingCopy || !onUpdateCopy) return;

    setLoading(true);
    try {
      await onUpdateCopy(editingCopy.id!, {
        edition: editEdition,
        status: editStatus,
      });
      setEditingCopy(null);
    } catch (err) {
      console.error("Erro ao atualizar exemplar:", err);
      alert("Erro ao atualizar exemplar");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingCopy(null);
    setEditEdition("");
    setEditStatus("available");
  };

  const handleDeleteCopy = async (copyId: number) => {
    if (!onDeleteCopy) return;

    const copyToDelete = copies.find((copy) => copy.id === copyId);
    if (!copyToDelete) return;

    if (copyToDelete.status === "borrowed") {
      alert("Não é possível excluir um exemplar que está emprestado!");
      return;
    }

    if (copyToDelete.status === "lost") {
      const confirmDelete = window.confirm(
        "Este exemplar está marcado como PERDIDO. Tem certeza que deseja excluí-lo?"
      );
      if (!confirmDelete) return;
    }

    if (
      !window.confirm(
        `Tem certeza que deseja excluir o exemplar #${copyToDelete.number} (${copyToDelete.edition})?\n\nEsta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await onDeleteCopy(copyId);
    } catch (err) {
      console.error("Erro ao excluir exemplar:", err);
      alert("Erro ao excluir exemplar");
    } finally {
      setLoading(false);
    }
  };

  const canDeleteCopy = (copy: BookCopy) => {
    return copy.status !== "borrowed";
  };

  const getDeleteButtonTitle = (copy: BookCopy) => {
    if (copy.status === "borrowed") {
      return "Não é possível excluir exemplar emprestado";
    }
    if (copy.status === "lost") {
      return "Excluir exemplar perdido";
    }
    return "Excluir exemplar";
  };

  const canEditStatus = (copy: BookCopy) => {
    // Só permite editar status se não estiver emprestado
    return copy.status !== "borrowed";
  };

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title">
              Exemplares: {book.title} - {book.author}
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Estatísticas rápidas */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title">{copies.length}</h5>
                    <p className="card-text">Total</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title text-success">
                      {copies.filter((c) => c.status === "available").length}
                    </h5>
                    <p className="card-text">Disponíveis</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title text-warning">
                      {copies.filter((c) => c.status === "borrowed").length}
                    </h5>
                    <p className="card-text">Emprestados</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title text-danger">
                      {copies.filter((c) => c.status === "lost").length}
                    </h5>
                    <p className="card-text">Perdidos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pesquisa - Nova versão com 3 filtros */}
            <div className="row mb-3">
              <div className="col-md-3">
                <label htmlFor="searchNumber" className="form-label small fw-bold">
                  Número
                </label>
                <input
                  id="searchNumber"
                  type="text"
                  className="form-control"
                  placeholder="Número..."
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="searchEdition" className="form-label small fw-bold">
                  Edição
                </label>
                <input
                  id="searchEdition"
                  type="text"
                  className="form-control"
                  placeholder="Edição..."
                  value={searchEdition}
                  onChange={(e) => setSearchEdition(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="col-md-3">
                <label htmlFor="searchStatus" className="form-label small fw-bold">
                  Status
                </label>
                <select
                  id="searchStatus"
                  className="form-select"
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                  disabled={loading}
                >
                  {getStatusOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2 d-flex align-items-end">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setSearchNumber("");
                    setSearchEdition("");
                    setSearchStatus("all");
                  }}
                  disabled={loading}
                >
                  Limpar
                </button>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-12">
                <small className="text-muted">
                  {filteredCopies.length} exemplar(es) encontrado(s) de {copies.length} total
                </small>
              </div>
            </div>

            {/* Tabela de exemplares */}
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Número</th>
                    <th>Edição</th>
                    <th>Status</th>
                    <th>Data do Empréstimo</th>
                    <th>Vencimento</th>
                    <th>Renovações</th>
                    <th>Status Empréstimo</th>
                    {(onUpdateCopy || onDeleteCopy) && <th>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredCopies.length === 0 ? (
                    <tr>
                      <td colSpan={(onUpdateCopy || onDeleteCopy) ? 8 : 7} className="text-center py-4">
                        {copies.length === 0
                          ? "Nenhum exemplar cadastrado"
                          : "Nenhum exemplar encontrado com os filtros aplicados"}
                      </td>
                    </tr>
                  ) : (
                    filteredCopies.map((copy) => {
                      const loanInfo = getLoanInfo(copy);

                      return (
                        <tr key={copy.id} className={loanInfo?.isOverdue ? "table-danger" : ""}>
                          <td>
                            <strong>#{copy.number}</strong>
                            <br />
                          </td>

                          {editingCopy?.id === copy.id ? (
                            <>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={editEdition}
                                  onChange={(e) => setEditEdition(e.target.value)}
                                  disabled={loading}
                                />
                              </td>
                              <td>
                                {/* badge maior */}
                                {getStatusBadge(editStatus)}
                                <div className="mt-2">
                                  <select
                                    className="form-select form-select-sm"
                                    value={editStatus}
                                    onChange={(e) =>
                                      setEditStatus(
                                        e.target.value as "available" | "borrowed" | "lost"
                                      )
                                    }
                                    disabled={loading || !canEditStatus(copy)}
                                  >
                                    {getEditStatusOptions().map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                  {!canEditStatus(copy) && (
                                    <small className="text-muted">Status automático (emprestado)</small>
                                  )}
                                </div>
                              </td>
                              <td>{loanInfo ? loanInfo.loanDate : "-"}</td>
                              <td>
                                {loanInfo ? (
                                  <span className={loanInfo.isOverdue ? "text-danger fw-bold" : ""}>
                                    {loanInfo.dueDate}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td>{loanInfo ? loanInfo.renewalCount : "-"}</td>
                              <td>{loanInfo ? renderLoanStatusBadge(loanInfo) : "-"}</td>
                              <td>
                                <div className="d-flex gap-1">
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={handleSaveEdit}
                                    disabled={loading}
                                    title="Salvar edição"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={handleCancelEdit}
                                    disabled={loading}
                                    title="Cancelar edição"
                                  >
                                    ✗
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td>{copy.edition}</td>
                              <td>{getStatusBadge(copy.status)}</td>
                              <td>{loanInfo ? loanInfo.loanDate : "-"}</td>
                              <td>
                                {loanInfo ? (
                                  <div>
                                    <span className={loanInfo.isOverdue ? "text-danger fw-bold" : ""}>
                                      {loanInfo.dueDate}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              <td>
                                {loanInfo ? (
                                  <span className={loanInfo.renewalCount > 0 ? "text-info fw-bold" : ""}>
                                    {loanInfo.renewalCount}
                                  </span>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              <td>
                                {loanInfo ? (
                                  renderLoanStatusBadge(loanInfo)
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>

                              {(onUpdateCopy || onDeleteCopy) && (
                                <td>
                                  <div className="d-flex gap-1">
                                    {onUpdateCopy && (
                                      <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleEdit(copy)}
                                        disabled={loading}
                                        title="Editar exemplar"
                                      >
                                        editar
                                      </button>
                                    )}
                                    {onDeleteCopy && (
                                      <button
                                        className={`btn btn-sm ${
                                          canDeleteCopy(copy) ? "btn-danger" : "btn-outline-danger"
                                        }`}
                                        onClick={() => handleDeleteCopy(copy.id!)}
                                        disabled={loading || !canDeleteCopy(copy)}
                                        title={getDeleteButtonTitle(copy)}
                                      >
                                        excluir
                                      </button>
                                    )}
                                  </div>
                                </td>
                              )}
                            </>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
