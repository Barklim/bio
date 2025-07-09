import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "../config/api";
import { AuthResponse, LoginDto, RegisterDto } from "../types";

export class AuthService {
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.login,
      data
    );

    await apiClient.setAuthToken(response.accessToken);

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
