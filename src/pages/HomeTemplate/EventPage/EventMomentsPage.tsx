import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaTimes,
  FaSpinner,
  FaCamera,
  FaTrash,
  FaPen,
  FaGlobeAmericas,
  FaUserAlt,
  FaEllipsisH,
  FaExclamationTriangle,
  FaMagic,
  FaRegImages,
} from "react-icons/fa";
import { momentApi } from "@/store/slices/momentService";
import axiosClient from "@/services/apiService"; 
import type { RootState, AppDispatch } from "@/store";
import { fetchMyRegistrations } from "@/store/slices/eventSlice"; 

const getErrorMessage = (error: any) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (typeof error?.response?.data === "string") return error.response.data;
  return "Có lỗi xảy ra, vui lòng thử lại.";
};

interface Moment {
  id: number;
  userId: number;
  username: string;
  userAvatar: string;
  caption: string;
  imageUrl?: string;
  postedAt: string;
  timeAgo: string;
}

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#18181b] border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-xl">
            <FaExclamationTriangle />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-zinc-400 text-sm mt-2">{message}</p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-bold uppercase hover:bg-zinc-700"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-500"
            >
              Xóa
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const EditModal = ({
  isOpen,
  onClose,
  onSave,
  initialCaption,
  initialImage,
}: any) => {
  const [caption, setCaption] = useState(initialCaption);
  useEffect(() => {
    setCaption(initialCaption);
  }, [initialCaption, isOpen]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#1f1f22] border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white uppercase flex gap-2">
            <FaPen className="text-[#B5A65F]" /> Chỉnh sửa
          </h3>
          <button onClick={onClose}>
            <FaTimes className="text-zinc-500 hover:text-white" />
          </button>
        </div>
        <div className="p-4">
          {initialImage && (
            <div className="mb-4 rounded-xl overflow-hidden bg-black h-40 flex justify-center">
              <img
                src={initialImage}
                alt="preview"
                className="h-full object-contain opacity-80"
              />
            </div>
          )}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl p-3 text-zinc-100 focus:border-[#B5A65F] outline-none min-h-[100px] text-sm resize-none"
            placeholder="Nội dung..."
          />
        </div>
        <div className="p-4 bg-zinc-900/30 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-zinc-400 hover:bg-zinc-800"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(caption)}
            className="px-4 py-2 rounded-lg bg-[#B5A65F] text-black text-xs font-bold hover:bg-[#d4c57e]"
          >
            Lưu
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const MomentCard = ({ moment, isOwner, onDeleteRequest, onEdit }: any) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasImage = !!moment.imageUrl && moment.imageUrl !== "";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="break-inside-avoid mb-6 relative group"
    >
      <div className="bg-[#1f1f22] rounded-2xl overflow-hidden border border-white/5 shadow-lg hover:border-white/10 transition-all">
        {hasImage && (
          <div className="relative w-full">
            <img
              src={moment.imageUrl}
              alt="moment"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-50" />
          </div>
        )}
        <div className={`relative ${hasImage ? "p-4 -mt-10 z-10" : "p-5"}`}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
              <img
                src={
                  moment.userAvatar ||
                  `https://ui-avatars.com/api/?background=000&color=fff&name=${moment.username}`
                }
                alt="ava"
                className="w-8 h-8 rounded-full border border-zinc-700 object-cover"
              />
              <div className="flex flex-col">
                <span
                  className={`text-xs font-bold ${
                    hasImage ? "text-white" : "text-zinc-200"
                  }`}
                >
                  {moment.username}
                </span>
                <span
                  className={`text-[9px] ${
                    hasImage ? "text-zinc-300" : "text-zinc-500"
                  }`}
                >
                  {moment.timeAgo}
                </span>
              </div>
            </div>
            {isOwner && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className={`p-1.5 rounded-full ${
                    hasImage
                      ? "bg-black/40 text-white"
                      : "text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  <FaEllipsisH />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute right-0 top-full mt-1 w-32 bg-[#27272a] border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-30"
                    >
                      <button
                        onClick={() => {
                          onEdit(moment);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-[11px] font-bold text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
                      >
                        <FaPen /> Sửa bài
                      </button>
                      <button
                        onClick={() => {
                          onDeleteRequest(moment.id);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-[11px] font-bold text-red-400 hover:bg-zinc-700 flex items-center gap-2"
                      >
                        <FaTrash /> Xóa bài
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          {moment.caption && (
            <p
              className={`whitespace-pre-wrap leading-relaxed ${
                !hasImage
                  ? "text-base text-zinc-300 italic text-center py-2"
                  : "text-sm text-zinc-200 mt-2"
              }`}
            >
              {moment.caption}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- 4. MAIN PAGE ---
export default function EventMomentsPage() {
  const { eventSlug } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { myRegistrations } = useSelector((state: RootState) => state.events);

  const [realEventId, setRealEventId] = useState<number | null>(null);
  const [moments, setMoments] = useState<Moment[]>([]);

  // Trạng thái Loading
  const [isInitializing, setIsInitializing] = useState(true); // Đang tìm ID
  const [isLoadingList, setIsLoadingList] = useState(false); // Đang tải moments

  // UI State
  const [activeTab, setActiveTab] = useState<"ALL" | "MINE">("ALL");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Input State
  const [caption, setCaption] = useState("");
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Modal State
  const [editingMoment, setEditingMoment] = useState<Moment | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. LOGIC TÌM ID (FIX LỖI RELOAD) ---
  useEffect(() => {
    if (!eventSlug) return;

    const initialize = async () => {
      setIsInitializing(true);

      // Bước 1: Thử tìm trong Redux (Nếu vừa chuyển trang)
      const foundInRedux = myRegistrations.find(
        (item: any) => item.eventSlug === eventSlug
      );
      if (foundInRedux && (foundInRedux.eventId || foundInRedux.id)) {
        console.log("✅ Tìm thấy ID từ Redux:", foundInRedux.eventId);
        setRealEventId(foundInRedux.eventId || foundInRedux.id);
        setIsInitializing(false);
        return;
      }

      // Bước 2: Nếu Redux rỗng (do F5), gọi API lấy thông tin sự kiện
      try {
        // Gọi API public để lấy ID từ Slug
        console.log("🔄 Đang gọi API tìm ID cho slug:", eventSlug);
        const res: any = await axiosClient.get(`/events/${eventSlug}`);
        const data = res.data || res;

        if (data && (data.id || data.eventId)) {
          setRealEventId(data.id || data.eventId);
          // Tiện tay fetch luôn danh sách vé để Redux được cập nhật lại
          dispatch(fetchMyRegistrations());
        } else {
          toast.error("Không tìm thấy sự kiện này!");
        }
      } catch (error) {
        console.error("❌ Lỗi tìm ID sự kiện:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, [eventSlug, myRegistrations.length, dispatch]);

  // --- 2. FETCH MOMENTS ---
  const fetchMoments = async (reset = false) => {
    if (!realEventId) return;
    if (reset) setIsLoadingList(true);

    try {
      let newData: Moment[] = [];
      if (activeTab === "ALL") {
        const currentPage = reset ? 0 : page;
        const res: any = await momentApi.getMoments(
          realEventId,
          currentPage,
          8
        );
        const payload = res.data || res;
        newData = payload.content || [];

        if (reset) {
          setMoments(newData);
          setPage(1);
        } else {
          // Lọc trùng ID để tránh lỗi key
          setMoments((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            return [...prev, ...newData.filter((n) => !ids.has(n.id))];
          });
          setPage((prev) => prev + 1);
        }
        setHasMore(!payload.last && newData.length > 0);
      } else {
        const res: any = await momentApi.getMyMoments(realEventId);
        const myData = res.data || res;
        setMoments(Array.isArray(myData) ? myData : myData.content || []);
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (realEventId) fetchMoments(true);
  }, [realEventId, activeTab]);

  // --- 3. HANDLE UPLOAD (FIX LỖI 500) ---
  const handleUpload = async () => {
    if ((!caption.trim() && !fileToUpload) || !realEventId) {
      toast.warning("Vui lòng viết nội dung hoặc chọn ảnh!");
      return;
    }

    setIsUploading(true);
    try {
      let imageUrl = "";

      // Upload Ảnh
      if (fileToUpload) {
        const formData = new FormData();
        formData.append("image", fileToUpload);

        // 🔥 FIX QUAN TRỌNG: Không set Content-Type thủ công khi dùng formData với axiosClient
        // Nếu axiosClient có default header json, ta cần override
        const res: any = await axiosClient.post("/images/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Lấy link ảnh từ response (xử lý mọi trường hợp trả về)
        if (typeof res.data === "string") imageUrl = res.data;
        else if (res.data?.url) imageUrl = res.data.url;
        else if (typeof res === "string") imageUrl = res;

        console.log("📸 Upload success:", imageUrl);
      }

      // Tạo Moment
      await momentApi.createMoment(realEventId, { caption, imageUrl });

      toast.success("Đăng thành công!");

      // Reset Form
      setCaption("");
      setPreviewImg(null);
      setFileToUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      fetchMoments(true); // Load lại list
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  // --- 4. CÁC HÀM KHÁC ---
  const handleConfirmDelete = async () => {
    if (!deleteId || !realEventId) return;
    try {
      await momentApi.deleteMoment(realEventId, deleteId);
      setMoments((prev) => prev.filter((m) => m.id !== deleteId));
      toast.success("Đã xóa.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteId(null);
    }
  };

  const handleUpdate = async (newCaption: string) => {
    if (!editingMoment || !realEventId) return;
    try {
      await momentApi.updateMoment(realEventId, editingMoment.id, {
        caption: newCaption,
        imageUrl: editingMoment.imageUrl || "",
      });
      setMoments((prev) =>
        prev.map((m) =>
          m.id === editingMoment.id ? { ...m, caption: newCaption } : m
        )
      );
      setEditingMoment(null);
      toast.success("Đã cập nhật.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFileToUpload(file);
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  // --- 5. RENDER ---
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pt-28 pb-20 selection:bg-[#B5A65F] selection:text-black overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#B5A65F]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
          <div className="flex items-center gap-5">
            <Link
              to="/my-tickets"
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-[#B5A65F] hover:text-black transition-all shadow-lg"
            >
              <FaArrowLeft />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FaMagic className="text-[#B5A65F]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#B5A65F]">
                  Live Feed
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-none">
                Khoảnh khắc{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-br from-[#B5A65F] to-[#FFF]">
                  Sự kiện
                </span>
              </h1>
            </div>
          </div>
          <div className="bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/10 flex shadow-inner">
            {[
              { id: "ALL", label: "Cộng đồng", icon: <FaGlobeAmericas /> },
              { id: "MINE", label: "Của tôi", icon: <FaUserAlt /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? "bg-[#B5A65F] text-black shadow-[0_0_20px_rgba(181,166,95,0.2)]"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- TRẠNG THÁI LOADING BAN ĐẦU --- */}
        {isInitializing ? (
          <div className="flex flex-col items-center justify-center py-32">
            <FaSpinner className="text-[#B5A65F] text-4xl animate-spin mb-4" />
            <p className="text-zinc-500 uppercase tracking-widest text-sm">
              Đang tải dữ liệu sự kiện...
            </p>
          </div>
        ) : (
          <>
            {/* Input Area */}
            {realEventId && (
              <div className="mb-16 relative">
                <div className="absolute -inset-px bg-linear-to-r from-[#B5A65F]/40 to-purple-500/40 rounded-3xl blur opacity-30 animate-pulse"></div>
                <div className="relative bg-[#18181b]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                  <div className="flex gap-4">
                    <img
                      src="https://ui-avatars.com/api/?background=000&color=fff&name=Me"
                      alt="Me"
                      className="w-12 h-12 rounded-full border border-white/20"
                    />
                    <div className="flex-1">
                      <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Chia sẻ cảm nghĩ hoặc hình ảnh..."
                        className="w-full bg-transparent text-lg text-white placeholder-zinc-500 outline-none resize-none h-14"
                      />
                      <AnimatePresence>
                        {previewImg && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                              marginTop: 16,
                            }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="relative rounded-2xl overflow-hidden w-fit border border-zinc-700 bg-black/50"
                          >
                            <img
                              src={previewImg}
                              alt="Preview"
                              className="h-64 object-contain"
                            />
                            <button
                              onClick={() => {
                                setPreviewImg(null);
                                setFileToUpload(null);
                                if (fileInputRef.current)
                                  fileInputRef.current.value = "";
                              }}
                              className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-red-500 transition-colors"
                            >
                              <FaTimes size={14} />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="group flex items-center gap-2 text-zinc-400 hover:text-[#B5A65F] text-sm font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                    >
                      <FaRegImages className="text-xl group-hover:scale-110 transition-transform" />{" "}
                      <span className="text-xs uppercase tracking-wider">
                        Thêm ảnh
                      </span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={onFileSelect}
                    />
                    <button
                      onClick={handleUpload}
                      disabled={isUploading || (!caption && !fileToUpload)}
                      className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg ${
                        isUploading || (!caption && !fileToUpload)
                          ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                          : "bg-[#B5A65F] text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(181,166,95,0.4)]"
                      }`}
                    >
                      {isUploading ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <>
                          <FaPaperPlane /> Đăng bài
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* List */}
            {isLoadingList && moments.length === 0 ? (
              <div className="flex justify-center py-24">
                <FaSpinner className="text-[#B5A65F] text-4xl animate-spin" />
              </div>
            ) : (
              <div className="columns-1 md:columns-2 gap-6 space-y-6">
                <AnimatePresence>
                  {moments.map((moment) => (
                    <MomentCard
                      key={moment.id}
                      moment={moment}
                      isOwner={activeTab === "MINE" || moment.username === "Me"}
                      onDeleteRequest={setDeleteId}
                      onEdit={setEditingMoment}
                    />
                  ))}
                </AnimatePresence>
                {moments.length === 0 && (
                  <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 break-inside-avoid col-span-2">
                    <FaCamera className="text-5xl text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">
                      Chưa có khoảnh khắc nào.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Load More */}
            {activeTab === "ALL" &&
              hasMore &&
              !isLoadingList &&
              moments.length > 0 && (
                <div className="text-center mt-16 pb-12">
                  <button
                    onClick={() => fetchMoments(false)}
                    className="group relative inline-flex items-center gap-3 px-8 py-3 overflow-hidden rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 text-xs font-bold uppercase tracking-[0.2em] hover:text-[#B5A65F] hover:border-[#B5A65F] transition-all"
                  >
                    <span>Xem thêm</span>
                  </button>
                </div>
              )}
          </>
        )}

        <EditModal
          isOpen={!!editingMoment}
          onClose={() => setEditingMoment(null)}
          onSave={handleUpdate}
          initialCaption={editingMoment?.caption || ""}
          initialImage={editingMoment?.imageUrl || ""}
        />
        <ConfirmModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleConfirmDelete}
          title="Xóa Khoảnh khắc?"
          message="Bạn có chắc chắn muốn xóa bài viết này không?"
        />
      </div>
    </div>
  );
}
