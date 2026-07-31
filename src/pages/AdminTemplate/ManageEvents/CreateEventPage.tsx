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

import {
  createEvent,
  uploadEventImage,
} from "../../../store/slices/eventSlice";
import type { AppDispatch } from "../../../store";

import LockedGuard from "../_components/LockedGuard";

const formatToBackendISO = (dateTimeLocal: string) => {
  if (!dateTimeLocal) return "";
  return `${dateTimeLocal}:00.000Z`;
};

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
    >,
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

    setLoading(true);
    try {
      const uploadResult = await dispatch(
        uploadEventImage(bannerFile),
      ).unwrap();

      // Sửa lại đoạn này:
      let bannerImageUrl = "";
      if (typeof uploadResult === "string") {
        bannerImageUrl = uploadResult;
      } else if (uploadResult?.file?.url) {
        bannerImageUrl = uploadResult.file.url; // ✅ Lấy chuẩn theo response Cloudinary
      } else if (uploadResult?.url) {
        bannerImageUrl = uploadResult.url;
      } else {
        bannerImageUrl = (uploadResult as any)?.data || "";
      }

      if (!bannerImageUrl) throw new Error("Lỗi upload ảnh");

      const payload = {
        eventName: formData.eventName,
        description: formData.description,
        location: formData.location,
        bannerImageUrl: bannerImageUrl,
        startDate: formatToBackendISO(formData.startDate),
        endDate: formatToBackendISO(formData.endDate),
        registrationDeadline: formatToBackendISO(formData.registrationDeadline),
        status: "DRAFT",
        visibility: formData.visibility,
      };

      await dispatch(createEvent(payload as any)).unwrap();

      toast.success("Tạo sự kiện thành công! (Bản nháp)");
      navigate("/admin/events");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi tạo sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[#B5A65F] outline-none transition-all text-sm";
  const labelClass =
    "text-[11px] text-[#B5A65F] uppercase font-bold tracking-wider mb-2 flex items-center gap-2";
  const sectionClass =
    "bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden hover:border-[#B5A65F]/30 transition-colors";

  return (
    <div className="max-w-6xl mx-auto pb-20 font-noto text-gray-200">
      <div className="flex items-center justify-between mb-8 py-4 border-b border-white/10 sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/events"
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition text-gray-400 hover:text-white"
          >
            <FaArrowLeft />
          </Link>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wide">
            Tạo Sự Kiện <span className="text-[#B5A65F]">Mới</span>
          </h1>
        </div>
      </div>

      <LockedGuard>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-4 space-y-6">
            <div className={sectionClass}>
              <label className={labelClass}>
                <FaImage /> Ảnh Bìa
              </label>
              <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-[#1a1a1a] border-2 border-dashed border-white/20 hover:border-[#B5A65F] transition-all cursor-pointer">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <FaImage className="text-5xl mb-3 opacity-50" />
                    <span className="text-xs font-bold uppercase">
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
            </div>

            <div className={sectionClass}>
              <label className={labelClass}>
                <FaGlobe /> Quyền riêng tư
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="PUBLIC">Công khai (Public)</option>
                <option value="PRIVATE">Riêng tư (Private)</option>
              </select>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className={sectionClass}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <FaCalendarAlt /> Tên sự kiện
                    </label>
                    <input
                      required
                      type="text"
                      name="eventName"
                      value={formData.eventName}
                      onChange={handleChange}
                      className={`${inputClass} text-lg font-bold`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <FaMapMarkerAlt /> Địa điểm
                    </label>
                    <input
                      required
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  <div>
                    <label className={labelClass}>
                      <FaClock /> Bắt đầu
                    </label>
                    <input
                      required
                      type="datetime-local"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`${inputClass} scheme-dark`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <FaClock /> Kết thúc
                    </label>
                    <input
                      required
                      type="datetime-local"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className={`${inputClass} scheme-dark`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`${labelClass} text-red-400`}>
                      <FaClock /> Hạn chót đăng ký
                    </label>
                    <input
                      required
                      type="datetime-local"
                      name="registrationDeadline"
                      value={formData.registrationDeadline}
                      onChange={handleChange}
                      className={`${inputClass} scheme-dark bg-red-500/5`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    <FaAlignLeft /> Mô tả
                  </label>
                  <textarea
                    required
                    rows={6}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`${inputClass} h-32 resize-none`}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link
                to="/admin/events"
                className="px-6 py-3.5 rounded-xl bg-[#1e1e1e] text-gray-300 font-bold border border-white/10"
              >
                Hủy
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-xl bg-[#B5A65F] text-black font-bold shadow-lg flex items-center gap-2"
              >
                {loading ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <FaSave /> Lưu Nháp
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </LockedGuard>
    </div>
  );
}
