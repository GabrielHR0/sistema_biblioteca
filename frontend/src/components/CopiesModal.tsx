import React, { useState, useEffect } from "react";

export interface Loan {
  id?: number;
  copy_id: number;
  user_id: number;
  loan_date: string;
  due_date: string;
  return_date?: string;
  status: string;
}

export interface BookCopy {
  id?: number;
  edition: string;
  status: "available" | "borrowed" | "lost";
  number?: number;
  acquisition_date?: string;
  condition?: string;
  book_id?: number;
  loans?: Loan[];
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
}

export const CopiesModal: React.FC<CopiesModalProps> = ({
  book,
  copies,
  onClose,
  onUpdateCopy,
}) => {
  const [search, setSearch] = useState("");
  const [filteredCopies, setFilteredCopies] = useState<BookCopy[]>(copies);
  const [loading, setLoading] = useState(false);

  // Estados para edição - APENAS EDIÇÃO PERMITIDA
  const [editingCopy, setEditingCopy] = useState<BookCopy | null>(null);
  const [editEdition, setEditEdition] = useState("");

  useEffect(() => {
    filterCopies();
  }, [search, copies]);

  const filterCopies = () => {
    if (!search) {
      setFilteredCopies(copies);
      return;
    }

    const filtered = copies.filter(copy =>
      copy.edition.toLowerCase().includes(search.toLowerCase()) ||
      copy.number?.toString().includes(search) ||
      copy.id?.toString().includes(search)
    );
    setFilteredCopies(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { class: "bg-success", text: "Disponível" },
      borrowed: { class: "bg-warning", text: "Emprestado" },
      lost: { class: "bg-danger", text: "Perdido" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getDueDate = (copy: BookCopy) => {
    if (copy.status !== 'borrowed' || !copy.loans || copy.loans.length === 0) {
      return null;
    }
    
    // Encontrar o empréstimo ativo (sem data de retorno)
    const activeLoan = copy.loans.find(loan => !loan.return_date);
    return activeLoan ? new Date(activeLoan.due_date).toLocaleDateString('pt-BR') : null;
  };

  const isOverdue = (copy: BookCopy) => {
    if (copy.status !== 'borrowed' || !copy.loans || copy.loans.length === 0) {
      return false;
    }
    
    const activeLoan = copy.loans.find(loan => !loan.return_date);
    if (!activeLoan) return false;
    
    return new Date(activeLoan.due_date) < new Date();
  };

  const handleEdit = (copy: BookCopy) => {
    setEditingCopy(copy);
    setEditEdition(copy.edition);
  };

  const handleSaveEdit = async () => {
    if (!editingCopy || !onUpdateCopy) return;
    
    setLoading(true);
    try {
      // APENAS A EDIÇÃO PODE SER ALTERADA, O STATUS PERMANECE O MESMO
      await onUpdateCopy(editingCopy.id!, {
        edition: editEdition,
        status: editingCopy.status // Mantém o status original
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
                      {copies.filter(c => c.status === 'available').length}
                    </h5>
                    <p className="card-text">Disponíveis</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title text-warning">
                      {copies.filter(c => c.status === 'borrowed').length}
                    </h5>
                    <p className="card-text">Emprestados</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title text-danger">
                      {copies.filter(c => c.status === 'lost').length}
                    </h5>
                    <p className="card-text">Perdidos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pesquisa */}
            <div className="row mb-3">
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Pesquisar por edição, número ou ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="col-md-6">
                <small className="text-muted">
                  {filteredCopies.length} exemplar(es) encontrado(s)
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
                    <th>Data de Aquisição</th>
                    <th>Condição</th>
                    <th>Vencimento</th>
                    {onUpdateCopy && <th>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredCopies.length === 0 ? (
                    <tr>
                      <td colSpan={onUpdateCopy ? 7 : 6} className="text-center py-4">
                        {copies.length === 0 ? "Nenhum exemplar cadastrado" : "Nenhum exemplar encontrado"}
                      </td>
                    </tr>
                  ) : (
                    filteredCopies.map((copy) => (
                      <tr key={copy.id} className={isOverdue(copy) ? 'table-danger' : ''}>
                        <td>
                          <strong>#{copy.number}</strong>
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
                              {/* STATUS FIXO - NÃO EDITÁVEL */}
                              {getStatusBadge(copy.status)}
                            </td>
                            <td colSpan={3}>
                              <small className="text-muted">Editando apenas a edição...</small>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={handleSaveEdit}
                                  disabled={loading}
                                >
                                  ✓
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={handleCancelEdit}
                                  disabled={loading}
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
                            <td>
                              {copy.acquisition_date 
                                ? new Date(copy.acquisition_date).toLocaleDateString('pt-BR')
                                : 'Não informada'
                              }
                            </td>
                            <td>
                              {copy.condition || 'Não informada'}
                            </td>
                            <td>
                              {copy.status === 'borrowed' ? (
                                <div>
                                  <span className={isOverdue(copy) ? 'text-danger fw-bold' : ''}>
                                    {getDueDate(copy) || 'Data não disponível'}
                                  </span>
                                  {isOverdue(copy) && (
                                    <small className="text-danger d-block">Atrasado</small>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            {onUpdateCopy && (
                              <td>
                                <div className="d-flex gap-1">
                                  <button
                                    className="btn btn-warning btn-sm"
                                    onClick={() => handleEdit(copy)}
                                    disabled={loading}
                                    title="Editar edição do exemplar"
                                  >
                                    ✏️
                                  </button>
                                </div>
                              </td>
                            )}
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Informações adicionais */}
            {copies.some(copy => copy.status === 'borrowed') && (
              <div className="alert alert-info mt-3">
                <h6>📋 Informações sobre empréstimos:</h6>
                <ul className="mb-0">
                  <li>Exemplares em <span className="badge bg-warning">amarelo</span> estão emprestados</li>
                  <li>Exemplares em <span className="badge bg-danger">vermelho</span> estão com empréstimo em atraso</li>
                  <li>Data de vencimento mostra quando o exemplar deve ser devolvido</li>
                  <li><strong>O status do exemplar não pode ser editado manualmente</strong></li>
                </ul>
              </div>
            )}

            {/* Aviso sobre edição de status */}
            <div className="alert alert-warning mt-3">
              <strong>⚠️ Atenção:</strong> O status dos exemplares é controlado automaticamente pelo sistema 
              através dos empréstimos. Não é possível alterar manualmente o status.
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