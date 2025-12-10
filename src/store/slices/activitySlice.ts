import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/apiService";
import { toast } from "react-toastify";
import type { Activity, ActivityCategory } from "../../models/activity";

interface ActivityState {
  data: Activity[];
  categories: ActivityCategory[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ActivityState = {
  data: [],
  categories: [],
  isLoading: false,
  error: null,
};


export const fetchActivitiesByEvent = createAsyncThunk(
  "activities/fetchByEvent",
  async (eventId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Activity[]>(
        `/activities/by-event/${eventId}`
      );
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchActivityCategories = createAsyncThunk(
  "activities/fetchCats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<ActivityCategory[]>(
        "/activity-categories"
      );
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);


export const createActivity = createAsyncThunk(
  "activities/create",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.post<Activity>("/activities", data);
      toast.success("Thêm hoạt động thành công");
      return response;
    } catch (err: any) {
      toast.error(err.message || "Lỗi tạo hoạt động");
      return rejectWithValue(err.message);
    }
  }
);

export const updateActivity = createAsyncThunk(
  "activities/update",
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.put<Activity>(
        `/activities/${id}`,
        data
      );
      toast.success("Cập nhật hoạt động thành công");
      return response;
    } catch (err: any) {
      toast.error("Lỗi cập nhật hoạt động");
      return rejectWithValue(err.message);
    }
  }
);

export const deleteActivity = createAsyncThunk(
  "activities/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.delete(`/activities/${id}`);
      toast.success("Đã xóa hoạt động");
      return id;
    } catch (err: any) {
      toast.error("Lỗi xóa hoạt động");
      return rejectWithValue(err.message);
    }
  }
);

const activitySlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    clearActivities: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivitiesByEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchActivitiesByEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchActivitiesByEvent.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchActivityCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })

      .addCase(createActivity.fulfilled, (state, action) => {
        state.data.push(action.payload);
        state.data.sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      })

      .addCase(updateActivity.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (a) => a.activityId === action.payload.activityId
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })

      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.data = state.data.filter((a) => a.activityId !== action.payload);
      });
  },
});

export const { clearActivities } = activitySlice.actions;
export default activitySlice.reducer;
