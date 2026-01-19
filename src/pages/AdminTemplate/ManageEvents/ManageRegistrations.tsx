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
  FaCalendarAlt,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";

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

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PENDING:
      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 ring-yellow-500/20",
    APPROVED:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ring-emerald-500/20",
    CONFIRMED:
      "bg-green-500/10 text-green-400 border-green-500/20 ring-green-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/20 ring-red-500/20",
    CHECKED_IN:
      "bg-purple-500/10 text-purple-400 border-purple-500/20 ring-purple-500/20",
  };

  const labels: Record<string, string> = {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    CONFIRMED: "Đã xác nhận",
    REJECTED: "Từ chối",
    CHECKED_IN: "Đã Check-in",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ring-1 inline-flex items-center gap-1. 5 uppercase tracking-wider ${
        styles[status] || "text-gray-400 border-gray-700"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "PENDING" ? "animate-pulse" : ""
        } bg-current`}
      />
      {labels[status] || status}
    </span>
  );
};

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
    <div className="min-h-screen pb-20 font-sans text-gray-200 bg-[#090909]">
      {/* Header */}
      <div className="relative pt-8 pb-10 px-6 sm:px-10 border-b border-white/5 bg-[#0f0f0f]">
        <button
          onClick={() => navigate("/admin/events")}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#B5A65F] transition-colors mb-6 group w-fit"
        >
          <div className="p-2 rounded-full border border-white/10 group-hover:border-[#B5A65F] transition-colors">
            <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          Quay lại danh sách
        </button>

        <div className="flex flex-col xl:flex-row justify-between items-end gap-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black text-white mb-2 uppercase tracking-tight"
            >
              Quản lý đăng ký
            </motion.h1>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              Event Reference:{" "}
              <span className="bg-[#1a1a1a] px-2 py-1 rounded text-[#B5A65F] font-mono border border-white/10">
                #{eventId}
              </span>
            </p>
          </div>

          <div className="flex gap-4">
            <div className="relative overflow-hidden group px-6 py-4 rounded-2xl bg-[#141414] border border-white/5 hover:border-white/10 transition-all min-w-[140px]">
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

            <div className="relative overflow-hidden group px-6 py-4 rounded-2xl bg-gradient-to-br from-[#1f1a0b] to-[#141414] border border-[#B5A65F]/30 min-w-[140px]">
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

      {/* Filters */}
      <div className="px-6 sm:px-10 -mt-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#141414]/80 backdrop-blur-md p-2 rounded-2xl border border-white/5 shadow-2xl mb-8">
          <div className="flex gap-1 bg-[#0a0a0a] p-1. 5 rounded-xl w-full md:w-auto overflow-x-auto custom-scrollbar">
            {["ALL", "PENDING", "APPROVED", "REJECTED", "CHECKED_IN"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`
                    px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap
                    ${
                      filterStatus === status
                        ? "bg-[#B5A65F] text-black shadow-lg shadow-[#B5A65F]/20"
                        : "text-gray-400 hover: text-gray-200 hover:bg-white/5"
                    }
                  `}
                >
                  {status === "ALL" ? "Tất cả" : status}
                </button>
              ),
            )}
          </div>

          <div className="relative w-full md:w-80 group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#B5A65F] transition-colors" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, ticket ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#B5A65F]/50 focus:ring-4 focus:ring-[#B5A65F]/10 focus:outline-none transition-all placeholder-gray-700"
            />
          </div>
        </div>

        {/* Table */}
        <div className="w-full">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead className="hidden md:table-header-group">
              <tr className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">
                <th className="px-4 pb-2">Hồ sơ người dùng</th>
                <th className="px-4 pb-2">Liên lạc</th>
                <th className="px-4 pb-2">Chi tiết vé</th>
                <th className="px-4 pb-2 text-center">Tình trạng</th>
                <th className="px-4 pb-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="align-middle">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr
                    key={i}
                    className="bg-[#141414] rounded-2xl animate-pulse h-20"
                  >
                    <td
                      colSpan={5}
                      className="rounded-xl border border-white/5"
                    ></td>
                  </tr>
                ))
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="inline-flex flex-col items-center justify-center bg-[#141414] p-8 rounded-3xl border border-dashed border-white/10">
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
                      className="bg-[#141414] hover:bg-[#1a1a1a] transition-all group shadow-sm border border-transparent hover:border-white/10"
                    >
                      {/* USER INFO */}
                      <td className="px-4 py-4 rounded-l-2xl border-l border-y border-white/5 group-hover:border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#222] ring-1 ring-white/10 overflow-hidden shrink-0 shadow-lg">
                            {item.avatarUrl ? (
                              <OptimizedImage
                                src={item.avatarUrl}
                                alt={item.username || "User"}
                                width={48}
                                height={48}
                                className="w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <FaUser />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white text-base group-hover:text-[#B5A65F] transition-colors flex items-center gap-2">
                              {item.username || "Unknown"}
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono mt-0.5 flex items-center gap-1">
                              ID: {item.userId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT */}
                      <td className="px-4 py-4 border-y border-white/5 group-hover:border-white/10">
                        <div className="space-y-1. 5">
                          <div className="flex items-center gap-2. 5">
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
                      <td className="px-4 py-4 border-y border-white/5 group-hover:border-white/10">
                        <div className="space-y-2">
                          {item.ticketCode ? (
                            <div className="flex items-center gap-2 w-fit bg-[#221a2c] text-[#d8b4fe] border border-[#d8b4fe]/20 px-2. 5 py-1 rounded text-[10px] font-mono tracking-wide">
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
                      <td className="px-4 py-4 text-center border-y border-white/5 group-hover:border-white/10">
                        <StatusBadge status={item.status} />
                        {item.eventCheckInStatus === "CHECKED_IN" && (
                          <div className="mt-2 inline-flex items-center gap-1 text-[9px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            <FaTicketAlt /> Checked-In
                          </div>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-4 rounded-r-2xl border-r border-y border-white/5 group-hover:border-white/10 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openDetailModal(item)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-[#B5A65F]/10 border border-white/10 hover:border-[#B5A65F]/30 text-gray-400 hover:text-[#B5A65F] transition-all"
                            title="Xem chi tiết hoạt động"
                          >
                            <FaEye size={14} />
                          </button>

                          {item.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(item.id)}
                                className="group/btn relative px-3 py-2 rounded-lg bg-emerald-900/20 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 hover:text-white hover:border-emerald-400 transition-all"
                                title="Duyệt"
                              >
                                <FaCheck size={12} />
                              </button>

                              <button
                                onClick={() => openRejectModal(item.id)}
                                className="px-3 py-2 rounded-lg bg-red-900/10 hover:bg-red-900/30 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-colors"
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

        {/* Pagination */}
        {!isLoading && filteredData.length > 0 && (
          <div className="py-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest bg-[#1a1a1a] px-3 py-1 rounded-full border border-white/5">
              Page {currentPage} of {totalPages} ({filteredData.length} records)
            </span>
            <div className="flex gap-2 p-1 bg-[#141414] border border-white/5 rounded-xl">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-transparent text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <FaChevronLeft size={10} />
              </button>

              <div className="flex items-center px-2">
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

      {/* ========== REJECT MODAL ========== */}
      <AnimatePresence>
        {isRejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
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
              className="relative bg-[#0a0a0a] border border-red-500/20 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(239,68,68,0.1)] overflow-hidden"
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
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  Bạn có chắc chắn muốn từ chối yêu cầu này không? Hành động này
                  sẽ gửi email thông báo cho người dùng và không thể hoàn tác
                  ngay lập tức.
                </p>

                <div className="mb-6">
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block tracking-widest">
                    Lý do từ chối
                  </label>
                  <textarea
                    autoFocus
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ví dụ: Sai thông tin xác thực, ảnh không hợp lệ..."
                    className="w-full bg-[#141414] border border-white/10 rounded-xl p-4 text-sm text-white focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition-all resize-none placeholder-gray-700"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => setIsRejectModalOpen(false)}
                    className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleRejectSubmit}
                    className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-all"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========== DETAIL MODAL - ĐÃ FIX CÁCH TOP ========== */}
      <AnimatePresence>
        {isDetailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 sm:py-12">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDetailModal}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl max-h-[calc(100vh-64px)] sm:max-h-[calc(100vh-96px)] bg-gradient-to-b from-[#131313] to-[#0a0a0a] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="relative px-5 sm:px-6 py-4 sm:py-5 border-b border-white/5 bg-[#0f0f0f] shrink-0">
                <div className="flex items-center gap-3 sm:gap-4 pr-12">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#B5A65F] to-[#8a7b3d] flex items-center justify-center text-black shadow-lg shadow-[#B5A65F]/20 shrink-0">
                    <FaTicketAlt size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
                      Thông tin đăng ký
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      ID: #{selectedRegistrationDetail?.id || "---"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeDetailModal}
                  className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-white/5 hover: bg-red-500/20 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-all"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar">
                {isDetailLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#B5A65F]/10 flex items-center justify-center mb-4 animate-pulse">
                      <FaSpinner className="animate-spin text-xl sm:text-2xl text-[#B5A65F]" />
                    </div>
                    <p className="text-sm text-gray-500">
                      Đang tải thông tin...
                    </p>
                  </div>
                ) : selectedRegistrationDetail ? (
                  <div className="space-y-5 sm:space-y-6">
                    {/* User & Ticket Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* User Card */}
                      <div className="bg-[#161616] rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <FaUser className="text-blue-400 text-xs" />
                          </div>
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                            Người tham gia
                          </span>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="relative shrink-0">
                            {selectedRegistrationDetail.avatarUrl ? (
                              <OptimizedImage
                                src={selectedRegistrationDetail.avatarUrl}
                                alt={
                                  selectedRegistrationDetail.username || "User"
                                }
                                width={56}
                                height={56}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl ring-2 ring-white/10"
                              />
                            ) : (
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ring-2 ring-white/10">
                                <FaUser className="text-gray-500 text-lg sm:text-xl" />
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500 border-2 border-[#161616]" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-sm sm:text-base truncate">
                              {selectedRegistrationDetail.username}
                            </h4>
                            <p className="text-xs text-gray-400 truncate flex items-center gap-1.5 mt-1">
                              <FaEnvelope className="text-gray-600 shrink-0" />
                              {selectedRegistrationDetail.email}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                              <FaPhone className="text-gray-600 shrink-0" />
                              {selectedRegistrationDetail.phoneNumber ||
                                "Chưa cập nhật"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Card */}
                      <div className="bg-[#161616] rounded-xl sm: rounded-2xl p-4 sm:p-5 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 rounded-lg bg-[#B5A65F]/20 flex items-center justify-center">
                            <FaQrcode className="text-[#B5A65F] text-xs" />
                          </div>
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                            Thông tin vé
                          </span>
                        </div>

                        <div className="space-y-3">
                          {/* Ticket Code */}
                          <div className="bg-[#0d0d0d] rounded-lg sm:rounded-xl px-3 sm:px-4 py-2. 5 sm:py-3 border border-dashed border-[#B5A65F]/30">
                            <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">
                              Mã vé
                            </p>
                            <p className="text-[#B5A65F] font-mono text-xs sm:text-sm font-bold break-all">
                              {selectedRegistrationDetail.ticketCode || "---"}
                            </p>
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">
                                Ngày ĐK
                              </p>
                              <p className="text-white text-xs sm:text-sm font-medium">
                                {selectedRegistrationDetail.registrationDate
                                  ? new Date(
                                      selectedRegistrationDetail.registrationDate,
                                    ).toLocaleDateString("vi-VN")
                                  : "---"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">
                                Trạng thái
                              </p>
                              <StatusBadge
                                status={selectedRegistrationDetail.status}
                              />
                            </div>
                          </div>

                          {/* Event Check-in */}
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <span className="text-xs text-gray-500">
                              Check-in sự kiện
                            </span>
                            {selectedRegistrationDetail.eventCheckInStatus ===
                            "CHECKED_IN" ? (
                              <span className="inline-flex items-center gap-1. 5 text-[10px] sm:text-xs font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                                <FaCheckCircle /> Đã check-in
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                                <FaClock /> Chưa check-in
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Activities Section */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-[#B5A65F] to-transparent rounded-full" />
                        <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                          Hoạt động đã đăng ký
                        </h4>
                        <span className="text-[10px] sm:text-xs text-[#B5A65F] bg-[#B5A65F]/10 px-2 py-0.5 rounded-full font-bold">
                          {selectedRegistrationDetail.activities?.length || 0}
                        </span>
                      </div>

                      {!selectedRegistrationDetail.activities ||
                      selectedRegistrationDetail.activities.length === 0 ? (
                        <div className="text-center py-8 sm:py-10 bg-[#161616] rounded-xl sm:rounded-2xl border border-dashed border-white/10">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                            <FaTicketAlt className="text-gray-600 text-lg sm:text-xl" />
                          </div>
                          <p className="text-gray-400 font-medium text-sm">
                            Vé vào cửa tiêu chuẩn
                          </p>
                          <p className="text-gray-600 text-xs mt-1 max-w-xs mx-auto px-4">
                            Người dùng chỉ đăng ký tham gia sự kiện chung
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2. 5 sm:space-y-3">
                          {selectedRegistrationDetail.activities.map(
                            (activity, idx) => (
                              <div
                                key={activity.activityId || idx}
                                className="group bg-[#161616] rounded-xl sm:rounded-2xl p-3. 5 sm:p-4 border border-white/5 hover:border-[#B5A65F]/20 transition-all"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  {/* Left - Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-[#B5A65F]/10 flex items-center justify-center text-[#B5A65F] text-[10px] sm:text-xs font-bold shrink-0">
                                        {idx + 1}
                                      </span>
                                      <h5 className="font-bold text-white text-xs sm:text-sm group-hover:text-[#B5A65F] transition-colors truncate">
                                        {activity.activityName || "Hoạt động"}
                                      </h5>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-[10px] sm:text-xs text-gray-500 pl-7 sm:pl-8">
                                      {activity.startTime && (
                                        <span className="flex items-center gap-1.5">
                                          <FaCalendarAlt className="text-gray-600" />
                                          {new Date(
                                            activity.startTime,
                                          ).toLocaleString("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                          {activity.endTime && (
                                            <span className="text-gray-600">
                                              {" → "}
                                              {new Date(
                                                activity.endTime,
                                              ).toLocaleTimeString("vi-VN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              })}
                                            </span>
                                          )}
                                        </span>
                                      )}
                                      {activity.roomOrVenue && (
                                        <span className="flex items-center gap-1.5">
                                          <FaMapMarkerAlt className="text-gray-600" />
                                          {activity.roomOrVenue}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right - Status */}
                                  <div className="flex items-center sm:flex-col gap-2 sm:items-end pl-7 sm:pl-0 shrink-0">
                                    <StatusBadge
                                      status={activity.activityStatus}
                                    />
                                    {activity.activityCheckInStatus ===
                                    "CHECKED_IN" ? (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
                                        <FaCheckCircle /> Đã check-in
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-medium text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                                        <FaClock /> Chưa check-in
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                      <FaTimes className="text-xl sm:text-2xl text-red-400" />
                    </div>
                    <p className="text-sm text-gray-500">
                      Không thể tải thông tin
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 sm:px-6 py-4 border-t border-white/5 bg-[#0a0a0a] shrink-0">
                <button
                  onClick={closeDetailModal}
                  className="w-full py-2.5 sm:py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover: border-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98]"
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
