import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import apiService from "@/services/apiService";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { FaLinkedinIn, FaTwitter, FaFacebookF } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const DEFAULT_AVATAR =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

const BackgroundDecoration = () => (
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
);

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function FeaturedPresenters() {
  const { t } = useTranslation();

  const [presenters, setPresenters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiService
      .get("/presenters/featured")
      .then((res: any) => setPresenters(res))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && presenters.length === 0) return null;

  return (
    <section className="relative py-24 bg-[#020202] border-t border-white/5 font-noto overflow-hidden selection:bg-[rgba(216,201,123,0.3)]">
      <BackgroundDecoration />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-6xl font-black text-white mt-2 uppercase leading-snug drop-shadow-xl">
            {t("events_page.featured_presenters.title")}{" "}
            <span className="inline-block pt-2 pb-2 leading-normal text-transparent bg-clip-text bg-linear-to-r from-[#D8C97B] to-[#F4E2A6]">
              {t("events_page.featured_presenters.highlight")}
            </span>
          </h2>
          <p className="text-gray-400 text-lg mt-4 font-light max-w-2xl mx-auto">
            {t("events_page.featured_presenters.subtitle")}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-96 bg-[#111] rounded-3xl animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {presenters.map((p, idx) => (
              <motion.div
                key={p.presenterId}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-[#0a0a0a] rounded-4xl p-6 text-center border border-white/5 hover:border-[#D8C97B]/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(216,201,123,0.1)]"
              >
                <div className="relative mb-6 inline-block w-40 h-40">
                  <div className="absolute inset-0 rounded-full bg-[#D8C97B] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />

                  <div className="absolute inset-0 rounded-full border border-dashed border-[#D8C97B]/30 group-hover:border-[#D8C97B] group-hover:animate-spin-slow transition-colors duration-500" />

                  <div className="absolute inset-2 rounded-full overflow-hidden border-2 border-[#1a1a1a] group-hover:border-[#D8C97B] transition-colors duration-500 z-10">
                    <OptimizedImage
                      src={p.avatarUrl}
                      alt={p.fullName}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      fallback={DEFAULT_AVATAR}
                    />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white uppercase mb-1 group-hover:text-[#D8C97B] transition-colors">
                  {p.fullName}
                </h3>
                <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-4">
                  {p.title ||
                    t("events_page.featured_presenters.default_title")}
                </p>

                <div className="w-8 h-0.5 bg-[#D8C97B]/30 mx-auto mb-4 group-hover:w-16 group-hover:bg-[#D8C97B] transition-all duration-500" />

                <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed font-light mb-6">
                  {p.bio || t("events_page.featured_presenters.default_bio")}
                </p>

                <div className="flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                  <a
                    href="#"
                    className="text-gray-500 hover:text-[#D8C97B] transition-colors"
                  >
                    <FaLinkedinIn />
                  </a>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-[#D8C97B] transition-colors"
                  >
                    <FaTwitter />
                  </a>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-[#D8C97B] transition-colors"
                  >
                    <FaFacebookF />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </section>
  );
}
