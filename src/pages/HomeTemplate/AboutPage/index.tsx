import AboutHero from "../_components/about/Banner";
import TimelineSection from "../_components/about/TimeLine";
import VisionSection from "../_components/about/Vision";
import TeamSection from "../_components/about/TeamMember";
import CustomerSection from "../_components/about/Customer";
export default function AboutPage() {
  return (
    <div>
      <AboutHero />
      <TimelineSection />
      <VisionSection />
      <TeamSection />
      <CustomerSection />
    </div>
  );
}
