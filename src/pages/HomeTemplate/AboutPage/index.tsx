import React, { Suspense } from "react";

import AboutHero from "../_components/about/Banner";

const TimelineSection = React.lazy(
  () => import("../_components/about/TimeLine")
);
const VisionSection = React.lazy(() => import("../_components/about/Vision"));
const TeamSection = React.lazy(() => import("../_components/about/TeamMember"));
const CustomerSection = React.lazy(
  () => import("../_components/about/Customer")
);

const SectionLoader = () => (
  <div className="w-full h-40 flex items-center justify-center bg-[#0a0a0a]">
    <div className="w-8 h-8 border-2 border-[#D8C97B] border-t-[rgba(0,0,0,0)] rounded-full animate-spin"></div>
  </div>
);

export default function AboutPage() {
  return (
    <div className="relative w-full overflow-hidden bg-[#0a0a0a] selection:bg-[rgba(216,201,123,0.3)]">
      <AboutHero />

      <Suspense fallback={<SectionLoader />}>
        <TimelineSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <VisionSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <TeamSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <CustomerSection />
      </Suspense>
    </div>
  );
}
