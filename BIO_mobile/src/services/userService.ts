import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { User, CreateUserDto, UpdateUserDto } from '../types';

export class UserService {
  async getUsers(): Promise<User[]> {
    return apiClient.get<User[]>(API_ENDPOINTS.users.list);
  }

  async getUserById(id: number): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.users.getById(id));
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return apiClient.post<User>(API_ENDPOINTS.users.create, data);
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    return apiClient.patch<User>(API_ENDPOINTS.users.update(id), data);
  }

  async deleteUser(id: number): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.users.delete(id));
  }
}

export const userService = new UserService(); 