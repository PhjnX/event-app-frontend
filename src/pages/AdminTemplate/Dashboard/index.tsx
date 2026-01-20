import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Database,
  Users,
  Mic2,
  X,
  ChevronRight,
  MoreHorizontal,
  MapPin,
  Calendar,
  Newspaper,
  FileText,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  YAxis,
} from "recharts";

import NumberTicker from "@/components/magicui/number-ticker";
import OptimizedImage from "@/components/ui/OptimizedImage";

import type { AppDispatch, RootState } from "../../../store";
import {
  fetchAllEvents,
  fetchMyEvents,
} from "../../../store/slices/eventSlice";
import { fetchUserList } from "@/store/slices/userSlice";
import { fetchPresenters } from "@/store/slices/presenterSlice";
import { fetchPublicPosts } from "@/store/slices/newsSlice";
import { ROLES } from "@/constants";

const THEME = {
  bg: "bg-[#09090b]",
  cardBg: "bg-[#18181b]",
  border: "border-[#27272a]",
};

const COLORS = {
  green: { hex: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
  gold: { hex: "#B5A65F", bg: "rgba(181, 166, 95, 0.1)" },
  purple: { hex: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)" },
  blue: { hex: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
};

const getMonthlyEventStats = (events: any[]) => {
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
  const currentYear = new Date().getFullYear();
  const data = months.map((m) => ({ name: m, value: 0 }));

  events.forEach((event) => {
    if (event.startDate) {
      const date = new Date(event.startDate);
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        if (data[monthIndex]) data[monthIndex].value += 1;
      }
    }
  });
  return data;
};

const getStatusStats = (events: any[]) => {
  const now = new Date();
  let upcoming = 0,
    ongoing = 0,
    ended = 0,
    pending = 0;

  events.forEach((e: any) => {
    if (e.status === "PENDING_APPROVAL") pending++;
    else if (e.status === "PUBLISHED" || e.status === "ACTIVE") {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      if (end < now) ended++;
      else if (start > now) upcoming++;
      else ongoing++;
    }
  });

  return [
    { name: "Sắp diễn ra", value: upcoming, color: "#3b82f6" },
    { name: "Đang diễn ra", value: ongoing, color: "#10b981" },
    { name: "Đã kết thúc", value: ended, color: "#64748b" },
    { name: "Chờ duyệt", value: pending, color: "#f97316" },
  ].filter((item) => item.value > 0);
};

const MiniStatCard = ({
  title,
  value,
  subLabel,
  colorObj,
  data,
  icon: Icon,
}: any) => (
  <motion.div
    whileHover={{ y: -4 }}
    className={`${THEME.cardBg} rounded-2xl p-5 border ${THEME.border} relative overflow-hidden flex flex-col justify-between h-[160px]`}
  >
    <div className="flex justify-between items-start z-10">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="p-1. 5 rounded-md"
            style={{ backgroundColor: colorObj.bg }}
          >
            <Icon size={16} color={colorObj.hex} />
          </div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {title}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-white mt-2">
          <NumberTicker value={value} />
        </h3>
        <p className="text-[10px] text-zinc-500 mt-1 font-medium">{subLabel}</p>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-20 z-0 opacity-40">
      <ResponsiveContainer width="99%" height={80}>
        <AreaChart data={data}>
          <defs>
            <linearGradient
              id={`grad-${colorObj.hex}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={colorObj.hex} stopOpacity={0.4} />
              <stop offset="100%" stopColor={colorObj.hex} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={colorObj.hex}
            strokeWidth={2}
            fill={`url(#grad-${colorObj.hex})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

const ListItem = ({ data, type, onClick }: any) => {
  let title, sub, img, icon;

  if (type === "event") {
    title = data.eventName;
    sub = new Date(data.startDate).toLocaleDateString("vi-VN");
    img = data.bannerImageUrl;
  } else if (type === "news") {
    title = data.title;
    sub = new Date(data.createdAt).toLocaleDateString("vi-VN");
    img = data.thumbnailUrl;
    icon = <FileText size={16} className="text-[#B5A65F]" />;
  } else if (type === "user") {
    title = data.fullName || data.username || "Unknown User";
    sub = data.role || "USER";
    img = data.avatarUrl;
  }

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-zinc-700 group"
    >
      <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700 flex items-center justify-center">
        {img ? (
          <OptimizedImage
            src={img}
            alt={title || ""}
            width={40}
            height={40}
            className="w-full h-full rounded-full"
          />
        ) : (
          <div className="text-xs font-bold text-zinc-500">
            {icon ? icon : title?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
          {title}
        </h4>
        <p className="text-[10px] text-zinc-500 truncate">{sub}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
    </div>
  );
};

export default function RealDataDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useSelector((state: RootState) => state.auth);
  const { data: allEvents = [] } = useSelector(
    (state: RootState) => state.events || {},
  );
  const { data: users = [] } = useSelector(
    (state: RootState) => state.listUser || {},
  );
  const { data: presenters = [] } = useSelector(
    (state: RootState) => state.presenters || {},
  );
  const { data: news = [] } = useSelector(
    (state: RootState) => state.news || {},
  );

  const isSAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === "SADMIN";
  const isOrganizer =
    user?.role === ROLES.ORGANIZER || user?.role === "ORGANIZER";

  useEffect(() => {
    if (isSAdmin) {
      dispatch(fetchAllEvents());
      dispatch(fetchUserList());
      dispatch(fetchPresenters());
      dispatch(fetchPublicPosts({ page: 0, size: 100 }));
    } else if (isOrganizer) {
      dispatch(fetchMyEvents());
    }
  }, [dispatch, isSAdmin, isOrganizer]);

  const dataSource = isSAdmin ? allEvents : isOrganizer ? allEvents : [];

  const monthlyStats = useMemo(
    () => getMonthlyEventStats(dataSource),
    [dataSource],
  );
  const statusData = useMemo(() => getStatusStats(dataSource), [dataSource]);

  const usersWave = useMemo(
    () => users.map((_, i) => ({ value: (i % 10) + 5 })).slice(0, 20),
    [users],
  );
  const newsWave = useMemo(
    () => news.map((_, i) => ({ value: (i % 8) + 2 })).slice(0, 20),
    [news],
  );
  const presenterWave = useMemo(
    () => presenters.map((_, i) => ({ value: (i % 5) + 3 })).slice(0, 20),
    [presenters],
  );

  const upcomingEvents = useMemo(() => {
    return [...dataSource]
      .filter((e: any) => new Date(e.startDate) >= new Date())
      .sort(
        (a: any, b: any) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      )
      .slice(0, 5);
  }, [dataSource]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return null;
    const q = searchQuery.toLowerCase();
    return {
      events: dataSource.filter((e: any) =>
        (e.eventName || "").toLowerCase().includes(q),
      ),
      news: isSAdmin
        ? news.filter((n: any) => (n.title || "").toLowerCase().includes(q))
        : [],
      users: isSAdmin
        ? users.filter((u: any) =>
            (u.fullName || u.username || "").toLowerCase().includes(q),
          )
        : [],
    };
  }, [searchQuery, dataSource, news, users, isSAdmin]);

  const handleNavigate = (
    type: "event" | "news" | "user",
    id: string | number,
  ) => {
    if (!id) {
      console.error("Missing ID for navigation", type);
      return;
    }

    if (isSAdmin) {
      if (type === "event") navigate(`/admin/events/${id}`);
      if (type === "news") navigate(`/admin/news/${id}`);
      if (type === "user") navigate(`/admin/users/${id}`);
    } else {
      if (type === "event") navigate(`/events/${id}`);
    }
  };

  return (
    <div
      className={`min-h-screen ${THEME.bg} text-white font-noto selection:bg-[#B5A65F]/30 overflow-x-hidden`}
    >
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8 sticky top-4 z-50">
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-xs text-zinc-500">Real-time Data Overview</p>
          </div>
          <div
            className={`flex-1 max-w-xl mx-auto ${THEME.cardBg} border ${THEME.border} rounded-full flex items-center px-4 py-2. 5 shadow-xl`}
          >
            <Search className="w-6 h-6 text-zinc-500 mr-3" />{" "}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isSAdmin ? "Search Events, News, Users..." : "Search Events..."
              }
              className="bg-transparent border-none outline-none text-base w-full placeholder: text-zinc-600 py-3"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            )}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#B5A65F] flex items-center justify-center font-bold text-white shadow-lg shadow-[#B5A65F]/20">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {searchQuery ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div
                className={`${THEME.cardBg} border ${THEME.border} rounded-2xl p-4 h-[70vh] flex flex-col`}
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="font-bold flex items-center gap-2 text-green-500">
                    <Database size={16} /> Events
                  </h3>
                  <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">
                    {searchResults?.events.length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scroll">
                  {searchResults?.events.map((item: any) => (
                    <ListItem
                      key={item.eventId}
                      data={item}
                      type="event"
                      onClick={() =>
                        handleNavigate("event", item.slug || item.eventId)
                      }
                    />
                  ))}
                </div>
              </div>

              {isSAdmin && (
                <div
                  className={`${THEME.cardBg} border ${THEME.border} rounded-2xl p-4 h-[70vh] flex flex-col`}
                >
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="font-bold flex items-center gap-2 text-[#B5A65F]">
                      <Newspaper size={16} /> News
                    </h3>
                    <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">
                      {searchResults?.news.length}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scroll">
                    {searchResults?.news.map((item: any) => (
                      <ListItem
                        key={item.id}
                        data={item}
                        type="news"
                        onClick={() =>
                          handleNavigate("news", item.slug || item.id)
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {isSAdmin && (
                <div
                  className={`${THEME.cardBg} border ${THEME.border} rounded-2xl p-4 h-[70vh] flex flex-col`}
                >
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="font-bold flex items-center gap-2 text-purple-500">
                      <Users size={16} /> Users
                    </h3>
                    <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">
                      {searchResults?.users.length}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scroll">
                    {searchResults?.users.map((item: any) => (
                      <ListItem
                        key={item.userId}
                        data={item}
                        type="user"
                        onClick={() =>
                          handleNavigate("user", item.userId || item.uid)
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid md: grid-cols-2 lg:grid-cols-4 gap-6">
                <MiniStatCard
                  title="Total Events"
                  value={dataSource.length}
                  subLabel="Scheduled this year"
                  colorObj={COLORS.green}
                  data={monthlyStats}
                  icon={Database}
                />

                <MiniStatCard
                  title="News / Posts"
                  value={news.length}
                  subLabel="Published Articles"
                  colorObj={COLORS.gold}
                  data={newsWave}
                  icon={Newspaper}
                />

                <MiniStatCard
                  title="Users"
                  value={users.length}
                  subLabel="Active accounts"
                  colorObj={COLORS.purple}
                  data={usersWave}
                  icon={Users}
                />
                <MiniStatCard
                  title="Presenters"
                  value={presenters.length}
                  subLabel="Professional Speakers"
                  colorObj={COLORS.blue}
                  data={presenterWave}
                  icon={Mic2}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div
                  className={`lg:col-span-8 ${THEME.cardBg} border ${THEME.border} rounded-2xl p-6`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">
                      Events Frequency (2024)
                    </h3>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-2 text-zinc-400">
                        <span className="w-2 h-2 rounded-full bg-[#B5A65F]"></span>{" "}
                        Event Count
                      </span>
                    </div>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="99%" height={350}>
                      <BarChart data={monthlyStats} barGap={8}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#27272a"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          stroke="#52525b"
                          tickLine={false}
                          axisLine={false}
                          dy={10}
                        />
                        <YAxis
                          stroke="#52525b"
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          cursor={{ fill: "#27272a" }}
                          contentStyle={{
                            backgroundColor: "#09090b",
                            borderColor: "#27272a",
                            borderRadius: "12px",
                            color: "#fff",
                          }}
                        />
                        <Bar
                          name="Events"
                          dataKey="value"
                          fill="#B5A65F"
                          radius={[4, 4, 0, 0]}
                          barSize={30}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div
                    className={`${THEME.cardBg} border ${THEME.border} rounded-2xl p-6 min-h-[300px] flex flex-col justify-center`}
                  >
                    <h3 className="font-bold text-lg mb-2">Events Status</h3>
                    {statusData.length > 0 ? (
                      <>
                        <div className="h-[200px] relative">
                          <ResponsiveContainer width="99%" height={200}>
                            <PieChart>
                              <Pie
                                data={statusData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                              >
                                {statusData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="none"
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#000",
                                  borderRadius: "8px",
                                  border: "none",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold">
                              {dataSource.length}
                            </span>
                            <span className="text-xs text-zinc-500">TOTAL</span>
                          </div>
                        </div>
                        <div className="flex justify-center gap-3 mt-4 flex-wrap">
                          {statusData.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1. 5 text-xs text-zinc-400"
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              {item.name}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-zinc-500 text-sm italic">
                        No Data Available
                      </div>
                    )}
                  </div>

                  <div
                    className={`${THEME.cardBg} border ${THEME.border} rounded-2xl p-6 h-[300px] flex flex-col`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">Upcoming Events</h3>
                      <MoreHorizontal
                        size={16}
                        className="text-zinc-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scroll space-y-4 pr-1">
                      {upcomingEvents.length > 0 ? (
                        upcomingEvents.map((e: any, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 group cursor-pointer"
                            onClick={() =>
                              handleNavigate("event", e.slug || e.eventId)
                            }
                          >
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700">
                              {e.bannerImageUrl ? (
                                <OptimizedImage
                                  src={e.bannerImageUrl}
                                  alt={e.eventName}
                                  width={40}
                                  height={40}
                                  className="w-full h-full"
                                  imgClassName="group-hover:scale-110 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500 font-bold">
                                  {e.eventName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-white truncate group-hover:text-[#B5A65F] transition-colors">
                                {e.eventName}
                              </h4>
                              <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                                <Calendar size={10} />{" "}
                                {new Date(e.startDate).toLocaleDateString(
                                  "vi-VN",
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="block text-xs font-bold text-green-500 items-center gap-1">
                                <MapPin size={10} />
                              </span>
                              <span className="text-[10px] text-zinc-600 truncate max-w-[60px] inline-block">
                                {e.location || "Online"}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-500 text-sm text-center mt-10">
                          No upcoming events.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
