import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from "framer-motion";
import {
  FaUsers,
  FaCalendarCheck,
  FaBuilding,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaEllipsisH,
  FaSyncAlt,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// --- 1. MOCK DATA ---
const DATA_REVENUE = [
  { name: "T1", events: 40, revenue: 2400 },
  { name: "T2", events: 30, revenue: 1398 },
  { name: "T3", events: 50, revenue: 5800 },
  { name: "T4", events: 80, revenue: 3908 },
  { name: "T5", events: 70, revenue: 4800 },
  { name: "T6", events: 100, revenue: 7800 },
  { name: "T7", events: 130, revenue: 9500 },
];

const DATA_CATEGORY = [
  { name: "Hội thảo AI", value: 400 },
  { name: "Workshop", value: 300 },
  { name: "Triển lãm", value: 300 },
  { name: "Giải trí", value: 200 },
];

const COLORS = ["#D8C97B", "#F4D03F", "#ffffff", "#555555"];

const RECENT_EVENTS = [
  {
    id: 1,
    name: "Tech Summit 2025",
    organizer: "FPT Software",
    date: "10/12/2025",
    status: "Approved",
  },
  {
    id: 2,
    name: "AI Revolution Workshop",
    organizer: "VinAI",
    date: "12/12/2025",
    status: "Pending",
  },
  {
    id: 3,
    name: "Blockchain Global",
    organizer: "Coin98",
    date: "15/12/2025",
    status: "Rejected",
  },
  {
    id: 4,
    name: "EdTech Vietnam",
    organizer: "MindX",
    date: "20/12/2025",
    status: "Approved",
  },
];

// --- 2. COMPONENTS HIỆU ỨNG ---

// Component: Số nhảy (Count Up)
const AnimatedCounter = ({ value, prefix = "", suffix = "" }: any) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      // Parse value string "12,345" -> number 12345 để animate
      const numericValue = parseInt(value.toString().replace(/,/g, ""), 10);
      animate(motionValue, numericValue, { duration: 2, ease: "easeOut" });
    }
  }, [isInView, value, motionValue]);

  // Update text content trực tiếp để không re-render
  useEffect(() => {
    return rounded.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent =
          prefix + latest.toLocaleString("en-US") + suffix;
      }
    });
  }, [rounded, prefix, suffix]);

  return <span ref={ref} />;
};

// Component: Vòng tròn xoay công nghệ (Tech Spinner)
const TechSpinner = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
    {/* Vòng ngoài đứt đoạn */}
    <motion.div
      className="w-60 h-60 rounded-full border border-dashed border-[#D8C97B]/20"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
    {/* Vòng trong ngược chiều */}
    <motion.div
      className="absolute w-[180px] h-[180px] rounded-full border-t-2 border-b-2 border-transparent border-t-[#D8C97B]/30 border-b-[#D8C97B]/30"
      animate={{ rotate: -360 }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    />
    {/* Radar quét */}
    <motion.div
      className="absolute w-[200px] h-[200px] rounded-full bg-linear-to-t from-transparent via-[#D8C97B]/5 to-transparent opacity-30"
      animate={{ rotate: 360 }}
      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

// Card Thống Kê (Stat Card)
const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  delay,
}: any) => {
  // Tách số và ký tự (ví dụ $48,200 -> prefix: $, value: 48200)
  const isCurrency = value.toString().includes("$");
  const numericVal = value.toString().replace("$", "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 30px -10px rgba(181,166,95,0.3)",
      }}
      className="bg-[#1a1a1a]/60 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-xl relative overflow-hidden group cursor-default"
    >
      {/* Background Glow khi hover */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#D8C97B]/10 rounded-full blur-[50px] group-hover:bg-[#D8C97B]/20 transition-all duration-500"></div>

      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-black text-white group-hover:text-[#D8C97B] transition-colors">
            {/* SỐ NHẢY Ở ĐÂY */}
            <AnimatedCounter
              value={numericVal}
              prefix={isCurrency ? "$" : ""}
            />
          </h3>
        </div>
        <div className="p-3 bg-[#D8C97B]/10 rounded-xl text-[#D8C97B] group-hover:bg-[#D8C97B] group-hover:text-black transition-all shadow-[0_0_15px_rgba(181,166,95,0.2)]">
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs font-medium relative z-10">
        <span
          className={`flex items-center gap-1 ${
            trend === "up" ? "text-green-400" : "text-red-400"
          }`}
        >
          {trend === "up" ? <FaArrowUp /> : <FaArrowDown />} {trendValue}
        </span>
        <span className="text-gray-500 ml-2">so với tháng trước</span>
      </div>
    </motion.div>
  );
};

