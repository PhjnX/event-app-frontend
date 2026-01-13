import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaTimes,
  FaCamera,
  FaBuilding,
  FaBriefcase,
  FaChevronDown,
  FaCheck,
  FaLayerGroup,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaIdBadge,
  FaStar,
  FaRegStar,
  FaUserTie,
  FaFileExcel,
} from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

import type { AppDispatch, RootState } from "../../../store";
import {
  fetchMyPresenters,
  fetchPresenters,
  fetchPresentersByOrganizer,
  deletePresenter,
  createPresenter,
  updatePresenter,
  updateFeaturedList,
  resetPresenterState,
} from "../../../store/slices/presenterSlice";
import { fetchOrganizers } from "../../../store/slices/organizerSlice";
import { uploadAvatar } from "../../../store/slices/auth";
import type { Presenter } from "../../../models/presenter";
import { ROLES } from "@/constants";

import ConfirmModal from "./../_components/ConfirmModal";
import LoadingOverlay from "../../HomeTemplate/_components/common/LoadingOverlay";

const ITEMS_PER_PAGE = 8;

export default function ManagePresenters() {
  const dispatch = useDispatch<AppDispatch>();

  const { data: presenters, isLoading } = useSelector(
    (state: RootState) => state.presenters
  );
  const { data: organizers } = useSelector(
    (state: RootState) => state.organizers
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const isSAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === "SADMIN";
  const isOrganizer =
    user?.role === ROLES.ORGANIZER || user?.role === "ORGANIZER";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrgSlug, setSelectedOrgSlug] = useState("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [viewDetailPresenter, setViewDetailPresenter] =
    useState<Presenter | null>(null);
  const [selectedPresenterId, setSelectedPresenterId] = useState<number | null>(
    null
  );

  const [formData, setFormData] = useState<Partial<Presenter>>({
    fullName: "",
    title: "",
    company: "",
    bio: "",
    avatarUrl: "",
    featured: false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    id: number | null;
    name: string;
  }>({
    isOpen: false,
    id: null,
    name: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localFeatured, setLocalFeatured] = useState<Record<number, boolean>>(
    {}
  );
  const [, setMissingSlugError] = useState(false);

  // FETCH DATA
  useEffect(() => {
    if (isSAdmin) dispatch(fetchOrganizers());
  }, [dispatch, isSAdmin]);

  useEffect(() => {
    const loadData = async () => {
      dispatch(resetPresenterState());
      setMissingSlugError(false);

      if (isSAdmin) {
        if (selectedOrgSlug === "ALL") dispatch(fetchPresenters());
        else dispatch(fetchPresentersByOrganizer(selectedOrgSlug));
      } else if (isOrganizer && user) {
        dispatch(fetchMyPresenters());
      }
    };
    loadData();
  }, [dispatch, isSAdmin, isOrganizer, selectedOrgSlug, user]);

  const filteredData = useMemo(() => {
    return presenters.filter((item) => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        item.fullName.toLowerCase().includes(lowerSearch) ||
        (item.company && item.company.toLowerCase().includes(lowerSearch)) ||
        (item.title && item.title.toLowerCase().includes(lowerSearch))
      );
    });
  }, [presenters, searchTerm]);

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
      const exportData = filteredData.map((p) => ({
        ID: p.presenterId,
        "Họ và Tên": p.fullName,
        "Chức danh": p.title || "---",
        "Công ty/Tổ chức": p.company || "Tự do",
        "Tiểu sử": p.bio || "",
        "Nổi bật?": p.featured ? "Có" : "Không",
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách Diễn giả");
      XLSX.writeFile(
        workbook,
        `Presenters_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      toast.success("Xuất file Excel thành công!");
    } catch (error) {
      toast.error("Lỗi xuất file.");
    }
  };

  const handleToggleFeatured = async (presenter: Presenter) => {
    if (!isSAdmin) return;
    const isCurrentlyFeatured = localFeatured.hasOwnProperty(
      presenter.presenterId
    )
      ? localFeatured[presenter.presenterId]
      : presenter.featured;

    setLocalFeatured((prev) => ({
      ...prev,
      [presenter.presenterId]: !isCurrentlyFeatured,
    }));

    try {
      const allCurrentFeaturedIds = presenters
        .filter((p) => p.featured)
        .map((p) => p.presenterId);
      let newFeaturedIds = isCurrentlyFeatured
        ? allCurrentFeaturedIds.filter((id) => id !== presenter.presenterId)
        : [...allCurrentFeaturedIds, presenter.presenterId];

      await dispatch(updateFeaturedList(newFeaturedIds)).unwrap();
      toast.success(
        !isCurrentlyFeatured ? "Đã thêm vào nổi bật" : "Đã gỡ khỏi nổi bật"
      );
      setLocalFeatured((prev) => {
        const newState = { ...prev };
        delete newState[presenter.presenterId];
        return newState;
      });
    } catch (error) {
      toast.error("Lỗi cập nhật!");
      setLocalFeatured((prev) => ({
        ...prev,
        [presenter.presenterId]: isCurrentlyFeatured,
      }));
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedPresenterId(null);
    setFormData({
      fullName: "",
      title: "",
      company: "",
      bio: "",
      avatarUrl: "",
      featured: false,
    });
    setPreviewImage(null);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleEdit = (presenter: Presenter) => {
    setModalMode("edit");
    setSelectedPresenterId(presenter.presenterId);
    setFormData({ ...presenter });
    setPreviewImage(presenter.avatarUrl);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalAvatarUrl = formData.avatarUrl;
      if (selectedFile) {
        const uploadAction = await dispatch(uploadAvatar(selectedFile));
        if (uploadAvatar.fulfilled.match(uploadAction))
          finalAvatarUrl = uploadAction.payload as string;
        else throw new Error("Lỗi upload ảnh");
      }

      const payload = {
        ...formData,
        avatarUrl: finalAvatarUrl,
        organizerId: isOrganizer ? (user as any)?.organizerId : undefined,
      };

      if (modalMode === "create")
        await dispatch(createPresenter(payload)).unwrap();
      else if (selectedPresenterId)
        await dispatch(
          updatePresenter({ id: selectedPresenterId, data: payload as any })
        ).unwrap();

      toast.success("Thao tác thành công!");
      setIsModalOpen(false);
      if (isSAdmin) {
        if (selectedOrgSlug === "ALL") dispatch(fetchPresenters());
        else dispatch(fetchPresentersByOrganizer(selectedOrgSlug));
      } else if (isOrganizer) {
        dispatch(fetchMyPresenters());
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (presenter: Presenter) =>
    setConfirmState({
      isOpen: true,
      id: presenter.presenterId,
      name: presenter.fullName,
    });

  const confirmDeleteAction = async () => {
    if (confirmState.id) {
      setIsSubmitting(true);
      try {
        await dispatch(deletePresenter(confirmState.id)).unwrap();
        toast.success("Đã xóa diễn giả.");
        if (paginatedData.length === 1 && currentPage > 1)
          setCurrentPage(currentPage - 1);
      } catch (error: any) {
        toast.error(error.message || "Lỗi xóa.");
      } finally {
        setIsSubmitting(false);
        setConfirmState({ ...confirmState, isOpen: false });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning("Ảnh tối đa 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="relative min-h-screen pb-20 px-4 md:px-6 font-sans text-white selection:bg-[rgba(181,166,95,0.3)]">
      <AnimatePresence>
        {isSubmitting && (
          <LoadingOverlay message="Đang xử lý..." className="fixed z-9999" />
        )}
      </AnimatePresence>

      {/* --- HEADER CONTROLS --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8 pt-4">
        {isSAdmin ? (
          <div className="relative z-40 w-full xl:w-auto" ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="cursor-pointer flex items-center justify-between gap-4 w-full xl:min-w-[280px] px-5 py-3 rounded-2xl bg-[#1a1a1a] border border-white/10 hover:border-white/30 transition-all"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FaLayerGroup className="text-[#B5A65F] shrink-0" />
                <span className="text-sm font-bold truncate">
                  {selectedOrgSlug === "ALL"
                    ? "Tất cả Organizer"
                    : organizers.find((o) => o.slug === selectedOrgSlug)
                        ?.name || "Organizer"}
                </span>
              </div>
              <FaChevronDown className="text-gray-500 shrink-0" />
            </div>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-full left-0 mt-3 w-full bg-[#1a1a1a] border border-white/10 rounded-2xl z-50 overflow-hidden shadow-xl max-h-60 overflow-y-auto"
                >
                  <div
                    onClick={() => {
                      setSelectedOrgSlug("ALL");
                      setIsDropdownOpen(false);
                    }}
                    className="px-5 py-3 hover:bg-[rgba(255,255,255,0.05)] cursor-pointer text-sm flex justify-between items-center"
                  >
                    <span
                      className={
                        selectedOrgSlug === "ALL"
                          ? "text-[#B5A65F]"
                          : "text-gray-300"
                      }
                    >
                      Tất cả Organizer
                    </span>
                    {selectedOrgSlug === "ALL" && (
                      <FaCheck className="text-[#B5A65F] text-xs" />
                    )}
                  </div>
                  {organizers.map((org) => (
                    <div
                      key={org.organizerId}
                      onClick={() => {
                        setSelectedOrgSlug(org.slug);
                        setIsDropdownOpen(false);
                      }}
                      className="px-5 py-3 hover:bg-[rgba(255,255,255,0.05)] cursor-pointer text-sm flex justify-between items-center"
                    >
                      <span
                        className={
                          selectedOrgSlug === org.slug
                            ? "text-[#B5A65F]"
                            : "text-gray-300"
                        }
                      >
                        {org.name}
                      </span>
                      {selectedOrgSlug === org.slug && (
                        <FaCheck className="text-[#B5A65F] text-xs" />
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="hidden xl:block w-1" />
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <button
            onClick={handleExportExcel}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[rgba(22,163,74,0.15)] text-green-500 border border-[rgba(22,163,74,0.3)] hover:bg-green-600 hover:text-white transition-all font-bold text-sm shadow-lg"
          >
            <FaFileExcel /> Xuất Excel
          </button>
          <div className="relative group w-full sm:w-72">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F]" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#B5A65F] outline-none"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto px-6 py-3 bg-[#B5A65F] text-black font-bold text-sm rounded-2xl hover:bg-[#c4b56a] flex justify-center items-center gap-2 shadow-lg"
          >
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500 italic">
          Đang tải danh sách diễn giả...
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center text-gray-500 border border-white/5 border-dashed rounded-3xl bg-[rgba(26,26,26,0.3)] h-80">
          <FaUserTie className="text-6xl opacity-20 mb-4" />
          <p className="text-lg font-medium">Không tìm thấy diễn giả nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 z-0 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {paginatedData.map((item) => {
              const isStarActive = localFeatured.hasOwnProperty(
                item.presenterId
              )
                ? localFeatured[item.presenterId]
                : item.featured;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.presenterId}
                  className={`group relative bg-[#1a1a1a] rounded-3xl border transition-all duration-300 flex flex-col ${
                    isStarActive
                      ? "border-[#B5A65F] shadow-[0_0_20px_rgba(181,166,95,0.1)]"
                      : "border-white/5 hover:border-[#B5A65F]/30"
                  }`}
                >
                  {isSAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFeatured(item);
                      }}
                      className={`absolute top-3 right-3 z-30 p-2.5 rounded-full transition-all active:scale-90 backdrop-blur-md ${
                        isStarActive
                          ? "bg-[#B5A65F] text-black shadow-lg"
                          : "bg-[rgba(0,0,0,0.4)] text-gray-500 hover:text-white"
                      }`}
                    >
                      {isStarActive ? <FaStar /> : <FaRegStar />}
                    </button>
                  )}
                  <div className="relative pt-8 px-6 pb-2 flex flex-col items-center z-10">
                    <div
                      className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-linear-to-b ${
                        isStarActive
                          ? "from-[#B5A65F] to-[rgba(181,166,95,0.2)]"
                          : "from-[rgba(181,166,95,0.5)] to-[rgba(0,0,0,0)]"
                      }`}
                    >
                      <img
                        src={
                          item.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${item.fullName}`
                        }
                        alt={item.fullName}
                        className="w-full h-full rounded-full object-cover bg-[#121212] border-4 border-[#1a1a1a]"
                      />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-white text-center line-clamp-1 group-hover:text-[#B5A65F] transition-colors">
                      {item.fullName}
                    </h3>
                    <div className="mt-1 px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-white/5 text-[10px] font-bold text-[#B5A65F] uppercase tracking-wider">
                      {item.title || "Diễn Giả"}
                    </div>
                  </div>
                  <div className="px-6 py-4 flex-1 space-y-3 relative z-10 text-xs text-gray-400">
                    <div className="flex gap-3">
                      <FaBuilding className="text-gray-500 shrink-0" />
                      <p className="truncate">{item.company || "Tự do"}</p>
                    </div>
                    <div className="flex gap-3">
                      <FaBriefcase className="text-gray-500 shrink-0" />
                      <p className="line-clamp-2 leading-relaxed">
                        {item.bio || "Chưa có tiểu sử."}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-white/5 bg-[rgba(0,0,0,0.2)] flex divide-x divide-white/10">
                    <button
                      onClick={() => setViewDetailPresenter(item)}
                      className="flex-1 py-1 text-[11px] font-bold text-gray-400 hover:text-white flex items-center justify-center gap-2"
                    >
                      <FaEye /> Chi tiết
                    </button>
                    {(isOrganizer || isSAdmin) && (
                      <>
                        <button
                          onClick={() => handleEdit(item)}
                          className="flex-1 py-1 text-blue-400 text-[11px] font-bold hover:text-white flex items-center justify-center gap-2"
                        >
                          <FaEdit /> Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="flex-1 py-1 text-red-500 text-[11px] font-bold hover:text-white flex items-center justify-center gap-2"
                        >
                          <FaTrashAlt /> Xóa
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* --- PAGINATION --- */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-white/10 disabled:opacity-50 hover:border-[#B5A65F] transition-all"
          >
            <FaChevronLeft size={12} />
          </button>
          <span className="text-sm font-bold text-gray-400 px-2">
            Trang <span className="text-white">{currentPage}</span> /{" "}
            {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-white/10 disabled:opacity-50 hover:border-[#B5A65F] transition-all"
          >
            <FaChevronRight size={12} />
          </button>
        </div>
      )}

      {/* --- MODAL DETAIL --- */}
      <AnimatePresence>
        {viewDetailPresenter && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewDetailPresenter(null)}
              className="absolute inset-0 bg-[rgba(0,0,0,0.8)] backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#181818] border border-[rgba(181,166,95,0.3)] rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10"
            >
              <div className="h-32 bg-linear-to-r from-[rgba(181,166,95,0.2)] to-primary-gold-transparent relative">
                <button
                  onClick={() => setViewDetailPresenter(null)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white p-2 bg-[rgba(0,0,0,0.2)] rounded-full transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="px-8 pb-8 -mt-16 flex flex-col items-center text-center relative z-10">
                <img
                  src={
                    viewDetailPresenter.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${viewDetailPresenter.fullName}`
                  }
                  alt={viewDetailPresenter.fullName}
                  className="w-32 h-32 rounded-full border-4 border-[#181818] bg-black shadow-xl object-cover mb-4"
                />
                <h2 className="text-2xl font-black text-white uppercase mb-1">
                  {viewDetailPresenter.fullName}
                </h2>
                <div className="flex items-center gap-2 text-[#B5A65F] font-bold text-sm uppercase mb-6">
                  <FaBriefcase /> {viewDetailPresenter.title} @{" "}
                  {viewDetailPresenter.company}
                </div>
                <div className="w-full bg-[rgba(255,255,255,0.03)] p-6 rounded-2xl border border-white/5 text-left">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <FaIdBadge /> Tiểu sử
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed max-h-60 overflow-y-auto whitespace-pre-line text-justify font-light">
                    {viewDetailPresenter.bio || "Chưa cập nhật."}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL FORM --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute inset-0 bg-[rgba(0,0,0,0.8)] backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#181818] border border-white/10 rounded-3xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a] shrink-0">
                <h2 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-wide">
                  {modalMode === "create" ? (
                    <FaPlus className="text-[#B5A65F]" />
                  ) : (
                    <FaEdit className="text-[#B5A65F]" />
                  )}{" "}
                  {modalMode === "create"
                    ? "Thêm Diễn Giả"
                    : "Cập Nhật Thông Tin"}
                </h2>
                <button
                  onClick={() => !isSubmitting && setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="overflow-y-auto custom-scrollbar flex-1 bg-[#181818]">
                <form
                  id="presenter-form"
                  onSubmit={handleSubmit}
                  className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8"
                >
                  <div className="md:col-span-4 flex flex-col items-center">
                    <div
                      className="relative group w-40 h-40 rounded-full border-2 border-dashed border-gray-700 hover:border-[#B5A65F] flex items-center justify-center overflow-hidden bg-black cursor-pointer transition-all"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {previewImage ? (
                        <>
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-full object-cover group-hover:opacity-40 transition-opacity"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <FaCamera className="text-[#B5A65F] text-2xl" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-gray-500 group-hover:text-[#B5A65F]">
                          <FaCamera size={24} />
                          <span className="text-xs font-bold mt-2 uppercase tracking-wide">
                            Upload
                          </span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <p className="text-[10px] text-gray-500 mt-3 text-center uppercase tracking-tighter italic">
                      Ảnh thẻ diễn giả (Max 5MB)
                    </p>
                  </div>
                  <div className="md:col-span-8 space-y-5">
                    <div>
                      <label className="text-[11px] font-bold text-[#B5A65F] uppercase mb-2 block">
                        Họ tên *
                      </label>
                      <input
                        required
                        type="text"
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#B5A65F] outline-none transition-all"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-[#B5A65F] uppercase mb-2 block">
                          Chức danh
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#B5A65F] outline-none"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#B5A65F] uppercase mb-2 block">
                          Công ty
                        </label>
                        <input
                          type="text"
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#B5A65F] outline-none"
                          value={formData.company}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              company: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#B5A65F] uppercase mb-2 block">
                        Tiểu sử
                      </label>
                      <textarea
                        rows={4}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#B5A65F] outline-none resize-none transition-all"
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                      />
                    </div>
                    {isSAdmin && (
                      <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.03)] p-3 rounded-xl border border-white/5">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          checked={formData.featured}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              featured: e.target.checked,
                            })
                          }
                          className="w-5 h-5 accent-[#B5A65F]"
                        />
                        <label
                          htmlFor="isFeatured"
                          className="text-sm font-bold text-white cursor-pointer select-none"
                        >
                          Đánh dấu Nổi bật?
                        </label>
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className="p-6 border-t border-white/5 bg-[#1a1a1a] flex gap-3 shrink-0">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-[rgba(255,255,255,0.05)] text-gray-400 font-bold rounded-xl hover:text-white border border-white/5"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  form="presenter-form"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#B5A65F] text-black font-bold rounded-xl hover:bg-[#c4b56a] shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Đang xử lý..." : "Lưu Thay Đổi"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
        onConfirm={confirmDeleteAction}
        type="DELETE"
        title="Xóa Diễn Giả"
        message={`Bạn có chắc muốn xóa "${confirmState.name}"?`}
      />
    </div>
  );
}
