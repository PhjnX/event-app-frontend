import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  Clock,
  MoreHorizontal,
} from "lucide-react";
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
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";

// Magic UI & Components
import { MagicCard } from "@/components/magicui/magic-card";
import NumberTicker from "@/components/magicui/number-ticker";
import DotPattern from "@/components/magicui/DotPattern";
import { cn } from "@/lib/utils";

import type { AppDispatch, RootState } from "../../../store";
import { fetchAllEvents } from "../../../store/slices/eventSlice";
import { fetchUserList } from "@/store/slices/userSlice";

// DỮ LIỆU GIẢ LẬP CHO BIỂU ĐỒ RADAR
const RADAR_DATA = [
  { subject: "Music", A: 120, fullMark: 150 },
  { subject: "Tech", A: 98, fullMark: 150 },
  { subject: "Art", A: 86, fullMark: 150 },
  { subject: "Sport", A: 99, fullMark: 150 },
  { subject: "Edu", A: 85, fullMark: 150 },
  { subject: "Social", A: 65, fullMark: 150 },
];

const COLORS = ["#D8C97B", "#3B82F6", "#10B981", "#EF4444", "#8B5CF6"];

const SpinningRings = () => {
  return (
    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] opacity-20 pointer-events-none z-0 overflow-visible">
      <div className="absolute inset-0 border border-zinc-700 rounded-full animate-[spin_60s_linear_infinite]" />
      <div className="absolute inset-10 border border-dashed border-zinc-600 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
      <div className="absolute inset-24 border border-zinc-800 rounded-full animate-[spin_50s_linear_infinite]" />
      <div className="absolute inset-[40%] bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
    </div>
  );
};

