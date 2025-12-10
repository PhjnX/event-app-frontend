import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User } from "../../models/user";
import apiService from "../../services/apiService";
import { toast } from "react-toastify";

export const fetchUserList = createAsyncThunk(
  "listUser/fetchUserList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<User[]>("/users");
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Lỗi lấy danh sách user");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "listUser/deleteUser",
  async (uid: string, { rejectWithValue }) => {
    try {
      await apiService.delete(`/users/${uid}`);
      toast.success("Xóa người dùng thành công");
      return uid; 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi xóa người dùng");
      return rejectWithValue(error.message);
    }
  }
);

export const searchUser = createAsyncThunk(
  "listUser/searchUser",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<User[]>("/users/search", {
        params: { email },
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Lỗi tìm kiếm");
    }
  }
);

export const fetchUserDetail = createAsyncThunk(
  "listUser/fetchUserDetail",
  async (uid: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<User>(`/users/${uid}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

type TState = {
  data: User[];
  userDetail: User | null; 
  isLoading: boolean;
  error: any;
};

const initialState: TState = {
  data: [],
  userDetail: null,
  isLoading: false,
  error: null,
};

const listUserSlice = createSlice({
  name: "listUser",
  initialState,
  reducers: {
    clearUserDetail: (state) => {
      state.userDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserList.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.data = state.data.filter((u) => u.uid !== action.payload);
      })
      .addCase(searchUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchUser.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = Array.isArray(action.payload)
          ? action.payload
          : [action.payload];
      })

      .addCase(fetchUserDetail.fulfilled, (state, action: any) => {
        state.userDetail = action.payload;
      });
  },
});

export const { clearUserDetail } = listUserSlice.actions;
export default listUserSlice.reducer;
