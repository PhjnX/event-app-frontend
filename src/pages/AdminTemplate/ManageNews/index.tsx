import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaNewspaper,
  FaSpinner,
  FaFileExcel,
  FaChevronLeft,
  FaChevronRight,
  FaFolder,
  FaStar,
} from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

import {
  fetchPosts,
  deletePost,
  addPostToFeatured,
  removePostFromFeatured,
} from "../../../store/slices/newsSlice";
import {
  fetchAdminCategories,
  getCategoryName,
} from "../../../store/slices/categorySlice";
import { type AppDispatch, type RootState } from "@/store";
import CategoryManagerModal from "./CategoryManagerModal";

// ─── Kiểm tra URL có phải là Video không ──────────────────────────────────────
const checkIsVideo = (url?: string | null) => {
  if (!url) return false;
  const path = url.split("?")[0].toLowerCase();
  return /\.(mp4|webm|ogg|mov)$/i.test(path);
};

const ManageNews: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, featuredLoading } = useSelector(
    (state: RootState) => state.news,
  );

  const { adminList: categories } = useSelector(
    (state: RootState) => state.categories,
  );

  const [isExporting, setIsExporting] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = () => {
    dispatch(fetchPosts({ page: 0, size: 100, lang: "vi" }));
    dispatch(fetchAdminCategories());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleCloseModal = () => {
    setCategoryModalOpen(false);
    loadData();
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      dispatch(deletePost(id));
    }
  };

  // ─── Toggle featured ──────────────────────────────────────────────────────
  const handleToggleFeatured = (post: any) => {
    if (post.isFeatured) {
      dispatch(removePostFromFeatured(post.id));
    } else {
      dispatch(addPostToFeatured(post.id));
    }
  };

  const safeData = data ? data.filter((item: any) => item != null) : [];

  const getPostCategoryName = (post: any): string => {
    if (post.categoryName && post.categoryName !== "null")
      return post.categoryName;
    if (post.categoryId) {
      const cat = categories.find((c) => c.id === Number(post.categoryId));
      if (cat) return getCategoryName(cat, "vi");
    }
    return "Chưa phân loại";
  };

  const filteredData =
    selectedCategoryId !== null
      ? safeData.filter((post: any) => {
          const postCatId = Number(post.categoryId);
          if (postCatId === selectedCategoryId) return true;
          const childIds = categories
            .filter((c) => c.parent?.id === selectedCategoryId)
            .map((c) => c.id);
          return childIds.includes(postCatId);
        })
      : safeData;

  const handleSelectCategory = (id: number | null) => {
    setSelectedCategoryId(id);
    setCurrentPage(1);
  };

  const handleExportExcel = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.warn("Không có dữ liệu bài viết để xuất!");
      return;
    }
    setIsExporting(true);
    try {
      const dataToExport = filteredData.map((post: any) => ({
        "ID Bài viết": post.id,
        "Danh mục": getPostCategoryName(post),
        "Tiêu đề": post.translations?.vi?.title || post.title || "",
        "Tóm tắt": post.translations?.vi?.summary || post.summary || "",
        "Nội dung":
          (post.translations?.vi?.content || post.content || "").substring(
            0,
            100,
          ) + "...",
        "Ngày tạo": post.createdAt
          ? new Date(post.createdAt).toLocaleDateString("vi-VN")
          : "N/A",
        "Người tạo": post.authorName || "Admin",
        "Hình ảnh (URL)": post.thumbnailUrl || "N/A",
        "Nổi bật": post.isFeatured ? "Có" : "Không",
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      worksheet["!cols"] = [
        { wch: 10 },
        { wch: 20 },
        { wch: 40 },
        { wch: 40 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 30 },
        { wch: 10 },
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách Tin tức");
      XLSX.writeFile(
        workbook,
        `Danh_sach_tin_tuc_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      toast.success("Xuất file Excel thành công!");
    } catch (error) {
      console.error("Lỗi xuất file:", error);
      toast.error("Có lỗi xảy ra khi xuất file.");
    } finally {
      setIsExporting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const rootCategories = categories.filter((c) => !c.parent);

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#B5A65F] flex items-center gap-3">
            <FaNewspaper /> Quản lý Tin tức
          </h2>
          <p className="text-gray-400 mt-1">
            Danh sách các bài viết và sự kiện mới nhất
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#B5A65F]/30 bg-[#B5A65F]/10 text-[#B5A65F] hover:bg-[#B5A65F]/20 transition-all font-bold text-sm whitespace-nowrap shadow"
          >
            <FaFolder /> Quản lý danh mục
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border transition-all font-bold text-sm whitespace-nowrap shadow-lg ${
              isExporting
                ? "bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed"
                : "bg-green-600/20 text-green-500 border-green-600/30 hover:bg-green-600 hover:text-white"
            }`}
          >
            {isExporting ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaFileExcel />
            )}
            {isExporting ? "Đang xuất..." : "Xuất Excel"}
          </button>
          <Link
            to="/admin/news/create"
            className="bg-[#B5A65F] hover:bg-[#c9ba6e] text-black font-bold px-6 py-2.5 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center gap-2"
          >
            <FaPlus /> Thêm bài viết
          </Link>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <FaFolder className="text-[#B5A65F] shrink-0" />
          <button
            onClick={() => handleSelectCategory(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${
              selectedCategoryId === null
                ? "bg-[#B5A65F] text-black border-[#B5A65F] shadow"
                : "border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
            }`}
          >
            Tất cả
            <span className="ml-1.5 text-xs opacity-70">
              ({safeData.length})
            </span>
          </button>

          {rootCategories.map((cat) => {
            const name = getCategoryName(cat, "vi") || `#${cat.id}`;
            const childIds = categories
              .filter((c) => c.parent?.id === cat.id)
              .map((c) => c.id);
            const totalCount = safeData.filter(
              (p: any) =>
                Number(p.categoryId) === cat.id ||
                childIds.includes(Number(p.categoryId)),
            ).length;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${
                  selectedCategoryId === cat.id
                    ? "bg-[#B5A65F] text-black border-[#B5A65F] shadow"
                    : "border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
                }`}
              >
                {name}
                <span className="ml-1.5 text-xs opacity-70">
                  ({totalCount})
                </span>
              </button>
            );
          })}

          {selectedCategoryId !== null &&
            (() => {
              const children = categories.filter(
                (c) => c.parent?.id === selectedCategoryId,
              );
              if (!children.length) return null;
              return (
                <>
                  <span className="text-gray-600 text-xs">↳</span>
                  {children.map((child) => {
                    const childName =
                      getCategoryName(child, "vi") || `#${child.id}`;
                    const childCount = safeData.filter(
                      (p: any) => Number(p.categoryId) === child.id,
                    ).length;
                    return (
                      <button
                        key={child.id}
                        onClick={() => handleSelectCategory(child.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                          selectedCategoryId === child.id
                            ? "bg-[#B5A65F]/80 text-black border-[#B5A65F]"
                            : "border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-600"
                        }`}
                      >
                        {childName} ({childCount})
                      </button>
                    );
                  })}
                </>
              );
            })()}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-800 overflow-hidden pb-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-[#B5A65F] text-4xl" />
          </div>
        ) : filteredData.length > 0 ? (
          <>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#2a2a2a] text-[#B5A65F] border-b border-gray-700">
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">
                      ID
                    </th>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">
                      Hình ảnh
                    </th>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">
                      Tóm tắt
                    </th>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider text-center">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {currentData.map((post: any) => {
                    if (!post) return null;
                    const displayTitle =
                      post.translations?.vi?.title ||
                      post.title ||
                      "Không có tiêu đề";
                    const displaySummary =
                      post.translations?.vi?.summary || post.summary || "";
                    const catName = getPostCategoryName(post);
                    const isVideo = checkIsVideo(post.thumbnailUrl);
                    const isFeaturedLoading = featuredLoading?.[post.id];

                    return (
                      <tr
                        key={post.id}
                        className={`hover:bg-[#252525] transition duration-200 group ${
                          post.isFeatured
                            ? "border-l-2 border-yellow-500/60"
                            : ""
                        }`}
                      >
                        <td className="p-4 text-gray-400">#{post.id}</td>
                        <td className="p-4">
                          <div className="w-20 h-14 overflow-hidden rounded-md border border-gray-700 relative">
                            {isVideo ? (
                              <video
                                src={post.thumbnailUrl}
                                muted
                                loop
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={
                                  post.thumbnailUrl ||
                                  "https://placehold.co/150"
                                }
                                alt="Thumbnail"
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                              />
                            )}
                            {/* Badge nổi bật */}
                            {post.isFeatured && (
                              <div className="absolute top-0.5 left-0.5 bg-yellow-500 rounded-sm px-1 py-0.5">
                                <FaStar size={7} className="text-black" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td
                          className="p-4 font-semibold text-white max-w-[180px] truncate"
                          title={displayTitle}
                        >
                          {displayTitle}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${
                              catName === "Chưa phân loại"
                                ? "bg-gray-800 text-gray-500 border-gray-700"
                                : "bg-[#B5A65F]/10 text-[#B5A65F] border-[#B5A65F]/20"
                            }`}
                          >
                            <FaFolder size={9} />
                            {catName}
                          </span>
                        </td>
                        <td
                          className="p-4 text-gray-400 max-w-[220px] truncate"
                          title={displaySummary}
                        >
                          {displaySummary}
                        </td>
                        <td className="p-4 text-gray-400 text-sm">
                          {post.createdAt
                            ? new Date(post.createdAt).toLocaleDateString(
                                "vi-VN",
                              )
                            : "N/A"}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            {/* ⭐ Featured toggle */}
                            <button
                              onClick={() => handleToggleFeatured(post)}
                              disabled={isFeaturedLoading}
                              title={
                                post.isFeatured
                                  ? "Gỡ khỏi Hero Banner"
                                  : "Đưa lên Hero Banner"
                              }
                              className={`p-2 rounded-full transition flex items-center justify-center ${
                                isFeaturedLoading
                                  ? "opacity-50 cursor-not-allowed bg-gray-700"
                                  : post.isFeatured
                                    ? "text-yellow-400 bg-yellow-400/15 hover:bg-yellow-400/30"
                                    : "text-gray-500 bg-gray-700/30 hover:text-yellow-400 hover:bg-yellow-400/10"
                              }`}
                            >
                              {isFeaturedLoading ? (
                                <FaSpinner size={14} className="animate-spin" />
                              ) : (
                                <FaStar size={14} />
                              )}
                            </button>

                            <Link
                              to={`/admin/news/${post.id}/edit`}
                              className="text-blue-400 hover:text-blue-300 bg-blue-400/10 p-2 rounded-full transition"
                              title="Chỉnh sửa"
                            >
                              <FaEdit size={14} />
                            </Link>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="text-red-500 hover:text-red-400 bg-red-500/10 p-2 rounded-full transition"
                              title="Xóa"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1a1a1a] text-white disabled:opacity-30 transition-all border border-white/5 hover:border-[#B5A65F]"
                >
                  <FaChevronLeft size={12} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-all flex justify-center items-center ${
                        currentPage === page
                          ? "bg-[#B5A65F] text-black shadow-lg shadow-[#B5A65F]/20"
                          : "bg-[#1a1a1a] text-gray-400 hover:text-white border border-white/5 hover:border-[#B5A65F]/50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#1a1a1a] text-white disabled:opacity-30 transition-all border border-white/5 hover:border-[#B5A65F]"
                >
                  <FaChevronRight size={12} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <FaNewspaper className="mx-auto text-gray-600 text-6xl mb-4" />
            <p className="text-gray-400 text-lg">
              {selectedCategoryId !== null
                ? "Chưa có bài viết nào trong danh mục này."
                : "Chưa có bài viết nào."}
            </p>
            <Link
              to="/admin/news/create"
              className="text-[#B5A65F] hover:underline mt-2 inline-block"
            >
              Tạo bài viết đầu tiên ngay
            </Link>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
        <FaStar className="text-yellow-400" size={11} />
        <span>= Bài viết đang hiển thị trên Hero Banner (nổi bật)</span>
      </div>

      <CategoryManagerModal
        open={categoryModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ManageNews;
