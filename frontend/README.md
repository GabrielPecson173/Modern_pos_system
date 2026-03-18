# Aqua Crystal — Frontend

React + TypeScript + Mantine + Redux Toolkit + React Router

## Project Structure

```
src/
├── components/
│   └── AppLayout.tsx       # AppShell sidebar + Outlet
├── pages/
│   ├── OrdersPage.tsx      # Main orders table page
│   └── LaundryPage.tsx     # Laundry placeholder
├── store/
│   ├── index.ts            # Redux store
│   └── ordersSlice.ts      # Orders state + async thunks
├── services/
│   └── ordersApi.ts        # REST API calls to Django backend
├── App.tsx                 # Routes
└── main.tsx                # Entry point
```

## Getting Started

```bash
npm install
cp .env.example .env       # set VITE_API_URL to your Django server
npm run dev
```

## Connecting to Django Backend

The app expects these DRF endpoints:

| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/orders/ | List all orders |
| POST | /api/orders/ | Create order |
| PATCH | /api/orders/:id/ | Update order |
| DELETE | /api/orders/:id/ | Delete order |

Expected Order JSON shape:
```json
{
  "id": "uuid-string",
  "name": "Juan Dela Cruz",
  "order_type": "Delivery",
  "product": "5-gallon water",
  "quantity": 2,
  "unit_price": 35.00,
  "total": 70.00
}
```

## Key Tech Decisions

- **MantineProvider** wraps everything with `primaryColor: 'teal'`
- **Redux Toolkit** manages orders globally via `ordersSlice`; local edits use `updateRowLocally`, API saves use async thunks
- **React Router** uses layout routes — `AppLayout` renders the sidebar, child routes render in the `<Outlet>`
- **ordersApi.ts** is a thin fetch wrapper — swap in axios if preferred
