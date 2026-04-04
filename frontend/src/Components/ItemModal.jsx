import React, { useEffect, useContext, useState } from "react";
import { AppContext } from "../Context/AppContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BOARD_OPTIONS = [
  "TSALINV",
  "BMSMASTER",
  "BMSCONT",
  "BMSCARR",
  "BSPD",
  "LATCH",
  "PRECHARGE",
  "BUCK_CONVERTER",
  "VOLTAGE_INDICATOR",
  "STLINK",
  "TSALBAT",
  "LVBMS",
  "TMS",
  "IMU",
  "GPS",
  "VCU",
  "BP",
  "TELEMETRI",
];

const BOARD_LABELS = {
  TSALINV: "TSalINV",
  BMSMASTER: "BMSMaster",
  BMSCONT: "BMSCont",
  BMSCARR: "BMSCarr",
  BSPD: "BSPD",
  LATCH: "LATCH",
  PRECHARGE: "Precharge",
  BUCK_CONVERTER: "Buck Converter",
  VOLTAGE_INDICATOR: "Voltage Indicator",
  STLINK: "STLINK",
  TSALBAT: "TSALBat",
  LVBMS: "LVBMS",
  TMS: "TMS",
  IMU: "IMU",
  GPS: "GPS",
  VCU: "VCU",
  BP: "BP",
  TELEMETRI: "Telemetri",
};

