import React, { useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../Context/AppContext";
import { toast } from "react-toastify";

export default function AddUserModal({ onClose }) {
  const { link } = useContext(AppContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");


  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const userData = {
        name,
        email,
        password,
        phone,
        department,
      };

      const { data } = await axios.post(
         `${link}/user/register-user`,
        userData
      );

      if (data.success) {
        toast.success(data.message);
        // Reset form
        setName("");
        setEmail("");
        setPassword("");
        setPhone("");
        setDepartment("");
        onClose(); // modalı kapat
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Bir hata oluştu, kullanıcı eklenemedi.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add New User</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-500 text-xl"
          >
            &times;
          </button>
        </div>

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

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
