import { useEffect, useState, useRef, type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "../../../utils/i18n-router";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../../store";
import { SeoHelmet } from "@/components/common/SeoHelmet";
import { toast } from "react-toastify";
import {
  fetchPostBySlug,
  fetchPublicPosts,
  clearPostDetail,
} from "../../../store/slices/newsSlice";
import { fetchPublicEvents } from "../../../store/slices/eventSlice";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Calendar,
  User,
  ArrowLeft,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  Clock,
  ChevronRight,
  TrendingUp,
  Tag,
  MapPin,
  Check,
  BookOpen,
  Phone,
  Mail,
  Globe,
  ArrowRight,
} from "lucide-react";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { useTranslation } from "react-i18next";
import logoEms from "@/assets/images/Logo_EMS.webp";

const DOMAIN = "https://ems.webie.com.vn";

const styles = `
  :root {
    --gold: #B8960C;
    --gold-light: #D4AE1A;
    --gold-dark: #8A6F00;
    --gold-dim: rgba(184,150,12,0.09);
    --gold-border: rgba(184,150,12,0.22);
    --page-bg: #F7F5F0;
    --surface: #FFFFFF;
    --surface-2: #F3F1EC;
    --surface-3: #EAE7E0;
    --text: #1A1714;
    --text-sub: #4A4540;
    --text-body: #3A3530;
    --text-muted: #8A8480;
    --text-dim: #B0ADA8;
    --border: rgba(0,0,0,0.07);
    --border-med: rgba(0,0,0,0.11);
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
    --shadow-lg: 0 8px 32px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.04);
  }

  /* Reading progress */
  .rp-bar {
    position: fixed; top: 0; left: 0; z-index: 9999;
    height: 3px;
    background: linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light), var(--gold));
    background-size: 200%;
    animation: rp-shimmer 3s linear infinite;
    transition: width 0.08s linear;
    box-shadow: 0 0 10px rgba(184,150,12,0.5);
  }
  @keyframes rp-shimmer {
    from { background-position: 0% 0; }
    to   { background-position: 200% 0; }
  }

  /* Hero */
  .hero-wrap {
    position: relative; width: 100%;
    height: 100vh; min-height: 700px; max-height: 1040px;
    overflow: hidden; background: #111;
  }
  .hero-grain {
    position: absolute; inset: 0; z-index: 3; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
    opacity: 0.35; mix-blend-mode: overlay;
  }

  /* Page */
  .page-light {
    background: var(--page-bg);
    min-height: 100vh;
    color: var(--text);
  }

  .article-open { background: transparent; position: relative; }
  .article-section { background: var(--surface); padding: 0; }

  .article-content-pad { padding-left: 0; padding-right: 0; }
  .article-content-pad-top    { padding-top:    48px; }
  .article-content-pad-bottom { padding-bottom: 48px; }
  @media (min-width: 768px) {
    .article-content-pad-top    { padding-top:    64px; }
    .article-content-pad-bottom { padding-bottom: 64px; }
  }

  /* ── Typography */
  .article-body { color: var(--text-body); }
  .article-body p {
    font-size: 17.5px; line-height: 2;
    margin-bottom: 1.7rem;
    color: var(--text-body);
    text-align: justify;
  }
  .article-body h2 {
    font-size: clamp(1.35rem, 2.4vw, 1.85rem);
    font-weight: 800; color: var(--text);
    margin: 3.5rem 0 1.2rem;
    letter-spacing: -0.025em; line-height: 1.3;
    padding: 0.85rem 1.2rem 0.85rem 1.4rem;
    background: linear-gradient(90deg, rgba(184,150,12,0.07) 0%, rgba(184,150,12,0.01) 100%);
    border-left: 3px solid var(--gold);
    border-radius: 0 12px 12px 0; display: block;
  }
  .article-body h2::before { display: none; }
  .article-body h3 {
    font-size: 1.05rem; font-weight: 800; color: var(--text);
    margin: 2.5rem 0 0.6rem; letter-spacing: -0.01em; display: block;
  }
  .article-body h3::before { display: none; }

  /* ── Image */
  .img-block { width: 100%; margin: 3rem 0; position: relative; }
  .img-block-frame { position: relative; overflow: hidden; background: #050505; line-height: 0; border-radius: 5px; }
  .img-block-frame::before, .img-block-frame::after {
    content: ''; position: absolute; left: 0; right: 0; z-index: 2; height: 1px;
    background: linear-gradient(90deg, transparent 0%, var(--gold-border) 20%, rgba(184,150,12,0.45) 50%, var(--gold-border) 80%, transparent 100%);
    pointer-events: none;
  }
  .img-block-frame::before { top: 0; }
  .img-block-frame::after  { bottom: 0; }
  .img-block-img { width: 100%; height: auto; display: block; transition: transform 1s cubic-bezier(0.22,1,0.36,1), filter 0.5s ease; filter: brightness(0.97); }
  .img-block-frame:hover .img-block-img { transform: scale(1.02); filter: brightness(1.02); }
  .img-caption { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 10px 24px 12px; background: var(--surface-2); border-top: 1px solid var(--border); }
  .img-caption-text { font-size: 12.5px; font-style: italic; color: var(--text-muted); text-align: center; line-height: 1.5; letter-spacing: 0.01em; }

  /* ── Quote */
  .dq {
    position: relative; margin: 2.5rem 0;
    padding: 2rem 2rem 2rem 2.5rem;
    background: linear-gradient(135deg, rgba(184,150,12,0.055) 0%, rgba(184,150,12,0.01) 100%);
    border-left: 3px solid var(--gold); border-radius: 0 14px 14px 0;
    border-top: 1px solid rgba(184,150,12,0.12); border-bottom: 1px solid rgba(184,150,12,0.12); border-right: 1px solid var(--border);
  }
  .dq-mark { position: absolute; top: -14px; left: 12px; font-size: 72px; line-height: 1; color: var(--gold); opacity: 0.15; font-family: Georgia, serif; pointer-events: none; user-select: none; }

  /* ── List */
  .dl { background: transparent; border: none; border-radius: 0; padding: 0.25rem 0; margin: 1.5rem 0; }
  .dl li { display: flex; gap: 12px; align-items: flex-start; padding: 6px 0; color: var(--text-body); font-size: 16px; line-height: 1.75; border-bottom: none; }
  .dl li:last-child { border-bottom: none; }
  .dl-dot { margin-top: 10px; width: 5px; height: 5px; border-radius: 50%; background: #1A1714; flex-shrink: 0; }

  /* ── Lead */
  .lead-box { border-left: 2px solid var(--gold); padding: 0.25rem 0 0.25rem 1.4rem; margin-bottom: 2.5rem; }
  .lead-text { font-size: 19px; font-style: italic; line-height: 1.85; color: var(--text-sub); }

  /* ── Diamond divider */
  .dv-wrap { display: flex; align-items: center; gap: 14px; margin: 2.5rem 0; }
  .dv-line { flex: 1; height: 1px; background: linear-gradient(to right, transparent, var(--border-med), transparent); }
  .dv-diamond { width: 7px; height: 7px; background: var(--gold); transform: rotate(45deg); box-shadow: 0 0 8px rgba(184,150,12,0.5); flex-shrink: 0; }

  /* ── Byline */
  .s-card { background: var(--surface); border: 1px solid var(--border-med); border-radius: 16px; box-shadow: var(--shadow-sm); }

  /* Related sidebar */
  .rel-thumb { transition: transform 0.5s cubic-bezier(0.22,1,0.36,1); }
  .rel-row:hover .rel-thumb { transform: scale(1.08); }
  .rel-title { color: var(--text-sub); transition: color 0.2s; }
  .rel-row:hover .rel-title { color: var(--gold-dark); }

  /* Tag pill */
  .tag-p { padding: 3px 11px; border-radius: 999px; background: var(--surface-2); border: 1px solid var(--border-med); font-size: 11px; color: var(--text-muted); cursor: pointer; transition: all 0.2s ease; font-family: inherit; }
  .tag-p:hover { background: var(--gold-dim); border-color: var(--gold); color: var(--gold-dark); transform: translateY(-1px); }

  /* Share btn */
  .sh-btn { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--border-med); background: var(--surface); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.22s cubic-bezier(0.22,1,0.36,1); box-shadow: var(--shadow-sm); }
  .sh-btn:hover { transform: translateY(-3px) scale(1.1); border-color: var(--gold); color: var(--gold-dark); background: var(--gold-dim); box-shadow: 0 4px 12px rgba(184,150,12,0.18); }
  .sh-btn:active { transform: scale(0.93); }
  .sh-btn.copied { border-color: #16a34a; color: #16a34a; background: rgba(22,163,74,0.06); }

  /* Event card */
  .ev-card { position: relative; border-radius: 16px; overflow: hidden; cursor: pointer; border: 1px solid var(--border-med); box-shadow: var(--shadow-md); }
  .ev-card .ev-img { transition: transform 0.7s cubic-bezier(0.22,1,0.36,1); }
  .ev-card:hover .ev-img { transform: scale(1.06); }

  /* Scroll hint */
  @keyframes sc-bounce { 0%,100%{transform:translateY(0);opacity:.5;} 50%{transform:translateY(7px);opacity:1;} }
  .sc-arrow { animation: sc-bounce 2s ease-in-out infinite; }

  /* Back btn */
  .back-b { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.5); transition: color 0.2s; }
  .back-b:hover { color: rgba(255,255,255,0.92); }
  .back-circle { width: 30px; height: 30px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .back-b:hover .back-circle { border-color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.1); }

  .article-body-wrap { background: transparent; }

  /* ── Links inside article content */
  .article-body a { color: var(--gold-dark); font-weight: 600; text-decoration: underline; text-decoration-color: rgba(184,150,12,0.35); text-underline-offset: 3px; transition: color 0.2s, text-decoration-color 0.2s; }
  .article-body a:hover { color: var(--gold); text-decoration-color: var(--gold); }

  /* ── Tags footer */
  .tags-footer { padding: 24px 0 0; margin-top: 16px; border-top: 1px solid var(--border-med); display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }

  /* ── Contact strip */
  .contact-strip {
    margin-top: 2.5rem;
    padding: 1.1rem 0 1.1rem 1.4rem;
    border-left: 2px solid var(--gold-border);
    display: flex; flex-wrap: wrap; align-items: center;
    gap: 0 0;
  }
  .contact-link {
    display: inline-flex; align-items: center; gap: 6px;
    text-decoration: none !important;
    transition: color 0.18s;
    padding: 3px 0;
  }
  .contact-link:hover { color: var(--gold-dark) !important; }
  .contact-sep {
    width: 1px; height: 14px; background: var(--border-med);
    margin: 0 16px; flex-shrink: 0;
  }

  /* ── Article byline */
  .article-byline {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 12px;
    padding: 16px 0;
    margin-top: 8px;
    border-top: 1px solid var(--border);
  }

  /* ── Related bottom section */
  .related-bottom {
    margin-top: 3.5rem;
    padding-top: 2.5rem;
    border-top: 2px solid var(--border-med);
  }
  .related-bottom-header {
    display: flex; align-items: center; gap: 12px; margin-bottom: 1.75rem;
  }
  .related-bottom-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 16px;
  }
  @media (min-width: 640px) {
    .related-bottom-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 1024px) {
    .related-bottom-grid { grid-template-columns: repeat(3, 1fr); }
  }
  .rel-bottom-card {
    background: var(--surface);
    border: 1px solid var(--border-med);
    border-radius: 14px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
    text-decoration: none !important;
    display: flex; flex-direction: column;
  }
  .rel-bottom-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--gold-border);
  }
  .rel-bottom-img-wrap {
    position: relative; overflow: hidden;
    aspect-ratio: 16/9; background: var(--surface-2);
  }
  .rel-bottom-img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.22,1,0.36,1);
  }
  .rel-bottom-card:hover .rel-bottom-img { transform: scale(1.06); }
  .rel-bottom-body { padding: 14px 16px 16px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .rel-bottom-title {
    font-size: 14px; font-weight: 700; line-height: 1.45;
    color: var(--text-sub); display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    transition: color 0.2s;
  }
  .rel-bottom-card:hover .rel-bottom-title { color: var(--gold-dark); }
  .rel-bottom-meta { display: flex; align-items: center; gap: 6px; margin-top: auto; }
  .rel-bottom-arrow {
    width: 26px; height: 26px; border-radius: 50%;
    background: var(--gold-dim); border: 1px solid var(--gold-border);
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s; flex-shrink: 0;
    margin-left: auto;
  }
  .rel-bottom-card:hover .rel-bottom-arrow {
    background: var(--gold); border-color: var(--gold);
  }
  .rel-bottom-card:hover .rel-bottom-arrow svg { color: white; }
`;

