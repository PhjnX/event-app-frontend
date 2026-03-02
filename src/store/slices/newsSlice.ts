import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/apiService";
import { toast } from "react-toastify";

interface Post {
  id: number;
  languageCode?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  thumbnailUrl: string;
  status: string;
  createdAt: string;
  authorName?: string;
  viewCount?: number;
  translations?: any;
  alternateSlugs?: Record<string, string>;
}

export const fetchPublicPosts = createAsyncThunk(
  "news/fetchPublicPosts",
  async (
    { page, size, lang = "vi" }: { page: number; size: number; lang?: string },
    { rejectWithValue, signal },
  ) => {
    try {
      const response = await apiService.get(`/posts`, {
        params: { page, size, lang },
        signal,
      });
      return { response, lang };
    } catch (error: any) {
      if (error.name === "AbortError" || error.name === "CanceledError") {
        return rejectWithValue("aborted");
      }
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
      } catch (err) {
        console.warn("Chưa có bản dịch Tiếng Anh cho bài viết này");
      }

      const combinedData = {
        ...resVi,
        translations: {
          vi: {
            title: resVi.title || "",
            summary: resVi.summary || "",
            content: resVi.content || "{}",
            seoTitle: resVi.seoTitle || "",
            seoDescription: resVi.seoDescription || "",
          },
          en: {
            title: resEn.title || "",
            summary: resEn.summary || "",
            content: resEn.content || "{}",
            seoTitle: resEn.seoTitle || "",
            seoDescription: resEn.seoDescription || "",
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

    if (res.file && res.file.url) {
      return res.file.url;
    }

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
}

const initialState: NewsState = {
  data: [],
  dataLang: "",
  totalElements: 0,
  postDetail: null,
  loading: false,
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
      .addCase(fetchPublicPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPublicPosts.fulfilled, (state, action: any) => {
        state.loading = false;
        const { response, lang } = action.payload;
        state.data = response.content || response || [];
        state.dataLang = lang;
        state.totalElements = response.totalElements || 0;
      })
      .addCase(fetchPublicPosts.rejected, (state, action) => {
        if (action.payload === "aborted") return;
        state.loading = false;
      })

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

      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action: any) => {
        state.loading = false;
        state.data = action.payload.content || action.payload || [];
        state.totalElements = action.payload.totalElements || 0;
      })
      .addCase(fetchPosts.rejected, (state) => {
        state.loading = false;
      })

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

      .addCase(deletePost.fulfilled, (state, action) => {
        state.data = state.data.filter((item) => item.id !== action.payload);
        if (state.totalElements > 0) {
          state.totalElements -= 1;
        }
      });
  },
});

export const { clearPostDetail } = newsSlice.actions;
export default newsSlice.reducer;
