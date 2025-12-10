import React, { Suspense } from "react";

import HeroManifesto from "../_components/value/HeroManifesto";

const CoreValues = React.lazy(() => import("../_components/value/CoreValue"));
const CultureSection = React.lazy(() => import("../_components/value/Culture"));
const ImpactNumbers = React.lazy(() => import("../_components/value/Impact"));
const FoundersPledge = React.lazy(
  () => import("../_components/value/Founders")
);

const SectionLoader = () => (
  <div className="w-full h-40 flex items-center justify-center bg-[#0a0a0a]">
    <div className="w-8 h-8 border-2 border-[#D8C97B] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function ValuePage() {
  return (
    <div className="w-full overflow-hidden">
      <HeroManifesto />

      <Suspense fallback={<SectionLoader />}>
        <CoreValues />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <CultureSection />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <ImpactNumbers />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <FoundersPledge />
      </Suspense>
    </div>
  );
}