/* ─────────────────────────────────────────────────── */
const LoadingScreen = () => {
  const { t } = useTranslation();
  return (
    <div
      style={{ background: "#0C0C0C" }}
      className="flex flex-col h-screen w-full items-center justify-center fixed inset-0 z-50"
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          className="w-24 h-24 rounded-full"
          style={{
            border: "2px solid rgba(209,196,131,0.12)",
            borderTopColor: "#D1C483",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-14 h-14 rounded-full"
          style={{
            border: "2px solid rgba(209,196,131,0.08)",
            borderBottomColor: "#E8D99A",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-2 h-2 rounded-full"
          style={{ background: "#D1C483", boxShadow: "0 0 12px #D1C483" }}
          animate={{ scale: [1, 1.7, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      <motion.p
        className="mt-8 font-noto font-bold tracking-[0.3em] text-sm uppercase"
        style={{ color: "#D1C483" }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {t("news_page.detail.loading")}
      </motion.p>
    </div>
  );
};

const useScrollProgress = () => {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return p;
};

const ParallaxHero = ({
  src,
  alt,
  title,
  date,
  readTime,
  onBack,
  backLabel,
}: {
  src: string;
  alt: string;
  title: string;
  date: string;
  readTime: string;
  onBack: () => void;
  backLabel: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const rawY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const scaleVal = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.65], [0, -40]);
  const ySpring = useSpring(rawY, { stiffness: 60, damping: 18 });
  const scaleSpring = useSpring(scaleVal, { stiffness: 60, damping: 18 });

  return (
    <div ref={ref} className="hero-wrap">
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{ scale: scaleSpring }}
      >
        <motion.div className="absolute inset-0" style={{ y: ySpring }}>
          <OptimizedImage
            src={src}
            alt={alt}
            width={1920}
            height={1080}
            priority
            className="w-full h-full"
            imgClassName="w-full h-full object-cover"
          />
        </motion.div>
      </motion.div>
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.8) 100%)",
        }}
      />
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.18) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.18) 100%)",
        }}
      />
      <div className="hero-grain" />
      <div className="absolute top-0 left-0 right-0 z-30 px-6 sm:px-10 pt-28">
        <div className="max-w-7xl mx-auto">
          <button onClick={onBack} className="back-b">
            <span className="back-circle">
              <ArrowLeft size={12} />
            </span>
            {backLabel}
          </button>
        </div>
      </div>
      <motion.div
        className="absolute inset-0 z-20 px-6 sm:px-10 flex items-center justify-center"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="max-w-4xl w-full text-center mt-20">
          <h1
            className="font-noto font-black text-white mb-8"
            style={{
              fontSize: "clamp(2rem, 4.5vw, 3.75rem)",
              lineHeight: 1.18,
              letterSpacing: "-0.02em",
              textShadow: "0 4px 40px rgba(0,0,0,0.7)",
            }}
          >
            {title}
          </h1>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span
              style={{
                width: 40,
                height: 1,
                background: "linear-gradient(to right, transparent, #D4AE1A)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                width: 5,
                height: 5,
                background: "#D4AE1A",
                transform: "rotate(45deg)",
                display: "inline-block",
                boxShadow: "0 0 6px rgba(212,174,26,0.6)",
              }}
            />
            <span
              style={{
                width: 40,
                height: 1,
                background: "linear-gradient(to left, transparent, #D4AE1A)",
                display: "inline-block",
              }}
            />
          </div>
          <div
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
            style={{ color: "rgba(237,232,220,0.55)" }}
          >
            <span className="flex items-center gap-2">
              <User size={13} style={{ color: "#D4AE1A" }} />
              <span style={{ color: "rgba(237,232,220,0.9)", fontWeight: 600 }}>
                Webie Vietnam
              </span>
            </span>
            <span
              className="w-px h-3"
              style={{ background: "rgba(255,255,255,0.2)" }}
            />
            <span className="flex items-center gap-2">
              <Calendar size={13} style={{ color: "#D4AE1A" }} />
              {date}
            </span>
            <span
              className="w-px h-3"
              style={{ background: "rgba(255,255,255,0.2)" }}
            />
            <span className="flex items-center gap-2">
              <BookOpen size={13} style={{ color: "#D4AE1A" }} />
              {readTime}
            </span>
          </div>
        </div>
      </motion.div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1">
        <span
          className="text-[9px] tracking-[0.25em] uppercase font-bold"
          style={{ color: "rgba(212,174,26,0.4)" }}
        >
          Scroll
        </span>
        <svg
          className="sc-arrow"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{ color: "rgba(212,174,26,0.45)" }}
        >
          <path
            d="M7 2v10M2 8l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

