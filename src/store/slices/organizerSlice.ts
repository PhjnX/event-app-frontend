import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/apiService";
import { toast } from "react-toastify";
import type { Organizer } from "../../models/organizer";
import { logoutUser } from "./auth";

interface OrganizerState {
  data: Organizer[];
  isLoading: boolean;
  error: any;
}

const initialState: OrganizerState = {
  data: [],
  isLoading: false,
  error: null,
};

export const fetchOrganizers = createAsyncThunk(
  "organizers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Organizer[]>("/organizers");
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchMyOrganizerStatus = createAsyncThunk(
  "organizers/fetchMyStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<any>("/organizers/me/status");
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const registerOrganizer = createAsyncThunk(
  "organizers/register",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.post("/organizers", data);
      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Đăng ký thất bại";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const approveOrganizer = createAsyncThunk(
  "organizers/approve",
  async (organizerId: number, { rejectWithValue }) => {
    try {
      await apiService.put(`/organizers/${organizerId}/approve`);
      toast.success("Đã duyệt tổ chức thành công!");
      return organizerId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const lockOrganizer = createAsyncThunk(
  "organizers/lock",
  async (organizerId: number, { rejectWithValue }) => {
    try {
      await apiService.put(`/organizers/${organizerId}/lock`, {});
      return organizerId;
    } catch (error: any) {
      toast.error(error.message || "Lỗi khóa tài khoản");
      return rejectWithValue(error.message);
    }
  },
);

export const unlockOrganizer = createAsyncThunk(
  "organizers/unlock",
  async (organizerId: number, { rejectWithValue }) => {
    try {
      await apiService.put(`/organizers/${organizerId}/unlock`, {});
      return organizerId;
    } catch (error: any) {
      toast.error(error.message || "Lỗi mở khóa");
      return rejectWithValue(error.message);
    }
  },
);

export const requestUnlockOrganizer = createAsyncThunk(
  "organizers/requestUnlock",
  async (reason: string, { rejectWithValue }) => {
    try {
      await apiService.post("/organizers/me/request-unlock", { reason });
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const organizerSlice = createSlice({
  name: "organizers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrganizers.fulfilled, (state, action: any) => {
        state.data = action.payload;
        state.isLoading = false;
      })

      .addCase(fetchMyOrganizerStatus.fulfilled, (state, action: any) => {
        const statusData = action.payload;
        const index = state.data.findIndex((o) => o.slug === statusData.slug);
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...statusData };
        }
      })
      .addCase(lockOrganizer.fulfilled, (state, action: any) => {
        const org = state.data.find((o) => o.organizerId === action.payload);
        if (org) org.locked = true;
      })
      .addCase(unlockOrganizer.fulfilled, (state, action: any) => {
        const org = state.data.find((o) => o.organizerId === action.payload);
        if (org) {
          org.locked = false;
          org.unlockRequested = false;
        }
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.data = [];
        state.isLoading = false;
      });
  },
});

export default organizerSlice.reducer;
