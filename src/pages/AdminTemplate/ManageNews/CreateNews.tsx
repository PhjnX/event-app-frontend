import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useCheckNavigate as useNavigate } from "@/utils/i18n-router";
import { type AppDispatch } from "@/store";
import { createPost, uploadImage } from "../../../store/slices/newsSlice";
import NewsEditor from "../_components/NewsEditor";
import {
  FaArrowLeft,
  FaCloudUploadAlt,
  FaImage,
  FaGlobe,
} from "react-icons/fa";

type LangCode = "vi" | "en";

export default function CreateNews() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<LangCode>("vi");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.vi.title ||
      !formData.vi.summary ||
      !thumbnailUrl ||
      !formData.vi.content
    ) {
      alert(
        "Vui lòng nhập đủ thông tin Tiếng Việt (Tiêu đề, Tóm tắt, Ảnh bìa, Nội dung)",
      );
      return;
    }

    setIsSubmitting(true);

    const payload = {
      thumbnailUrl,
      status: "PUBLISHED",
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

    await dispatch(createPost(payload));
    setIsSubmitting(false);
    navigate("/admin/news");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-20">
      <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate("/admin/news")}
          className="flex items-center gap-2 text-gray-400 hover:text-[#D8C97B] transition-colors"
        >
          <FaArrowLeft /> Quay lại danh sách
        </button>

        {/* TAB SWITCHER */}
        <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setActiveTab("vi")}
            className={`px-6 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === "vi"
                ? "bg-[#D8C97B] text-black shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FaGlobe /> Tiếng Việt
          </button>
          <button
            onClick={() => setActiveTab("en")}
            className={`px-6 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === "en"
                ? "bg-[#D8C97B] text-black shadow-md"
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
              className="w-full bg-transparent text-3xl font-bold text-white placeholder-gray-600 focus:outline-none border-b border-gray-700 focus:border-[#D8C97B] transition-colors pb-2"
              value={formData[activeTab].title}
              onChange={(e) =>
                handleInputChange(activeTab, "title", e.target.value)
              }
              placeholder="Nhập tiêu đề bài viết..."
            />
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-lg overflow-hidden">
            <div className="bg-[#252525] px-6 py-3 border-b border-gray-700">
              <span className="text-[#D8C97B] font-semibold text-sm uppercase tracking-wide">
                Nội dung chi tiết ({activeTab.toUpperCase()})
              </span>
            </div>
            {/* FIX: Bỏ class hidden, dùng opacity và position để ẩn ngầm Editor */}
            <div className="bg-white min-h-[500px] text-black relative">
              <div
                className={`w-full h-full p-6 transition-opacity duration-200 ${
                  activeTab === "vi"
                    ? "opacity-100 relative z-10"
                    : "opacity-0 absolute inset-0 pointer-events-none -z-10"
                }`}
              >
                <NewsEditor
                  holder="editor-create-vi"
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
                  holder="editor-create-en"
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
              Thông tin đăng bài ({activeTab.toUpperCase()})
            </h3>

            <div className="space-y-4">
              {/* TÓM TẮT ĐỔI THEO NGÔN NGỮ */}
              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">
                  Tóm tắt ngắn
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-[#111] border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:border-[#D8C97B] focus:outline-none transition-colors"
                  value={formData[activeTab].summary}
                  onChange={(e) =>
                    handleInputChange(activeTab, "summary", e.target.value)
                  }
                  placeholder="Mô tả ngắn hiển thị ở preview..."
                />
              </div>

              {/* THUMBNAIL DÙNG CHUNG */}
              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">
                  Ảnh bìa (Dùng chung)
                </label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-[#D8C97B] transition-colors bg-[#111] relative group">
                  <input
                    type="file"
                    onChange={handleThumbUpload}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                  />
                  {uploading ? (
                    <p className="text-[#D8C97B] text-sm animate-pulse">
                      Đang tải ảnh...
                    </p>
                  ) : thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-md shadow-sm"
                    />
                  ) : (
                    <div className="py-4">
                      <FaImage className="mx-auto text-gray-500 text-2xl mb-2 group-hover:text-[#D8C97B]" />
                      <p className="text-gray-500 text-xs">
                        Click hoặc kéo thả ảnh
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4 mt-4">
                <h4 className="text-sm font-bold text-[#D8C97B] mb-3">
                  Cấu hình SEO
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
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-[#D8C97B] hover:bg-[#c4b56a] text-black font-bold py-3 rounded-lg shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <FaCloudUploadAlt /> Xuất bản bài viết
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
