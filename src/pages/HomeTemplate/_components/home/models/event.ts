// src/models/event.ts
export interface Event {
  eventId: number;
  eventName: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  bannerImageUrl: string;
  status: string;
  organizerName: string;
}
