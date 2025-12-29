import { FaPaperPlane } from "react-icons/fa";

export default function CTANewsletter() {
  return (
    <div className="container mx-auto px-4 mb-20">
      <section className="relative rounded-[2.5rem] overflow-hidden p-10 md:p-20 text-center border border-[#B5A65F]/20 shadow-[0_0_80px_-20px_rgba(181,166,95,0.15)] group">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#050505] z-0"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#B5A65F] opacity-10 rounded-full blur-[100px] group-hover:opacity-20 transition-opacity duration-700"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500 opacity-5 rounded-full blur-[100px]"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-[#B5A65F]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#B5A65F]/20">
            <FaPaperPlane className="text-2xl text-[#B5A65F] -translate-x-0.5 translate-y-0.5" />
          </div>

          <h2 className="text-3xl md:text-5xl font-black uppercase text-white mb-4 tracking-tight">
            Đăng ký nhận tin tức
          </h2>
          <p className="text-gray-400 text-base md:text-lg mb-10 font-light">
            Nhận thông báo sớm nhất về các sự kiện công nghệ, mã giảm giá vé và
            cập nhật diễn giả hàng tuần. Không spam.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col md:flex-row gap-4 justify-center items-center"
          >
            <div className="relative w-full md:w-96">
              <input
                type="email"
                required
                placeholder="Nhập email của bạn..."
                className="w-full px-6 py-4 rounded-full bg-white/5 border border-white/10 text-white focus:border-[#B5A65F] focus:bg-black/50 outline-none transition-all placeholder-gray-600 backdrop-blur-sm"
              />
            </div>
            <button className="px-10 py-4 bg-[#B5A65F] text-black font-bold uppercase tracking-widest rounded-full hover:bg-white hover:scale-105 transition-all shadow-lg whitespace-nowrap">
              Subscribe
            </button>
          </form>

          <p className="text-gray-600 text-xs mt-6">
            Bằng việc đăng ký, bạn đồng ý với chính sách bảo mật của chúng tôi.
          </p>
        </div>
      </section>
    </div>
  );
}
