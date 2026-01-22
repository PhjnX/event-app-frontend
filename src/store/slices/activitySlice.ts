import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/apiService";
import type { Activity, ActivityCategory } from "../../models/activity";
import { logoutUser } from "./auth";

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
      return response;
    } catch (err: any) {
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
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteActivity = createAsyncThunk(
  "activities/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.delete(`/activities/${id}`);
      return id;
    } catch (err: any) {
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
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.data = [];
        state.categories = [];
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const {} = activitySlice.actions;
export default activitySlice.reducer;
