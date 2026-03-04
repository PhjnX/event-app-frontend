import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaImage,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaAlignLeft,
  FaGlobe,
  FaSync,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import apiService from "../../../services/apiService";
import {
  updateEvent,
  uploadEventImage,
} from "../../../store/slices/eventSlice";
import type { AppDispatch } from "../../../store";
import type { Event } from "../../../models/event";
import LoadingScreen from "../../HomeTemplate/_components/common/LoadingSrceen";

const parseDateTimeToInput = (isoString: string) => {
  if (!isoString) return { date: "", time: "" };
  const [datePart, timeFull] = isoString.split("T");
  const timePart = timeFull ? timeFull.substring(0, 5) : "";
  return { date: datePart, time: timePart };
};

const combineToISO = (dateVal: string, timeVal: string) => {
  if (!dateVal || !timeVal) return "";
  return `${dateVal}T${timeVal}:00.000Z`;
};

export default function EditEventPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    eventId: 0,
    eventName: "",
    location: "",
    description: "",
    visibility: "PUBLIC",
    status: "DRAFT",
    bannerImageUrl: "",
    startDateDate: "",
    startDateTime: "",
    endDateDate: "",
    endDateTime: "",
    regDateDate: "",
    regDateTime: "",
  });

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const res = await apiService.get<Event>(`/events/${slug}`);

        const isLocked =
          (res.status === "PUBLISHED" || res.status === "APPROVED") &&
          res.editRequestStatus !== "APPROVED";

        if (isLocked) {
          toast.error(
            "Sự kiện này đang bị khóa. Bạn cần gửi yêu cầu và được Admin duyệt mới có thể chỉnh sửa.",
          );
          navigate(`/admin/events/${slug}`);
          return;
        }

        const start = parseDateTimeToInput(res.startDate);
        const end = parseDateTimeToInput(res.endDate);
        const reg = parseDateTimeToInput(res.registrationDeadline);

        setFormData({
          eventId: res.eventId,
          eventName: res.eventName,
          location: res.location,
          description: res.description,
          visibility: res.visibility,
          status: res.status,
          bannerImageUrl: res.bannerImageUrl,
          startDateDate: start.date,
          startDateTime: start.time,
          endDateDate: end.date,
          endDateTime: end.time,
          regDateDate: reg.date,
          regDateTime: reg.time,
        });
        setPreviewUrl(res.bannerImageUrl);
      } catch (error) {
        console.error(error);
        toast.error("Không tìm thấy sự kiện!");
        navigate("/admin/events");
      } finally {
        setFetchingData(false);
      }
    };
    if (slug) fetchEventDetail();
  }, [slug, navigate]);

  const handleChange = (e: any) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startDateISO = combineToISO(
      formData.startDateDate,
      formData.startDateTime,
    );
    const endDateISO = combineToISO(formData.endDateDate, formData.endDateTime);
    const regDateISO = combineToISO(formData.regDateDate, formData.regDateTime);

    if (new Date(endDateISO) <= new Date(startDateISO)) {
      toast.warn("Thời gian Kết thúc phải sau Bắt đầu!");
      return;
    }

    setLoading(true);
    try {
      let finalBannerUrl = formData.bannerImageUrl;
      if (bannerFile) {
        const uploadResult = await dispatch(
          uploadEventImage(bannerFile),
        ).unwrap();
        finalBannerUrl =
          typeof uploadResult === "string"
            ? uploadResult
            : (uploadResult as any).url || (uploadResult as any).data;
      }

      const payload = {
        eventName: formData.eventName,
        description: formData.description,
        location: formData.location,
        bannerImageUrl: finalBannerUrl,
        startDate: startDateISO,
        endDate: endDateISO,
        registrationDeadline: regDateISO,
        visibility: formData.visibility,
      };

      if (slug) {
        await dispatch(updateEvent({ slug, data: payload as any })).unwrap();
        toast.success("Cập nhật sự kiện thành công!");
        navigate(`/admin/events/${slug}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi cập nhật!");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) return <LoadingScreen />;

  const inputClass =
    "w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[#B5A65F] outline-none transition-all text-sm";
  const groupInputClass =
    "bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#B5A65F] outline-none transition-all text-sm";
  const labelClass =
    "text-[11px] text-[#B5A65F] uppercase font-bold tracking-wider mb-2 flex items-center gap-2";
  const sectionClass =
    "bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden transition-colors hover:border-[rgba(181,166,95,0.3)]";

  return (
    <div className="max-w-6xl mx-auto pb-20 font-noto text-gray-200 selection:bg-[rgba(181,166,95,0.3)]">
      <div className="sticky top-0 z-40 bg-[rgba(5,5,5,0.8)] backdrop-blur-md py-4 border-b border-white/10 flex items-center gap-4 mb-8">
        <Link
          to={`/admin/events/${slug}`}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
        >
          <FaArrowLeft />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-wide">
            Cập Nhật <span className="text-[#B5A65F]">Sự Kiện</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            Chỉnh sửa thông tin cho <b>{formData.eventName}</b>.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        <div className="lg:col-span-4 space-y-6">
          <div className={sectionClass}>
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#B5A65F] to-transparent"></div>
            <label className={labelClass}>
              <FaImage /> Ảnh Bìa
            </label>
            <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-[#1a1a1a] border-2 border-dashed border-white/20 group/img hover:border-[#B5A65F] cursor-pointer transition-all">
              <img
                src={previewUrl}
                className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 group-hover/img:scale-105 transition-all duration-500"
                alt="preview"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all pointer-events-none">
                <span className="text-[#B5A65F] text-xs font-bold uppercase border border-[#B5A65F] px-4 py-2 rounded-full bg-[rgba(0,0,0,0.8)] flex items-center gap-2">
                  <FaSync /> Thay ảnh
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className={sectionClass}>
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#B5A65F] to-transparent"></div>
            <div className="space-y-6">
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
                  />
                </div>
                <div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-4">
                <div>
                  <label className={labelClass}>
                    <FaClock /> Bắt đầu
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      className={`${groupInputClass} flex-1`}
                      style={{ colorScheme: "dark" }}
                      name="startDateDate"
                      value={formData.startDateDate}
                      onChange={handleChange}
                    />
                    <input
                      type="time"
                      required
                      className={`${groupInputClass} w-28`}
                      style={{ colorScheme: "dark" }}
                      name="startDateTime"
                      value={formData.startDateTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>
                    <FaClock /> Kết thúc
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      className={`${groupInputClass} flex-1`}
                      style={{ colorScheme: "dark" }}
                      name="endDateDate"
                      value={formData.endDateDate}
                      onChange={handleChange}
                    />
                    <input
                      type="time"
                      required
                      className={`${groupInputClass} w-28`}
                      style={{ colorScheme: "dark" }}
                      name="endDateTime"
                      value={formData.endDateTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`${labelClass} text-red-400`}>
                    <FaClock /> Hạn đăng ký
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      className={`${groupInputClass} flex-1 border-red-900/40 bg-[rgba(127,29,29,0.05)]`}
                      style={{ colorScheme: "dark" }}
                      name="regDateDate"
                      value={formData.regDateDate}
                      onChange={handleChange}
                    />
                    <input
                      type="time"
                      required
                      className={`${groupInputClass} w-28 border-red-900/40 bg-[rgba(127,29,29,0.05)]`}
                      style={{ colorScheme: "dark" }}
                      name="regDateTime"
                      value={formData.regDateTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>
                    <FaGlobe /> Quyền riêng tư
                  </label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="PUBLIC">Công khai</option>
                    <option value="PRIVATE">Riêng tư</option>
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
                  className={`${inputClass} h-32 resize-none leading-relaxed`}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
            <Link
              to={`/admin/events/${slug}`}
              className="px-6 py-3.5 rounded-xl bg-[#1e1e1e] hover:bg-[#252525] text-gray-300 font-bold border border-white/10 transition-all"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-xl bg-[#B5A65F] text-black font-bold hover:bg-[#d4c376] shadow-[0_0_20px_rgba(181,166,95,0.3)] transition-all flex items-center gap-2 transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                "Đang lưu..."
              ) : (
                <>
                  <FaSave /> Lưu Thay Đổi
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
