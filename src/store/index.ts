import { configureStore } from '@reduxjs/toolkit';
import authReducer         from './slices/authSlice';
import uiReducer           from './slices/uiSlice';
import usersReducer        from './slices/usersSlice';
import activitiesReducer from './slices/activitiesSlice';

export const store = configureStore({
  reducer: { 
    auth:  authReducer, 
    ui:    uiReducer,
    users: usersReducer,
    activities: activitiesReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;