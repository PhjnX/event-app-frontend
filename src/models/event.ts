export interface Event {
  eventId: number;
  slug: string;
  eventName: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  bannerImageUrl: string;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED"; // Giả định trạng thái
  visibility: "PUBLIC" | "PRIVATE";
  registrationDeadline: string;
  organizerId: number;
  organizerName: string;
}
