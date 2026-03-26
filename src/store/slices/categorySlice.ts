import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/apiService";

export interface CategoryTranslation {
  name: string;
  slug?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface Category {
  id: number;
  slug: string;
  languageCode?: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  parent?: { id: number; slug: string; name?: string } | null;
  children?: Category[] | null;
  translations?: Record<string, CategoryTranslation>;
  createdAt?: string;
  updatedAt?: string;
}

// ─── slug giờ nằm bên trong từng translation theo API mới ─────────────────────
export interface CategoryRequestDTO {
  displayOrder?: number | null;
  isActive?: boolean | null;
  parentId?: number | null;
  translations: {
    vi: {
      slug?: string | null;
      name: string;
      seoTitle?: string | null;
      seoDescription?: string | null;
    };
    en?: {
      slug?: string | null;
      name?: string;
      seoTitle?: string | null;
      seoDescription?: string | null;
    };
  };
}

// ─── Public ───────────────────────────────────────────────────────────────────
export const fetchPublicCategories = createAsyncThunk(
  "categories/fetchPublic",
  async (lang: string = "vi", { rejectWithValue }) => {
    try {
      const response = await apiService.get("/categories", {
        params: { lang },
      });
      return { data: response, lang };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// ─── Admin: lấy tất cả ────────────────────────────────────────────────────────
export const fetchAdminCategories = createAsyncThunk(
  "categories/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get("/admin/categories");
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// ─── Admin: lấy chi tiết 1 category theo ID ──────────────────────────────────
export const fetchCategoryById = createAsyncThunk(
  "categories/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/admin/categories/${id}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// ─── Admin: tạo mới ───────────────────────────────────────────────────────────
export const createCategory = createAsyncThunk(
  "categories/create",
  async (data: CategoryRequestDTO, { rejectWithValue }) => {
    try {
      const response = await apiService.post("/admin/categories", data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// ─── Admin: cập nhật ─────────────────────────────────────────────────────────
export const updateCategory = createAsyncThunk(
  "categories/update",
  async (
    { id, data }: { id: number; data: CategoryRequestDTO },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiService.put(`/admin/categories/${id}`, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// ─── Admin: xóa ──────────────────────────────────────────────────────────────
export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.delete(`/admin/categories/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

interface CategoryState {
  publicList: Category[];
  adminList: Category[];
  categoryDetail: Category | null;
  publicLang: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  publicList: [],
  adminList: [],
  categoryDetail: null,
  publicLang: "",
  loading: false,
  saving: false,
  error: null,
};

// ─── Helper: flatten cây thành mảng phẳng ────────────────────────────────────
const flattenCategories = (items: Category[]): Category[] => {
  const flat: Category[] = [];
  const traverse = (list: Category[]) => {
    list?.forEach((item) => {
      flat.push(item);
      if (item.children?.length) traverse(item.children);
    });
  };
  traverse(items);
  return flat;
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategoryDetail(state) {
      state.categoryDetail = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPublicCategories.fulfilled, (state, action: any) => {
        state.loading = false;
        state.publicList = action.payload.data || [];
        state.publicLang = action.payload.lang;
      })
      .addCase(fetchPublicCategories.rejected, (state) => {
        state.loading = false;
      })

      .addCase(fetchAdminCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminCategories.fulfilled, (state, action: any) => {
        state.loading = false;
        state.adminList = flattenCategories(action.payload || []);
      })
      .addCase(fetchAdminCategories.rejected, (state) => {
        state.loading = false;
      })

      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.categoryDetail = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action: any) => {
        state.loading = false;
        state.categoryDetail = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createCategory.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createCategory.rejected, (state, action: any) => {
        state.saving = false;
        state.error = action.payload as string;
      })

      .addCase(updateCategory.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(updateCategory.rejected, (state, action: any) => {
        state.saving = false;
        state.error = action.payload as string;
      })

      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.adminList = state.adminList.filter(
          (c) => c.id !== action.payload,
        );
      })
      .addCase(deleteCategory.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCategoryDetail, clearError } = categorySlice.actions;
export default categorySlice.reducer;

// ─── Helper: lấy tên category theo ngôn ngữ ──────────────────────────────────
export const getCategoryName = (
  cat: Category | undefined,
  lang: string = "vi",
): string => {
  if (!cat) return "";
  if (cat.translations) {
    return (
      cat.translations[lang]?.name ||
      cat.translations["vi"]?.name ||
      cat.name ||
      ""
    );
  }
  return cat.name || "";
};
