import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiClock } from "react-icons/fi";

/**
 * Ô chọn giờ theo định dạng 24 giờ.
 *
 * Thay cho `<input type="time">` và `<input type="datetime-local">` của trình
 * duyệt: bảng chọn giờ mặc định của Chrome chạy theo ngôn ngữ máy, tiếng Việt
 * ra dạng 12 giờ kèm SA/CH, vừa khó bấm vừa dễ nhầm sáng với chiều — trong khi
 * giờ sự kiện luôn ghi theo dạng 24 giờ.
 *
 * Bảng chọn được vẽ thẳng lên <body> và tự tính vị trí: các thẻ trong trang
 * admin đều có `overflow-hidden` để bo góc, nếu vẽ bên trong thì bảng bị cắt
 * mất cột Phút khi ô giờ nằm sát mép phải.
 */

const HAI_SO = (n: number) => String(n).padStart(2, "0");
const GIO = Array.from({ length: 24 }, (_, i) => HAI_SO(i));
const RONG = 224; // bề ngang bảng chọn
const CAO = 300; // chiều cao ước lượng, để biết còn chỗ mở xuống dưới không

type Props = {
  value: string; // "HH:mm"
  onChange: (v: string) => void;
  /** Bước nhảy của cột phút, mặc định 5 phút */
  step?: number;
  className?: string;
  disabled?: boolean;
};

