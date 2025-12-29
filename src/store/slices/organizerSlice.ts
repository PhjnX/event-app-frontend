import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/apiService";
import { toast } from "react-toastify";
import type { Organizer } from "../../models/organizer";

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

export const registerOrganizer = createAsyncThunk(
  "organizers/register",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.post("/organizers", data);
      return response;
    } catch (error: any) {
      toast.error(error.message || "Đăng ký thất bại");
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrganizers = createAsyncThunk(
  "organizers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Organizer[]>("/organizers");
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const approveOrganizer = createAsyncThunk(
  "organizers/approve",
  async (organizerId: number, { rejectWithValue }) => {
    try {
      await apiService.put(`/organizers/${organizerId}/approve`);
      toast.success("Đã duyệt tổ chức thành công!");
      return organizerId;
    } catch (error: any) {
      toast.error("Lỗi khi duyệt");
      return rejectWithValue(error.message);
    }
  }
);

export const deleteOrganizer = createAsyncThunk(
  "organizers/delete",
  async (slug: string, { rejectWithValue }) => {
    try {
      await apiService.delete(`/organizers/${slug}`);
      toast.success("Đã xóa tổ chức");
      return slug;
    } catch (error: any) {
      toast.error("Không thể xóa tổ chức này");
      return rejectWithValue(error.message);
    }
  }
);

const organizerSlice = createSlice({
  name: "organizers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerOrganizer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerOrganizer.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerOrganizer.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchOrganizers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrganizers.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload;
      })

      .addCase(approveOrganizer.fulfilled, (state, action: any) => {
        const org = state.data.find((o) => o.organizerId === action.payload);
        if (org) org.approved = true;
      })

      .addCase(deleteOrganizer.fulfilled, (state, action: any) => {
        state.data = state.data.filter((o) => o.slug !== action.payload);
      });
  },
});

export default organizerSlice.reducer;
