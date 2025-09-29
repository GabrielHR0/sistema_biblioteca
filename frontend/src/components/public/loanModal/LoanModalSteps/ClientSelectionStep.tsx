// components/LoanModalSteps/ClientSelectionStep.tsx
import React, { useState } from 'react';

interface ClientSelectionStepProps {
  clientSearch: string;
  setClientSearch: (search: string) => void;
  clients: any[];
  selectedClient: any;
  loading: boolean;
  onSearchClients: () => void;
  onCreateClientWithDetails?: (clientData: any) => Promise<any>;
  onClientSelect: (client: any) => void;
  onResetClient: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const ClientSelectionStep: React.FC<ClientSelectionStepProps> = ({
  clientSearch,
  setClientSearch,
  clients,
  selectedClient,
  loading,
  onSearchClients,
  onCreateClientWithDetails,
  onClientSelect,
  onResetClient,
  onNext,
  onBack
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClientDetails, setNewClientDetails] = useState({
    fullName: clientSearch,
    email: `${clientSearch.toLowerCase().replace(/\s+/g, '.')}@biblioteca.com`,
    cpf: "",
    phone: ""
    // Campos de senha removidos pois o backend gera automaticamente
  });

  const handleCreateWithDetails = async () => {
    if (!newClientDetails.fullName.trim()) {
      alert("O nome completo é obrigatório");
      return;
    }

    // Validações de senha removidas pois o backend gera automaticamente

    if (onCreateClientWithDetails) {
      try {
        await onCreateClientWithDetails(newClientDetails);
        setShowCreateForm(false);
      } catch (error) {
        // Erro já é tratado na função principal
      }
    }
  };

  return (
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
              onChange={(e) => {
                setClientSearch(e.target.value);
                setNewClientDetails(prev => ({
                  ...prev,
                  fullName: e.target.value,
                  email: `${e.target.value.toLowerCase().replace(/\s+/g, '.')}@biblioteca.com`
                }));
              }}
              onKeyDown={(e) => e.key === 'Enter' && onSearchClients()}
              disabled={loading}
            />
            <button
              className="btn btn-outline-primary"
              onClick={onSearchClients}
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
                    onClick={() => onClientSelect(client)}
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
            {!showCreateForm ? (
              <>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setShowCreateForm(true)}
                  disabled={loading}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Cadastrar Novo Leitor
                </button>
              </>
            ) : (
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">Cadastrar Novo Leitor</h6>
                  <div className="mb-3">
                    <label className="form-label">Nome Completo *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newClientDetails.fullName}
                      onChange={(e) => setNewClientDetails(prev => ({
                        ...prev,
                        fullName: e.target.value
                      }))}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={newClientDetails.email}
                      onChange={(e) => setNewClientDetails(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">CPF</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newClientDetails.cpf}
                      onChange={(e) => setNewClientDetails(prev => ({
                        ...prev,
                        cpf: e.target.value
                      }))}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Telefone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newClientDetails.phone}
                      onChange={(e) => setNewClientDetails(prev => ({
                        ...prev,
                        phone: e.target.value
                      }))}
                    />
                  </div>
                  <div className="alert alert-info">
                    <small>
                      <i className="bi bi-info-circle me-1"></i>
                      A senha será gerada automaticamente e enviada por email para o cliente.
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={handleCreateWithDetails}
                      disabled={loading || !newClientDetails.fullName.trim()}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2" />
                      ) : (
                        <i className="bi bi-check me-2"></i>
                      )}
                      Cadastrar
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
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
            {selectedClient.cpf && (
              <>
                <br />
                <i className="bi bi-card-text me-1"></i>
                {selectedClient.cpf}
              </>
            )}
          </small>
          <button
            className="btn btn-sm btn-outline-secondary mt-2"
            onClick={onResetClient}
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
          onClick={onBack}
          disabled={loading}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Voltar
        </button>
        {selectedClient && (
          <button 
            className="btn btn-primary" 
            onClick={onNext}
            disabled={loading}
          >
            Avançar <i className="bi bi-arrow-right ms-1"></i>
          </button>
        )}
      </div>
    </div>
  );
};