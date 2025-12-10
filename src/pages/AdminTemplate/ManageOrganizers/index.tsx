import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle,
  FaTimes,
  FaTrashAlt,
  FaPhone,
  FaEnvelope,
  FaUserTie,
  FaSearch,
  FaFilter,
} from "react-icons/fa";

import type { AppDispatch, RootState } from "../../../store";
import {
  fetchOrganizers,
  approveOrganizer,
  deleteOrganizer,
} from "../../../store/slices/organizerSlice";
import LoadingScreen from "@/pages/HomeTemplate/_components/common/LoadingSrceen";
import type { Organizer } from "../../../models/organizer";

export default function ManageOrganizers() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading } = useSelector(
    (state: RootState) => state.organizers
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "approved" | "pending"
  >("all");
  const [selectedOrg, setSelectedOrg] = useState<Organizer | null>(null);

  useEffect(() => {
    dispatch(fetchOrganizers());
  }, [dispatch]);

  const handleApprove = async (id: number) => {
    if (window.confirm("Xác nhận duyệt tổ chức này?")) {
      await dispatch(approveOrganizer(id));
    }
  };

  const handleDelete = async (slug: string) => {
    if (window.confirm("Hành động này không thể hoàn tác. Xóa tổ chức?")) {
      await dispatch(deleteOrganizer(slug));
    }
  };

  // Filter Logic
  const filteredData = data.filter((org) => {
    const matchesSearch = org.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "approved") return matchesSearch && org.approved;
    if (filterStatus === "pending") return matchesSearch && !org.approved;
    return matchesSearch;
  });

  if (isLoading && data.length === 0) return <LoadingScreen />;

  return (
    <div className="space-y-8 font-sans text-white relative">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2">
            Quản lý <span className="text-[#B5A65F]">Tổ Chức</span>
          </h1>
          <p className="text-gray-400 text-sm font-light">
            Kiểm duyệt và quản lý các đơn vị tổ chức sự kiện trên hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Filter Tabs */}
          <div className="flex bg-[#1a1a1a] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                filterStatus === "all"
                  ? "bg-[#B5A65F] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                filterStatus === "pending"
                  ? "bg-yellow-500 text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Chờ duyệt
              {data.filter((o) => !o.approved).length > 0 && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            <button
              onClick={() => setFilterStatus("approved")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                filterStatus === "approved"
                  ? "bg-green-500 text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Đã duyệt
            </button>
          </div>

          {/* Search */}
          <div className="relative group">
            <input
              type="text"
              placeholder="Tìm tên tổ chức..."
              className="bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-[#B5A65F] focus:outline-none w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F]" />
          </div>
        </div>
      </div>

      {/* --- GRID LIST --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredData.map((org) => (
            <motion.div
              key={org.organizerId}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative bg-[#1a1a1a]/60 backdrop-blur-md border rounded-3xl p-6 transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl
                        ${
                          org.approved
                            ? "border-white/10 hover:border-[#B5A65F]/50"
                            : "border-yellow-500/30 bg-yellow-900/10 hover:border-yellow-500"
                        }
                    `}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {org.approved ? (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase border border-green-500/20">
                    <FaCheckCircle /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase border border-yellow-500/20 animate-pulse">
                    <FaFilter /> Pending
                  </span>
                )}
              </div>

              {/* Header Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 p-1 shrink-0">
                  <img
                    src={org.logoUrl || "https://via.placeholder.com/100"}
                    alt="Logo"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-[#B5A65F] transition-colors">
                    {org.name}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <FaUserTie className="text-[#B5A65F]" /> {org.username}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-6 text-sm text-gray-300 bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <FaPhone className="text-gray-500 text-xs" />
                  <span>{org.contactPhoneNumber}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-gray-500 text-xs" />
                  <span className="truncate">{org.contactEmail}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-500 text-xs line-clamp-2 mb-6 h-8">
                {org.description || "Không có mô tả giới thiệu."}
              </p>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-white/5 flex gap-3">
                {!org.approved ? (
                  <button
                    onClick={() => handleApprove(org.organizerId)}
                    className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl text-sm transition-colors shadow-lg shadow-yellow-500/20"
                  >
                    Duyệt ngay
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedOrg(org)}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-sm transition-colors"
                  >
                    Chi tiết
                  </button>
                )}

                <button
                  onClick={() => handleDelete(org.slug)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                  title="Xóa tổ chức"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- MODAL DETAIL (Dùng cho tổ chức đã duyệt) --- */}
      <AnimatePresence>
        {selectedOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrg(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#121212] border border-[#B5A65F]/30 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setSelectedOrg(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                <FaTimes size={20} />
              </button>

              <div className="text-center mb-6">
                <img
                  src={selectedOrg.logoUrl || "https://via.placeholder.com/150"}
                  alt="Logo"
                  className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-[#1a1a1a] shadow-xl mb-4"
                />
                <h2 className="text-2xl font-bold text-white">
                  {selectedOrg.name}
                </h2>
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                  {selectedOrg.slug}
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
                  <h4 className="text-[#B5A65F] text-xs font-bold uppercase mb-2">
                    Giới thiệu
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedOrg.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a1a1a] p-3 rounded-xl border border-white/5">
                    <p className="text-gray-500 text-xs">Chủ sở hữu</p>
                    <p className="text-white font-bold">
                      {selectedOrg.username}
                    </p>
                  </div>
                  <div className="bg-[#1a1a1a] p-3 rounded-xl border border-white/5">
                    <p className="text-gray-500 text-xs">ID Tổ chức</p>
                    <p className="text-white font-bold">
                      #{selectedOrg.organizerId}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
