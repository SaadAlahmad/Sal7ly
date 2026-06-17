import { envConfig } from "../config";
import axios from "axios";
import useAuthStore from "@/store/authStore";

export const instance = axios.create({
  baseURL: envConfig.apiUrl,
  timeout: 5000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
