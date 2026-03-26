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
  Tag,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "@/utils/i18n-router";
import { type AppDispatch, type RootState } from "../../../store";
import { fetchPublicPosts } from "../../../store/slices/newsSlice";
import {
  fetchPublicCategories,
  getCategoryName,
  type Category,
} from "../../../store/slices/categorySlice";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { optimizeImageUrl } from "@/utils/imageOptimizer";
import { useTranslation } from "react-i18next";
import { SeoHelmet } from "@/components/common/SeoHelmet";
import { SEO_DATA } from "@/constants/seo-config";
import LoadingScreen from "./../_components/common/LoadingSrceen";

// ─── Hàm kiểm tra xem URL có phải là Video không ─────────────────────────────
const checkIsVideo = (url?: string | null) => {
  if (!url) return false;
  // Tách bỏ các query params (như ?v=123) để lấy đúng phần đuôi mở rộng
  const path = url.split("?")[0].toLowerCase();
  return /\.(mp4|webm|ogg|mov)$/i.test(path);
};

const getCategorySeoDescription = (
  cat: Category | undefined,
  lang: string = "vi",
): string => {
  if (!cat) return "";
  if (cat.translations) {
    return (
      cat.translations[lang]?.seoDescription ||
      cat.translations["vi"]?.seoDescription ||
      ""
    );
  }
  return "";
};

const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const h = document.body.scrollHeight - window.innerHeight;
      if (h) setScrollProgress(Number((window.scrollY / h).toFixed(2)) * 100);
    };
    window.addEventListener("scroll", update);
    return () => window.removeEventListener("scroll", update);
  }, []);
  return scrollProgress;
};

const formatDate = (dateStr: string, locale = "vi") => {
  try {
    return new Date(dateStr).toLocaleDateString(
      locale === "en" ? "en-US" : "vi-VN",
      { day: "2-digit", month: "2-digit", year: "numeric" },
    );
  } catch {
    return "";
  }
};

const RevealOnScroll: React.FC<{
  children: ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = "" }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold: 0.1 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 transform ${className} ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-16 blur-sm"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// ─── NewsCard ─────────────────────────────────────────────────────────────────
