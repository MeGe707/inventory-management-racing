import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets.js";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const mode = "live";

  const [items, setItems] = useState([]);
  const [thrashItems, setThrashItems] = useState([]);
  const [itemData, setItemData] = useState({
    relatedBoards: [],
  });

  const link =
    mode === "development"
      ? "http://localhost:5000"
      : "https://inventory-management-racing.onrender.com";

  axios.defaults.withCredentials = true;

  const getAllItems = async () => {
    try {
      const res = await axios.get(`${link}/user/get-all-items`);
      if (res.data.success) {
        setItems(res.data.items);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const moveItemToThrashBox = async (itemIds) => {
    try {
      const res = await axios.post(`${link}/user/move-to-thrash-box`, {
        itemIds,
      });

      if (res.data.success) {
        toast.success(
          res.data.message || "Item başarıyla çöp kutusuna taşındı."
        );
        getAllItems();
      } else {
        toast.error(res.data.message || "Item taşınırken hata oluştu.");
      }
    } catch (error) {
      console.error("moveItemToThrashBox error:", error);
      toast.error(error.response?.data?.message || "Sunucu hatası");
    }
  };

  const getThrashItems = async () => {
    console.log("Fetching all Thrash Items...");
    try {
      const res = await axios.post(`${link}/user/get-thrash-items`, {});

      if (res.data.success) {
        setThrashItems(res.data.items);
        console.log("Thrash items fetched:", res.data.items.length);
      } else {
        toast.error(res.data.message || "Thrash item'lar alınamadı.");
      }
    } catch (error) {
      console.error("getThrashItems error:", error);
      toast.error(
        error.response?.data?.message ||
          "Sunucu hatası: Thrash item'lar alınamadı."
      );
    }
  };

  const getItem = async (itemId) => {
    try {
      const res = await axios.post(`${link}/user/get-item`, { itemId });

      if (res.data.success) {
        setItemData(res.data.item);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Item alınırken hata oluştu.");
    }
  };

  const value = {
    assets,
    items,
    getAllItems,
    setItems,
    getThrashItems,
    setThrashItems,
    moveItemToThrashBox,
    thrashItems,
    itemData,
    setItemData,
    getItem,
    link,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;