import React, { Suspense, useState } from "react";
import FeaturedPresenters from "../_components/events/FeaturedPresenters";

const HeroCarousel = React.lazy(
  () => import("../_components/events/HeroCarousel"),
);
const FilterBar = React.lazy(() => import("../_components/events/FilterBar"));
const EventsGrid = React.lazy(() => import("../_components/events/EventsGrid"));
const CTANewsletter = React.lazy(
  () => import("../_components/events/CTANewsletter"),
);
const AllEventsSection = React.lazy(
  () => import("../_components/events/EventsList"),
);

const SectionLoader = () => (
  <div className="w-full h-40 flex items-center justify-center bg-[#0a0a0a]">
    <div className="w-8 h-8 border-2 border-[#B5A65F] border-t-primary-gold-transparent rounded-full animate-spin"></div>
  </div>
);

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="bg-[#0a0a0a] min-h-screen font-noto text-white overflow-x-hidden selection:bg-[rgba(181,166,95,0.3)]">
      <Suspense
        fallback={
          <div className="h-[600px] bg-[#121212] animate-pulse border-b border-[rgba(255,255,255,0.05)]" />
        }
      >
        <HeroCarousel />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <FilterBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <EventsGrid searchTerm={searchTerm} />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <AllEventsSection searchTerm={searchTerm} />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <FeaturedPresenters />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <CTANewsletter />
      </Suspense>
    </div>
  );
}