const ShareButtons = ({
  url,
  title,
  layout = "vertical",
}: {
  url: string;
  title: string;
  layout?: "vertical" | "horizontal";
}) => {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const open = (href: string) =>
    window.open(href, "_blank", "width=620,height=520,noopener,noreferrer");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const btns = [
    {
      label: "Facebook",
      icon: <Facebook size={14} />,
      fn: () =>
        open(`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`),
    },
    {
      label: "LinkedIn",
      icon: <Linkedin size={14} />,
      fn: () =>
        open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}&title=${enc(title)}`,
        ),
    },
    {
      label: copied ? "Copied" : "Copy",
      icon: copied ? <Check size={14} /> : <LinkIcon size={14} />,
      fn: copy,
      extra: copied ? "copied" : "",
    },
  ];
  if (layout === "horizontal") {
    return (
      <div className="flex items-center gap-3">
        <span
          className="text-[10px] font-black uppercase tracking-[0.2em] mr-1"
          style={{ color: "var(--text-muted)" }}
        >
          Share
        </span>
        {btns.map((b) => (
          <button
            key={b.label}
            aria-label={b.label}
            onClick={b.fn}
            className={`sh-btn ${b.extra ?? ""}`}
          >
            {b.icon}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        style={{
          width: 1,
          height: 20,
          background:
            "linear-gradient(to bottom, transparent, var(--gold-border))",
        }}
      />
      {btns.map((b) => (
        <button
          key={b.label}
          aria-label={b.label}
          onClick={b.fn}
          className={`sh-btn ${b.extra ?? ""}`}
        >
          {b.icon}
        </button>
      ))}
      <div
        style={{
          width: 1,
          height: 20,
          background:
            "linear-gradient(to bottom, var(--gold-border), transparent)",
        }}
      />
    </div>
  );
};

const autoLinkify = (html: string): string => {
  const emailRegex =
    /(?<!href=["'][^"']{0,200})([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g;
  return html.replace(emailRegex, '<a href="mailto:$1">$1</a>');
};

/* ── NewsContentRenderer — NO contact footer anymore, moved to ArticleFooter ── */
const NewsContentRenderer = ({ content }: { content: string }) => {
  const { t } = useTranslation();
  let blocks: any[] = [];
  try {
    blocks = JSON.parse(content).blocks || [];
  } catch {
    return (
      <p
        style={{ color: "#ef4444" }}
        className="article-content-pad py-4 font-noto"
      >
        {t("news_page.detail.error")}
      </p>
    );
  }

  return (
    <div className="article-body font-noto">
      {blocks.map((block: any) => {
        switch (block.type) {
          case "header": {
            const l = block.data.level;
            const Tag = `h${l}` as keyof JSX.IntrinsicElements;
            return (
              <Tag
                key={block.id}
                className="article-content-pad"
                dangerouslySetInnerHTML={{
                  __html: autoLinkify(block.data.text),
                }}
              />
            );
          }
          case "paragraph":
            return (
              <p
                key={block.id}
                className="article-content-pad"
                dangerouslySetInnerHTML={{
                  __html: autoLinkify(block.data.text),
                }}
              />
            );
          case "list":
            return (
              <ul key={block.id} className="dl article-content-pad">
                {block.data.items.map((item: any, i: number) => {
                  const html =
                    typeof item === "string"
                      ? item
                      : item.content || item.text || "";
                  return (
                    <li key={i}>
                      <span className="dl-dot" />
                      <span dangerouslySetInnerHTML={{ __html: html }} />
                    </li>
                  );
                })}
              </ul>
            );
          case "image": {
            const imgSrc = block.data.file?.url;
            const imgAlt = block.data.caption || "Image";
            if (!imgSrc) return null;
            return (
              <figure key={block.id} className="img-block">
                <div className="img-block-frame">
                  <OptimizedImage
                    src={imgSrc}
                    alt={imgAlt}
                    width={1600}
                    height={900}
                    className="w-full block"
                    imgClassName="img-block-img"
                  />
                </div>
                {block.data.caption && (
                  <figcaption className="img-caption">
                    <span className="img-caption-text">
                      {block.data.caption}
                    </span>
                  </figcaption>
                )}
              </figure>
            );
          }
          case "quote":
            return (
              <blockquote
                key={block.id}
                className="dq article-content-pad"
                style={{ paddingTop: "1.75rem", paddingBottom: "1.75rem" }}
              >
                <span className="dq-mark">❝</span>
                <p
                  className="relative text-xl italic leading-relaxed font-noto"
                  style={{
                    color: "var(--text-sub)",
                    fontWeight: 500,
                    marginBottom: 0,
                  }}
                >
                  {block.data.text}
                </p>
                {block.data.caption && (
                  <footer className="flex items-center gap-3 mt-4">
                    <span
                      style={{
                        width: 28,
                        height: 1,
                        background: "var(--gold)",
                        display: "inline-block",
                        borderRadius: 1,
                      }}
                    />
                    <cite
                      className="not-italic text-[11px] font-black uppercase tracking-widest"
                      style={{ color: "var(--gold-dark)" }}
                    >
                      {block.data.caption}
                    </cite>
                  </footer>
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

/* ── Contact strip — minimal editorial style ── */
const ContactCard = ({ lang }: { lang: string }) => {
  const isEn = lang === "en";
  return (
    <div className="contact-strip font-noto">
      <span
        className="text-[11px] font-black uppercase tracking-[0.18em] mr-5"
        style={{ color: "var(--gold-dark)", whiteSpace: "nowrap" }}
      >
        {isEn ? "Contact" : "Liên hệ"}
      </span>

      <a
        href="tel:0969838467"
        className="contact-link"
        style={{ color: "var(--text-sub)" }}
      >
        <Phone size={12} style={{ color: "var(--gold)", flexShrink: 0 }} />
        <span className="text-[13px] font-semibold">0969 838 467</span>
        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          – Huyen DANG
        </span>
      </a>

      <span className="contact-sep" />

      <a
        href="mailto:huyen.dang@webie.com.vn"
        className="contact-link"
        style={{ color: "var(--text-sub)" }}
      >
        <Mail size={12} style={{ color: "var(--gold)", flexShrink: 0 }} />
        <span className="text-[13px] font-semibold">
          huyen.dang@webie.com.vn
        </span>
      </a>

      <span className="contact-sep" />

      <a
        href="https://webie.com.vn"
        target="_blank"
        rel="noopener noreferrer"
        className="contact-link"
        style={{ color: "var(--text-sub)" }}
      >
        <Globe size={12} style={{ color: "var(--gold)", flexShrink: 0 }} />
        <span className="text-[13px] font-semibold">webie.com.vn</span>
      </a>
    </div>
  );
};

/* ── Article Footer: tags + share + contact + byline ── */
const ArticleFooter = ({
  tags,
  url,
  title,
  lang,
  dateStr,
}: {
  tags: string[];
  url: string;
  title: string;
  lang: string;
  dateStr: string;
}) => {
  return (
    <>
      {/* Tags */}
      {tags.length > 0 && (
        <div className="tags-footer">
          <Tag size={13} style={{ color: "var(--gold)", marginRight: 4 }} />
          {tags.map((tag) => (
            <span key={tag} className="tag-p">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Contact card */}
      <ContactCard lang={lang} />

      {/* Byline + share row */}
      <div className="article-byline font-noto">
        <div className="flex items-center gap-2">
          <img
            src={logoEms}
            alt="Webie Vietnam"
            className="w-5 h-5 object-contain opacity-70"
          />
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--text-sub)" }}
          >
            Webie Vietnam
          </span>
          <span className="text-xs" style={{ color: "var(--border-med)" }}>
            ·
          </span>
          <Clock size={11} style={{ color: "var(--gold)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {dateStr}
          </span>
        </div>
        <ShareButtons url={url} title={title} layout="horizontal" />
      </div>
    </>
  );
};

/* ── Related Posts — bottom grid section ── */
const RelatedPostsBottom = ({
  posts,
  currentSlug,
  lang,
  locale,
}: {
  posts: any[];
  currentSlug?: string;
  lang: string;
  locale: string;
}) => {
  const isEn = lang === "en";
  const filtered = posts
    ?.filter(Boolean)
    .filter((p) => p.slug !== currentSlug && p.id !== currentSlug)
    .slice(0, 3);

  if (!filtered?.length) return null;

  return (
    <div className="related-bottom font-noto">
      <div className="related-bottom-header">
        {/* Gold accent line */}
        <div
          style={{
            width: 3,
            height: 22,
            background: "var(--gold)",
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
        <div>
          <h3
            className="text-base font-black"
            style={{
              color: "var(--text)",
              letterSpacing: "-0.02em",
              marginBottom: 0,
            }}
          >
            {isEn ? "Related Articles" : "Bài viết liên quan"}
          </h3>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {isEn ? "Continue reading" : "Tiếp tục khám phá"}
          </p>
        </div>
      </div>

      <div className="related-bottom-grid">
        {filtered.map((post) => {
          const title =
            post.translations?.[lang === "en" ? "en" : "vi"]?.title ||
            post.translations?.vi?.title ||
            post.title ||
            "Bài viết";
          const href = `/news/${post.slug || post.id}`;
          const dateStr = new Date(post.createdAt).toLocaleDateString(locale, {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <Link to={href} key={post.id} className="rel-bottom-card">
              <div className="rel-bottom-img-wrap">
                <OptimizedImage
                  src={post.thumbnailUrl || "https://placehold.co/640x360"}
                  alt={title}
                  width={640}
                  height={360}
                  className="w-full h-full"
                  imgClassName="rel-bottom-img"
                />
                {/* Gold shimmer overlay on hover */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 60%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
              <div className="rel-bottom-body">
                <h4 className="rel-bottom-title font-noto">{title}</h4>
                <div className="rel-bottom-meta">
                  <Calendar
                    size={10}
                    style={{ color: "var(--gold)", flexShrink: 0 }}
                  />
                  <span
                    className="text-[11px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {dateStr}
                  </span>
                  <div className="rel-bottom-arrow">
                    <ArrowRight
                      size={11}
                      style={{ color: "var(--gold-dark)" }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

/* ── Right Sidebar ── */
const RightSidebar = ({
  relatedPosts,
  upcomingEvent,
  tags,
  currentSlug,
}: {
  relatedPosts: any[];
  upcomingEvent: any;
  tags: string[];
  currentSlug?: string;
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en-US" : "vi-VN";

  return (
    <div className="space-y-5 font-noto">
      <div className="s-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Tag size={13} style={{ color: "var(--gold)" }} />
          <h4
            className="text-[10px] font-black uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            {t("news_page.detail.sidebar.about_title")}
          </h4>
        </div>
        <p
          className="text-sm leading-relaxed mb-4"
          style={{ color: "var(--text-sub)" }}
        >
          {t("news_page.detail.sidebar.about_desc")}
        </p>
        <div className="flex flex-wrap gap-2">
          {tags?.length > 0 ? (
            tags.map((tag) => (
              <span key={tag} className="tag-p">
                #{tag}
              </span>
            ))
          ) : (
            <span
              className="text-xs italic"
              style={{ color: "var(--text-muted)" }}
            >
              Chưa có tag
            </span>
          )}
        </div>
      </div>

      <div className="s-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} style={{ color: "var(--gold)" }} />
          <h4
            className="text-[10px] font-black uppercase tracking-[0.18em]"
            style={{ color: "var(--text-muted)" }}
          >
            {t("news_page.detail.sidebar.related_title")}
          </h4>
        </div>
        <div>
          {relatedPosts
            ?.filter(Boolean)
            .filter(
              (post) => post.slug !== currentSlug && post.id !== currentSlug,
            )
            .slice(0, 4)
            .map((post, idx) => {
              const title =
                post.translations?.vi?.title || post.title || "Bài viết";
              return (
                <Link
                  to={`/news/${post.slug || post.id}`}
                  key={post.id}
                  className="rel-row flex gap-3 items-start py-4"
                  style={{
                    borderTop: idx === 0 ? "none" : "1px solid var(--border)",
                  }}
                >
                  <div
                    className="shrink-0 overflow-hidden rounded-lg"
                    style={{
                      width: 64,
                      height: 50,
                      border: "1px solid var(--border-med)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <OptimizedImage
                      src={post.thumbnailUrl || "https://placehold.co/100"}
                      alt={title}
                      width={64}
                      height={50}
                      className="w-full h-full"
                      imgClassName="rel-thumb w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="rel-title font-semibold text-[13px] leading-snug line-clamp-2 mb-1">
                      {title}
                    </h5>
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {new Date(post.createdAt).toLocaleDateString(locale)}
                    </span>
                  </div>
                </Link>
              );
            })}
          {(!relatedPosts || relatedPosts.filter(Boolean).length === 0) && (
            <p
              className="text-xs italic text-center py-5"
              style={{ color: "var(--text-muted)" }}
            >
              {t("news_page.detail.sidebar.updating")}
            </p>
          )}
        </div>
      </div>

      <div className="ev-card aspect-3/4">
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
              imgClassName="ev-img w-full h-full object-cover"
              fallback="https://placehold.co/600x800"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)",
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
              <span
                className="inline-block text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full mb-3"
                style={{ background: "var(--gold)", color: "#1A1714" }}
              >
                {t("news_page.detail.sidebar.upcoming_event_label")}
              </span>
              <h4
                className="font-bold leading-tight line-clamp-2 mb-2 text-white"
                style={{ fontSize: 15 }}
              >
                {upcomingEvent.eventName || upcomingEvent.title}
              </h4>
              <div
                className="flex items-center gap-1.5 text-xs mb-1"
                style={{ color: "rgba(237,232,220,0.55)" }}
              >
                <Calendar size={10} style={{ color: "var(--gold)" }} />
                {new Date(upcomingEvent.startDate).toLocaleDateString(locale)}
              </div>
              {upcomingEvent.location && (
                <div
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: "rgba(237,232,220,0.55)" }}
                >
                  <MapPin size={10} style={{ color: "var(--gold)" }} />
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
              alt="Event"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)",
              }}
            />
            <div className="absolute bottom-0 p-5 z-10 text-white">
              <span
                className="block text-[9px] font-black uppercase tracking-widest mb-2"
                style={{ color: "var(--gold-light)" }}
              >
                {t("news_page.detail.sidebar.ads_title")}
              </span>
              <h4 className="font-bold leading-tight" style={{ fontSize: 15 }}>
                {t("news_page.detail.sidebar.ads_desc")}
              </h4>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────── MAIN COMPONENT ─────────────────────── */
const NewsDetail = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "vi";
  const { slug } = useParams();
  const navigate = useNavigate();
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
    dispatch(fetchPublicPosts({ page: 0, size: 6, lang: currentLang }));
    dispatch(fetchPublicEvents());
    return () => {
      dispatch(clearPostDetail());
    };
  }, [dispatch, currentLang]);

  useEffect(() => {
    if (!slug) return;
    window.scrollTo({ top: 0, behavior: "instant" });
    dispatch(fetchPostBySlug({ slug, lang: currentLang }))
      .unwrap()
      .catch(() => {
        toast.warn(
          currentLang === "en"
            ? "This article is not available in English yet!"
            : "Bài viết chưa có bản dịch cho ngôn ngữ này!",
        );
        navigate(`/${currentLang}/news`, { replace: true });
      });
  }, [slug, currentLang, navigate, dispatch]);

  const getUpcomingEvent = () => {
    if (!eventsList?.length) return null;
    const now = new Date();
    const up = [...eventsList]
      .filter((e: any) => new Date(e.startDate) >= now)
      .sort(
        (a: any, b: any) => +new Date(a.startDate) - +new Date(b.startDate),
      );
    return up[0] ?? eventsList[eventsList.length - 1];
  };

  const upcomingEvent = getUpcomingEvent();
  const isStale =
    postDetail &&
    (postDetail.languageCode !== currentLang || postDetail.slug !== slug);
  if (loadingNews || !postDetail || isStale) return <LoadingScreen />;

  const displayTitle = postDetail.title || "";
  const displaySummary = postDetail.summary || "";
  const displayContent = postDetail.content || "{}";
  const seoTitle = postDetail.seoTitle || displayTitle;
  const seoDescription = postDetail.seoDescription || displaySummary;
  const postTags = Array.isArray(postDetail.tags)
    ? (postDetail.tags as string[])
    : [];
  const currentUrl = `${DOMAIN}/${currentLang}/news/${postDetail.slug || postDetail.id}`;
  const locale = i18n.language === "en" ? "en-US" : "vi-VN";
  const dateStr = new Date(postDetail.createdAt).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <SeoHelmet
        title={seoTitle}
        description={seoDescription}
        slug={`news/${postDetail.slug || postDetail.id}`}
        image={postDetail.thumbnailUrl}
        type="article"
        publishedAt={postDetail.createdAt}
        tags={postTags}
      />
      <style>{styles}</style>
      <div className="rp-bar" style={{ width: `${scrollProgress}%` }} />

      <div className="page-light">
        <ParallaxHero
          src={postDetail.thumbnailUrl}
          alt={displayTitle}
          title={displayTitle}
          date={dateStr}
          readTime={t("news_page.detail.read_time")}
          onBack={() => navigate(`/${currentLang}/news`)}
          backLabel={t("news_page.detail.back")}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col lg:flex-row gap-10 xl:gap-14">
            {/* Vertical share sidebar */}
            <aside className="hidden lg:flex flex-col items-center w-10 shrink-0 pt-1">
              <div className="sticky top-32">
                <ShareButtons url={currentUrl} title={displayTitle} />
              </div>
            </aside>

            {/* Main article */}
            <article className="flex-1 min-w-0">
              <div className="article-body-wrap">
                {/* Breadcrumb */}
                <nav
                  className="article-content-pad flex items-center gap-1.5 mb-8 flex-wrap"
                  style={{ paddingBottom: 0, paddingTop: "12px" }}
                >
                  {[
                    { label: t("news_page.detail.breadcrumb.home"), to: "/" },
                    {
                      label: t("news_page.detail.breadcrumb.news"),
                      to: "/news",
                    },
                  ].map(({ label, to }) => (
                    <span key={to} className="flex items-center gap-1.5">
                      <Link
                        to={to}
                        className="text-[11px] font-bold uppercase tracking-widest transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "var(--gold-dark)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "var(--text-muted)")
                        }
                      >
                        {label}
                      </Link>
                      <ChevronRight
                        size={9}
                        style={{ color: "var(--text-muted)" }}
                      />
                    </span>
                  ))}
                  <span
                    className="text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: "var(--gold-dark)" }}
                  >
                    {t("news_page.detail.breadcrumb.detail")}
                  </span>
                </nav>

                {/* Lead */}
                <div
                  className="article-content-pad lead-box"
                  style={{ marginTop: "2rem" }}
                >
                  <p className="lead-text font-noto">{displaySummary}</p>
                </div>

                {/* Divider */}
                <div className="article-content-pad">
                  <div className="dv-wrap">
                    <span className="dv-line" />
                    <div className="dv-diamond" />
                    <span className="dv-line" />
                  </div>
                </div>

                {/* Article content */}
                <NewsContentRenderer content={displayContent} />
              </div>

              {/* ── Article footer: tags + contact + byline ── */}
              <ArticleFooter
                tags={postTags}
                url={currentUrl}
                title={displayTitle}
                lang={currentLang}
                dateStr={dateStr}
              />

              {/* ── Related posts bottom grid ── */}
              <RelatedPostsBottom
                posts={relatedPosts}
                currentSlug={slug}
                lang={currentLang}
                locale={locale}
              />
            </article>

            {/* Right sidebar */}
            <aside className="w-full lg:w-72 xl:w-80 shrink-0">
              <div className="sticky top-28">
                <RightSidebar
                  relatedPosts={relatedPosts}
                  upcomingEvent={upcomingEvent}
                  tags={postTags}
                  currentSlug={slug}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsDetail;
