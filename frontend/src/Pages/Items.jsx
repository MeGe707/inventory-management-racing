import React, { useEffect, useContext, useState } from "react";
import { AppContext } from "../Context/AppContext.jsx";
import ItemModal from "../Components/ItemModal.jsx";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuthStore } from "../Context/authStore.js";

export default function AllItems() {
  const { getAllItems, items, moveItemToThrashBox, link } =
    useContext(AppContext);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [searchField, setSearchField] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);

useEffect(() => {
  if (isAuthenticated) {
    getAllItems();
  }
}, [isAuthenticated]);


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
        { itemId, quantity: newQty }
      );

      if (!data.success) {
        alert("Backend did not save the changes.");
      }
    } catch (err) {
      console.error("Backend error:", err);
    }
  };

  const handleToggleFrequentlyUsed = async (item) => {
    if (!token) return;

    const newVal = !item.isFrequentlyUsed;

    setFilteredItems((prev) =>
      prev.map((it) =>
        it._id === item._id ? { ...it, isFrequentlyUsed: newVal } : it
      )
    );

    try {
      const { data } = await axios.post(
        `${link}/user/update-item`,
        { itemId: item._id, isFrequentlyUsed: newVal }
      );

      if (!data.success) {
        toast.error(data.message || "Could not update favorite flag.");
        setFilteredItems((prev) =>
          prev.map((it) =>
            it._id === item._id
              ? { ...it, isFrequentlyUsed: item.isFrequentlyUsed }
              : it
          )
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while updating favorite.");
      setFilteredItems((prev) =>
        prev.map((it) =>
          it._id === item._id
            ? { ...it, isFrequentlyUsed: item.isFrequentlyUsed }
            : it
        )
      );
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
          <option value="component">Component</option>
          <option value="brandName">Brand</option>
          <option value="supplierName">Supplier</option>
          <option value="serialNumber">Part Number</option>

          {/* ✅ BUNU EKLE */}
          <option value="description">Description</option>

          <option value="addedBy">Added By</option>
          <option value="lastUpdatedBy">Last Updated By</option>
        </select>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e .target.value)}
          placeholder={`Search by ${searchField}...`}
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

      {/* HEADER */}
      {/* HEADER */}
      <div className="hidden sm:grid grid-cols-[40px_50px_240px_136px_0.7fr_120px_70px] py-3 px-6 border-b font-semibold text-gray-700 items-center justify-items-center">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={toggleSelectAll}
        />
        <p>#</p>
        <p>Item Name</p>
        <p>Qty</p>
        <p className="ml-20">Description</p>
        <p className="ml-56">Location</p>
        <p className="ml-56">Fav</p>
      </div>

      <div className="bg-white border-rounded text-sm max-h-[80vh] min--[60vh] overflow-y-scroll">
        {filteredItems.map((item, index) => (
          <div
            key={item._id}
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[40px_50px_240px_140px_1fr_120px_70px] items-center py-3 px-6 border-b hover:bg-gray-50 text-gray-500"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(item._id)}
              onChange={() => toggleSelectItem(item._id)}
              className="justify-self-center"
            />

            <p className="max-sm:hidden justify-self-center">{index + 1}</p>

            <p
              onClick={() => handleItemClick(item)}
              className="cursor-pointer justify-self-center text-center"
            >
              {item.name}
            </p>

            <p className="flex items-center justify-center gap-1 justify-self-center">
              <button
                onClick={() =>
                  handleQuantityChange(item._id, item.quantity - 1)
                }
                className="w-6 h-6 flex items-center justify-center rounded bg-red-100 text-red-600 hover:bg-red-200 text-sm font-bold"
              >
                −
              </button>
              <span className="w-8   text-center text-sm">{item.quantity}</span>
              <button
                onClick={() =>
                  handleQuantityChange(item._id, item.quantity + 1)
                }
                className="w-6 h-6 flex items-center justify-center rounded bg-green-100 text-green-600 hover:bg-green-200 text-sm font-bold"
              >
                +
              </button>
            </p>

            <p
              className="text-xs text-left cursor-pointer ml-12 leading-5"
              onClick={() => handleItemClick(item)}
              title={item.description || ""}
            >
              {item.description || "—"}
            </p>

            <p
              className="cursor-pointer justify-self-center text-center"
              onClick={() => handleItemClick(item)}
            >
              {item.location}
            </p>

            <button
              type="button"
              onClick={() => handleToggleFrequentlyUsed(item)}
              className={`justify-self-center ml-2 hover:text-yellow-600 ${
                item.isFrequentlyUsed
                  ? "text-yellow-500 text-xl"
                  : "text-gray-400 text-xl"
              }`}
            >
              {item.isFrequentlyUsed ? "★" : "☆"}
            </button>
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
