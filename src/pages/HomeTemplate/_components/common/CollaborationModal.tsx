import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "@/services/apiService"; 
interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CollaborationModal = ({ isOpen, onClose }: CollaborationModalProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceType: "",
    message: "",
    agreed: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, agreed: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreed) {
      toast.warning("Vui lòng đồng ý với điều khoản dịch vụ.");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post("/contacts", {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        subject: formData.serviceType || "Liên hệ hợp tác",
        message: formData.message,
      });

      setIsSuccess(true);
      toast.success("Gửi yêu cầu thành công!");

      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          serviceType: "",
          message: "",
          agreed: false,
        });
        onClose();
      }, 3000);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-4 overflow-y-auto">
          {/* Nút đóng */}
          <button
            onClick={onClose}
            className="fixed top-6 right-6 z-1000 text-zinc-500 hover:text-white transition-colors p-3 bg-black/50 hover:bg-zinc-800 rounded-full border border-white/10"
          >
            <FaTimes size={24} />
          </button>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
            className="w-full max-w-[1400px] bg-[#09090b] md:rounded-4xl overflow-hidden shadow-2xl border border-white/5 relative min-h-screen md:min-h-[85vh] flex"
          >
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 relative z-10">
              <div className="p-8 md:p-16 lg:p-20 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/5 bg-[#09090b] relative">
                {isSuccess ? (
                  <div className="text-center py-20">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <FaCheckCircle size={48} />
                    </motion.div>
                    <h3 className="text-3xl font-bold text-white mb-2">
                      Đã gửi thành công!
                    </h3>
                    <p className="text-zinc-400">
                      Cảm ơn bạn đã liên hệ. Webie sẽ phản hồi sớm nhất.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-8 w-full max-w-lg mx-auto"
                  >
                    <div>
                      <h2 className="text-4xl md:text-5xl font-black text-white mb-3 uppercase tracking-tight">
                        Hợp tác cùng <br />{" "}
                        <span className="text-[#B5A65F]">Webie</span>
                      </h2>
                      <p className="text-zinc-500 text-lg">
                        Điền thông tin để bắt đầu hành trình mới.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="group">
                        <label className="text-xs font-bold text-[#B5A65F] uppercase mb-1 block">
                          Tên của bạn là gì?
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          className="w-full bg-transparent border-b border-zinc-700 py-3 text-lg text-white placeholder-zinc-700 focus:border-[#B5A65F] focus:outline-none transition-colors"
                          placeholder="Nhập họ tên..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                          <label className="text-xs font-bold text-[#B5A65F] uppercase mb-1 block">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-transparent border-b border-zinc-700 py-3 text-lg text-white placeholder-zinc-700 focus:border-[#B5A65F] focus:outline-none transition-colors"
                            placeholder="example@webie.com"
                          />
                        </div>
                        <div className="group">
                          <label className="text-xs font-bold text-[#B5A65F] uppercase mb-1 block">
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-zinc-700 py-3 text-lg text-white placeholder-zinc-700 focus:border-[#B5A65F] focus:outline-none transition-colors"
                            placeholder="+84..."
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="text-xs font-bold text-[#B5A65F] uppercase mb-1 block">
                          Vấn đề quan tâm
                        </label>
                        <select
                          name="serviceType"
                          value={formData.serviceType}
                          onChange={handleChange}
                          className="w-full bg-transparent border-b border-zinc-700 py-3 text-lg text-zinc-300 focus:text-white focus:border-[#B5A65F] focus:outline-none transition-colors appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-[#18181b]">
                            Chúng tôi có thể giúp gì cho bạn?
                          </option>
                          <option
                            value="Event Organizer"
                            className="bg-[#18181b]"
                          >
                            Đăng ký làm Ban Tổ Chức
                          </option>
                          <option value="Sponsorship" className="bg-[#18181b]">
                            Tài trợ sự kiện
                          </option>
                          <option
                            value="Media Partner"
                            className="bg-[#18181b]"
                          >
                            Đối tác truyền thông
                          </option>
                          <option value="Other" className="bg-[#18181b]">
                            Khác
                          </option>
                        </select>
                      </div>

                      <div className="group">
                        <label className="text-xs font-bold text-[#B5A65F] uppercase mb-1 block">
                          Lời nhắn
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={2}
                          className="w-full bg-transparent border-b border-zinc-700 py-3 text-lg text-white placeholder-zinc-700 focus:border-[#B5A65F] focus:outline-none transition-colors resize-none"
                          placeholder="Chia sẻ thêm về dự án của bạn..."
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <label className="flex items-start gap-3 cursor-pointer group select-none">
                        <div className="relative flex items-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={formData.agreed}
                            onChange={handleCheckbox}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-zinc-600 checked:border-[#B5A65F] checked:bg-[#B5A65F] transition-all"
                          />
                          <FaCheckCircle className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 text-xs" />
                        </div>
                        <span className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">
                          Tôi đồng ý với Điều khoản dịch vụ và Chính sách quyền
                          riêng tư.
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-8 py-4 bg-[#B5A65F] hover:bg-[#d4c57e] text-black font-black uppercase tracking-[0.15em] text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(181,166,95,0.3)] hover:shadow-[0_0_30px_rgba(181,166,95,0.5)]"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <FaSpinner className="animate-spin" /> Đang gửi...
                          </span>
                        ) : (
                          "Gửi tin nhắn"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* --- CỘT PHẢI: INFO --- */}
              <div className="bg-[#0c0c0e] p-8 md:p-16 lg:p-20 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] bg-[#B5A65F]/5 rounded-full blur-[150px] pointer-events-none" />

                <div className="relative z-10 space-y-12 lg:space-y-20">
                  <div>
                    <h3 className="text-4xl md:text-5xl font-serif text-white mb-6">
                      Gọi cho <br /> chúng tôi
                    </h3>
                    <p className="text-[#B5A65F] text-2xl md:text-3xl font-mono tracking-tighter hover:tracking-wide transition-all cursor-pointer w-fit">
                      +84 969 838 467
                    </p>
                  </div>

                  <div>
                    <h3 className="text-4xl md:text-5xl font-serif text-white mb-6">
                      Liên hệ qua <br /> biểu mẫu
                    </h3>
                    <p className="text-zinc-400 text-lg">
                      hoặc gửi email trực tiếp tới <br />
                      <a
                        href="mailto:Huyen.dang@webie.com.vn"
                        className="text-white border-b border-[#B5A65F] hover:text-[#B5A65F] hover:border-transparent transition-all pb-1 inline-block mt-2"
                      >
                        Huyen.dang@webie.com.vn
                      </a>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-4xl md:text-5xl font-serif text-white mb-6">
                      Địa chỉ của <br /> chúng tôi:
                    </h3>
                    <p className="text-zinc-400 text-lg leading-relaxed">
                      Số 53, đường 57, An Phú <br />
                      TP Thủ Đức, TP.HCM
                    </p>
                  </div>

                  {/* Social Icons giả lập */}
                  <div className="flex gap-4 pt-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:text-[#B5A65F] hover:border-[#B5A65F] cursor-pointer transition-all"
                      >
                        ➔
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CollaborationModal;
