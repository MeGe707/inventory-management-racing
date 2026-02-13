import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../Context/AppContext";

export default function AddAdminModal({ onClose, defaultRole = "admin" }) {
  const { link } = useContext(AppContext);

  

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState(defaultRole); // "admin" | "superadmin"

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const adminData = {
        name,
        email,
        password,
        phone,
        department,
        role, // backend bu alanı bekliyor olmalı
      };

      const { data } = await axios.post(
        `${link}/admin/register-admin`,
        adminData
      );

      if (data.success) {
        toast.success(data.message || "Admin created.");
        // reset form
        setName("");
        setEmail("");
        setPassword("");
        setPhone("");
        setDepartment("");
        setRole(defaultRole);
        onClose(); // modalı kapat
      } else {
        toast.error(data.message || "Admin could not be created.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Bir hata oluştu, admin eklenemedi.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {role === "superadmin" ? "Add Superadmin" : "Add Admin"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-500 text-xl"
            type="button"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmitHandler} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />

          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="text"
            placeholder="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          {/* Role Select */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {role === "superadmin" ? "Add Superadmin" : "Add Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
