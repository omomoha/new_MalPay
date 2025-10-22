import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.tokens;
          localStorage.setItem('accessToken', accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  }) => api.post('/auth/register', userData),
  
  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),
  
  resendVerification: (email: string) =>
    api.post('/auth/resend-verification', { email }),
  
  logout: () => api.post('/auth/logout'),
  
  checkProfileCompletion: () =>
    api.get('/auth/profile-completion'),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// Cards API
export const cardsAPI = {
  getCards: () => api.get('/cards'),
  
  addCard: (cardData: {
    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    cardholderName: string;
  }) => api.post('/cards', cardData),
  
  setDefaultCard: (cardId: string) =>
    api.put(`/cards/${cardId}/set-default`),
  
  deleteCard: (cardId: string) =>
    api.delete(`/cards/${cardId}`),
};

// Bank Accounts API
export const bankAccountsAPI = {
  getBankAccounts: () => api.get('/bank-accounts'),
  
  addBankAccount: (accountData: {
    accountNumber: string;
    bankCode: string;
  }) => api.post('/bank-accounts', accountData),
  
  deleteBankAccount: (accountId: string) =>
    api.delete(`/bank-accounts/${accountId}`),
};

// Payments API
export const paymentsAPI = {
  transfer: (transferData: {
    recipientEmail: string;
    amount: number;
    currency: string;
    description?: string;
    processor: 'tron' | 'polygon' | 'ethereum';
  }) => api.post('/payments/transfer', transferData),
  
  getTransactions: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }) => api.get('/payments/transactions', { params }),
  
  getTransactionById: (transactionId: string) =>
    api.get(`/payments/transactions/${transactionId}`),
};

// Withdrawals API
export const withdrawalsAPI = {
  createWithdrawal: (withdrawalData: {
    amount: number;
    currency: string;
    bankAccountId: string;
  }) => api.post('/withdrawals', withdrawalData),
  
  getWithdrawals: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => api.get('/withdrawals', { params }),
};

// Blockchain API
export const blockchainAPI = {
  getBalance: (address: string, network: string) =>
    api.get(`/blockchain/balance/${network}/${address}`),
  
  getTransactionHistory: (address: string, network: string) =>
    api.get(`/blockchain/transactions/${network}/${address}`),
  
  getRecommendedNetwork: (amount: number) =>
    api.get(`/blockchain/recommended-network?amount=${amount}`),
  
  calculateFees: (network: string, amount: number) =>
    api.get(`/blockchain/fees/${network}?amount=${amount}`),
};

// Admin API
export const adminAPI = {
  getSecurityEvents: () => api.get('/admin/security-events'),
  
  getSystemStats: () => api.get('/admin/system-stats'),
  
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => api.get('/admin/users', { params }),
};

export default api;
