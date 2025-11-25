// Pages/DeletedItems.jsx
import React, { useEffect, useContext, useState } from "react";
import { AppContext } from "../Context/AppContext.jsx";
import ThrashItemModal from "../Components/thrashItemModal.jsx"
import { toast } from "react-toastify";
import axios from "axios";

export default function DeletedItems() {
  const { token, thrashItems, getthrashItems, link } = useContext(AppContext);

  const [selectedIds, setSelectedIds] = useState([]);
  const [modalItemId, setModalItemId] = useState(null);

  useEffect(() => {
    if (token) getthrashItems();
  }, [token]);

  const handleCheckboxChange = (itemId) => {
    setSelectedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isAllSelected =
    thrashItems.length > 0 && selectedIds.length === thrashItems.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : thrashItems.map((it) => it._id));
  };

  const permanentlyDeleteSelected = async () => {
    if (selectedIds.length === 0)
      return toast.warning("Please select at least one item to delete.");
    if (
      !window.confirm(
        `${selectedIds.length} item(s) will be permanently deleted. Do you confirm?`
      )
    )
      return;

    try {
      const { data } = await axios.post(
        `${link}/admin/permanently-delete-items`,
        { itemIds: selectedIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(
          data.message || "Selected items have been permanently deleted."
        );
        setSelectedIds([]);
        getthrashItems();
      } else
        toast.error(data.message || "Bulk delete operation failed.");
    } catch {
      toast.error("An error occurred during bulk delete.");
    }
  };

  const recoverSelected = async () => {
    if (selectedIds.length === 0)
      return toast.warning("Please select at least one item to recover.");
    try {
      const { data } = await axios.post(
        `${link}/user/recover-thrash-item`,
        { thrashItemIds: selectedIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(
          data.message || "Selected items have been recovered."
        );
        setSelectedIds([]);
        getthrashItems();
      } else
        toast.error(data.message || "Bulk recovery failed.");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "An error occurred during bulk recovery."
      );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <p className="mb-3 mt-3 text-2xl font-semibold">Deleted Items</p>

      {selectedIds.length > 0 && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={recoverSelected}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Recover Selected
          </button>
          <button
            onClick={permanentlyDeleteSelected}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Permanently Delete Selected
          </button>
        </div>
      )}

      {/* Başlık Satırı */}
      <div className="hidden sm:grid grid-cols-[0.3fr_0.5fr_2.5fr_1fr_1.8fr_1.5fr_1.5fr_1.5fr] py-3 px-6 border-b font-semibold text-gray-700 bg-gray-100 rounded-t">
        <input
          type="checkbox"
          className="w-4 h-4 accent-blue-600 cursor-pointer"
          checked={isAllSelected}
          onChange={toggleSelectAll}
        />
        <p className="text-center">#</p>
        <p className="text-center">Item Name</p>
        <p className="text-center">Qty</p>
        <p className="text-center">Brand</p>
        <p className="text-center">Location</p>
        <p className="text-center">Added By</p>
        <p className="text-center">Deleted On</p>
      </div>

      {/* Liste */}
      <div className="bg-white text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll rounded-b shadow-sm">
        {thrashItems.map((item, index) => (
          <div
            key={item._id}
            className="flex flex-wrap justify-between sm:grid sm:grid-cols-[0.3fr_0.5fr_2.5fr_1fr_1.8fr_1.5fr_1.5fr_1.5fr] items-center text-gray-600 py-3 px-6 border-b hover:bg-gray-50 transition-all"
          >
            <input
              type="checkbox"
              className="w-4 h-4 accent-blue-600 cursor-pointer"
              checked={selectedIds.includes(item._id)}
              onChange={() => handleCheckboxChange(item._id)}
            />
            <p className="text-center max-sm:hidden">{index + 1}</p>
            <button
              onClick={() => setModalItemId(item._id)}
              className="text-left hover:underline cursor-pointer truncate"
              title="Open details"
            >
              {item.name}
            </button>
            <p className="text-center">{item.quantity}</p>
            <p className="text-center">{item.brandName}</p>
            <p className="text-center">{item.location}</p>
            <p className="text-xs text-center">{item.addedBy}</p>
            <p className="text-xs text-center">{item.deletedOn || "—"}</p>
          </div>
        ))}

        {thrashItems.length === 0 && (
          <p className="text-center text-gray-500 p-4">
            There are no deleted items.
          </p>
        )}
      </div>

      {/* Modal */}
      {modalItemId && (
        <ThrashItemModal
          itemId={modalItemId}
          onClose={() => setModalItemId(null)}
          onRecovered={() => {
            setSelectedIds((prev) => prev.filter((id) => id !== modalItemId));
            getthrashItems();
          }}
          onDeleted={() => {
            setSelectedIds((prev) => prev.filter((id) => id !== modalItemId));
            getthrashItems();
          }}
        />
      )}
    </div>
  );
}
