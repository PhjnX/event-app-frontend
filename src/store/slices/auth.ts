import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/apiService";
import { STORAGE_KEYS } from "../../constants";
import type { User } from "../../models/user";

// --- 1. STATE ---
interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
};

// --- 2. ASYNC THUNKS ---

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

// c. Upload Avatar (Fix header multipart như đã sửa trước đó)
export const uploadAvatar = createAsyncThunk(
  "auth/uploadAvatar",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      // KHÔNG set Content-Type thủ công, để axios tự xử lý boundary
      const response: any = await apiService.post("/images/upload", formData);

      // Xử lý kết quả trả về
      if (typeof response === "string") return response;
      if (typeof response === "object")
        return response.url || response.secure_url || response.data || "";

      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Lỗi upload ảnh");
    }
  }
);

// d. Lấy thông tin User (Me)
export const fetchCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) return rejectWithValue("No token found");
      const response = await apiService.get("/users/me");
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Lỗi xác thực");
    }
  }
);

// e. Cập nhật Profile
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

// f. Đăng xuất (CẬP NHẬT MỚI: Gọi API logout)
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // 1. Gọi API lên server để server hủy token/session
      await apiService.post("/auth/logout");

      return true;
    } catch (error: any) {
      // Dù API lỗi hay thành công thì phía Client vẫn phải logout
      console.warn("Logout API error:", error);
      return rejectWithValue(error.response?.data?.message);
    } finally {
      // 2. Luôn xóa token ở client trong mọi trường hợp (finally)
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
  }
);

// --- 3. SLICE ---
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

    // --- Upload Avatar ---
    builder.addCase(uploadAvatar.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(uploadAvatar.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(uploadAvatar.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // --- Fetch Me ---
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action: any) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.isLoading = false;
    });
    builder.addCase(fetchCurrentUser.rejected, (state) => {
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

    // --- Logout (CẬP NHẬT MỚI) ---
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    });
    // Dù API lỗi (rejected) thì Client vẫn phải clear state
    builder.addCase(logoutUser.rejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    });
  },
});

export const { forceLogout, clearError } = authSlice.actions;
export default authSlice.reducer;
