import React, {
  Suspense,
  useState,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  Quote,
  Newspaper,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "@/utils/i18n-router";
import { type AppDispatch, type RootState } from "../../../store";
import { fetchPublicPosts } from "../../../store/slices/newsSlice";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { optimizeImageUrl } from "@/utils/imageOptimizer";
import { useTranslation } from "react-i18next";

const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const updateScroll = () => {
      const currentScroll = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      if (scrollHeight)
        setScrollProgress(
          Number((currentScroll / scrollHeight).toFixed(2)) * 100,
        );
    };
    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);
  return scrollProgress;
};

const formatDate = (dateStr: string, locale: string = "vi") => {
  try {
    const loc = locale === "en" ? "en-US" : "vi-VN";
    return new Date(dateStr).toLocaleDateString(loc, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const RevealOnScroll: React.FC<{
  children: ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 cubic-bezier(0.17, 0.55, 0.55, 1) transform ${className} 
      ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-16 blur-sm"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const SectionHeader: React.FC<{ subtitle: string; title: ReactNode }> = ({
  subtitle,
  title,
}) => (
  <RevealOnScroll>
    <div className="flex flex-col items-center text-center mb-16">
      <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-none mb-4 drop-shadow-xl">
        {title}
      </h2>
      <p className="text-gray-400 text-lg font-light max-w-2xl mx-auto">
        {subtitle}
      </p>
    </div>
  </RevealOnScroll>
);

const NewsCard: React.FC<{ post: any; index: number; label?: string }> = ({
  post,
  label = "News",
}) => {
  const { t, i18n } = useTranslation();
  return (
    <Link
      to={`/news/${post.slug || post.id}`}
      className="group flex flex-col h-full bg-[#111] rounded-2xl overflow-hidden border border-white/5 hover:border-[#D8C97B]/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl z-10 relative"
    >
      <div className="relative aspect-video overflow-hidden">
        <OptimizedImage
          src={post.thumbnailUrl}
          alt={post.title}
          width={400}
          height={225}
          className="w-full h-full"
          imgClassName="transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10">
          {formatDate(post.createdAt, i18n.language)}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#D8C97B] uppercase tracking-wider border border-[#D8C97B]/20 px-2 py-0.5 rounded-sm">
            {label}
          </span>
        </div>
        <h3 className="text-lg font-bold text-white leading-snug mb-3 group-hover:text-[#D8C97B] transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-4 font-normal flex-1">
          {post.summary}
        </p>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 group-hover:text-white transition-colors border-t border-white/5 pt-4 mt-auto">
          {t("news_page.card.view_details")} <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  );
};

const HeroSlider: React.FC<{ posts: any[] }> = ({ posts }) => {
  const { t, i18n } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (posts.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [current, posts.length]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === posts.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 800);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 800);
  };

  if (!posts.length) return null;
  const post = posts[current];

  return (
    <section className="relative h-[85vh] min-h-[600px] w-full bg-[#050505] overflow-hidden group">
      {posts.map((p, index) => (
        <div
          key={`hero-bg-${p.id}-${index}`}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div
            className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-linear ${
              index === current ? "scale-105" : "scale-100"
            }`}
            style={{
              backgroundImage: `url(${optimizeImageUrl(p.thumbnailUrl, 1920, 1080)})`,
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-black/50 to-black/30"></div>
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/20 to-transparent"></div>
        </div>
      ))}

      <div className="absolute inset-0 z-20 flex flex-col justify-end pb-16 px-6 md:px-16 max-w-[1600px] mx-auto">
        <div
          key={`content-${current}`}
          className="max-w-4xl animate-[fadeInUp_0.8s_ease-out]"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-[#D8C97B] text-black px-3 py-1 text-[11px] font-black uppercase tracking-widest flex items-center gap-1 shadow-[0_0_15px_#D8C97B]">
              <Sparkles size={12} fill="black" />{" "}
              {t("news_page.hero_slider.spotlight")}
            </div>
            <span className="text-white/80 text-sm font-medium tracking-wide flex items-center gap-2">
              <div className="w-1 h-1 bg-white rounded-full"></div>{" "}
              {formatDate(post.createdAt, i18n.language)}
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 drop-shadow-2xl line-clamp-3">
            <Link
              to={`/news/${post.slug || post.id}`}
              className="hover:text-[#D8C97B] transition-colors"
            >
              {post.title}
            </Link>
          </h2>

          <p className="text-gray-300 text-lg md:text-xl font-light mb-10 max-w-2xl line-clamp-2 border-l-4 border-[#D8C97B] pl-6 leading-relaxed">
            {post.summary}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-8 border-t border-white/10 pt-8 w-full">
            <Link
              to={`/news/${post.slug || post.id}`}
              className="group flex items-center gap-3 text-white font-bold uppercase tracking-widest text-sm hover:text-[#D8C97B] transition-colors"
            >
              {t("news_page.hero_slider.read_article")}
              <span className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-[#D8C97B] group-hover:text-black group-hover:border-[#D8C97B] transition-all">
                <ArrowRight size={14} />
              </span>
            </Link>

            <div className="flex items-center gap-6">
              <div className="text-white font-mono text-sm tracking-widest">
                <span className="text-[#D8C97B] text-xl font-bold">
                  0{current + 1}
                </span>
                <span className="text-gray-600 mx-2">/</span>
                <span className="text-gray-500">0{posts.length}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all active:scale-95"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all active:scale-95"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const WeeklyHighlights: React.FC<{ posts: any[] }> = ({ posts }) => {
  const { t } = useTranslation();
  if (!posts || posts.length === 0) return null;

  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden text-white font-noto group-section selection:bg-[rgba(216,201,123,0.3)]">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.15) 1px, rgba(0, 0, 0, 0) 1px)",
          backgroundSize: "30px 30px",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0), black 15%, black 85%, rgba(0,0,0,0))",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0), black 15%, black 85%, rgba(0,0,0,0))",
        }}
      ></div>

      <div className="container mx-auto px-6 relative z-10 max-w-[1400px]">
        <SectionHeader
          subtitle={t("news_page.weekly_highlights.subtitle")}
          title={
            <>
              {t("news_page.weekly_highlights.title")}{" "}
              <span className="text-[#D8C97B]">
                {t("news_page.weekly_highlights.highlight")}
              </span>
            </>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post, index) => (
            <RevealOnScroll
              key={`weekly-${post.id}-${index}`}
              delay={index * 100}
            >
              <NewsCard
                post={post}
                index={index}
                label={t("news_page.card.label")}
              />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

const ExploreMasonry: React.FC<{ posts: any[] }> = ({ posts }) => {
  const { t } = useTranslation();
  if (!posts || posts.length === 0) return null;

  return (
    <section className="relative py-20 lg:py-32 bg-[#020202] overflow-hidden font-noto text-white selection:bg-[#D8C97B] selection:text-black">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)`,
            backgroundSize: "30px 30px",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#020202]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-[1400px]">
        <SectionHeader
          subtitle={t("news_page.explore.subtitle")}
          title={
            <>
              {t("news_page.explore.title")}{" "}
              <span className="text-[#D8C97B]">
                {t("news_page.explore.highlight")}
              </span>
            </>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {posts.map((post, index) => (
            <RevealOnScroll
              key={`explore-${post.id}-${index}`}
              delay={(index % 4) * 50}
            >
              <NewsCard
                post={post}
                index={index}
                label={t("news_page.card.label")}
              />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function NewsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector((state: RootState) => state.news);
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    dispatch(fetchPublicPosts({ page: 0, size: 50 }));
  }, [dispatch]);

  const { heroPosts, weeklyHighlights, explorePosts } = useMemo(() => {
    if (!data || data.length === 0)
      return { heroPosts: [], weeklyHighlights: [], explorePosts: [] };

    const allPosts = [...data];

    const hero = allPosts.slice(0, 3);

    let weekly = allPosts.slice(3, 7);
    if (weekly.length < 4) {
      const filler = [...allPosts];
      weekly = [...weekly, ...filler].slice(0, 4);
    }

    let explore = allPosts.slice(7);
    if (explore.length === 0) explore = allPosts;

    return { heroPosts: hero, weeklyHighlights: weekly, explorePosts: explore };
  }, [data]);

  const isEmpty = !loading && (!data || data.length === 0);

  return (
    <div className="bg-[#050505] min-h-screen text-white overflow-x-hidden selection:bg-[#D8C97B] selection:text-black font-noto">
      <div
        className="fixed top-0 left-0 h-[3px] bg-linear-to-r from-[#D8C97B] to-[#FFF5C1] z-50 transition-all duration-300 ease-out shadow-[0_0_10px_#D8C97B]"
        style={{ width: `${scrollProgress}%` }}
      ></div>

      <Suspense fallback={<div className="h-screen bg-[#050505]" />}>
        {loading && (
          <div className="h-screen flex flex-col items-center justify-center gap-4 text-[#D8C97B]">
            <div className="w-8 h-8 border-2 border-[#D8C97B] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {isEmpty && (
          <div className="h-screen flex flex-col items-center justify-center opacity-50">
            <Newspaper size={48} className="text-[#333] mb-4" />
            <h3 className="text-xl font-bold text-gray-500">
              {t("news_page.empty")}
            </h3>
          </div>
        )}

        {!loading && !isEmpty && (
          <>
            <HeroSlider posts={heroPosts} />

            <WeeklyHighlights posts={weeklyHighlights} />

            <div className="py-24 px-6 bg-[#0a0a0a] border-y border-white/5 relative">
              <RevealOnScroll>
                <div className="text-center max-w-4xl mx-auto">
                  <Quote
                    size={32}
                    className="text-[#D8C97B] mx-auto mb-6 opacity-60"
                  />
                  <p className="text-2xl md:text-3xl font-light italic text-gray-300 leading-relaxed mb-6">
                    {t("news_page.quote")}
                  </p>
                  <div className="w-16 h-px bg-[#D8C97B] mx-auto opacity-50"></div>
                </div>
              </RevealOnScroll>
            </div>

            <ExploreMasonry posts={explorePosts} />

            <div className="pb-16 pt-8 text-center opacity-40 bg-[#020202]">
              <p className="text-[10px] tracking-[0.2em] uppercase">
                {t("news_page.gallery")}
              </p>
            </div>
          </>
        )}
      </Suspense>
    </div>
  );
}
