import { Order } from '../store/ordersSlice';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      // Add auth header here if needed: Authorization: `Bearer ${token}`
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail ?? `HTTP ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const ordersApi = {
  getAll: () => request<Order[]>('/water-orders/'),

  getById: (id: string) => request<Order>(`/water-orders/${id}/`),

  create: (data: Omit<Order, 'id'>) =>
    request<Order>('/water-orders/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Order>) =>
    request<Order>(`/water-orders/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/water-orders/${id}/`, { method: 'DELETE' }),
};
