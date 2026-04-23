import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';

interface AuthState {
  user:    User | null;
  isAuth:  boolean;
  loading: boolean;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isAuth: false, loading: false } as AuthState,
  reducers: {
    setUser:   (state, { payload }: PayloadAction<User>) => { state.user = payload; state.isAuth = true; },
    clearAuth: (state) => { state.user = null; state.isAuth = false; },
    setLoading:(state, { payload }: PayloadAction<boolean>) => { state.loading = payload; },
  },
});

export const { setUser, clearAuth, setLoading } = authSlice.actions;
export default authSlice.reducer;
