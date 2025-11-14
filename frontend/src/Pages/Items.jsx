import React, { useEffect, useContext, useState } from "react";
import { AppContext } from "../Context/AppContext.jsx";
import ItemModal from "../Components/ItemModal.jsx";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import axios from "axios";

export default function AllItems() {
  const { token, getAllItems, items, moveItemToThrashBox, link } =
    useContext(AppContext);

  const [searchField, setSearchField] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (token) getAllItems();
  }, [token]); // call only when token changes

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return setFilteredItems(items);
    setFilteredItems(
      items.filter((item) => {
        const val = String(item[searchField] || "").toLowerCase();
        return val.includes(q);
      })
    );
  }, [items, searchField, searchQuery]);

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 0) return;

    setFilteredItems((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, quantity: newQty } : item
      )
    );

    try {
      const { data } = await axios.post(
        `${link}/user/update-item`,
        { itemId, quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!data.success) {
        alert("Backend did not save the changes.");
        // if you want rollback, refetch just this item here
      }
    } catch (err) {
      console.error("Backend error:", err);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const toggleSelectItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    filteredItems.length > 0 && selectedIds.length === filteredItems.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((item) => item._id));
    }
  };
const handleExport = () => {
  if (selectedIds.length === 0) {
    toast.warning("Please select at least one item to export.");
    return;
  }

  const selectedItems = items.filter((item) =>
    selectedIds.includes(item._id)
  );

  const data = selectedItems.map(
    ({
      _id,
      name,
      component,
      brandName,
      supplierName,
      serialNumber,
      quantity,
      price,
      location,
      description,
      addedOn,
      addedBy,
      lastUpdatedOn,
      lastUpdatedBy,
    }) => ({
      ID: _id,
      Name: name,
      Component: component,
      "Brand Name": brandName,
      "Supplier Name": supplierName,
      "Serial Number": serialNumber,
      Quantity: quantity,
      Price: price,
      Location: location,
      Description: description,
      "Added On": addedOn,
      "Added By": addedBy,
      "Last Updated On": lastUpdatedOn,
      "Last Updated By": lastUpdatedBy,
    })
  );

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "SelectedItems");
  XLSX.writeFile(workbook, "selected_items.xlsx");
};


  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <p className="mb-4 mt-3 text-2xl font-medium">All Items</p>

      <div className="flex items-center gap-2 mb-4">
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="name">Name</option>
          <option value="serialNumber">Serial Number</option>
          <option value="addedBy">Added By</option>
          <option value="lastUpdatedBy">Last Updated By</option>
        </select>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items..."
          className="flex-1 border rounded px-3 py-2"
        />

        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Export to Excel
            </button>
            <button
              onClick={async () => {
                if (
                  window.confirm(
                    `${selectedIds.length} item(s) will be deleted. Do you confirm?`
                  )
                ) {
                  try {
                    await moveItemToThrashBox(selectedIds);
                  } catch (e) {
                    toast.error("An error occurred while deleting items.");
                  }
                }
              }}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      <div className="hidden sm:grid grid-cols-[0.5fr_0.5fr_3fr_1fr_2fr_2fr_2fr_2fr_1fr] py-3 px-6 border-b font-semibold text-gray-700">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={toggleSelectAll}
        />
        <p className="text-center">#</p>
        <p className="text-center">Item Name</p>
        <p className="text-center ml-5">Qty</p>
        <p className="text-center ml-14">Brand</p>
        <p className="text-center ml-12">Location</p>
        <p className="text-center">Added By</p>
        <p className="text-center mr-5">Last Updated</p>
        <p className="text-center">Actions</p>
      </div>

      <div className="bg-white border-rounded text-sm max-h-[80vh] min--[60vh] overflow-y-scroll">
        {filteredItems.map((item, index) => (
          <div
            key={item._id}
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_0.5fr_2.5fr_1.2fr_1.8fr_1.5fr_1.5fr_1.5fr_1fr] items-center text-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(item._id)}
              onChange={() => toggleSelectItem(item._id)}
            />
            <p className="max-sm:hidden">{index + 1}</p>
            <p onClick={() => handleItemClick(item)}>{item.name}</p>
            <p className="flex items-center justify-center gap-1">
              <button
                onClick={() =>
                  handleQuantityChange(item._id, item.quantity - 1)
                }
                className="w-6 h-6 flex items-center justify-center rounded bg-red-100 text-red-600 hover:bg-red-200 text-xs font-bold"
              >
                −
              </button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() =>
                  handleQuantityChange(item._id, item.quantity + 1)
                }
                className="w-6 h-6 flex items-center justify-center rounded bg-green-100 text-green-600 hover:bg-green-200 text-xs font-bold"
              >
                +
              </button>
            </p>

            <p onClick={() => handleItemClick(item)}>{item.brandName}</p>
            <p onClick={() => handleItemClick(item)}>{item.location}</p>
            <p className="text-xs" onClick={() => handleItemClick(item)}>
              {item.addedBy}
            </p>
            <p className="text-xs" onClick={() => handleItemClick(item)}>
              {item.lastUpdatedOn || "—"}
            </p>
            <div className="flex gap-2 items-center justify-end">
              <button
                type="button"
                onClick={() => moveItemToThrashBox([item._id])}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <p className="text-center text-gray-500 p-4">
            No items match your search.
          </p>
        )}
      </div>

      {isModalOpen && selectedItem && (
        <ItemModal itemId={selectedItem._id} onClose={closeModal} />
      )}
    </div>
  );
}
