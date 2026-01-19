import { useEffect, useState, type JSX } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../../store";

import {
  fetchPostBySlug,
  fetchPublicPosts,
  clearPostDetail,
} from "../../../store/slices/newsSlice";

import { fetchPublicEvents } from "../../../store/slices/eventSlice";

import { motion } from "framer-motion";
import {
  Calendar,
  User,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Clock,
  ChevronRight,
  TrendingUp,
  Tag,
  MapPin,
} from "lucide-react";
import OptimizedImage from "@/components/ui/OptimizedImage";

const styles = `
  @keyframes zoomSlow {
    0% { transform: scale(1); }
    100% { transform: scale(1.15); }
  }
  .animate-zoom-slow {
    animation: zoomSlow 20s ease-in-out infinite alternate;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-up {
    animation: fadeUp 1s ease-out forwards;
  }
  .animate-fade-up-delay {
    animation: fadeUp 1s ease-out 0.3s forwards;
    opacity: 0;
  }
`;

const LoadingScreen = () => {
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-[#0a0a0a] z-50 fixed inset-0">
      <div className="relative flex items-center justify-center">
        <motion.div
          className="w-24 h-24 border-[3px] border-[#D8C97B]/20 border-t-[#D8C97B] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-14 h-14 border-[3px] border-[#D8C97B]/20 border-b-[#D8C97B] rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-3 h-3 bg-[#D8C97B] rounded-full shadow-[0_0_15px_#D8C97B]"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <motion.div
        className="mt-8 text-[#D8C97B] font-noto font-bold tracking-[0.3em] text-sm uppercase"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Loading Content
      </motion.div>
    </div>
  );
};

const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const updateScroll = () => {
      const currentScroll = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight) setScrollProgress((currentScroll / scrollHeight) * 100);
    };
    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);
  return scrollProgress;
};

