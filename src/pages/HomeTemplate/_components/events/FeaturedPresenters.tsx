import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import apiService from "@/services/apiService";
import OptimizedImage from "@/components/ui/OptimizedImage";

const DEFAULT_AVATAR =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

export default function FeaturedPresenters() {
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
    <section className="py-24 bg-[#050505] border-t border-[rgba(255,255,255,0.05)] font-noto relative overflow-hidden selection:bg-[rgba(216,201,123,0.3)]">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[rgba(216,201,123,0.05)] rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black text-white mt-2 uppercase tracking-wide">
            KHÁCH MỜI{" "}
            <span className="text-[rgba(0,0,0,0)] bg-clip-text bg-linear-to-r from-[#D8C97B] to-[#F4E2A6]">
              NỔI BẬT
            </span>
          </h2>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 bg-[#121212] rounded-3xl animate-pulse border border-[rgba(255,255,255,0.05)]"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {presenters.map((p, idx) => (
              <motion.div
                key={p.presenterId}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-[#121212] rounded-[2.5rem] p-8 text-center border border-[rgba(255,255,255,0.05)] hover:border-[rgba(216,201,123,0.5)] transition-all duration-300 hover:bg-[#1a1a1a]"
              >
                <div className="relative mb-6 inline-block">
                  <div className="absolute inset-0 bg-[rgba(216,201,123,1)] rounded-full blur-[10px] opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                  <OptimizedImage
                    src={p.avatarUrl}
                    alt={p.fullName}
                    width={128}
                    height={128}
                    className="relative w-32 h-32 mx-auto rounded-full border-2 border-[rgba(255,255,255,0.1)] group-hover:border-[#D8C97B] transition-colors duration-300"
                    fallback={DEFAULT_AVATAR}
                  />
                </div>

                <h3 className="text-xl font-bold text-white uppercase group-hover:text-[#D8C97B] transition-colors">
                  {p.fullName}
                </h3>
                <p className="text-xs text-[#D8C97B] font-bold tracking-widest uppercase mt-2 mb-4">
                  {p.title || "Speaker"}
                </p>

                <div className="h-px w-10 bg-[rgba(255,255,255,0.1)] mx-auto mb-4 group-hover:w-full group-hover:bg-[rgba(216,201,123,0.3)] transition-all duration-500" />

                <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed font-light">
                  {p.bio ||
                    "Chuyên gia hàng đầu trong lĩnh vực công nghệ và sự kiện."}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
