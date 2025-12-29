import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaImage,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaAlignLeft,
  FaGlobe,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { createEvent } from "../../../store/slices/eventSlice";
import { uploadEventImage } from "../../../store/slices/eventSlice";
import type { AppDispatch } from "../../../store";
import type { Event } from "../../../models/event";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    eventName: "",
    location: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    description: "",
    visibility: "PUBLIC",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bannerFile) {
      toast.warn("Vui lòng chọn ảnh bìa cho sự kiện!");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.warn("Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc!");
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu!");
      return;
    }

    if (
      formData.registrationDeadline &&
      new Date(formData.registrationDeadline) > new Date(formData.endDate)
    ) {
      toast.warn("Hạn chót đăng ký nên trước khi sự kiện kết thúc.");
    }

    setLoading(true);
    try {
      const uploadResult = await dispatch(
        uploadEventImage(bannerFile)
      ).unwrap();

      let bannerImageUrl = "";
      if (typeof uploadResult === "string") bannerImageUrl = uploadResult;
      else if (typeof uploadResult === "object" && uploadResult.url)
        bannerImageUrl = uploadResult.url;
      else bannerImageUrl = (uploadResult as any)?.data || "";

      if (!bannerImageUrl) throw new Error("Lỗi upload ảnh");

    
      const payload = {
        eventName: formData.eventName,
        description: formData.description,
        location: formData.location,
        bannerImageUrl: bannerImageUrl,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        registrationDeadline: new Date(
          formData.registrationDeadline
        ).toISOString(),
        status: "DRAFT" as "DRAFT",
        visibility: formData.visibility as "PUBLIC" | "PRIVATE",
      };

      await dispatch(
        createEvent(payload as unknown as Partial<Event>)
      ).unwrap();

      toast.success("Tạo sự kiện thành công! Hãy thêm các hoạt động chi tiết.");
      navigate("/admin/events");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Có lỗi xảy ra khi tạo sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#B5A65F] outline-none transition-all placeholder-gray-600";
  const labelClass =
    "text-xs text-[#B5A65F] uppercase font-bold tracking-wider mb-2 block flex items-center gap-2";

  return (
    <div className="max-w-6xl mx-auto pb-20 font-sans">
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/events"
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition text-gray-400 hover:text-white"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-3xl font-black uppercase text-[#B5A65F] tracking-wide">
              Tạo Sự Kiện Mới
            </h1>
            <p className="text-gray-500 text-sm">
              Đây là thông tin chung của sự kiện. Bạn sẽ thêm các{" "}
              <strong>hoạt động chi tiết (Lịch trình)</strong> sau khi tạo xong.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#121212] border border-[#B5A65F]/30 rounded-3xl p-6 shadow-2xl top-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#B5A65F] to-transparent"></div>

            <label className={labelClass}>
              <FaImage /> Ảnh Bìa (Cover)
            </label>
            <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-black/50 border-2 border-dashed border-white/20 group hover:border-[#B5A65F] transition-all cursor-pointer">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 group-hover:text-[#B5A65F]">
                  <FaImage className="text-5xl mb-3 opacity-50" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Chọn ảnh
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center leading-relaxed">
              Khuyến nghị kích thước 1920x1080.
              <br />
              Hỗ trợ JPG, PNG, WEBP.
            </p>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-[#121212] border border-[#B5A65F]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#B5A65F] to-transparent"></div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    <FaCalendarAlt /> Tên sự kiện
                  </label>
                  <input
                    required
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Vd: Tuần lễ công nghệ 2025"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <FaMapMarkerAlt /> Địa điểm tổ chức
                  </label>
                  <input
                    required
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Vd: Trung tâm hội nghị Quốc gia..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>
                    <FaClock /> Thời gian bắt đầu
                  </label>
                  <input
                    required
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`${inputClass} scheme-dark cursor-pointer`}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <FaClock /> Thời gian kết thúc
                  </label>
                  <input
                    required
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`${inputClass} scheme-dark cursor-pointer`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-red-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                    <FaClock /> Hạn chót đăng ký (Tổng)
                  </label>
                  <input
                    required
                    type="datetime-local"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                    className={`${inputClass} scheme-dark cursor-pointer border-red-900/50 focus:border-red-500`}
                  />
                  <p className="text-[10px] text-gray-500 mt-1 italic">
                    *Đây là hạn chót chung. Các hoạt động con có thể có hạn đăng
                    ký riêng nếu cần.
                  </p>
                </div>
                <div>
                  <label className={labelClass}>
                    <FaGlobe /> Quyền riêng tư
                  </label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                    className={`${inputClass} cursor-pointer appearance-none`}
                  >
                    <option value="PUBLIC">Công khai (PUBLIC)</option>
                    <option value="PRIVATE">Riêng tư (PRIVATE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  <FaAlignLeft /> Mô tả chi tiết
                </label>
                <textarea
                  required
                  rows={6}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`${inputClass} h-32 resize-none`}
                  placeholder="Nhập nội dung tổng quan về sự kiện..."
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 mt-4 border-t border-white/5">
              <Link
                to="/admin/events"
                className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold transition-colors"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-xl bg-[#B5A65F] text-black font-bold hover:bg-[#d4c376] shadow-[0_0_20px_rgba(181,166,95,0.3)] transition-all flex items-center gap-2 transform active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <FaSave /> Tạo & Tiếp tục
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
