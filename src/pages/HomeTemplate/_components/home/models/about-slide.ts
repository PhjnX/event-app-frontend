// src/models/about-slide.ts
import type { ReactNode } from "react";

export interface AboutSlide {
  id: number;
  image: string;
  icon: ReactNode; // Vì icon là component React (FaUsers...)
  label: string;
  title: string;
  desc: string;
  color: string;
}
