import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/apiService";
import { toast } from "react-toastify";
import type { RootState } from "..";

interface Post {
  id: number;
  languageCode?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  tags?: string[];
  thumbnailUrl: string;
  status: string;
  createdAt: string;
  authorName?: string;
  viewCount?: number;
  translations?: any;
  alternateSlugs?: Record<string, string>;
  categoryId?: number | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  isFeatured?: boolean;
}

// ─── Helper: normalize field "featured" → "isFeatured" ───────────────────────
// Backend trả về field tên là "featured", frontend dùng "isFeatured"
// Hàm này đảm bảo cả 2 đều được map đúng
const normalizePost = (item: any): any => {
  if (!item) return item;
  return {
    ...item,
    isFeatured: item.isFeatured ?? item.featured ?? false,
  };
};

// ─── Public ───────────────────────────────────────────────────────────────────
export const fetchPublicPosts = createAsyncThunk(
  "news/fetchPublicPosts",
  async (
    {
      page,
      size,
      lang = "vi",
      categoryId,
    }: { page: number; size: number; lang?: string; categoryId?: number },
    { rejectWithValue, signal },
  ) => {
    try {
      const params: any = { page, size, lang };
      if (categoryId) params.categoryId = categoryId;
      const response = await apiService.get(`/posts`, { params, signal });
      return { response, lang };
    } catch (error: any) {
      if (error.name === "AbortError" || error.name === "CanceledError") {
        return rejectWithValue("aborted");
      }
      return rejectWithValue(error.message);
    }
  },
);

