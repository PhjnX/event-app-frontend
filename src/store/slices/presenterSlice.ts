import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Presenter } from "../../models/presenter";
import apiService from "../../services/apiService";
import { toast } from "react-toastify";

export const fetchPresenters = createAsyncThunk(
  "presenters/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Presenter[]>("/presenters");
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPresenter = createAsyncThunk(
  "presenters/create",
  async (data: Partial<Presenter>, { rejectWithValue }) => {
    try {
      const response = await apiService.post<Presenter>("/presenters", data);
      toast.success("Thêm diễn giả thành công!");
      return response;
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi tạo");
      return rejectWithValue(error.message);
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
      toast.success("Cập nhật thành công!");
      return response;
    } catch (error: any) {
      toast.error("Lỗi cập nhật");
      return rejectWithValue(error.message);
    }
  }
);

export const deletePresenter = createAsyncThunk(
  "presenters/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.delete(`/presenters/${id}`);
      toast.success("Đã xóa diễn giả");
      return id;
    } catch (error: any) {
      toast.error("Không thể xóa diễn giả này");
      return rejectWithValue(error.message);
    }
  }
);

export const searchPresenters = createAsyncThunk(
  "presenters/search",
  async (keyword: string, { rejectWithValue }) => {
    try {
      // Backend tìm theo name, company, title
      const response = await apiService.get<Presenter[]>("/presenters/search", {
        params: { keyword }, // Tùy backend nhận param tên là gì (q, query, name...) check lại swagger
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

interface PresenterState {
  data: Presenter[];
  isLoading: boolean;
  error: any;
}

const initialState: PresenterState = {
  data: [],
  isLoading: false,
  error: null,
};

const presenterSlice = createSlice({
  name: "presenters",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPresenters.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPresenters.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.data = action.payload;
      })

      .addCase(createPresenter.fulfilled, (state, action: any) => {
        state.data.push(action.payload);
      })

      .addCase(updatePresenter.fulfilled, (state, action: any) => {
        const index = state.data.findIndex(
          (p) => p.presenterId === action.payload.presenterId
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })

      .addCase(deletePresenter.fulfilled, (state, action) => {
        state.data = state.data.filter((p) => p.presenterId !== action.payload);
      })

      .addCase(searchPresenters.fulfilled, (state, action: any) => {
        state.data = action.payload;
      });
  },
});

export default presenterSlice.reducer;
