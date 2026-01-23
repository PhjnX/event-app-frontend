import Banner1 from "@/assets/images/Banner_1.webp";
import Banner2 from "@/assets/images/Banner_2.webp";
import Banner3 from "@/assets/images/Banner_3.webp";
import IPhoneMockup from "@/assets/images/ems-iphone.webp";
import IPadMockup from "@/assets/images/ems-ipad.webp";
import LaptopMockup from "@/assets/images/ems-laptop.webp";

export interface Slide {
  id: number;
  image: string;
  device: string;
  deviceType: "phone" | "tablet" | "laptop";
  title: string;
  highlight: string;
  subtitle: string;
  btnPrimary: string;
  pathPrimary: string;
  btnSecondary: string;
  pathSecondary: string;
}

export const SLIDES: Slide[] = [
  {
    id: 1,
    image: Banner1,
    device: IPhoneMockup,
    deviceType: "phone",
    title: "home.hero.slides.1.title",
    highlight: "home.hero.slides.1.highlight",
    subtitle: "home.hero.slides.1.subtitle",
    btnPrimary: "home.hero.slides.1.btnPrimary",
    btnSecondary: "home.hero.slides.1.btnSecondary",
    pathPrimary: "/events",
    pathSecondary: "#login",
  },
  {
    id: 2,
    image: Banner2,
    device: IPadMockup,
    deviceType: "tablet",
    title: "home.hero.slides.2.title",
    highlight: "home.hero.slides.2.highlight",
    subtitle: "home.hero.slides.2.subtitle",
    btnPrimary: "home.hero.slides.2.btnPrimary",
    btnSecondary: "home.hero.slides.2.btnSecondary",
    pathPrimary: "/events",
    pathSecondary: "/about",
  },
  {
    id: 3,
    image: Banner3,
    device: LaptopMockup,
    deviceType: "laptop",
    title: "home.hero.slides.3.title",
    highlight: "home.hero.slides.3.highlight",
    subtitle: "home.hero.slides.3.subtitle",
    btnPrimary: "home.hero.slides.3.btnPrimary",
    btnSecondary: "home.hero.slides.3.btnSecondary",
    pathPrimary: "/#contact",
    pathSecondary: "/admin/events/create",
  },
];
