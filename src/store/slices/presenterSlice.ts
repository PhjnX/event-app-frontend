import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/apiService";
import type { Presenter } from "../../models/presenter";
import { logoutUser } from "./auth"; 

interface PresenterState {
  data: Presenter[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PresenterState = {
  data: [],
  isLoading: false,
  error: null,
};

export const fetchPresenters = createAsyncThunk(
  "presenters/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Presenter[]>("/presenters");
      const list = Array.isArray(response)
        ? response
        : (response as any).content || [];
      return list;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchPresentersByOrganizer = createAsyncThunk(
  "presenters/fetchByOrganizer",
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Presenter[]>(
        `/presenters/by-organizer/${slug}`
      );
      return Array.isArray(response)
        ? response
        : (response as any).content || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateFeaturedList = createAsyncThunk(
  "presenters/updateFeaturedList",
  async (ids: number[], { rejectWithValue }) => {
    try {
      await apiService.put("/presenters/featured", ids);
      return ids;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deletePresenter = createAsyncThunk(
  "presenters/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.delete(`/presenters/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createPresenter = createAsyncThunk(
  "presenters/create",
  async (data: Partial<Presenter>, { rejectWithValue }) => {
    try {
      const response = await apiService.post<Presenter>("/presenters", data);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updatePresenter = createAsyncThunk(
  "presenters/update",
  async (
    { id, data }: { id: number; data: Partial<Presenter> },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiService.put<Presenter>(
        `/presenters/${id}`,
        data
      );
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const presenterSlice = createSlice({
  name: "presenters",
  initialState,
  reducers: {
    resetPresenterState: (state) => {
      state.data = []; 
      state.isLoading = true; 
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPresenters.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPresenters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchPresenters.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchPresentersByOrganizer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPresentersByOrganizer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchPresentersByOrganizer.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateFeaturedList.fulfilled, (state, action) => {
        const newFeaturedIds = action.payload;
        state.data.forEach((p) => {
          p.featured = newFeaturedIds.includes(p.presenterId);
        });
      })

      .addCase(deletePresenter.fulfilled, (state, action) => {
        state.data = state.data.filter(
          (item) => item.presenterId !== action.payload
        );
      })

      .addCase(createPresenter.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })

      .addCase(updatePresenter.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (item) => item.presenterId === action.payload.presenterId
        );
        if (index !== -1) state.data[index] = action.payload;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.data = [];
        state.isLoading = false;
        state.error = null;
      });
  },
});

// Export action resetPresenterState để component sử dụng
export const { resetPresenterState } = presenterSlice.actions;
export default presenterSlice.reducer;
