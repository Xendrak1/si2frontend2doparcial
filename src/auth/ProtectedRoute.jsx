import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasPermission } from "./roles";

export default function ProtectedRoute({ children, permission, fallback = "/" }) {
  const { user } = useAuth();
  if (!permission) {
    return children;
  }
  if (!hasPermission(user, permission)) {
    return <Navigate to={fallback} replace />;
  }
  return children;
}


