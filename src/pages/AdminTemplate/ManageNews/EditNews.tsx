import React, { useEffect, useState, useRef } from "react";
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
import {
  FaArrowLeft,
  FaSave,
  FaSpinner,
  FaGlobe,
  FaTags,
  FaKey,
  FaTimes,
} from "react-icons/fa";

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

  // Tag input state
  const [tagInputVi, setTagInputVi] = useState("");
  const [tagInputEn, setTagInputEn] = useState("");
  const tagInputViRef = useRef<HTMLInputElement>(null);
  const tagInputEnRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    vi: {
      title: "",
      summary: "",
      content: null as any,
      seoTitle: "",
      seoDescription: "",
      focusKeyword: "",
      tags: [] as string[],
    },
    en: {
      title: "",
      summary: "",
      content: null as any,
      seoTitle: "",
      seoDescription: "",
      focusKeyword: "",
      tags: [] as string[],
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
      const finalVi = transVi.title ? transVi : postDetail;
      const transEn = getTranslation("en");

      setFormData({
        vi: {
          title: finalVi.title || "",
          summary: finalVi.summary || "",
          seoTitle: finalVi.seoTitle || "",
          seoDescription: finalVi.seoDescription || "",
          focusKeyword: finalVi.focusKeyword || "",
          tags: parseTags(finalVi.tags),
          content: parseContent(finalVi.content),
        },
        en: {
          title: transEn.title || "",
          summary: transEn.summary || "",
          seoTitle: transEn.seoTitle || "",
          seoDescription: transEn.seoDescription || "",
          focusKeyword: transEn.focusKeyword || "",
          tags: parseTags(transEn.tags),
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

  const handleTagKeyDown = (
    lang: LangCode,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const input = lang === "vi" ? tagInputVi : tagInputEn;
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(lang, input);
    } else if (
      e.key === "Backspace" &&
      input === "" &&
      formData[lang].tags.length > 0
    ) {
      removeTag(lang, formData[lang].tags.length - 1);
    }
  };

  const addTag = (lang: LangCode, value: string) => {
    const trimmed = value.trim().replace(/,/g, "");
    if (!trimmed) return;
    if (formData[lang].tags.includes(trimmed)) return;
    if (formData[lang].tags.length >= 5) return;

    handleInputChange(lang, "tags", [...formData[lang].tags, trimmed]);
    if (lang === "vi") setTagInputVi("");
    else setTagInputEn("");
  };

  const removeTag = (lang: LangCode, index: number) => {
    const newTags = formData[lang].tags.filter((_, i) => i !== index);
    handleInputChange(lang, "tags", newTags);
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
          focusKeyword: formData.vi.focusKeyword || null,
          tags: formData.vi.tags.length > 0 ? formData.vi.tags : [],
          content: formData.vi.content
            ? JSON.stringify(formData.vi.content)
            : "{}",
        },
        en: {
          title: formData.en.title,
          summary: formData.en.summary,
          seoTitle: formData.en.seoTitle,
          seoDescription: formData.en.seoDescription,
          focusKeyword: formData.en.focusKeyword || null,
          tags: formData.en.tags.length > 0 ? formData.en.tags : [],
          content: formData.en.content
            ? JSON.stringify(formData.en.content)
            : "{}",
        },
      },
    };

    await dispatch(updatePost({ id: Number(id), data: payload }));
    navigate("/admin/news");
  };

  const analyzeSeo = (lang: LangCode) => {
    const { focusKeyword, title, seoTitle, seoDescription, summary } =
      formData[lang];
    if (!focusKeyword.trim()) return null;
    const kw = focusKeyword.toLowerCase();
    return {
      inTitle: title.toLowerCase().includes(kw),
      inSeoTitle: seoTitle.toLowerCase().includes(kw),
      inSeoDescription: seoDescription.toLowerCase().includes(kw),
      inSummary: summary.toLowerCase().includes(kw),
    };
  };

  const seoAnalysis = analyzeSeo(activeTab);
  const tagInput = activeTab === "vi" ? tagInputVi : tagInputEn;
  const setTagInput = activeTab === "vi" ? setTagInputVi : setTagInputEn;
  const tagInputRef = activeTab === "vi" ? tagInputViRef : tagInputEnRef;

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
            <div className="bg-white min-h-125 text-black relative">
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
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg sticky top-6 space-y-5">
            <h3 className="text-[#D8C97B] font-bold text-lg border-b border-gray-700 pb-2">
              Thông tin chung
            </h3>

            <div>
              <label className="block text-gray-400 text-sm mb-2 font-medium">
                Tóm tắt ({activeTab.toUpperCase()})
              </label>
              <textarea
                rows={4}
                className="w-full bg-[#111] border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:border-[#D8C97B] focus:outline-none"
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

            <div className="border-t border-gray-800 pt-4">
              <h4 className="text-sm font-bold text-[#D8C97B] mb-3">
                SEO ({activeTab.toUpperCase()})
              </h4>
              <div className="mb-3">
                <label className="block text-gray-400 text-xs mb-1 items-center gap-1">
                  <FaKey className="text-[#D8C97B]" /> Từ khóa chính (Focus
                  Keyword)
                </label>
                <input
                  className="w-full bg-[#111] border border-gray-700 rounded-lg p-2 text-sm text-gray-200 focus:border-[#D8C97B] focus:outline-none transition-colors"
                  value={formData[activeTab].focusKeyword}
                  onChange={(e) =>
                    handleInputChange(activeTab, "focusKeyword", e.target.value)
                  }
                  placeholder="VD: tổ chức sự kiện hybrid"
                  maxLength={255}
                />

                {seoAnalysis && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500 mb-1">
                      Phân tích từ khóa:
                    </p>
                    {[
                      { label: "Có trong Tiêu đề", ok: seoAnalysis.inTitle },
                      {
                        label: "Có trong SEO Title",
                        ok: seoAnalysis.inSeoTitle,
                      },
                      {
                        label: "Có trong SEO Description",
                        ok: seoAnalysis.inSeoDescription,
                      },
                      { label: "Có trong Tóm tắt", ok: seoAnalysis.inSummary },
                    ].map(({ label, ok }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${ok ? "bg-green-500" : "bg-gray-600"}`}
                        />
                        <span
                          className={`text-xs ${ok ? "text-green-400" : "text-gray-500"}`}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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

            <div className="border-t border-gray-800 pt-4">
              <h4 className="text-sm font-bold text-[#D8C97B] mb-1 flex items-center gap-2">
                <FaTags /> Tags / Hashtag ({activeTab.toUpperCase()})
              </h4>
              <p className="text-gray-500 text-xs mb-3">
                Tối đa 5 tags. Nhấn Enter hoặc dấu phẩy để thêm.
              </p>

              <div
                className="min-h-11 bg-[#111] border border-gray-700 rounded-lg p-2 flex flex-wrap gap-2 cursor-text focus-within:border-[#D8C97B] transition-colors"
                onClick={() => tagInputRef.current?.focus()}
              >
                {formData[activeTab].tags.map((tag, index) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 bg-[#D8C97B]/20 text-[#D8C97B] text-xs px-2 py-1 rounded-md border border-[#D8C97B]/30"
                  >
                    #{tag}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTag(activeTab, index);
                      }}
                      className="hover:text-white transition-colors ml-1"
                    >
                      <FaTimes size={10} />
                    </button>
                  </span>
                ))}
                {formData[activeTab].tags.length < 5 && (
                  <input
                    ref={tagInputRef}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => handleTagKeyDown(activeTab, e)}
                    onBlur={() => addTag(activeTab, tagInput)}
                    className="flex-1 min-w-20 bg-transparent text-sm text-gray-200 focus:outline-none placeholder-gray-600"
                    placeholder={
                      formData[activeTab].tags.length === 0 ? "Nhập tag..." : ""
                    }
                  />
                )}
              </div>
              <p className="text-gray-600 text-xs mt-1">
                {formData[activeTab].tags.length}/5 tags
              </p>
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
  );
}
