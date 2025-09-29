// SettingsService.ts

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
  message?: string;
}

export interface LibrarySettings {
  notification_settings: NotificationSettings;
  fine_policy: FinePolicy;
  loan_policy: LoanPolicy;
  email_account: EmailAccount;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const handleResponse = async (res: Response) => {
  const contentType = res.headers.get('content-type');
  
  if (!res.ok) {
    if (contentType?.includes('text/html')) {
      const errorText = await res.text();
      console.error('Erro HTML do servidor:', errorText);
      throw new Error(`Erro no servidor (${res.status}): Página de erro retornada`);
    }
    
    if (contentType?.includes('application/json')) {
      const errorData = await res.json();
      throw new Error(errorData.error || errorData.message || `Erro ${res.status}`);
    }
    
    throw new Error(`Erro ${res.status}: ${res.statusText}`);
  }
  
  if (!contentType?.includes('application/json')) {
    throw new Error('Resposta do servidor não é JSON');
  }
  
  return res.json();
};

export const SettingsService = {
  // ==========================================
  // NOTIFICATION SETTINGS
  // ==========================================

  getNotificationSettings: async (token: string, libraryId: number): Promise<NotificationSettings> => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/notification_setting`, {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });
    return handleResponse(res);
  },

  updateNotificationSettings: async (token: string, libraryId: number, data: NotificationSettings): Promise<NotificationSettings> => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/notification_setting`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notification_setting: data }),
    });
    return handleResponse(res);
  },

  createNotificationSettings: async (token: string, libraryId: number, data: NotificationSettings): Promise<NotificationSettings> => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/notification_setting`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notification_setting: data }),
    });
    return handleResponse(res);
  },

  // ==========================================
  // FINE POLICY
  // ==========================================

  getFinePolicy: async (token: string, libraryId: number): Promise<FinePolicy> => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/fine_policy`, {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });
    return handleResponse(res);
  },

  updateFinePolicy: async (token: string, libraryId: number, data: FinePolicy): Promise<FinePolicy> => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/fine_policy`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fine_policy: data }),
    });
    return handleResponse(res);
  },

  createFinePolicy: async (token: string, libraryId: number, data: FinePolicy): Promise<FinePolicy> => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/fine_policy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fine_policy: data }),
    });
    return handleResponse(res);
  },

  // ==========================================
  // LOAN POLICY
  // ==========================================

  getLoanPolicy: async (token: string, libraryId: number): Promise<LoanPolicy> => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/loan_policy`, {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });
    return handleResponse(res);
  },

  updateLoanPolicy: async (token: string, libraryId: number, data: LoanPolicy): Promise<LoanPolicy> => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/loan_policy`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ loan_policy: data }),
    });
    return handleResponse(res);
  },

  createLoanPolicy: async (token: string, libraryId: number, data: LoanPolicy): Promise<LoanPolicy> => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/loan_policy`, { 
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ loan_policy: data }),
    });
    return handleResponse(res);
  },

  // ==========================================
  // EMAIL ACCOUNT - CRUD BÁSICO
  // ==========================================

  getEmailAccount: async (token: string, libraryId: number): Promise<EmailAccount> => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/email_account`, {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });
    return handleResponse(res);
  },

  updateEmailAccount: async (token: string, libraryId: number, data: Partial<EmailAccount>): Promise<EmailAccount> => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/email_account`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_account: data }),
    });
    return handleResponse(res);
  },

  createEmailAccount: async (token: string, libraryId: number, data: EmailAccount): Promise<EmailAccount> => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/email_account`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_account: data }),
    });
    return handleResponse(res);
  },

  deleteEmailAccount: async (token: string, libraryId: number): Promise<{ message: string }> => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/email_account`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return handleResponse(res);
  },

  // ==========================================
  // GMAIL OAUTH 2.0 - ENDPOINTS ESPECÍFICOS
  // ==========================================

  /**
   * Gerar URL de autorização OAuth 2.0 do Google
   */
  authorizeGmail: async (token: string, libraryId: number): Promise<{ authorization_url: string; message: string }> => {
    console.log('🔐 Solicitando URL de autorização Gmail...');
    
    const res = await fetch(`${API_URL}/libraries/${libraryId}/email_account/authorize_google`, {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    const data = await handleResponse(res);
    console.log('✅ URL de autorização recebida:', data);
    return data;
  },
  
  handleOAuthCallback: async (token: string | any, libraryId: number, code: string): Promise<{ message: string; email?: string; authorized_at?: string }> => {
    console.log('📝 Processando callback OAuth com código:', code.substring(0, 10) + '...');
    
    const res = await fetch(`${API_URL}/libraries/${libraryId}/email_account/oauth_callback`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
    
    const data = await handleResponse(res);
    console.log('✅ Callback processado:', data);
    return data;
  },

  /**
   * Verificar status atual da autorização
   */
  getAuthorizationStatus: async (token: string, libraryId: number): Promise<AuthorizationStatus> => {
    console.log('🔍 Verificando status da autorização...');
    
    const res = await fetch(`${API_URL}/libraries/${libraryId}/email_account/authorization_status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    const data = await handleResponse(res);
    console.log('📊 Status da autorização:', data);
    return data;
  },

  /**
   * Renovar token de acesso usando refresh token
   */
  refreshToken: async (token: string, libraryId: number): Promise<{ message: string; expires_at?: string }> => {
    console.log('🔄 Renovando token de acesso...');
    
    const res = await fetch(`${API_URL}/libraries/${libraryId}/email_account/refresh_token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    const data = await handleResponse(res);
    console.log('✅ Token renovado:', data);
    return data;
  },

  /**
   * Revogar autorização OAuth e limpar tokens
   */
  revokeAuthorization: async (token: string | any, libraryId: number): Promise<{ message: string }> => {
    console.log('🚫 Revogando autorização OAuth...');
    
    const res = await fetch(`${API_URL}/libraries/${libraryId}/email_account/revoke_authorization`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    const data = await handleResponse(res);
    console.log('✅ Autorização revogada:', data);
    return data;
  },

  /**
   * Enviar email de teste
   */
  testEmail: async (
    token: string | any,
    libraryId: number, 
    toEmail: string, 
    subject?: string, 
    body?: string
  ): Promise<{ message: string; message_id?: string; to: string; subject: string }> => {
    console.log('📧 Enviando email de teste para:', toEmail);
    
    const res = await fetch(`${API_URL}/libraries/${libraryId}/email_account/test_email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        to_email: toEmail,
        subject: subject || `Email de teste - ${new Date().toLocaleString('pt-BR')}`,
        body: body || `Este é um email de teste enviado via Gmail API.\n\nEnviado em: ${new Date().toLocaleString('pt-BR')}`
      }),
    });
    
    const data = await handleResponse(res);
    console.log('✅ Email enviado:', data);
    return data;
  },

  // ==========================================
  // UTILITÁRIOS E HELPERS
  // ==========================================

  /**
   * Verificar se todas as configurações estão completas
   */
  checkAllSettings: async (token: string, libraryId: number): Promise<{
    notification_settings: boolean;
    fine_policy: boolean;
    loan_policy: boolean;
    email_account: boolean;
    email_authorized: boolean;
  }> => {
    try {
      const [notifResult, fineResult, loanResult, emailResult, authResult] = await Promise.allSettled([
        SettingsService.getNotificationSettings(token, libraryId),
        SettingsService.getFinePolicy(token, libraryId),
        SettingsService.getLoanPolicy(token, libraryId),
        SettingsService.getEmailAccount(token, libraryId),
        SettingsService.getAuthorizationStatus(token, libraryId)
      ]);

      return {
        notification_settings: notifResult.status === 'fulfilled' && !!notifResult.value,
        fine_policy: fineResult.status === 'fulfilled' && !!fineResult.value,
        loan_policy: loanResult.status === 'fulfilled' && !!loanResult.value,
        email_account: emailResult.status === 'fulfilled' && !!emailResult.value,
        email_authorized: authResult.status === 'fulfilled' && authResult.value.status === 'authorized'
      };
    } catch (error) {
      console.error('Erro ao verificar configurações:', error);
      return {
        notification_settings: false,
        fine_policy: false,
        loan_policy: false,
        email_account: false,
        email_authorized: false
      };
    }
  },

  /**
   * Inicializar todas as configurações com valores padrão
   */
  initializeAllSettings: async (token: string, libraryId: number): Promise<{
    success: boolean;
    message: string;
    errors?: string[];
  }> => {
    const errors: string[] = [];
    
    try {
      // Configurações de notificação
      try {
        await SettingsService.getNotificationSettings(token, libraryId);
      } catch {
        await SettingsService.createNotificationSettings(token, libraryId, {
          notify_email: false,
          notify_sms: false,
          return_reminder_days: 0,
        });
      }

      // Política de multas
      try {
        await SettingsService.getFinePolicy(token, libraryId);
      } catch {
        await SettingsService.createFinePolicy(token, libraryId, {
          daily_fine: 0,
          max_fine: 0,
        });
      }

      // Política de empréstimos
      try {
        await SettingsService.getLoanPolicy(token, libraryId);
      } catch {
        await SettingsService.createLoanPolicy(token, libraryId, {
          loan_limit: 0,
          loan_period_days: 0,
          renewals_allowed: 0,
        });
      }

      // Conta de email
      try {
        await SettingsService.getEmailAccount(token, libraryId);
      } catch {
        await SettingsService.createEmailAccount(token, libraryId, {
          gmail_user_email: "",
        });
      }

      return {
        success: true,
        message: 'Todas as configurações foram inicializadas com sucesso!'
      };

    } catch (error: any) {
      errors.push(error.message || 'Erro desconhecido');
      return {
        success: false,
        message: 'Erro ao inicializar configurações',
        errors
      };
    }
  },

  /**
   * Resetar todas as configurações (CUIDADO!)
   */
  resetAllSettings: async (token: string, libraryId: number): Promise<{ message: string }> => {
    console.warn('⚠️ RESETANDO TODAS AS CONFIGURAÇÕES - Esta ação não pode ser desfeita!');
    
    const errors: string[] = [];

    // Revogar autorização de email primeiro
    try {
      await SettingsService.revokeAuthorization(token, libraryId);
    } catch (error: any) {
      errors.push(`Erro ao revogar autorização: ${error.message}`);
    }

    // Tentar deletar conta de email
    try {
      await SettingsService.deleteEmailAccount(token, libraryId);
    } catch (error: any) {
      errors.push(`Erro ao deletar conta de email: ${error.message}`);
    }

    // Recriar configurações vazias
    try {
      await SettingsService.initializeAllSettings(token, libraryId);
    } catch (error: any) {
      errors.push(`Erro ao recriar configurações: ${error.message}`);
    }

    if (errors.length > 0) {
      throw new Error(`Reset parcialmente concluído com erros: ${errors.join('; ')}`);
    }

    return { message: 'Todas as configurações foram resetadas com sucesso!' };
  }
};

export default SettingsService;
