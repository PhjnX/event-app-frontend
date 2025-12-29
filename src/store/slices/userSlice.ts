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


export const fetchMyAttendees = createAsyncThunk(
  "listUser/fetchMyAttendees",
  async (_, { rejectWithValue }) => {
    try {
      const myEvents = await apiService.get<any[]>("/events/my-events");

      if (!myEvents || myEvents.length === 0) {
        return [];
      }

      const registrationPromises = myEvents.map(
        (event) =>
          apiService
            .get<any[]>(`/events/${event.eventId}/registrations`)
            .catch(() => []) 
      );

      const allRegistrationsResults = await Promise.all(registrationPromises);

      const uniqueUsersMap = new Map<string, User>();

      allRegistrationsResults.flat().forEach((reg: any) => {
       
        const userData: User = reg.user || {
          uid: reg.userId, 
          username: reg.fullName || reg.username || "Unknown",
          email: reg.email,
          phoneNumber: reg.phoneNumber,
          avatarUrl: reg.avatarUrl,
          role: "USER",
        };

        if (userData.uid && !uniqueUsersMap.has(userData.uid)) {
          uniqueUsersMap.set(userData.uid, userData);
        }
      });

      return Array.from(uniqueUsersMap.values());
    } catch (error: any) {
      return rejectWithValue(error.message || "Lỗi lấy danh sách khách hàng");
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
export const updateUser = createAsyncThunk(
  "listUser/updateUser",
  async (
    { uid, data }: { uid: string; data: Partial<User> },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.put<User>(`/users/${uid}`, data);
      toast.success("Cập nhật thông tin thành công!");
      return response;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật");
      return rejectWithValue(error.message);
    }
  }
);

type ListUserState = {
  data: User[];
  userDetail: User | null;
  isLoading: boolean;
  error: any;
};

const initialState: ListUserState = {
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
        state.error = null;
      })
      .addCase(fetchUserList.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserList.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUsersByRole.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUsersByRole.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchMyAttendees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyAttendees.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload; 
      })
      .addCase(fetchMyAttendees.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
        state.data = [];
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.data = state.data.filter((u) => u.uid !== action.payload);
      })
      .addCase(searchUser.fulfilled, (state, action: any) => {
        state.data = Array.isArray(action.payload)
          ? action.payload
          : [action.payload];
      })
      .addCase(fetchUserDetail.fulfilled, (state, action: any) => {
        state.userDetail = action.payload;
      })
      .addCase(updateUser.fulfilled, (state, action: any) => {
        const index = state.data.findIndex((u) => u.uid === action.payload.uid);
        if (index !== -1) state.data[index] = action.payload;
        if (state.userDetail?.uid === action.payload.uid)
          state.userDetail = action.payload;
      });
  },
});

export const { clearUserDetail } = listUserSlice.actions;
export const fetchUsersByRole = createAsyncThunk(
  "listUser/fetchByRole",
  async (roleName: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<User[]>(`/users/role/${roleName}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Lỗi lọc role");
    }
  }
);

export default listUserSlice.reducer;
