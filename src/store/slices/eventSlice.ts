import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/apiService";
import { toast } from "react-toastify";
import type { Event } from "../../models/event";

interface EventState {
  data: Event[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EventState = {
  data: [],
  isLoading: false,
  error: null,
};


export const fetchAllEvents = createAsyncThunk(
  "events/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Event[]>("/events/all");
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi lấy danh sách sự kiện");
    }
  }
);

export const fetchMyEvents = createAsyncThunk(
  "events/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Event[]>("/events/my-events");
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi lấy danh sách sự kiện");
    }
  }
);

export const createEvent = createAsyncThunk(
  "events/create",
  async (data: Partial<Event>, { rejectWithValue }) => {
    try {
      const response = await apiService.post<Event>("/events", data);
      toast.success("Tạo sự kiện thành công!");
      return response;
    } catch (err: any) {
      toast.error(err.message || "Tạo sự kiện thất bại");
      return rejectWithValue(err.message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  "events/update",
  async (
    { slug, data }: { slug: string; data: Partial<Event> },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.put<Event>(`/events/${slug}`, data);
      toast.success("Cập nhật sự kiện thành công!");
      return response;
    } catch (err: any) {
      toast.error(err.message || "Cập nhật thất bại");
      return rejectWithValue(err.message);
    }
  }
);

export const approveEvent = createAsyncThunk(
  "events/approve",
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.put(`/events/${id}/approve`);
      toast.success("Đã duyệt sự kiện");
      return id;
    } catch (err: any) {
      toast.error("Lỗi khi duyệt");
      return rejectWithValue(err.message);
    }
  }
);

export const rejectEvent = createAsyncThunk(
  "events/reject",
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.put(`/events/${id}/reject`);
      toast.info("Đã từ chối sự kiện");
      return id;
    } catch (err: any) {
      toast.error("Lỗi khi từ chối");
      return rejectWithValue(err.message);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  "events/delete",
  async (slug: string, { rejectWithValue }) => {
    try {
      await apiService.delete(`/events/${slug}`);
      toast.success("Đã xóa sự kiện");
      return slug;
    } catch (err: any) {
      toast.error("Lỗi xóa sự kiện");
      return rejectWithValue(err.message);
    }
  }
);

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllEvents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllEvents.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchMyEvents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })

      .addCase(createEvent.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })

      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (e) => e.eventId === action.payload.eventId
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })

      .addCase(approveEvent.fulfilled, (state, action) => {
        const evt = state.data.find((e) => e.eventId === action.payload);
        if (evt) evt.status = "APPROVED";
      })

      .addCase(rejectEvent.fulfilled, (state, action) => {
        const evt = state.data.find((e) => e.eventId === action.payload);
        if (evt) evt.status = "REJECTED";
      })

      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.data = state.data.filter((e) => e.slug !== action.payload);
      });
  },
});

export default eventSlice.reducer;
