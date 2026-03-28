import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./authStore.js";

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  console.log("PROTECTED ROUTE:", { isAuthenticated, isCheckingAuth });

  if (isCheckingAuth) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;