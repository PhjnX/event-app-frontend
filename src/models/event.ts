export interface Event {
  eventId: number;
  slug: string;
  eventName: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  bannerImageUrl: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "PUBLISHED";
  visibility: "PUBLIC" | "PRIVATE";
  registrationDeadline: string;
  organizerId: number;
  organizerName: string;

  editRequested?: boolean;
  editRequestStatus?: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  editRequestReason?: string;
  editLocked?: boolean;

  featured?: boolean;
  upcoming?: boolean;
  totalTickets?: number;
  organizerLogoUrl?: string;
}
