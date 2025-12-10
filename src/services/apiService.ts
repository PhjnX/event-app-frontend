import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { STORAGE_KEYS } from "../constants";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://ems-backend-jkjx.onrender.com/api";

const apiService = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 60000,
});

apiService.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiService.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error("API Error:", error.response.data);

      if (error.response.status === 401) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      }
    } else {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiService as {
  get: <T = any>(url: string, config?: any) => Promise<T>;
  post: <T = any>(url: string, data?: any, config?: any) => Promise<T>;
  put: <T = any>(url: string, data?: any, config?: any) => Promise<T>;
  delete: <T = any>(url: string, config?: any) => Promise<T>;
  patch: <T = any>(url: string, data?: any, config?: any) => Promise<T>;
};
