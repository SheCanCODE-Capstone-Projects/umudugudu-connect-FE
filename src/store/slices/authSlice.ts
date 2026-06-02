import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';

interface AuthState {
  user:    User | null;
  isAuth:  boolean;
  loading: boolean;
  hydrated: boolean;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isAuth: false, loading: false, hydrated: false } as AuthState,
  reducers: {
    setUser:   (state, { payload }: PayloadAction<User>) => { state.user = payload; state.isAuth = true; state.hydrated = true; },
    hydrateAuth: (state, { payload }: PayloadAction<User | null>) => {
      state.user = payload;
      state.isAuth = Boolean(payload);
      state.hydrated = true;
    },
    clearAuth: (state) => { state.user = null; state.isAuth = false; state.hydrated = true; },
    setLoading:(state, { payload }: PayloadAction<boolean>) => { state.loading = payload; },
  },
});

export const { setUser, hydrateAuth, clearAuth, setLoading } = authSlice.actions;
export default authSlice.reducer;
