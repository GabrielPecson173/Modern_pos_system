import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { OrdersPage } from './pages/OrdersPage';
import { LaundryPage } from './pages/LaundryPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<OrdersPage />} />
        <Route path="water" element={<OrdersPage />} />
        <Route path="laundry" element={<LaundryPage />} />
      </Route>
    </Routes>
  );
}
