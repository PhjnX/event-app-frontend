import HeroManifesto from "../_components/value/HeroManifesto";
import CoreValues from "../_components/value/CoreValue";
import CultureSection from "../_components/value/Culture";
import ImpactNumbers from "../_components/value/Impact";
import FoundersPledge from "../_components/value/Founders";

export default function ValuePage() {
  return (
    <div>
      <HeroManifesto />
      <CoreValues />
      <CultureSection />
      <ImpactNumbers />
      <FoundersPledge />
    </div>
  );
}
