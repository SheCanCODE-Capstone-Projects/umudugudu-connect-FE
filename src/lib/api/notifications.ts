import api from './client';
import type { ApiResponse } from '@/types';

export interface NotificationPreferences {
  sms:   boolean;
  push:  boolean;
  email: boolean;
}

// GET /api/notifications/preferences
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const res = await api.get<ApiResponse<NotificationPreferences>>('/notifications/preferences');
  return res.data.data;
};

// PUT /api/notifications/preferences
export const updateNotificationPreferences = async (
  payload: NotificationPreferences
): Promise<NotificationPreferences> => {
  const res = await api.put<ApiResponse<NotificationPreferences>>('/notifications/preferences', payload);
  return res.data.data;
};
