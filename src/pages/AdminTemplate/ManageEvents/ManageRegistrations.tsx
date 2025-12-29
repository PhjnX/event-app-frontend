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
  FaFilter,
} from "react-icons/fa";

import type { AppDispatch, RootState } from "../../../store";
import {
  fetchEventRegistrations,
  approveRegistration,
  rejectRegistration,
  clearRegistrations,
} from "../../../store/slices/eventSlice";

const ITEMS_PER_PAGE = 10;


const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    APPROVED: "bg-green-500/10 text-green-500 border-green-500/20",
    CONFIRMED: "bg-green-500/10 text-green-500 border-green-500/20",
    REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
    CHECKED_IN: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };

  const labels: Record<string, string> = {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    CONFIRMED: "Đã xác nhận",
    REJECTED: "Từ chối",
    CHECKED_IN: "Đã check-in",
  };

  const defaultStyle = "bg-gray-500/10 text-gray-400 border-gray-500/20";

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${
        styles[status] || defaultStyle
      }`}
    >
      {labels[status] || status}
    </span>
  );
};

export default function ManageRegistrations() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { registrations, isLoading } = useSelector(
    (state: RootState) => state.events
  );

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState<number | null>(null);
  const [reason, setReason] = useState("");

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
        rejectRegistration({ registrationId: selectedRegId, reason })
      ).unwrap();
      toast.success("Đã từ chối vé!");
      setIsRejectModalOpen(false);
    } catch (error: any) {
      toast.error(error || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="min-h-screen pb-20 font-sans text-white bg-black">
      <div className="pt-6 mb-8">
        <button
          onClick={() => navigate("/admin/events")}
          className="flex items-center gap-2 text-gray-400 hover:text-[#B5A65F] transition-colors mb-6 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Quay lại danh sách</span>
        </button>

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Quản lý người tham gia
            </h1>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              Sự kiện ID:{" "}
              <span className="text-[#B5A65F] font-mono font-bold">
                #{eventId}
              </span>
            </p>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-4">
            <div className="px-5 py-3 rounded-2xl bg-[#1a1a1a] border border-white/5 flex flex-col items-center min-w-[100px]">
              <span className="text-2xl font-bold text-white">
                {registrations.length}
              </span>
              <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">
                Tổng
              </span>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-[#1a1a1a] border border-[#B5A65F]/20 flex flex-col items-center min-w-[100px]">
              <span className="text-2xl font-bold text-[#B5A65F]">
                {
                  registrations.filter((r: any) => r.status === "PENDING")
                    .length
                }
              </span>
              <span className="text-[10px] uppercase text-[#B5A65F] font-bold tracking-wider">
                Chờ duyệt
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-[#141414] p-2 rounded-2xl border border-white/5">
        <div className="flex gap-1 p-1 bg-[#0a0a0a] rounded-xl w-full md:w-auto overflow-x-auto">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === status
                  ? "bg-[#B5A65F] text-black shadow-lg shadow-[#B5A65F]/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {status === "ALL" ? "Tất cả" : status}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm tên, email, mã vé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-[#B5A65F] focus:outline-none transition-colors placeholder-gray-600"
          />
        </div>
      </div>

      <div className="w-full bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1a1a] border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Người tham gia</th>
                <th className="px-6 py-4 font-semibold">Liên hệ</th>
                <th className="px-6 py-4 font-semibold">Thông tin vé</th>
                <th className="px-6 py-4 font-semibold">Ngày đăng ký</th>
                <th className="px-6 py-4 font-semibold text-center">
                  Trạng thái
                </th>
                <th className="px-6 py-4 font-semibold text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-10 w-10 bg-gray-800 rounded-full inline-block mr-3"></div>
                      <div className="h-4 w-32 bg-gray-800 rounded inline-block"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-40 bg-gray-800 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 bg-gray-800 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-800 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 bg-gray-800 rounded mx-auto"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 w-8 bg-gray-800 rounded-full float-right"></div>
                    </td>
                  </tr>
                ))
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-50">
                      <FaFilter className="text-4xl text-gray-600 mb-3" />
                      <p className="text-gray-400">
                        Không tìm thấy dữ liệu phù hợp
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {currentData.map((item: any) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={item.id}
                      className="group hover:bg-white/2 transition-colors"
                    >
                      {/* Column: User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#222] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {item.avatarUrl ? (
                              <img
                                src={item.avatarUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FaUser className="text-gray-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-[#B5A65F] transition-colors">
                              {item.username || "No Name"}
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono">
                              #{item.userId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <FaEnvelope className="text-gray-600" />
                            <span
                              className="truncate max-w-[150px]"
                              title={item.email}
                            >
                              {item.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <FaPhone className="text-gray-600" />
                            <span>{item.phoneNumber || "---"}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1.5">
                          {item.ticketCode ? (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#2a1a3f] border border-purple-500/30 text-purple-400 text-[10px] font-mono">
                              <FaQrcode />
                              {item.ticketCode}
                            </div>
                          ) : (
                            <span className="text-[10px] italic text-gray-600">
                              Chưa cấp mã
                            </span>
                          )}
                          {item.eventCheckInStatus === "CHECKED_IN" && (
                            <StatusBadge status="CHECKED_IN" />
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-400">
                          {item.registrationDate
                            ? new Date(
                                item.registrationDate
                              ).toLocaleDateString("vi-VN")
                            : "---"}
                        </span>
                        <div className="text-[10px] text-gray-600">
                          {item.registrationDate
                            ? new Date(
                                item.registrationDate
                              ).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={item.status} />
                      </td>

                      
                      <td className="px-6 py-4 text-right">
                        {item.status === "PENDING" ? (
                          <div className="flex justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/30 flex items-center justify-center transition-all shadow-lg hover:shadow-green-500/20"
                              title="Duyệt"
                            >
                              <FaCheck size={12} />
                            </button>
                            <button
                              onClick={() => openRejectModal(item.id)}
                              className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 flex items-center justify-center transition-all shadow-lg hover:shadow-red-500/20"
                              title="Từ chối"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-600 italic">
                            Đã xử lý
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        
        {!isLoading && filteredData.length > 0 && (
          <div className="px-6 py-4 border-t border-white/5 bg-[#1a1a1a] flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Hiển thị {currentData.length} trên tổng {filteredData.length} kết
              quả
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0a0a0a] border border-white/10 text-gray-400 hover:text-white hover:border-[#B5A65F] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <FaChevronLeft size={10} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page
                        ? "bg-[#B5A65F] text-black shadow-md shadow-[#B5A65F]/20"
                        : "bg-[#0a0a0a] border border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0a0a0a] border border-white/10 text-gray-400 hover:text-white hover:border-[#B5A65F] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <FaChevronRight size={10} />
              </button>
            </div>
          </div>
        )}
      </div>

     
      <AnimatePresence>
        {isRejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRejectModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

          
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Từ chối vé</h3>
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                Vui lòng nhập lý do từ chối. Lý do này sẽ được gửi email cho
                người tham gia.
              </p>

              <textarea
                autoFocus
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Sai thông tin, hết chỗ..."
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all resize-none mb-6"
              />

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleRejectSubmit}
                  className="px-6 py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
