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
  // Render server free hay bị delay lúc đầu, để 60s cho chắc ăn
  timeout: 60000,
});

// --- Interceptor Request: Tự động gắn Token vào header ---
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

// --- Interceptor Response: Xử lý dữ liệu trả về và lỗi ---
apiService.interceptors.response.use(
  (response: AxiosResponse) => {
    // Chỉ lấy phần data quan trọng, bỏ qua status code, headers...
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error("API Error:", error.response.data);

      // Nếu Token hết hạn (401) -> Xóa token để đăng nhập lại
      if (error.response.status === 401) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        // Có thể thêm logic redirect về trang login nếu cần thiết
      }
    } else {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// --- Hack Type: Giúp TypeScript hiểu response trả về là data luôn ---
export default apiService as {
  get: <T = any>(url: string, config?: any) => Promise<T>;
  post: <T = any>(url: string, data?: any, config?: any) => Promise<T>;
  put: <T = any>(url: string, data?: any, config?: any) => Promise<T>;
  delete: <T = any>(url: string, config?: any) => Promise<T>;
  patch: <T = any>(url: string, data?: any, config?: any) => Promise<T>;
};
