import React, { Suspense } from "react";
import HeroManifesto from "../_components/value/HeroManifesto";
import { SeoHelmet } from "@/components/common/SeoHelmet";
import { SEO_DATA } from "@/constants/seo-config";
import { useCurrentLang } from "@/utils/i18n-router";

const CoreValues = React.lazy(() => import("../_components/value/CoreValue"));
const CultureSection = React.lazy(() => import("../_components/value/Culture"));
const ImpactNumbers = React.lazy(() => import("../_components/value/Impact"));
const FoundersPledge = React.lazy(
  () => import("../_components/value/Founders"),
);

const SectionLoader = () => (
  <div className="w-full h-40 flex items-center justify-center bg-[#0a0a0a]">
    <div className="w-8 h-8 border-2 border-[#D8C97B] border-t-[rgba(216,201,123,0)] rounded-full animate-spin"></div>
  </div>
);

export default function ValuePage() {
  const lang = useCurrentLang();
  const seo = SEO_DATA.value[lang as "vi" | "en"] || SEO_DATA.value.vi;

  return (
    <>
      <SeoHelmet
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        slug="value"
      />

      <div className="w-full overflow-hidden bg-[#0a0a0a] selection:bg-[rgba(216,201,123,0.3)] selection:text-white">
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
    </>
  );
}
