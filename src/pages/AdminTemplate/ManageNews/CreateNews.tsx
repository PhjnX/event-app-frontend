import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { type AppDispatch } from "@/store";
import { createPost, uploadImage } from "../../../store/slices/newsSlice";
import NewsEditor from "../_components/NewsEditor";
import { FaArrowLeft, FaCloudUploadAlt, FaImage } from "react-icons/fa";

const CreateNews: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [contentJson, setContentJson] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!title || !summary || !thumbnailUrl || !contentJson) {
      alert("Vui lòng nhập đủ thông tin (Tiêu đề, Tóm tắt, Ảnh bìa, Nội dung)");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title,
      summary,
      thumbnailUrl,
      content: JSON.stringify(contentJson),
      status: "PUBLISHED",
    };

    await dispatch(createPost(payload));
    setIsSubmitting(false);
    navigate("/admin/news");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-20">
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => navigate("/admin/news")}
          className="flex items-center gap-2 text-gray-400 hover:text-[#D8C97B] transition-colors"
        >
          <FaArrowLeft /> Quay lại danh sách
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
            <input
              className="w-full bg-transparent text-3xl font-bold text-white placeholder-gray-600 focus:outline-none border-b border-gray-700 focus:border-[#D8C97B] transition-colors pb-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề bài viết tại đây..."
            />
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-lg overflow-hidden">
            <div className="bg-[#252525] px-6 py-3 border-b border-gray-700 flex items-center gap-2">
              <span className="text-[#D8C97B] font-semibold text-sm uppercase tracking-wide">
                Nội dung chi tiết
              </span>
            </div>
            <div className="p-6 bg-white min-h-[500px]">
              <NewsEditor
                holder="editor-create"
                onChange={(data: any) => setContentJson(data)}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg sticky top-6">
            <h3 className="text-[#D8C97B] font-bold text-lg mb-4 border-b border-gray-700 pb-2">
              Đăng bài
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">
                  Tóm tắt ngắn
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-[#111] border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:border-[#D8C97B] focus:outline-none transition-colors"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Mô tả ngắn hiển thị ở preview..."
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">
                  Ảnh bìa (Thumbnail)
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
                    <div className="relative">
                      <img
                        src={thumbnailUrl}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-md shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs bg-black/70 px-2 py-1 rounded">
                          Nhấp để thay đổi
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4">
                      <FaImage className="mx-auto text-gray-500 text-2xl mb-2 group-hover:text-[#D8C97B]" />
                      <p className="text-gray-500 text-xs">
                        Click hoặc kéo thả ảnh vào đây
                      </p>
                    </div>
                  )}
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
                    <FaCloudUploadAlt /> Xuất bản tin tức
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNews;
