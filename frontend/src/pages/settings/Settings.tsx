import React, { useState, useEffect } from "react";
import { BaseLayout } from "@layouts/BaseLayout";
import { useAuth } from "../auth/authContext";
import { SettingsService } from "./SettingsService"
import "bootstrap/dist/css/bootstrap.min.css";

interface LibrarySettingsPageProps {
  userName: string;
  isAdmin: boolean;
  libraryId?: number;
}

export interface NotificationSettings {
  notify_email: boolean;
  notify_sms: boolean;
  return_reminder_days: number;
}

export interface FinePolicy {
  daily_fine: number;
  max_fine: number;
}

export interface LoanPolicy {
  loan_limit: number;
  loan_period_days: number;
  renewals_allowed: number;
}

export interface EmailAccount {
  gmail_user_email: string;
  gmail_oauth_token?: string;
  gmail_refresh_token?: string;
  authorization_status?: string;
  authorized_at?: string;
  token_expires_at?: string;
}

export interface AuthorizationStatus {
  status: string;
  email?: string;
  authorized_at?: string;
  expires_at?: string;
  needs_reauthorization?: boolean;
}

export const SettingsPage: React.FC<LibrarySettingsPageProps> = ({
  userName,
  isAdmin,
  libraryId: propLibraryId,
}) => {
  const { token } = useAuth();
  const libraryId = propLibraryId || 1;

  const [notification, setNotification] = useState<NotificationSettings | null>(null);
  const [finePolicy, setFinePolicy] = useState<FinePolicy | null>(null);
  const [loanPolicy, setLoanPolicy] = useState<LoanPolicy | null>(null);
  const [emailAccount, setEmailAccount] = useState<EmailAccount | null>(null);

  const [authStatus, setAuthStatus] = useState<AuthorizationStatus>({
    status: 'not_configured'
  });

  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const [notifResult, fineResult, loanResult, emailResult] = await Promise.allSettled([
          SettingsService.getNotificationSettings(token, libraryId),
          SettingsService.getFinePolicy(token, libraryId),
          SettingsService.getLoanPolicy(token, libraryId),
          SettingsService.getEmailAccount(token, libraryId)
        ]);

        if (notifResult.status === 'fulfilled' && notifResult.value) {
          setNotification(notifResult.value);
        }

        if (fineResult.status === 'fulfilled' && fineResult.value) {
          setFinePolicy(fineResult.value);
        }

        if (loanResult.status === 'fulfilled' && loanResult.value) {
          setLoanPolicy(loanResult.value);
        }

        if (emailResult.status === 'fulfilled' && emailResult.value) {
          setEmailAccount(emailResult.value);
          await checkAuthorizationStatus();
        }

        setInitialized(true);
        
      } catch (err: any) {
        console.error("Erro ao carregar configurações:", err);
        alert("Erro ao carregar configurações: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [token, libraryId]);

  const checkAuthorizationStatus = async () => {
    if (!token) return;
    
    try {
      const status = await SettingsService.getAuthorizationStatus(token, libraryId);
      setAuthStatus(status);
    } catch (err: any) {
      console.error("Erro ao verificar status:", err);
      setAuthStatus({ status: 'error' });
    }
  };

  const handleCreateNotificationSettings = async () => {
    if (!token) return;
    
    const defaultNotification = {
      notify_email: false,
      notify_sms: false,
      return_reminder_days: 0,
    };

    try {
      setLoading(true);
      await SettingsService.createNotificationSettings(token, libraryId, defaultNotification);
      setNotification(defaultNotification);
    } catch (err: any) {
      alert("Erro ao criar configurações de notificação: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFinePolicy = async () => {
    if (!token) return;
    
    const defaultFinePolicy = {
      daily_fine: 0,
      max_fine: 0,
    };

    try {
      setLoading(true);
      await SettingsService.createFinePolicy(token, libraryId, defaultFinePolicy);
      setFinePolicy(defaultFinePolicy);
    } catch (err: any) {
      alert("Erro ao criar política de multas: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLoanPolicy = async () => {
    if (!token) return;
    
    const defaultLoanPolicy = {
      loan_limit: 0,
      loan_period_days: 0,
      renewals_allowed: 0,
    };

    try {
      setLoading(true);
      await SettingsService.createLoanPolicy(token, libraryId, defaultLoanPolicy);
      setLoanPolicy(defaultLoanPolicy);
    } catch (err: any) {
      alert("Erro ao criar política de empréstimos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmailAccount = async () => {
    if (!token) return;
    
    const defaultEmailAccount = {
      gmail_user_email: "",
    };

    try {
      setLoading(true);
      await SettingsService.createEmailAccount(token, libraryId, defaultEmailAccount);
      setEmailAccount(defaultEmailAccount);
    } catch (err: any) {
      alert("Erro ao criar conta de email: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token || !initialized) return;
    setLoading(true);
    try {
      const promises = [];
      
      if (notification) {
        promises.push(SettingsService.updateNotificationSettings(token, libraryId, notification));
      }
      
      if (finePolicy) {
        promises.push(SettingsService.updateFinePolicy(token, libraryId, finePolicy));
      }
      
      if (loanPolicy) {
        promises.push(SettingsService.updateLoanPolicy(token, libraryId, loanPolicy));
      }
      
      if (emailAccount) {
        promises.push(SettingsService.updateEmailAccount(token, libraryId, emailAccount));
      }

      await Promise.all(promises);
      alert("Configurações salvas com sucesso!");
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizeGmail = async () => {
    if (!token || !initialized) {
      alert("Aguarde as configurações serem carregadas.");
      return;
    }

    if (!emailAccount?.gmail_user_email) {
      alert("Informe o email do Gmail primeiro.");
      return;
    }

    try {
      setLoading(true);
      
      await SettingsService.updateEmailAccount(token, libraryId, {
        gmail_user_email: emailAccount.gmail_user_email
      });
      
      const data = await SettingsService.authorizeGmail(token, libraryId);
      
      if (!data.authorization_url) {
        throw new Error('URL de autorização não encontrada');
      }
      
      window.open(data.authorization_url, '_blank');
      
    } catch (err: any) {
      console.error('Erro:', err);
      alert(err.message || "Erro ao gerar link de autorização.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (!code) {
      alert("Código de autorização não encontrado na URL.");
      return;
    }

    try {
      setLoading(true);
      
      const data = await SettingsService.handleOAuthCallback(token, libraryId, code);
      
      alert(data.message || "Conta autorizada com sucesso!");
      
      await checkAuthorizationStatus();
      
      window.history.replaceState({}, document.title, window.location.pathname);
      
    } catch (err: any) {
      alert(err.message || "Erro ao autorizar conta Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const data = await SettingsService.refreshToken(token, libraryId);
      alert(data.message || "Token renovado com sucesso!");
      await checkAuthorizationStatus();
    } catch (err: any) {
      alert(err.message || "Erro ao renovar token.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAuthorization = async () => {
    if (!confirm("Tem certeza que deseja revogar a autorização? Será necessário autorizar novamente.")) {
      return;
    }

    try {
      setLoading(true);
      const data = await SettingsService.revokeAuthorization(token, libraryId);
      alert(data.message || "Autorização revogada com sucesso!");
      await checkAuthorizationStatus();
    } catch (err: any) {
      alert(err.message || "Erro ao revogar autorização.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      alert("Informe um email para teste.");
      return;
    }

    try {
      setLoading(true);
      const data = await SettingsService.testEmail(token, libraryId, testEmail);
      alert(data.message || "Email de teste enviado com sucesso!");
    } catch (err: any) {
      alert(err.message || "Erro ao enviar email de teste.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && token && initialized) {
      handleOAuthCallback();
    }
  }, [token, initialized]);

  const updateLoanPolicyField = (field: keyof LoanPolicy, value: number) => {
    if (!loanPolicy) return;
    setLoanPolicy(prev => prev ? {
      ...prev,
      [field]: value
    } : prev);
  };

  const getAuthStatusBadge = () => {
    switch (authStatus.status) {
      case 'authorized':
        return <span className="badge bg-success">Autorizada</span>;
      case 'expired_but_renewable':
        return <span className="badge bg-warning">Expirada (Renovável)</span>;
      case 'not_authorized':
        return <span className="badge bg-secondary">Não Autorizada</span>;
      case 'not_configured':
        return <span className="badge bg-secondary">Não Configurada</span>;
      case 'failed':
        return <span className="badge bg-danger">Falhou</span>;
      case 'revoked':
        return <span className="badge bg-danger">Revogada</span>;
      default:
        return <span className="badge bg-secondary">Desconhecido</span>;
    }
  };

  if (loading && !initialized) {
    return (
      <BaseLayout userName={userName} isAdmin={isAdmin}>
        <div className="container py-4">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-3">Carregando configurações...</p>
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout userName={userName} isAdmin={isAdmin}>
      <div className="container py-4">
        <h2>Configurações da Biblioteca</h2>
        <p className="text-muted mb-4">
          Configure as políticas de empréstimos, multas, notificações e integração com Gmail.
        </p>

        <div className="card mb-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Políticas de Empréstimo</span>
            {!loanPolicy && (
              <button 
                className="btn btn-sm btn-primary"
                onClick={handleCreateLoanPolicy}
                disabled={loading}
              >
                Criar Configuração
              </button>
            )}
          </div>
          <div className="card-body">
            {loanPolicy ? (
              <>
                <div className="mb-3">
                  <label className="form-label">Limite de empréstimos por usuário</label>
                  <input
                    type="number"
                    className="form-control"
                    value={loanPolicy.loan_limit || ''}
                    onChange={e =>
                      updateLoanPolicyField('loan_limit', parseInt(e.target.value) || 0)
                    }
                    disabled={loading}
                    min="0"
                    max="20"
                    placeholder="Ex: 5"
                  />
                  <div className="form-text">Número máximo de livros que um usuário pode emprestar simultaneamente</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Período de empréstimo (dias)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={loanPolicy.loan_period_days || ''}
                    onChange={e =>
                      updateLoanPolicyField('loan_period_days', parseInt(e.target.value) || 0)
                    }
                    disabled={loading}
                    min="0"
                    max="90"
                    placeholder="Ex: 15"
                  />
                  <div className="form-text">Número de dias que um livro pode ficar emprestado</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Renovações permitidas</label>
                  <input
                    type="number"
                    className="form-control"
                    value={loanPolicy.renewals_allowed || ''}
                    onChange={e =>
                      updateLoanPolicyField('renewals_allowed', parseInt(e.target.value) || 0)
                    }
                    disabled={loading}
                    min="0"
                    max="5"
                    placeholder="Ex: 2"
                  />
                  <div className="form-text">Número de vezes que um empréstimo pode ser renovado</div>
                </div>
              </>
            ) : (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Nenhuma política de empréstimo configurada. Clique em "Criar Configuração" para começar.
              </div>
            )}
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Notificações</span>
            {!notification && (
              <button 
                className="btn btn-sm btn-primary"
                onClick={handleCreateNotificationSettings}
                disabled={loading}
              >
                Criar Configuração
              </button>
            )}
          </div>
          <div className="card-body">
            {notification ? (
              <>
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={notification.notify_email}
                    onChange={e =>
                      setNotification({ ...notification, notify_email: e.target.checked })
                    }
                    disabled={loading}
                  />
                  <label className="form-check-label">Enviar notificações por e-mail</label>
                </div>
                <div className="mb-3">
                  <label className="form-label">Dias de lembrete antes da devolução</label>
                  <input
                    type="number"
                    className="form-control"
                    value={notification.return_reminder_days || ''}
                    onChange={e =>
                      setNotification({ ...notification, return_reminder_days: parseInt(e.target.value) || 0 })
                    }
                    disabled={loading}
                    min="0"
                    max="30"
                    placeholder="Ex: 3"
                  />
                </div>
              </>
            ) : (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Nenhuma configuração de notificação encontrada. Clique em "Criar Configuração" para começar.
              </div>
            )}
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Conta Gmail (OAuth 2.0)</span>
            <div className="d-flex gap-2">
              {!emailAccount && (
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={handleCreateEmailAccount}
                  disabled={loading}
                >
                  Criar Configuração
                </button>
              )}
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={checkAuthorizationStatus}
                disabled={loading}
              >
                Atualizar Status
              </button>
            </div>
          </div>
          <div className="card-body">
            {emailAccount ? (
              <>
                <div className="mb-3">
                  <label className="form-label">E-mail do Gmail</label>
                  <input
                    type="email"
                    className="form-control"
                    value={emailAccount.gmail_user_email || ''}
                    onChange={e => setEmailAccount({ ...emailAccount, gmail_user_email: e.target.value })}
                    disabled={loading}
                    placeholder="seu-email@gmail.com"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Status da Autorização</label>
                  <div className="alert alert-info d-flex justify-content-between align-items-center">
                    <div>
                      {getAuthStatusBadge()}
                      {authStatus.email && (
                        <small className="text-muted ms-2">Email: {authStatus.email}</small>
                      )}
                    </div>
                    {authStatus.authorized_at && (
                      <small className="text-muted">
                        Autorizado em: {new Date(authStatus.authorized_at).toLocaleString('pt-BR')}
                      </small>
                    )}
                  </div>
                  
                  {authStatus.expires_at && (
                    <div className="alert alert-warning">
                      <small>Expira em: {new Date(authStatus.expires_at).toLocaleString('pt-BR')}</small>
                    </div>
                  )}
                </div>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  {authStatus.status === 'not_authorized' || authStatus.status === 'not_configured' ? (
                    <button 
                      className="btn btn-primary" 
                      onClick={handleAuthorizeGmail}
                      disabled={loading || !emailAccount.gmail_user_email}
                    >
                      {loading ? "Processando..." : "Autorizar Gmail"}
                    </button>
                  ) : null}

                  {authStatus.status === 'expired_but_renewable' ? (
                    <button 
                      className="btn btn-warning" 
                      onClick={handleRefreshToken}
                      disabled={loading}
                    >
                      {loading ? "Renovando..." : "Renovar Token"}
                    </button>
                  ) : null}

                  {authStatus.status === 'authorized' || authStatus.status === 'expired_but_renewable' ? (
                    <button 
                      className="btn btn-danger" 
                      onClick={handleRevokeAuthorization}
                      disabled={loading}
                    >
                      {loading ? "Revogando..." : "Revogar Autorização"}
                    </button>
                  ) : null}
                </div>

                {authStatus.status === 'authorized' && (
                  <div className="border-top pt-3">
                    <h6>Teste de Envio</h6>
                    <div className="input-group">
                      <input
                        type="email"
                        className="form-control"
                        placeholder="email-teste@exemplo.com"
                        value={testEmail}
                        onChange={e => setTestEmail(e.target.value)}
                        disabled={loading}
                      />
                      <button 
                        className="btn btn-success" 
                        onClick={handleTestEmail}
                        disabled={loading || !testEmail}
                      >
                        {loading ? "Enviando..." : "Enviar Teste"}
                      </button>
                    </div>
                    <small className="form-text text-muted">
                      Envie um email de teste para verificar se a configuração está funcionando.
                    </small>
                  </div>
                )}

                <div className="mt-3">
                  <details className="text-muted">
                    <summary>Como funciona a autorização OAuth 2.0</summary>
                    <ul className="mt-2 small">
                      <li>1. Informe seu email do Gmail</li>
                      <li>2. Clique em "Autorizar Gmail" - uma nova aba abrirá</li>
                      <li>3. Faça login no Google e autorize a aplicação</li>
                      <li>4. Retorne para esta página - a autorização será salva automaticamente</li>
                      <li>5. A autorização ficará salva e será renovada automaticamente</li>
                    </ul>
                  </details>
                </div>
              </>
            ) : (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Nenhuma conta de email configurada. Clique em "Criar Configuração" para começar.
              </div>
            )}
          </div>
        </div>

        <div className="d-flex gap-2">
          <button 
            className="btn btn-primary" 
            onClick={handleSave} 
            disabled={loading || !initialized || (!notification && !finePolicy && !loanPolicy && !emailAccount)}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Salvando...
              </>
            ) : (
              "Salvar Configurações"
            )}
          </button>
          
          {(!notification && !finePolicy && !loanPolicy && !emailAccount) && (
            <span className="text-info align-self-center">
              Crie pelo menos uma configuração para poder salvar
            </span>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};