export default function RealDashboard() {
  const dispatch = useDispatch<AppDispatch>();

  const { data: events = [] } = useSelector(
    (state: RootState) => state.events || {}
  );
  const { data: users = [] } = useSelector(
    (state: RootState) => state.listUser || {}
  );

  const organizers = users.filter((u: any) => u.role === "ORGANIZER");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllEvents());
    dispatch(fetchUserList());
  }, [dispatch]);

  const chartData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months.map((m, idx) => {
      const monthEvents = events.filter(
        (e: any) => new Date(e.startDate).getMonth() === idx
      );
      return {
        name: m,
        events: monthEvents.length,
        visitors: monthEvents.length * 1.5 + Math.floor(Math.random() * 5),
      };
    });
  }, [events]);

  const statusDist = useMemo(() => {
    const counts = events.reduce((acc: Record<string, number>, curr: any) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts).map((key, idx) => ({
      name: key,
      value: counts[key],
      fill: COLORS[idx % COLORS.length],
    }));
  }, [events]);

  const filteredEvents = useMemo(() => {
    let result = events;
    if (activeFilter) {
      result = events.filter((e: any) => e.status === activeFilter);
    }

    return [...result]
      .sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || a.startDate).getTime();
        const timeB = new Date(b.createdAt || b.startDate).getTime();
        return timeB - timeA;
      })
      .slice(0, 5);
  }, [events, activeFilter]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden font-sans selection:bg-gold/30">
      <DotPattern
        className={cn(
          "[radial-gradient(900px_circle_at_center,white,transparent)]",
          "opacity-30"
        )}
      />
      <SpinningRings />

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-500 text-xs font-mono tracking-widest uppercase">
                Live Dashboard
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Hệ Thống Quản Trị
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter(null)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                !activeFilter
                  ? "bg-white text-black border-white"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"
              )}
            >
              Tổng quan
            </button>
            <button
              onClick={() => dispatch(fetchAllEvents())}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Doanh thu (Demo)",
                val: 125000,
                sub: "+12.5% tháng này",
                icon: Zap,
                color: "#D8C97B",
                prefix: "$",
              },
              {
                label: "Sự kiện Live",
                val: events.filter((e: any) => e.status === "PUBLISHED").length,
                sub: "Đang hoạt động",
                icon: Activity,
                color: "#10B981",
              },
              {
                label: "Tổng người dùng",
                val: users.length,
                sub: "Tất cả nền tảng",
                icon: Users,
                color: "#3B82F6",
              },
              {
                label: "Ban tổ chức",
                val: organizers.length,
                sub: "Đối tác xác thực",
                icon: Layers,
                color: "#8B5CF6",
              },
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants}>
                <MagicCard
                  gradientColor={stat.color}
                  className="p-6 cursor-pointer border-zinc-800 bg-black/40 backdrop-blur-md"
                  onClick={() => {
                    if (stat.label.includes("Live"))
                      setActiveFilter("PUBLISHED");
                    else setActiveFilter(null);
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={cn(
                        "p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50",
                        `text-[${stat.color}]`
                      )}
                    >
                      <stat.icon
                        style={{ color: stat.color }}
                        className="w-5 h-5"
                      />
                    </div>
                    {i === 0 && (
                      <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                        +4.5%
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <h2 className="text-3xl font-bold text-zinc-100">
                      {stat.prefix}
                      <NumberTicker value={stat.val} />
                    </h2>
                    <p className="text-zinc-600 text-xs">{stat.sub}</p>
                  </div>
                </MagicCard>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[450px]">
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 relative group"
            >
              <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-purple-600 rounded-4xl opacity-20 blur group-hover:opacity-40 transition duration-1000"></div>

              <div className="relative h-full bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-4xl p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" /> Thống kê
                    tăng trưởng
                  </h3>
                </div>
                <div className="flex-1 w-full min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="colorEvents"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3B82F6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3B82F6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorVisitors"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8B5CF6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8B5CF6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#ffffff10"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#52525b"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <YAxis
                        stroke="#52525b"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#09090b",
                          border: "1px solid #27272a",
                          borderRadius: "12px",
                        }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="events"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorEvents)"
                        name="Sự kiện"
                      />
                      <Area
                        type="monotone"
                        dataKey="visitors"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorVisitors)"
                        name="Truy cập"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* RIGHT: RADAR & PIE (Stacked - Chiếm 1/3) */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-1 grid grid-rows-2 gap-4"
            >
              {/* Chart 1: Radar Chart */}
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-4xl p-4 relative overflow-hidden">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest absolute top-4 left-6 z-10">
                  Phân loại
                </h3>
                <div className="h-full w-full absolute inset-0 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="65%"
                      data={RADAR_DATA}
                    >
                      <PolarGrid stroke="#ffffff10" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "#71717a", fontSize: 10 }}
                      />
                      <Radar
                        name="Mix"
                        dataKey="A"
                        stroke="#D8C97B"
                        strokeWidth={2}
                        fill="#D8C97B"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Pie Chart */}
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-4xl p-5 flex items-center justify-between relative overflow-hidden">
                <div className="h-full w-1/2 min-h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDist}
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusDist.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.fill}
                            stroke="rgba(0,0,0,0.5)"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#000",
                          border: "1px solid #333",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 flex flex-col gap-2 z-10 pl-2">
                  <h3 className="text-sm font-bold text-zinc-200 mb-1">
                    Trạng thái
                  </h3>
                  {statusDist.slice(0, 3).map((s: any, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-zinc-500"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: s.fill }}
                      />
                      <span className="truncate max-w-[60px]">{s.name}</span>
                      <span className="ml-auto text-white font-mono">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Decorative Glow */}
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full" />
              </div>
            </motion.div>
          </div>

          {/* ROW 3: LIST (Danh sách sự kiện mới) */}
          <motion.div variants={itemVariants}>
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-4xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold" /> Sự kiện mới nhất
                </h3>
                <div className="text-xs text-zinc-500">
                  Cập nhật thời gian thực
                </div>
              </div>
              <div className="p-0">
                {filteredEvents.map((ev: any) => (
                  <div
                    key={ev.eventId}
                    className="group flex items-center p-4 gap-4 border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-all cursor-pointer last:border-0"
                  >
                    {/* Image */}
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden relative shadow-lg">
                      <img
                        src={
                          ev.bannerImageUrl || "https://via.placeholder.com/150"
                        }
                        alt=""
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-zinc-200 group-hover:text-gold transition-colors truncate">
                        {ev.eventName}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{" "}
                          {new Date(ev.startDate).toLocaleDateString("vi-VN")}
                        </span>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <MapPinIcon className="w-3 h-3" />{" "}
                          {ev.location || "Online"}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold border",
                          ev.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        )}
                      >
                        {ev.status}
                      </div>
                      <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-zinc-500 hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredEvents.length === 0 && (
                  <div className="p-8 text-center text-zinc-500 text-sm">
                    Không có sự kiện nào
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
