// src/models/registration.ts
export type RegistrationType = "user" | "partner";

export interface RegistrationFormData {
  name: string;
  email: string;
  company?: string;
  position?: string; // Thêm field này cho Partner
  message: string;
}

export interface ContactItem {
  id: number;
  icon: React.ReactNode;
  title: string;
  content: string;
}
