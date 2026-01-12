import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaPowerOff,
  FaUnlock,
  FaPhone,
  FaEnvelope,
  FaUserTie,
  FaSearch,
  FaEye,
  FaIdBadge,
  FaChevronLeft,
  FaChevronRight,
  FaBuilding,
  FaFileExcel,
  FaBan,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

import type { AppDispatch, RootState } from "../../../store";
import {
  fetchOrganizers,
  approveOrganizer,
  deleteOrganizer,
  rejectOrganizer,
} from "../../../store/slices/organizerSlice";
import { fetchUserList } from "../../../store/slices/userSlice";
import type { Organizer } from "../../../models/organizer";

import ConfirmModal from "./../_components/ConfirmModal";
import LoadingOverlay from "@/pages/HomeTemplate/_components/common/LoadingOverlay";

const ITEMS_PER_PAGE = 8;

export default function ManageOrganizers() {
  const dispatch = useDispatch<AppDispatch>();

  const { data: organizers, isLoading: isLoadingOrg } = useSelector(
    (state: RootState) => state.organizers
  );
  const { data: users } = useSelector((state: RootState) => state.listUser);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedOrg, setSelectedOrg] = useState<Organizer | null>(null);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: "ACTIVATE" | "DEACTIVATE" | null;
    data: Organizer | null;
  }>({ isOpen: false, type: null, data: null });

  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    org: Organizer | null;
  }>({ isOpen: false, org: null });
  const [rejectReason, setRejectReason] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    dispatch(fetchOrganizers());
    dispatch(fetchUserList());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const getSmartLogo = (org: Organizer) => {
    if (org.logoUrl && org.logoUrl !== "none" && org.logoUrl !== "null") {
      return org.logoUrl;
    }
    const userOwner = users.find((u) => u.username === org.username);
    if (userOwner && userOwner.avatarUrl) {
      return userOwner.avatarUrl;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      org.name
    )}&background=random&color=fff`;
  };

  const filteredData = useMemo(() => {
    return organizers.filter((org) => {
      const matchesSearch =
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.slug.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === "ALL") return true;
      if (filterStatus === "ACTIVE") return org.approved === true;
      if (filterStatus === "INACTIVE") return org.approved === false;

      return true;
    });
  }, [organizers, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      toast.warn("Không có dữ liệu để xuất!");
      return;
    }
    try {
      const exportData = filteredData.map((org) => ({
        ID: org.organizerId,
        "Tên Tổ Chức": org.name,
        "Người đại diện": org.username,
        "Email liên hệ": org.contactEmail,
        "Trạng thái": org.approved ? "Hoạt động" : "Chờ duyệt/Vô hiệu",
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách BTC");
      XLSX.writeFile(workbook, `Organizers_List.xlsx`);
      toast.success("Xuất file Excel thành công!");
    } catch (error) {
      toast.error("Có lỗi khi xuất file.");
    }
  };

  const handleConfirmAction = async () => {
    const { type, data } = confirmState;
    if (!data) return;

    setIsProcessing(true);
    try {
      if (type === "ACTIVATE") {
        await dispatch(approveOrganizer(data.organizerId)).unwrap();
      } else if (type === "DEACTIVATE") {
        await dispatch(deleteOrganizer(data.slug)).unwrap();
      }
      setConfirmState({ isOpen: false, type: null, data: null });
      if (selectedOrg?.organizerId === data.organizerId) setSelectedOrg(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal.org || !rejectReason.trim()) {
      toast.warn("Vui lòng nhập lý do từ chối!");
      return;
    }

    setIsProcessing(true);
    try {
      await dispatch(
        rejectOrganizer({
          organizerId: rejectModal.org.organizerId,
          reason: rejectReason,
        })
      ).unwrap();

      setRejectModal({ isOpen: false, org: null });
      setRejectReason("");
      setSelectedOrg(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const openConfirmModal = (
    type: "ACTIVATE" | "DEACTIVATE",
    org: Organizer
  ) => {
    setConfirmState({ isOpen: true, type, data: org });
  };

  const StatusBadge = ({ approved }: { approved: boolean }) => (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm backdrop-blur-md flex items-center gap-1.5 tracking-wider
        ${
          approved
            ? "bg-[rgba(181,166,95,0.2)] text-[#B5A65F] border-[rgba(181,166,95,0.3)] shadow-primary-gold-low"
            : "bg-[rgba(239,68,68,0.1)] text-red-400 border-[rgba(239,68,68,0.3)] shadow-[rgba(239,68,68,0.1)]"
        }
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          approved ? "bg-[#B5A65F]" : "bg-red-400 animate-pulse"
        }`}
      />
      {approved ? "Active" : "Inactive"}
    </span>
  );

  return (
    <div className="min-h-screen pb-20 font-sans text-white relative selection:bg-[rgba(181,166,95,0.3)]">
      <AnimatePresence>
        {isProcessing && (
          <LoadingOverlay
            message="Đang xử lý yêu cầu..."
            className="z-9999"
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row justify-between items-end lg:items-center gap-4 mb-8 pt-4">
        <div className="p-1 bg-[#1a1a1a] border border-white/10 rounded-full flex gap-1 w-full lg:w-auto overflow-x-auto">
          {["ALL", "ACTIVE", "INACTIVE"].map((tabId) => {
            const labels: any = {
              ALL: "Tất cả",
              ACTIVE: "Hoạt động",
              INACTIVE: "Chờ duyệt",
            };
            const isActive = filterStatus === tabId;
            const count = organizers.filter((o) => {
              if (tabId === "ALL") return true;
              if (tabId === "ACTIVE") return o.approved;
              return !o.approved;
            }).length;

            return (
              <button
                key={tabId}
                onClick={() => setFilterStatus(tabId as any)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? "bg-[#B5A65F] text-black shadow-lg shadow-[rgba(181,166,95,0.2)]"
                    : "text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                }`}
              >
                {labels[tabId]}
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] min-w-5 text-center ${
                    isActive
                      ? "bg-[rgba(0,0,0,0.2)] text-black"
                      : "bg-[rgba(255,255,255,0.1)] text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-[rgba(22,163,74,0.2)] text-green-500 border border-[rgba(22,163,74,0.3)] hover:bg-green-600 hover:text-white transition-all font-bold text-sm shadow-lg"
          >
            <FaFileExcel /> Xuất Excel
          </button>

          <div className="relative group w-full sm:w-72">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F] transition-colors" />
            <input
              type="text"
              placeholder="Tìm tên tổ chức..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-full pl-10 pr-4 py-3 text-sm text-white focus:border-[#B5A65F] outline-none shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]">
        {isLoadingOrg ? (
          <div className="col-span-full py-20 text-center text-gray-500 italic">
            Đang tải dữ liệu BTC...
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center text-gray-500 border border-white/5 border-dashed rounded-3xl bg-[rgba(26,26,26,0.3)] h-96">
            <FaBuilding className="text-4xl opacity-20 mb-4" />
            <p className="text-lg font-medium">Không tìm thấy tổ chức nào.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {paginatedData.map((org) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={org.organizerId}
                className={`group relative bg-[#1a1a1a] rounded-3xl border transition-all duration-300 flex flex-col ${
                  org.approved
                    ? "border-white/5 hover:border-[rgba(181,166,95,0.3)] hover:shadow-2xl"
                    : "border-red-500/10 opacity-80"
                }`}
              >
                <div
                  className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] pointer-events-none transition-all ${
                    org.approved
                      ? "bg-[rgba(181,166,95,0.05)] group-hover:bg-[rgba(181,166,95,0.15)]"
                      : "bg-[rgba(239,68,68,0.05)]"
                  }`}
                />

                <div className="relative pt-6 px-6 pb-2 flex flex-col items-center z-10">
                  <div className="w-full flex justify-end -mb-4">
                    <StatusBadge approved={org.approved} />
                  </div>
                  <div
                    className={`w-28 h-28 rounded-2xl p-1 border-2 bg-[#121212] overflow-hidden transition-all ${
                      org.approved
                        ? "border-[rgba(255,255,255,0.1)] group-hover:border-[#B5A65F]"
                        : "border-red-900/20 grayscale"
                    }`}
                  >
                    <img
                      src={getSmartLogo(org)}
                      alt="Logo"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <h3
                    className={`mt-5 text-xl font-bold text-center line-clamp-1 ${
                      org.approved
                        ? "text-white group-hover:text-[#B5A65F]"
                        : "text-gray-400"
                    }`}
                  >
                    {org.name}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono mt-1 px-2 py-0.5 bg-[rgba(255,255,255,0.05)] rounded border border-white/5">
                    @{org.slug}
                  </p>
                </div>

                <div className="px-6 py-5 flex-1 space-y-3 z-10">
                  {[
                    { icon: FaUserTie, val: org.username },
                    { icon: FaPhone, val: org.contactPhoneNumber || "---" },
                    { icon: FaEnvelope, val: org.contactEmail },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-xs text-gray-400"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.05)] ${
                          org.approved ? "text-[#B5A65F]" : "text-gray-600"
                        }`}
                      >
                        <item.icon />
                      </div>
                      <span className="truncate flex-1">{item.val}</span>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4 border-t border-white/5 bg-[rgba(10,10,10,1)] flex justify-between items-center z-10">
                  <button
                    onClick={() => setSelectedOrg(org)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors group/btn"
                  >
                    <FaEye className="group-hover/btn:text-[#B5A65F]" /> Chi
                    tiết
                  </button>

                  <div className="flex items-center gap-2">
                    {!org.approved && (
                      <>
                        <button
                          onClick={() => openConfirmModal("ACTIVATE", org)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all border border-green-500/20"
                          title="Phê duyệt"
                        >
                          <FaUnlock size={12} />
                        </button>
                        <button
                          onClick={() => setRejectModal({ isOpen: true, org })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                          title="Từ chối"
                        >
                          <FaBan size={12} />
                        </button>
                      </>
                    )}

                    {org.approved && (
                      <button
                        onClick={() => openConfirmModal("DEACTIVATE", org)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-500/10 text-gray-400 hover:bg-gray-500 hover:text-white transition-all border border-white/5"
                        title="Vô hiệu hóa"
                      >
                        <FaPowerOff size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {!isLoadingOrg && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-white/10 disabled:opacity-50 hover:border-[#B5A65F] transition-all"
          >
            <FaChevronLeft size={10} />
          </button>
          <span className="text-sm font-bold text-gray-500 px-2">
            Trang <span className="text-white">{currentPage}</span> /{" "}
            {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-white/10 disabled:opacity-50 hover:border-[#B5A65F] transition-all"
          >
            <FaChevronRight size={10} />
          </button>
        </div>
      )}

      <AnimatePresence>
        {selectedOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrg(null)}
              className="absolute inset-0 bg-[rgba(0,0,0,0.8)] backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#181818] border border-[rgba(181,166,95,0.3)] rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10"
            >
              <div className="h-32 bg-linear-to-r from-[rgba(181,166,95,0.2)] to-primary-gold-transparent relative">
                <button
                  onClick={() => setSelectedOrg(null)}
                  className="absolute top-4 right-4 p-2 bg-[rgba(0,0,0,0.2)] rounded-full text-white/70 hover:text-white hover:bg-black transition-all"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="px-8 pb-8 -mt-16 relative flex flex-col items-center">
                <img
                  src={getSmartLogo(selectedOrg)}
                  alt="Logo"
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-[#181818] bg-black shadow-xl"
                />
                <div className="text-center mb-6 mt-4">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                    {selectedOrg.name}
                  </h2>
                  <div className="flex justify-center items-center gap-2 mt-2">
                    <StatusBadge approved={selectedOrg.approved} />
                  </div>
                </div>
                <div className="space-y-4 w-full">
                  <div className="bg-[rgba(255,255,255,0.05)] p-5 rounded-2xl border border-white/5">
                    <h4 className="flex items-center gap-2 text-[#B5A65F] text-xs font-bold uppercase mb-3">
                      <FaIdBadge /> Giới thiệu
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed max-h-40 overflow-y-auto whitespace-pre-line">
                      {selectedOrg.description ||
                        "Chưa cập nhật thông tin giới thiệu."}
                    </p>
                  </div>

                  {selectedOrg.approved ? (
                    <button
                      onClick={() => {
                        openConfirmModal("DEACTIVATE", selectedOrg);
                      }}
                      className="w-full py-3.5 font-bold rounded-xl transition-all uppercase text-sm bg-[rgba(255,255,255,0.05)] text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white"
                    >
                      <FaPowerOff className="inline mr-2" /> Vô hiệu hóa tài
                      khoản
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setRejectModal({ isOpen: true, org: selectedOrg });
                        }}
                        className="py-3.5 font-bold rounded-xl transition-all uppercase text-sm bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
                      >
                        <FaBan className="inline mr-2" /> Từ chối
                      </button>
                      <button
                        onClick={() => {
                          openConfirmModal("ACTIVATE", selectedOrg);
                        }}
                        className="py-3.5 font-bold rounded-xl transition-all uppercase text-sm bg-linear-to-r from-[#B5A65F] to-[#C5B358] text-black shadow-lg shadow-[rgba(181,166,95,0.4)]"
                      >
                        <FaUnlock className="inline mr-2" /> Phê duyệt
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rejectModal.isOpen && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectModal({ isOpen: false, org: null })}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-[#181818] border border-red-500/30 rounded-2xl p-6 shadow-2xl z-10"
            >
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <FaBan className="text-red-500" /> Từ chối hồ sơ
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Bạn đang từ chối tổ chức{" "}
                <span className="text-white font-bold">
                  {rejectModal.org?.name}
                </span>
                . Vui lòng nhập lý do để gửi email thông báo.
              </p>

              <textarea
                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-red-500 outline-none resize-none min-h-[100px]"
                placeholder="Nhập lý do từ chối (VD: Thông tin chưa rõ ràng, Logo mờ...)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />

              <div className="flex gap-3 mt-6 justify-end">
                <button
                  onClick={() => setRejectModal({ isOpen: false, org: null })}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 hover:bg-white/5 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={!rejectReason.trim()}
                  className="px-6 py-2 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-900/20"
                >
                  Xác nhận Từ chối
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRM MODAL (DUYỆT/XÓA) --- */}
      {confirmState.data && (
        <ConfirmModal
          isOpen={confirmState.isOpen}
          onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
          onConfirm={handleConfirmAction}
          type={confirmState.type === "DEACTIVATE" ? "DELETE" : "APPROVE"}
          title={
            confirmState.type === "DEACTIVATE" ? "Vô hiệu hóa" : "Kích hoạt"
          }
          message={
            confirmState.type === "DEACTIVATE"
              ? `Vô hiệu hóa tổ chức "${confirmState.data.name}"?`
              : `Kích hoạt tổ chức "${confirmState.data.name}"?`
          }
          confirmText="Xác nhận"
        />
      )}
    </div>
  );
}
