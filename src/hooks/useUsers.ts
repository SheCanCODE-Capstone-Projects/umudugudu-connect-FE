import { useAppSelector, useAppDispatch } from './redux';
import {
  fetchUsers,
  fetchUserById,
  assignUserRole,
  clearSelectedUser,
  clearMessages,
} from '@/store/slices/usersSlice';
import type { UserSearchParams, UpdateRolePayload } from '@/types';

export const useUsers = () => {
  const dispatch = useAppDispatch();
  const { users, selectedUser, loading, error, successMessage } =
    useAppSelector((state) => state.users);

  const searchUsers = (params: UserSearchParams) => {
    dispatch(fetchUsers(params));
  };

  const getUserById = (userId: string) => {
    dispatch(fetchUserById(userId));
  };

  const updateRole = (payload: UpdateRolePayload) => {
    dispatch(assignUserRole(payload));
  };

  const resetSelectedUser = () => {
    dispatch(clearSelectedUser());
  };

  const resetMessages = () => {
    dispatch(clearMessages());
  };

  return {
    users,
    selectedUser,
    loading,
    error,
    successMessage,
    searchUsers,
    getUserById,
    updateRole,
    resetSelectedUser,
    resetMessages,
  };
};