import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from './ordersSlice';
import { useDispatch as reduxUseDispatch } from 'react-redux';

export const store = configureStore({
  reducer: {
    orders: ordersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed useAppDispatch hook
export const useAppDispatch = () => reduxUseDispatch<AppDispatch>();