export default function ItemModal({ itemId, onClose }) {
  const navigate = useNavigate();
  const { getItem, itemData, setItemData, moveItemToThrashBox, link } =
    useContext(AppContext);

  const [isEditing, setIsEditing] = useState(false);

  const handleBoardToggle = (boardValue) => {
    setItemData((prev) => {
      const currentBoards = Array.isArray(prev.relatedBoards)
        ? prev.relatedBoards
        : [];

      const updatedBoards = currentBoards.includes(boardValue)
        ? currentBoards.filter((board) => board !== boardValue)
        : [...currentBoards, boardValue];

      return {
        ...prev,
        relatedBoards: updatedBoards,
      };
    });
  };

  const updateItemData = async () => {
    try {
      const payload = {
        itemId: itemId,
        name: itemData.name || "",
        component: itemData.component || "",
        brandName: itemData.brandName || "",
        supplierName: itemData.supplierName || "",
        serialNumber: itemData.serialNumber || "",
        quantity: Number(itemData.quantity) || 0,
        threshold:
          itemData.threshold === "" || itemData.threshold == null
            ? undefined
            : Number(itemData.threshold),
        price:
          itemData.price === "" || itemData.price == null
            ? undefined
            : Number(itemData.price),
        location: itemData.location || "",
        isFrequentlyUsed: !!itemData.isFrequentlyUsed,
        description: itemData.description || "",
        relatedBoards: Array.isArray(itemData.relatedBoards)
          ? itemData.relatedBoards
          : [],
      };

      const { data } = await axios.post(`${link}/user/update-item`, payload);

      if (data.success) {
        await getItem(itemId);
        setIsEditing(false);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Item güncellenirken hata oluştu."
      );
    }
  };

  const modalDeleteItem = (itemId) => {
    moveItemToThrashBox([itemId]);
    onClose();
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (itemId) getItem(itemId);
  }, [itemId]);

  if (!itemData) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm mx-auto p-6">
            <p className="text-center text-gray-600 animate-pulse">
              Loading...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 px-4 scroll">
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto 
                     overflow-hidden transform transition-transform duration-200 
                     ease-out scale-95 animate-fade-in"
        >
          <div className="flex justify-between items-center bg-indigo-600 px-6 py-4">
            <h2 className="text-white text-xl font-semibold">Ürün Detayı</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-4 text-gray-800 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="font-medium w-full mr-4">Name:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={itemData.name || ""}
                  onChange={(e) =>
                    setItemData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="border border-gray-300 rounded px-2 py-1 
                             w-40 max-w-full 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition"
                />
              ) : (
                <span className="text-gray-700">{itemData.name}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium w-full mr-4">Component:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={itemData.component || ""}
                  onChange={(e) =>
                    setItemData((prev) => ({
                      ...prev,
                      component: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded px-2 py-1 
                             w-40 max-w-full 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition"
                />
              ) : (
                <span className="text-gray-700">{itemData.component}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium w-full mr-4">Serial Number:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={itemData.serialNumber || ""}
                  onChange={(e) =>
                    setItemData((prev) => ({
                      ...prev,
                      serialNumber: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded px-2 py-1 
                             w-40 max-w-full 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition"
                />
              ) : (
                <span className="text-gray-700">{itemData.serialNumber}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium w-full mr-4">Brand Name:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={itemData.brandName || ""}
                  onChange={(e) =>
                    setItemData((prev) => ({
                      ...prev,
                      brandName: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded px-2 py-1 
                             w-40 max-w-full 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition"
                />
              ) : (
                <span className="text-gray-700">{itemData.brandName}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium w-full mr-4">Supplier Name:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={itemData.supplierName || ""}
                  onChange={(e) =>
                    setItemData((prev) => ({
                      ...prev,
                      supplierName: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded px-2 py-1 
                             w-40 max-w-full 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition"
                />
              ) : (
                <span className="text-gray-700">{itemData.supplierName}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium w-full mr-4">Location:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={itemData.location || ""}
                  onChange={(e) =>
                    setItemData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded px-2 py-1 
                             w-40 max-w-full 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition"
                />
              ) : (
                <span className="text-gray-700">{itemData.location}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium w-full mr-4">Quantity:</span>
              {isEditing ? (
                <input
                  type="number"
                  value={itemData.quantity ?? ""}
                  onChange={(e) =>
                    setItemData((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded px-2 py-1 
                             w-40 max-w-full 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition"
                />
              ) : (
                <span className="text-gray-700">{itemData.quantity}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium w-full mr-4">Threshold:</span>
              {isEditing ? (
                <input
                  type="number"
                  value={itemData.threshold ?? ""}
                  onChange={(e) =>
                    setItemData((prev) => ({
                      ...prev,
                      threshold: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded px-2 py-1 
                             w-40 max-w-full 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition"
                />
              ) : (
                <span className="text-gray-700">
                  {itemData.threshold ?? "—"}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium w-full mr-4">Price:</span>
              {isEditing ? (
                <input
                  type="number"
                  value={itemData.price ?? ""}
                  onChange={(e) =>
                    setItemData((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded px-2 py-1 
                             w-40 max-w-full 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition"
                />
              ) : (
                <span className="text-gray-700">
                  {itemData.price != null ? itemData.price : "—"}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium w-full mr-4">Frequently Used:</span>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={!!itemData.isFrequentlyUsed}
                  onChange={(e) =>
                    setItemData((prev) => ({
                      ...prev,
                      isFrequentlyUsed: e.target.checked,
                    }))
                  }
                  className="w-4 h-4"
                />
              ) : (
                <span className="text-gray-700">
                  {itemData.isFrequentlyUsed ? "Yes" : "No"}
                </span>
              )}
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="font-medium w-full mr-4 pt-1">Related Boards:</span>

              {isEditing ? (
                <div className="w-56 max-w-full border border-gray-300 rounded px-3 py-2 max-h-40 overflow-y-auto">
                  <div className="space-y-2">
                    {BOARD_OPTIONS.map((board) => (
                      <label
                        key={board}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={(itemData.relatedBoards || []).includes(board)}
                          onChange={() => handleBoardToggle(board)}
                          className="w-4 h-4"
                        />
                        <span>{BOARD_LABELS[board] || board}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap justify-end gap-2 max-w-[60%]">
                  {Array.isArray(itemData.relatedBoards) &&
                  itemData.relatedBoards.length > 0 ? (
                    itemData.relatedBoards.map((board) => (
                      <span
                        key={board}
                        className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium"
                      >
                        {BOARD_LABELS[board] || board}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-700">—</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium w-full mr-4">Description:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={itemData.description || ""}
                  onChange={(e) =>
                    setItemData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded 
                             px-2 py-1 
                             w-40 max-w-full 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition"
                />
              ) : (
                <span className="text-gray-700">
                  {itemData.description || "—"}
                </span>
              )}
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Added at:</span>
              <span className="text-gray-700">{itemData.addedOn}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Added by:</span>
              <span className="text-gray-700">{itemData.addedBy}</span>
            </div>

            {itemData.lastUpdatedOn && (
              <div className="flex justify-between">
                <span className="font-medium">Last Updated at:</span>
                <span className="text-gray-700">{itemData.lastUpdatedOn}</span>
              </div>
            )}
            {itemData.lastUpdatedBy && (
              <div className="flex justify-between">
                <span className="font-medium">Last Updated by:</span>
                <span className="text-gray-700">{itemData.lastUpdatedBy}</span>
              </div>
            )}

            {Array.isArray(itemData.allUpdates) &&
              itemData.allUpdates.length > 0 && (
                <div>
                  <span className="font-medium">Update History:</span>
                  <ul className="list-disc list-inside mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {itemData.allUpdates.map((u, idx) => (
                      <li key={idx} className="text-sm text-gray-600">
                        {u.updatedBy} - {u.updatedAt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          <div className="bg-gray-100 px-6 py-4 flex justify-between items-center flex-wrap gap-2">
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-lg shadow-md transition-colors duration-150"
                  style={{ backgroundColor: "#2196F3", color: "white" }}
                >
                  Edit Item
                </button>
              ) : (
                <button
                  type="button"
                  onClick={updateItemData}
                  className="px-4 py-2 rounded-lg shadow-md transition-colors duration-150"
                  style={{ backgroundColor: "#4CAF50", color: "white" }}
                >
                  Save Changes
                </button>
              )}

              <button
                onClick={() => modalDeleteItem(itemId)}
                className="border border-red-500 bg-white text-red-500 font-bold px-4 py-2 rounded-lg transition-colors duration-150 hover:bg-red-500 hover:text-white"
              >
                Delete
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                navigate(`/item-logs/${itemId}`);
              }}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline transition"
            >
              View Item Logs
            </button>
          </div>
        </div>
      </div>
    </>
  );
}