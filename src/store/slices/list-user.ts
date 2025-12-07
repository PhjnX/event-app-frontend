import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User } from "../../models/user";
import apiService from "../../services/apiService"; // Đảm bảo import đúng file apiService mới sửa

// 1. SỬA ASYNC THUNK
// Thêm tham số rejectWithValue để xử lý lỗi
export const fetchUserList = createAsyncThunk(
  "UserList/fetchUserList",
  async (_, { rejectWithValue }) => {
    try {
      // Gọi API (response trả về đã là data do interceptor xử lý rồi)
      const response = await apiService.get<User[]>("/users");

      // Quan trọng: Phải return dữ liệu để nó chui vào action.payload
      return response;
    } catch (error: any) {
      // Quan trọng: Trả về lỗi để Redux biết là bị rejected
      return rejectWithValue(error.message || "Lỗi lấy danh sách user");
    }
  }
);

type TState = {
  data: User[]; // Nên để mảng rỗng thay vì null để đỡ phải check null ngoài giao diện
  isLoading: boolean;
  error: any;
};

const initialState: TState = {
  data: [], // Khởi tạo mảng rỗng
  isLoading: false,
  error: null,
};

const listUserSlice = createSlice({
  name: "listUser",
  initialState,
  reducers: {
    // Nơi viết các action đồng bộ (nếu cần sau này, ví dụ: clearUserList)
  },
  extraReducers: (builder) => {
    builder
      // Trạng thái ĐANG GỌI API
      .addCase(fetchUserList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Trạng thái GỌI THÀNH CÔNG
      .addCase(fetchUserList.fulfilled, (state, action: any) => {
        state.isLoading = false;
        // Quan trọng: Gán dữ liệu từ API vào kho
        state.data = action.payload;
      })
      // Trạng thái GỌI THẤT BẠI
      .addCase(fetchUserList.rejected, (state, action) => {
        state.isLoading = false;
        // Gán lỗi vào state để hiển thị thông báo
        state.error = action.payload;
      });
  },
});

export default listUserSlice.reducer;
