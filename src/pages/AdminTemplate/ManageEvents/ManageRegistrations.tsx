import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaQrcode,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaUsers,
  FaTicketAlt,
  FaEye,
  FaMapMarkerAlt,
  FaUserCheck,
  FaIdCard,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

// Import types and actions (Giữ nguyên theo project của bạn)
import type { AppDispatch, RootState } from "@/store";
import {
  fetchEventRegistrations,
  fetchRegistrationDetail,
  approveRegistration,
  rejectRegistration,
  clearRegistrations,
  clearRegistrationDetail,
} from "@/store/slices/eventSlice";
import OptimizedImage from "@/components/ui/OptimizedImage";

const ITEMS_PER_PAGE = 8;

// --- STATUS BADGE COMPONENT ---
const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: {
      bg: "bg-amber-500/10 border-amber-500/30",
      text: "text-amber-400",
      label: "Chờ duyệt",
    },
    APPROVED: {
      bg: "bg-emerald-500/10 border-emerald-500/30",
      text: "text-emerald-400",
      label: "Đã duyệt",
    },
    CONFIRMED: {
      bg: "bg-green-500/10 border-green-500/30",
      text: "text-green-400",
      label: "Xác nhận",
    },
    REJECTED: {
      bg: "bg-red-500/10 border-red-500/30",
      text: "text-red-400",
      label: "Từ chối",
    },
    CHECKED_IN: {
      bg: "bg-violet-500/10 border-violet-500/30",
      text: "text-violet-400",
      label: "Đã Check-in",
    },
  };

  const { bg, text, label } = config[status] || {
    bg: "bg-gray-500/10 border-gray-500/30",
    text: "text-gray-400",
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${bg} ${text} uppercase tracking-wider whitespace-nowrap`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full bg-current ${
          status === "PENDING" ? "animate-pulse" : ""
        }`}
      />
      {label}
    </span>
  );
};

