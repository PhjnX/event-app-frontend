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
import {
  FaArrowLeft,
  FaSave,
  FaImage,
  FaPenFancy,
  FaSpinner,
} from "react-icons/fa";

const EditNews: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { postDetail } = useSelector((state: RootState) => state.news);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [contentJson, setContentJson] = useState<any>(null);
  const [readyToRenderEditor, setReadyToRenderEditor] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchPostDetailAdmin(Number(id)));
    }
    return () => {
      dispatch(clearPostDetail());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (postDetail) {
      setTitle(postDetail.title || "");
      setSummary(postDetail.summary || "");
      setThumbnailUrl(postDetail.thumbnailUrl || "");

      try {
        if (postDetail.content && postDetail.content.trim() !== "") {
          const parsedContent = JSON.parse(postDetail.content);
          setContentJson(parsedContent);
        } else {
          setContentJson({}); 
        }
      } catch (e) {
        console.error("Lỗi parse JSON content cũ:", e);
        setContentJson({});
      } finally {
        setReadyToRenderEditor(true);
      }
    }
  }, [postDetail]);

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setThumbnailUrl(url);
      } catch (err) {
        console.error(err);
        alert("Upload ảnh thất bại!");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleUpdate = async () => {
    if (!id) return;

    if (!title.trim()) {
      alert("Tiêu đề không được để trống");
      return;
    }

    const payload = {
      title,
      summary,
      thumbnailUrl,
      content: JSON.stringify(contentJson), 
      status: postDetail?.status || "PUBLISHED", 
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
        <span className="text-gray-500 text-sm italic">
          Đang chỉnh sửa bài viết #{id}
        </span>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
            <label className="text-[#D8C97B] text-xs uppercase font-bold tracking-wider mb-2 block">
              Tiêu đề bài viết
            </label>
            <input
              className="w-full bg-transparent text-2xl font-bold text-white placeholder-gray-600 focus:outline-none border-b border-gray-700 focus:border-[#D8C97B] transition-colors pb-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
            />
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-lg overflow-hidden">
            <div className="bg-[#252525] px-6 py-3 border-b border-gray-700 flex justify-between items-center">
              <span className="text-[#D8C97B] font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                <FaPenFancy /> Nội dung
              </span>
              <span className="text-xs text-gray-500">Editor Mode</span>
            </div>
            <div className="p-6 bg-white min-h-[500px] text-black">
              <NewsEditor
                key={id}
                holder="editor-edit"
                data={contentJson}
                onChange={setContentJson}
              />
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
                  Tóm tắt
                </label>
                <textarea
                  rows={5}
                  className="w-full bg-[#111] border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:border-[#D8C97B] focus:outline-none transition-colors resize-none"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Nhập tóm tắt..."
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">
                  Ảnh đại diện
                </label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-2 text-center hover:border-[#D8C97B] transition-colors bg-[#111] relative group overflow-hidden">
                  <input
                    type="file"
                    onChange={handleThumbUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {uploading ? (
                    <div className="py-8 flex flex-col items-center">
                      <FaSpinner className="animate-spin text-[#D8C97B] mb-2" />
                      <p className="text-[#D8C97B] text-xs">Uploading...</p>
                    </div>
                  ) : thumbnailUrl ? (
                    <div className="relative">
                      <img
                        src={thumbnailUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                        <FaImage className="text-white text-3xl" />
                      </div>
                    </div>
                  ) : (
                    <div className="py-8">
                      <p className="text-gray-500 text-sm">Upload ảnh mới</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleUpdate}
                className="w-full bg-[#D8C97B] hover:bg-[#c4b56a] text-black font-bold py-3 rounded-lg shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
              >
                <FaSave /> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditNews;
