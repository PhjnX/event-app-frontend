import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaBuilding, FaUserTie } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../../store";
import { registerOrganizer } from "../../../../../store/slices/organizerSlice";
import { toast } from "react-toastify";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterOrganizerModal({ isOpen, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.organizers);

  const [type, setType] = useState<"PERSONAL" | "BUSINESS">("PERSONAL");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contactPhoneNumber: "",
    contactEmail: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resultAction = await dispatch(
      registerOrganizer({
        ...formData,
        description: `[${type}] ${formData.description}`,
      })
    );

    if (registerOrganizer.fulfilled.match(resultAction)) {
      toast.success("Gửi đơn đăng ký thành công! Vui lòng chờ Admin duyệt."); 
      onClose();
      setFormData({
        name: "",
        description: "",
        contactPhoneNumber: "",
        contactEmail: "",
      });
    } else {
      const errorMsg =
        (resultAction.payload as string) ||
        "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
      toast.error(errorMsg);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#121212] border border-[#D8C97B]/30 rounded-3xl p-8 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <FaTimes size={20} />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white uppercase mb-2">
                Đăng ký Đối Tác
              </h2>

              <div className="flex justify-center gap-4 mb-4">
                <button
                  type="button" 
                  onClick={() => setType("PERSONAL")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                    type === "PERSONAL"
                      ? "bg-[#D8C97B] text-black"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  <FaUserTie /> Cá Nhân
                </button>
                <button
                  type="button"
                  onClick={() => setType("BUSINESS")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                    type === "BUSINESS"
                      ? "bg-[#D8C97B] text-black"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  <FaBuilding /> Doanh Nghiệp
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-[#D8C97B] font-bold uppercase block mb-1">
                  {type === "PERSONAL"
                    ? "Tên Cá Nhân / Nghệ Danh"
                    : "Tên Doanh Nghiệp / Tổ Chức"}
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D8C97B] outline-none"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={
                    type === "PERSONAL"
                      ? "VD: Nguyễn Văn A"
                      : "VD: Công ty TNHH ABC"
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase block mb-1">
                    Email Liên Hệ
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D8C97B] outline-none"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase block mb-1">
                    SĐT Liên Hệ
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D8C97B] outline-none"
                    value={formData.contactPhoneNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactPhoneNumber: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold uppercase block mb-1">
                  Mô tả / Giới thiệu
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D8C97B] outline-none resize-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={
                    type === "PERSONAL"
                      ? "Giới thiệu kinh nghiệm tổ chức..."
                      : "Lĩnh vực hoạt động, quy mô..."
                  }
                />
              </div>

              <button
                disabled={isLoading}
                type="submit"
                className="w-full py-3.5 mt-2 bg-[#D8C97B] text-black font-bold uppercase rounded-xl hover:bg-[#b5a65f] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? "Đang xử lý..." : "Gửi Đơn Đăng Ký"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
