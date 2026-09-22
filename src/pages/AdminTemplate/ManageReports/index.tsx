import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaTimes,
  FaFlag,
  FaExclamationTriangle,
  FaTrash,
  FaUndo,
  FaUserSlash,
  FaClock,
  FaEye,
  FaCheck,
  FaPlug,
  FaImage,
} from "react-icons/fa";

import {
  getReports,
  removeMoment,
  restoreMoment,
  suspendUser,
  clearModerationTestData,
} from "@/services/moderationService";
import {
  REASON_LABEL,
  REPORT_STATUS_LABEL,
  SEVERE_REASONS,
} from "@/constants/moderation";
import type { MomentReport, ReportStatus } from "@/models/moderation";
import { parseServerDate, hoursSinceServerDate } from "@/utils/datetime";
import { tenTuChuoi } from "../../../utils/deletedUser";

const SLA_HOURS = 24;

const TABS: { id: ReportStatus | "ALL"; label: string }[] = [
  { id: "PENDING", label: "Chờ xử lý" },
  { id: "RESOLVED", label: "Đã gỡ bài" },
  { id: "DISMISSED", label: "Đã bỏ qua" },
  { id: "ALL", label: "Tất cả" },
];

const hoursSince = (iso: string) => hoursSinceServerDate(iso);

// Backend trả sẵn hoursPending; chỉ tự trừ khi thiếu (dữ liệu mẫu, hoặc bản cũ).
// Dùng đồng hồ của server chuẩn hơn — máy admin có thể lệch giờ.
const pendingHours = (r: MomentReport) =>
  r.hoursPending ?? hoursSince(r.createdAt);

const formatAge = (iso: string) => {
  const h = hoursSince(iso);
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} phút trước`;
  if (h < 24) return `${Math.round(h)} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
};

