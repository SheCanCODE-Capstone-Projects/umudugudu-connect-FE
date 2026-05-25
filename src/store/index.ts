import { configureStore } from '@reduxjs/toolkit';
import authReducer         from './slices/authSlice';
import uiReducer           from './slices/uiSlice';
import activitiesReducer from './slices/activitiesSlice';


export const store = configureStore({
  reducer: { auth: authReducer, ui: uiReducer, activities: activitiesReducer },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;