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
  MapPin,
  Search,
  Filter,
  Download,
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

import { MagicCard } from "@/components/magicui/magic-card";
import NumberTicker from "@/components/magicui/number-ticker";
import DotPattern from "@/components/magicui/DotPattern";
import { cn } from "@/lib/utils";

import type { AppDispatch, RootState } from "../../../store";
import { fetchAllEvents } from "../../../store/slices/eventSlice";
import { fetchUserList } from "@/store/slices/userSlice";

const RADAR_DATA = [
  { subject: "Music", A: 120, fullMark: 150 },
  { subject: "Tech", A: 98, fullMark: 150 },
  { subject: "Art", A: 86, fullMark: 150 },
  { subject: "Sport", A: 99, fullMark: 150 },
  { subject: "Edu", A: 85, fullMark: 150 },
  { subject: "Social", A: 65, fullMark: 150 },
];

const COLORS = ["#D8C97B", "#3B82F6", "#10B981", "#EF4444", "#8B5CF6"];

const SpinningRings = () => (
  <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] opacity-20 pointer-events-none z-0 overflow-visible">
    <div className="absolute inset-0 border border-zinc-700 rounded-full animate-[spin_60s_linear_infinite]" />
    <div className="absolute inset-10 border border-dashed border-zinc-600 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
    <div className="absolute inset-24 border border-zinc-800 rounded-full animate-[spin_50s_linear_infinite]" />
    <div className="absolute inset-[40%] bg-[rgba(59,130,246,0.1)] rounded-full blur-3xl animate-pulse" />
  </div>
);

