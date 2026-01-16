import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { STORAGE_KEYS } from "../constants";

// FIX: Xóa từ khóa 'export' vì baseURL chỉ dùng nội bộ để tạo instance axios ở dưới
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
  withCredentials: false,
});

apiService.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (token && config.headers && !config.url?.includes("google.com")) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiService.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const errorData: any = error.response.data;

      console.error(`API Error [${status}]:`, errorData);

      if (status === 401) {
        if (!window.location.pathname.includes("/auth")) {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          window.location.href = "/auth";
        }
      }
    }
    return Promise.reject(error);
  }
);

const apiServiceExport = {
  get: <T = any>(url: string, config?: any) =>
    apiService.get<any, T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) =>
    apiService.post<any, T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: any) =>
    apiService.put<any, T>(url, data, config),
  delete: <T = any>(url: string, config?: any) =>
    apiService.delete<any, T>(url, config),
  patch: <T = any>(url: string, data?: any, config?: any) =>
    apiService.patch<any, T>(url, data, config),
};

export default apiServiceExport;
