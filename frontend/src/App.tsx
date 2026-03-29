import { Routes, Route, Navigate } from 'react-router-dom';
import Login               from './pages/Login';
import ProtectedRoute      from './components/ProtectedRoute';
import { AppLayout }       from './components/AppLayout';
import { DashboardPage }   from './pages/DashboardPage';
import { OrdersPage }      from './pages/OrdersPage';
import { LaundryPage }     from './pages/LaundryPage';
import { WaterLogsPage }   from './pages/WaterLogsPage';
import { LaundryLogsPage } from './pages/LaundryLogsPage';
import { AuditLogsPage }   from './pages/AuditLogsPage';

export default function App() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected shell */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin', 'water_employee', 'laundry_employee']}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Admin only */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/audit-logs" element={
          <ProtectedRoute allowedRoles={['admin']}><AuditLogsPage /></ProtectedRoute>
        } />

        {/* Water — admin + water employees */}
        <Route path="/water" element={
          <ProtectedRoute allowedRoles={['admin', 'water_employee']}><OrdersPage /></ProtectedRoute>
        } />
        <Route path="/water/logs" element={
          <ProtectedRoute allowedRoles={['admin', 'water_employee']}><WaterLogsPage /></ProtectedRoute>
        } />

        {/* Laundry — admin + laundry employees */}
        <Route path="/laundry" element={
          <ProtectedRoute allowedRoles={['admin', 'laundry_employee']}><LaundryPage /></ProtectedRoute>
        } />
        <Route path="/laundry/logs" element={
          <ProtectedRoute allowedRoles={['admin', 'laundry_employee']}><LaundryLogsPage /></ProtectedRoute>
        } />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}
