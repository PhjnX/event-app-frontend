import React, { Suspense, useState } from "react";
import FeaturedPresenters from "../_components/events/FeaturedPresenters";

// Import các section (Lazy Load)
const HeroCarousel = React.lazy(
  () => import("../_components/events/HeroCarousel")
);
const FilterBar = React.lazy(() => import("../_components/events/FilterBar"));
const EventsGrid = React.lazy(() => import("../_components/events/EventsGrid"));
const CTANewsletter = React.lazy(
  () => import("../_components/events/CTANewsletter")
);

// Component Loading cho từng section
const SectionLoader = () => (
  <div className="w-full h-40 flex items-center justify-center bg-[#0a0a0a]">
    <div className="w-8 h-8 border-2 border-[#B5A65F] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="bg-[#0a0a0a] min-h-screen font-noto text-white overflow-x-hidden">
      {/* 1. Hero Carousel */}
      <Suspense
        fallback={<div className="h-[600px] bg-[#121212] animate-pulse" />}
      >
        <HeroCarousel />
      </Suspense>

      {/* 2. Filter Bar */}
      <Suspense fallback={<SectionLoader />}>
        <FilterBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </Suspense>

      {/* 3. Event Grid (API) */}
      <Suspense fallback={<SectionLoader />}>
        <FeaturedPresenters />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <EventsGrid searchTerm={searchTerm} />
      </Suspense>

      {/* 4. CTA */}
      <Suspense fallback={<SectionLoader />}>
        <CTANewsletter />
      </Suspense>
    </div>
  );
}
