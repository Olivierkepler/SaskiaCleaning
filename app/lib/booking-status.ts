export const BOOKING_STATUSES = [
  "new",
  "contacted",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  new: "New",
  contacted: "Contacted",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const BOOKING_STATUS_BADGE_CLASS: Record<BookingStatus, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  contacted: "bg-purple-100 text-purple-800 border-purple-200",
  scheduled: "bg-amber-100 text-amber-800 border-amber-200",
  in_progress: "bg-orange-100 text-orange-800 border-orange-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export function isBookingStatus(value: string): value is BookingStatus {
  return (BOOKING_STATUSES as readonly string[]).includes(value);
}
