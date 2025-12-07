import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/apiService";
import { STORAGE_KEYS } from "../../constants";

// --- 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU ---
export interface User {
  id: string | number;
  username: string;
  email: string;
  role: string;
  phoneNumber?: string | null;
  address?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  avatarUrl?: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// State khởi tạo
const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  // --- SỬA QUAN TRỌNG: Kiểm tra token ngay lập tức ---
  // Nếu có token trong máy -> Tạm coi là đã login (true) để Router không đá về trang Login khi F5
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
};

// --- 2. ASYNC THUNKS (GỌI API) ---

// a. Đăng ký
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await apiService.post("/auth/signup", userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Đăng ký thất bại"
      );
    }
  }
);

// b. Đăng nhập
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response: any = await apiService.post("/auth/signin", credentials);

      if (response.token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.token);
      } else if (response.accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      }

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Đăng nhập thất bại"
      );
    }
  }
);

// c. Lấy thông tin User (Me)
export const fetchCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) return rejectWithValue("No token found");

      // --- SỬA ĐƯỜNG DẪN API ---
      // Dựa vào logic update profile của bạn, đường dẫn đúng khả năng cao là /users/me
      const response = await apiService.get("/users/me");
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Lỗi xác thực");
    }
  }
);

// d. Cập nhật Profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response: any = await apiService.put("/users/me", userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Cập nhật thất bại"
      );
    }
  }
);

// e. Đăng xuất
export const logoutUser = createAsyncThunk("auth/logout", async (_) => {
  try {
    await apiService.post("/auth/logout");
  } catch (error) {
    console.error("Logout API error", error);
  } finally {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }
});

// --- 3. SLICE (REDUCER) ---
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    forceLogout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // --- Register ---
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(registerUser.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // --- Login ---
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action: any) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user || action.payload;
    });
    builder.addCase(loginUser.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    });

    // --- Fetch Me (QUAN TRỌNG) ---
    builder.addCase(fetchCurrentUser.pending, (state) => {
      // Khi đang load, giữ nguyên trạng thái isAuthenticated từ initialState
      state.isLoading = true;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action: any) => {
      state.isAuthenticated = true; // Token chuẩn -> Xác nhận login
      state.user = action.payload;
      state.isLoading = false;
    });
    builder.addCase(fetchCurrentUser.rejected, (state) => {
      // API báo lỗi (Token hết hạn/Fake) -> Lúc này mới đá user ra
      state.isAuthenticated = false;
      state.user = null;
      state.isLoading = false;
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    });

    // --- Update Profile ---
    builder.addCase(updateUserProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action: any) => {
      state.isLoading = false;
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    });
    builder.addCase(updateUserProfile.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // --- Logout ---
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
    builder.addCase(logoutUser.rejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
  },
});

export const { forceLogout, clearError } = authSlice.actions;
export default authSlice.reducer;
