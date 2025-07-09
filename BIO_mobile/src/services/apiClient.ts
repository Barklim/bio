import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../config/api';
import { ApiError } from '../types';

const TOKEN_KEY = 'auth_token';

class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
  }

  public async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  public async setAuthToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving auth token:', error);
    }
  }

  public async removeAuthToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  }

  private async createRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getAuthToken();
    
    const headers: Record<string, string> = {
      ...API_CONFIG.headers,
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Время ожидания запроса истекло');
      }
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'Произошла ошибка при выполнении запроса';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, use default message
      }

      const apiError: ApiError = {
        message: errorMessage,
        statusCode: response.status,
      };

      throw apiError;
    }

    return response.json();
  }

  public async get<T>(endpoint: string): Promise<T> {
    const response = await this.createRequest(endpoint, {
      method: 'GET',
    });
    return this.handleResponse<T>(response);
  }

  public async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.createRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  public async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.createRequest(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  public async delete<T>(endpoint: string): Promise<T> {
    const response = await this.createRequest(endpoint, {
      method: 'DELETE',
    });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient(); 