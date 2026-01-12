import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import apiService from "@/services/apiService";
import EventCard, { type Event } from "./EventCard"; 

export default function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [marqueeEvents, setMarqueeEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res: any = await apiService.get("/events/public");
        let list = [];
        if (Array.isArray(res)) list = res;
        else if (res.content && Array.isArray(res.content)) list = res.content;

        setEvents(list);

        let clonedList = [...list];
        if (list.length > 0 && list.length < 4) {
          clonedList = [...list, ...list, ...list];
        } else if (list.length >= 4 && list.length < 8) {
          clonedList = [...list, ...list];
        }
        setMarqueeEvents(clonedList);
      } catch (error) {
        console.error("Lỗi lấy danh sách sự kiện:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (isLoading || events.length === 0) return null;

  return (
    <section className="relative py-16 md:py-24 bg-[#0a0a0a] overflow-hidden text-white font-sans selection:bg-[rgba(181,166,95,0.3)]">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: "radial-gradient(#B5A65F 1px, rgba(0,0,0,0) 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
      </div>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-2/3 bg-linear-to-t from-[rgba(181,166,95,0.05)] to-transparent"></div>
      </div>

      <div className="container mx-auto relative z-10 max-w-full px-0 md:px-4">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-16 px-4"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight uppercase tracking-tight text-white font-noto">
            SỰ KIỆN{" "}
            <span className=" bg-clip-text bg-linear-to-r text-[#D8C97B] font-noto">
              NỔI BẬT
            </span>
          </h2>
          <p className="text-base md:text-xl text-gray-400 leading-relaxed max-w-3xl drop-shadow-md mx-auto font-light font-noto">
            Cập nhật những hoạt động sôi nổi và sự kiện đáng chú ý nhất sắp diễn
            ra tại hệ thống EMS.
          </p>
        </motion.div>

    
        <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 px-6 pb-8 custom-scrollbar">
          {events.map((event) => (
            <div
              key={`mobile-${event.eventId}`}
              className="snap-center shrink-0 h-full"
            >
              <EventCard event={event} />
            </div>
          ))}
          <div className="w-6 shrink-0 h-1"></div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="hidden md:block relative w-full py-4"
        >
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-[#0a0a0a] to-transparent z-20 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-[#0a0a0a] to-transparent z-20 pointer-events-none"></div>

          <div className="flex overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: marqueeEvents.length * 8,
                  ease: "linear",
                },
              }}
              whileHover={{ animationPlayState: "paused" }}
              style={{ width: "max-content" }}
            >
              {[...marqueeEvents, ...marqueeEvents].map((event, index) => (
                <div key={`desktop-loop-${index}`} className="mx-5 h-full">
                  <EventCard event={event} />
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8 md:mt-12"
        >
          <Link
            to="/events"
            className="group relative inline-flex items-center gap-2 px-8 py-3 md:px-10 md:py-3.5 overflow-hidden rounded-full bg-transparent border border-[#B5A65F] text-[#B5A65F] font-bold uppercase tracking-wider hover:text-black transition-colors duration-300 text-sm md:text-base"
          >
            <span className="absolute inset-0 bg-[#B5A65F] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></span>
            <span className="relative z-10 flex items-center gap-2">
              Xem Tất Cả{" "}
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
