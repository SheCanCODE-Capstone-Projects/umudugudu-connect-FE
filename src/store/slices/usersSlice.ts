import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, UserSearchParams, UpdateRolePayload } from '@/types';
import { searchUsers, getUserById, updateUserRole } from '@/lib/api/users';

// ─── State ────────────────────────────────────────────────────────
interface UsersState {
  users:         User[];
  selectedUser:  User | null;
  loading:       boolean;
  error:         string | null;
  successMessage: string | null;
}

const initialState: UsersState = {
  users:          [],
  selectedUser:   null,
  loading:        false,
  error:          null,
  successMessage: null,
};

// ─── Thunks ───────────────────────────────────────────────────────
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: UserSearchParams, { rejectWithValue }) => {
    try {
      const result = await searchUsers(params);
      return result.content;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await getUserById(userId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const assignUserRole = createAsyncThunk(
  'users/assignUserRole',
  async (payload: UpdateRolePayload, { rejectWithValue }) => {
    try {
      return await updateUserRole(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update role');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearSelectedUser(state) {
      state.selectedUser = null;
    },
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // fetchUsers
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchUserById
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // assignUserRole
    builder
      .addCase(assignUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(assignUserRole.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.successMessage = 'Role updated successfully';
        // update user in list if exists
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
        // update selected user if open
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      })
      .addCase(assignUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedUser, clearMessages } = usersSlice.actions;
export default usersSlice.reducer;