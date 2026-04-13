import React, { Suspense, useEffect } from "react";
import CarouselHero from "../_components/home/Carousel";
import { useLocation } from "react-router-dom";
import { SeoHelmet } from "@/components/common/SeoHelmet";
import { SEO_DATA } from "@/constants/seo-config";
import { useCurrentLang } from "@/utils/i18n-router";

const FeaturesSection = React.lazy(
  () => import("../_components/home/Features"),
);
const PartnersSection = React.lazy(
  () => import("../_components/home/Partners"),
);
const AboutSection = React.lazy(() => import("../_components/home/AboutUs"));
const EventsSection = React.lazy(() => import("../_components/home/Event"));
const NewsSection = React.lazy(() => import("../_components/home/News"));
const ContactSection = React.lazy(() => import("../_components/home/Contact"));
const FAQSection = React.lazy(() => import("../_components/home/F&q"));
const SectionLoader = () => (
  <div className="w-full h-40 md:h-64 flex items-center justify-center bg-[#0a0a0a]">
    <div className="w-8 h-8 border-2 border-[#D8C97B] border-t-[rgba(216,201,123,0)] rounded-full animate-spin"></div>
  </div>
);

export default function HomePage() {
  const { hash } = useLocation();
  const lang = useCurrentLang();

  const seo = SEO_DATA.home[lang as "vi" | "en"] || SEO_DATA.home.vi;

  useEffect(() => {
    if (!hash) return;

    const timer = setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [hash]);

  return (
    <>
      <SeoHelmet
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        slug=""
      />

      <div className="w-full overflow-hidden bg-[#0a0a0a] selection:bg-[rgba(216,201,123,0.3)] selection:text-white">
        <CarouselHero />
        <Suspense fallback={<SectionLoader />}>
          <EventsSection />
        </Suspense>

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
          <NewsSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <FAQSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <ContactSection />
        </Suspense>
      </div>
    </>
  );
}
