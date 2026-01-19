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
  FaEllipsisH,
  FaExclamationTriangle,
  FaImage,
} from "react-icons/fa";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

import { momentApi } from "@/store/slices/momentService";
import axiosClient from "@/services/apiService";
import type { RootState, AppDispatch } from "@/store";
import { fetchMyRegistrations } from "@/store/slices/eventSlice";
import { STORAGE_KEYS } from "@/constants";
import OptimizedImage from "@/components/ui/OptimizedImage";

// --- TYPES ---
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

interface WebSocketPayload {
  type: "CREATE" | "UPDATE" | "DELETE" | string;
  data: any;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caption: string) => void;
  initialCaption: string;
  initialImage?: string;
}

interface MomentCardProps {
  moment: Moment;
  isOwner: boolean;
  onDeleteRequest: (id: number) => void;
  onEdit: (moment: Moment) => void;
}

const getWebSocketUrl = () => {
  const apiUrl =
    import.meta.env.VITE_API_BASE_URL ||
    "https://ems-backend-jkjx.onrender.com/api";
  const rootUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${rootUrl}/ws`;
};

const getErrorMessage = (error: any) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (typeof error?.response?.data === "string") return error.response.data;
  return "Có lỗi xảy ra, vui lòng thử lại.";
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm font-noto shadow-2xl"
      >
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <FaExclamationTriangle />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            {message}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-colors shadow-lg shadow-red-900/30"
            >
              Xóa
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCaption,
  initialImage,
}) => {
  const [caption, setCaption] = useState(initialCaption);
  useEffect(() => {
    setCaption(initialCaption);
  }, [initialCaption, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-noto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-[#18181b] border border-zinc-700/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/2">
          <h3 className="text-sm font-bold text-white uppercase flex gap-2 items-center tracking-wider">
            <FaPen className="text-[#D4AF37]" /> Chỉnh sửa bài viết
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-5">
          {initialImage && (
            <div className="mb-4 rounded-xl overflow-hidden border border-white/10 relative bg-black/40">
              <img
                src={initialImage}
                alt="preview"
                className="w-full max-h-60 object-contain mx-auto opacity-90"
              />
            </div>
          )}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full bg-[#222] border border-white/10 rounded-xl p-4 text-zinc-100 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 outline-none min-h-[120px] text-sm resize-none leading-relaxed"
            placeholder="Nội dung bài viết..."
          />
        </div>

        <div className="p-4 bg-white/2 flex justify-end gap-3 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 uppercase transition-all"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(caption)}
            className="px-6 py-2.5 bg-[#D4AF37] text-black text-xs font-bold rounded-lg hover:bg-[#c9b96e] uppercase shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"
          >
            Lưu thay đổi
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const MomentCard: React.FC<MomentCardProps> = ({
  moment,
  isOwner,
  onDeleteRequest,
  onEdit,
}) => {
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
      exit={{ opacity: 0, scale: 0.95 }}
      className="break-inside-avoid mb-6 bg-[#18181b] rounded-2xl overflow-hidden border border-white/5 shadow-lg hover:border-[#D4AF37]/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 group font-noto"
    >
      <div className="p-4 flex justify-between items-center bg-white/2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <OptimizedImage
              src={moment.userAvatar}
              alt={moment.username}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full relative z-10"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">
              {moment.username}
            </span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wide font-medium">
              {moment.timeAgo}
            </span>
          </div>
        </div>

        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-zinc-500 hover:text-white p-2 hover:bg-white/5 rounded-full transition-all"
            >
              <FaEllipsisH />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-8 w-36 bg-[#222] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      onEdit(moment);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-colors"
                  >
                    <FaPen size={10} className="text-[#D4AF37]" /> Sửa bài
                  </button>
                  <button
                    onClick={() => {
                      onDeleteRequest(moment.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-xs font-bold text-red-400 hover:bg-white/10 hover:text-red-300 flex items-center gap-2 transition-colors border-t border-white/5"
                  >
                    <FaTrash size={10} /> Xóa bài
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="relative bg-[#111]">
        {hasImage && (
          <div className="relative overflow-hidden group/img cursor-pointer">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/img:opacity-100 transition-opacity z-10 pointer-events-none" />
            <OptimizedImage
              src={moment.imageUrl}
              alt="post"
              width={600}
              height={400}
              className="w-full max-h-[500px]"
            />
          </div>
        )}

        {moment.caption && (
          <div className="p-5">
            <p className="text-zinc-300 text-[14px] whitespace-pre-wrap leading-relaxed font-light">
              {moment.caption}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function EventMomentsPage() {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { myRegistrations } = useSelector((state: RootState) => state.events);

  const { user } = useSelector((state: RootState) => (state as any).auth);
  const currentUserAvatar =
    user?.avatarUrl ||
    user?.profileImage ||
    user?.image ||
    `https://ui-avatars.com/api/?background=random&color=fff&name=${
      user?.name || "User"
    }`;

  // States
  const [realEventId, setRealEventId] = useState<number | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [eventName, setEventName] = useState<string>("Đang tải...");

  const [moments, setMoments] = useState<Moment[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "MINE">("ALL");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [caption, setCaption] = useState("");
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const [editingMoment, setEditingMoment] = useState<Moment | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!eventSlug) return;
    const initialize = async () => {
      setIsInitializing(true);
      const foundInRedux = myRegistrations.find(
        (item: any) => item.eventSlug === eventSlug,
      );

      let foundBanner = null;

      if (foundInRedux) {
        setRealEventId(foundInRedux.eventId || foundInRedux.id);
        setEventName(foundInRedux.eventName);
        foundBanner =
          foundInRedux.eventBanner ||
          foundInRedux.bannerUrl ||
          foundInRedux.imageUrl;
        if (foundBanner) setBgImage(foundBanner);
      }

      try {
        const res: any = await axiosClient.get(`/events/${eventSlug}`);
        const data = res.data || res;

        if (data && (data.id || data.eventId)) {
          if (!realEventId) setRealEventId(data.id || data.eventId);
          setEventName(data.name || data.eventName || "");
          if (!foundBanner) {
            const apiBanner =
              data.eventBanner || data.bannerUrl || data.imageUrl || data.image;
            if (apiBanner) setBgImage(apiBanner);
          }
          if (!foundInRedux) dispatch(fetchMyRegistrations());
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    initialize();
  }, [eventSlug, dispatch, myRegistrations.length]);

  useEffect(() => {
    if (!realEventId) return;
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || "";
    const client = new Client({
      webSocketFactory: () => new SockJS(getWebSocketUrl()),
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/event/${realEventId}/moments`, (message) => {
          if (message.body) handleWebSocketMessage(JSON.parse(message.body));
        });
      },
    });
    client.activate();
    return () => {
      if (client) client.deactivate();
    };
  }, [realEventId]);

  const handleWebSocketMessage = (payload: WebSocketPayload) => {
    const { type, data } = payload;
    setMoments((prev) => {
      switch (type) {
        case "CREATE":
          return prev.some((m) => m.id === data.id) ? prev : [data, ...prev];
        case "UPDATE":
          return prev.map((m) => (m.id === data.id ? data : m));
        case "DELETE":
          return prev.filter((m) => m.id !== data);
        default:
          return prev;
      }
    });
  };

  const fetchMoments = async (reset = false) => {
    if (!realEventId) return;
    if (reset) setIsLoadingList(true);
    try {
      if (activeTab === "ALL") {
        const res: any = await momentApi.getMoments(
          realEventId,
          reset ? 0 : page,
          10,
        );
        const content = res.data?.content || res.content || [];
        const isLast = res.data?.last ?? res.last ?? true;

        if (reset) {
          setMoments(content);
          setPage(1);
        } else {
          setMoments((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            return [...prev, ...content.filter((n: Moment) => !ids.has(n.id))];
          });
          setPage((prev) => prev + 1);
        }
        setHasMore(!isLast && content.length > 0);
      } else {
        const res: any = await momentApi.getMyMoments(realEventId);
        setMoments(Array.isArray(res) ? res : res.data?.content || []);
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

  const handleUpload = async () => {
    if ((!caption.trim() && !fileToUpload) || !realEventId)
      return toast.warning("Chưa nhập nội dung");
    setIsUploading(true);
    try {
      let imageUrl = "";
      if (fileToUpload) {
        const formData = new FormData();
        formData.append("image", fileToUpload);
        const res: any = await axiosClient.post("/images/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = res.data?.url || res.data || res;
      }
      await momentApi.createMoment(realEventId, { caption, imageUrl });
      toast.success("Đã đăng bài thành công!");
      setCaption("");
      setPreviewImg(null);
      setFileToUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteId && realEventId) {
      try {
        await momentApi.deleteMoment(realEventId, deleteId);
        toast.success("Đã xóa.");
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setDeleteId(null);
      }
    }
  };

  const handleUpdate = async (newCaption: string) => {
    if (editingMoment && realEventId) {
      try {
        await momentApi.updateMoment(realEventId, editingMoment.id, {
          caption: newCaption,
          imageUrl: editingMoment.imageUrl || "",
        });
        setEditingMoment(null);
        toast.success("Cập nhật thành công.");
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFileToUpload(file);
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-noto selection:bg-[#D4AF37] selection:text-black relative">
      <div className="fixed inset-0 z-0 bg-black">
        {bgImage && (
          <div className="absolute inset-0 w-full h-full">
            <img
              src={bgImage}
              alt="bg"
              className="w-full h-full object-cover opacity-70 scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/80 to-black/30" />
            <div className="absolute inset-0 bg-linear-to-r from-black/50 via-transparent to-black/50" />
          </div>
        )}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-32 pb-24">
        <header className="mb-14 flex flex-col md:flex-row items-end justify-between gap-6 border-b border-white/10 pb-8 relative">
          <div className="flex items-center gap-5 relative z-10">
            <Link
              to="/my-tickets"
              className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 hover:border-[#D4AF37] transition-all group backdrop-blur-sm"
            >
              <FaArrowLeft className="text-zinc-300 group-hover:text-[#D4AF37] text-sm group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37] animate-pulse"></span>
                <p className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-[0.2em]">
                  Live Feed
                </p>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight max-w-3xl leading-none drop-shadow-xl">
                {eventName}
              </h1>
            </div>
          </div>

          <div className="relative p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex z-10 shadow-lg">
            {[
              { id: "ALL", label: "Cộng đồng" },
              { id: "MINE", label: "Bài của tôi" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all z-10 min-w-[120px] ${
                    isActive ? "text-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="tabBg"
                      className="absolute inset-0 bg-[#D4AF37] rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-20">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        {isInitializing ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <FaSpinner className="text-[#D4AF37] animate-spin text-3xl" />
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Đang kết nối máy chủ...
            </span>
          </div>
        ) : (
          <main>
            {activeTab === "ALL" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-20"
              >
                <div
                  className={`relative bg-black/40 backdrop-blur-xl border transition-all duration-300 rounded-[30px] p-6 shadow-2xl ${
                    isInputFocused
                      ? "border-[#D4AF37]/50 shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex gap-5 items-start">
                    <div className="shrink-0 hidden md:block">
                      <OptimizedImage
                        src={currentUserAvatar}
                        alt="Me"
                        width={56}
                        height={56}
                        className={`w-14 h-14 rounded-full ${isInputFocused ? "border-2 border-[#D4AF37]" : "border-2 border-white/10"} transition-colors`}
                      />
                    </div>

                    <div className="flex-1 w-full space-y-4">
                      <textarea
                        value={caption}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder={`Chia sẻ cảm nghĩ, hình ảnh về sự kiện này...`}
                        className="w-full bg-transparent text-lg text-white placeholder:text-zinc-500 outline-none resize-none min-h-[60px] leading-relaxed font-noto"
                      />

                      <AnimatePresence>
                        {previewImg && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="relative w-fit"
                          >
                            <img
                              src={previewImg}
                              alt="Preview"
                              className="max-h-[250px] rounded-xl border border-white/20 shadow-lg"
                            />
                            <button
                              onClick={() => {
                                setPreviewImg(null);
                                setFileToUpload(null);
                                if (fileInputRef.current)
                                  fileInputRef.current.value = "";
                              }}
                              className="absolute top-2 right-2 bg-black/70 backdrop-blur rounded-full p-2 hover:bg-red-500 text-white transition-colors border border-white/10"
                            >
                              <FaTimes size={10} />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="pt-4 border-t border-white/5 flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="group flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                          >
                            <div className="w-8 h-8 rounded-full bg-[#222] group-hover:bg-[#D4AF37] flex items-center justify-center text-[#D4AF37] group-hover:text-black transition-colors">
                              <FaImage className="text-sm" />
                            </div>
                            <span className="text-zinc-400 group-hover:text-white text-xs font-bold uppercase tracking-wide">
                              Thêm Ảnh
                            </span>
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={onFileSelect}
                          />
                        </div>

                        <button
                          onClick={handleUpload}
                          disabled={isUploading || (!caption && !fileToUpload)}
                          className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 shadow-lg ${
                            isUploading || (!caption && !fileToUpload)
                              ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                              : "bg-[#D4AF37] text-black hover:bg-white hover:scale-105 shadow-[#D4AF37]/20"
                          }`}
                        >
                          {isUploading ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <>
                              <FaPaperPlane className="text-xs" /> Đăng bài
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {isLoadingList && moments.length === 0 ? (
              <div className="py-20 flex justify-center opacity-60">
                <FaSpinner className="text-[#D4AF37] animate-spin text-3xl" />
              </div>
            ) : moments.length > 0 ? (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pb-12">
                <AnimatePresence>
                  {moments.map((m) => (
                    <MomentCard
                      key={m.id}
                      moment={m}
                      isOwner={
                        activeTab === "MINE" || (user && user.id === m.userId)
                      }
                      onDeleteRequest={setDeleteId}
                      onEdit={setEditingMoment}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-32 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-3xl opacity-50 bg-black/20">
                <div className="w-20 h-20 bg-[#111] rounded-full flex items-center justify-center mb-6">
                  <FaCamera className="text-3xl text-zinc-600" />
                </div>
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">
                  Chưa có bài viết nào
                </p>
              </div>
            )}

            {activeTab === "ALL" && hasMore && moments.length > 0 && (
              <div className="text-center mt-8 pb-10">
                <button
                  onClick={() => fetchMoments(false)}
                  className="px-10 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37] transition-all text-zinc-400"
                >
                  Tải thêm
                </button>
              </div>
            )}
          </main>
        )}

        <EditModal
          isOpen={!!editingMoment}
          onClose={() => setEditingMoment(null)}
          onSave={handleUpdate}
          initialCaption={editingMoment?.caption || ""}
          initialImage={editingMoment?.imageUrl}
        />
        <ConfirmModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleConfirmDelete}
          title="Xóa khoảnh khắc?"
          message="Bài viết này sẽ biến mất vĩnh viễn khỏi dòng thời gian sự kiện."
        />
      </div>
    </div>
  );
}
