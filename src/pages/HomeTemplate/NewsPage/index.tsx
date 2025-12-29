import React, {
  Suspense,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { Search, ArrowRight, ChevronRight, Mail } from "lucide-react";

interface RevealOnScrollProps {
  children: ReactNode;
  delay?: number;
}

const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const SectionLoader = () => (
  <div className="w-full h-40 flex items-center justify-center bg-[#0a0a0a]">
    <div className="w-8 h-8 border-2 border-[#B5A65F] border-t-transparent rounded-full animate-spin"></div>
  </div>
);


const NewsHero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 px-6 border-b border-white/5 min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#B5A65F]/10 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center font-noto">
        <RevealOnScroll>
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tighter uppercase">
            <span className="text-white">TIN TỨC &</span> <br />
            <span className="text-[#B5A65F]">SỰ KIỆN ĐẲNG CẤP</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light">
            Thay thế quy trình thủ công rườm rà bằng sức mạnh công nghệ. Kiểm
            soát chính xác từ khâu đăng ký đến báo cáo sau sự kiện.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={400}>
          <div className="max-w-xl mx-auto relative group">
            <div className="relative flex bg-[#121212] rounded-full items-center p-1.5 border border-white/10 shadow-2xl">
              <input
                type="text"
                placeholder="Tìm kiếm nội dung..."
                className="w-full py-4 pl-8 bg-transparent text-white focus:outline-none rounded-full"
              />
              <button className="p-4 bg-[#B5A65F] rounded-full text-black">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

const TrendingSection: React.FC = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto font-noto">
      <RevealOnScroll>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight">
            <span className="text-white">TIÊU ĐIỂM</span>{" "}
            <span className="text-[#B5A65F]">TUẦN NÀY</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            Cập nhật những chuyển động mới nhất và các bài phân tích chuyên sâu
            dẫn đầu xu hướng.
          </p>
        </div>
      </RevealOnScroll>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Card lớn */}
        <RevealOnScroll delay={200}>
          <div className="relative h-[600px] rounded-[3rem] overflow-hidden group border border-white/5 shadow-2xl">
            <img
              src="https://backstage.vn/storage/2024/05/z5438663855317_a5af90231220174cf7d35937b150d30b.jpg"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              alt="Main"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-10 md:p-14 w-full">
              <span className="px-4 py-1.5 bg-[#B5A65F] text-black text-[10px] font-black rounded-full mb-6 inline-block uppercase">
                Hot News
              </span>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-[#B5A65F] transition-colors">
                Công nghệ Livestream 4K tích hợp trực tiếp trên EMS
              </h3>
              <div className="flex items-center gap-2 text-[#B5A65F] font-bold tracking-widest text-sm uppercase">
                Xem chi tiết <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </RevealOnScroll>

        <div className="flex flex-col gap-8 justify-center">
          {[
            {
              img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop",
              tag: "Báo cáo",
              title: "Xu hướng sự kiện ảo liệu có thực sự thoái trào?",
            },
            {
              img: "data:image/jpeg;base64,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",
              tag: "Cẩm nang",
              title: "Top 10 địa điểm tổ chức Event sang trọng tại Hà Nội",
            },
            {
              img: "https://backstage.vn/storage/2024/07/102124132_gettyimages-498709626.jpg",
              tag: "Bí quyết",
              title: "Làm thế nào để giữ chân khán giả đến phút cuối cùng?",
            },
          ].map((item, index) => (
            <RevealOnScroll key={index} delay={300 + index * 100}>
              <div className="flex gap-6 items-center p-6 rounded-[2.5rem] bg-[#121212] border border-white/5 hover:border-[#B5A65F]/40 transition-all group cursor-pointer">
                <div className="w-32 h-24 md:w-44 md:h-32 rounded-3xl overflow-hidden shrink-0">
                  <img
                    src={item.img}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt="News"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-black text-[#B5A65F] uppercase tracking-widest mb-2 block">
                    {item.tag}
                  </span>
                  <h4 className="text-xl font-bold text-white group-hover:text-[#B5A65F] transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

const NewsGrid: React.FC = () => {
  const newsItems = [
    {
      img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop",
      title: "An ninh mạng trong sự kiện số",
      cat: "Update hệ thống",
    },
    {
      img: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop",
      title: "Review hệ thống âm thanh vòm mới",
      cat: "Mẹo tổ chức",
    },
    {
      img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop",
      title: "Viral sự kiện trên nền tảng TikTok",
      cat: "Mẹo tổ chức",
    },
    {
      img: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=800&auto=format&fit=crop",
      title: "Recap: Tech Summit Asia 2025",
      cat: "Sự kiện nổi bật",
    },
    {
      img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
      title: "Phỏng vấn CEO: Tầm nhìn 2030",
      cat: "Phỏng vấn",
    },
    {
      img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
      title: "Công nghệ Check-in khuôn mặt",
      cat: "Update hệ thống",
    },
  ];

  return (
    <section className="bg-[#0c0c0c] py-24 border-t border-white/5 font-noto">
      <div className="max-w-7xl mx-auto px-6">
        <RevealOnScroll>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight">
              <span className="text-white">KHÁM PHÁ</span>{" "}
              <span className="text-[#B5A65F]">BÀI VIẾT</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
              Giải pháp quản lý toàn diện. Kiểm soát chính xác từ khâu đăng ký,
              check-in đến báo cáo sau sự kiện.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {newsItems.map((item, index) => (
            <RevealOnScroll key={index} delay={index * 100}>
              <div className="group bg-[#121212] border border-white/5 rounded-[3rem] overflow-hidden hover:border-[#B5A65F]/50 transition-all duration-500 flex flex-col h-full hover:-translate-y-2">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={item.img}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                    alt="News"
                  />
                  <div className="absolute top-6 left-6 bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-[#B5A65F] uppercase tracking-widest">
                    {item.cat}
                  </div>
                </div>
                <div className="p-10 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-white mb-6 leading-snug group-hover:text-[#B5A65F] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="mt-auto pt-8 border-t border-white/5">
                    <a
                      href="#"
                      className="inline-flex items-center text-white text-[11px] font-black uppercase tracking-[0.2em] hover:text-[#B5A65F] transition-all group"
                    >
                      Đọc tiếp{" "}
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

const NewsCTA: React.FC = () => {
  return (
    <section className="relative bg-[#080808] border-t border-white/5 py-32 px-6 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto text-center font-noto">
        <RevealOnScroll>
          <Mail className="w-16 h-16 text-[#B5A65F] mx-auto mb-10" />
          <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tight text-white">
            ĐĂNG KÝ <span className="text-[#B5A65F]">BẢN TIN EMS</span>
          </h2>
          <p className="text-gray-400 mb-12 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed">
            Thay thế quy trình thủ công rườm rà bằng sức mạnh công nghệ. Nhận
            ngay cẩm nang tổ chức sự kiện đẳng cấp trực tiếp qua email.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto bg-[#121212] p-2.5 rounded-[3rem] border border-white/10 shadow-2xl focus-within:border-[#B5A65F]/50 transition-all">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="flex-1 px-8 py-4 bg-transparent text-white focus:outline-none"
            />
            <button className="px-12 py-4 bg-[#B5A65F] text-black font-black text-[11px] tracking-[0.2em] rounded-full uppercase transition-all hover:bg-white">
              Đăng ký ngay
            </button>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default function NewsPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen font-noto text-white overflow-x-hidden selection:bg-[#B5A65F] selection:text-black">
      <Suspense fallback={<SectionLoader />}>
        <NewsHero />
        <TrendingSection />
        <NewsGrid />
        <NewsCTA />
      </Suspense>
    </div>
  );
}