export default function RealDashboard() {
  const dispatch = useDispatch<AppDispatch>();

  const { data: events = [] } = useSelector(
    (state: RootState) => state.events || {}
  );
  const { data: users = [] } = useSelector(
    (state: RootState) => state.listUser || {}
  );

  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    if (activeFilter)
      result = events.filter((e: any) => e.status === activeFilter);
    if (searchQuery) {
      result = result.filter((e: any) =>
        e.eventName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [...result]
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt || b.startDate).getTime() -
          new Date(a.createdAt || a.startDate).getTime()
      )
      .slice(0, 6);
  }, [events, activeFilter, searchQuery]);

  const organizers = users.filter((u: any) => u.role === "ORGANIZER");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden font-sans selection:bg-[rgba(216,201,123,0.3)]">
      <DotPattern
        className={cn(
          "[radial-gradient(1000px_circle_at_center,rgba(255,255,255,1),rgba(255,255,255,0))]",
          "opacity-20"
        )}
      />
      <SpinningRings />

      <div className="relative z-10 max-w-[1600px] mx-auto p-4 md:p-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-500 text-xs font-mono tracking-widest uppercase font-bold">
                System Status: Optimal
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black bg-linear-to-br from-white via-zinc-200 to-zinc-600 bg-clip-text text-[rgba(0,0,0,0)] tracking-tighter">
              DASHBOARD <span className="text-zinc-500 font-light">CENTER</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-zinc-900/50 p-2 rounded-2xl border border-zinc-800 backdrop-blur-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border border-zinc-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-[#D8C97B] focus:outline-none transition-all w-64"
              />
            </div>
            <button className="p-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-700">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-xl bg-[#D8C97B] text-black font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(216,201,123,0.3)]">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                label: "Tổng doanh thu",
                val: 842000,
                sub: "+18% so với quý trước",
                icon: Zap,
                color: "#D8C97B",
                prefix: "$",
              },
              {
                label: "Sự kiện hiện tại",
                val: events.length,
                sub: "Đang được quản lý",
                icon: Activity,
                color: "#10B981",
              },
              {
                label: "Người dùng mới",
                val: users.length,
                sub: "Đã xác thực",
                icon: Users,
                color: "#3B82F6",
              },
              {
                label: "Đối tác Organizer",
                val: organizers.length,
                sub: "Nhà cung cấp tin cậy",
                icon: Layers,
                color: "#8B5CF6",
              },
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants}>
                <MagicCard
                  gradientColor={stat.color}
                  className="p-7 cursor-pointer border-zinc-800 bg-[rgba(15,15,15,0.4)] backdrop-blur-2xl group"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:border-zinc-600 transition-colors">
                      <stat.icon
                        style={{ color: stat.color }}
                        className="w-6 h-6"
                      />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-zinc-700 group-hover:text-white transition-all" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                      {stat.label}
                    </p>
                    <h2 className="text-4xl font-black text-white">
                      {stat.prefix}
                      <NumberTicker value={stat.val} />
                    </h2>
                    <p className="text-zinc-600 text-xs font-medium">
                      {stat.sub}
                    </p>
                  </div>
                </MagicCard>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <motion.div variants={itemVariants} className="lg:col-span-8 group">
              <div className="relative h-full bg-[rgba(20,20,20,0.4)] backdrop-blur-3xl border border-zinc-800 rounded-[2.5rem] p-8 overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#3B82F6]" /> Tăng
                      trưởng hệ thống
                    </h3>
                    <p className="text-zinc-500 text-xs mt-1">
                      Dữ liệu phân tích theo tháng trong năm 2025
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-[10px] text-blue-400 font-bold">
                        Event
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-[10px] text-purple-400 font-bold">
                        Visitor
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                    >
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
                            stopOpacity={0.2}
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
                        stroke="rgba(255,255,255,0.05)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#3f3f46"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        tickMargin={10}
                      />
                      <YAxis
                        stroke="#3f3f46"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#09090b",
                          border: "1px solid #27272a",
                          borderRadius: "16px",
                          padding: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="events"
                        stroke="#3B82F6"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorEvents)"
                      />
                      <Area
                        type="monotone"
                        dataKey="visitors"
                        stroke="#8B5CF6"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorVisitors)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="lg:col-span-4 flex flex-col gap-6"
            >
              <div className="flex-1 bg-[rgba(20,20,20,0.4)] backdrop-blur-3xl border border-zinc-800 rounded-[2.5rem] p-6 flex flex-col min-h-[250px]">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">
                  Lĩnh vực tiêu biểu
                </h3>
                <div className="flex-1 w-full h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      data={RADAR_DATA}
                    >
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{
                          fill: "#71717a",
                          fontSize: 10,
                          fontWeight: "bold",
                        }}
                      />
                      <Radar
                        dataKey="A"
                        stroke="#D8C97B"
                        strokeWidth={2}
                        fill="#D8C97B"
                        fillOpacity={0.2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex-1 bg-[rgba(20,20,20,0.4)] backdrop-blur-3xl border border-zinc-800 rounded-[2.5rem] p-6 flex items-center min-h-[200px]">
                <div className="w-1/2 h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDist}
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {statusDist.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.fill}
                            stroke="rgba(0,0,0,0.5)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-3">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                    Trạng thái
                  </h4>
                  {statusDist.slice(0, 3).map((s: any, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between group/item"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: s.fill }}
                        />
                        <span className="text-[10px] text-zinc-500 group-hover/item:text-white transition-colors uppercase font-bold">
                          {s.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-white">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <div className="bg-[rgba(20,20,20,0.4)] backdrop-blur-3xl border border-zinc-800 rounded-[2.5rem] overflow-hidden">
              <div className="p-8 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-[rgba(24,24,27,0.5)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D8C97B]/10 flex items-center justify-center text-[#D8C97B]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold">Sự kiện mới cập nhật</h3>
                </div>
                <div className="flex gap-2">
                  {["PUBLISHED", "PENDING", "REJECTED"].map((st) => (
                    <button
                      key={st}
                      onClick={() =>
                        setActiveFilter(st === activeFilter ? null : st)
                      }
                      className={cn(
                        "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                        activeFilter === st
                          ? "bg-white text-black border-white"
                          : "bg-black/40 border-zinc-800 text-zinc-500 hover:border-zinc-600"
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 space-y-2">
                {filteredEvents.map((ev: any) => (
                  <div
                    key={ev.eventId}
                    className="group flex flex-col md:flex-row items-center p-4 gap-6 rounded-2xl hover:bg-[rgba(39,39,42,0.4)] border border-[rgba(0,0,0,0)] hover:border-zinc-800 transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800 overflow-hidden shrink-0 shadow-xl border border-zinc-700/50">
                      <img
                        src={
                          ev.bannerImageUrl || "https://via.placeholder.com/150"
                        }
                        alt=""
                        className="w-full h-full object-cover grayscale-50 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg text-zinc-200 group-hover:text-[#D8C97B] transition-colors truncate mb-1 uppercase tracking-tight">
                        {ev.eventName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-4 text-zinc-500 font-medium">
                        <span className="text-[10px] flex items-center gap-1.5 uppercase">
                          <Calendar className="w-3 h-3 text-zinc-600" />{" "}
                          {new Date(ev.startDate).toLocaleDateString("vi-VN")}
                        </span>
                        <span className="text-[10px] flex items-center gap-1.5 uppercase">
                          <MapPin className="w-3 h-3 text-zinc-600" />{" "}
                          {ev.location || "Toàn quốc / Online"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end">
                      <div
                        className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border shadow-sm",
                          ev.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : ev.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        )}
                      >
                        {ev.status}
                      </div>
                      <button className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-all active:scale-90">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredEvents.length === 0 && (
                  <div className="py-20 flex flex-col items-center justify-center text-zinc-600 opacity-50">
                    <Layers className="w-12 h-12 mb-4" />
                    <p className="font-bold uppercase tracking-widest text-sm">
                      Không có dữ liệu phù hợp
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .selection\\:bg-\\[rgba\\(216\\,201\\,123\\,0\\.3\\)\\] ::selection { background: rgba(216,201,123,0.3); }
      `}</style>
    </div>
  );
}
