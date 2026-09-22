import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FaArrowLeft, FaEnvelope, FaCheck, FaTimes } from "react-icons/fa";

/**
 * Chính sách quyền riêng tư.
 *
 * Google Play bắt buộc mọi ứng dụng có tài khoản người dùng phải công bố chính
 * sách này ở hai nơi: ô khai trong Play Console và một đường dẫn mở được ngay
 * trong sản phẩm. Đường dẫn /privacy là đường dẫn đã khai, KHÔNG đổi.
 *
 * Nội dung mô tả đúng những gì hệ thống thật sự thu thập — soát lại mỗi khi
 * thêm tính năng chạm tới dữ liệu cá nhân (đặc biệt là quyền thiết bị và dịch
 * vụ bên thứ ba), vì khai sai còn rủi ro hơn không khai.
 *
 * Chữ nằm trong src/locales (vi và en), dưới khoá `privacy_page`, để đổi
 * theo ngôn ngữ đang chọn. Sửa một thứ tiếng thì sửa cả hai, và nhớ sửa cả bản
 * trong app (event-app-mobile, src/constants/privacy.ts).
 */

const CAP_NHAT = "17/09/2026";
const EMAIL_LIEN_HE = "huyen.dang@webie.com.vn";

const LOP_LINK = "text-[#D4AF37] hover:underline";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mucDangXem, setMucDangXem] = useState("muc-1");
  const oChoMucLuc = useRef<HTMLDivElement>(null);
  const cuoiNoiDung = useRef<HTMLDivElement>(null);
  const [leTrai, setLeTrai] = useState(0);
  /** Khoảng cách từ đỉnh màn hình tới mục lục, tính lại mỗi khi cuộn. */
  const [leTren, setLeTren] = useState(112);
  const [hienMucLuc, setHienMucLuc] = useState(true);

  const thuEmail = (
    <a href={`mailto:${EMAIL_LIEN_HE}`} className={LOP_LINK}>
      {EMAIL_LIEN_HE}
    </a>
  );

  /** Một dòng gạch đầu dòng có nhãn in đậm ở đầu. */
  const DongCoNhan = ({ nhan, chu }: { nhan: string; chu: string }) => (
    <li className="flex gap-3">
      <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0" />
      <span>
        <strong className="text-white font-semibold">{nhan}</strong> {chu}
      </span>
    </li>
  );

  /** Một dòng gạch đầu dòng có dấu tích. */
  const DongCoTich = ({ children }: { children: React.ReactNode }) => (
    <li className="flex gap-3">
      <span className="mt-0.5 w-5 h-5 rounded-full bg-[#D4AF37]/12 text-[#D4AF37] flex items-center justify-center shrink-0">
        <FaCheck className="text-[9px]" />
      </span>
      <span>{children}</span>
    </li>
  );

  /** Thẻ nhỏ: tên dịch vụ hoặc tên quyền, kèm mô tả. */
  const The = ({ nhan, chu }: { nhan: string; chu: string }) => (
    <div className="bg-[#18181b] border border-white/5 rounded-xl px-4 py-3.5">
      <p className="text-white font-semibold text-sm mb-1">{nhan}</p>
      <p className="text-[13px] text-zinc-400 leading-relaxed">{chu}</p>
    </div>
  );

  const cac: { id: string; tieuDe: string; noiDung: React.ReactNode }[] = [
    {
      id: "muc-1",
      tieuDe: t("privacy_page.s1_title"),
      noiDung: (
        <p>
          {t("privacy_page.s1_body")}
          {thuEmail}.
        </p>
      ),
    },
    {
      id: "muc-2",
      tieuDe: t("privacy_page.s2_title"),
      noiDung: (
        <>
          <p className="mb-4">{t("privacy_page.s2_intro")}</p>
          <ul className="space-y-3">
            {[
              [t("privacy_page.s2_i1_label"), t("privacy_page.s2_i1_text")],
              [t("privacy_page.s2_i2_label"), t("privacy_page.s2_i2_text")],
              [t("privacy_page.s2_i3_label"), t("privacy_page.s2_i3_text")],
              [t("privacy_page.s2_i4_label"), t("privacy_page.s2_i4_text")],
              [t("privacy_page.s2_i5_label"), t("privacy_page.s2_i5_text")],
              [t("privacy_page.s2_i6_label"), t("privacy_page.s2_i6_text")],
            ].map(([nhan, chu]) => (
              <DongCoNhan key={nhan} nhan={nhan + ":"} chu={chu} />
            ))}
          </ul>

          {/* Nêu thẳng những gì KHÔNG thu thập: đây là phần Google soi kỹ nhất
              khi đối chiếu với mục Data safety trong Play Console. */}
          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            {[
              t("privacy_page.s2_badge1"),
              t("privacy_page.s2_badge2"),
              t("privacy_page.s2_badge3"),
            ].map((chu) => (
              <div
                key={chu}
                className="flex items-center gap-2.5 bg-[#18181b] border border-white/5 rounded-xl px-4 py-3"
              >
                <span className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                  <FaTimes className="text-[10px]" />
                </span>
                <span className="text-[13px] text-zinc-300 font-medium leading-tight">
                  {chu}
                </span>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "muc-3",
      tieuDe: t("privacy_page.s3_title"),
      noiDung: (
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            [t("privacy_page.s3_i1_label"), t("privacy_page.s3_i1_text")],
            [t("privacy_page.s3_i2_label"), t("privacy_page.s3_i2_text")],
          ].map(([nhan, chu]) => (
            <div
              key={nhan}
              className="bg-[#18181b] border border-white/5 rounded-2xl p-5"
            >
              <h3 className="text-white font-bold text-[15px] mb-2">{nhan}</h3>
              <p className="text-[13.5px] leading-relaxed text-zinc-400">
                {chu}
              </p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "muc-4",
      tieuDe: t("privacy_page.s4_title"),
      noiDung: (
        <ul className="space-y-3">
          {[
            t("privacy_page.s4_i1"),
            t("privacy_page.s4_i2"),
            t("privacy_page.s4_i3"),
            t("privacy_page.s4_i4"),
            t("privacy_page.s4_i5"),
          ].map((chu) => (
            <DongCoTich key={chu}>{chu}</DongCoTich>
          ))}
        </ul>
      ),
    },
    {
      id: "muc-5",
      tieuDe: t("privacy_page.s5_title"),
      noiDung: (
        <ul className="space-y-3">
          {[
            [t("privacy_page.s5_i1_label"), t("privacy_page.s5_i1_text")],
            [t("privacy_page.s5_i2_label"), t("privacy_page.s5_i2_text")],
            [t("privacy_page.s5_i3_label"), t("privacy_page.s5_i3_text")],
          ].map(([nhan, chu]) => (
            <DongCoNhan key={nhan} nhan={nhan} chu={chu} />
          ))}
        </ul>
      ),
    },
    {
      id: "muc-6",
      tieuDe: t("privacy_page.s6_title"),
      noiDung: (
        <>
          <p className="mb-4">{t("privacy_page.s6_intro")}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              [t("privacy_page.s6_i1_label"), t("privacy_page.s6_i1_text")],
              [t("privacy_page.s6_i2_label"), t("privacy_page.s6_i2_text")],
              [t("privacy_page.s6_i3_label"), t("privacy_page.s6_i3_text")],
              [t("privacy_page.s6_i4_label"), t("privacy_page.s6_i4_text")],
              [t("privacy_page.s6_i5_label"), t("privacy_page.s6_i5_text")],
            ].map(([nhan, chu]) => (
              <The key={nhan} nhan={nhan} chu={chu} />
            ))}
          </div>
        </>
      ),
    },
    {
      id: "muc-7",
      tieuDe: t("privacy_page.s7_title"),
      noiDung: <p>{t("privacy_page.s7_body")}</p>,
    },
    {
      id: "muc-8",
      tieuDe: t("privacy_page.s8_title"),
      noiDung: (
        <>
          <ul className="space-y-3">
            {[
              t("privacy_page.s8_i1"),
              t("privacy_page.s8_i2"),
              t("privacy_page.s8_i3"),
            ].map((chu) => (
              <DongCoTich key={chu}>{chu}</DongCoTich>
            ))}
            <DongCoTich>
              {t("privacy_page.s8_i4_before")}
              <Link to="/account/delete" className={`${LOP_LINK} font-medium`}>
                {t("privacy_page.delete_link")}
              </Link>
              .
            </DongCoTich>
          </ul>
          <p className="mt-4">
            {t("privacy_page.s8_outro_before")}
            {thuEmail}
            {t("privacy_page.s8_outro_after")}
          </p>
        </>
      ),
    },
    {
      id: "muc-9",
      tieuDe: t("privacy_page.s9_title"),
      noiDung: <p>{t("privacy_page.s9_body")}</p>,
    },
    {
      id: "muc-10",
      tieuDe: t("privacy_page.s10_title"),
      noiDung: <p>{t("privacy_page.s10_body")}</p>,
    },
    {
      id: "muc-11",
      tieuDe: t("privacy_page.s11_title"),
      noiDung: <p>{t("privacy_page.s11_body")}</p>,
    },
  ];

  // Tô đậm mục đang đọc trong mục lục bên trái. rootMargin cắt bớt phần trên và
  // phần dưới để mỗi lúc chỉ có mục gần đầu màn hình được tính là "đang xem".
  useEffect(() => {
    const bo = new IntersectionObserver(
      (cacMuc) => {
        const hienRa = cacMuc.filter((m) => m.isIntersecting);
        if (hienRa.length) setMucDangXem(hienRa[0].target.id);
      },
      { rootMargin: "-120px 0px -65% 0px", threshold: 0 },
    );
    document
      .querySelectorAll("section[id^='muc-']")
      .forEach((el) => bo.observe(el));
    return () => bo.disconnect();
  }, []);

  /**
   * Mục lục phải dùng position:fixed chứ không dùng sticky được.
   *
   * Layout chung (HomeTemplate) bọc mọi trang trong div `overflow-x-hidden`;
   * trình duyệt tự đặt overflow-y thành auto theo, biến div đó thành vùng cuộn
   * riêng, và sticky khi ấy neo theo vùng đó chứ không theo màn hình — kết quả
   * là mục lục trôi mất khi cuộn. Sửa layout chung thì ảnh hưởng mọi trang, nên
   * ở đây đo vị trí cột trái rồi ghim mục lục vào đúng toạ độ đó.
   */
  useEffect(() => {
    let cho = 0;
    const doLai = () => {
      const o = oChoMucLuc.current?.getBoundingClientRect();
      if (o) {
        setLeTrai(o.left);
        // Trước khi cuộn tới, mục lục phải nằm đúng chỗ của nó trong trang;
        // ghim lên đỉnh ngay từ đầu thì nó đè lên tiêu đề trang.
        setLeTren(Math.max(112, o.top));
      }
      // Đọc hết bài thì ẩn mục lục đi, nếu không nó nằm đè lên phần chân trang.
      const cuoi = cuoiNoiDung.current?.getBoundingClientRect();
      if (cuoi) setHienMucLuc(cuoi.top > window.innerHeight * 0.75);
    };
    // Tính thẳng theo vị trí khi cuộn thay vì IntersectionObserver: cuộn nhanh
    // qua mốc (hoặc nhảy thẳng xuống cuối trang) làm observer không sinh sự
    // kiện nào, mục lục kẹt lại ở trạng thái cũ.
    const khiCuon = () => {
      if (cho) return;
      cho = requestAnimationFrame(() => {
        cho = 0;
        doLai();
      });
    };
    doLai();
    window.addEventListener("scroll", khiCuon, { passive: true });
    window.addEventListener("resize", khiCuon);
    return () => {
      if (cho) cancelAnimationFrame(cho);
      window.removeEventListener("scroll", khiCuon);
      window.removeEventListener("resize", khiCuon);
    };
  }, []);

  /**
   * Trang này mở được từ Play Console hoặc từ link dán thẳng, lúc đó lịch sử
   * trình duyệt rỗng nên navigate(-1) không đi đâu cả. location.key là
   * "default" khi đây là mục đầu tiên của lịch sử — trường hợp đó đưa về trang
   * chủ.
   */
  const quayLai = () => {
    if (location.key !== "default") navigate(-1);
    else navigate("/");
  };

  const cuonToiMuc = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Trừ chiều cao header cố định để tiêu đề không bị che khuất.
    const y = el.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-black text-white font-noto selection:bg-[#D4AF37] selection:text-black">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-32 pb-24">
        <header className="mb-10 border-b border-white/10 pb-8">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={quayLai}
              aria-label={t("privacy_page.back")}
              className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 hover:border-[#D4AF37] transition-all group shrink-0 cursor-pointer"
            >
              <FaArrowLeft className="text-zinc-300 group-hover:text-[#D4AF37] text-sm" />
            </button>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none">
              {t("privacy_page.title")}
            </h1>
          </div>
        </header>

        <div className="grid lg:grid-cols-[220px_1fr] gap-10 lg:gap-14">
          {/* Mục lục — chỉ hiện trên màn rộng, bám theo khi cuộn.
              Thẻ nav này chỉ để giữ chỗ cột trái; phần nhìn thấy được ghim
              bằng position:fixed vào đúng toạ độ của nó. */}
          <nav className="hidden lg:block" ref={oChoMucLuc}>
            <div
              className={`fixed w-[220px] overflow-y-auto transition-opacity duration-300 ${
                hienMucLuc ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              style={{
                left: leTrai,
                top: leTren,
                // Màn hình thấp thì mục lục tự cuộn trong khung của nó.
                maxHeight: `calc(100vh - ${leTren + 24}px)`,
              }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">
                {t("privacy_page.toc")}
              </p>
              <ul className="space-y-1 border-l border-white/10">
                {cac.map((m, i) => {
                  const dangXem = mucDangXem === m.id;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => cuonToiMuc(m.id)}
                        className={`block w-full text-left text-[13px] leading-snug py-2 pl-4 -ml-px border-l-2 transition-colors cursor-pointer ${
                          dangXem
                            ? "border-[#D4AF37] text-[#D4AF37] font-semibold"
                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {i + 1}. {m.tieuDe}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          <div className="min-w-0">
            <p className="text-zinc-300 text-[15px] leading-relaxed border-l-2 border-[#D4AF37] pl-5 mb-12">
              {t("privacy_page.intro")}
            </p>

            <div className="space-y-12">
              {cac.map((m, i) => (
                <motion.section
                  key={m.id}
                  id={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.35 }}
                  className="scroll-mt-28"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-7 h-7 rounded-full bg-[#D4AF37]/12 text-[#D4AF37] text-xs font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <h2 className="text-lg md:text-xl font-bold text-white">
                      {m.tieuDe}
                    </h2>
                  </div>
                  <div className="text-[14.5px] leading-relaxed text-zinc-400 md:pl-10">
                    {m.noiDung}
                  </div>
                </motion.section>
              ))}
            </div>

            <div className="mt-14 bg-[#18181b] border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="w-11 h-11 rounded-full bg-[#D4AF37]/12 text-[#D4AF37] flex items-center justify-center shrink-0">
                <FaEnvelope className="text-sm" />
              </span>
              <div className="flex-1">
                <p className="text-white font-bold text-[15px] mb-0.5">
                  {t("privacy_page.contact_title")}
                </p>
                <p className="text-[13.5px] text-zinc-400">
                  {t("privacy_page.contact_desc")}
                </p>
              </div>
              <a
                href={`mailto:${EMAIL_LIEN_HE}`}
                className="bg-[#D4AF37] text-black text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#e3c14a] transition-colors text-center whitespace-nowrap"
              >
                {EMAIL_LIEN_HE}
              </a>
            </div>

            {/* Chính sách nào cũng phải ghi mốc thời gian để người đọc biết bản
                mình đang xem có còn hiệu lực không — để cuối trang cho gọn. */}
            <p className="mt-6 text-xs text-zinc-500 text-center">
              {t("privacy_page.updated", { date: CAP_NHAT })}
            </p>

            {/* Mốc đánh dấu hết bài, dùng để ẩn mục lục khi đọc tới cuối. */}
            <div ref={cuoiNoiDung} />
          </div>
        </div>
      </div>
    </div>
  );
}
