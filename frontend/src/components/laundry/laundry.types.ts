export type PickupDay =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type PaymentStatus = 'Paid' | 'Unpaid';
export type PaymentMethod = 'Cash' | 'GCash';

export interface LaundryItem {
  id: string;
  label: string;   // e.g. "White"
  weight: number;  // kg
  price_per_kg: number;
}

export interface LaundryOrder {
  id: string;
  customer_name: string;
  pickup_day: PickupDay;
  items: LaundryItem[];
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  /** Auto-derived: sum of item weight × price_per_kg */
  total_php: number;
  created_at: string; // ISO string
  notes?: string;
}
