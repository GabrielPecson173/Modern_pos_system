import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const BASE = 'http://localhost:8000/api/laundry-orders';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LaundryItem {
  id: string;
  label: string;
  weight: number;
  price_per_kg: number;
}

export interface LaundryOrder {
  id: string;
  customer_name: string;
  pickup_day: string;
  payment_status: 'Paid' | 'Unpaid';
  payment_method: 'Cash' | 'GCash';
  total_php: number;
  notes?: string;
  items: LaundryItem[];
  created_at: string;
  updated_at: string;
}

export type CreateLaundryOrderPayload = Omit<LaundryOrder, 'id' | 'created_at' | 'updated_at'>;
export type PatchLaundryOrderPayload  = { id: string } & Partial<Omit<LaundryOrder, 'id' | 'created_at' | 'updated_at'>>;

interface LaundryState {
  items: LaundryOrder[];
  loading: boolean;
  error: string | null;
}

const initialState: LaundryState = {
  items: [],
  loading: false,
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchLaundryOrders = createAsyncThunk(
  'laundry/fetchAll',
  async (_, { rejectWithValue }) => {
    const res = await fetch(`${BASE}/`);
    if (!res.ok) return rejectWithValue('Failed to fetch laundry orders');
    return (await res.json()) as LaundryOrder[];
  }
);

export const createLaundryOrder = createAsyncThunk(
  'laundry/create',
  async (order: CreateLaundryOrderPayload, { rejectWithValue }) => {
    const res = await fetch(`${BASE}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) return rejectWithValue('Failed to create laundry order');
    return (await res.json()) as LaundryOrder;
  }
);

export const patchLaundryOrder = createAsyncThunk(
  'laundry/patch',
  async ({ id, ...patch }: PatchLaundryOrderPayload, { rejectWithValue }) => {
    const res = await fetch(`${BASE}/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return rejectWithValue('Failed to update laundry order');
    return (await res.json()) as LaundryOrder;
  }
);

export const deleteLaundryOrder = createAsyncThunk(
  'laundry/delete',
  async (id: string, { rejectWithValue }) => {
    const res = await fetch(`${BASE}/${id}/`, { method: 'DELETE' });
    if (!res.ok) return rejectWithValue('Failed to delete laundry order');
    return id;
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const laundrySlice = createSlice({
  name: 'laundry',
  initialState,
  reducers: {
    clearLaundryError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchLaundryOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLaundryOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLaundryOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // create
      .addCase(createLaundryOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLaundryOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createLaundryOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // patch (mark paid / change method)
      .addCase(patchLaundryOrder.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(patchLaundryOrder.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // delete
      .addCase(deleteLaundryOrder.fulfilled, (state, action) => {
        state.items = state.items.filter((o) => o.id !== action.payload);
      })
      .addCase(deleteLaundryOrder.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearLaundryError } = laundrySlice.actions;
export default laundrySlice.reducer;
