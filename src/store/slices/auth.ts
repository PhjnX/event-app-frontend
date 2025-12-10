import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/apiService";
import { STORAGE_KEYS } from "../../constants";
import type { User } from "../../models/user";

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

export const uploadAvatar = createAsyncThunk(
  "auth/uploadAvatar",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response: any = await apiService.post("/images/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (typeof response === "string") return response;
      if (typeof response === "object")
        return response.url || response.secure_url || response.data || "";

      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Lỗi upload ảnh");
    }
  }
);

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

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await apiService.post("/auth/logout");

      return true;
    } catch (error: any) {
      console.warn("Logout API error:", error);
      return rejectWithValue(error.response?.data?.message);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
  }
);

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

    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    });
    builder.addCase(logoutUser.rejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    });
  },
});

export const { forceLogout, clearError } = authSlice.actions;
export default authSlice.reducer;
