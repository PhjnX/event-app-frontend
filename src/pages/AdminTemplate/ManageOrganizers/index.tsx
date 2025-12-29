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
} from "react-icons/fa";

import type { AppDispatch, RootState } from "../../../store";
import {
  fetchOrganizers,
  approveOrganizer,
  deleteOrganizer,
} from "../../../store/slices/organizerSlice";
import { fetchUserList } from "../../../store/slices/userSlice";
import type { Organizer } from "../../../models/organizer";

import ConfirmModal from "./../_components/ConfirmModal";

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
    )}&background=random`;
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

  const handleConfirmAction = async () => {
    const { type, data } = confirmState;
    if (!data) return;

    if (type === "ACTIVATE") {
      await dispatch(approveOrganizer(data.organizerId));
    } else if (type === "DEACTIVATE") {
      await dispatch(deleteOrganizer(data.slug));
    }

    setConfirmState({ isOpen: false, type: null, data: null });
    if (selectedOrg?.organizerId === data.organizerId) {
      setSelectedOrg(null);
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
      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border shadow-sm backdrop-blur-md flex items-center gap-1.5
        ${
          approved
            ? "bg-[#B5A65F]/20 text-[#B5A65F] border-[#B5A65F]/30 shadow-[#B5A65F]/10"
            : "bg-red-500/10 text-red-400 border-red-500/30 shadow-red-500/10"
        }
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          approved ? "bg-[#B5A65F]" : "bg-red-400 animate-pulse"
        }`}
      ></span>
      {approved ? "Active" : "Inactive"}
    </span>
  );

  const GridSkeleton = () => (
    <>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-[#1a1a1a] rounded-3xl border border-white/5 p-6 animate-pulse flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 rounded-full bg-white/10" />
          <div className="h-4 w-3/4 bg-white/10 rounded" />
          <div className="h-3 w-1/2 bg-white/10 rounded" />
          <div className="w-full mt-4 flex justify-between gap-2">
            <div className="h-8 w-1/3 bg-white/10 rounded" />
            <div className="h-8 w-1/3 bg-white/10 rounded" />
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="min-h-screen pb-20 font-sans text-white">
      
      <div className="flex flex-col lg:flex-row justify-between items-end lg:items-center gap-4 mb-8 pt-4">
  
        <div className="p-1.5 bg-[#1a1a1a] border border-white/10 rounded-2xl flex gap-1 w-full lg:w-auto overflow-x-auto custom-scrollbar">
          {[
            { id: "ALL", label: "Tất cả" },
            { id: "ACTIVE", label: "Hoạt động" },
            { id: "INACTIVE", label: "Vô hiệu" },
          ].map((tab) => {
            const isActive = filterStatus === tab.id;
            const count = organizers.filter((o) => {
              if (tab.id === "ALL") return true;
              if (tab.id === "ACTIVE") return o.approved;
              if (tab.id === "INACTIVE") return !o.approved;
              return false;
            }).length;

            return (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                className={`
                   px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2
                   ${
                     isActive
                       ? "bg-[#B5A65F] text-black shadow-lg shadow-[#B5A65F]/20"
                       : "text-gray-400 hover:text-white hover:bg-white/5"
                   }
                 `}
              >
                {tab.label}
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] ${
                    isActive
                      ? "bg-black/20 text-black"
                      : "bg-white/10 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative group w-full lg:w-72">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F] transition-colors" />
          <input
            type="text"
            placeholder="Tìm tên tổ chức, slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#B5A65F] focus:ring-1 focus:ring-[#B5A65F] outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoadingOrg ? (
          <GridSkeleton />
        ) : paginatedData.length === 0 ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-gray-500 border border-white/5 border-dashed rounded-3xl bg-[#1a1a1a]/30">
            <FaBuilding className="text-6xl opacity-20 mb-4" />
            <p className="text-lg font-medium">Không tìm thấy tổ chức nào.</p>
          </div>
        ) : (
          paginatedData.map((org) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={org.organizerId}
              className={`group relative bg-[#1a1a1a] rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col
                ${
                  org.approved
                    ? "border-white/5 hover:border-[#B5A65F]/30 hover:shadow-[0_10px_40px_-10px_rgba(181,166,95,0.15)]"
                    : "border-red-500/10 hover:border-red-500/30 opacity-80 hover:opacity-100"
                }
              `}
            >
              {/* Background Glow */}
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl transition-all
                  ${
                    org.approved
                      ? "bg-[#B5A65F]/5 group-hover:bg-[#B5A65F]/15"
                      : "bg-red-500/5 group-hover:bg-red-500/10"
                  }
              `}
              />

              {/* Header: Status & Logo */}
              <div className="relative pt-6 px-6 pb-2 flex flex-col items-center z-10">
                <div className="w-full flex justify-end -mb-5 relative z-20">
                  <StatusBadge approved={org.approved} />
                </div>

                <div
                  className={`w-24 h-24 rounded-2xl p-1 border shadow-lg group-hover:scale-105 transition-transform duration-300 bg-[#121212]
                    ${
                      org.approved
                        ? "border-white/10"
                        : "border-red-500/20 grayscale-[0.5]"
                    }
                `}
                >
                  <img
                    src={getSmartLogo(org)}
                    alt="Logo"
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/100";
                    }}
                  />
                </div>

                <h3
                  className={`mt-4 text-lg font-bold text-center line-clamp-1 transition-colors 
                    ${
                      org.approved
                        ? "text-white group-hover:text-[#B5A65F]"
                        : "text-gray-300"
                    }
                `}
                >
                  {org.name}
                </h3>
                <p className="text-xs text-gray-500 font-mono">@{org.slug}</p>
              </div>

              <div className="px-6 py-4 flex-1 space-y-3 z-10">
                <div className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  <FaUserTie
                    className={
                      org.approved ? "text-[#B5A65F]" : "text-gray-600"
                    }
                  />
                  <span className="truncate">{org.username}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  <FaPhone
                    className={
                      org.approved ? "text-[#B5A65F]" : "text-gray-600"
                    }
                  />
                  <span className="truncate">
                    {org.contactPhoneNumber || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  <FaEnvelope
                    className={
                      org.approved ? "text-[#B5A65F]" : "text-gray-600"
                    }
                  />
                  <span className="truncate">{org.contactEmail}</span>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex justify-between items-center z-10">
                <button
                  onClick={() => setSelectedOrg(org)}
                  className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                >
                  <FaEye /> Chi tiết
                </button>

                <div>
                  {org.approved ? (
                    <button
                      onClick={() => openConfirmModal("DEACTIVATE", org)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      title="Vô hiệu hóa"
                    >
                      <FaPowerOff />
                    </button>
                  ) : (
                    <button
                      onClick={() => openConfirmModal("ACTIVATE", org)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/10"
                      title="Kích hoạt"
                    >
                      <FaUnlock />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {!isLoadingOrg && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border
              ${
                currentPage === 1
                  ? "bg-white/5 text-gray-600 border-white/5 cursor-not-allowed"
                  : "bg-[#1a1a1a] text-white border-white/10 hover:border-[#B5A65F] hover:text-[#B5A65F]"
              }
            `}
          >
            <FaChevronLeft size={12} />
          </button>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all border
                    ${
                      isActive
                        ? "bg-[#B5A65F] text-black border-[#B5A65F] shadow-[0_0_15px_rgba(181,166,95,0.3)]"
                        : "bg-[#1a1a1a] text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
                    }
                  `}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border
              ${
                currentPage === totalPages
                  ? "bg-white/5 text-gray-600 border-white/5 cursor-not-allowed"
                  : "bg-[#1a1a1a] text-white border-white/10 hover:border-[#B5A65F] hover:text-[#B5A65F]"
              }
            `}
          >
            <FaChevronRight size={12} />
          </button>
        </div>
      )}

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
              ? `Bạn có chắc muốn vô hiệu hóa tổ chức "${confirmState.data.name}"?`
              : `Kích hoạt tổ chức "${confirmState.data.name}" hoạt động trở lại?`
          }
          confirmText={
            confirmState.type === "DEACTIVATE" ? "Vô hiệu hóa" : "Kích hoạt"
          }
        />
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
              className="relative w-full max-w-lg bg-[#181818] border border-[#B5A65F]/30 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="h-32 bg-linear-to-r from-[#B5A65F]/20 to-transparent relative">
                <button
                  onClick={() => setSelectedOrg(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 rounded-full text-white/50 hover:text-white hover:bg-black/50 transition-all"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="px-8 pb-8 -mt-16 relative">
                <div className="flex justify-center mb-4">
                  <img
                    src={getSmartLogo(selectedOrg)}
                    alt="Logo"
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#181818] bg-black shadow-xl"
                  />
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedOrg.name}
                  </h2>
                  <div className="flex justify-center items-center gap-2 mt-2">
                    <StatusBadge approved={selectedOrg.approved} />
                    <span className="text-gray-500 text-xs px-2 py-1 bg-white/5 rounded">
                      ID: {selectedOrg.organizerId}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/3 p-4 rounded-xl border border-white/5">
                    <h4 className="flex items-center gap-2 text-[#B5A65F] text-xs font-bold uppercase mb-2">
                      <FaIdBadge /> Thông tin mô tả
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                      {selectedOrg.description || "Chưa có mô tả."}
                    </p>
                  </div>

                  {!selectedOrg.approved ? (
                    <button
                      onClick={() => {
                        setSelectedOrg(null);
                        openConfirmModal("ACTIVATE", selectedOrg);
                      }}
                      className="w-full py-3 mt-4 bg-linear-to-r from-[#B5A65F] to-[#C5B358] text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(181,166,95,0.4)] transition-all flex items-center justify-center gap-2"
                    >
                      <FaUnlock /> Kích hoạt ngay
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedOrg(null);
                        openConfirmModal("DEACTIVATE", selectedOrg);
                      }}
                      className="w-full py-3 mt-4 bg-white/5 text-red-400 border border-red-500/30 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <FaPowerOff /> Vô hiệu hóa
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
