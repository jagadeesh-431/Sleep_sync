import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Attach JWT token to every request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminRegister = (data) => API.post("/admin/register", data);
export const adminLogin = (data) => API.post("/admin/login", data);
export const getAdminProfile = () => API.get("/admin/profile");
export const updateAdminProfile = (data) => API.put("/admin/profile", data);

export const addSleepRecord = (data) => API.post("/sleep/add", data);
export const getSleepHistory = () => API.get("/sleep/history");
export const updateSleepRecord = (id, data) => API.put(`/sleep/update/${id}`, data);
export const deleteSleepRecord = (id) => API.delete(`/sleep/delete/${id}`);
export const getSleepAnalytics = () => API.get("/sleep/analytics");

export default API;
