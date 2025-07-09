import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services';
import { User, CreateUserDto, UpdateUserDto, ApiError } from '../types';

// Keys for query caching
export const USER_QUERY_KEYS = {
  all: ['users'] as const,
  list: () => [...USER_QUERY_KEYS.all, 'list'] as const,
  detail: (id: number) => [...USER_QUERY_KEYS.all, 'detail', id] as const,
};

// Hook for getting list of users
export const useUsers = () => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.list(),
    queryFn: () => userService.getUsers(),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// Hook for getting user by ID
export const useUser = (id: number) => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
};

// Hook for creating user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => userService.createUser(data),
    onSuccess: () => {
      // Invalidate the user list cache
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.list() });
    },
    onError: (error: ApiError) => {
      console.error('Ошибка создания пользователя:', error.message);
    },
  });
};

// Hook for updating user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
      userService.updateUser(id, data),
    onSuccess: (updatedUser) => {
      // Update the cache for a specific user
      queryClient.setQueryData(
        USER_QUERY_KEYS.detail(updatedUser.id),
        updatedUser
      );
      // Invalidate the list of users
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.list() });
    },
    onError: (error: ApiError) => {
      console.error('Ошибка обновления пользователя:', error.message);
    },
  });
};

// Hook for deleting a user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: (_, deletedId) => {
      // Remove a specific user from the cache
      queryClient.removeQueries({ queryKey: USER_QUERY_KEYS.detail(deletedId) });
      // Invalidate the list of users
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.list() });
    },
    onError: (error: ApiError) => {
      console.error('Ошибка удаления пользователя:', error.message);
    },
  });
}; 