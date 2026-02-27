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
} from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

import { fetchPosts, deletePost } from "../../../store/slices/newsSlice";
import { type AppDispatch, type RootState } from "@/store";

const ManageNews: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector((state: RootState) => state.news);
  const [isExporting, setIsExporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Gọi list mặc định bằng tiếng Việt
    dispatch(fetchPosts({ page: 0, size: 100, lang: "vi" }));
  }, [dispatch]);

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      dispatch(deletePost(id));
    }
  };

  // 1. TẠO MẢNG SAFE DATA: Lọc bỏ toàn bộ các phần tử null/undefined gây lỗi
  const safeData = data ? data.filter((item: any) => item != null) : [];

  const handleExportExcel = () => {
    if (!safeData || safeData.length === 0) {
      toast.warn("Không có dữ liệu bài viết để xuất!");
      return;
    }

    setIsExporting(true);
    try {
      const dataToExport = safeData.map((post: any) => {
        // Fallback song ngữ an toàn
        const viTitle =
          post.translations?.vi?.title || post.title || "Không có tiêu đề";
        const viSummary = post.translations?.vi?.summary || post.summary || "";
        const viContent = post.translations?.vi?.content || post.content;

        return {
          "ID Bài viết": post.id,
          "Tiêu đề": viTitle,
          "Tóm tắt": viSummary,
          "Nội dung": viContent ? viContent.substring(0, 100) + "..." : "",
          "Ngày tạo": post.createdAt
            ? new Date(post.createdAt).toLocaleDateString("vi-VN")
            : "N/A",
          "Người tạo": post.authorName || "Admin",
          "Hình ảnh (URL)": post.thumbnailUrl || "N/A",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);

      const wscols = [
        { wch: 10 },
        { wch: 40 },
        { wch: 40 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 30 },
      ];
      worksheet["!cols"] = wscols;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách Tin tức");

      const fileName = `Danh_sach_tin_tuc_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      XLSX.writeFile(workbook, fileName);

      toast.success("Xuất file Excel thành công!");
    } catch (error) {
      console.error("Lỗi xuất file:", error);
      toast.error("Có lỗi xảy ra khi xuất file.");
    } finally {
      setIsExporting(false);
    }
  };

  // 2. TÍNH TOÁN DỮ LIỆU PHÂN TRANG DỰA TRÊN SAFE DATA
  const totalPages = Math.max(1, Math.ceil(safeData.length / itemsPerPage));
  const currentData = safeData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="flex flex-col xl:flex-row justify-between items-center mb-8 gap-4">
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
            )}{" "}
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

      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-800 overflow-hidden pb-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-[#B5A65F] text-4xl" />
          </div>
        ) : safeData.length > 0 ? (
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
                    // Chốt bảo vệ lớp 2: Tránh trường hợp lọt lưới
                    if (!post) return null;

                    // Lấy tiêu đề và tóm tắt an toàn (ưu tiên bản dịch tiếng việt)
                    const displayTitle =
                      post.translations?.vi?.title ||
                      post.title ||
                      "Không có tiêu đề";
                    const displaySummary =
                      post.translations?.vi?.summary || post.summary || "";

                    return (
                      <tr
                        key={post.id}
                        className="hover:bg-[#252525] transition duration-200 group"
                      >
                        <td className="p-4 text-gray-400">#{post.id}</td>
                        <td className="p-4">
                          <div className="w-20 h-14 overflow-hidden rounded-md border border-gray-700">
                            <img
                              src={
                                post.thumbnailUrl || "https://placehold.co/150"
                              }
                              alt="Thumbnail"
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                            />
                          </div>
                        </td>
                        <td
                          className="p-4 font-semibold text-white max-w-[200px] truncate"
                          title={displayTitle}
                        >
                          {displayTitle}
                        </td>
                        <td
                          className="p-4 text-gray-400 max-w-[250px] truncate"
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
                          <div className="flex justify-center gap-4">
                            <Link
                              to={`/admin/news/${post.id}/edit`}
                              className="text-blue-400 hover:text-blue-300 bg-blue-400/10 p-2 rounded-full transition"
                              title="Chỉnh sửa"
                            >
                              <FaEdit size={18} />
                            </Link>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="text-red-500 hover:text-red-400 bg-red-500/10 p-2 rounded-full transition"
                              title="Xóa"
                            >
                              <FaTrash size={18} />
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
            <p className="text-gray-400 text-lg">Chưa có bài viết nào.</p>
            <Link
              to="/admin/news/create"
              className="text-[#B5A65F] hover:underline mt-2 inline-block"
            >
              Tạo bài viết đầu tiên ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageNews;
