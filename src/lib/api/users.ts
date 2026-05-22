import api from './client';
import type {
  User,
  UserRole,
  UpdateRolePayload,
  UserSearchParams,
  ApiResponse,
  PageResponse,
} from '@/types';

// Search users by phone or name
export const searchUsers = async (
  params: UserSearchParams
): Promise<PageResponse<User>> => {
  const response = await api.get<ApiResponse<PageResponse<User>>>('/users', {
    params,
  });
  return response.data.data;
};

// Get a single user by ID
export const getUserById = async (userId: string): Promise<User> => {
  const response = await api.get<ApiResponse<User>>(`/users/${userId}`);
  return response.data.data;
};

// Update a user's role (Admin only)
export const updateUserRole = async (
  payload: UpdateRolePayload
): Promise<User> => {
  const { userId, role } = payload;
  const response = await api.patch<ApiResponse<User>>(
    `/users/${userId}/role`,
    { role }
  );
  return response.data.data;
};