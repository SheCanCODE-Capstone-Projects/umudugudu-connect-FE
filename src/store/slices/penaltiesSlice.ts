import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  Penalty,
  AssignPenaltyPayload,
  CitizenPenaltyView,
  IsiboPenaltyOverview,
} from '@/types';
import {
  assignPenalty,
  waivePenalty,
  getMyPenalties,
  getIsiboPenalties,
  getVillagePenalties,
} from '@/lib/api/penalties';

// ─── State ────────────────────────────────────────────────────────
interface PenaltiesState {
  penalties:      Penalty[];
  myPenalties:    CitizenPenaltyView[];
  isiboOverview:  IsiboPenaltyOverview | null;
  loading:        boolean;
  error:          string | null;
  successMessage: string | null;
}

const initialState: PenaltiesState = {
  penalties:      [],
  myPenalties:    [],
  isiboOverview:  null,
  loading:        false,
  error:          null,
  successMessage: null,
};

// ─── Thunks ───────────────────────────────────────────────────────
export const fetchVillagePenalties = createAsyncThunk(
  'penalties/fetchVillagePenalties',
  async (_, { rejectWithValue }) => {
    try {
      const result = await getVillagePenalties();
      return result.content;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch penalties');
    }
  }
);

export const createPenalty = createAsyncThunk(
  'penalties/createPenalty',
  async (payload: AssignPenaltyPayload, { rejectWithValue }) => {
    try {
      return await assignPenalty(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to assign penalty');
    }
  }
);

export const waiverPenalty = createAsyncThunk(
  'penalties/waiverPenalty',
  async (id: string, { rejectWithValue }) => {
    try {
      return await waivePenalty(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to waive penalty');
    }
  }
);

export const fetchMyPenalties = createAsyncThunk(
  'penalties/fetchMyPenalties',
  async (_, { rejectWithValue }) => {
    try {
      return await getMyPenalties();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch your penalties');
    }
  }
);

export const fetchIsiboPenalties = createAsyncThunk(
  'penalties/fetchIsiboPenalties',
  async (_, { rejectWithValue }) => {
    try {
      return await getIsiboPenalties();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch isibo penalties');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────
const penaltiesSlice = createSlice({
  name: 'penalties',
  initialState,
  reducers: {
    clearIsiboOverview(state) {
      state.isiboOverview = null;
    },
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVillagePenalties.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchVillagePenalties.fulfilled, (state, action: PayloadAction<Penalty[]>) => {
        state.loading = false; state.penalties = action.payload;
      })
      .addCase(fetchVillagePenalties.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });

    builder
      .addCase(createPenalty.pending, (state) => {
        state.loading = true; state.error = null; state.successMessage = null;
      })
      .addCase(createPenalty.fulfilled, (state, action: PayloadAction<Penalty>) => {
        state.loading = false;
        state.successMessage = 'Penalty assigned successfully';
        state.penalties.unshift(action.payload);
      })
      .addCase(createPenalty.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });

    builder
      .addCase(waiverPenalty.pending, (state) => {
        state.loading = true; state.error = null; state.successMessage = null;
      })
      .addCase(waiverPenalty.fulfilled, (state, action: PayloadAction<Penalty>) => {
        state.loading = false;
        state.successMessage = 'Penalty waived successfully';
        const idx = state.penalties.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.penalties[idx] = action.payload;
      })
      .addCase(waiverPenalty.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });

    builder
      .addCase(fetchMyPenalties.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchMyPenalties.fulfilled, (state, action: PayloadAction<CitizenPenaltyView[]>) => {
        state.loading = false; state.myPenalties = action.payload;
      })
      .addCase(fetchMyPenalties.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });

    builder
      .addCase(fetchIsiboPenalties.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchIsiboPenalties.fulfilled, (state, action: PayloadAction<IsiboPenaltyOverview>) => {
        state.loading = false; state.isiboOverview = action.payload;
      })
      .addCase(fetchIsiboPenalties.rejected, (state, action) => {
        state.loading = false; state.error = action.payload as string;
      });
  },
});

export const { clearIsiboOverview, clearMessages } = penaltiesSlice.actions;
export default penaltiesSlice.reducer;