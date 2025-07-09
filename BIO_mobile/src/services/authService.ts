import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "../config/api";
import { AuthResponse, LoginDto, RegisterDto } from "../types";

export class AuthService {
    async login(data: LoginDto): Promise<AuthResponse> {
    console.log('Attempting to login with:', { email: data.email });
    
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.login,
      data
    );
    
    console.log('Login successful, saving token...');
    await apiClient.setAuthToken(response.accessToken);
    
    console.log('Token saved successfully');
    return response;
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.register,
      data
    );

    await apiClient.setAuthToken(response.accessToken);

    return response;
  }

  async logout(): Promise<void> {
    await apiClient.removeAuthToken();
  }

  async checkAuthStatus(): Promise<string | null> {
    try {
      const token = await apiClient.getAuthToken();
      return token;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
