import React, { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../Context/authStore.js";
import { AppContext } from "../Context/AppContext.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const { assets } = useContext(AppContext);

  const logout = useAuthStore((state) => state.logout);
  const role = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center justify-between text-sm py-4 border-b border-b-gray-400">
      
      {/* Logo */}
      <div className="flex items-center">
        <NavLink
          to="/dashboard"
          className="ml-4 text-2xl font-bold"
        >
          Inventory App
        </NavLink>

        {/* Role Badge */}
        {role === "admin" && (
          <div className="inline-flex ml-3 items-center">
            <p className="text-xs font-medium px-3 py-0.5 rounded-full border border-gray-300 text-gray-700 bg-gray-100">
              Admin
            </p>
          </div>
        )}

        {role === "superadmin" && (
          <div className="inline-flex ml-3 items-center">
            <p className="text-xs font-medium px-3 py-0.5 rounded-full border border-gray-300 text-gray-700 bg-gray-100">
              Superadmin
            </p>
          </div>
        )}
      </div>

      {/* Profile Dropdown */}
      <div className="flex items-center gap-4 mr-7">
        <div className="flex items-center gap-2 cursor-pointer group relative">
          
          {/* Eski 3 Nokta Menü İkonu */}
          <img
            className="w-8"
            src={assets.menu_icon}
            alt="menu"
          />

          {/* Dropdown */}
          <div className="absolute w-40 top-0 right-2 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
            <div className="min-w-40 bg-stone-100 rounded flex flex-col gap-4 p-4">
              <p
                className="hover:text-black cursor-pointer"
                onClick={() => navigate("/my-profile")}
              >
                My Profile
              </p>
              <p
                className="hover:text-black cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden cursor-pointer"
          src={assets.menu_icon}
          alt="menu"
        />
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="fixed top-0 right-0 w-full h-full bg-white z-50 flex flex-col p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Menu</h2>
            <button onClick={() => setShowMenu(false)}>✕</button>
          </div>

          <NavLink
            to="/dashboard"
            onClick={() => setShowMenu(false)}
            className="mb-4"
          >
            Home
          </NavLink>

          <button
            onClick={handleLogout}
            className="text-left text-red-500"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