export default function ManageReports() {
  const [reports, setReports] = useState<MomentReport[]>([]);
  const [isSample, setIsSample] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReportStatus | "ALL">("PENDING");
  const [searchText, setSearchText] = useState("");
  const [selected, setSelected] = useState<MomentReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [removeNote, setRemoveNote] = useState("");

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await getReports("ALL");
      setReports(res.items);
      setIsSample(res.isSample);
    } catch {
      toast.error("Không tải được danh sách báo cáo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Số liệu vận hành
  const stats = useMemo(() => {
    const pending = reports.filter((r) => r.status === "PENDING");
    return {
      pending: pending.length,
      severe: pending.filter((r) => SEVERE_REASONS.includes(r.reason)).length,
      overdue: pending.filter((r) => pendingHours(r) > SLA_HOURS).length,
    };
  }, [reports]);

  const filtered = useMemo(() => {
    let result =
      activeTab === "ALL"
        ? [...reports]
        : reports.filter((r) => r.status === activeTab);

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (r) =>
          (r.authorName || "").toLowerCase().includes(q) ||
          (r.reporterName || "").toLowerCase().includes(q) ||
          (r.momentCaption || "").toLowerCase().includes(q) ||
          (r.eventName || "").toLowerCase().includes(q) ||
          String(r.momentId).includes(q),
      );
    }

    // Nghiêm trọng lên đầu, sau đó tới cũ nhất (sắp quá hạn 24h)
    return result.sort((a, b) => {
      const sa = SEVERE_REASONS.includes(a.reason) ? 0 : 1;
      const sb = SEVERE_REASONS.includes(b.reason) ? 0 : 1;
      if (sa !== sb) return sa - sb;
      return (
        parseServerDate(a.createdAt).getTime() -
        parseServerDate(b.createdAt).getTime()
      );
    });
  }, [reports, activeTab, searchText]);

  // Hành động
  const patchReport = (id: number, patch: Partial<MomentReport>) =>
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );

  const noteLocal = (localOnly: boolean, message: string) =>
    localOnly
      ? toast.info(`${message} — mới ghi nhận trên giao diện, API chưa sẵn sàng.`)
      : toast.success(message);

  const handleRemove = async (r: MomentReport) => {
    setBusy(true);
    try {
      const { localOnly } = await removeMoment(
        r.momentId,
        removeNote.trim() || REASON_LABEL[r.reason],
      );
      patchReport(r.id, { status: "RESOLVED", momentStatus: "REMOVED" });
      noteLocal(localOnly, "Đã gỡ bài viết");
      setSelected(null);
      setRemoveNote("");
    } catch {
      toast.error("Gỡ bài thất bại.");
    } finally {
      setBusy(false);
    }
  };

  const handleDismiss = async (r: MomentReport) => {
    setBusy(true);
    try {
      const { localOnly } = await restoreMoment(r.momentId);
      patchReport(r.id, { status: "DISMISSED", momentStatus: "VISIBLE" });
      noteLocal(localOnly, "Đã bỏ qua báo cáo, bài viết hiển thị lại");
      setSelected(null);
    } catch {
      toast.error("Thao tác thất bại.");
    } finally {
      setBusy(false);
    }
  };

  // Đưa trình duyệt về trạng thái sạch để diễn lại kịch bản thử từ bước đầu.
  const handleClearTestData = () => {
    clearModerationTestData();
    toast.success(
      "Đã xoá báo cáo, danh sách chặn, bài đã ẩn và trạng thái đồng ý quy tắc.",
    );
    load();
  };

  const handleSuspend = async (r: MomentReport) => {
    if (!r.authorId) return;
    setBusy(true);
    try {
      const { localOnly } = await suspendUser(
        r.authorId,
        7,
        REASON_LABEL[r.reason],
      );
      noteLocal(localOnly, `Đã khoá đăng bài của ${r.authorName} trong 7 ngày`);
    } catch {
      toast.error("Khoá tài khoản thất bại.");
    } finally {
      setBusy(false);
    }
  };

  // Thành phần nhỏ
  const ReasonBadge = ({ report }: { report: MomentReport }) => {
    const severe = SEVERE_REASONS.includes(report.reason);
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
          severe
            ? "bg-red-500/10 text-red-400 border-red-500/30"
            : "bg-white/5 text-zinc-400 border-white/10"
        }`}
      >
        {severe && <FaExclamationTriangle className="text-[9px]" />}
        {REASON_LABEL[report.reason]}
      </span>
    );
  };

  const StatusBadge = ({ status }: { status: ReportStatus }) => {
    const map: Record<ReportStatus, string> = {
      PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      RESOLVED: "bg-red-500/10 text-red-400 border-red-500/30",
      DISMISSED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${map[status]}`}
      >
        {REPORT_STATUS_LABEL[status]}
      </span>
    );
  };

  return (
    <div className="pb-20 font-noto text-white min-h-screen selection:bg-[#B5A65F]/30 pr-1">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 pt-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-[#B5A65F] rounded-full shadow-[0_0_10px_#B5A65F]" />
          <div>
            <h2 className="text-2xl font-bold">Kiểm duyệt Moments</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Cam kết với người dùng: mọi báo cáo được xem xét trong {SLA_HOURS}{" "}
              giờ
            </p>
          </div>
        </div>

        <div className="relative group w-full sm:w-72">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#B5A65F]" />
          <input
            type="text"
            placeholder="Tìm theo người đăng, sự kiện, nội dung..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-[#B5A65F] outline-none shadow-sm transition-all"
          />
        </div>
      </div>

      {/* BANNER: API chưa sẵn sàng — đang chạy chế độ thử cục bộ */}
      {isSample && (
        <div className="mb-6 flex items-start gap-3 px-5 py-4 rounded-xl bg-amber-500/8 border border-amber-500/30">
          <FaPlug className="text-amber-400 mt-0.5 shrink-0" />
          <div className="text-sm flex-1">
            <p className="font-bold text-amber-400">
              Chế độ thử cục bộ — backend chưa có API
            </p>
            <p className="text-gray-400 mt-1 leading-relaxed">
              Chưa có <code className="text-amber-300">GET /admin/reports</code>, nên
              danh sách này gồm <b>báo cáo thật bạn vừa gửi từ trang Moments</b> (lưu
              trong trình duyệt) cộng với vài bản ghi mẫu. Thao tác gỡ / bỏ qua có
              hiệu lực ngay trên feed người dùng ở máy này, nhưng chưa ghi xuống
              server. Spec để backend làm nằm ở{" "}
              <code className="text-amber-300">docs/MODERATION_API.md</code>.
            </p>
            <button
              onClick={handleClearTestData}
              className="mt-3 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-500/40 text-amber-300 hover:bg-amber-500/15 transition"
            >
              Xoá dữ liệu thử, chạy lại từ đầu
            </button>
          </div>
        </div>
      )}

      {/* SỐ LIỆU */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Chờ xử lý",
            value: stats.pending,
            Icon: FaFlag,
            tone: "text-[#B5A65F] border-[#B5A65F]/25 bg-[#B5A65F]/5",
          },
          {
            label: "Nghiêm trọng",
            value: stats.severe,
            Icon: FaExclamationTriangle,
            tone: "text-red-400 border-red-500/25 bg-red-500/5",
            hint: "Tình dục, khoả thân, xâm hại trẻ em",
          },
          {
            label: `Quá ${SLA_HOURS} giờ`,
            value: stats.overdue,
            Icon: FaClock,
            tone: "text-amber-400 border-amber-500/25 bg-amber-500/5",
            hint: "Đã trễ so với cam kết",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${s.tone}`}
          >
            <s.Icon className="text-xl shrink-0" />
            <div>
              <div className="text-2xl font-black tabular-nums leading-none">
                {s.value}
              </div>
              <div className="text-xs font-bold text-gray-300 mt-1.5">
                {s.label}
              </div>
              {s.hint && (
                <div className="text-[10px] text-gray-500 mt-0.5">{s.hint}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="overflow-x-auto custom-scrollbar mb-6">
        <div className="flex gap-1 p-1 bg-[#1a1a1a] border border-white/10 rounded-full w-max">
          {TABS.map((tab) => {
            const count =
              tab.id === "ALL"
                ? reports.length
                : reports.filter((r) => r.status === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#B5A65F] text-black shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`ml-2 text-[10px] font-black ${
                      activeTab === tab.id ? "text-black/60" : "text-[#B5A65F]"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* DANH SÁCH */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-[#1a1a1a] rounded-2xl animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-[#141414] rounded-2xl border border-dashed border-white/10">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <FaCheck className="text-emerald-600 text-3xl" />
          </div>
          <p className="text-gray-300 font-bold text-lg">
            Không có báo cáo nào
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {activeTab === "PENDING"
              ? "Hàng đợi trống — không có gì cần xử lý."
              : "Chưa có mục nào trong nhóm này."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((r) => {
              const overdue =
                r.status === "PENDING" && pendingHours(r) > SLA_HOURS;
              const severe = SEVERE_REASONS.includes(r.reason);
              return (
                <motion.div
                  layout
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  onClick={() => {
                    setSelected(r);
                    setRemoveNote("");
                  }}
                  className={`cursor-pointer group flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl bg-[#141414] border transition-all hover:border-[#B5A65F]/40 ${
                    severe && r.status === "PENDING"
                      ? "border-red-500/25"
                      : "border-white/5"
                  }`}
                >
                  {/* Ảnh bài viết */}
                  <div className="w-full md:w-20 h-20 shrink-0 rounded-xl bg-[#0a0a0a] border border-white/5 overflow-hidden flex items-center justify-center">
                    {r.momentImageUrl ? (
                      <img
                        src={r.momentImageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaImage className="text-zinc-700 text-xl" />
                    )}
                  </div>

                  {/* Nội dung */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <ReasonBadge report={r} />
                      <StatusBadge status={r.status} />
                      {(r.reportCount || 0) > 1 && (
                        <span className="text-[10px] font-bold text-zinc-500">
                          {r.reportCount} báo cáo
                        </span>
                      )}
                      {overdue && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                          <FaClock className="text-[9px]" /> quá hạn
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-300 truncate">
                      {r.momentDeleted && (
                        <span className="mr-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-700/50 text-zinc-400 border border-white/10">
                          bài đã bị xoá
                        </span>
                      )}
                      {r.momentCaption || (
                        <span className="italic text-zinc-600">
                          Bài viết chỉ có ảnh
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1 truncate">
                      <span className="text-zinc-400">
                        {tenTuChuoi(r.authorName)}
                      </span>
                      {r.eventName && ` · ${r.eventName}`} ·{" "}
                      {formatAge(r.createdAt)}
                    </p>
                  </div>

                  {/* Hành động nhanh */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(r);
                        setRemoveNote("");
                      }}
                      className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </button>
                    {r.status === "PENDING" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDismiss(r);
                          }}
                          disabled={busy}
                          className="p-2.5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all disabled:opacity-40"
                          title="Bỏ qua, hiển thị lại"
                        >
                          <FaUndo />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(r);
                          }}
                          disabled={busy}
                          className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40"
                          title="Gỡ bài viết"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* DRAWER CHI TIẾT */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#141414] border-l border-white/10 z-50 shadow-2xl flex flex-col"
            >
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a]">
                <div className="flex items-center gap-3">
                  <FaFlag className="text-[#B5A65F]" />
                  <h3 className="text-lg font-bold text-white">
                    Báo cáo #{selected.id}
                  </h3>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                <div className="flex flex-wrap gap-2">
                  <ReasonBadge report={selected} />
                  <StatusBadge status={selected.status} />
                </div>

                {selected.momentImageUrl && (
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
                    <img
                      src={selected.momentImageUrl}
                      alt="Nội dung bị báo cáo"
                      className="w-full max-h-72 object-contain"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs uppercase font-bold text-gray-500">
                    Nội dung bài viết
                  </label>
                  <p className="mt-2 text-sm text-zinc-300 bg-[#0a0a0a] border border-white/5 rounded-lg p-4 leading-relaxed whitespace-pre-wrap">
                    {selected.momentCaption || "(chỉ có ảnh)"}
                  </p>
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-gray-500">
                    Mô tả từ người báo cáo
                  </label>
                  <p className="mt-2 text-sm text-zinc-300 bg-[#0a0a0a] border border-white/5 rounded-lg p-4 leading-relaxed">
                    {selected.detail || "(không có mô tả thêm)"}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                  {[
                    ["Người đăng", tenTuChuoi(selected.authorName)],
                    ["Người báo cáo", tenTuChuoi(selected.reporterName)],
                    ["Sự kiện", selected.eventName],
                    ["Moment ID", `#${selected.momentId}`],
                    ["Thời điểm", formatAge(selected.createdAt)],
                    [
                      "Số báo cáo",
                      String(selected.reportCount ?? 1),
                    ],
                  ].map(([k, v]) => (
                    <div key={k as string}>
                      <dt className="text-[10px] uppercase font-bold text-gray-500">
                        {k}
                      </dt>
                      <dd className="text-zinc-300 mt-1 truncate">
                        {v || "---"}
                      </dd>
                    </div>
                  ))}
                </dl>

                {selected.status === "PENDING" && (
                  <div>
                    <label className="text-xs uppercase font-bold text-gray-500">
                      Ghi chú khi gỡ bài
                    </label>
                    <textarea
                      value={removeNote}
                      onChange={(e) => setRemoveNote(e.target.value)}
                      placeholder={`Mặc định: ${REASON_LABEL[selected.reason]}`}
                      className="mt-2 w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white text-sm focus:border-[#B5A65F] outline-none resize-none min-h-[80px]"
                    />
                    <p className="text-[11px] text-gray-500 mt-2">
                      Ghi chú này được gửi cho chủ bài viết để họ biết lý do.
                    </p>
                  </div>
                )}
              </div>

              {selected.status === "PENDING" && (
                <div className="p-6 border-t border-white/5 bg-[#1a1a1a] space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDismiss(selected)}
                      disabled={busy}
                      className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 font-bold text-sm hover:bg-white/5 disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      <FaUndo size={12} /> Bỏ qua
                    </button>
                    <button
                      onClick={() => handleRemove(selected)}
                      disabled={busy}
                      className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      <FaTrash size={12} /> Gỡ bài
                    </button>
                  </div>
                  <button
                    onClick={() => handleSuspend(selected)}
                    disabled={busy || !selected.authorId}
                    className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/10 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <FaUserSlash size={12} /> Khoá đăng bài 7 ngày —{" "}
                    {tenTuChuoi(selected.authorName)}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
