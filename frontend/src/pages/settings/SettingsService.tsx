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
  gmail_oauth_token: string;
  gmail_refresh_token: string;
  google_auth_code?: string;
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
  // Notification Settings
  getNotificationSettings: async (token: string, libraryId: number) => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/notification_setting`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  updateNotificationSettings: async (token: string, libraryId: number, data: NotificationSettings) => {
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

  createNotificationSettings: async (token: string, libraryId: number, data: NotificationSettings) => {
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

  // Fine Policy
  getFinePolicy: async (token: string, libraryId: number) => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/fine_policy`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  updateFinePolicy: async (token: string, libraryId: number, data: FinePolicy) => {
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

  createFinePolicy: async (token: string, libraryId: number, data: FinePolicy) => {
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

  // Loan Policy - NOVAS FUNÇÕES
  getLoanPolicy: async (token: string, libraryId: number) => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/loan_policy`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  updateLoanPolicy: async (token: string, libraryId: number, data: LoanPolicy) => {
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

  createLoanPolicy: async (token: string, libraryId: number, data: LoanPolicy) => {
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

  // Email Account
  getEmailAccount: async (token: string, libraryId: number) => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/email_account`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  updateEmailAccount: async (token: string, libraryId: number, data: Partial<EmailAccount>) => {
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

  createEmailAccount: async (token: string, libraryId: number, data: EmailAccount) => {
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

  // Google OAuth
  authorizeGmail: async (token: string, libraryId: number) => {
    console.log('🔍 SettingsService.authorizeGmail chamado');
    console.log('URL:', `${API_URL}/libraries/${libraryId}/email_account/authorize_google`);
    
    const res = await fetch(`${API_URL}/libraries/${libraryId}/email_account/authorize_google`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log('🔍 Status da resposta:', res.status);
    return handleResponse(res);
  },

  sendGoogleAuthCode: async (token: string, libraryId: number, code: string) => {
    const res = await fetch(`${API_URL}/libraries/${libraryId}/email_account/callback`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
    return handleResponse(res);
  },
};