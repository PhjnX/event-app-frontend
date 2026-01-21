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
  FaLock,
  FaSpinner,
  FaFilter,
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
  resetPresenterState,
} from "../../../store/slices/presenterSlice";
import {
  fetchOrganizers,
  fetchMyOrganizerStatus, // ✅ Import action mới
} from "../../../store/slices/organizerSlice";
import { fetchMyEvents } from "@/store/slices/eventSlice";
import { uploadAvatar } from "../../../store/slices/auth";
import type { Presenter } from "../../../models/presenter";
import { ROLES } from "@/constants";

import ConfirmModal from "./../_components/ConfirmModal";
import LoadingOverlay from "../../HomeTemplate/_components/common/LoadingOverlay";
import apiService from "@/services/apiService";

const ITEMS_PER_PAGE = 8;

export default function ManagePresenters() {
  const dispatch = useDispatch<AppDispatch>();

  const { data: presenters, isLoading } = useSelector(
    (state: RootState) => state.presenters,
  );
  const { data: organizers } = useSelector(
    (state: RootState) => state.organizers,
  );
  const { data: myEvents } = useSelector((state: RootState) => state.events);
  const { user } = useSelector((state: RootState) => state.auth);

  const isSAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === "SADMIN";
  const isOrganizer =
    user?.role === ROLES.ORGANIZER || user?.role === "ORGANIZER";

  const [orgStatus, setOrgStatus] = useState({ locked: false, approved: true });
  // Mặc định isChecking true nếu là Organizer
  const [isChecking, setIsChecking] = useState(isOrganizer);

  // ✅ FIX: Logic check status mới nhất bằng API /me/status
  useEffect(() => {
    if (isOrganizer && user) {
      setIsChecking(true);
      dispatch(fetchMyOrganizerStatus())
        .unwrap()
        .then((res: any) => {
          setOrgStatus({
            locked: res.locked === true,
            approved: res.approved === true,
          });
        })
        .catch(() => {
          // Fallback nếu API lỗi
          const orgData = (user as any).organizer || {};
          setOrgStatus({
            locked: orgData.locked === true,
            approved: orgData.approved !== false,
          });
        })
        .finally(() => setIsChecking(false));
    } else {
      setIsChecking(false);
    }
  }, [dispatch, isOrganizer, user]);

  const isRestricted = !isSAdmin && (orgStatus.locked || !orgStatus.approved);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedOrgSlug, setSelectedOrgSlug] = useState("ALL");
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const orgDropdownRef = useRef<HTMLDivElement>(null);

  const [filterEventId, setFilterEventId] = useState<string | "ALL">("ALL");
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const eventDropdownRef = useRef<HTMLDivElement>(null);

  const [eventPresenters, setEventPresenters] = useState<Presenter[]>([]);
  const [isLoadingEventPresenters, setIsLoadingEventPresenters] =
    useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [viewDetailPresenter, setViewDetailPresenter] =
    useState<Presenter | null>(null);
  const [selectedPresenterId, setSelectedPresenterId] = useState<number | null>(
    null,
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
  const [localFeatured] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isSAdmin) {
      dispatch(fetchOrganizers());
    } else if (isOrganizer) {
      dispatch(fetchMyEvents());
    }
  }, [dispatch, isSAdmin, isOrganizer]);

  useEffect(() => {
    const loadData = async () => {
      dispatch(resetPresenterState());
      if (isSAdmin) {
        if (selectedOrgSlug === "ALL") dispatch(fetchPresenters());
        else dispatch(fetchPresentersByOrganizer(selectedOrgSlug));
      } else if (isOrganizer && user) {
        dispatch(fetchMyPresenters());
      }
    };
    if (!isOrganizer || (isOrganizer && filterEventId === "ALL")) {
      loadData();
    }
  }, [dispatch, isSAdmin, isOrganizer, selectedOrgSlug, user, filterEventId]);

  useEffect(() => {
    const loadEventPresenters = async () => {
      if (isOrganizer && filterEventId !== "ALL") {
        setIsLoadingEventPresenters(true);
        try {
          const res: any = await apiService.get(
            `/activities/by-event/${filterEventId}`,
          );

          if (Array.isArray(res)) {
            const uniquePresentersMap = new Map();
            res.forEach((act: any) => {
              if (act.presenter) {
                uniquePresentersMap.set(
                  act.presenter.presenterId,
                  act.presenter,
                );
              }
              if (act.presenters && Array.isArray(act.presenters)) {
                act.presenters.forEach((p: any) =>
                  uniquePresentersMap.set(p.presenterId, p),
                );
              }
            });
            setEventPresenters(Array.from(uniquePresentersMap.values()));
          }
        } catch (error) {
          console.error("Lỗi lấy diễn giả theo sự kiện", error);
          setEventPresenters([]);
        } finally {
          setIsLoadingEventPresenters(false);
        }
      } else {
        setEventPresenters([]);
      }
    };

    loadEventPresenters();
    setCurrentPage(1);
  }, [filterEventId, isOrganizer]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        orgDropdownRef.current &&
        !orgDropdownRef.current.contains(event.target as Node)
      )
        setIsOrgDropdownOpen(false);
      if (
        eventDropdownRef.current &&
        !eventDropdownRef.current.contains(event.target as Node)
      )
        setIsEventDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayData = useMemo(() => {
    if (isOrganizer && filterEventId !== "ALL") {
      return eventPresenters;
    }
    return presenters;
  }, [presenters, eventPresenters, isOrganizer, filterEventId]);

  const filteredData = useMemo(() => {
    return displayData.filter((item) => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        item.fullName.toLowerCase().includes(lowerSearch) ||
        (item.company && item.company.toLowerCase().includes(lowerSearch)) ||
        (item.title && item.title.toLowerCase().includes(lowerSearch))
      );
    });
  }, [displayData, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      toast.warn("Không có dữ liệu!");
      return;
    }
    const exportData = filteredData.map((p) => ({
      ID: p.presenterId,
      "Họ tên": p.fullName,
      "Chức danh": p.title,
      "Công ty": p.company,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Presenters");
    XLSX.writeFile(wb, "Presenters.xlsx");
    toast.success("Xuất file thành công!");
  };

  const handleToggleFeatured = async (_presenter: Presenter) => {
    if (!isSAdmin) return;
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
        const res = await dispatch(uploadAvatar(selectedFile)).unwrap();
        finalAvatarUrl = res;
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
          updatePresenter({ id: selectedPresenterId, data: payload as any }),
        ).unwrap();

      toast.success("Thao tác thành công!");
      setIsModalOpen(false);
      if (isSAdmin) {
        if (selectedOrgSlug === "ALL") dispatch(fetchPresenters());
        else dispatch(fetchPresentersByOrganizer(selectedOrgSlug));
      } else if (isOrganizer) {
        if (filterEventId === "ALL") dispatch(fetchMyPresenters());
        else {
          setFilterEventId((prev) => prev);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi");
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
    if (!confirmState.id) return;
    setIsSubmitting(true);
    try {
      await dispatch(deletePresenter(confirmState.id)).unwrap();
      toast.success("Đã xóa.");
    } catch (err) {
      toast.error("Lỗi xóa.");
    } finally {
      setIsSubmitting(false);
      setConfirmState({ ...confirmState, isOpen: false });
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const currentLoading =
    isLoading ||
    (isOrganizer && filterEventId !== "ALL" && isLoadingEventPresenters);

  return (
    <div className="relative min-h-screen pb-20 px-4 md:px-6 font-noto text-white selection:bg-[rgba(181,166,95,0.3)]">
      <AnimatePresence>
        {isSubmitting && (
          <LoadingOverlay message="Đang xử lý..." className="fixed z-9999" />
        )}
      </AnimatePresence>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8 pt-4">
        <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-4">
          {isSAdmin && (
            <div
              className="relative z-40 w-full sm:w-auto"
              ref={orgDropdownRef}
            >
              <div
                onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                className="cursor-pointer flex items-center justify-between gap-4 w-full sm:min-w-[280px] px-5 py-3 rounded-2xl bg-[#1a1a1a] border border-white/10 hover:border-white/30 transition-all shadow-lg"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <FaLayerGroup className="text-[#B5A65F] shrink-0" />
                  <span className="text-sm font-bold truncate text-gray-200">
                    {selectedOrgSlug === "ALL"
                      ? "Tất cả Organizer"
                      : organizers.find((o) => o.slug === selectedOrgSlug)
                          ?.name || "Organizer"}
                  </span>
                </div>
                <FaChevronDown
                  className={`text-gray-500 transition-transform ${
                    isOrgDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              <AnimatePresence>
                {isOrgDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-full left-0 mt-2 w-full bg-[#1a1a1a] border border-white/10 rounded-2xl z-50 overflow-hidden shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
                  >
                    <div
                      onClick={() => {
                        setSelectedOrgSlug("ALL");
                        setIsOrgDropdownOpen(false);
                      }}
                      className="px-5 py-3 hover:bg-white/5 cursor-pointer text-sm flex justify-between items-center border-b border-white/5"
                    >
                      <span
                        className={
                          selectedOrgSlug === "ALL"
                            ? "text-[#B5A65F] font-bold"
                            : "text-gray-400"
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
                          setIsOrgDropdownOpen(false);
                        }}
                        className="px-5 py-3 hover:bg-white/5 cursor-pointer text-sm flex justify-between items-center border-b border-white/5 last:border-0"
                      >
                        <span
                          className={`truncate mr-2 ${
                            selectedOrgSlug === org.slug
                              ? "text-[#B5A65F]"
                              : "text-gray-300"
                          }`}
                        >
                          {org.name}
                        </span>
                        {selectedOrgSlug === org.slug && (
                          <FaCheck className="text-[#B5A65F] text-xs shrink-0" />
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {isOrganizer && (
            <div
              className="relative z-40 w-full sm:w-auto"
              ref={eventDropdownRef}
            >
              <div
                onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
                className="cursor-pointer flex items-center justify-between gap-4 w-full sm:min-w-[280px] px-5 py-3 rounded-2xl bg-[#1a1a1a] border border-white/10 hover:border-[#B5A65F]/50 transition-all shadow-lg"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <FaFilter className="text-[#B5A65F] shrink-0" />
                  <span className="text-sm font-bold truncate text-gray-200">
                    {filterEventId === "ALL"
                      ? "Tất cả sự kiện"
                      : myEvents?.find(
                          (e) => String(e.eventId) === filterEventId,
                        )?.eventName || "Chọn sự kiện"}
                  </span>
                </div>
                <FaChevronDown
                  className={`text-gray-500 transition-transform ${
                    isEventDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              <AnimatePresence>
                {isEventDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-full left-0 mt-2 w-full bg-[#1a1a1a] border border-white/10 rounded-2xl z-50 overflow-hidden shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
                  >
                    <div
                      onClick={() => {
                        setFilterEventId("ALL");
                        setIsEventDropdownOpen(false);
                      }}
                      className="px-5 py-3 hover:bg-white/5 cursor-pointer text-sm flex justify-between items-center border-b border-white/5"
                    >
                      <span
                        className={
                          filterEventId === "ALL"
                            ? "text-[#B5A65F] font-bold"
                            : "text-gray-400"
                        }
                      >
                        Tất cả sự kiện
                      </span>
                      {filterEventId === "ALL" && (
                        <FaCheck className="text-[#B5A65F] text-xs" />
                      )}
                    </div>
                    {myEvents?.map((evt) => (
                      <div
                        key={evt.eventId}
                        onClick={() => {
                          setFilterEventId(String(evt.eventId));
                          setIsEventDropdownOpen(false);
                        }}
                        className="px-5 py-3 hover:bg-white/5 cursor-pointer text-sm flex justify-between items-center border-b border-white/5 last:border-0"
                      >
                        <span
                          className={`truncate mr-2 ${
                            filterEventId === String(evt.eventId)
                              ? "text-[#B5A65F]"
                              : "text-gray-300"
                          }`}
                        >
                          {evt.eventName}
                        </span>
                        {filterEventId === String(evt.eventId) && (
                          <FaCheck className="text-[#B5A65F] text-xs shrink-0" />
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: ACTIONS */}
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

          {!isSAdmin && isChecking ? (
            <div className="w-full sm:w-auto px-6 py-3 bg-[#1a1a1a] border border-white/10 text-gray-400 font-bold text-sm rounded-2xl flex justify-center items-center gap-2 cursor-wait">
              <FaSpinner className="animate-spin" /> Check...
            </div>
          ) : !isSAdmin && isRestricted ? (
            <div
              className="w-full sm:w-auto px-6 py-3 bg-red-500/10 text-red-500 font-bold text-sm rounded-2xl border border-red-500/20 flex justify-center items-center gap-2 cursor-not-allowed opacity-80"
              title="Bị khóa"
            >
              <FaLock /> Bị hạn chế
            </div>
          ) : (
            <button
              onClick={openCreateModal}
              className="w-full sm:w-auto px-6 py-3 bg-[#B5A65F] text-black font-bold text-sm rounded-2xl hover:bg-[#c4b56a] flex justify-center items-center gap-2 shadow-lg"
            >
              <FaPlus /> Thêm mới
            </button>
          )}
        </div>
      </div>

      {currentLoading ? (
        <div className="text-center py-24 text-gray-500 italic">
          <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-[#B5A65F]" />{" "}
          Đang tải danh sách...
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center text-gray-500 border border-white/5 border-dashed rounded-3xl bg-[rgba(26,26,26,0.3)] h-80">
          <FaUserTie className="text-6xl opacity-20 mb-4" />
          <p className="text-lg font-medium">Không tìm thấy diễn giả nào.</p>
          <p className="text-sm opacity-60 mt-1">
            {filterEventId !== "ALL"
              ? "Sự kiện này chưa có diễn giả"
              : "Danh sách trống"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 z-0 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {paginatedData.map((item) => {
              const isStarActive = localFeatured.hasOwnProperty(
                item.presenterId,
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
                    {(isSAdmin ||
                      (isOrganizer && !isChecking && !isRestricted)) && (
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

      {/* --- PAGINATION & MODALS (GIỮ NGUYÊN) --- */}
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

      {/* MODALS: View Detail, Create/Edit Form, Confirm Delete */}
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
