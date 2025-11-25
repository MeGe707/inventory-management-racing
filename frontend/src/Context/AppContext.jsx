import { createContext, useEffect } from "react";
import { useState } from "react";

import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets.js";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );
  const [items, setItems] = useState([]);
  const [thrashItems, setthrashItems] = useState([]);
  const [itemData, setItemData] = useState({});
  const [role, setRole] = useState(
    localStorage.getItem("role") ? localStorage.getItem("role") : ""
  );
  const link = "https://inventory-management-racing.onrender.com";

  axios.defaults.withCredentials = true;

  const getAllItems = async () => {
    try {
      const data = await axios.get(`${link}/user/get-all-items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.data.success) {
        setItems(data.data.items);
      } else {
        toast.error(data.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const moveItemToThrashBox = async (itemIds) => {
    try {
      const res = await axios.post(
        `${link}/user/move-to-thrash-box`,
        { itemIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(
          res.data.message || "Item başarıyla çöp kutusuna taşındı."
        );
        getAllItems(); // listeyi yenile
      } else {
        toast.error(res.data.message || "Item taşınırken hata oluştu.");
      }
    } catch (error) {
      console.error("moveItemToThrashBox error:", error);
      toast.error(error.response?.data?.message || "Sunucu hatası");
    }
  };

  const getthrashItems = async () => {
    console.log("Fetching all Thrash Items...");
    console.log(token)
    try {
      const res = await axios.post(`${link}/user/get-thrash-items`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setthrashItems(res.data.items); // ✅ gelen verileri state'e aktar
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
    console.log(itemId);
    try {
      const data = await axios.post(
        `${link}/user/get-item`,
        { itemId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.data.success) {
        setItemData(data.data.item);
      } else {
        toast.error(data.data.message);
      }
    } catch (error) {
      toast.error("yoyoyoy");
    }
  };

  const value = {
    assets,
    token,
    setToken,
    items,
    getAllItems,
    setItems,
    getthrashItems,
    setthrashItems,
    moveItemToThrashBox,
    thrashItems,
    itemData,
    setItemData,
    getItem,
    role,
    setRole,
    link,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