const NewsContentRenderer = ({ content }: { content: string }) => {
  let blocks = [];
  try {
    const data = JSON.parse(content);
    blocks = data.blocks || [];
  } catch (e) {
    return (
      <p className="text-red-500 py-4 font-noto">Lỗi hiển thị nội dung.</p>
    );
  }

  return (
    <div className="space-y-6 font-noto text-gray-800">
      {blocks.map((block: any) => {
        switch (block.type) {
          case "header":
            const Tag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
            return (
              <Tag
                key={block.id}
                className={`font-bold text-gray-900 mt-8 mb-4 leading-tight font-noto ${
                  block.data.level === 2
                    ? "text-2xl md:text-3xl border-l-4 border-[#B5A65F] pl-4"
                    : "text-xl md:text-2xl"
                }`}
              >
                {block.data.text}
              </Tag>
            );
          case "paragraph":
            return (
              <p
                key={block.id}
                className="text-lg leading-8 text-gray-700 mb-6 text-justify"
                dangerouslySetInnerHTML={{ __html: block.data.text }}
              />
            );
          case "list":
            const ListTag = block.data.style === "ordered" ? "ol" : "ul";
            return (
              <ListTag
                key={block.id}
                className="pl-4 mb-6 space-y-2 bg-gray-50 p-6 rounded-xl border border-gray-100"
              >
                {block.data.items.map((item: any, i: number) => {
                  const content =
                    typeof item === "string"
                      ? item
                      : item.content || item.text || "";
                  return (
                    <li
                      key={i}
                      className="flex gap-3 text-lg text-gray-700 leading-relaxed"
                    >
                      <span className="text-[#B5A65F] font-bold mt-1.5 text-sm">
                        ●
                      </span>
                      <span dangerouslySetInnerHTML={{ __html: content }} />
                    </li>
                  );
                })}
              </ListTag>
            );
          case "image":
            return (
              <figure key={block.id} className="my-10 w-full group">
                <div className="overflow-hidden rounded-xl shadow-sm border border-gray-100 bg-gray-50 text-center">
                  <OptimizedImage
                    src={block.data.file.url}
                    alt={block.data.caption || "Image"}
                    width={800}
                    height={600}
                    className="w-auto max-w-full max-h-[80vh] mx-auto"
                  />
                </div>
                {block.data.caption && (
                  <figcaption className="text-center text-gray-500 text-sm mt-3 italic">
                    {block.data.caption}
                  </figcaption>
                )}
              </figure>
            );
          case "quote":
            return (
              <blockquote
                key={block.id}
                className="relative p-8 my-8 bg-[#fffdf5] border border-[#B5A65F]/30 rounded-xl text-center font-noto"
              >
                <span className="text-5xl text-[#B5A65F] absolute -top-4 left-4 bg-[#fffdf5] px-2 leading-none font-serif">
                  ❝
                </span>
                <p className="text-xl italic text-gray-800 font-medium leading-relaxed px-4 pt-2">
                  {block.data.text}
                </p>
                <span className="text-5xl text-[#B5A65F] absolute -bottom-6 right-4 bg-[#fffdf5] px-2 leading-none font-serif">
                  ❞
                </span>
                {block.data.caption && (
                  <div className="mt-4 text-[#B5A65F] font-bold text-xs tracking-widest uppercase border-t border-[#B5A65F]/20 inline-block pt-2">
                    — {block.data.caption}
                  </div>
                )}
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

const RightSidebar = ({
  relatedPosts,
  upcomingEvent,
}: {
  relatedPosts: any[];
  upcomingEvent: any;
}) => {
  return (
    <div className="space-y-8 font-noto">
      {/* Box 1: Intro */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">
          Về Webie News
        </h4>
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          Chuyên trang cập nhật xu hướng công nghệ sự kiện, bí quyết tổ chức và
          những câu chuyện thành công.
        </p>
        <div className="flex flex-wrap gap-2">
          {["#EventTech", "#AI", "#Hybrid", "#Tips"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 text-xs text-gray-600 rounded-full hover:bg-[#B5A65F] hover:text-white cursor-pointer transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
          <TrendingUp size={18} className="text-[#B5A65F]" />
          <h4 className="font-bold text-gray-900 uppercase text-sm tracking-wider">
            Tin nổi bật
          </h4>
        </div>
        <div className="space-y-6">
          {relatedPosts && relatedPosts.length > 0 ? (
            relatedPosts.slice(0, 4).map((post) => (
              <Link
                to={`/news/${post.slug || post.id}`}
                key={post.id}
                className="group cursor-pointer flex gap-4 items-start"
              >
                <div className="w-20 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-100">
                  <OptimizedImage
                    src={post.thumbnailUrl}
                    alt={post.title}
                    width={80}
                    height={64}
                    className="w-full h-full"
                    imgClassName="group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div>
                  <h5 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-[#B5A65F] transition-colors line-clamp-2">
                    {post.title}
                  </h5>
                  <span className="text-[10px] text-gray-400 mt-1 block font-bold uppercase">
                    {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-400 text-xs text-center italic">
              Đang cập nhật...
            </p>
          )}
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden aspect-3/4 group cursor-pointer shadow-lg">
        {upcomingEvent ? (
          <Link
            to={`/event/${upcomingEvent.slug || upcomingEvent.eventId}`}
            className="block w-full h-full"
          >
            <OptimizedImage
              src={upcomingEvent.bannerImageUrl || upcomingEvent.thumbnailUrl}
              alt={upcomingEvent.eventName || "Event"}
              width={400}
              height={533}
              className="w-full h-full"
              imgClassName="transition-transform duration-700 group-hover:scale-110"
              fallback="https://via.placeholder.com/600x800"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
              <div className="bg-[#B5A65F] w-fit px-2 py-1 rounded text-[10px] font-black uppercase mb-2 text-black">
                Sự kiện sắp tới
              </div>
              <h4 className="text-xl font-bold leading-tight mb-2 drop-shadow-md line-clamp-2">
                {upcomingEvent.eventName || upcomingEvent.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Calendar size={12} className="text-[#B5A65F]" />
                {new Date(upcomingEvent.startDate).toLocaleDateString("vi-VN")}
              </div>
              {upcomingEvent.location && (
                <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                  <MapPin size={12} className="text-[#B5A65F]" />
                  <span className="truncate">{upcomingEvent.location}</span>
                </div>
              )}
            </div>
          </Link>
        ) : (
          <>
            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80"
              className="w-full h-full object-cover"
              alt="Ads"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-[#B5A65F] text-xs font-bold uppercase mb-2">
                Webie Events
              </span>
              <h4 className="text-xl font-bold leading-tight">
                Đăng ký tham gia các sự kiện đẳng cấp ngay hôm nay!
              </h4>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const NewsDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const {
    postDetail,
    data: relatedPosts,
    loading: loadingNews,
  } = useSelector((state: RootState) => state.news);
  const { data: eventsList } = useSelector((state: RootState) => state.events);

  const scrollProgress = useScrollProgress();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (slug) dispatch(fetchPostBySlug(slug));

    dispatch(fetchPublicPosts({ page: 0, size: 5 }));

    dispatch(fetchPublicEvents());

    return () => {
      dispatch(clearPostDetail());
    };
  }, [slug, dispatch]);

  const getUpcomingEvent = () => {
    if (!eventsList || eventsList.length === 0) return null;

    const now = new Date();
    const upcoming = eventsList.filter(
      (e: any) => new Date(e.startDate) >= now,
    );

    upcoming.sort(
      (a: any, b: any) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

    return upcoming.length > 0
      ? upcoming[0]
      : eventsList[eventsList.length - 1];
  };

  const upcomingEvent = getUpcomingEvent();

  if (loadingNews || !postDetail) return <LoadingScreen />;

  return (
    <>
      <style>{styles}</style>
      <div className="bg-[#FAFAFA] min-h-screen font-noto text-gray-800 selection:bg-[#B5A65F] selection:text-white">
        <div
          className="fixed top-0 left-0 h-1 bg-[#B5A65F] z-50 transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        ></div>

        <header className="relative w-full h-[60vh] min-h-[500px] overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <OptimizedImage
              src={postDetail.thumbnailUrl}
              alt={postDetail.title}
              width={1920}
              height={800}
              priority={true}
              className="w-full h-full"
              imgClassName="animate-zoom-slow origin-center"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-black/30"></div>
          </div>

          <div className="absolute top-24 left-0 w-full px-6 z-20">
            <div className="max-w-7xl mx-auto">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-full transition-all text-sm font-bold uppercase tracking-wider border border-white/20"
              >
                <ArrowLeft size={16} /> Quay lại
              </Link>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full px-6 pb-16 z-20">
            <div className="max-w-4xl mx-auto text-center animate-fade-up">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-8 drop-shadow-xl font-noto">
                {postDetail.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-300 animate-fade-up-delay">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-[#B5A65F]" />
                  <span>{postDetail.authorName || "Webie Team"}</span>
                </div>
                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#B5A65F]" />
                  <span>
                    {new Date(postDetail.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#B5A65F]" />
                  <span>5 phút đọc</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-10 relative z-30">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar Left */}
            <div className="hidden lg:block w-16 shrink-0 pt-2">
              <div className="sticky top-32 flex flex-col gap-4 items-center">
                <span className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-gray-100 text-gray-400 mb-2">
                  <Share2 size={18} />
                </span>
                <button className="w-10 h-10 rounded-full bg-white border border-gray-100 text-gray-500 hover:text-blue-600 hover:border-blue-600 flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                  <Facebook size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-white border border-gray-100 text-gray-500 hover:text-sky-500 hover:border-sky-500 flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                  <Twitter size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-white border border-gray-100 text-gray-500 hover:text-blue-800 hover:border-blue-800 flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                  <Linkedin size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-white border border-gray-100 text-gray-500 hover:text-gray-900 hover:border-gray-900 flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                  <LinkIcon size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 min-w-0">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider mb-8 overflow-hidden">
                <Link to="/" className="hover:text-[#B5A65F] shrink-0">
                  Trang chủ
                </Link>
                <ChevronRight size={12} />
                <Link to="/news" className="hover:text-[#B5A65F] shrink-0">
                  Tin tức
                </Link>
                <ChevronRight size={12} />
                <span className="text-[#B5A65F] truncate">Chi tiết</span>
              </div>

              {/* Sapo */}
              <div className="bg-[#FAFAFA] border-l-4 border-[#B5A65F] p-6 mb-10 rounded-r-lg">
                <p className="text-xl font-noto italic text-gray-700 leading-relaxed">
                  {postDetail.summary}
                </p>
              </div>

              <NewsContentRenderer content={postDetail.content} />

              <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
                <Tag size={16} className="text-[#B5A65F] mt-1" />
                {["Sự kiện", "Công nghệ", "Tin tức"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-xs text-gray-600 rounded hover:bg-[#B5A65F] hover:text-white cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-80 shrink-0">
              <div className="sticky top-32">
                <RightSidebar
                  relatedPosts={relatedPosts}
                  upcomingEvent={upcomingEvent}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsDetail;
