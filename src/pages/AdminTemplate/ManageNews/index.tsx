import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaNewspaper,
  FaSpinner,
} from "react-icons/fa";
import { fetchPosts, deletePost } from "../../../store/slices/newsSlice";
import { type AppDispatch, type RootState } from "@/store";

const ManageNews: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector((state: RootState) => state.news);

  useEffect(() => {
    dispatch(fetchPosts({ page: 0, size: 100 }));
  }, [dispatch]);

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      dispatch(deletePost(id));
    }
  };

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#B5A65F] flex items-center gap-3">
            <FaNewspaper /> Quản lý Tin tức
          </h2>
          <p className="text-gray-400 mt-1">
            Danh sách các bài viết và sự kiện mới nhất
          </p>
        </div>

        <Link
          to="/admin/news/create"
          className="bg-[#B5A65F] hover:bg-[#B5A65F] text-black font-bold px-6 py-2.5 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center gap-2"
        >
          <FaPlus /> Thêm bài viết
        </Link>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-[#B5A65F] text-4xl" />
          </div>
        ) : data && data.length > 0 ? (
          <div className="overflow-x-auto">
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
                {data.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-[#252525] transition duration-200 group"
                  >
                    <td className="p-4 text-gray-400">#{post.id}</td>
                    <td className="p-4">
                      <div className="w-20 h-14 overflow-hidden rounded-md border border-gray-700">
                        <img
                          src={
                            post.thumbnailUrl ||
                            "https://via.placeholder.com/150"
                          }
                          alt="Thumbnail"
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                      </div>
                    </td>
                    <td
                      className="p-4 font-semibold text-white max-w-[200px] truncate"
                      title={post.title}
                    >
                      {post.title}
                    </td>
                    <td
                      className="p-4 text-gray-400 max-w-[250px] truncate"
                      title={post.summary}
                    >
                      {post.summary}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString("vi-VN")
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
                ))}
              </tbody>
            </table>
          </div>
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
