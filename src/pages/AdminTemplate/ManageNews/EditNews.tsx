import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { type AppDispatch, type RootState } from "../../../store";
import {
  fetchPostDetailAdmin,
  updatePost,
  uploadImage,
  clearPostDetail,
} from "../../../store/slices/newsSlice";
import NewsEditor from "../_components/NewsEditor";
import { FaArrowLeft, FaSave, FaSpinner, FaGlobe } from "react-icons/fa";

type LangCode = "vi" | "en";

export default function EditNews() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { postDetail } = useSelector((state: RootState) => state.news);

  const [activeTab, setActiveTab] = useState<LangCode>("vi");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [readyToRenderEditor, setReadyToRenderEditor] = useState(false);

  const [formData, setFormData] = useState({
    vi: {
      title: "",
      summary: "",
      content: null as any,
      seoTitle: "",
      seoDescription: "",
    },
    en: {
      title: "",
      summary: "",
      content: null as any,
      seoTitle: "",
      seoDescription: "",
    },
  });

  useEffect(() => {
    if (id) dispatch(fetchPostDetailAdmin(Number(id)));
    return () => {
      dispatch(clearPostDetail());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (postDetail) {
      setThumbnailUrl(postDetail.thumbnailUrl || "");

      const parseContent = (str: string | undefined) => {
        if (!str || str.trim() === "") return {};
        try {
          return JSON.parse(str);
        } catch (e) {
          console.error(e);
          return {};
        }
      };

      // FIX: Hàm lấy dữ liệu an toàn tương thích cả Object và Array từ API
      const getTranslation = (langCode: string) => {
        if (!postDetail.translations) return {};
        if (Array.isArray(postDetail.translations)) {
          return (
            postDetail.translations.find(
              (t: any) => t.lang === langCode || t.language === langCode,
            ) || {}
          );
        }
        return postDetail.translations[langCode] || {};
      };

      const transVi = getTranslation("vi");
      const finalVi = transVi.title ? transVi : postDetail; // Fallback nếu translations.vi rỗng
      const transEn = getTranslation("en");

      setFormData({
        vi: {
          title: finalVi.title || "",
          summary: finalVi.summary || "",
          seoTitle: finalVi.seoTitle || "",
          seoDescription: finalVi.seoDescription || "",
          content: parseContent(finalVi.content),
        },
        en: {
          title: transEn.title || "",
          summary: transEn.summary || "",
          seoTitle: transEn.seoTitle || "",
          seoDescription: transEn.seoDescription || "",
          content: parseContent(transEn.content),
        },
      });

      setReadyToRenderEditor(true);
    }
  }, [postDetail]);

  const handleInputChange = (lang: LangCode, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));
  };

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setThumbnailUrl(url);
      } catch (_err) {
        alert("Upload ảnh thất bại!");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleUpdate = async () => {
    if (!id) return;
    if (!formData.vi.title.trim()) {
      alert("Tiêu đề tiếng Việt không được để trống");
      return;
    }

    const payload = {
      thumbnailUrl,
      status: postDetail?.status || "PUBLISHED",
      translations: {
        vi: {
          title: formData.vi.title,
          summary: formData.vi.summary,
          seoTitle: formData.vi.seoTitle,
          seoDescription: formData.vi.seoDescription,
          content: formData.vi.content
            ? JSON.stringify(formData.vi.content)
            : "{}",
        },
        en: {
          title: formData.en.title,
          summary: formData.en.summary,
          seoTitle: formData.en.seoTitle,
          seoDescription: formData.en.seoDescription,
          content: formData.en.content
            ? JSON.stringify(formData.en.content)
            : "{}",
        },
      },
    };

    await dispatch(updatePost({ id: Number(id), data: payload }));
    navigate("/admin/news");
  };

  if (!readyToRenderEditor) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-[#D8C97B]">
        <FaSpinner className="animate-spin text-4xl mb-4" />
        <p className="animate-pulse text-xl">Đang tải dữ liệu bài viết...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-20">
      <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate("/admin/news")}
          className="flex items-center gap-2 text-gray-400 hover:text-[#D8C97B] transition-colors"
        >
          <FaArrowLeft /> Hủy bỏ
        </button>

        <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setActiveTab("vi")}
            className={`px-6 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === "vi"
                ? "bg-[#D8C97B] text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FaGlobe /> Tiếng Việt
          </button>
          <button
            onClick={() => setActiveTab("en")}
            className={`px-6 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === "en"
                ? "bg-[#D8C97B] text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FaGlobe /> English
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
            <label className="text-[#D8C97B] text-xs uppercase font-bold tracking-wider mb-2 block">
              Tiêu đề bài viết ({activeTab.toUpperCase()})
            </label>
            <input
              className="w-full bg-transparent text-2xl font-bold text-white placeholder-gray-600 focus:outline-none border-b border-gray-700 focus:border-[#D8C97B] transition-colors pb-2"
              value={formData[activeTab].title}
              onChange={(e) =>
                handleInputChange(activeTab, "title", e.target.value)
              }
            />
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-lg overflow-hidden">
            <div className="bg-[#252525] px-6 py-3 border-b border-gray-700">
              <span className="text-[#D8C97B] font-semibold text-sm uppercase">
                Nội dung ({activeTab.toUpperCase()})
              </span>
            </div>
            {/* FIX: Bỏ class hidden, dùng opacity để ẩn Editor */}
            <div className="bg-white min-h-[500px] text-black relative">
              <div
                className={`w-full h-full p-6 transition-opacity duration-200 ${
                  activeTab === "vi"
                    ? "opacity-100 relative z-10"
                    : "opacity-0 absolute inset-0 pointer-events-none -z-10"
                }`}
              >
                <NewsEditor
                  key={`vi-${id}`}
                  holder="editor-edit-vi"
                  data={formData.vi.content}
                  onChange={(data: any) =>
                    handleInputChange("vi", "content", data)
                  }
                />
              </div>
              <div
                className={`w-full h-full p-6 transition-opacity duration-200 ${
                  activeTab === "en"
                    ? "opacity-100 relative z-10"
                    : "opacity-0 absolute inset-0 pointer-events-none -z-10"
                }`}
              >
                <NewsEditor
                  key={`en-${id}`}
                  holder="editor-edit-en"
                  data={formData.en.content}
                  onChange={(data: any) =>
                    handleInputChange("en", "content", data)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg sticky top-6">
            <h3 className="text-[#D8C97B] font-bold text-lg mb-4 border-b border-gray-700 pb-2">
              Thông tin chung
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">
                  Tóm tắt ({activeTab.toUpperCase()})
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-[#111] border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:border-[#D8C97B]"
                  value={formData[activeTab].summary}
                  onChange={(e) =>
                    handleInputChange(activeTab, "summary", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">
                  Ảnh đại diện (Dùng chung)
                </label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-2 text-center hover:border-[#D8C97B] bg-[#111] relative group overflow-hidden">
                  <input
                    type="file"
                    onChange={handleThumbUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {uploading ? (
                    <div className="py-8">
                      <FaSpinner className="animate-spin text-[#D8C97B] mx-auto" />
                    </div>
                  ) : thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-md"
                    />
                  ) : (
                    <div className="py-8">
                      <p className="text-gray-500 text-sm">Upload ảnh mới</p>
                    </div>
                  )}
                </div>
              </div>

              {/* SEO FIELDS */}
              <div className="border-t border-gray-800 pt-4">
                <h4 className="text-sm font-bold text-[#D8C97B] mb-3">
                  SEO ({activeTab.toUpperCase()})
                </h4>
                <div className="mb-3">
                  <label className="block text-gray-400 text-xs mb-1">
                    SEO Title
                  </label>
                  <input
                    className="w-full bg-[#111] border border-gray-700 rounded-lg p-2 text-sm text-gray-200 focus:border-[#D8C97B] focus:outline-none"
                    value={formData[activeTab].seoTitle}
                    onChange={(e) =>
                      handleInputChange(activeTab, "seoTitle", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">
                    SEO Description
                  </label>
                  <textarea
                    rows={2}
                    className="w-full bg-[#111] border border-gray-700 rounded-lg p-2 text-sm text-gray-200 focus:border-[#D8C97B] focus:outline-none"
                    value={formData[activeTab].seoDescription}
                    onChange={(e) =>
                      handleInputChange(
                        activeTab,
                        "seoDescription",
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>

              <button
                onClick={handleUpdate}
                className="w-full bg-[#D8C97B] hover:bg-[#c4b56a] text-black font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2 mt-2"
              >
                <FaSave /> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