const NewsCard: React.FC<{
  post: any;
  label?: string;
}> = ({ post, label = "News" }) => {
  const { i18n } = useTranslation();

  const catSlug = post.categorySlug || "tin-tuc";
  const postUrl = `/news/${catSlug}/${post.slug || post.id}`;
  const isVideo = checkIsVideo(post.thumbnailUrl);

  return (
    <Link
      to={postUrl}
      className="group flex flex-col h-full bg-[#111] rounded-2xl overflow-hidden border border-white/5 hover:border-[#D8C97B]/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(216,201,123,0.05)] z-10 relative"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {isVideo ? (
          <video
            src={post.thumbnailUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <OptimizedImage
            src={post.thumbnailUrl}
            alt={post.title}
            width={400}
            height={250}
            className="w-full h-full"
            imgClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        {label && label !== "—" && (
          <div className="absolute top-4 left-4">
            <span className="bg-black/60 backdrop-blur-md text-[#D8C97B] border border-[#D8C97B]/30 px-3 py-1.5 rounded-[4px] text-[9px] font-black uppercase tracking-[0.15em] shadow-lg">
              {label}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 mb-3 uppercase tracking-widest">
          <span>{formatDate(post.createdAt, i18n.language)}</span>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <span>Webie Vietnam</span>
        </div>

        <h3 className="text-lg font-bold text-white leading-snug mb-3 group-hover:text-[#D8C97B] transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="text-sm text-gray-400 line-clamp-3 mb-5 flex-1 leading-relaxed">
          {post.summary}
        </p>

        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#D8C97B]/70 group-hover:text-[#D8C97B] transition-colors mt-auto">
          {i18n.language === "en" ? "Read More" : "Xem chi tiết"}
          <ArrowRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </Link>
  );
};

// ─── HeroSlider ───────────────────────────────────────────────────────────────

const HeroSlider: React.FC<{ posts: any[] }> = ({ posts }) => {
  const { t, i18n } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setCurrent(0);
  }, [posts]);

  useEffect(() => {
    if (posts.length <= 1) return;
    const timer = setInterval(() => go(1), 8000);
    return () => clearInterval(timer);
  }, [current, posts.length]);

  const go = (dir: 1 | -1) => {
    if (animating) return;
    setAnimating(true);
    setCurrent((p) => (p + dir + posts.length) % posts.length);
    setTimeout(() => setAnimating(false), 800);
  };

  if (!posts?.length) return null;

  const safeCurrent = current >= posts.length ? 0 : current;
  const post = posts[safeCurrent];

  if (!post) return null;

  const catSlug = post.categorySlug || "tin-tuc";
  const postUrl = `/news/${catSlug}/${post.slug || post.id}`;

  return (
    <section className="relative h-[85vh] min-h-[600px] w-full bg-[#050505] overflow-hidden">
      {posts.map((p, i) => {
        const isVideo = checkIsVideo(p.thumbnailUrl);
        return (
          <div
            key={`bg-${p.id}-${i}`}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === safeCurrent
                ? "opacity-100 z-10"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {isVideo ? (
              <video
                src={p.thumbnailUrl}
                autoPlay
                muted
                loop
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-linear ${
                  i === safeCurrent ? "scale-105" : "scale-100"
                }`}
              />
            ) : (
              <div
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-linear ${
                  i === safeCurrent ? "scale-105" : "scale-100"
                }`}
                style={{
                  backgroundImage: `url(${optimizeImageUrl(
                    p.thumbnailUrl || "https://placehold.co/1920x1080",
                    1920,
                    1080,
                  )})`,
                }}
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/50 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
          </div>
        );
      })}

      <div className="absolute inset-0 z-20 flex flex-col justify-end pb-16 px-6 md:px-16 max-w-screen-2xl mx-auto">
        <div
          key={`content-${safeCurrent}`}
          className="max-w-4xl animate-[fadeInUp_0.8s_ease-out]"
        >
          <div className="flex items-center flex-wrap gap-4 mb-5">
            {post.categoryName && (
              <span className="bg-[#D8C97B] text-black px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-sm shadow-lg">
                {post.categoryName}
              </span>
            )}
            <span className="text-white/70 text-[13px] font-medium flex items-center gap-2">
              <div className="w-1 h-1 bg-white/50 rounded-full" />
              {formatDate(post.createdAt, i18n.language)}
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 drop-shadow-2xl line-clamp-3">
            <Link
              to={postUrl}
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
              to={postUrl}
              className="group flex items-center gap-3 text-white font-bold uppercase tracking-widest text-sm hover:text-[#D8C97B] transition-colors"
            >
              {t("news_page.hero_slider.read_article")}
              <span className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-[#D8C97B] group-hover:text-black group-hover:border-[#D8C97B] transition-all">
                <ArrowRight size={14} />
              </span>
            </Link>

            <div className="flex items-center gap-6">
              <div className="flex gap-2">
                {posts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === safeCurrent
                        ? "w-6 h-2 bg-[#D8C97B]"
                        : "w-2 h-2 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => go(-1)}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => go(1)}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
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

// ... (Các component CategoryFilterBar, CategoryHeroBanner, CategorySection giữ nguyên)
const CategoryFilterBar: React.FC<{
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  lang: string;
}> = ({ categories, selectedId, onSelect, lang }) => {
  const roots = categories.filter((c) => !c.parent);
  if (!roots.length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2 px-4">
      <button
        onClick={() => onSelect(null)}
        className={`px-6 py-2 rounded-full text-[11px] uppercase tracking-widest font-bold border transition-all duration-300 ${
          selectedId === null
            ? "bg-[#D8C97B] text-black border-[#D8C97B] shadow-[0_0_15px_rgba(216,201,123,0.3)]"
            : "border-white/10 text-gray-400 hover:text-white hover:border-white/30 bg-white/5"
        }`}
      >
        {lang === "en" ? "All" : "Tất cả"}
      </button>

      {roots.map((cat) => {
        const name = getCategoryName(cat, lang) || `#${cat.id}`;
        const isSelected = selectedId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`px-6 py-2 rounded-full text-[11px] uppercase tracking-widest font-bold border transition-all duration-300 ${
              isSelected
                ? "bg-[#D8C97B] text-black border-[#D8C97B] shadow-[0_0_15px_rgba(216,201,123,0.3)]"
                : "border-white/10 text-gray-400 hover:text-white hover:border-white/30 bg-white/5"
            }`}
          >
            {name}
          </button>
        );
      })}

      {selectedId !== null &&
        (() => {
          const children = categories.filter(
            (c) => c.parent?.id === selectedId,
          );
          if (!children.length) return null;
          return children.map((child) => (
            <button
              key={child.id}
              onClick={() => onSelect(child.id)}
              className="px-5 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold border border-[#D8C97B]/30 text-[#D8C97B]/80 hover:text-[#D8C97B] hover:border-[#D8C97B] bg-[#D8C97B]/5 transition-all"
            >
              ↳ {getCategoryName(child, lang)}
            </button>
          ));
        })()}
    </div>
  );
};

const CategoryHeroBanner: React.FC<{
  category: Category | undefined;
  postCount: number;
  lang: string;
}> = ({ category, postCount, lang }) => {
  if (!category) return null;
  const isEn = lang === "en";
  const seoDesc = getCategorySeoDescription(category, lang);

  return (
    <div className="bg-[#080808] border-b border-[#D8C97B]/20 py-12 px-6">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between flex-wrap gap-6">
        <div className="flex items-center gap-5">
          <div className="w-1.5 h-16 bg-[#D8C97B] shadow-[0_0_20px_rgba(216,201,123,0.6)]" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D8C97B]/60 mb-2">
              {isEn ? "Category" : "Danh mục"}
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              {getCategoryName(category, lang)}
            </h2>
            {seoDesc && (
              <p className="text-sm text-gray-400 mt-3 max-w-2xl leading-relaxed">
                {seoDesc}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl md:text-6xl font-black text-[#D8C97B]">
            {postCount}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mt-2 font-bold">
            {isEn ? "Articles" : "Bài viết"}
          </div>
        </div>
      </div>
    </div>
  );
};

const CategorySection: React.FC<{
  category: Category;
  posts: any[];
  lang: string;
  onSelectCategory: (id: number) => void;
}> = ({ category, posts, lang, onSelectCategory }) => {
  if (!posts.length) return null;
  const previewPosts = posts.slice(0, 4);

  return (
    <div className="mb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-[#D8C97B] shadow-[0_0_15px_rgba(216,201,123,0.5)]" />
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-wide">
              {getCategoryName(category, lang)}
            </h3>
            {category.children?.length ? (
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {category.children.slice(0, 4).map((child) => (
                  <span
                    key={child.id}
                    className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.15em] hover:text-[#D8C97B] transition-colors cursor-pointer"
                    onClick={() => onSelectCategory(child.id)}
                  >
                    • {getCategoryName(child, lang)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <button
          onClick={() => onSelectCategory(category.id)}
          className="hidden sm:flex items-center gap-2 text-[11px] font-bold text-[#D8C97B]/70 hover:text-[#D8C97B] transition-colors border border-[#D8C97B]/20 hover:border-[#D8C97B]/60 px-5 py-2.5 rounded-full uppercase tracking-widest whitespace-nowrap"
        >
          {lang === "en" ? "View all" : "Xem tất cả"} <ArrowRight size={13} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {previewPosts.map((post, i) => (
          <RevealOnScroll key={post.id} delay={i * 100}>
            <NewsCard post={post} label={getCategoryName(category, lang)} />
          </RevealOnScroll>
        ))}
      </div>

      <div className="mt-8 flex justify-center sm:hidden">
        <button
          onClick={() => onSelectCategory(category.id)}
          className="flex items-center gap-2 text-[11px] font-bold text-[#D8C97B] border border-[#D8C97B]/30 px-6 py-3 rounded-full uppercase tracking-widest"
        >
          {lang === "en" ? "View all category" : "Xem toàn bộ danh mục"}{" "}
          <ArrowRight size={12} />
        </button>
      </div>

      {posts.length > 4 && (
        <div className="mt-8 hidden sm:flex justify-center">
          <button
            onClick={() => onSelectCategory(category.id)}
            className="text-[11px] font-bold text-gray-500 hover:text-[#D8C97B] transition-colors uppercase tracking-[0.2em]"
          >
            + {posts.length - 4}{" "}
            {lang === "en" ? "more articles" : "bài viết khác"}
          </button>
        </div>
      )}
    </div>
  );
};

const FilteredPostsGrid: React.FC<{
  posts: any[];
  category: Category | undefined;
  lang: string;
}> = ({ posts, category, lang }) => {
  const [page, setPage] = useState(1);
  const perPage = 12;
  const totalPages = Math.ceil(posts.length / perPage);
  const visible = posts.slice(0, page * perPage);

  if (!posts.length) return null;

  return (
    <section className="py-16 px-6 bg-[#0a0a0a]">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {visible.map((post, i) => (
            <RevealOnScroll key={`filtered-${post.id}`} delay={(i % 4) * 80}>
              <NewsCard
                post={post}
                label={category ? getCategoryName(category, lang) : ""}
              />
            </RevealOnScroll>
          ))}
        </div>

        {page < totalPages && (
          <div className="text-center mt-16">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-10 py-3.5 rounded-full border border-[#D8C97B]/30 text-[#D8C97B] text-[11px] font-black uppercase tracking-widest hover:bg-[#D8C97B]/10 hover:border-[#D8C97B] transition-all"
            >
              {lang === "en"
                ? `Load more (${posts.length - page * perPage} left)`
                : `Tải thêm (${posts.length - page * perPage} bài)`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

const AllCategoriesFeed: React.FC<{
  postsByCategory: Map<number, any[]>;
  rootCategories: Category[];
  lang: string;
  onSelectCategory: (id: number) => void;
}> = ({ postsByCategory, rootCategories, lang, onSelectCategory }) => {
  return (
    <section className="py-16 px-6 bg-[#0a0a0a]">
      <div className="max-w-screen-xl mx-auto">
        {rootCategories.map((cat) => {
          const posts = postsByCategory.get(cat.id) || [];
          return (
            <RevealOnScroll key={cat.id}>
              <CategorySection
                category={cat}
                posts={posts}
                lang={lang}
                onSelectCategory={onSelectCategory}
              />
            </RevealOnScroll>
          );
        })}
      </div>
    </section>
  );
};

const QuoteSection = () => {
  const { t } = useTranslation();
  return (
    <div className="py-24 px-6 bg-[#050505] border-y border-white/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-[200px] bg-[#D8C97B] blur-[150px] opacity-[0.03] pointer-events-none" />
      <RevealOnScroll>
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <Quote size={40} className="text-[#D8C97B] mx-auto mb-8 opacity-50" />
          <p className="text-2xl md:text-4xl font-light italic text-gray-300 leading-relaxed mb-8">
            {t("news_page.quote")}
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#D8C97B]/50" />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#D8C97B]" />
            <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#D8C97B]/50" />
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
};

export default function NewsPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector((state: RootState) => state.news);
  const { publicList: categories } = useSelector(
    (state: RootState) => state.categories,
  );
  const scrollProgress = useScrollProgress();
  const currentLang = i18n.language || "vi";
  const [hasFetched, setHasFetched] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const seo = SEO_DATA.news[currentLang as "vi" | "en"] || SEO_DATA.news.vi;

  useEffect(() => {
    setHasFetched(false);
    setSelectedCategoryId(null);
    Promise.all([
      dispatch(fetchPublicPosts({ page: 0, size: 100, lang: currentLang })),
      dispatch(fetchPublicCategories(currentLang)),
    ]).finally(() => setHasFetched(true));
  }, [dispatch, currentLang]);

  const { flatCategories, rootCategories } = useMemo(() => {
    const flat: Category[] = [];
    const roots: Category[] = [];
    const traverse = (list: Category[], isRoot: boolean) => {
      list.forEach((cat) => {
        flat.push(cat);
        if (isRoot) roots.push(cat);
        if (cat.children?.length) traverse(cat.children, false);
      });
    };
    traverse(categories, true);
    return { flatCategories: flat, rootCategories: roots };
  }, [categories]);

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    flatCategories.forEach((cat) => {
      map.set(cat.id, getCategoryName(cat, currentLang));
    });
    return map;
  }, [flatCategories, currentLang]);

  const processedPosts = useMemo(() => {
    if (!data?.length) return [];
    return data.filter(Boolean).map((post: any) => ({
      ...post,
      title:
        post.translations?.[currentLang]?.title ||
        post.title ||
        "Không có tiêu đề",
      summary: post.translations?.[currentLang]?.summary || post.summary || "",
      categoryName:
        (post.categoryId ? categoryMap.get(post.categoryId) : null) ||
        post.categoryName ||
        "",
      categorySlug: post.categorySlug || "tin-tuc",
    }));
  }, [data, currentLang, categoryMap]);

  const postsByCategory = useMemo(() => {
    const map = new Map<number, any[]>();
    rootCategories.forEach((root) => {
      const childIds = flatCategories
        .filter((c) => c.parent?.id === root.id)
        .map((c) => c.id);
      const validIds = new Set([root.id, ...childIds]);
      const posts = processedPosts.filter(
        (p: any) => p.categoryId && validIds.has(p.categoryId),
      );
      if (posts.length) map.set(root.id, posts);
    });
    return map;
  }, [processedPosts, rootCategories, flatCategories]);

  const filteredPosts = useMemo(() => {
    if (selectedCategoryId === null) return processedPosts;
    const childIds = flatCategories
      .filter((c) => c.parent?.id === selectedCategoryId)
      .map((c) => c.id);
    const validIds = new Set([selectedCategoryId, ...childIds]);
    return processedPosts.filter(
      (p: any) => p.categoryId && validIds.has(p.categoryId),
    );
  }, [processedPosts, selectedCategoryId, flatCategories]);

  const heroPosts = useMemo(() => {
    const source = selectedCategoryId !== null ? filteredPosts : processedPosts;
    const featured = source.filter((p: any) => p.isFeatured);
    return featured.length > 0 ? featured.slice(0, 5) : source.slice(0, 5);
  }, [processedPosts, filteredPosts, selectedCategoryId]);

  const selectedCategory = useMemo(
    () => flatCategories.find((c) => c.id === selectedCategoryId),
    [flatCategories, selectedCategoryId],
  );

  const isEmpty = hasFetched && !loading && processedPosts.length === 0;
  const isCategoryEmpty =
    hasFetched &&
    !loading &&
    selectedCategoryId !== null &&
    filteredPosts.length === 0;

  return (
    <>
      <SeoHelmet
        title={
          selectedCategory
            ? `${getCategoryName(selectedCategory, currentLang)} - ${seo.title}`
            : seo.title
        }
        description={
          getCategorySeoDescription(selectedCategory, currentLang) ||
          seo.description
        }
        keywords={seo.keywords}
        slug="news"
      />

      <div className="bg-[#050505] min-h-screen text-white overflow-x-hidden font-noto">
        <div
          className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[#D8C97B] to-[#FFF5C1] z-50 transition-all duration-300 shadow-[0_0_10px_#D8C97B]"
          style={{ width: `${scrollProgress}%` }}
        />

        <Suspense fallback={<LoadingScreen />}>
          {(!hasFetched || loading) && <LoadingScreen />}

          {isEmpty && (
            <div className="h-screen flex flex-col items-center justify-center opacity-50">
              <Newspaper size={48} className="text-[#333] mb-4" />
              <h3 className="text-xl font-bold text-gray-500">
                {t("news_page.empty")}
              </h3>
            </div>
          )}

          {hasFetched && !loading && !isEmpty && (
            <>
              {heroPosts.length > 0 && <HeroSlider posts={heroPosts} />}

              {flatCategories.length > 0 && (
                <div className="bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 py-5 px-4 sticky top-0 z-30 shadow-lg">
                  <CategoryFilterBar
                    categories={flatCategories}
                    selectedId={selectedCategoryId}
                    onSelect={setSelectedCategoryId}
                    lang={currentLang}
                  />
                </div>
              )}

              {selectedCategoryId !== null && (
                <CategoryHeroBanner
                  category={selectedCategory}
                  postCount={filteredPosts.length}
                  lang={currentLang}
                />
              )}

              {isCategoryEmpty && (
                <div className="min-h-[40vh] flex flex-col items-center justify-center text-center px-4 py-20 bg-[#0a0a0a]">
                  <Newspaper
                    size={48}
                    className="text-[#333] mb-6 opacity-50"
                  />
                  <h3 className="text-xl font-bold text-gray-500 mb-4">
                    {currentLang === "en"
                      ? "No articles in this category yet"
                      : "Chưa có bài viết nào trong danh mục này"}
                  </h3>
                  <button
                    onClick={() => setSelectedCategoryId(null)}
                    className="mt-2 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#D8C97B]/10 text-[#D8C97B] border border-[#D8C97B]/30 hover:bg-[#D8C97B]/20 transition"
                  >
                    {currentLang === "en"
                      ? "View all articles"
                      : "Xem tất cả bài viết"}
                  </button>
                </div>
              )}

              {!isCategoryEmpty && (
                <>
                  {selectedCategoryId === null ? (
                    <>
                      <AllCategoriesFeed
                        postsByCategory={postsByCategory}
                        rootCategories={rootCategories.filter((r) =>
                          postsByCategory.has(r.id),
                        )}
                        lang={currentLang}
                        onSelectCategory={setSelectedCategoryId}
                      />
                      <QuoteSection />
                      {(() => {
                        const allCatIds = new Set(
                          flatCategories.map((c) => c.id),
                        );
                        const uncategorized = processedPosts.filter(
                          (p: any) =>
                            !p.categoryId || !allCatIds.has(p.categoryId),
                        );
                        if (!uncategorized.length) return null;
                        return (
                          <section className="py-16 px-6 bg-[#050505]">
                            <div className="max-w-screen-xl mx-auto">
                              <div className="flex items-center gap-4 mb-8">
                                <div className="w-1.5 h-8 bg-gray-700 shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                                <h3 className="text-2xl font-black text-gray-400 flex items-center gap-2 tracking-wide">
                                  <Tag size={20} className="text-gray-500" />
                                  {currentLang === "en"
                                    ? "Other Articles"
                                    : "Bài viết khác"}
                                </h3>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {uncategorized
                                  .slice(0, 8)
                                  .map((post: any, i: number) => (
                                    <RevealOnScroll
                                      key={post.id}
                                      delay={i * 80}
                                    >
                                      <NewsCard post={post} label="—" />
                                    </RevealOnScroll>
                                  ))}
                              </div>
                            </div>
                          </section>
                        );
                      })()}
                    </>
                  ) : (
                    <FilteredPostsGrid
                      posts={filteredPosts}
                      category={selectedCategory}
                      lang={currentLang}
                    />
                  )}
                </>
              )}

              <div className="pb-16 pt-8 text-center opacity-30 bg-[#020202]">
                <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-gray-500">
                  {t("news_page.gallery")}
                </p>
              </div>
            </>
          )}
        </Suspense>
      </div>
    </>
  );
}
