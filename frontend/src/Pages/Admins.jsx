import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../Context/AppContext";
import AddAdminModal from "../Components/addAdminModal";
import { toast } from "react-toastify";

export default function Admins() {
  const { token, link } = useContext(AppContext);
  const [admins, setAdmins] = useState([]);

  const [searchField, setSearchField] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAdmins, setFilteredAdmins] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get(`${link}/admin/getAllAdmins`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const onlyAdmins = res.data.data.filter((u) => u.role === "admin");
      setAdmins(onlyAdmins);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;

    try {
      const res = await axios.post(
        `${link}/admin/deleteAdmin`,
        { id: adminId }, // send as JSON body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        fetchAdmins();
        toast.success("Admin deleted successfully.");
      } else {
        toast.error(res.data.message || "Could not delete admin.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Server error.");
    }
  };

  useEffect(() => {
    if (token) fetchAdmins();
  }, [token]);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return setFilteredAdmins(admins);
    setFilteredAdmins(
      admins.filter((admin) => {
        const val = String(admin[searchField] || "").toLowerCase();
        return val.includes(q);
      })
    );
  }, [admins, searchField, searchQuery]);

  return (
    <div className="w-full ml-9 max-w-7xl m-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-lg font-medium">All Admins</p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-5 py-2 rounded"
        >
          + Add Admin
        </button>
      </div>

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
          placeholder="Search admins..."
          className="flex-1 border rounded px-3 py-2"
        />
      </div>

      {/* Header row */}
      <div className="hidden sm:grid grid-cols-[0.5fr_2fr_2fr_2fr_2fr_1fr] py-3 px-6 border-b font-semibold text-gray-700">
        <p>#</p>
        <p>Name</p>
        <p>Email</p>
        <p>Phone</p>
        <p>Department</p>
        <p className="text-center">Actions</p>
      </div>

      <div className="bg-white border-rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        {filteredAdmins.map((admin, index) => (
          <div
            key={admin._id}
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_2fr_2fr_2fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <p>{admin.name}</p>
            <p>{admin.email}</p>
            <p>{admin.phone}</p>
            <p>{admin.department}</p>

            {/* Delete button */}
            <div className="flex justify-center">
              <button
                onClick={() => handleDelete(admin._id)}
                className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}

        {filteredAdmins.length === 0 && (
          <p className="text-center text-gray-500 p-4">
            No admins match your search.
          </p>
        )}
      </div>

      {isModalOpen && (
        <AddAdminModal
          onClose={() => {
            setIsModalOpen(false);
            fetchAdmins(); // refresh list after adding a new admin
          }}
        />
      )}
    </div>
  );
}