// --- MAIN COMPONENT ---
export default function ManageRegistrations() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const {
    registrations,
    selectedRegistrationDetail,
    isLoading,
    isDetailLoading,
  } = useSelector((state: RootState) => state.events);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventRegistrations(Number(eventId)));
    }
    return () => {
      dispatch(clearRegistrations());
    };
  }, [eventId, dispatch]);

  const filteredData = useMemo(() => {
    return registrations.filter((item: any) => {
      const matchStatus =
        filterStatus === "ALL" || item.status === filterStatus;
      const matchSearch =
        (item.username || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (item.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.ticketCode || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchStatus && matchSearch;
    });
  }, [registrations, filterStatus, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  const handleApprove = async (regId: number) => {
    try {
      await dispatch(approveRegistration(regId)).unwrap();
      toast.success("Đã duyệt vé thành công!");
    } catch (error: any) {
      toast.error(error || "Có lỗi xảy ra");
    }
  };

  const openRejectModal = (regId: number) => {
    setSelectedRegId(regId);
    setReason("");
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedRegId || !reason.trim()) {
      toast.warning("Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      await dispatch(
        rejectRegistration({ registrationId: selectedRegId, reason }),
      ).unwrap();
      toast.success("Đã từ chối vé!");
      setIsRejectModalOpen(false);
    } catch (error: any) {
      toast.error(error || "Có lỗi xảy ra");
    }
  };

  const openDetailModal = async (item: any) => {
    setIsDetailModalOpen(true);
    dispatch(clearRegistrationDetail());

    try {
      await dispatch(fetchRegistrationDetail(item.id)).unwrap();
    } catch (error) {
      console.error("Không lấy được chi tiết đăng ký", error);
      toast.error("Không thể tải thông tin chi tiết");
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    dispatch(clearRegistrationDetail());
  };

  return (
    <div className="min-h-screen font-noto text-gray-200 bg-[#090909] pb-20">
      {/* --- HEADER SECTION --- */}
      {/* Thêm padding bottom lớn trên desktop để tạo hiệu ứng overlap, nhưng mobile thì padding thường */}
      <div className="relative pt-6 pb-6 lg:pt-8 lg:pb-20 px-4 sm:px-6 lg:px-10 border-b border-white/5 bg-[#0f0f0f]">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/events")}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#B5A65F] transition-colors mb-6 group w-fit"
        >
          <div className="p-2 rounded-full border border-white/10 group-hover:border-[#B5A65F] transition-colors">
            <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          Quay lại danh sách
        </button>

        {/* Title & Stats */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-10">
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-black text-white mb-2 uppercase tracking-tight"
            >
              Quản lý đăng ký
            </motion.h1>
            <p className="text-gray-400 text-sm flex flex-wrap items-center gap-2">
              Event Reference:{" "}
              <span className="bg-[#1a1a1a] px-2 py-1 rounded text-[#B5A65F] font-mono border border-white/10 break-all">
                #{eventId}
              </span>
            </p>
          </div>

          {/* Stats Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="relative overflow-hidden group px-6 py-4 rounded-2xl bg-[#141414] border border-white/5 hover:border-white/10 transition-all">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <FaUsers size={40} />
              </div>
              <span className="text-3xl font-black text-white block mb-1">
                {registrations.length}
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Tổng đăng ký
              </span>
            </div>

            <div className="relative overflow-hidden group px-6 py-4 rounded-2xl bg-gradient-to-br from-[#1f1a0b] to-[#141414] border border-[#B5A65F]/30">
              <div className="absolute top-0 right-0 p-3 text-[#B5A65F] opacity-10 group-hover:opacity-30 transition-opacity">
                <FaClock size={40} />
              </div>
              <span className="text-3xl font-black text-[#B5A65F] block mb-1">
                {
                  registrations.filter((r: any) => r.status === "PENDING")
                    .length
                }
              </span>
              <span className="text-[10px] text-[#B5A65F]/80 font-bold uppercase tracking-widest">
                Cần duyệt ngay
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT & FILTERS --- */}
      {/* Margin-top âm chỉ áp dụng trên màn hình lớn (lg) */}
      <div className="px-4 sm:px-6 lg:px-10 mt-6 lg:-mt-10">
        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-[#141414]/90 backdrop-blur-md p-2 rounded-2xl border border-white/5 shadow-2xl mb-8">
          {/* Status Tabs - Scroll ngang trên mobile */}
          <div className="flex gap-1 bg-[#0a0a0a] p-1.5 rounded-xl overflow-x-auto custom-scrollbar lg:w-auto w-full">
            {["ALL", "PENDING", "APPROVED", "REJECTED", "CHECKED_IN"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`
                    px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap flex-shrink-0
                    ${
                      filterStatus === status
                        ? "bg-[#B5A65F] text-black shadow-lg shadow-[#B5A65F]/20"
                        : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                    }
                  `}
                >
                  {status === "ALL" ? "Tất cả" : status}
                </button>
              ),
            )}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-80 group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#B5A65F] transition-colors" />
            <input
              type="text"
              placeholder="Tìm tên, email, ticket ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#B5A65F]/50 focus:ring-4 focus:ring-[#B5A65F]/10 focus:outline-none transition-all placeholder-gray-700"
            />
          </div>
        </div>

        {/* --- DATA TABLE --- */}
        {/* Quan trọng: overflow-x-auto để cuộn ngang bảng trên mobile */}
        <div className="w-full overflow-hidden rounded-2xl border border-white/5 bg-[#141414]/50">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-separate border-spacing-y-1 whitespace-nowrap">
              <thead className="bg-[#1a1a1a] text-gray-500 text-[10px] uppercase tracking-wider font-bold sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">Hồ sơ người dùng</th>
                  <th className="px-6 py-4">Liên lạc</th>
                  <th className="px-6 py-4">Chi tiết vé</th>
                  <th className="px-6 py-4 text-center">Tình trạng</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="align-middle">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-4 py-2">
                        <div className="h-20 bg-[#1a1a1a] rounded-xl"></div>
                      </td>
                    </tr>
                  ))
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center p-8">
                        <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-4">
                          <FaSearch className="text-2xl text-gray-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-300">
                          Không tìm thấy dữ liệu
                        </h3>
                        <p className="text-sm text-gray-600">
                          Thử thay đổi bộ lọc hoặc tìm kiếm khác
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {currentData.map((item: any) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={item.id}
                        className="group bg-[#141414] hover:bg-[#1f1f1f] transition-colors"
                      >
                        {/* USER INFO */}
                        <td className="px-6 py-4 border-b border-white/5 group-last:border-0">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#222] ring-1 ring-white/10 overflow-hidden shrink-0 shadow-lg">
                              {item.avatarUrl ? (
                                <OptimizedImage
                                  src={item.avatarUrl}
                                  alt={item.username || "User"}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                  <FaUser />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm sm:text-base group-hover:text-[#B5A65F] transition-colors">
                                {item.username || "Unknown"}
                              </div>
                              <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                                ID: {item.userId}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* CONTACT */}
                        <td className="px-6 py-4 border-b border-white/5 group-last:border-0">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-[#1e1e1e] flex items-center justify-center text-gray-500 text-[10px]">
                                <FaEnvelope />
                              </div>
                              <span
                                className="text-xs text-gray-300 font-medium truncate max-w-[150px]"
                                title={item.email}
                              >
                                {item.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-[#1e1e1e] flex items-center justify-center text-gray-500 text-[10px]">
                                <FaPhone />
                              </div>
                              <span className="text-xs text-gray-400 font-mono">
                                {item.phoneNumber || "---"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* TICKET INFO */}
                        <td className="px-6 py-4 border-b border-white/5 group-last:border-0">
                          <div className="space-y-2">
                            {item.ticketCode ? (
                              <div className="flex items-center gap-2 w-fit bg-[#221a2c] text-[#d8b4fe] border border-[#d8b4fe]/20 px-2.5 py-1 rounded text-[10px] font-mono tracking-wide">
                                <FaQrcode /> {item.ticketCode}
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-1 rounded">
                                Processing
                              </span>
                            )}
                            <div className="text-[10px] text-gray-500 flex items-center gap-1">
                              <FaClock size={10} />
                              {item.registrationDate
                                ? new Date(
                                    item.registrationDate,
                                  ).toLocaleDateString("vi-VN")
                                : "---"}
                            </div>
                          </div>
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-4 text-center border-b border-white/5 group-last:border-0">
                          <div className="flex flex-col items-center gap-2">
                            <StatusBadge status={item.status} />
                            {item.eventCheckInStatus === "CHECKED_IN" && (
                              <div className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 whitespace-nowrap">
                                <FaTicketAlt /> Checked-In
                              </div>
                            )}
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-4 text-right border-b border-white/5 group-last:border-0">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openDetailModal(item)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-[#B5A65F]/10 border border-white/10 hover:border-[#B5A65F]/30 text-gray-400 hover:text-[#B5A65F] transition-all"
                              title="Xem chi tiết"
                            >
                              <FaEye size={14} />
                            </button>

                            {item.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleApprove(item.id)}
                                  className="p-2 rounded-lg bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 hover:text-white hover:border-emerald-400 transition-all"
                                  title="Duyệt"
                                >
                                  <FaCheck size={12} />
                                </button>

                                <button
                                  onClick={() => openRejectModal(item.id)}
                                  className="p-2 rounded-lg bg-red-900/10 hover:bg-red-900/30 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-colors"
                                  title="Từ chối"
                                >
                                  <FaTimes size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- PAGINATION --- */}
        {!isLoading && filteredData.length > 0 && (
          <div className="py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest bg-[#1a1a1a] px-3 py-1 rounded-full border border-white/5">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2 p-1 bg-[#141414] border border-white/5 rounded-xl">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-transparent text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <FaChevronLeft size={10} />
              </button>

              <div className="flex items-center px-4">
                <span className="text-sm font-bold text-white">
                  {currentPage}
                </span>
                <span className="text-xs text-gray-600 mx-1">/</span>
                <span className="text-xs text-gray-500">{totalPages}</span>
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-transparent text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <FaChevronRight size={10} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========== REJECT MODAL (Updated) ========== */}
      <AnimatePresence>
        {isRejectModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRejectModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-[#0a0a0a] border border-red-500/20 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="bg-red-500/10 px-6 py-4 border-b border-red-500/20 flex items-center justify-between">
                <h3 className="text-lg font-bold text-red-500 uppercase tracking-wide flex items-center gap-2">
                  <FaTimes className="text-xl" /> Từ chối vé
                </h3>
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="text-red-500/50 hover:text-red-500 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-400 mb-4">
                  Hành động này sẽ gửi email thông báo cho người dùng.
                </p>
                <textarea
                  autoFocus
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nhập lý do từ chối..."
                  className="w-full bg-[#141414] border border-white/10 rounded-xl p-4 text-sm text-white focus:border-red-500/50 focus:outline-none transition-all resize-none"
                />
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    onClick={() => setIsRejectModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:bg-white/5 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleRejectSubmit}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========== DETAIL MODAL (Fully Responsive) ========== */}
      {/* ========== DETAIL MODAL (Fixed Layout) ========== */}
      <AnimatePresence>
        {isDetailModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDetailModal}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              // QUAN TRỌNG: max-h-[85vh] để chừa khoảng trống trên dưới
              // flex flex-col: Để xếp dọc Header - Body - Footer
              className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-[#0c0c0c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* --- HEADER (Fixed) --- */}
              {/* shrink-0: Không cho phép bị co lại khi hết chỗ */}
              <div className="shrink-0 relative px-6 py-5 border-b border-white/5 bg-[#141414] z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#B5A65F] flex items-center justify-center shadow-lg shadow-[#B5A65F]/20">
                      <FaIdCard className="text-black text-xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        Chi tiết đăng ký{" "}
                        <HiSparkles className="text-[#B5A65F]" />
                      </h3>
                      <p className="text-xs text-gray-500 font-mono">
                        #{selectedRegistrationDetail?.id || "---"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeDetailModal}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              {/* --- BODY CONTENT (Scrollable) --- */}
              {/* flex-1: Chiếm hết khoảng trống còn lại */}
              {/* overflow-y-auto: Chỉ cuộn phần này */}
              {/* min-h-0: Bắt buộc để scroll hoạt động đúng trong flex nested */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar min-h-0 bg-[#0c0c0c]">
                {isDetailLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-[#B5A65F] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : selectedRegistrationDetail ? (
                  <div className="space-y-6">
                    {/* Grid thông tin User & Vé */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* User Info */}
                      <div className="bg-[#141414] rounded-2xl p-5 border border-white/5">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                          <FaUserCheck /> Người đăng ký
                        </h4>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 shrink-0">
                            {selectedRegistrationDetail.avatarUrl ? (
                              <OptimizedImage
                                src={selectedRegistrationDetail.avatarUrl}
                                alt="User"
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FaUser className="w-full h-full p-4 text-gray-600" />
                            )}
                          </div>
                          <div className="overflow-hidden min-w-0">
                            <p className="font-bold text-white text-lg truncate">
                              {selectedRegistrationDetail.username}
                            </p>
                            <p className="text-gray-400 text-sm truncate">
                              {selectedRegistrationDetail.email}
                            </p>
                            <p className="text-gray-500 text-sm font-mono mt-1">
                              {selectedRegistrationDetail.phoneNumber ||
                                "No Phone"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Info */}
                      <div className="bg-[#141414] rounded-2xl p-5 border border-white/5 relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-[#B5A65F]/10 rounded-full blur-2xl" />
                        <div>
                          <h4 className="text-xs font-bold text-[#B5A65F] uppercase mb-4 flex items-center gap-2">
                            <FaQrcode /> Thông tin vé
                          </h4>
                          <div className="bg-black/40 rounded-lg p-3 border border-dashed border-[#B5A65F]/30 mb-3">
                            <p className="text-[#B5A65F] font-mono font-bold text-center break-all text-sm">
                              {selectedRegistrationDetail.ticketCode || "---"}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <StatusBadge
                            status={selectedRegistrationDetail.status}
                          />
                          <span className="text-xs text-gray-500 font-mono">
                            {selectedRegistrationDetail.registrationDate
                              ? new Date(
                                  selectedRegistrationDetail.registrationDate,
                                ).toLocaleDateString("vi-VN")
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Danh sách hoạt động (Nguyên nhân gây tràn) */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 bg-[#B5A65F] rounded-full"></div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          Hoạt động đã đăng ký
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {selectedRegistrationDetail.activities?.length > 0 ? (
                          selectedRegistrationDetail.activities.map(
                            (act: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-[#141414] p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:border-[#B5A65F]/30 transition-colors group"
                              >
                                <div className="w-10 h-10 rounded-lg bg-[#2a2a2a] group-hover:bg-[#B5A65F] group-hover:text-black transition-colors flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
                                  {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-white text-base truncate pr-2">
                                    {act.activityName}
                                  </p>
                                  <div className="text-xs text-gray-500 mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                                    <span className="flex items-center gap-1.5">
                                      <FaMapMarkerAlt className="text-[#B5A65F]" />{" "}
                                      {act.roomOrVenue || "N/A"}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      <FaClock className="text-[#B5A65F]" />{" "}
                                      {act.startTime
                                        ? new Date(
                                            act.startTime,
                                          ).toLocaleTimeString("vi-VN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : "--:--"}
                                    </span>
                                  </div>
                                </div>
                                <div className="shrink-0 mt-2 sm:mt-0">
                                  <StatusBadge status={act.activityStatus} />
                                </div>
                              </div>
                            ),
                          )
                        ) : (
                          <div className="text-center py-8 bg-[#141414] rounded-xl border border-dashed border-white/10">
                            <p className="text-gray-500 italic text-sm">
                              Chưa đăng ký hoạt động cụ thể nào.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    Không có dữ liệu
                  </div>
                )}
              </div>

              {/* --- FOOTER (Fixed) --- */}
              {/* shrink-0: Luôn hiển thị ở dưới cùng, không bị đẩy mất */}
              <div className="shrink-0 p-4 border-t border-white/5 bg-[#141414] z-10">
                <button
                  onClick={closeDetailModal}
                  className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.99] text-white font-bold uppercase tracking-wider transition-all"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
