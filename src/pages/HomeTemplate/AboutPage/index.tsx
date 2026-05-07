import React, { Suspense, useState } from "react";
import AboutHero from "../_components/about/Banner";
import { SeoHelmet } from "@/components/common/SeoHelmet";
import { SEO_DATA } from "@/constants/seo-config";
import { useCurrentLang } from "@/utils/i18n-router";
import OrganizerRegModal from "../_components/common/OrganizerRegModal";

const TimelineSection = React.lazy(
  () => import("../_components/about/TimeLine"),
);
const VisionSection = React.lazy(() => import("../_components/about/Vision"));
const TeamSection = React.lazy(() => import("../_components/about/TeamMember"));
const CustomerSection = React.lazy(
  () => import("../_components/about/Customer"),
);

const SectionLoader = () => (
  <div className="w-full h-40 flex items-center justify-center bg-[#0a0a0a]">
    <div className="w-8 h-8 border-2 border-[#D8C97B] border-t-[rgba(0,0,0,0)] rounded-full animate-spin"></div>
  </div>
);

export default function AboutPage() {
  const lang = useCurrentLang();
  const seo = SEO_DATA.about[lang as "vi" | "en"] || SEO_DATA.about.vi;
  const [showOrgModal, setShowOrgModal] = useState(false);

  return (
    <>
      <SeoHelmet
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        slug="about"
      />

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
          <CustomerSection onOpenOrgModal={() => setShowOrgModal(true)} />
        </Suspense>
      </div>

      <OrganizerRegModal
        isOpen={showOrgModal}
        onClose={() => setShowOrgModal(false)}
      />
    </>
  );
}
