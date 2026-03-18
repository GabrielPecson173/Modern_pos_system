import { LaundryOrder } from './laundry.types';

export const MOCK_LAUNDRY_ORDERS: LaundryOrder[] = [
  {
    id: 'lo-001',
    customer_name: 'John Doe',
    pickup_day: 'Saturday',
    payment_status: 'Unpaid',
    payment_method: 'Cash',
    total_php: 280,
    created_at: new Date().toISOString(),
    items: [
      { id: 'i1', label: 'White', weight: 4, price_per_kg: 25 },
      { id: 'i2', label: 'Assorted', weight: 10, price_per_kg: 18 },
    ],
  },
  {
    id: 'lo-002',
    customer_name: 'Maria Santos',
    pickup_day: 'Saturday',
    payment_status: 'Paid',
    payment_method: 'GCash',
    total_php: 390,
    created_at: new Date().toISOString(),
    items: [
      { id: 'i3', label: 'Colored', weight: 6, price_per_kg: 25 },
      { id: 'i4', label: 'Bedsheets', weight: 8, price_per_kg: 30 },
    ],
  },
  {
    id: 'lo-003',
    customer_name: 'Ramon Cruz',
    pickup_day: 'Monday',
    payment_status: 'Unpaid',
    payment_method: 'Cash',
    total_php: 175,
    created_at: new Date().toISOString(),
    items: [
      { id: 'i5', label: 'Assorted', weight: 7, price_per_kg: 25 },
    ],
  },
  {
    id: 'lo-004',
    customer_name: 'Luz Reyes',
    pickup_day: 'Wednesday',
    payment_status: 'Paid',
    payment_method: 'Cash',
    total_php: 540,
    created_at: new Date().toISOString(),
    items: [
      { id: 'i6', label: 'White', weight: 5, price_per_kg: 25 },
      { id: 'i7', label: 'Assorted', weight: 8, price_per_kg: 25 },
      { id: 'i8', label: 'Jeans/Thick', weight: 4, price_per_kg: 40 },
    ],
  },
  {
    id: 'lo-005',
    customer_name: 'Ben Flores',
    pickup_day: 'Saturday',
    payment_status: 'Unpaid',
    payment_method: 'GCash',
    total_php: 210,
    created_at: new Date().toISOString(),
    items: [
      { id: 'i9', label: 'Colored', weight: 5, price_per_kg: 22 },
      { id: 'i10', label: 'Whites', weight: 4, price_per_kg: 25 },
    ],
  },
];

