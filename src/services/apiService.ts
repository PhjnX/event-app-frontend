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
  withCredentials: false, // Tắt credentials để tránh lỗi CORS Preflight
});

// INTERCEPTOR REQUEST
apiService.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Luôn lấy token mới nhất từ LocalStorage ngay lúc gọi API
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

// INTERCEPTOR RESPONSE
apiService.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const errorData: any = error.response.data;

      console.error(`API Error [${status}]:`, errorData);

      // Xử lý 401: Token hết hạn hoặc không hợp lệ
      if (status === 401) {
        // Chỉ redirect nếu không phải đang ở trang login để tránh lặp
        if (!window.location.pathname.includes("/auth")) {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          // Dùng window.location.href để reload sạch sẽ
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
