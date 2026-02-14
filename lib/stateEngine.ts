export type BookingState =
  | "PENDING"
  | "BLOCKED"
  | "READY"
  | "COMPLETED";

export const getBookingState = (
  lead: any,
  isInventorySufficient: (serviceId: string) => boolean
): BookingState => {
  if (lead.status === "completed") return "COMPLETED";

  if (lead.status !== "booked") return "PENDING";

  if (!lead.intakeCompleted) return "BLOCKED";

  if (!isInventorySufficient(lead.serviceId)) return "BLOCKED";

  return "READY";
};