// ─── Admin: dùng cho ManageNews ───────────────────────────────────────────────
export const fetchAdminPosts = createAsyncThunk(
  "news/fetchAdminPosts",
  async (
    { page, size, lang = "vi" }: { page: number; size: number; lang?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiService.get(`/admin/posts`, {
        params: { page, size, lang },
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchPostBySlug = createAsyncThunk(
  "news/fetchPostBySlug",
  async (
    { slug, lang = "vi" }: { slug: string; lang?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiService.get(`/posts/${slug}`, {
        params: { lang },
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// ─── Backward compat ──────────────────────────────────────────────────────────
export const fetchPosts = createAsyncThunk(
  "news/fetchPosts",
  async (
    { page, size, lang = "vi" }: { page: number; size: number; lang?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiService.get(`/posts`, {
        params: { page, size, lang },
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchPostDetailAdmin = createAsyncThunk(
  "news/fetchDetailAdmin",
  async (id: number, { rejectWithValue }) => {
    try {
      const resVi: any = await apiService.get(`/admin/posts/${id}?lang=vi`);

      let resEn: any = {};
      try {
        resEn = await apiService.get(`/admin/posts/${id}?lang=en`);
      } catch {
        console.warn("Chưa có bản dịch Tiếng Anh cho bài viết này");
      }

      const parseTags = (tags: any): string[] => {
        if (!tags) return [];
        if (Array.isArray(tags)) return tags;
        try {
          const parsed = JSON.parse(tags);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      };

      const normalizeCategoryId = (raw: any): number | null => {
        if (raw === null || raw === undefined) return null;
        if (typeof raw === "number") return raw;
        if (typeof raw === "object" && raw.id) return Number(raw.id);
        return null;
      };

      const combinedData = {
        ...resVi,
        categoryId: normalizeCategoryId(resVi.categoryId),
        categorySlug: resVi.categorySlug ?? resVi.category?.slug ?? null,
        categoryName: resVi.categoryName ?? resVi.category?.name ?? null,
        // Normalize featured field ở đây luôn
        isFeatured: resVi.isFeatured ?? resVi.featured ?? false,
        translations: {
          vi: {
            title: resVi.title || "",
            summary: resVi.summary || "",
            content: resVi.content || "{}",
            seoTitle: resVi.seoTitle || "",
            seoDescription: resVi.seoDescription || "",
            focusKeyword: resVi.focusKeyword || "",
            tags: parseTags(resVi.tags),
          },
          en: {
            title: resEn.title || "",
            summary: resEn.summary || "",
            content: resEn.content || "{}",
            seoTitle: resEn.seoTitle || "",
            seoDescription: resEn.seoDescription || "",
            focusKeyword: resEn.focusKeyword || "",
            tags: parseTags(resEn.tags),
          },
        },
      };

      return combinedData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const createPost = createAsyncThunk(
  "news/createPost",
  async (data: Partial<Post> | any, { rejectWithValue }) => {
    try {
      const response = await apiService.post("/admin/posts", data);
      toast.success("Tạo tin tức thành công!");
      return response;
    } catch (error: any) {
      toast.error("Lỗi tạo tin tức");
      return rejectWithValue(error.message);
    }
  },
);

export const updatePost = createAsyncThunk(
  "news/updatePost",
  async (
    { id, data }: { id: number; data: Partial<Post> | any },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiService.put(`/admin/posts/${id}`, data);
      toast.success("Cập nhật thành công!");
      return response;
    } catch (error: any) {
      toast.error("Lỗi cập nhật");
      return rejectWithValue(error.message);
    }
  },
);

export const deletePost = createAsyncThunk(
  "news/deletePost",
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.delete(`/admin/posts/${id}`);
      toast.success("Đã xóa bài viết");
      return id;
    } catch (error: any) {
      toast.error("Lỗi xóa bài viết");
      return rejectWithValue(error.message);
    }
  },
);

// ─── Featured: thêm bài viết vào nổi bật ─────────────────────────────────────
// PUT /admin/posts/featured  body: { postIds: [id] }
export const addPostToFeatured = createAsyncThunk(
  "news/addPostToFeatured",
  async (postId: number, { rejectWithValue, getState }) => {
    try {
      // Lấy tất cả ID đang featured trong state hiện tại
      const state = getState() as RootState;
      const currentFeaturedIds = state.news.data
        .filter((p) => p.isFeatured && p.id !== postId) // tránh trùng
        .map((p) => p.id);

      // Gửi cả danh sách cũ + bài mới
      await apiService.put("/admin/posts/featured", {
        postIds: [...currentFeaturedIds, postId],
      });

      toast.success("Đã đưa bài viết lên nổi bật!");
      return postId;
    } catch (error: any) {
      toast.error("Lỗi khi đưa bài viết lên nổi bật");
      return rejectWithValue(error.message);
    }
  },
);

// ─── Featured: gỡ bài viết khỏi nổi bật ─────────────────────────────────────
// DELETE /admin/posts/featured/{postId}
export const removePostFromFeatured = createAsyncThunk(
  "news/removePostFromFeatured",
  async (postId: number, { rejectWithValue }) => {
    try {
      await apiService.delete(`/admin/posts/featured/${postId}`);
      toast.success("Đã gỡ bài viết khỏi nổi bật");
      return postId;
    } catch (error: any) {
      toast.error("Lỗi khi gỡ bài viết khỏi nổi bật");
      return rejectWithValue(error.message);
    }
  },
);

export const uploadImage = async (file: File): Promise<string> => {
  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  if (file.size > MAX_SIZE_BYTES) {
    const errorMsg = `Ảnh quá lớn! Vui lòng chọn ảnh dưới ${MAX_SIZE_MB}MB.`;
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res: any = await apiService.post(
      "/admin/posts/upload-image",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      },
    );

    if (res.file && res.file.url) return res.file.url;
    if (typeof res === "string") return res;
    if (res.url) return res.url;
    if (res.link && typeof res.link === "string") return res.link;
    if (res.data) return res.data;

    throw new Error("Không lấy được link ảnh (Cấu trúc không khớp)");
  } catch (error: any) {
    const isClientValidationError = error.message.includes("Ảnh quá lớn!");
    if (!isClientValidationError) {
      if (error.response) {
        if (error.response.status === 413) {
          toast.error("Ảnh quá nặng, server từ chối nhận!");
        } else if (error.response.status === 500) {
          toast.error("Lỗi Server! Có thể do định dạng ảnh không hỗ trợ.");
        } else {
          toast.error(
            `Lỗi upload: ${error.response.statusText || "Không xác định"}`,
          );
        }
      } else if (error.code === "ERR_NETWORK") {
        toast.error("Lỗi kết nối! Vui lòng kiểm tra mạng.");
      } else {
        toast.error("Có lỗi xảy ra khi tải ảnh lên.");
      }
    }
    throw error;
  }
};

interface NewsState {
  data: Post[];
  dataLang: string;
  totalElements: number;
  postDetail: Post | null;
  loading: boolean;
  featuredLoading: Record<number, boolean>;
}

const initialState: NewsState = {
  data: [],
  dataLang: "",
  totalElements: 0,
  postDetail: null,
  loading: false,
  featuredLoading: {},
};

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    clearPostDetail: (state) => {
      state.postDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchPublicPosts ──────────────────────────────────────────────────
      .addCase(fetchPublicPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPublicPosts.fulfilled, (state, action: any) => {
        state.loading = false;
        const { response, lang } = action.payload;
        const rawData = response?.content || response || [];
        // FIX: dùng normalizePost để map "featured" → "isFeatured"
        state.data = Array.isArray(rawData)
          ? rawData
              .filter((item: any) => item !== null && item !== undefined)
              .map(normalizePost)
          : [];
        state.dataLang = lang;
        state.totalElements = response.totalElements || 0;
      })
      .addCase(fetchPublicPosts.rejected, (state, action) => {
        if (action.payload === "aborted") return;
        state.loading = false;
      })

      // ── fetchAdminPosts ───────────────────────────────────────────────────
      .addCase(fetchAdminPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminPosts.fulfilled, (state, action: any) => {
        state.loading = false;
        const rawData = action.payload?.content || action.payload || [];
        // FIX: dùng normalizePost để map "featured" → "isFeatured"
        state.data = Array.isArray(rawData)
          ? rawData
              .filter((item: any) => item !== null && item !== undefined)
              .map(normalizePost)
          : [];
        state.totalElements = action.payload?.totalElements || 0;
      })
      .addCase(fetchAdminPosts.rejected, (state) => {
        state.loading = false;
      })

      // ── fetchPosts (backward compat) ──────────────────────────────────────
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action: any) => {
        state.loading = false;
        const rawData = action.payload?.content || action.payload || [];
        // FIX: dùng normalizePost để map "featured" → "isFeatured"
        state.data = Array.isArray(rawData)
          ? rawData
              .filter((item: any) => item !== null && item !== undefined)
              .map(normalizePost)
          : [];
        state.totalElements = action.payload?.totalElements || 0;
      })
      .addCase(fetchPosts.rejected, (state) => {
        state.loading = false;
      })

      // ── fetchPostBySlug ───────────────────────────────────────────────────
      .addCase(fetchPostBySlug.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostBySlug.fulfilled, (state, action: any) => {
        state.loading = false;
        state.postDetail = action.payload;
      })
      .addCase(fetchPostBySlug.rejected, (state) => {
        state.loading = false;
      })

      // ── fetchPostDetailAdmin ──────────────────────────────────────────────
      .addCase(fetchPostDetailAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostDetailAdmin.fulfilled, (state, action: any) => {
        state.loading = false;
        state.postDetail = action.payload;
      })
      .addCase(fetchPostDetailAdmin.rejected, (state) => {
        state.loading = false;
      })

      // ── deletePost ────────────────────────────────────────────────────────
      .addCase(deletePost.fulfilled, (state, action) => {
        state.data = state.data.filter((item) => item.id !== action.payload);
        if (state.totalElements > 0) state.totalElements -= 1;
      })

      // ── addPostToFeatured ─────────────────────────────────────────────────
      .addCase(addPostToFeatured.pending, (state, action) => {
        state.featuredLoading[action.meta.arg] = true;
      })
      .addCase(addPostToFeatured.fulfilled, (state, action) => {
        delete state.featuredLoading[action.payload];
        const post = state.data.find((p) => p.id === action.payload);
        if (post) post.isFeatured = true;
      })
      .addCase(addPostToFeatured.rejected, (state, action) => {
        delete state.featuredLoading[action.meta.arg];
      })

      // ── removePostFromFeatured ────────────────────────────────────────────
      .addCase(removePostFromFeatured.pending, (state, action) => {
        state.featuredLoading[action.meta.arg] = true;
      })
      .addCase(removePostFromFeatured.fulfilled, (state, action) => {
        delete state.featuredLoading[action.payload];
        const post = state.data.find((p) => p.id === action.payload);
        if (post) post.isFeatured = false;
      })
      .addCase(removePostFromFeatured.rejected, (state, action) => {
        delete state.featuredLoading[action.meta.arg];
      });
  },
});

export const { clearPostDetail } = newsSlice.actions;
export default newsSlice.reducer;
