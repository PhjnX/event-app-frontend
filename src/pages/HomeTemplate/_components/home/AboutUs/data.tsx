import { FaUsers, FaLightbulb, FaRocket } from "react-icons/fa";
import type { AboutSlide } from "@/pages/HomeTemplate/_components/home/models/about-slide";

import teamMember from "@/assets/images/webie_team.webp";
import CEO from "@/assets/images/CEO.webp";
import Event from "@/assets/images/EventJoin.webp";

export const SLIDE_DATA: AboutSlide[] = [
  {
    id: 1,
    image: teamMember,
    icon: <FaUsers />,
    label: "home.about.slides.1.label",
    title: "home.about.slides.1.title",
    desc: "home.about.slides.1.desc",
    color: "#D8C97B",
  },
  {
    id: 2,
    image: CEO,
    icon: <FaLightbulb />,
    label: "home.about.slides.2.label",
    title: "home.about.slides.2.title",
    desc: "home.about.slides.2.desc",
    color: "#F472B6",
  },
  {
    id: 3,
    image: Event,
    icon: <FaRocket />,
    label: "home.about.slides.3.label",
    title: "home.about.slides.3.title",
    desc: "home.about.slides.3.desc",
    color: "#4ADE80",
  },
];
