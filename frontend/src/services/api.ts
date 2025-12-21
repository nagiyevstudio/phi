import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface ApiResponse<T> {
  success: boolean;
  status: number;
  message?: string;
  data?: T;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse<unknown>>) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Request failed');
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Request failed');
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Request failed');
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Request failed');
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    if (response.data.success && response.data.data !== undefined) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Request failed');
  }

  // Download file (for export)
  async download(url: string, filename: string, params?: Record<string, unknown>): Promise<void> {
    const token = localStorage.getItem('auth_token');
    const queryString = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([_, value]) => value !== undefined && value !== null)
            .map(([key, value]) => [key, String(value)])
        ).toString()
      : '';
    const response = await fetch(`${API_BASE_URL}${url}${queryString}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

export const api = new ApiService();

// Auth API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
  token: string;
}

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get<{ id: string; email: string; createdAt: string; updatedAt: string }>('/me'),
};

// Budget API
export interface BudgetData {
  month: string;
  planned: number;
  expenseSum: number;
  incomeSum: number;
  remaining: number;
  daysLeft: number;
  dailyLimit: number;
  isOverBudget: boolean;
}

export const budgetApi = {
  getBudget: (month: string) => api.get<BudgetData>(`/months/${month}/budget`),
  setBudget: (month: string, plannedAmountMinor: number) =>
    api.put<{ month: string; plannedAmountMinor: number }>(`/months/${month}/budget`, {
      plannedAmountMinor,
    }),
};

// Operations API
export interface Operation {
  id: string;
  type: 'expense' | 'income';
  amountMinor: number;
  note: string | null;
  categoryId: string;
  categoryName: string;
  categoryType: string;
  categoryColor: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperationsListResponse {
  operations: Operation[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface CreateOperationRequest {
  type: 'expense' | 'income';
  amountMinor: number;
  categoryId: string;
  date: string;
  note?: string;
}

export const operationsApi = {
  list: (params?: {
    month?: string;
    type?: 'expense' | 'income';
    categoryId?: string;
    q?: string;
    page?: number;
    pageSize?: number;
  }) => api.get<OperationsListResponse>('/operations', params),
  get: (id: string) => api.get<Operation>(`/operations/${id}`),
  create: (data: CreateOperationRequest) => api.post<Operation>('/operations', data),
  update: (id: string, data: Partial<CreateOperationRequest>) => api.put<Operation>(`/operations/${id}`, data),
  delete: (id: string) => api.delete(`/operations/${id}`),
};

// Categories API
export interface Category {
  id: string;
  type: 'expense' | 'income';
  name: string;
  color: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesListResponse {
  categories: Category[];
}

export interface CreateCategoryRequest {
  type: 'expense' | 'income';
  name: string;
  color?: string;
}

export const categoriesApi = {
  list: (type?: 'expense' | 'income', includeArchived?: boolean) =>
    api.get<CategoriesListResponse>('/categories', { type, includeArchived }),
  create: (data: CreateCategoryRequest) => api.post<Category>('/categories', data),
  update: (id: string, data: { name?: string; color?: string | null }) =>
    api.put<Category>(`/categories/${id}`, data),
  archive: (id: string) => api.patch(`/categories/${id}/archive`),
};

// Analytics API
export interface AnalyticsData {
  month: string;
  totals: {
    incomeMinor: number;
    expenseMinor: number;
    netMinor: number;
  };
  expensesByCategory: Array<{
    categoryId: string;
    categoryName: string;
    color: string | null;
    totalMinor: number;
    percentage: number;
    transactionCount: number;
  }>;
  expensesByDay: Array<{
    date: string;
    totalMinor: number;
    transactionCount: number;
  }>;
}

export const analyticsApi = {
  get: (month: string) => api.get<AnalyticsData>('/analytics', { month }),
};

// Export API
export const exportApi = {
  json: (month?: string) => api.download('/export/json', `export_${month || 'all'}_${new Date().toISOString().split('T')[0]}.json`, { month }),
  csv: (month?: string) => api.download('/export/csv', `export_${month || 'all'}_${new Date().toISOString().split('T')[0]}.csv`, { month }),
};

