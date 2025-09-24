import React, { useState, useEffect } from "react";
import { BaseLayout } from "@layouts/BaseLayout";
import { useAuth } from "../auth/authContext";
import { apiGetClients, createClient, Client } from "./ClientService";
import "bootstrap/dist/css/bootstrap.min.css";

export const MembersPage: React.FC<{ userName: string; isAdmin: boolean }> = ({
  userName,
  isAdmin,
}) => {
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  // -------------------- FETCH CLIENTS --------------------
  const fetchClients = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiGetClients(token);
      setClients(data);
      setFilteredClients(data);
    } catch (err: any) {
      console.error("Erro ao buscar membros:", err);
      alert(err.message || "Erro ao carregar membros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [token]);

  // -------------------- FILTRO DE PESQUISA --------------------
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = clients.filter(
      (c) =>
        c.fullName.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.cpf?.includes(term) ||
        c.phone?.includes(term)
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  // -------------------- HANDLE SUBMIT NEW MEMBER --------------------
  const handleCreateClient = async (newClient: Client) => {
    if (!token) return;
    try {
      await createClient(newClient);
      await fetchClients();
      setShowModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatCPF = (cpf?: string) =>
    cpf ? cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : "Não informado";

  return (
    <BaseLayout userName={userName} isAdmin={isAdmin}>
      <div className="container py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <h2 className="mb-2">
              <i className="bi bi-people me-2"></i>Membros
            </h2>
            <p className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Gerencie os membros da biblioteca
            </p>
          </div>
        </div>

        {/* Search + Actions */}
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">
              <i className="bi bi-search me-2"></i>
              Pesquisar Membros
            </h5>
            <div className="d-flex gap-2 align-items-center">
              <div className="flex-grow-1">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Pesquisar por nome, email, CPF ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setSearchTerm("")}
                disabled={!searchTerm || loading}
              >
                <i className="bi bi-x-circle me-2"></i>Limpar
              </button>
              {isAdmin && (
                <button
                  className="btn btn-success"
                  onClick={() => setShowModal(true)}
                  disabled={loading}
                >
                  <i className="bi bi-person-plus me-2"></i>Novo Membro
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-5">
            <div className="text-muted">
              <i className="bi bi-people display-4"></i>
              <h4 className="mt-3">
                {searchTerm ? "Nenhum membro encontrado" : "Nenhum membro cadastrado"}
              </h4>
              <p>
                {searchTerm 
                  ? "Tente alterar os termos da pesquisa" 
                  : isAdmin ? "Clique em 'Novo Membro' para cadastrar o primeiro" : "Entre em contato com a administração"
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {filteredClients.map((client) => (
              <div key={client.id} className="col-md-6 col-lg-4">
                <div 
                  className="card h-100 member-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => console.log("Abrir detalhes do membro:", client.id)}
                >
                  <div className="card-body d-flex flex-column">
                    {/* Header com nome e status */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <h6 className="card-title mb-1" style={{ wordBreak: 'break-word' }}>
                          <i className="bi bi-person-circle me-2 text-primary"></i>
                          {client.fullName}
                        </h6>
                        <small className="text-muted">
                          <i className="bi bi-calendar me-1"></i>
                          {client.created_at 
                            ? `Cadastrado em ${new Date(client.created_at).toLocaleDateString('pt-BR')}`
                            : 'Data não disponível'
                          }
                        </small>
                      </div>
                      <span className="badge bg-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Ativo
                      </span>
                    </div>

                    {/* Informações do membro */}
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-envelope text-muted me-2" style={{ width: '16px' }}></i>
                        <small className="text-truncate" title={client.email || ''}>
                          {client.email || "Email não informado"}
                        </small>
                      </div>
                      
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-file-person text-muted me-2" style={{ width: '16px' }}></i>
                        <small>{formatCPF(client.cpf)}</small>
                      </div>
                      
                      {client.phone && (
                        <div className="d-flex align-items-center">
                          <i className="bi bi-telephone text-muted me-2" style={{ width: '16px' }}></i>
                          <small>{client.phone}</small>
                        </div>
                      )}
                    </div>

                    {/* Footer com ação */}
                    <div className="mt-auto pt-2 border-top">
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          ID: #{client.id}
                        </small>
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("Ações do membro:", client.id);
                          }}
                        >
                          <i className="bi bi-eye me-1"></i>
                          Ver
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
            <p className="text-muted mt-2">Carregando membros...</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <NewClientModal
          onClose={() => setShowModal(false)}
          onSave={handleCreateClient}
        />
      )}

      <style>{`
        .member-card {
          transition: all 0.3s ease;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
        }
        
        .member-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          border-color: #007bff;
        }
        
        .member-card .card-title {
          font-size: 1.1rem;
          font-weight: 600;
        }
        
        .member-card .badge {
          font-size: 0.7rem;
          font-weight: 500;
        }
        
        .member-card small {
          font-size: 0.85rem;
        }
        
        .member-card .btn-sm {
          font-size: 0.8rem;
          padding: 0.25rem 0.75rem;
        }
      `}</style>
    </BaseLayout>
  );
};

// -------------------- MODAL --------------------
const NewClientModal: React.FC<{
  onClose: () => void;
  onSave: (client: Client) => void;
}> = ({ onClose, onSave }) => {
  const [form, setForm] = useState<Client>({
    fullName: "",
    cpf: "",
    email: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <form className="modal-content" onSubmit={handleSubmit}>
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="bi bi-person-plus me-2"></i>Novo Membro
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Nome Completo *</label>
                <input 
                  className="form-control" 
                  name="fullName" 
                  value={form.fullName} 
                  onChange={handleChange} 
                  required 
                  placeholder="Digite o nome completo"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">CPF *</label>
                <input 
                  className="form-control" 
                  name="cpf" 
                  value={form.cpf} 
                  onChange={handleChange} 
                  required 
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Email</label>
                <input 
                  className="form-control" 
                  type="email" 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Telefone</label>
                <input 
                  className="form-control" 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              <i className="bi bi-x-circle me-2"></i>Cancelar
            </button>
            <button type="submit" className="btn btn-success">
              <i className="bi bi-check-circle me-2"></i>Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};