// --- 3. MAIN DASHBOARD PAGE ---

export default function Dashboard() {
  return (
    <div className="space-y-8 font-sans">
      {/* HEADER SECTION */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            Tổng quan <span className="text-[#D8C97B]">Hệ thống</span>
            {/* Live Indicator */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </h1>
          <p className="text-gray-400 mt-1">
            Dữ liệu thời gian thực. Cập nhật lần cuối: Vừa xong.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#D8C97B]/10 border border-[#D8C97B]/30 rounded-lg text-sm font-bold text-[#D8C97B] hover:bg-[#D8C97B] hover:text-black transition-all">
            <FaSyncAlt className="animate-spin-slow" /> Cập nhật
          </button>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng người dùng"
          value="12,345" // Số này sẽ tự chạy
          icon={FaUsers}
          trend="up"
          trendValue="12%"
          delay={0.1}
        />
        <StatCard
          title="Sự kiện mới"
          value="186"
          icon={FaCalendarCheck}
          trend="up"
          trendValue="5.4%"
          delay={0.2}
        />
        <StatCard
          title="Nhà tổ chức (Org)"
          value="45"
          icon={FaBuilding}
          trend="down"
          trendValue="2.1%"
          delay={0.3}
        />
        <StatCard
          title="Doanh thu (Ước tính)"
          value="$48,200"
          icon={FaDollarSign}
          trend="up"
          trendValue="24%"
          delay={0.4}
        />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: AREA CHART */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:col-span-2 bg-[#1a1a1a]/60 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-xl relative overflow-hidden"
        >
          {/* Decorative Grid Background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(#D8C97B 1px, transparent 1px), linear-gradient(90deg, #D8C97B 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          ></div>

          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-lg font-bold text-white uppercase tracking-wide border-l-4 border-[#D8C97B] pl-3">
              Biểu đồ tăng trưởng
            </h3>
            <button className="text-gray-400 hover:text-white">
              <FaEllipsisH />
            </button>
          </div>

          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={DATA_REVENUE}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D8C97B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D8C97B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#555" tick={{ fill: "#888" }} />
                <YAxis stroke="#555" tick={{ fill: "#888" }} />
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    borderColor: "#D8C97B",
                    backdropFilter: "blur(4px)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#D8C97B" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D8C97B"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* RIGHT: PIE CHART (CÓ VÒNG XOAY CÔNG NGHỆ) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-[#1a1a1a]/60 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col relative overflow-hidden"
        >
          <h3 className="text-lg font-bold text-white uppercase tracking-wide border-l-4 border-[#D8C97B] pl-3 mb-4 relative z-10">
            Phân bố Sự Kiện
          </h3>

          <div className="flex-1 min-h-[300px] relative flex items-center justify-center">
            {/* >>> HIỆU ỨNG QUAY QUAY (Tech Spinner) <<< */}
            <TechSpinner />

            <div className="w-full h-full absolute z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DATA_CATEGORY}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {DATA_CATEGORY.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="rgba(0,0,0,0.5)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#000",
                      border: "1px solid #D8C97B",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none z-20">
              <span className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                100%
              </span>
              <p className="text-[10px] text-[#D8C97B] uppercase tracking-widest font-bold">
                Data
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RECENT EVENTS TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="bg-[#1a1a1a]/60 backdrop-blur-md border border-white/5 rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white uppercase tracking-wide border-l-4 border-[#D8C97B] pl-3">
            Sự kiện vừa đăng ký
          </h3>
          <button className="text-xs text-[#D8C97B] font-bold hover:underline">
            Xem tất cả
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-400">
            <thead className="bg-white/5 text-xs uppercase text-gray-200">
              <tr>
                <th className="px-6 py-4">Tên sự kiện</th>
                <th className="px-6 py-4">Nhà tổ chức</th>
                <th className="px-6 py-4">Ngày diễn ra</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {RECENT_EVENTS.map((event) => (
                <tr
                  key={event.id}
                  className="hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 font-bold text-white group-hover:text-[#D8C97B] transition-colors">
                    {event.name}
                  </td>
                  <td className="px-6 py-4">{event.organizer}</td>
                  <td className="px-6 py-4">{event.date}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        event.status === "Approved"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : event.status === "Pending"
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
