import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaEnvelope,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

/**
 * Chính sách quyền riêng tư.
 *
 * Google Play bắt buộc mọi ứng dụng có tài khoản người dùng phải công bố chính
 * sách này ở hai nơi: ô khai trong Play Console và một đường dẫn mở được ngay
 * trong sản phẩm. Đường dẫn /privacy là đường dẫn đã khai, KHÔNG đổi.
 *
 * Nội dung dưới đây mô tả đúng những gì hệ thống thật sự thu thập — soát lại
 * mỗi khi thêm tính năng chạm tới dữ liệu cá nhân (đặc biệt là quyền thiết bị
 * và dịch vụ bên thứ ba), vì khai sai còn rủi ro hơn không khai.
 *
 * Câu chữ phải trùng với bản trong app (event-app-mobile,
 * src/constants/privacy.ts). Sửa một bên thì sửa cả bên kia.
 */

const CAP_NHAT = "17/09/2026";
const EMAIL_LIEN_HE = "huyen.dang@webie.com.vn";

type Muc = { id: string; tieuDe: string; noiDung: React.ReactNode };

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mucDangXem, setMucDangXem] = useState("muc-1");
  const boQuanSat = useRef<IntersectionObserver | null>(null);
  const oChoMucLuc = useRef<HTMLDivElement>(null);
  const cuoiNoiDung = useRef<HTMLDivElement>(null);
  const [leTrai, setLeTrai] = useState(0);
  /** Khoảng cách từ đỉnh màn hình tới mục lục, tính lại mỗi khi cuộn. */
  const [leTren, setLeTren] = useState(112);
  const [hienMucLuc, setHienMucLuc] = useState(true);

  const cac: Muc[] = [
    {
      id: "muc-1",
      tieuDe: "Chúng tôi là ai",
      noiDung: (
        <p>
          Webie EMS là hệ thống quản lý sự kiện của Webie Vietnam, gồm trang web
          tại ems.webie.com.vn và ứng dụng di động EMS. Chính sách này áp dụng
          cho cả hai. Đơn vị chịu trách nhiệm về dữ liệu là Webie Vietnam, liên
          hệ qua{" "}
          <a
            href={`mailto:${EMAIL_LIEN_HE}`}
            className="text-[#D4AF37] hover:underline"
          >
            {EMAIL_LIEN_HE}
          </a>
          .
        </p>
      ),
    },
    {
      id: "muc-2",
      tieuDe: "Dữ liệu chúng tôi thu thập",
      noiDung: (
        <>
          <p className="mb-4">
            Chúng tôi chỉ thu thập dữ liệu cần cho việc đăng ký và tham dự sự
            kiện:
          </p>
          <ul className="space-y-3">
            {[
              [
                "Thông tin tài khoản",
                "tên hiển thị, email, mật khẩu đã mã hoá. Nếu bạn đăng nhập bằng Google, chúng tôi nhận tên, email và ảnh đại diện từ tài khoản Google của bạn.",
              ],
              [
                "Thông tin hồ sơ (tuỳ bạn điền)",
                "số điện thoại, địa chỉ, giới tính, ngày sinh, ảnh đại diện.",
              ],
              [
                "Dữ liệu tham dự sự kiện",
                "sự kiện bạn đăng ký, hoạt động bạn chọn, mã vé, thời điểm check-in và điểm danh.",
              ],
              [
                "Nội dung bạn đăng",
                "ảnh và chú thích trong mục Khoảnh khắc, cùng các báo cáo vi phạm và danh sách người bạn đã chặn.",
              ],
              [
                "Dữ liệu kỹ thuật tối thiểu",
                "nhật ký máy chủ phục vụ vận hành và xử lý sự cố.",
              ],
            ].map(([nhan, noi]) => (
              <li key={nhan} className="flex gap-3">
                <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0" />
                <span>
                  <strong className="text-white font-semibold">{nhan}:</strong>{" "}
                  {noi}
                </span>
              </li>
            ))}
          </ul>

          {/* Nêu thẳng những gì KHÔNG thu thập: đây là phần Google soi kỹ nhất
              khi đối chiếu với mục Data safety trong Play Console. */}
          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            {[
              "Không thu thập vị trí",
              "Không theo dõi quảng cáo",
              "Không bán dữ liệu",
            ].map((t) => (
              <div
                key={t}
                className="flex items-center gap-2.5 bg-[#18181b] border border-white/5 rounded-xl px-4 py-3"
              >
                <span className="w-6 h-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                  <FaTimes className="text-[10px]" />
                </span>
                <span className="text-[13px] text-zinc-300 font-medium leading-tight">
                  {t}
                </span>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "muc-3",
      tieuDe: "Quyền truy cập thiết bị trên ứng dụng di động",
      noiDung: (
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            [
              "Máy ảnh",
              "Chỉ dùng để quét mã QR khi check-in vào sự kiện và điểm danh hoạt động. Hình ảnh từ máy ảnh không được lưu lại hay gửi đi.",
            ],
            [
              "Thư viện ảnh",
              "Chỉ khi bạn chủ động chọn ảnh để đăng Khoảnh khắc hoặc đổi ảnh đại diện. Ứng dụng chỉ nhận đúng tấm ảnh bạn chọn, không đọc toàn bộ thư viện.",
            ],
          ].map(([nhan, noi]) => (
            <div
              key={nhan}
              className="bg-[#18181b] border border-white/5 rounded-2xl p-5"
            >
              <h3 className="text-white font-bold text-[15px] mb-2">{nhan}</h3>
              <p className="text-[13.5px] leading-relaxed text-zinc-400">
                {noi}
              </p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "muc-4",
      tieuDe: "Dùng dữ liệu để làm gì",
      noiDung: (
        <ul className="space-y-3">
          {[
            "Tạo và quản lý tài khoản, xác thực khi bạn đăng nhập.",
            "Xử lý đăng ký sự kiện, cấp vé, xác nhận check-in và điểm danh hoạt động.",
            "Hiển thị tên và ảnh đại diện của bạn cho ban tổ chức sự kiện bạn tham dự, và cho người tham dự khác khi bạn đăng Khoảnh khắc.",
            "Gửi email liên quan tới tài khoản: xác thực tài khoản, đặt lại mật khẩu, xác nhận xoá tài khoản, thông báo về sự kiện bạn đăng ký.",
            "Kiểm duyệt nội dung: xử lý báo cáo vi phạm nhằm giữ môi trường an toàn theo quy tắc cộng đồng.",
          ].map((t) => (
            <li key={t} className="flex gap-3">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-[#D4AF37]/12 text-[#D4AF37] flex items-center justify-center shrink-0">
                <FaCheck className="text-[9px]" />
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "muc-5",
      tieuDe: "Ai có thể thấy dữ liệu của bạn",
      noiDung: (
        <ul className="space-y-3">
          {[
            [
              "Ban tổ chức sự kiện bạn đăng ký",
              "thấy tên, email, số điện thoại (nếu có) và trạng thái vé của bạn, để phục vụ việc đón tiếp tại sự kiện.",
            ],
            [
              "Người tham dự cùng sự kiện",
              "thấy tên, ảnh đại diện và nội dung bạn đăng trong Khoảnh khắc.",
            ],
            [
              "Quản trị viên hệ thống",
              "truy cập dữ liệu khi xử lý báo cáo vi phạm hoặc hỗ trợ kỹ thuật.",
            ],
          ].map(([nhan, noi]) => (
            <li key={nhan} className="flex gap-3">
              <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0" />
              <span>
                <strong className="text-white font-semibold">{nhan}</strong>{" "}
                {noi}
              </span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "muc-6",
      tieuDe: "Dịch vụ bên thứ ba",
      noiDung: (
        <>
          <p className="mb-4">
            Hệ thống dùng một số dịch vụ bên ngoài, mỗi dịch vụ chỉ nhận phần dữ
            liệu cần thiết:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              ["Google", "Cho tuỳ chọn đăng nhập bằng tài khoản Google."],
              [
                "Cloudinary",
                "Lưu trữ ảnh bạn tải lên (ảnh đại diện, ảnh Khoảnh khắc, ảnh sự kiện).",
              ],
              ["Render", "Nơi đặt máy chủ và cơ sở dữ liệu của hệ thống."],
              [
                "Dịch vụ gửi email",
                "Chuyển các email xác thực và thông báo tài khoản tới bạn.",
              ],
            ].map(([nhan, noi]) => (
              <div
                key={nhan}
                className="bg-[#18181b] border border-white/5 rounded-xl px-4 py-3.5"
              >
                <p className="text-white font-semibold text-sm mb-1">{nhan}</p>
                <p className="text-[13px] text-zinc-400 leading-relaxed">
                  {noi}
                </p>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "muc-7",
      tieuDe: "Lưu trữ bao lâu",
      noiDung: (
        <p>
          Dữ liệu tài khoản được giữ trong thời gian bạn còn sử dụng dịch vụ. Khi
          bạn xoá tài khoản, thông tin cá nhân (tên, email, số điện thoại, địa
          chỉ, ảnh đại diện) bị xoá và toàn bộ Khoảnh khắc của bạn bị gỡ. Lịch sử
          đăng ký sự kiện được giữ lại ở dạng ẩn danh — không còn gắn với danh
          tính của bạn — để ban tổ chức không mất số liệu của những sự kiện đã
          diễn ra.
        </p>
      ),
    },
    {
      id: "muc-8",
      tieuDe: "Quyền của bạn",
      noiDung: (
        <>
          <ul className="space-y-3">
            {[
              "Xem và chỉnh sửa thông tin cá nhân ngay trong trang Hồ sơ.",
              "Đổi mật khẩu bất cứ lúc nào.",
              "Xoá Khoảnh khắc bạn đã đăng, chặn người dùng khác, ẩn bài viết.",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-[#D4AF37]/12 text-[#D4AF37] flex items-center justify-center shrink-0">
                  <FaCheck className="text-[9px]" />
                </span>
                <span>{t}</span>
              </li>
            ))}
            <li className="flex gap-3">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-[#D4AF37]/12 text-[#D4AF37] flex items-center justify-center shrink-0">
                <FaCheck className="text-[9px]" />
              </span>
              <span>
                Xoá vĩnh viễn tài khoản, ngay trong ứng dụng hoặc tại{" "}
                <Link
                  to="/account/delete"
                  className="text-[#D4AF37] hover:underline font-medium"
                >
                  trang xoá tài khoản
                </Link>
                .
              </span>
            </li>
          </ul>
          <p className="mt-4">
            Nếu cần bản sao dữ liệu của mình hoặc có khiếu nại về quyền riêng tư,
            hãy gửi email tới{" "}
            <a
              href={`mailto:${EMAIL_LIEN_HE}`}
              className="text-[#D4AF37] hover:underline"
            >
              {EMAIL_LIEN_HE}
            </a>
            . Chúng tôi phản hồi trong vòng 30 ngày.
          </p>
        </>
      ),
    },
    {
      id: "muc-9",
      tieuDe: "An toàn dữ liệu",
      noiDung: (
        <p>
          Mọi kết nối giữa ứng dụng và máy chủ đều được mã hoá bằng HTTPS. Mật
          khẩu được lưu dưới dạng băm, không ai đọc được mật khẩu gốc. Phiên đăng
          nhập dùng mã thông báo có hạn. Dù vậy, không hệ thống nào an toàn tuyệt
          đối, nên bạn hãy dùng mật khẩu mạnh và không chia sẻ tài khoản.
        </p>
      ),
    },
    {
      id: "muc-10",
      tieuDe: "Trẻ em",
      noiDung: (
        <p>
          Dịch vụ dành cho người từ 13 tuổi trở lên. Chúng tôi không cố ý thu
          thập dữ liệu của trẻ nhỏ hơn. Nếu phát hiện một tài khoản thuộc về trẻ
          dưới độ tuổi này, chúng tôi sẽ xoá tài khoản đó. Phụ huynh có thể liên
          hệ email ở trên để yêu cầu xoá.
        </p>
      ),
    },
    {
      id: "muc-11",
      tieuDe: "Thay đổi chính sách",
      noiDung: (
        <p>
          Khi có thay đổi, chúng tôi cập nhật nội dung tại trang này và đổi mốc
          thời gian ở cuối trang. Với thay đổi lớn ảnh hưởng tới quyền của bạn, chúng tôi sẽ
          báo qua email hoặc thông báo trong ứng dụng.
        </p>
      ),
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
    boQuanSat.current = bo;
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
   * trình duyệt rỗng nên navigate(-1) không đi đâu cả (đúng lỗi "bấm back không
   * được"). location.key là "default" khi đây là mục đầu tiên của lịch sử —
   * trường hợp đó đưa về trang chủ.
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
              aria-label="Quay lại"
              className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10 hover:border-[#D4AF37] transition-all group shrink-0 cursor-pointer"
            >
              <FaArrowLeft className="text-zinc-300 group-hover:text-[#D4AF37] text-sm" />
            </button>
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none">
              Chính sách quyền riêng tư
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
                Nội dung
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
              Chính sách này nói rõ chúng tôi thu thập dữ liệu gì, dùng vào việc
              gì, ai thấy được, và bạn kiểm soát dữ liệu của mình bằng cách nào.
              Chúng tôi chỉ thu thập những gì cần cho việc đăng ký và tham dự sự
              kiện.
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
                  Câu hỏi về quyền riêng tư?
                </p>
                <p className="text-[13.5px] text-zinc-400">
                  Gửi thư cho chúng tôi, phản hồi trong vòng 30 ngày.
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
              Cập nhật lần cuối: {CAP_NHAT}
            </p>

            {/* Mốc đánh dấu hết bài, dùng để ẩn mục lục khi đọc tới cuối. */}
            <div ref={cuoiNoiDung} />
          </div>
        </div>
      </div>
    </div>
  );
}
