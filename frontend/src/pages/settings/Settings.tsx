import React, { useState, useEffect } from "react";
import { BaseLayout } from "@layouts/BaseLayout";
import { useAuth } from "../auth/authContext";
import { SettingsService, NotificationSettings, FinePolicy, LoanPolicy, EmailAccount } from "./SettingsService";
import "bootstrap/dist/css/bootstrap.min.css";

interface LibrarySettingsPageProps {
  userName: string;
  isAdmin: boolean;
  libraryId?: number;
}

export const SettingsPage: React.FC<LibrarySettingsPageProps> = ({
  userName,
  isAdmin,
  libraryId: propLibraryId,
}) => {
  const { token } = useAuth();
  const libraryId = propLibraryId || 1;

  const [notification, setNotification] = useState<NotificationSettings>({
    notify_email: true,
    notify_sms: false,
    return_reminder_days: 3,
  });

  const [finePolicy, setFinePolicy] = useState<FinePolicy>({
    daily_fine: 2,
    max_fine: 20,
  });

  const [loanPolicy, setLoanPolicy] = useState<LoanPolicy>({
    loan_limit: 5,
    loan_period_days: 15,
    renewals_allowed: 1,
  });

  const [emailAccount, setEmailAccount] = useState<EmailAccount>({
    gmail_user_email: "biblioteca@example.com",
    gmail_oauth_token: "dummy_token",
    gmail_refresh_token: "dummy_refresh_token",
    google_auth_code: "",
  });

  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Busca as configurações do banco e cria se não existirem
  useEffect(() => {
    if (!token) return;

    const fetchAndInitializeSettings = async () => {
      setLoading(true);
      try {
        const [notifResult, fineResult, loanResult, emailResult] = await Promise.allSettled([
          SettingsService.getNotificationSettings(token, libraryId),
          SettingsService.getFinePolicy(token, libraryId),
          SettingsService.getLoanPolicy(token, libraryId),
          SettingsService.getEmailAccount(token, libraryId)
        ]);

        console.log('📋 Resultados da busca:', {
          notif: notifResult,
          fine: fineResult,
          loan: loanResult,
          email: emailResult
        });

        // Processa notificação
        if (notifResult.status === 'fulfilled' && notifResult.value) {
          setNotification(notifResult.value);
        } else {
          console.log('Criando configuração de notificação...');
          await SettingsService.createNotificationSettings(token, libraryId, notification);
        }

        // Processa política de multas
        if (fineResult.status === 'fulfilled' && fineResult.value) {
          setFinePolicy(fineResult.value);
        } else {
          console.log('Criando política de multas...');
          await SettingsService.createFinePolicy(token, libraryId, finePolicy);
        }

        // Processa política de empréstimos - CORREÇÃO AQUI
        if (loanResult.status === 'fulfilled' && loanResult.value) {
          setLoanPolicy(loanResult.value);
        } else {
          console.log('Criando política de empréstimos...');
          await SettingsService.createLoanPolicy(token, libraryId, loanPolicy);
        }

        // Processa conta de email
        if (emailResult.status === 'fulfilled' && emailResult.value) {
          setEmailAccount(emailResult.value);
        } else {
          console.log('Criando conta de email...');
          await SettingsService.createEmailAccount(token, libraryId, emailAccount);
        }

        setInitialized(true);
        
      } catch (err: any) {
        console.error("Erro ao inicializar configurações:", err);
        alert("Erro ao carregar configurações: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndInitializeSettings();
  }, [token, libraryId]);

  // Salva todas as configurações
  const handleSave = async () => {
    if (!token || !initialized) return;
    setLoading(true);
    try {
      await SettingsService.updateNotificationSettings(token, libraryId, notification);
      await SettingsService.updateFinePolicy(token, libraryId, finePolicy);
      await SettingsService.updateLoanPolicy(token, libraryId, loanPolicy);
      await SettingsService.updateEmailAccount(token, libraryId, emailAccount);
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

    console.log('=== INICIANDO handleAuthorizeGmail ===');
    console.log('libraryId:', libraryId);
    console.log('token:', token ? 'Token presente' : 'Token ausente');
    
    try {
      if (emailAccount.gmail_user_email) {
        await SettingsService.updateEmailAccount(token, libraryId, emailAccount);
      }
      
      console.log('📤 Solicitando URL de autorização via SettingsService...');
      
      const data = await SettingsService.authorizeGmail(token, libraryId);
      
      console.log('📋 Dados da resposta:', data);
      
      if (!data.url) {
        console.log('❌ URL não encontrada na resposta');
        throw new Error('URL de autorização não encontrada');
      }
      
      console.log('✅ URL de autorização obtida com sucesso');
      console.log('🔗 URL:', data.url);
      
      const newWindow = window.open(data.url, "_blank");
      if (!newWindow) {
        throw new Error('Popup bloqueado. Por favor, permita popups para este site.');
      }
      
      console.log('✅ Nova janela aberta com sucesso');
      
    } catch (err: any) {
      console.log('💥 Erro ao gerar link de autorização:', err);
      alert(err.message || "Erro ao gerar link de autorização.");
    } finally {
      console.log('=== FINALIZANDO handleAuthorizeGmail ===');
    }
  };

  const handleSaveGoogleCode = async () => {
    if (!token || !initialized) {
      alert("Aguarde as configurações serem carregadas.");
      return;
    }

    console.log('=== INICIANDO handleSaveGoogleCode ===');
    
    if (!emailAccount.google_auth_code) {
      console.log('❌ Código de autorização não informado');
      return alert("Informe o código de autorização.");
    }
    
    console.log('✅ Código de autorização presente:', emailAccount.google_auth_code);
    
    try {
      console.log('📤 Enviando código de autorização via SettingsService...');
      
      const data = await SettingsService.sendGoogleAuthCode(
        token, 
        libraryId, 
        emailAccount.google_auth_code
      );
      
      console.log('📋 Resposta do service:', data);
      
      setEmailAccount(prev => ({ ...prev, google_auth_code: "" }));
      alert(data.message || "Conta autorizada com sucesso!");
      
    } catch (err: any) {
      console.log('💥 Erro ao autorizar conta Google:', err);
      alert(err.message || "Erro ao autorizar conta Google.");
    } finally {
      console.log('=== FINALIZANDO handleSaveGoogleCode ===');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailAccount({ 
      ...emailAccount, 
      gmail_user_email: e.target.value,
      gmail_oauth_token: "",
      gmail_refresh_token: "",
      google_auth_code: ""
    });
  };

  // Função segura para atualizar loanPolicy
  const updateLoanPolicyField = (field: keyof LoanPolicy, value: number) => {
    setLoanPolicy(prev => ({
      ...prev,
      [field]: value
    }));
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
          Atualize as configurações do sistema, políticas de empréstimos, multas e notificações.
        </p>

        {/* Políticas de Empréstimo */}
        <div className="card mb-3">
          <div className="card-header">Políticas de Empréstimo</div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Limite de empréstimos por usuário</label>
              <input
                type="number"
                className="form-control"
                value={loanPolicy?.loan_limit || 0}
                onChange={e =>
                  updateLoanPolicyField('loan_limit', parseInt(e.target.value) || 0)
                }
                disabled={loading}
                min="1"
                max="20"
              />
              <div className="form-text">Número máximo de livros que um usuário pode emprestar simultaneamente</div>
            </div>
            <div className="mb-3">
              <label className="form-label">Período de empréstimo (dias)</label>
              <input
                type="number"
                className="form-control"
                value={loanPolicy?.loan_period_days || 0}
                onChange={e =>
                  updateLoanPolicyField('loan_period_days', parseInt(e.target.value) || 0)
                }
                disabled={loading}
                min="1"
                max="90"
              />
              <div className="form-text">Número de dias que um livro pode ficar emprestado</div>
            </div>
            <div className="mb-3">
              <label className="form-label">Renovações permitidas</label>
              <input
                type="number"
                className="form-control"
                value={loanPolicy?.renewals_allowed || 0}
                onChange={e =>
                  updateLoanPolicyField('renewals_allowed', parseInt(e.target.value) || 0)
                }
                disabled={loading}
                min="0"
                max="5"
              />
              <div className="form-text">Número de vezes que um empréstimo pode ser renovado</div>
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="card mb-3">
          <div className="card-header">Notificações</div>
          <div className="card-body">
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
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={notification.notify_sms}
                onChange={e =>
                  setNotification({ ...notification, notify_sms: e.target.checked })
                }
                disabled={loading}
              />
              <label className="form-check-label">Enviar notificações por SMS</label>
            </div>
            <div className="mb-3">
              <label className="form-label">Dias de lembrete antes da devolução</label>
              <input
                type="number"
                className="form-control"
                value={notification.return_reminder_days}
                onChange={e =>
                  setNotification({ ...notification, return_reminder_days: parseInt(e.target.value) || 0 })
                }
                disabled={loading}
                min="0"
                max="30"
              />
            </div>
          </div>
        </div>

        {/* Política de Multas */}
        <div className="card mb-3">
          <div className="card-header">Política de Multas</div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Multa diária (R$)</label>
              <input
                type="number"
                className="form-control"
                value={finePolicy.daily_fine}
                onChange={e =>
                  setFinePolicy({ ...finePolicy, daily_fine: parseFloat(e.target.value) || 0 })
                }
                disabled={loading}
                min="0"
                step="0.5"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Multa máxima (R$)</label>
              <input
                type="number"
                className="form-control"
                value={finePolicy.max_fine}
                onChange={e =>
                  setFinePolicy({ ...finePolicy, max_fine: parseFloat(e.target.value) || 0 })
                }
                disabled={loading}
                step="0.5"
              />
            </div>
          </div>
        </div>

        {/* Conta de E-mail */}
        <div className="card mb-3">
          <div className="card-header">Conta de E-mail</div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">E-mail do Gmail</label>
              <input
                type="email"
                className="form-control"
                value={emailAccount.gmail_user_email}
                onChange={handleEmailChange}
                disabled={loading}
                placeholder="seu-email@gmail.com"
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Status da Autorização</label>
              <div className="alert alert-info">
                {emailAccount.gmail_oauth_token ? (
                  <span className="text-success">✅ Conta autorizada</span>
                ) : (
                  <span className="text-warning">⏳ Aguardando autorização</span>
                )}
              </div>
            </div>

            <div className="d-flex mb-3">
              <button 
                className="btn btn-outline-primary me-2" 
                onClick={handleAuthorizeGmail}
                disabled={loading || !emailAccount.gmail_user_email}
              >
                {loading ? "Autorizando..." : "Autorizar Gmail"}
              </button>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Código de autorização Google</label>
              <input
                type="text"
                className="form-control"
                value={emailAccount.google_auth_code || ""}
                onChange={e =>
                  setEmailAccount({ ...emailAccount, google_auth_code: e.target.value })
                }
                disabled={loading}
                placeholder="Cole aqui o código de autorização"
              />
              <button
                className="btn btn-success mt-2"
                onClick={handleSaveGoogleCode}
                disabled={loading || !emailAccount.google_auth_code}
              >
                {loading ? "Salvando..." : "Salvar Código"}
              </button>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button 
            className="btn btn-primary" 
            onClick={handleSave} 
            disabled={loading || !initialized}
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
          
          {!initialized && (
            <span className="text-warning align-self-center">
              ⚠️ Configurações não inicializadas
            </span>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};