import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Activity, CreateActivityPayload, ActivitySearchParams, ActivityPerformance } from '@/types';
import { getActivities, getActivityById, createActivity, getActivityPerformance } from '@/lib/api/activities';

interface ActivitiesState {
  activities:       Activity[];
  selectedActivity: Activity | null;
  performance:      ActivityPerformance | null;
  loading:          boolean;
  error:            string | null;
  successMessage:   string | null;
}

const initialState: ActivitiesState = {
  activities:       [],
  selectedActivity: null,
  performance:      null,
  loading:          false,
  error:            null,
  successMessage:   null,
};

export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async (params: ActivitySearchParams, { rejectWithValue }) => {
    try {
      const result = await getActivities(params);
      return result.content;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch activities');
    }
  }
);

export const fetchActivityById = createAsyncThunk(
  'activities/fetchActivityById',
  async (activityId: string, { rejectWithValue }) => {
    try {
      return await getActivityById(activityId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch activity');
    }
  }
);

export const addActivity = createAsyncThunk(
  'activities/addActivity',
  async (payload: CreateActivityPayload, { rejectWithValue }) => {
    try {
      return await createActivity(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create activity');
    }
  }
);

export const fetchActivityPerformance = createAsyncThunk(
  'activities/fetchActivityPerformance',
  async (activityId: string, { rejectWithValue }) => {
    try {
      return await getActivityPerformance(activityId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch performance');
    }
  }
);

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    clearSelectedActivity(state) { state.selectedActivity = null; },
    clearPerformance(state) { state.performance = null; },
    clearMessages(state) { state.error = null; state.successMessage = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchActivities.fulfilled, (state, action: PayloadAction<Activity[]>) => { state.loading = false; state.activities = action.payload; })
      .addCase(fetchActivities.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder
      .addCase(fetchActivityById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchActivityById.fulfilled, (state, action: PayloadAction<Activity>) => { state.loading = false; state.selectedActivity = action.payload; })
      .addCase(fetchActivityById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder
      .addCase(addActivity.pending, (state) => { state.loading = true; state.error = null; state.successMessage = null; })
      .addCase(addActivity.fulfilled, (state, action: PayloadAction<Activity>) => { state.loading = false; state.successMessage = 'Activity created successfully'; state.activities.unshift(action.payload); })
      .addCase(addActivity.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    builder
      .addCase(fetchActivityPerformance.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchActivityPerformance.fulfilled, (state, action: PayloadAction<ActivityPerformance>) => { state.loading = false; state.performance = action.payload; })
      .addCase(fetchActivityPerformance.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearSelectedActivity, clearPerformance, clearMessages } = activitiesSlice.actions;
export default activitiesSlice.reducer;