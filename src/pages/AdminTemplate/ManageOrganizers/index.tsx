import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
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
  FaBuilding,
  FaFileExcel,
  FaBan,
  FaLock,
  FaCheck,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

import type { AppDispatch, RootState } from "../../../store";
import {
  fetchOrganizers,
  approveOrganizer,
  lockOrganizer,
  unlockOrganizer,
  rejectOrganizer,
} from "../../../store/slices/organizerSlice";
import { fetchUserList } from "../../../store/slices/userSlice";
import type { Organizer } from "../../../models/organizer";

import ConfirmModal from "./../_components/ConfirmModal";
import LoadingOverlay from "@/pages/HomeTemplate/_components/common/LoadingOverlay";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const ITEMS_PER_PAGE = 8;

const OrganizerCard = memo(
  ({ org, isTarget, onDetail, onAction, onReject, logo }: any) => {
    const StatusBadge = () => {
      if (!org.approved)
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm backdrop-blur-md flex items-center gap-1.5 tracking-wider bg-[rgba(239,68,68,0.1)] text-red-400 border-[rgba(239,68,68,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            CHỜ DUYỆT
          </span>
        );
      if (org.locked)
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm backdrop-blur-md flex items-center gap-1.5 tracking-wider bg-red-900/20 text-red-500 border-red-500/30">
            <FaLock size={10} />{" "}
            {org.unlockRequested ? "YÊU CẦU MỞ" : "ĐÃ KHÓA"}
          </span>
        );
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm backdrop-blur-md flex items-center gap-1.5 tracking-wider bg-[rgba(181,166,95,0.2)] text-[#B5A65F] border-[rgba(181,166,95,0.3)] shadow-primary-gold-low">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B5A65F]" />
          HOẠT ĐỘNG
        </span>
      );
    };

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`group relative bg-[#1a1a1a] rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden ${
          isTarget
            ? "border-[#B5A65F] ring-2 ring-[#B5A65F]/30 shadow-[0_0_25px_rgba(181,166,95,0.4)] z-10 scale-[1.02]"
            : org.locked
              ? "border-red-500/20"
              : org.approved
                ? "border-white/5 hover:border-[rgba(181,166,95,0.3)] hover:shadow-2xl"
                : "border-red-500/10 opacity-80"
        }`}
      >
        {org.locked && (
          <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center pointer-events-none">
            <FaLock className="text-red-500/20 text-9xl -rotate-12" />
          </div>
        )}

        <div className="relative pt-6 px-6 pb-2 flex flex-col items-center z-10">
          <div className="w-full flex justify-end -mb-4">
            <StatusBadge />
          </div>
          <div
            className={`w-28 h-28 rounded-2xl p-1 border-2 bg-[#121212] overflow-hidden transition-all ${
              org.approved
                ? "border-[rgba(255,255,255,0.1)] group-hover:border-[#B5A65F]"
                : "border-red-900/20 grayscale"
            }`}
          >
            <img
              src={logo}
              alt="Logo"
              loading="lazy"
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

        <div className="px-6 py-4 border-t border-white/5 bg-[rgba(10,10,10,1)] flex justify-between items-center z-30">
          <button
            onClick={() => onDetail(org)}
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors group/btn"
          >
            <FaEye className="group-hover/btn:text-[#B5A65F] text-sm" /> Chi
            tiết
          </button>

          <div className="flex items-center gap-2">
            {!org.approved ? (
              <>
                <button
                  onClick={() => onAction("ACTIVATE", org)}
                  className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all border border-green-500/30"
                  title="Phê duyệt"
                >
                  <FaCheck size={14} />
                </button>
                <button
                  onClick={() => onReject(org)}
                  className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/30"
                  title="Từ chối"
                >
                  <FaBan size={14} />
                </button>
              </>
            ) : org.locked ? (
              <button
                onClick={() => onAction("UNLOCK", org)}
                className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-all border ${
                  org.unlockRequested
                    ? "bg-yellow-500/20 text-yellow-500 border-yellow-500 animate-pulse"
                    : "bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white border-green-500/30"
                }`}
                title={org.unlockRequested ? "Có yêu cầu mở khóa" : "Mở khóa"}
              >
                <FaUnlock size={14} />
              </button>
            ) : (
              <button
                onClick={() => onAction("LOCK", org)}
                className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                title="Khóa tài khoản"
              >
                <FaPowerOff size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  },
);

export default function ManageOrganizers() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();

  const targetId =
    searchParams.get("targetId") || searchParams.get("highlight");
  const statusParam = searchParams.get("status");

  const { data: organizers, isLoading: isLoadingOrg } = useSelector(
    (state: RootState) => state.organizers,
  );
  const { data: users } = useSelector((state: RootState) => state.listUser);

  const [searchTermInput, setSearchTermInput] = useState("");
  const debouncedSearchTerm = useDebounce(searchTermInput, 300);

  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "ACTIVE" | "INACTIVE" | "LOCKED"
  >("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrg, setSelectedOrg] = useState<Organizer | null>(null);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: "ACTIVATE" | "LOCK" | "UNLOCK" | null;
    data: Organizer | null;
  }>({ isOpen: false, type: null, data: null });

  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    org: Organizer | null;
  }>({ isOpen: false, org: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (organizers.length === 0) dispatch(fetchOrganizers());
    dispatch(fetchUserList());
  }, [dispatch]);

  useEffect(() => {
    if (statusParam) {
      if (statusParam === "PENDING") setFilterStatus("INACTIVE");
      else if (statusParam === "ACTIVE") setFilterStatus("ACTIVE");
      else if (statusParam === "LOCKED") setFilterStatus("LOCKED");
    }
    if (targetId && organizers.length > 0) {
      const target = organizers.find(
        (o) => o.organizerId.toString() === targetId,
      );
      if (target) {
        if (!statusParam) setFilterStatus("ALL");
      }
    }
  }, [targetId, statusParam, organizers.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus]);

  const getSmartLogo = useCallback(
    (org: Organizer) => {
      if (org.logoUrl && org.logoUrl !== "none" && org.logoUrl !== "null") {
        return org.logoUrl;
      }
      const userOwner = users.find((u) => u.username === org.username);
      if (userOwner && userOwner.avatarUrl) {
        return userOwner.avatarUrl;
      }
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(org.name)}&background=random&color=fff`;
    },
    [users],
  );

  const processedData = useMemo(() => {
    let filtered = organizers.filter((org) => {
      const isTarget = org.organizerId.toString() === targetId;
      if (isTarget) return true;

      const matchesSearch =
        org.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        org.slug.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === "ALL") return true;
      if (filterStatus === "ACTIVE")
        return org.approved === true && !org.locked;
      if (filterStatus === "INACTIVE") return org.approved === false;
      if (filterStatus === "LOCKED") return org.locked === true;

      return true;
    });

    return filtered.sort((a, b) => {
      const isTargetA = a.organizerId.toString() === targetId;
      const isTargetB = b.organizerId.toString() === targetId;
      if (isTargetA) return -1;
      if (isTargetB) return 1;

      const getPriority = (org: Organizer) => {
        if (!org.approved) return 1;
        if (org.unlockRequested) return 2;
        if (org.locked) return 3;
        return 4;
      };
      return getPriority(a) - getPriority(b);
    });
  }, [organizers, debouncedSearchTerm, filterStatus, targetId]);

  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedData, currentPage]);

  const handleOpenConfirm = useCallback(
    (type: "ACTIVATE" | "LOCK" | "UNLOCK", org: Organizer) => {
      setConfirmState({ isOpen: true, type, data: org });
    },
    [],
  );

  const handleOpenReject = useCallback((org: Organizer) => {
    setRejectModal({ isOpen: true, org });
  }, []);

  const handleDetail = useCallback((org: Organizer) => {
    setSelectedOrg(org);
  }, []);

  const handleExportExcel = () => {
    if (processedData.length === 0) return toast.warn("Không có dữ liệu!");
    try {
      const exportData = processedData.map((org) => ({
        ID: org.organizerId,
        "Tên BTC": org.name,
        User: org.username,
        Email: org.contactEmail,
        "Trạng thái": org.locked
          ? "Đã khóa"
          : org.approved
            ? "Hoạt động"
            : "Chờ duyệt",
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Danh sách BTC");
      XLSX.writeFile(wb, `Organizers_List.xlsx`);
      toast.success("Xuất Excel thành công!");
    } catch (e) {
      toast.error("Lỗi xuất file.");
    }
  };

  const handleConfirmAction = async () => {
    const { type, data } = confirmState;
    if (!data) return;
    setIsProcessing(true);
    try {
      if (type === "ACTIVATE")
        await dispatch(approveOrganizer(data.organizerId)).unwrap();
      else if (type === "LOCK") {
        await dispatch(lockOrganizer(data.organizerId)).unwrap();
        toast.success(`Đã khóa ${data.name}`);
      } else if (type === "UNLOCK") {
        await dispatch(unlockOrganizer(data.organizerId)).unwrap();
        toast.success(`Đã mở khóa ${data.name}`);
      }
      setConfirmState({ isOpen: false, type: null, data: null });
      if (selectedOrg?.organizerId === data.organizerId) setSelectedOrg(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.org || !rejectReason.trim())
      return toast.warn("Nhập lý do!");
    setIsProcessing(true);
    try {
      await dispatch(
        rejectOrganizer({
          organizerId: rejectModal.org.organizerId,
          reason: rejectReason,
        }),
      ).unwrap();
      setRejectModal({ isOpen: false, org: null });
      setRejectReason("");
      toast.success(`Đã từ chối ${rejectModal.org.name}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 font-noto text-white relative selection:bg-[rgba(181,166,95,0.3)]">
      <AnimatePresence>
        {isProcessing && (
          <LoadingOverlay message="Đang xử lý..." className="z-9999" />
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row justify-between items-end lg:items-center gap-4 mb-8 pt-4">
        <div className="p-1 bg-[#1a1a1a] border border-white/10 rounded-full flex gap-1 w-full lg:w-auto overflow-x-auto">
          {["ALL", "ACTIVE", "INACTIVE", "LOCKED"].map((tabId) => (
            <button
              key={tabId}
              onClick={() => setFilterStatus(tabId as any)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                filterStatus === tabId
                  ? "bg-[#B5A65F] text-black shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {
                {
                  ALL: "Tất cả",
                  ACTIVE: "Hoạt động",
                  INACTIVE: "Chờ duyệt",
                  LOCKED: "Đã khóa",
                }[tabId]
              }
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-green-500/20 text-green-500 border border-green-500/30 hover:bg-green-600 hover:text-white transition-all font-bold text-sm shadow-lg"
          >
            <FaFileExcel /> Xuất Excel
          </button>
          <div className="relative group w-full sm:w-72">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F]" />
            <input
              type="text"
              placeholder="Tìm tên tổ chức..."
              value={searchTermInput}
              onChange={(e) => setSearchTermInput(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-full pl-10 pr-4 py-3 text-sm text-white focus:border-[#B5A65F] outline-none shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]">
        {isLoadingOrg ? (
          <div className="col-span-full py-20 text-center text-gray-500 italic">
            Đang tải dữ liệu...
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center text-gray-500 border border-white/5 border-dashed rounded-3xl bg-[rgba(26,26,26,0.3)] h-96">
            <FaBuilding className="text-4xl opacity-20 mb-4" />
            <p className="text-lg font-medium">Không tìm thấy tổ chức nào.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {paginatedData.map((org) => (
              <OrganizerCard
                key={org.organizerId}
                org={org}
                logo={getSmartLogo(org)}
                isTarget={org.organizerId.toString() === targetId}
                onDetail={handleDetail}
                onAction={handleOpenConfirm}
                onReject={handleOpenReject}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {!isLoadingOrg && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-gray-400 hover:text-white disabled:opacity-50"
          >
            Trước
          </button>
          <span className="text-sm font-bold text-[#B5A65F]">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-gray-400 hover:text-white disabled:opacity-50"
          >
            Sau
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
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#181818] border border-[#B5A65F]/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10"
            >
              <div className="h-32 bg-linear-to-r from-[#B5A65F]/20 to-transparent relative">
                <button
                  onClick={() => setSelectedOrg(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 rounded-full text-white/70 hover:bg-black hover:text-white transition-all"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="px-8 pb-8 -mt-16 relative flex flex-col items-center">
                <img
                  src={getSmartLogo(selectedOrg)}
                  alt=""
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-[#181818] bg-black shadow-xl"
                />
                <div className="text-center mb-6 mt-4">
                  <h2 className="text-2xl font-black text-white uppercase">
                    {selectedOrg.name}
                  </h2>
                </div>
                <div className="space-y-4 w-full">
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <h4 className="flex items-center gap-2 text-[#B5A65F] text-xs font-bold uppercase mb-3">
                      <FaIdBadge /> Giới thiệu
                    </h4>
                    <p className="text-gray-300 text-sm max-h-40 overflow-y-auto">
                      {selectedOrg.description || "Chưa cập nhật."}
                    </p>
                  </div>
                  {selectedOrg.approved ? (
                    selectedOrg.locked ? (
                      <button
                        onClick={() => handleOpenConfirm("UNLOCK", selectedOrg)}
                        className="w-full py-3.5 font-bold rounded-xl uppercase text-sm bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white"
                      >
                        <FaUnlock className="inline mr-2" /> Mở khóa
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenConfirm("LOCK", selectedOrg)}
                        className="w-full py-3.5 font-bold rounded-xl uppercase text-sm bg-white/5 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white"
                      >
                        <FaPowerOff className="inline mr-2" /> Khóa TK
                      </button>
                    )
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleOpenReject(selectedOrg)}
                        className="py-3.5 font-bold rounded-xl uppercase text-sm bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white"
                      >
                        <FaBan className="inline mr-2" /> Từ chối
                      </button>
                      <button
                        onClick={() =>
                          handleOpenConfirm("ACTIVATE", selectedOrg)
                        }
                        className="py-3.5 font-bold rounded-xl uppercase text-sm bg-linear-to-r from-[#B5A65F] to-[#C5B358] text-black"
                      >
                        <FaCheck className="inline mr-2" /> Phê duyệt
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
              className="relative w-full max-w-md bg-[#1a1a1a] border border-red-500/30 rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-xl font-black text-white uppercase mb-2 flex items-center gap-2">
                <FaBan className="text-red-500" /> Từ chối đăng ký
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Từ chối{" "}
                <span className="text-white font-bold">
                  {rejectModal.org?.name}
                </span>
                . Lý do:
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do..."
                className="w-full h-32 bg-black border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-red-500 outline-none resize-none mb-6"
              />
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setRejectModal({ isOpen: false, org: null });
                    setRejectReason("");
                  }}
                  className="py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5 uppercase text-xs"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReject}
                  className="py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-500 uppercase text-xs"
                >
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {confirmState.data && (
        <ConfirmModal
          isOpen={confirmState.isOpen}
          onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
          onConfirm={handleConfirmAction}
          type={confirmState.type === "LOCK" ? "DELETE" : "APPROVE"}
          title={
            confirmState.type === "LOCK"
              ? "Khóa tài khoản"
              : confirmState.type === "UNLOCK"
                ? "Mở khóa tài khoản"
                : "Kích hoạt"
          }
          message={
            confirmState.type === "LOCK"
              ? `Bạn có chắc muốn khóa "${confirmState.data.name}"?`
              : confirmState.type === "UNLOCK"
                ? `Mở khóa cho "${confirmState.data.name}"?`
                : `Phê duyệt "${confirmState.data.name}"?`
          }
          confirmText="Xác nhận"
        />
      )}
    </div>
  );
}
