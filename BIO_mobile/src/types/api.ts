export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface QueryError {
  message: string;
  statusCode?: number;
} 