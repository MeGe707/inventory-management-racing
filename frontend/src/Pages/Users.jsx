import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../Context/AppContext";
import AddUserModal from "../Components/addUserModal.jsx";
import { toast } from "react-toastify";
import { useAuthStore } from "../Context/authStore.js";

export default function Users() {
  const { link } = useContext(AppContext);
  const [users, setUsers] = useState([]);

  const [searchField, setSearchField] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${link}/user/getAllUsers`);

      const onlyUsers = res.data.data.filter((u) => u.role === "user");
      setUsers(onlyUsers);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  // Arama filtresi
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return setFilteredUsers(users);
    setFilteredUsers(
      users.filter((user) => {
        const val = String(user[searchField] || "").toLowerCase();
        return val.includes(q);
      }),
    );
  }, [users, searchField, searchQuery]);

  // ESC tuşuyla modal kapatma
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  // Kullanıcı silme
  const handleDelete = async (userId) => {
    if (!window.confirm("Bu kullanıcıyı silmek istediğine emin misin?")) return;

    try {
      const res = await axios.post(`${link}/admin/deleteUser`, { id: userId });

      if (res.data.success) {
        fetchUsers(); // Kullanıcıları tekrar getir
        toast.success("Kullanıcı başarıyla silindi.");
      } else {
        toast.error(res.data.message || "Silinemedi.");
      }
    } catch (err) {
      console.error("Silme hatası:", err);
      toast.error("Sunucu hatası.");
    }
  };

  return (
    <div className="w-full ml-9 max-w-7xl m-5 relative">
      {/* Sağ üst Add User butonu */}
      <div className="absolute -mt-3 top-0 right-0">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 mt-2 mr-2 rounded-lg shadow-md transition duration-200"
        >
          ➕ Add User
        </button>
      </div>

      <p className="mb-3 text-lg font-medium">Users (Only 'user' roles)</p>

      {/* Arama ve filtre */}
      <div className="flex items-center gap-2 mb-4">
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="department">Department</option>
        </select>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="flex-1 border rounded px-3 py-2"
        />
      </div>

      {/* Başlık */}
      <div className="hidden sm:grid grid-cols-[0.5fr_2fr_2fr_2fr_2fr_1fr] py-3 px-6 border-b font-semibold text-gray-700">
        <p>#</p>
        <p>Name</p>
        <p>Email</p>
        <p>Phone</p>
        <p>Department</p>
        <p className="text-center">Actions</p>
      </div>

      {/* Liste */}
      <div className="bg-white border-rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        {filteredUsers.map((user, index) => (
          <div
            key={user._id}
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_2fr_2fr_2fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <p>{user.name}</p>
            <p>{user.email}</p>
            <p>{user.phone}</p>
            <p>{user.department}</p>

            {/* Silme Butonu */}
            <div className="flex justify-center">
              <button
                onClick={() => handleDelete(user._id)}
                className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <p className="text-center text-gray-500 p-4">
            No users match your search.
          </p>
        )}
      </div>

      {/* Kullanıcı ekleme modali */}
      {isModalOpen && <AddUserModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
