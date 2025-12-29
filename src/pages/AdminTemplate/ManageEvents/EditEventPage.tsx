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

const ensureUTC = (isoString: string) =>
  isoString && !isoString.endsWith("Z") ? `${isoString}Z` : isoString;

const parseDateTimeToInput = (isoString: string) => {
  if (!isoString) return { date: "", time: "" };
  const d = new Date(ensureUTC(isoString));
  const date = d.toLocaleDateString("sv-SE");
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { date, time };
};

const combineToISO = (dateVal: string, timeVal: string) => {
  if (!dateVal || !timeVal) return "";
  const d = new Date(`${dateVal}T${timeVal}`);
  return d.toISOString();
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
      formData.startDateTime
    );
    const endDateISO = combineToISO(formData.endDateDate, formData.endDateTime);
    const regDateISO = combineToISO(formData.regDateDate, formData.regDateTime);

    if (new Date(endDateISO) <= new Date(startDateISO)) {
      toast.warn("Thời gian Kết thúc phải sau Bắt đầu!");
      return;
    }

    setLoading(true);
    try {
      let finalBannerUrl = (formData as any).bannerImageUrl;
      if (bannerFile) {
        const uploadResult = await dispatch(
          uploadEventImage(bannerFile)
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
        visibility: formData.visibility as "PUBLIC" | "PRIVATE",
        status: formData.status as any,
      };

      if (slug) {
        await dispatch(updateEvent({ slug, data: payload })).unwrap();

        toast.success("Cập nhật sự kiện thành công!");

        navigate(`/admin/events/${slug}`);
      }
    } catch (error: any) {
      toast.error(error.message || error || "Lỗi cập nhật!");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) return <LoadingScreen />;

  const inputStyle =
    "w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#B5A65F] outline-none transition-all placeholder-gray-600";
  const groupStyle =
    "bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 text-white focus-within:border-[#B5A65F] flex gap-3 items-center transition-all";
  const labelStyle =
    "text-[11px] text-[#B5A65F] uppercase font-bold tracking-wider mb-2 block flex items-center gap-2";

  return (
    <div className="max-w-6xl mx-auto pb-20 font-sans">
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <Link
            to={`/admin/events/${slug}`}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-3xl font-black uppercase text-[#B5A65F] tracking-wide">
              Cập Nhật Sự Kiện
            </h1>
            <p className="text-gray-500 text-sm">
              Chỉnh sửa thông tin <b>{formData.eventName}</b>.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#121212] border border-[#B5A65F]/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#B5A65F] to-transparent"></div>
            <label className={labelStyle}>
              <FaImage /> Ảnh Bìa
            </label>
            <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-black/50 border-2 border-dashed border-white/20 group hover:border-[#B5A65F] cursor-pointer">
              <img
                src={previewUrl}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all"
                alt="preview"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                <span className="text-[#B5A65F] text-xs font-bold uppercase border border-[#B5A65F] px-3 py-1 rounded-full bg-black/80 flex items-center gap-2">
                  <FaSync /> Thay ảnh
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-[#121212] border border-[#B5A65F]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#B5A65F] to-transparent"></div>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>
                    <FaCalendarAlt /> Tên sự kiện
                  </label>
                  <input
                    required
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelStyle}>
                    <FaMapMarkerAlt /> Địa điểm
                  </label>
                  <input
                    required
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>
                    <FaClock /> Bắt đầu
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      className={`${groupStyle} flex-1`}
                      style={{ colorScheme: "dark" }}
                      name="startDateDate"
                      value={formData.startDateDate}
                      onChange={handleChange}
                    />
                    <input
                      type="time"
                      required
                      className={`${groupStyle} w-32`}
                      style={{ colorScheme: "dark" }}
                      name="startDateTime"
                      value={formData.startDateTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>
                    <FaClock /> Kết thúc
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      className={`${groupStyle} flex-1`}
                      style={{ colorScheme: "dark" }}
                      name="endDateDate"
                      value={formData.endDateDate}
                      onChange={handleChange}
                    />
                    <input
                      type="time"
                      required
                      className={`${groupStyle} w-32`}
                      style={{ colorScheme: "dark" }}
                      name="endDateTime"
                      value={formData.endDateTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] text-red-400 uppercase font-bold tracking-wider mb-2 block flex items-center gap-2">
                    <FaClock /> Hạn đăng ký
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      required
                      className={`${groupStyle} flex-1 border-red-900/50`}
                      style={{ colorScheme: "dark" }}
                      name="regDateDate"
                      value={formData.regDateDate}
                      onChange={handleChange}
                    />
                    <input
                      type="time"
                      required
                      className={`${groupStyle} w-32 border-red-900/50`}
                      style={{ colorScheme: "dark" }}
                      name="regDateTime"
                      value={formData.regDateTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>
                    <FaGlobe /> Quyền riêng tư
                  </label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                    className={inputStyle}
                  >
                    <option value="PUBLIC">Công khai</option>
                    <option value="PRIVATE">Riêng tư</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelStyle}>
                  <FaAlignLeft /> Mô tả chi tiết
                </label>
                <textarea
                  required
                  rows={6}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`${inputStyle} h-32 resize-none`}
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-8 mt-4 border-t border-white/5">
              <Link
                to={`/admin/events/${slug}`}
                className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-xl bg-[#B5A65F] text-black font-bold hover:bg-[#d4c376] shadow-lg shadow-[#B5A65F]/20"
              >
                {loading ? (
                  "Đang lưu..."
                ) : (
                  <>
                    <FaSave className="mr-2" /> Lưu Thay Đổi
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
