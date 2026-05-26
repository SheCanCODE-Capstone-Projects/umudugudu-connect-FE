import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Penalty, AssignPenaltyPayload, ExemptionPayload, PenaltySearchParams } from '@/types';
import { getPenalties, getPenaltyById, assignPenalty, markExemption } from '@/lib/api/penalties';

// ─── State ────────────────────────────────────────────────────────
interface PenaltiesState {
  penalties:       Penalty[];
  selectedPenalty: Penalty | null;
  loading:         boolean;
  error:           string | null;
  successMessage:  string | null;
}

const initialState: PenaltiesState = {
  penalties:       [],
  selectedPenalty: null,
  loading:         false,
  error:           null,
  successMessage:  null,
};

// ─── Thunks ───────────────────────────────────────────────────────
export const fetchPenalties = createAsyncThunk(
  'penalties/fetchPenalties',
  async (params: PenaltySearchParams, { rejectWithValue }) => {
    try {
      const result = await getPenalties(params);
      return result.content;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch penalties');
    }
  }
);

export const fetchPenaltyById = createAsyncThunk(
  'penalties/fetchPenaltyById',
  async (penaltyId: string, { rejectWithValue }) => {
    try {
      return await getPenaltyById(penaltyId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch penalty');
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

export const createExemption = createAsyncThunk(
  'penalties/createExemption',
  async (payload: ExemptionPayload, { rejectWithValue }) => {
    try {
      await markExemption(payload);
      return payload;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark exemption');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────
const penaltiesSlice = createSlice({
  name: 'penalties',
  initialState,
  reducers: {
    clearSelectedPenalty(state) {
      state.selectedPenalty = null;
    },
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // fetchPenalties
    builder
      .addCase(fetchPenalties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPenalties.fulfilled, (state, action: PayloadAction<Penalty[]>) => {
        state.loading = false;
        state.penalties = action.payload;
      })
      .addCase(fetchPenalties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchPenaltyById
    builder
      .addCase(fetchPenaltyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPenaltyById.fulfilled, (state, action: PayloadAction<Penalty>) => {
        state.loading = false;
        state.selectedPenalty = action.payload;
      })
      .addCase(fetchPenaltyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // createPenalty
    builder
      .addCase(createPenalty.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createPenalty.fulfilled, (state, action: PayloadAction<Penalty>) => {
        state.loading = false;
        state.successMessage = 'Penalty assigned successfully';
        state.penalties.unshift(action.payload);
      })
      .addCase(createPenalty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // createExemption
    builder
      .addCase(createExemption.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createExemption.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Absence marked as excused successfully';
      })
      .addCase(createExemption.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedPenalty, clearMessages } = penaltiesSlice.actions;
export default penaltiesSlice.reducer;