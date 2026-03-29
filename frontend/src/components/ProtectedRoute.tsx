// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const token = localStorage.getItem("access_token");
  const raw   = localStorage.getItem("user");

  // Not logged in → back to login
  if (!token || !raw) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(raw);

    // Role not permitted for this route
    if (!allowedRoles.includes(user.role)) {
      // Redirect each role to their own home page
      if (user.role === "admin")              return <Navigate to="/dashboard" replace />;
      if (user.role === "water_employee")     return <Navigate to="/water"     replace />;
      if (user.role === "laundry_employee")   return <Navigate to="/laundry"   replace />;
      return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
  } catch {
    // Corrupt storage — clear and redirect
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
}
