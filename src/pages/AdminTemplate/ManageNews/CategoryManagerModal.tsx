import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  FaTimes,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaSpinner,
  FaChevronDown,
  FaChevronRight,
  FaFolder,
  FaFolderOpen,
  FaToggleOn,
  FaToggleOff,
  FaGlobe,
  FaArrowLeft,
  FaLink,
} from "react-icons/fa";

import {
  fetchAdminCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  clearCategoryDetail,
  getCategoryName,
  type CategoryRequestDTO,
} from "../../../store/slices/categorySlice";
import { type AppDispatch, type RootState } from "../../../store";

// ─── Types ────────────────────────────────────────────────────────────────────
type LangCode = "vi" | "en";
type ViewMode = "list" | "create" | "edit";

interface TranslationForm {
  slug: string;
  name: string;
  seoTitle: string;
  seoDescription: string;
}

const emptyTranslation = (): TranslationForm => ({
  slug: "",
  name: "",
  seoTitle: "",
  seoDescription: "",
});

const emptyForm = () => ({
  displayOrder: 0,
  isActive: true,
  parentId: null as number | null,
  translations: { vi: emptyTranslation(), en: emptyTranslation() },
});

interface Props {
  open: boolean;
  onClose: () => void;
}

const CategoryManagerModal: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    adminList: categories,
    categoryDetail,
    saving,
    loading,
  } = useSelector((state: RootState) => state.categories);

  const [view, setView] = useState<ViewMode>("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<LangCode>("vi");

  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    if (open) {
      dispatch(fetchAdminCategories());
      setView("list");
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (view === "edit" && categoryDetail) {
      const t = categoryDetail.translations || {};
      setForm({
        displayOrder: categoryDetail.displayOrder ?? 0,
        isActive: categoryDetail.isActive ?? true,
        parentId: categoryDetail.parent?.id ?? null,
        translations: {
          vi: {
            slug: t.vi?.slug || "",
            name: t.vi?.name || "",
            seoTitle: t.vi?.seoTitle || "",
            seoDescription: t.vi?.seoDescription || "",
          },
          en: {
            slug: t.en?.slug || "",
            name: t.en?.name || "",
            seoTitle: t.en?.seoTitle || "",
            seoDescription: t.en?.seoDescription || "",
          },
        },
      });
    }
  }, [categoryDetail, view]);

  if (!open) return null;

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const rootCategories = categories.filter((c) => !c.parent);
  const getChildren = (parentId: number) =>
    categories.filter((c) => c.parent?.id === parentId);

  const toggleExpand = (id: number) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const openCreate = () => {
    setForm(emptyForm());
    setActiveTab("vi");
    setView("create");
  };

  const openEdit = (id: number) => {
    setEditingId(id);
    setActiveTab("vi");
    dispatch(clearCategoryDetail());
    dispatch(fetchCategoryById(id));
    setView("edit");
  };

  const backToList = () => {
    dispatch(clearCategoryDetail());
    setView("list");
    setEditingId(null);
    dispatch(fetchAdminCategories());
  };

  const handleDelete = async (id: number, name: string) => {
    if (
      !window.confirm(
        `Xóa danh mục "${name}"?\nLưu ý: không thể xóa nếu còn danh mục con hoặc bài viết.`,
      )
    )
      return;
    const result = await dispatch(deleteCategory(id));
    if (deleteCategory.fulfilled.match(result)) {
      toast.success(`Đã xóa danh mục "${name}"`);
      dispatch(fetchAdminCategories());
    } else {
      toast.error((result as any).payload || "Không thể xóa danh mục này");
    }
  };

  const setTranslation = (
    lang: LangCode,
    field: keyof TranslationForm,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: { ...prev.translations[lang], [field]: value },
      },
    }));
  };

  // ─── Auto-generate slug từ name ───────────────────────────────────────────
  const autoSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const handleNameChange = (lang: LangCode, value: string) => {
    setTranslation(lang, "name", value);
    // Chỉ auto-fill slug nếu slug đang trống
    if (!form.translations[lang].slug) {
      setTranslation(lang, "slug", autoSlug(value));
    }
  };

  const handleSubmit = async () => {
    if (!form.translations.vi.name.trim()) {
      toast.error("Tên danh mục tiếng Việt không được để trống");
      return;
    }

    const payload: CategoryRequestDTO = {
      displayOrder: form.displayOrder,
      isActive: form.isActive,
      parentId: form.parentId,
      translations: {
        vi: {
          slug: form.translations.vi.slug.trim() || null,
          name: form.translations.vi.name.trim(),
          seoTitle: form.translations.vi.seoTitle.trim() || null,
          seoDescription: form.translations.vi.seoDescription.trim() || null,
        },
        en: {
          slug: form.translations.en.slug.trim() || null,
          name: form.translations.en.name.trim(),
          seoTitle: form.translations.en.seoTitle.trim() || null,
          seoDescription: form.translations.en.seoDescription.trim() || null,
        },
      },
    };

    let result;
    if (view === "edit" && editingId) {
      result = await dispatch(updateCategory({ id: editingId, data: payload }));
    } else {
      result = await dispatch(createCategory(payload));
    }

    if (
      updateCategory.fulfilled.match(result) ||
      createCategory.fulfilled.match(result)
    ) {
      toast.success(
        view === "edit" ? "Đã cập nhật danh mục!" : "Đã tạo danh mục mới!",
      );
      backToList();
    } else {
      toast.error((result as any).payload || "Có lỗi xảy ra");
    }
  };

  const parentOptions = rootCategories.filter((c) => c.id !== editingId);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-[#111] z-50 flex flex-col shadow-2xl border-l border-gray-800 animate-slide-in-right">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#1a1a1a] shrink-0">
          <div className="flex items-center gap-3">
            {view !== "list" && (
              <button
                onClick={backToList}
                className="text-gray-400 hover:text-[#D8C97B] transition mr-1"
              >
                <FaArrowLeft />
              </button>
            )}
            <FaFolderOpen className="text-[#D8C97B] text-lg" />
            <h2 className="text-white font-bold text-lg">
              {view === "list"
                ? "Quản lý Danh mục"
                : view === "create"
                  ? "Tạo danh mục mới"
                  : "Chỉnh sửa danh mục"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition p-1"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          {/* ════════ LIST VIEW ════════ */}
          {view === "list" && (
            <div className="p-5 space-y-4">
              <button
                onClick={openCreate}
                className="w-full flex items-center justify-center gap-2 bg-[#D8C97B] hover:bg-[#c4b56a] text-black font-bold py-2.5 rounded-lg transition"
              >
                <FaPlus /> Thêm danh mục mới
              </button>

              {loading ? (
                <div className="flex justify-center py-16">
                  <FaSpinner className="animate-spin text-[#D8C97B] text-3xl" />
                </div>
              ) : rootCategories.length === 0 ? (
                <div className="text-center py-16">
                  <FaFolder className="mx-auto text-gray-600 text-5xl mb-3" />
                  <p className="text-gray-500">Chưa có danh mục nào</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {rootCategories.map((root) => {
                    const children = getChildren(root.id);
                    const isExpanded = expandedIds.has(root.id);
                    const nameVi = getCategoryName(root, "vi");
                    const nameEn = getCategoryName(root, "en");
                    const slugVi = root.translations?.vi?.slug;
                    const slugEn = root.translations?.en?.slug;

                    return (
                      <div
                        key={root.id}
                        className="rounded-lg overflow-hidden border border-gray-800"
                      >
                        {/* Root row */}
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#1a1a1a] group">
                          <button
                            onClick={() =>
                              children.length && toggleExpand(root.id)
                            }
                            className={`text-gray-600 transition shrink-0 w-4 ${
                              children.length
                                ? "hover:text-[#D8C97B] cursor-pointer"
                                : "cursor-default"
                            }`}
                          >
                            {children.length > 0 ? (
                              isExpanded ? (
                                <FaChevronDown size={10} />
                              ) : (
                                <FaChevronRight size={10} />
                              )
                            ) : null}
                          </button>

                          <FaFolder
                            className="text-[#D8C97B] shrink-0"
                            size={13}
                          />

                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">
                              {nameVi}
                              {children.length > 0 && (
                                <span className="text-gray-600 text-xs ml-1.5">
                                  ({children.length})
                                </span>
                              )}
                            </p>
                            {/* Slug info */}
                            <div className="flex items-center gap-2 mt-0.5">
                              {slugVi && (
                                <span className="text-gray-600 text-xs font-mono flex items-center gap-1">
                                  <FaLink size={8} />
                                  vi: /{slugVi}
                                </span>
                              )}
                              {slugEn && (
                                <span className="text-gray-600 text-xs font-mono flex items-center gap-1">
                                  en: /{slugEn}
                                </span>
                              )}
                              {nameEn && !slugVi && !slugEn && (
                                <p className="text-gray-500 text-xs truncate">
                                  {nameEn}
                                </p>
                              )}
                            </div>
                          </div>

                          <span
                            className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-bold ${
                              root.isActive
                                ? "bg-green-900/30 text-green-400"
                                : "bg-gray-800 text-gray-500"
                            }`}
                          >
                            {root.isActive ? "Hiện" : "Ẩn"}
                          </span>

                          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={() => openEdit(root.id)}
                              className="text-blue-400 hover:text-blue-300 bg-blue-400/10 p-1.5 rounded-md transition"
                              title="Sửa"
                            >
                              <FaEdit size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(root.id, nameVi)}
                              className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded-md transition"
                              title="Xóa"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Children */}
                        {isExpanded &&
                          children.map((child) => {
                            const childVi = getCategoryName(child, "vi");
                            const childEn = getCategoryName(child, "en");
                            const childSlugVi = child.translations?.vi?.slug;
                            const childSlugEn = child.translations?.en?.slug;
                            return (
                              <div
                                key={child.id}
                                className="flex items-center gap-2 px-3 py-2 bg-[#141414] border-t border-gray-800/50 group pl-9"
                              >
                                <span className="text-gray-700 text-xs shrink-0">
                                  ↳
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-gray-300 text-sm truncate">
                                    {childVi}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {childSlugVi && (
                                      <span className="text-gray-600 text-xs font-mono flex items-center gap-1">
                                        <FaLink size={7} />
                                        vi: /{childSlugVi}
                                      </span>
                                    )}
                                    {childSlugEn && (
                                      <span className="text-gray-600 text-xs font-mono">
                                        en: /{childSlugEn}
                                      </span>
                                    )}
                                    {childEn &&
                                      !childSlugVi &&
                                      !childSlugEn && (
                                        <p className="text-gray-600 text-xs truncate">
                                          {childEn}
                                        </p>
                                      )}
                                  </div>
                                </div>
                                <span
                                  className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-bold ${
                                    child.isActive
                                      ? "bg-green-900/30 text-green-400"
                                      : "bg-gray-800 text-gray-500"
                                  }`}
                                >
                                  {child.isActive ? "Hiện" : "Ẩn"}
                                </span>
                                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                                  <button
                                    onClick={() => openEdit(child.id)}
                                    className="text-blue-400 hover:text-blue-300 bg-blue-400/10 p-1.5 rounded-md transition"
                                  >
                                    <FaEdit size={12} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDelete(child.id, childVi)
                                    }
                                    className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded-md transition"
                                  >
                                    <FaTrash size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════════ CREATE / EDIT FORM ════════ */}
          {(view === "create" || view === "edit") && (
            <div className="p-5 space-y-5">
              {view === "edit" && loading && !categoryDetail ? (
                <div className="flex justify-center py-16">
                  <FaSpinner className="animate-spin text-[#D8C97B] text-3xl" />
                </div>
              ) : (
                <>
                  {/* Language tabs */}
                  <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-gray-800 self-start">
                    {(["vi", "en"] as LangCode[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveTab(lang)}
                        className={`px-5 py-1.5 rounded-md text-sm font-bold flex items-center gap-1.5 transition-all ${
                          activeTab === lang
                            ? "bg-[#D8C97B] text-black"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <FaGlobe size={11} />
                        {lang === "vi" ? "Tiếng Việt" : "English"}
                      </button>
                    ))}
                  </div>

                  {/* Tên danh mục */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wider">
                      Tên danh mục ({activeTab.toUpperCase()})
                      {activeTab === "vi" && (
                        <span className="text-red-400 ml-1">*</span>
                      )}
                    </label>
                    <input
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-[#D8C97B] focus:outline-none transition-colors"
                      value={form.translations[activeTab].name}
                      onChange={(e) =>
                        handleNameChange(activeTab, e.target.value)
                      }
                      placeholder={
                        activeTab === "vi" ? "VD: Công nghệ" : "VD: Technology"
                      }
                    />
                  </div>

                  {/* ── Slug per language ─────────────────────────────────── */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wider flex items-center gap-1.5">
                      <FaLink size={10} className="text-[#D8C97B]" />
                      Slug URL ({activeTab.toUpperCase()})
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm font-mono select-none">
                        /
                      </span>
                      <input
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg pl-6 pr-3 py-2.5 text-gray-300 text-sm focus:border-[#D8C97B] focus:outline-none transition-colors font-mono"
                        value={form.translations[activeTab].slug}
                        onChange={(e) =>
                          setTranslation(
                            activeTab,
                            "slug",
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, "-")
                              .replace(/-+/g, "-"),
                          )
                        }
                        placeholder={
                          activeTab === "vi"
                            ? "vd: cong-nghe"
                            : "vd: technology"
                        }
                      />
                    </div>
                    <p className="text-gray-700 text-xs mt-1">
                      Tự động sinh từ tên nếu để trống. Chỉ dùng chữ thường, số
                      và dấu gạch ngang.
                    </p>
                  </div>

                  {/* SEO */}
                  <div className="space-y-3">
                    <p className="text-[#D8C97B] text-xs font-bold uppercase tracking-wider">
                      SEO ({activeTab.toUpperCase()})
                    </p>
                    <div>
                      <label className="block text-gray-500 text-xs mb-1">
                        SEO Title
                      </label>
                      <input
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-2.5 text-gray-200 text-sm focus:border-[#D8C97B] focus:outline-none transition-colors"
                        value={form.translations[activeTab].seoTitle}
                        onChange={(e) =>
                          setTranslation(activeTab, "seoTitle", e.target.value)
                        }
                        placeholder={
                          activeTab === "vi"
                            ? "VD: Tin tức công nghệ mới nhất"
                            : "VD: Latest tech news"
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs mb-1">
                        SEO Description
                      </label>
                      <textarea
                        rows={2}
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-2.5 text-gray-200 text-sm focus:border-[#D8C97B] focus:outline-none transition-colors resize-none"
                        value={form.translations[activeTab].seoDescription}
                        onChange={(e) =>
                          setTranslation(
                            activeTab,
                            "seoDescription",
                            e.target.value,
                          )
                        }
                        placeholder={
                          activeTab === "vi"
                            ? "VD: Cập nhật tin tức công nghệ hàng ngày"
                            : "VD: Stay updated with daily tech news"
                        }
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-800" />

                  {/* Danh mục cha */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wider flex items-center gap-1.5">
                      <FaFolder className="text-[#D8C97B]" size={11} /> Danh mục
                      cha
                    </label>
                    <select
                      value={form.parentId ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          parentId: e.target.value
                            ? Number(e.target.value)
                            : null,
                        }))
                      }
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-2.5 text-sm text-gray-200 focus:border-[#D8C97B] focus:outline-none transition-colors cursor-pointer"
                    >
                      <option value="">— Không có (danh mục gốc) —</option>
                      {parentOptions.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {getCategoryName(cat, "vi") || `Category #${cat.id}`}
                        </option>
                      ))}
                    </select>
                    <p className="text-gray-700 text-xs mt-1">
                      Tối đa 2 cấp. Chỉ chọn danh mục gốc làm cha.
                    </p>
                  </div>

                  {/* Thứ tự hiển thị */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wider">
                      Thứ tự hiển thị
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-2.5 text-gray-200 text-sm focus:border-[#D8C97B] focus:outline-none transition-colors"
                      value={form.displayOrder}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          displayOrder: Number(e.target.value),
                        }))
                      }
                    />
                  </div>

                  {/* Trạng thái */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-1.5 font-medium uppercase tracking-wider">
                      Trạng thái
                    </label>
                    <button
                      onClick={() =>
                        setForm((p) => ({ ...p, isActive: !p.isActive }))
                      }
                      className={`flex items-center gap-3 w-full p-3 rounded-lg border transition-all ${
                        form.isActive
                          ? "border-green-700 bg-green-900/20 text-green-400"
                          : "border-gray-700 bg-[#1a1a1a] text-gray-500"
                      }`}
                    >
                      {form.isActive ? (
                        <FaToggleOn size={20} />
                      ) : (
                        <FaToggleOff size={20} />
                      )}
                      <span className="text-sm font-bold">
                        {form.isActive ? "Đang hiển thị" : "Đang ẩn"}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {view !== "list" &&
          !(view === "edit" && loading && !categoryDetail) && (
            <div className="px-5 py-4 border-t border-gray-800 bg-[#1a1a1a] shrink-0 flex gap-3">
              <button
                onClick={backToList}
                className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 text-sm font-bold transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-[#D8C97B] hover:bg-[#c4b56a] disabled:opacity-50 text-black font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                {saving
                  ? "Đang lưu..."
                  : view === "edit"
                    ? "Lưu thay đổi"
                    : "Tạo danh mục"}
              </button>
            </div>
          )}
      </div>
    </>
  );
};

export default CategoryManagerModal;
