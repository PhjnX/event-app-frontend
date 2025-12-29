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
} from "react-icons/fa";
import { toast } from "react-toastify";

import type { AppDispatch, RootState } from "../../../store";
import {
  fetchPresenters,
  fetchPresentersByOrganizer,
  deletePresenter,
  createPresenter,
  updatePresenter,
  updateFeaturedList, 
} from "../../../store/slices/presenterSlice";
import { fetchOrganizers } from "../../../store/slices/organizerSlice";
import { uploadAvatar } from "../../../store/slices/auth";
import type { Presenter } from "../../../models/presenter";
import { ROLES } from "@/constants";

import ConfirmModal from "./../_components/ConfirmModal";
import LoadingScreen from "@/pages/HomeTemplate/_components/common/LoadingSrceen";
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
  }>({ isOpen: false, id: null, name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [localFeatured, setLocalFeatured] = useState<Record<number, boolean>>(
    {}
  );

  useEffect(() => {
    dispatch(fetchOrganizers());
  }, [dispatch]);

  useEffect(() => {
    const loadData = async () => {
      if (isSAdmin) {
        if (selectedOrgSlug === "ALL") {
          dispatch(fetchPresenters());
        } else {
          dispatch(fetchPresentersByOrganizer(selectedOrgSlug));
        }
      } else if (isOrganizer && user?.username) {
        let mySlug = (user as any)?.slug;
        if (!mySlug && organizers.length > 0) {
          const myOrgInfo = organizers.find(
            (o) => o.username === user.username
          );
          if (myOrgInfo) mySlug = myOrgInfo.slug;
        }
        if (mySlug) dispatch(fetchPresentersByOrganizer(mySlug));
      }
    };
    loadData();
  }, [dispatch, isSAdmin, isOrganizer, selectedOrgSlug, user, organizers]);

  const filteredData = useMemo(() => {
    return presenters.filter((item) => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        item.fullName.toLowerCase().includes(lowerSearch) ||
        item.company?.toLowerCase().includes(lowerSearch) ||
        item.title?.toLowerCase().includes(lowerSearch)
      );
    });
  }, [presenters, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const getSelectedOrgName = () => {
    if (selectedOrgSlug === "ALL") return "Tất cả Organizer";
    const org = organizers.find((o) => o.slug === selectedOrgSlug);
    return org ? org.name : "Tất cả Organizer";
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

      let newFeaturedIds: number[] = [];

      if (isCurrentlyFeatured) {
        newFeaturedIds = allCurrentFeaturedIds.filter(
          (id) => id !== presenter.presenterId
        );
      } else {
        if (!allCurrentFeaturedIds.includes(presenter.presenterId)) {
          newFeaturedIds = [...allCurrentFeaturedIds, presenter.presenterId];
        } else {
          newFeaturedIds = allCurrentFeaturedIds;
        }
      }

      await dispatch(updateFeaturedList(newFeaturedIds)).unwrap();

      toast.success(
        !isCurrentlyFeatured
          ? `Đã thêm "${presenter.fullName}" vào nổi bật`
          : `Đã gỡ "${presenter.fullName}" khỏi nổi bật`
      );

      setLocalFeatured((prev) => {
        const newState = { ...prev };
        delete newState[presenter.presenterId];
        return newState;
      });
    } catch (error) {
      console.error("Lỗi update featured:", error);
      toast.error("Lỗi cập nhật trạng thái!");
      setLocalFeatured((prev) => ({
        ...prev,
        [presenter.presenterId]: isCurrentlyFeatured,
      }));
    }
  };

  const refreshList = () => {
    if (isSAdmin) {
      if (selectedOrgSlug === "ALL") dispatch(fetchPresenters());
      else dispatch(fetchPresentersByOrganizer(selectedOrgSlug));
    } else if (isOrganizer && user?.username) {
      let mySlug = (user as any)?.slug;
      if (!mySlug && organizers.length > 0) {
        const myOrgInfo = organizers.find((o) => o.username === user.username);
        if (myOrgInfo) mySlug = myOrgInfo.slug;
      }
      if (mySlug) dispatch(fetchPresentersByOrganizer(mySlug));
    }
  };

  const handleEdit = (presenter: Presenter) => {
    setModalMode("edit");
    setSelectedPresenterId(presenter.presenterId);
    setFormData({
      fullName: presenter.fullName || "",
      title: presenter.title || "",
      company: presenter.company || "",
      bio: presenter.bio || "",
      avatarUrl: presenter.avatarUrl || "",
      featured: presenter.featured || false, 
    });
    setPreviewImage(presenter.avatarUrl);
    setSelectedFile(null);
    setIsModalOpen(true);
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

  const handleDeleteClick = (presenter: Presenter) => {
    setConfirmState({
      isOpen: true,
      id: presenter.presenterId,
      name: presenter.fullName,
    });
  };

  const confirmDelete = async () => {
    if (confirmState.id) {
      setIsSubmitting(true);
      try {
        await dispatch(deletePresenter(confirmState.id)).unwrap();
        toast.success("Đã xóa diễn giả.");
        setLocalFeatured((prev) => {
          const newState = { ...prev };
          if (confirmState.id) delete newState[confirmState.id];
          return newState;
        });
        if (paginatedData.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error: any) {
        toast.error(error.message || "Lỗi xóa diễn giả.");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalAvatarUrl = formData.avatarUrl;
      if (selectedFile) {
        const uploadAction = await dispatch(uploadAvatar(selectedFile));
        if (uploadAvatar.fulfilled.match(uploadAction)) {
          finalAvatarUrl = uploadAction.payload as string;
        } else {
          toast.error("Lỗi upload ảnh!");
          setIsSubmitting(false);
          return;
        }
      }

      let orgIdToSave = undefined;
      if (isOrganizer) {
        orgIdToSave = (user as any)?.organizerId;
        if (!orgIdToSave && organizers.length > 0) {
          const myOrg = organizers.find((o) => o.username === user?.username);
          if (myOrg) orgIdToSave = myOrg.organizerId;
        }
      }

      // Payload
      const payload = {
        fullName: formData.fullName,
        title: formData.title,
        company: formData.company,
        bio: formData.bio,
        avatarUrl: finalAvatarUrl,
        featured: formData.featured, 
        organizerId: orgIdToSave,
      };

      if (modalMode === "create") {
        await dispatch(createPresenter(payload)).unwrap();
        toast.success("Thêm mới thành công!");
      } else {
        if (selectedPresenterId) {
          await dispatch(
            updatePresenter({ id: selectedPresenterId, data: payload })
          ).unwrap();
          toast.success("Cập nhật thành công!");
        }
      }
      setIsModalOpen(false);
      refreshList();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && presenters.length === 0) return <LoadingScreen />;

  return (
    <div className="relative min-h-screen pb-20 font-sans text-white">
      <AnimatePresence>
        {((isSubmitting && !isModalOpen) ||
          (isLoading && presenters.length > 0)) && (
          <LoadingOverlay
            message="Đang xử lý dữ liệu..."
            className="fixed z-9999"
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row justify-between items-end lg:items-center gap-4 mb-8 pt-4">
        {isSAdmin ? (
          <div className="relative z-40 w-full lg:w-auto" ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`cursor-pointer group flex items-center justify-between gap-4 min-w-[280px] px-5 py-3 rounded-2xl bg-[#1a1a1a] border transition-all duration-300 ${
                isDropdownOpen
                  ? "border-[#B5A65F]"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <FaLayerGroup className="text-[#B5A65F]" />{" "}
                <span className="text-sm font-bold truncate max-w-[180px]">
                  {getSelectedOrgName()}
                </span>
              </div>
              <FaChevronDown className="text-gray-500" />
            </div>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-full left-0 mt-3 w-full bg-[#1a1a1a] border border-white/10 rounded-2xl z-50 overflow-hidden shadow-xl max-h-96 overflow-y-auto custom-scrollbar"
                >
                  <div
                    onClick={() => {
                      setSelectedOrgSlug("ALL");
                      setIsDropdownOpen(false);
                    }}
                    className="px-5 py-3 hover:bg-white/5 cursor-pointer text-sm flex justify-between items-center"
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
                      className="px-5 py-3 hover:bg-white/5 cursor-pointer text-sm flex justify-between items-center"
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
          <div className="hidden lg:block lg:w-1"></div>
        )}

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative group w-full lg:w-72">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm tên, chức danh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#B5A65F] outline-none"
            />
          </div>
          {isOrganizer && (
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-[#B5A65F] text-black font-bold text-sm rounded-2xl hover:bg-[#c4b56a] flex items-center gap-2 whitespace-nowrap"
            >
              <FaPlus /> Thêm mới
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 z-0 min-h-[400px]">
        {paginatedData.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center text-gray-500 border border-white/5 border-dashed rounded-3xl bg-[#1a1a1a]/30 h-80">
            <FaUserTie className="text-6xl opacity-20 mb-4" />
            <p className="text-lg font-medium">Không tìm thấy diễn giả nào.</p>
          </div>
        ) : (
          paginatedData.map((item) => {
            const ownerOrg = organizers.find(
              (o) => o.organizerId === item.organizerId
            );

            const isStarActive = localFeatured.hasOwnProperty(item.presenterId)
              ? localFeatured[item.presenterId]
              : item.featured; 

            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={item.presenterId}
                className={`group relative bg-[#1a1a1a] rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col
                  ${
                    isStarActive
                      ? "border-[#B5A65F] shadow-[0_0_20px_rgba(181,166,95,0.15)]"
                      : "border-white/5 hover:border-[#B5A65F]/30"
                  }
                `}
              >
                {isSAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFeatured(item);
                    }}
                    className={`absolute top-3 right-3 z-30 p-2.5 rounded-full transition-all active:scale-90 backdrop-blur-md
                      ${
                        isStarActive
                          ? "bg-[#B5A65F] text-black shadow-lg shadow-[#B5A65F]/40"
                          : "bg-black/40 text-gray-500 hover:text-white hover:bg-black/60"
                      }
                    `}
                    title={isStarActive ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
                  >
                    {isStarActive ? (
                      <FaStar className="text-lg" />
                    ) : (
                      <FaRegStar className="text-lg" />
                    )}
                  </button>
                )}

                {!isSAdmin && isStarActive && (
                  <div className="absolute top-3 right-3 z-30 p-2 bg-[#B5A65F]/10 rounded-full text-[#B5A65F]">
                    <FaStar className="text-lg drop-shadow-[0_0_8px_rgba(181,166,95,0.6)]" />
                  </div>
                )}

                {isStarActive && (
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#B5A65F]/20 rounded-full blur-[50px] pointer-events-none transition-all duration-500" />
                )}

                <div className="relative pt-8 px-6 pb-2 flex flex-col items-center z-10">
                  <div className="relative">
                    <div
                      className={`w-28 h-28 rounded-full p-1 bg-linear-to-b ${
                        isStarActive
                          ? "from-[#B5A65F] to-[#B5A65F]/20"
                          : "from-[#B5A65F]/50 to-transparent"
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
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white text-center line-clamp-1">
                    {item.fullName}
                  </h3>
                  <div className="mt-1 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-[#B5A65F] uppercase">
                    {item.title || "Diễn Giả"}
                  </div>
                </div>

                <div className="px-6 py-4 flex-1 space-y-3 relative z-10">
                  {ownerOrg && (
                    <div className="flex gap-2 items-center text-[#B5A65F] text-[11px] font-bold uppercase tracking-wide mb-1">
                      <FaLayerGroup size={10} /> Thuộc: {ownerOrg.name}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <FaBuilding className="text-gray-500 text-xs mt-1" />{" "}
                    <p className="text-sm text-gray-200 truncate">
                      {item.company || "Tự do"}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <FaBriefcase className="text-gray-500 text-xs mt-1" />{" "}
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {item.bio || "..."}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex divide-x divide-white/10">
                  <button
                    onClick={() => setViewDetailPresenter(item)}
                    className="flex-1 py-2.5 text-xs font-bold text-gray-400 hover:text-white flex items-center justify-center gap-2"
                  >
                    <FaEye /> Chi tiết
                  </button>
                  {isOrganizer && (
                    <>
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 py-2.5 text-blue-400 text-xs font-bold hover:text-white flex items-center justify-center gap-2"
                      >
                        <FaEdit /> Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="flex-1 py-2.5 text-red-500 text-xs font-bold hover:text-white flex items-center justify-center gap-2"
                      >
                        <FaTrashAlt /> Xóa
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`w-10 h-10 flex items-center justify-center rounded-xl border ${
              currentPage === 1
                ? "bg-white/5 text-gray-600 border-white/5"
                : "bg-[#1a1a1a] text-white border-white/10 hover:border-[#B5A65F]"
            }`}
          >
            <FaChevronLeft size={12} />
          </button>
          <span className="text-sm text-gray-400">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`w-10 h-10 flex items-center justify-center rounded-xl border ${
              currentPage === totalPages
                ? "bg-white/5 text-gray-600 border-white/5"
                : "bg-[#1a1a1a] text-white border-white/10 hover:border-[#B5A65F]"
            }`}
          >
            <FaChevronRight size={12} />
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ ...confirmState, isOpen: false })}
        onConfirm={confirmDelete}
        type="DELETE"
        title="Xóa Diễn Giả"
        message={`Bạn có chắc muốn xóa "${confirmState.name}"?`}
        confirmText="Xóa ngay"
      />

      <AnimatePresence>
        {viewDetailPresenter && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewDetailPresenter(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="relative w-full max-w-lg bg-[#181818] border border-[#B5A65F]/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10"
            >
              <div className="h-32 bg-linear-to-r from-[#B5A65F]/20 to-transparent relative">
                <button
                  onClick={() => setViewDetailPresenter(null)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white p-2 bg-black/20 rounded-full"
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
                {viewDetailPresenter.featured && (
                  <div className="mb-2 inline-flex items-center gap-1 bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-yellow-400/20">
                    <FaStar /> Featured
                  </div>
                )}
                <div className="flex items-center gap-2 text-[#B5A65F] font-bold text-sm uppercase mb-6">
                  <FaBriefcase /> {viewDetailPresenter.title} @{" "}
                  {viewDetailPresenter.company}
                </div>
                <div className="w-full bg-white/3 p-6 rounded-2xl border border-white/5 text-left">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <FaIdBadge /> Tiểu sử
                  </h4>
                  <div className="text-gray-300 text-sm leading-relaxed max-h-60 overflow-y-auto custom-scrollbar whitespace-pre-line text-justify">
                    {viewDetailPresenter.bio || "Chưa cập nhật."}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isSubmitting) setIsModalOpen(false);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="relative w-full max-w-2xl bg-[#181818] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a]">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  {modalMode === "create" ? <FaPlus /> : <FaEdit />}{" "}
                  {modalMode === "create" ? "Thêm Mới" : "Cập Nhật"}
                </h2>
                <button
                  onClick={() => !isSubmitting && setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8"
              >
                <div className="md:col-span-4 flex flex-col items-center">
                  <div
                    className="relative group w-40 h-40 rounded-full border-2 border-dashed border-gray-700 hover:border-[#B5A65F] flex items-center justify-center overflow-hidden bg-black cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:opacity-40 transition-opacity"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-500 group-hover:text-[#B5A65F]">
                        <FaCamera size={24} />
                        <span className="text-xs font-bold mt-1">Upload</span>
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
                  <p className="text-[10px] text-gray-500 mt-3 text-center">
                    JPG, PNG (Max 5MB)
                  </p>
                </div>

                {/* FORM INPUTS */}
                <div className="md:col-span-8 space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1">
                      Họ tên *
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#B5A65F] outline-none"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1">
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
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1">
                        Công ty
                      </label>
                      <input
                        type="text"
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#B5A65F] outline-none"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-1">
                      Tiểu sử
                    </label>
                    <textarea
                      rows={3}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#B5A65F] outline-none resize-none"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                    />
                  </div>

                  {isSAdmin && (
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={formData.featured || false} 
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

                  <div className="pt-4 flex gap-3 border-t border-white/5 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 bg-white/5 text-gray-400 font-bold rounded-xl hover:bg-white/10"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-[#B5A65F] text-black font-bold rounded-xl hover:bg-[#c4b56a]"
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
