import { useEffect } from "react";
import "./App.css";
import Login from "./Pages/Login.jsx";
import { Route, Routes, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Sidebar from "./Components/Sidebar.jsx";
import Navbar from "./Components/Navbar.jsx";
import ProtectedRoute from "./Context/ProtectedRoute.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Items from "./Pages/Items.jsx";
import DeletedItems from "./Pages/DeletedItems.jsx";
import AddItem from "./Pages/AddItem.jsx";
import AddExcelList from "./Pages/AddExcelList.jsx";
import Users from "./Pages/Users.jsx";
import Admins from "./Pages/Admins.jsx";
import LogsPage from "./Pages/LogsPage.jsx";
import ItemLogsPage from "./Pages/ItemLogsPage.jsx";
import EmailVerificationPage from "./Pages/EmailVerificationPage.jsx";
import FrequentlyUsedItems from "./Pages/FrequentlyUsedItems.jsx";
import { useAuthStore } from "./Context/authStore.js";

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <div className="p-10 text-xl">Loading...</div>;
  }

  return (
    <>
      <ToastContainer />

      {isAuthenticated && <Navbar />}

      <div className="flex items-start">
        {isAuthenticated && <Sidebar className="fixed" />}

        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/items-list" element={<Items />} />
            <Route path="/thrash-items" element={<DeletedItems />} />
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/add-excel-list" element={<AddExcelList />} />
            <Route path="/users" element={<Users />} />
            <Route path="/admins" element={<Admins />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/item-logs/:itemId" element={<ItemLogsPage />} />
            <Route
              path="/frequently-used-items-list"
              element={<FrequentlyUsedItems />}
            />
            <Route
              path="/email-verification"
              element={<EmailVerificationPage />}
            />
          </Route>

          <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated ? "/dashboard" : "/login"}
                replace
              />
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;