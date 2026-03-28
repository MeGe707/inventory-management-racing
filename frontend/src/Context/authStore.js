import { create } from "zustand";
import axios from "axios";


const API_BASE = mode === "development" ? "http://localhost:5000" : "https://inventory-management-racing.onrender.com";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,

  // LOGIN
  login: async (email, password, type) => {
    set({ isLoading: true, error: null });

    try {
      let endpoint = "";

      if (type === "user") {
        endpoint = `${API_BASE}/user/login-user`;
      } else if (type === "admin") {
        endpoint = `${API_BASE}/admin/admin-login`;
      } else if (type === "superadmin") {
        endpoint = `${API_BASE}/admin/superadmin-login`;
      }

      const res = await axios.post(endpoint, { email, password });

      if (res.data.success) {
        set({
          user: res.data.user || { email },
          role: res.data.role,
          isAuthenticated: true,
          isLoading: false,
        });

        return res.data;
      } else {
        set({ isLoading: false });
        throw new Error(res.data.message);
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
      throw err;
    }
  },

  // LOGOUT
  logout: async () => {
    set({ isLoading: true });

    try {
      await axios.post(`${API_BASE}/user/logout`, { withCredentials: true });

      set({
        user: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

checkAuth: async () => {
  set({ isCheckingAuth: true });

  try {
    const res = await axios.post(`${API_BASE}/user/check-auth`);
    console.log("CHECK AUTH RESPONSE:", res.data);

    if (res.data.success) {
      set({
        user: res.data.user,
        role: res.data.role,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } else {
      set({
        user: null,
        role: null,
        isAuthenticated: false,
        isCheckingAuth: false,
      });
    }
  } catch (err) {
    console.log("CHECK AUTH ERROR:", err.response?.data || err.message);

    set({
      user: null,
      role: null,
      isAuthenticated: false,
      isCheckingAuth: false,
    });
  }
},
}));
