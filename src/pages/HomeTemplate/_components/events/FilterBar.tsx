import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function FilterBar({
  searchTerm,
  setSearchTerm,
}: FilterBarProps) {
  const { t } = useTranslation();

  return (
    <div className="relative -mt-10 lg:-mt-14 z-40 px-4 container mx-auto font-noto mb-20">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-[#D8C97B]/20 to-[#F4E2A6]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-500 group-focus-within:opacity-100" />

          <div className="relative flex items-center bg-[#121212]/80 backdrop-blur-xl border border-[#D8C97B]/30 rounded-full p-2 shadow-2xl transition-all duration-300 ring-1 ring-white/5 group-focus-within:border-[#D8C97B] group-focus-within:ring-[#D8C97B]/50">
            <div className="pl-6 pr-4 text-gray-400 group-focus-within:text-[#D8C97B] transition-colors">
              <FaSearch className="text-xl" />
            </div>

            <input
              type="text"
              placeholder={t("events_page.filter_bar.placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-white placeholder-gray-500 text-base md:text-lg font-medium py-3 focus:outline-none tracking-wide"
            />

            <button className="hidden md:flex items-center justify-center whitespace-nowrap px-8 py-3 ml-2 bg-[#D8C97B] hover:bg-[#cbbd70] text-black font-bold text-sm uppercase tracking-widest rounded-full transition-all shadow-lg hover:shadow-[#D8C97B]/40 transform active:scale-95">
              {t("events_page.filter_bar.search_btn")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
