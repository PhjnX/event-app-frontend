import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import apiService from "@/services/apiService";

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
    <section className="py-24 bg-[#050505] border-t border-white/5 font-noto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D8C97B]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#D8C97B] text-xs font-bold tracking-[0.3em] uppercase border-b border-[#D8C97B] pb-1 mb-4 inline-block">
            Speakers
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white mt-2 uppercase tracking-wide">
            DIỄN GIẢ{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#D8C97B] to-[#F4E2A6]">
              NỔI BẬT
            </span>
          </h2>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 bg-[#121212] rounded-3xl animate-pulse"
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
                className="group relative bg-[#121212] rounded-4xl p-8 text-center border border-white/5 hover:border-[#D8C97B]/50 transition-all duration-300 hover:bg-[#1a1a1a]"
              >
                <div className="relative mb-6 inline-block">
                  <div className="absolute inset-0 bg-[#D8C97B] rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                  <img
                    src={p.avatarUrl || DEFAULT_AVATAR}
                    onError={(e: any) => (e.target.src = DEFAULT_AVATAR)}
                    className="relative w-32 h-32 mx-auto rounded-full object-cover border-2 border-white/10 group-hover:border-[#D8C97B] transition-colors duration-300 filter"
                  />
                </div>

                <h3 className="text-xl font-bold text-white uppercase group-hover:text-[#D8C97B] transition-colors">
                  {p.fullName}
                </h3>
                <p className="text-xs text-[#D8C97B] font-bold tracking-widest uppercase mt-2 mb-4">
                  {p.title || "Speaker"}
                </p>
                <div className="h-px w-10 bg-white/10 mx-auto mb-4 group-hover:w-full group-hover:bg-[#D8C97B]/30 transition-all duration-500" />
                <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                  {p.bio || "Chuyên gia hàng đầu trong lĩnh vực công nghệ."}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
