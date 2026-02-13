import React from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../Context/authStore.js";

const Sidebar = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-white border-r">
      <ul className="text-[#515151] mt-5">

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/items-list"
        >
          <p className="hidden md:block">Items List</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/frequently-used-items-list"
        >
          <p className="hidden md:block">
            Frequently Used <br /> Items
          </p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/thrash-items"
        >
          <p className="hidden md:block">Thrash Box</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/add-item"
        >
          <p className="hidden md:block">Add Item</p>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
            }`
          }
          to="/add-excel-list"
        >
          <p className="hidden md:block">Add Excel</p>
        </NavLink>

        {(role === "admin" || role === "superadmin") && (
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            }
            to="/users"
          >
            <p className="hidden md:block">Users</p>
          </NavLink>
        )}

        {role === "superadmin" && (
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            }
            to="/admins"
          >
            <p className="hidden md:block">Admins</p>
          </NavLink>
        )}

        {(role === "admin" || role === "superadmin") && (
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
                isActive ? "bg-[#F2F3FF] border-r-4 border-primary" : ""
              }`
            }
            to="/logs"
          >
            <p className="hidden md:block">Logs</p>
          </NavLink>
        )}

      </ul>
    </div>
  );
};

export default Sidebar;
