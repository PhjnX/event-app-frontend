import CarouselHero from "../_components/home/Carousel";
import FeaturesSection from "../_components/home/Features";
import PartnersSection from "../_components/home/Partners";
import AboutPage from "../_components/home/AboutUs";
import EventsSection from "../_components/home/Event";
import NewsSection from "../_components/home/News";
import ContactSection from "../_components/home/Contact";
export default function HomePage() {
  return (
    <div>
      <CarouselHero />
      <FeaturesSection />
      <PartnersSection />
      <AboutPage />
      <EventsSection />
      <NewsSection />
      <ContactSection />
    </div>
  );
}