export function TimeSelect24({
  value,
  onChange,
  step = 5,
  className = "",
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [goTay, setGoTay] = useState("");
  const [viTri, setViTri] = useState({ top: 0, left: 0 });
  const nut = useRef<HTMLButtonElement>(null);
  const bang = useRef<HTMLDivElement>(null);

  const PHUT = Array.from({ length: Math.ceil(60 / step) }, (_, i) =>
    HAI_SO(i * step),
  );
  const [gio = "", phut = ""] = (value || "").split(":");

  const tinhViTri = () => {
    const r = nut.current?.getBoundingClientRect();
    if (!r) return;
    const duoi = window.innerHeight - r.bottom;
    setViTri({
      // Không cho tràn mép phải màn hình
      left: Math.max(8, Math.min(r.left, window.innerWidth - RONG - 8)),
      // Hết chỗ bên dưới thì mở ngược lên trên
      top: duoi < CAO && r.top > CAO ? r.top - CAO - 6 : r.bottom + 6,
    });
  };

  useLayoutEffect(() => {
    if (open) tinhViTri();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const dong = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!nut.current?.contains(t) && !bang.current?.contains(t)) {
        setOpen(false);
      }
    };
    const theoDoi = () => tinhViTri();
    document.addEventListener("mousedown", dong);
    // capture: true để bắt cả những khung cuộn bên trong trang
    window.addEventListener("scroll", theoDoi, true);
    window.addEventListener("resize", theoDoi);
    return () => {
      document.removeEventListener("mousedown", dong);
      window.removeEventListener("scroll", theoDoi, true);
      window.removeEventListener("resize", theoDoi);
    };
  }, [open]);

  useEffect(() => {
    if (open) setGoTay(value || "");
  }, [open, value]);

  const dat = (g: string, p: string) => onChange(`${g}:${p}`);

  const nhanGoTay = (raw: string, dongBang = true) => {
    const m = raw.trim().match(/^(\d{1,2})\s*[:h.]?\s*(\d{1,2})?$/);
    if (!m) return;
    const g = Math.min(23, Number(m[1]));
    const p = Math.min(59, Number(m[2] ?? 0));
    onChange(`${HAI_SO(g)}:${HAI_SO(p)}`);
    if (dongBang) setOpen(false);
  };

  const cot =
    "flex-1 max-h-[196px] overflow-y-auto py-1 [scrollbar-width:thin] [scrollbar-color:#3a3a3a_transparent]";
  const muc = (chon: boolean) =>
    `w-full text-center px-2 py-1.5 text-xs rounded-md transition ${
      chon
        ? "bg-[#D8C97B] text-black font-bold"
        : "text-gray-300 hover:bg-white/10"
    }`;

  return (
    <div className={`relative ${className}`}>
      <button
        ref={nut}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 bg-[#0a0a0a] border rounded-lg px-3 py-2 text-xs outline-none transition ${
          open ? "border-[#D8C97B]" : "border-white/10 hover:border-white/25"
        } ${value ? "text-white" : "text-gray-500"} disabled:opacity-50`}
      >
        <span className="font-mono tracking-wide">{value || "--:--"}</span>
        <FiClock className="shrink-0 text-[#D8C97B]" />
      </button>

      {open &&
        createPortal(
          <div
            ref={bang}
            style={{ position: "fixed", top: viTri.top, left: viTri.left, width: RONG }}
            className="z-[9999] rounded-xl border border-white/10 bg-[#141414] shadow-2xl shadow-black/70 p-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <input
                autoFocus
                value={goTay}
                onChange={(e) => setGoTay(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    nhanGoTay(goTay);
                  }
                  if (e.key === "Escape") setOpen(false);
                }}
                onBlur={(e) => {
                  // Bấm vào cột Giờ/Phút cũng làm ô này mất tiêu điểm. Nếu đóng
                  // bảng ngay tại đây thì cú bấm chưa kịp ăn, hoá ra chỉ gõ tay
                  // mới chọn được giờ.
                  if (bang.current?.contains(e.relatedTarget as Node)) return;
                  nhanGoTay(goTay, false);
                }}
                placeholder="13:05"
                className="flex-1 w-0 bg-[#0a0a0a] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-mono outline-none focus:border-[#D8C97B]"
              />
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  dat(HAI_SO(d.getHours()), HAI_SO(d.getMinutes()));
                  setOpen(false);
                }}
                className="shrink-0 px-2 py-1.5 text-[11px] rounded-lg border border-[#D8C97B]/40 text-[#D8C97B] hover:bg-[#D8C97B]/10"
              >
                Bây giờ
              </button>
            </div>

            <div className="flex gap-1">
              <div className={cot}>
                <p className="text-[10px] text-gray-500 text-center mb-1 uppercase tracking-wider">
                  Giờ
                </p>
                {GIO.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => dat(g, phut || "00")}
                    className={muc(g === gio)}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <div className="w-px bg-white/10" />
              <div className={cot}>
                <p className="text-[10px] text-gray-500 text-center mb-1 uppercase tracking-wider">
                  Phút
                </p>
                {PHUT.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      dat(gio || "00", p);
                      setOpen(false);
                    }}
                    className={muc(p === phut)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

/**
 * Ngày + giờ trong một hàng: ô ngày dùng lịch sẵn có của trình duyệt
 * (dd/mm/yyyy), ô giờ dùng bảng 24 giờ ở trên. Giá trị vào/ra giữ nguyên dạng
 * "YYYY-MM-DDTHH:mm" như `<input type="datetime-local">` để không phải đổi chỗ
 * khác.
 */
export function DateTimeField({
  value,
  onChange,
  step = 5,
  disabled,
  dateClassName = "",
}: {
  value: string;
  onChange: (v: string) => void;
  step?: number;
  disabled?: boolean;
  dateClassName?: string;
}) {
  const [ngay = "", gio = ""] = (value || "").split("T");

  return (
    <div className="flex gap-2">
      <input
        type="date"
        disabled={disabled}
        value={ngay}
        onChange={(e) => onChange(`${e.target.value}T${gio || "08:00"}`)}
        style={{ colorScheme: "dark" }}
        className={
          dateClassName ||
          "flex-1 min-w-0 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#D8C97B] hover:border-white/25 transition"
        }
      />
      <TimeSelect24
        value={gio}
        onChange={(g) => onChange(`${ngay}T${g}`)}
        step={step}
        disabled={disabled}
        className="w-28 shrink-0"
      />
    </div>
  );
}

export default DateTimeField;
