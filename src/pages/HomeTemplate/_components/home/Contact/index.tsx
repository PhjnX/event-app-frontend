import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaHandshake,
  FaArrowRight,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import OrganizerRegModal from "../../common/OrganizerRegModal";
import { useTranslation, Trans } from "react-i18next";

import iconMarker from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: iconMarker,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const InfoCard = ({
  icon,
  title,
  value,
  href,
}: {
  icon: any;
  title: string;
  value: string;
  href?: string;
}) => {
  const commonClasses =
    "flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-[#D8C97B]/50 transition-all duration-300 w-full text-left group/card";

  const content = (
    <>
      <div className="w-10 h-10 rounded-full bg-[#D8C97B]/10 flex items-center justify-center text-[#D8C97B] border border-[#D8C97B]/20 shrink-0 group-hover/card:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">
          {title}
        </p>
        <p className="text-zinc-100 font-medium text-sm md:text-base leading-tight group-hover/card:text-[#D8C97B] transition-colors">
          {value}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
        className={`${commonClasses} cursor-pointer hover:bg-zinc-800/80`}
      >
        {content}
      </a>
    );
  }

  return <div className={commonClasses}>{content}</div>;
};

export default function RegistrationSection() {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const officePosition: [number, number] = [10.78525, 106.74827];

  const businessName = "Webie Vietnam - Địa Điểm Kinh Doanh";
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessName)}`;

  return (
    <section
      id="contact"
      className="relative py-20 bg-black overflow-hidden text-white font-noto"
    >
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] bg-size-[20px_20px] opacity-[0.05] pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4">
            <span className="text-white">{t("home.contact.title")}</span>{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#D8C97B] to-[#FFEBB5]">
              {t("home.contact.highlight")}
            </span>
          </h2>
          <p className="text-zinc-500 text-lg font-light max-w-2xl mx-auto">
            {t("home.contact.description")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="h-[450px] lg:h-full min-h-[500px] w-full relative rounded-3xl overflow-hidden shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] border border-zinc-700"
          >
            {isClient && (
              <MapContainer
                center={officePosition}
                zoom={18}
                scrollWheelZoom={false}
                className="w-full h-full z-10"
              >
                <TileLayer
                  attribution="&copy; Google Maps"
                  url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                />
                <Marker position={officePosition} icon={defaultIcon}>
                  <Popup>
                    <div className="text-center p-1">
                      <b className="text-blue-600 block mb-1">
                        {t("home.contact.map_popup.title")}
                      </b>
                      <span className="text-gray-600 text-xs">
                        <Trans i18nKey="home.contact.map_popup.address" />
                      </span>
                      <a
                        href={googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 text-xs text-blue-500 underline"
                      >
                        Xem trên Google Maps
                      </a>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center gap-8 lg:pl-6"
          >
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                {t("home.contact.for_organizers.title")}{" "}
                <span className="text-[#D8C97B]">
                  {t("home.contact.for_organizers.highlight")}
                </span>
              </h3>
              <p className="text-zinc-400 leading-relaxed mb-8">
                {t("home.contact.for_organizers.desc")}
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <button
                  onClick={() => setShowModal(true)}
                  className="px-8 py-3.5 bg-[#D8C97B] hover:bg-[#c9bb70] text-black font-bold rounded-xl shadow-[0_4px_14px_0_rgba(216,201,123,0.39)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2"
                >
                  <FaHandshake /> {t("home.contact.buttons.register")}
                </button>
                <a
                  href="tel:0969838467"
                  className="px-8 py-3.5 bg-zinc-900 border border-zinc-700 hover:border-[#D8C97B] text-white hover:text-[#D8C97B] font-bold rounded-xl transition-all flex items-center gap-2 group"
                >
                  {t("home.contact.buttons.hotline")}{" "}
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <InfoCard
                icon={<FaMapMarkerAlt />}
                title={t("home.contact.info.office.title")}
                value={t("home.contact.info.office.value")}
                href={googleMapsLink}
              />
              <InfoCard
                icon={<FaPhoneAlt />}
                title={t("home.contact.info.hotline.title")}
                value={t("home.contact.info.hotline.value")}
                href="tel:0969838467"
              />
              <InfoCard
                icon={<FaEnvelope />}
                title={t("home.contact.info.email.title")}
                value={t("home.contact.info.email.value")}
                href={`mailto:${t("home.contact.info.email.value")}`}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <OrganizerRegModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </section>
  );
}
