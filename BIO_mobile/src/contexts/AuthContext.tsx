import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AuthContextType, User, RegisterDto, ApiError } from "../types";
import { authService } from "../services";

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const savedToken = await authService.checkAuthStatus();

      if (savedToken) {
        setToken(savedToken);
        // In a real application, you need to get user data by token here
        // For now, let's create a mock user for demonstration
        const mockUser = {
          id: 1,
          email: "user@example.com",
          firstName: "Пользователь",
          lastName: "Тестовый",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(mockUser);
      }
    } catch (error) {
      console.error("Ошибка проверки статуса аутентификации:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });

      setUser(response.user);
      setToken(response.accessToken);
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || "Ошибка при входе в систему");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterDto): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);

      setUser(response.user);
      setToken(response.accessToken);
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || "Ошибка при регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      // Clear the state even if there is an error
      setUser(null);
      setToken(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
