import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from './ordersSlice';
import laundryReducer from './laundrySlice';
import { useDispatch as reduxUseDispatch } from 'react-redux';


export const store = configureStore({
  reducer: {
    orders: ordersReducer,
    laundry: laundryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed useAppDispatch hook
export const useAppDispatch = () => reduxUseDispatch<AppDispatch>();
