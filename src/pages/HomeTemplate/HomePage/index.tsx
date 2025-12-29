import React, { Suspense, useEffect } from "react";
import CarouselHero from "../_components/home/Carousel";
import { useLocation } from "react-router-dom";

const FeaturesSection = React.lazy(
  () => import("../_components/home/Features")
);
const PartnersSection = React.lazy(
  () => import("../_components/home/Partners")
);

const AboutSection = React.lazy(() => import("../_components/home/AboutUs"));
const EventsSection = React.lazy(() => import("../_components/home/Event"));
const NewsSection = React.lazy(() => import("../_components/home/News"));
const ContactSection = React.lazy(() => import("../_components/home/Contact"));

const SectionLoader = () => (
  <div className="w-full h-40 md:h-64 flex items-center justify-center bg-[#0a0a0a]">
    <div className="w-8 h-8 border-2 border-[#D8C97B] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function HomePage() {
  const { hash } = useLocation();

  // 👉 LOGIC SCROLL TỚI SECTION
  useEffect(() => {
    if (!hash) return;

    // Delay nhẹ để chờ lazy component render xong
    const timer = setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [hash]);
  return (
    <div className="w-full overflow-hidden">
      <CarouselHero />

      <Suspense fallback={<SectionLoader />}>
        <FeaturesSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <PartnersSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <AboutSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <EventsSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <NewsSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <ContactSection />
      </Suspense>
    </div>
  );
}
