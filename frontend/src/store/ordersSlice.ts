import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ordersApi } from '../services/ordersApi';

export interface Order {
  id: string;
  customer_name: string;
  order_type: 'Walk-in' | 'Phone' | 'Delivery' | 'Pickup' | '';
  product: string;
  quantity: number | '';
  unit_price: number | '';
  total: number | '';
  order_date: string | null;   // "YYYY-MM-DD" from Django
  created_at?: string;         // ISO timestamp, auto-set by Django
}

interface OrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunks for REST API calls (backend later)
export const fetchOrders = createAsyncThunk('orders/fetchAll', async () => {
  return await ordersApi.getAll();
});

export const createOrder = createAsyncThunk('orders/create', async (order: Omit<Order, 'id'>) => {
  return await ordersApi.create(order);
});

export const updateOrder = createAsyncThunk(
  'orders/update',
  async ({ id, data }: { id: string; data: Partial<Order> }) => {
    return await ordersApi.update(id, data);
  }
);

export const deleteOrder = createAsyncThunk('orders/delete', async (id: string) => {
  await ordersApi.delete(id);
  return id;
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addRow(state) {
      const newId = `row-${Date.now()}`;
      state.items.push({
        id: newId,
        customer_name: '',
        order_type: '',
        product: '',
        quantity: '',
        unit_price: '',
        total: '',
        order_date: null,
      });
    },
    // updateRowLocally removed – no inline edits
    removeRow(state, action: PayloadAction<string>) {
      state.items = state.items.filter((r) => r.id !== action.payload);
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.length > 0) state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch orders';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      });
  },
});

export const { addRow, removeRow, clearError } = ordersSlice.actions;
export default ordersSlice.reducer;

