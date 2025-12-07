import { useState, useEffect, useCallback } from "react";
import { FaChevronLeft, FaChevronRight, FaArrowRight } from "react-icons/fa";

// --- DỮ LIỆU SLIDE ---
const SLIDES = [
  {
    id: 1,
    // Slide 1: Khám phá sự kiện (Giữ nguyên)
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2000&auto=format&fit=crop",
    title: "DISCOVER & JOIN",
    highlight: "CAMPUS EVENTS.",
    subtitle:
      "Cập nhật nhanh chóng các hoạt động mới nhất tại trường và đăng ký tham gia chỉ trong vài giây. Không bao giờ bỏ lỡ khoảnh khắc nào.",
    btnPrimary: "KHÁM PHÁ NGAY",
    btnSecondary: "ĐĂNG KÝ",
  },
  {
    id: 2,
    // Slide 2: Quản lý sự kiện (Giữ nguyên)
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop",
    title: "STREAMLINE",
    highlight: "EVENT MANAGEMENT.",
    subtitle:
      "Tự động hóa quy trình từ khâu tạo sự kiện đến check-in. Tạm biệt bảng tính thủ công và quản lý dữ liệu hiệu quả.",
    btnPrimary: "TÌM HIỂU THÊM",
    btnSecondary: "LIÊN HỆ",
  },
  {
    id: 3,
    // --- SLIDE 3 MỚI: TẬP TRUNG VÀO TRẢI NGHIỆM & CỘNG ĐỒNG ---
    // Ảnh mới: Một buổi hòa nhạc/sự kiện đông vui (thể hiện không khí sinh viên)
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2000&auto=format&fit=crop",
    title: "ELEVATE STUDENT",
    highlight: "LIFE EXPERIENCE.", // Nâng tầm trải nghiệm sống sinh viên
    subtitle:
      "Tận hưởng trọn vẹn đời sống sinh viên. Tham gia các câu lạc bộ, hội thảo kỹ năng và các hoạt động giải trí sôi động ngay tại trường.",
    btnPrimary: "XEM HOẠT ĐỘNG",
    btnSecondary: "VỀ CHÚNG TÔI",
  },
];

export default function CarouselHero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- LOGIC CHUYỂN SLIDE ---
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === SLIDES.length - 1 ? 0 : prevIndex + 1
    );
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? SLIDES.length - 1 : prevIndex - 1
    );
  };

  // --- AUTO PLAY ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [nextSlide, currentIndex]);

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black text-white font-sans group">
      {/* --- BACKGROUND SLIDES --- */}
      {SLIDES.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Hiệu ứng Ken Burns (Zoom chậm) */}
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover transform transition-transform duration-6000 ease-linear ${
                isActive ? "scale-110" : "scale-100"
              }`}
            />
            {/* Lớp phủ Gradient đen để nổi bật chữ */}
            <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black/80" />
          </div>
        );
      })}
      {/* --- CONTENT --- */}
      <div className="relative z-20 container mx-auto px-4 text-center max-w-[1000px]">
        {SLIDES.map((slide, index) => {
          if (index !== currentIndex) return null;

          return (
            <div
              key={slide.id}
              className="flex flex-col items-center animate-fade-in-up"
            >
              {/* Tiêu đề */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight drop-shadow-2xl uppercase tracking-tight">
                {slide.title} {/* Màu vàng cát #B5A65F theo yêu cầu */}
                <span className="text-[#B5A65F]">{slide.highlight}</span>
              </h1>

              {/* Mô tả */}
              <p className="text-base md:text-xl mb-10 text-gray-200 leading-relaxed max-w-3xl drop-shadow-md mx-auto font-light">
                {slide.subtitle}
              </p>

              {/* Nút bấm */}
              <div className="flex flex-wrap justify-center gap-5 mt-2">
                {/* BUTTON 1 (Primary - Màu đen) */}
                <a
                  href="#"
                  className="group/btn relative inline-flex items-center gap-3 px-8 py-3.5 bg-black text-white font-bold text-sm uppercase tracking-wider rounded-full border border-white/30 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  {/* Hiệu ứng bóng loáng */}
                  <div className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-25 z-10 animate-shine-infinite group-hover/btn:animate-shine-fast" />
                  <span className="relative z-20 flex items-center gap-2">
                    {slide.btnPrimary} <FaArrowRight />
                  </span>
                </a>

                {/* BUTTON 2 (Secondary - Trong suốt) */}
                <a
                  href="#"
                  className="group/btn relative inline-flex items-center gap-3 px-8 py-3.5 bg-white/10 backdrop-blur-md text-white font-bold text-sm uppercase tracking-wider rounded-full border border-white/30 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 hover:border-white/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <span className="relative z-20 flex items-center gap-2">
                    {slide.btnSecondary}
                  </span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
      {/* --- NÚT ĐIỀU HƯỚNG --- */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-sm hidden md:flex items-center justify-center hover:scale-110 group"
      >
        <FaChevronLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-sm hidden md:flex items-center justify-center hover:scale-110 group"
      >
        <FaChevronRight className="text-xl group-hover:translate-x-1 transition-transform" />
      </button>
      {/* --- DOTS INDICATOR --- */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentIndex
                ? "w-10 bg-[#B5A65F]" // Màu vàng cát khi active
                : "w-2 bg-white/40 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 w-full h-40 bg-linear-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent z-20 pointer-events-none"></div>{" "}
      {/* CSS INLINE ANIMATION */}
      <style>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }

        @keyframes shine {
            100% { left: 125%; }
        }
        .animate-shine-infinite { animation: shine 5s infinite linear; }
        .group-hover\\/btn\\:animate-shine-fast:hover { animation: shine 0.7s forwards ease-in-out; }
      `}</style>
    </section>
  );
}
