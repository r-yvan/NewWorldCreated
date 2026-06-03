import { ExtinguisherStatus } from "@prisma/client";

// Auto-calculate status based on expiry date. Manual states such as
// UNDER_MAINTENANCE / OUT_OF_SERVICE are preserved.
export function resolveExtinguisherStatus(
  expiryDate: Date,
  currentStatus?: ExtinguisherStatus,
  now: Date = new Date()
): ExtinguisherStatus {
  if (
    currentStatus === ExtinguisherStatus.UNDER_MAINTENANCE ||
    currentStatus === ExtinguisherStatus.OUT_OF_SERVICE
  ) {
    return currentStatus;
  }
  if (expiryDate.getTime() <= now.getTime()) {
    return ExtinguisherStatus.EXPIRED;
  }
  return currentStatus ?? ExtinguisherStatus.ACTIVE;
}
