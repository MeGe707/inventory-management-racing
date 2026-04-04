import React, { useEffect, useContext, useState, useMemo } from "react";
import { AppContext } from "../Context/AppContext.jsx";
import ItemModal from "../Components/ItemModal.jsx";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuthStore } from "../Context/authStore.js";

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




export default function AllItems() {
  const { getAllItems, items, moveItemToThrashBox, link } =
    useContext(AppContext);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [searchField, setSearchField] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  const [selectedBoard, setSelectedBoard] = useState("ALL");


  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);

  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    if (isAuthenticated) {
      getAllItems();
    }
  }, [isAuthenticated]);

  const getItemSortTime = (item) => {
  if (item.lastUpdatedOn) {
    return new Date(item.lastUpdatedOn).getTime();
  }
  if (item.addedOn) {
    return new Date(item.addedOn).getTime();
  }
  return 0;
};

  useEffect(() => {
    let result = [...items];

    const q = searchQuery.trim().toLowerCase();

    if (q) {
      result = result.filter((item) => {
        if (searchField === "relatedBoards") {
          const boardsText = Array.isArray(item.relatedBoards)
            ? item.relatedBoards.join(" ").toLowerCase()
            : "";
          return boardsText.includes(q);
        }

        const val = String(item[searchField] || "").toLowerCase();
        return val.includes(q);
      });
    }

    

    if (selectedBoard !== "ALL") {
      result = result.filter(
        (item) =>
          Array.isArray(item.relatedBoards) &&
          item.relatedBoards.includes(selectedBoard)
      );
    }

    console.log(
  "sortOrder:",
  sortOrder,
  items.map((item) => ({
    name: item.name,
    addedOn: item.addedOn,
    sortTime: getItemSortTime(item),
  }))
);
result.sort((a, b) => {
  const timeA = getItemSortTime(a);
  const timeB = getItemSortTime(b);

  if (sortOrder === "newest") {
    return timeB - timeA;
  }

  if (sortOrder === "oldest") {
    return timeA - timeB;
  }

  return 0;
});

    setFilteredItems(result);
  }, [items, searchField, searchQuery, selectedBoard, sortOrder]);

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 0) return;

    setFilteredItems((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, quantity: newQty } : item
      )
    );

    try {
      const { data } = await axios.post(`${link}/user/update-item`, {
        itemId,
        quantity: newQty,
      });

      if (!data.success) {
        toast.error("Backend did not save the changes.");
      }
    } catch (err) {
      console.error("Backend error:", err);
      toast.error("Quantity update failed.");
    }
  };

  const handleToggleFrequentlyUsed = async (item) => {
    const newVal = !item.isFrequentlyUsed;

    setFilteredItems((prev) =>
      prev.map((it) =>
        it._id === item._id ? { ...it, isFrequentlyUsed: newVal } : it
      )
    );

    try {
      const { data } = await axios.post(`${link}/user/update-item`, {
        itemId: item._id,
        isFrequentlyUsed: newVal,
      });

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
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedIds.includes(item._id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !filteredItems.some((item) => item._id === id))
      );
    } else {
      const filteredIds = filteredItems.map((item) => item._id);
      setSelectedIds((prev) => [...new Set([...prev, ...filteredIds])]);
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
        relatedBoards,
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
        "Related Boards": Array.isArray(relatedBoards)
          ? relatedBoards.join(", ")
          : "",
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
    <div className="w-full max-w-7xl mx-auto px-4">
      <p className="mb-4 mt-3 text-2xl font-medium">All Items</p>

      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
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
            <option value="description">Description</option>
            <option value="addedBy">Added By</option>
            <option value="lastUpdatedBy">Last Updated By</option>
            <option value="relatedBoards">Related Boards</option>
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search by ${searchField}...`}
            className="flex-1 border rounded px-3 py-2"
          />

          <select
            value={selectedBoard}
            onChange={(e) => setSelectedBoard(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="ALL">All Boards</option>
            {BOARD_OPTIONS.map((board) => (
              <option key={board} value={board}>
                {BOARD_LABELS[board] || board}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="newest">Newest Added</option>
            <option value="oldest">Oldest Added</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex gap-2 flex-wrap">
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
                    setSelectedIds([]);
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

      <div className="hidden lg:grid grid-cols-[40px_50px_190px_120px_220px_160px_1fr_70px] py-3 px-6 border-b font-semibold text-gray-700 items-center">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={toggleSelectAll}
        />
        <p className="text-center">#</p>
        <p className="text-center">Item Name</p>
        <p className="text-center">Qty</p>
        <p className="text-center">Related Boards</p>
        <p className="text-center">Location</p>
        <p className="text-center">Description</p>
        <p className="text-center">Fav</p>
      </div>

      <div className="bg-white rounded-xl border text-sm max-h-[80vh] overflow-y-auto">
        {filteredItems.map((item, index) => (
          <div
            key={item._id}
            className="flex flex-col gap-3 lg:grid lg:grid-cols-[40px_50px_190px_120px_220px_160px_1fr_70px] items-start lg:items-center py-3 px-6 border-b hover:bg-gray-50 text-gray-600"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(item._id)}
              onChange={() => toggleSelectItem(item._id)}
              className="lg:justify-self-center"
            />

            <p className="hidden lg:block text-center w-full">{index + 1}</p>

            <p
              onClick={() => handleItemClick(item)}
              className="cursor-pointer text-center w-full font-medium"
            >
              {item.name}
            </p>

            <p className="flex items-center justify-center gap-1 w-full">
              <button
                onClick={() =>
                  handleQuantityChange(item._id, item.quantity - 1)
                }
                className="w-6 h-6 flex items-center justify-center rounded bg-red-100 text-red-600 hover:bg-red-200 text-sm font-bold"
              >
                −
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() =>
                  handleQuantityChange(item._id, item.quantity + 1)
                }
                className="w-6 h-6 flex items-center justify-center rounded bg-green-100 text-green-600 hover:bg-green-200 text-sm font-bold"
              >
                +
              </button>
            </p>

            <div className="flex flex-wrap gap-1 w-full">
              {Array.isArray(item.relatedBoards) && item.relatedBoards.length > 0 ? (
                item.relatedBoards.map((board) => (
                  <span
                    key={board}
                    className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium"
                  >
                    {BOARD_LABELS[board] || board}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-xs">—</span>
              )}
            </div>

            <p
              className="cursor-pointer w-full"
              onClick={() => handleItemClick(item)}
            >
              {item.location}
            </p>

            <p
              className="text-xs cursor-pointer leading-5 w-full"
              onClick={() => handleItemClick(item)}
              title={item.description || ""}
            >
              {item.description || "—"}
            </p>

            <button
              type="button"
              onClick={() => handleToggleFrequentlyUsed(item)}
              className={`lg:justify-self-center hover:text-yellow-600 ${
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
            No items match your filters.
          </p>
        )}
      </div>

      {isModalOpen && selectedItem && (
        <ItemModal itemId={selectedItem._id} onClose={closeModal} />
      )}
    </div>
  );
}