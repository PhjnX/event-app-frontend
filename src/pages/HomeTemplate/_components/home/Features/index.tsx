import {
  FaQrcode,
  FaUsers,
  FaChartPie,
  FaTicketAlt,
  FaClipboardList,
  FaCertificate,
} from "react-icons/fa";
import { motion, type Variants, type TargetAndTransition } from "framer-motion";

// 1. IMPORT
import { useTranslation, Trans } from "react-i18next";

const features = [
  {
    id: 1,
    icon: <FaQrcode className="text-3xl" />,
    color: "text-[#D8C97B]",
    bg: "bg-[rgba(216,201,123,0.2)]",
    animType: "pulse",
    // Dùng Key
    titleKey: "home.features.items.1.title",
    descKey: "home.features.items.1.desc",
  },
  {
    id: 2,
    icon: <FaUsers className="text-3xl" />,
    color: "text-blue-400",
    bg: "bg-[rgba(96,165,250,0.2)]",
    animType: "float",
    titleKey: "home.features.items.2.title",
    descKey: "home.features.items.2.desc",
  },
  {
    id: 3,
    icon: <FaChartPie className="text-3xl" />,
    color: "text-green-400",
    bg: "bg-[rgba(74,222,128,0.2)]",
    animType: "spin",
    titleKey: "home.features.items.3.title",
    descKey: "home.features.items.3.desc",
  },
  {
    id: 4,
    icon: <FaTicketAlt className="text-3xl" />,
    color: "text-red-400",
    bg: "bg-[rgba(248,113,113,0.2)]",
    animType: "shake",
    titleKey: "home.features.items.4.title",
    descKey: "home.features.items.4.desc",
  },
  {
    id: 5,
    icon: <FaClipboardList className="text-3xl" />,
    color: "text-purple-400",
    bg: "bg-[rgba(192,132,252,0.2)]",
    animType: "wiggle",
    titleKey: "home.features.items.5.title",
    descKey: "home.features.items.5.desc",
  },
  {
    id: 6,
    icon: <FaCertificate className="text-3xl" />,
    color: "text-orange-400",
    bg: "bg-[rgba(251,146,60,0.2)]",
    animType: "bounce",
    titleKey: "home.features.items.6.title",
    descKey: "home.features.items.6.desc",
  },
];

const iconVariants: Record<string, TargetAndTransition> = {
  spin: {
    rotate: 360,
    transition: { duration: 10, repeat: Infinity, ease: "linear" },
  },
  bounce: {
    y: [0, -8, 0],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
  pulse: {
    scale: [1, 1.15, 1],
    opacity: [1, 0.8, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  shake: {
    rotate: [0, -10, 10, -10, 0],
    transition: { duration: 2.5, repeat: Infinity, repeatDelay: 1 },
  },
  float: {
    y: [0, -6, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  wiggle: {
    rotate: [0, 15, -15, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
      repeatDelay: 0.5,
    },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};
const textVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export default function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 text-white font-noto overflow-hidden bg-[#020202] selection:bg-[rgba(216,201,123,0.3)]">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#020202]"></div>
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-[#020202] to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 max-w-5xl mx-auto relative pt-10">
          <motion.h2
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.5 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-6 leading-tight font-noto"
          >
            {t("home.features.title")}{" "}
            <span className="text-[#D8C97B] block md:inline">
              {t("home.features.highlight")}
            </span>
          </motion.h2>

          <motion.p
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.5 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-3xl mx-auto"
          >
            {/* KỸ THUẬT DÙNG TRANS ĐỂ GIỮ STYLE HTML TRONG BẢN DỊCH */}
            <Trans
              i18nKey="home.features.description"
              components={{
                1: (
                  <span className="text-white font-medium border-b border-[#D8C97B]/30" />
                ),
                3: (
                  <span className="text-white font-medium border-b border-[#D8C97B]/30" />
                ),
                5: (
                  <span className="text-white font-medium border-b border-[#D8C97B]/30" />
                ),
              }}
            />
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {features.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group relative bg-[rgba(10,10,10,0.6)] backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/5 transition-all duration-300 flex flex-col h-full hover:border-[#D8C97B]/40 shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${item.bg} ${item.color} shadow-lg ring-1 ring-[rgba(255,255,255,0.1)]`}
                >
                  <motion.div animate={iconVariants[item.animType]}>
                    {item.icon}
                  </motion.div>
                </div>
                <span className="text-5xl font-black text-white/5 group-hover:text-white/10 transition-colors pointer-events-none select-none font-noto">
                  0{item.id}
                </span>
              </div>

              {/* Dùng t() với Key và ép kiểu any */}
              <h3 className="text-lg md:text-xl font-bold uppercase mb-3 text-white group-hover:text-[#D8C97B] transition-colors">
                {t(item.titleKey as any)}
              </h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed grow group-hover:text-gray-300 transition-colors">
                {t(item.descKey as any)}
              </p>

              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D8C97B] group-hover:w-full transition-all duration-500 ease-out opacity-0 group-hover:opacity-100"></div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
