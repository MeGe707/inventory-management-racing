// Components/ThrashItemModal.jsx
import React, { useEffect, useContext, useState } from "react";
import { AppContext } from "../Context/AppContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";

export default function ThrashItemModal({ itemId, onClose, onRecovered, onDeleted }) {
  const { token, link } = useContext(AppContext);
  const [thrashItemData, setThrashItemData] = useState(null);

  const getThrashItem = async (id) => {
    try {
      const { data } = await axios.post(
        `${link}/user/get-thrash-item`,
        { itemId: id },

      );
      if (data.success) setThrashItemData(data.item);
      else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const permanentlyDelete = async (idsOrSingle) => {
    try {
      const ids = Array.isArray(idsOrSingle) && idsOrSingle.length > 0
        ? idsOrSingle
        : itemId ? [itemId] : [];

      if (ids.length === 0) return toast.error("No item selected");

      const { data } = await axios.post(
        `${link}/admin/permanently-delete-items`,
        { itemIds: ids },
 
      );

      if (data.success) {
        toast.success(data.message || "Permanently delete successful.");
        onDeleted && onDeleted(ids);
        onClose && onClose();
      } else {
        toast.error(data.message || "Permanently delete unsuccessfull.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Permanently delete unsuccessfull.");
    }
  };

  const recoverItem = async (selectedIds) => {
    try {
      const ids = Array.isArray(selectedIds) && selectedIds.length > 0
        ? selectedIds
        : itemId ? [itemId] : [];

      if (ids.length === 0) return toast.error("No item selected.");

      const { data } = await axios.post(
        `${link}/user/recover-thrash-item`,
        { thrashItemIds: ids }
      
      );

      if (data.success) {
        toast.success(data.message || "Restore successful.");
        onRecovered && onRecovered(ids);
        onClose && onClose();
      } else {
        toast.error(data.message || "Restore unsuccessfull.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Geri yükleme sırasında hata oluştu.");
    }
  };

  // ESC ile kapat
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  useEffect(() => {
    if (itemId) getThrashItem(itemId);
  }, [itemId]);

  if (!thrashItemData) {
    return (
      <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-xl animate-pulse">
          <p className="text-gray-600 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-auto p-6 space-y-6 animate-fade-in">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-2xl font-bold text-red-600">Thrash Item Detail</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-black text-xl" title="Kapat">✕</button>
          </div>

          <div className="grid grid-cols-1 gap-3 text-gray-700 text-sm">
            {[
              ["Name", thrashItemData.name],
              ["Component", thrashItemData.component],
              ["Brand", thrashItemData.brandName],
              ["Supplier", thrashItemData.supplierName],
              ["Serial Number", thrashItemData.serialNumber],
              ["Location", thrashItemData.location],
              ["Quantity", thrashItemData.quantity],
              ["Threshold", thrashItemData.threshold],
              ["Price", thrashItemData.price ? `${thrashItemData.price} $` : "—"],
              ["Description", thrashItemData.description],
              ["Deleted By", thrashItemData.deletedBy],
              ["Deleted On", thrashItemData.deletedOn],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b pb-1">
                <span className="font-medium text-gray-600">{label}:</span>
                <span className="text-right">{value || "—"}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t flex justify-end gap-3">
            <button onClick={() => recoverItem()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
              Restore
            </button>
            <button onClick={() => permanentlyDelete()} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
              Permanently Delete
            </button>
            <button onClick={onClose} className="text-gray-600 hover:text-black underline px-4 py-2">
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
