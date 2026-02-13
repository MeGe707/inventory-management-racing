import { Navigate } from "react-router-dom";
import { useAuthStore } from "./authStore.js";
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return null; // veya spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


export default ProtectedRoute;
