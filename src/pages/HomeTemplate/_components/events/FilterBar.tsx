import { useEffect, useState, useRef } from "react";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaUserTie,
  FaFilter,
  FaChevronDown,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import apiService from "@/services/apiService";

interface Option {
  label: string;
  value: string | number;
}

const CustomDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  icon,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabel =
    options.find((o: Option) => o.value === value)?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full md:w-60 font-noto" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-300 ${
          isOpen
            ? "bg-[#1a1a1a] border-[#D8C97B] text-[#D8C97B]"
            : "bg-black/40 border-white/5 text-gray-400 hover:border-white/20 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <span className={isOpen ? "text-[#D8C97B]" : "text-gray-500"}>
            {icon}
          </span>
          <span className="truncate text-sm font-bold uppercase tracking-wider">
            {selectedLabel}
          </span>
        </div>
        <FaChevronDown
          className={`text-[10px] transition-transform duration-300 ${
            isOpen ? "rotate-180 text-[#D8C97B]" : "text-gray-600"
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#161616] border border-[#D8C97B]/20 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto"
          >
            <li
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="px-5 py-3 text-xs uppercase font-bold text-gray-500 hover:text-white hover:bg-white/5 cursor-pointer border-b border-white/5 tracking-wider"
            >
              {placeholder}
            </li>
            {options.map((opt: Option) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-5 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between group ${
                  value === opt.value
                    ? "text-[#D8C97B] bg-[#D8C97B]/5 font-bold"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {opt.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FilterBar({ searchTerm, setSearchTerm }: any) {
  const [presenters, setPresenters] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedPresenter, setSelectedPresenter] = useState("");

  useEffect(() => {
    apiService
      .get("/presenters")
      .then((res: any) => {
        const data = Array.isArray(res) ? res : res.content || [];
        setPresenters(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="relative -mt-12 mb-24 z-40 px-4 container mx-auto font-noto">
      <div className="bg-[#121212]/90 backdrop-blur-2xl border border-white/10 rounded-4xl p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] flex flex-col lg:flex-row gap-4 items-center justify-between ring-1 ring-[#D8C97B]/10">
        <div className="flex-1 w-full relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <FaSearch className="text-gray-600 group-focus-within:text-[#D8C97B] transition-colors" />
          </div>
          <input
            type="text"
            placeholder="TÌM KIẾM SỰ KIỆN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-14 pr-4 py-4 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-gray-600 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-[#D8C97B]/50 focus:bg-black/60 transition-all"
          />
        </div>

        <div className="w-px h-12 bg-white/5 hidden lg:block mx-2" />

        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
          <CustomDropdown
            options={[
              { label: "Hồ Chí Minh", value: "HCM" },
              { label: "Hà Nội", value: "HN" },
              { label: "Online", value: "Online" },
            ]}
            value={selectedLocation}
            onChange={setSelectedLocation}
            placeholder="ĐỊA ĐIỂM"
            icon={<FaMapMarkerAlt />}
          />

          <CustomDropdown
            options={presenters.map((p) => ({
              label: p.fullName,
              value: p.presenterId,
            }))}
            value={selectedPresenter}
            onChange={setSelectedPresenter}
            placeholder="DIỄN GIẢ"
            icon={<FaUserTie />}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-linear-to-r from-[#D8C97B] to-[#F4E2A6] text-black font-black uppercase tracking-widest rounded-2xl shadow-lg hover:shadow-[#D8C97B]/30 transition-all flex items-center justify-center gap-2"
          >
            <FaFilter className="text-sm" />
            <span className="text-xs">Lọc</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
