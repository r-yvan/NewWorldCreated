import {
  ExtinguisherSize,
  ExtinguisherStatus,
  ExtinguisherType,
  InspectionStatus,
  Role,
} from "@/types/models";

export interface Option {
  label: string;
  value: string;
}

export const ROLE_OPTIONS: Option[] = [
  { label: "Admin", value: Role.ADMIN },
  { label: "Inspector", value: Role.INSPECTOR },
  { label: "User", value: Role.USER },
];

export const EXTINGUISHER_TYPE_OPTIONS: Option[] = [
  { label: "Water", value: ExtinguisherType.WATER },
  { label: "CO₂", value: ExtinguisherType.CO2 },
  { label: "Foam", value: ExtinguisherType.FOAM },
  { label: "Dry Chemical", value: ExtinguisherType.DRY_CHEMICAL },
];

export const EXTINGUISHER_SIZE_OPTIONS: Option[] = [
  { label: "2.5 lbs", value: ExtinguisherSize.SIZE_2_5_LBS },
  { label: "5 lbs", value: ExtinguisherSize.SIZE_5_LBS },
  { label: "9 lbs", value: ExtinguisherSize.SIZE_9_LBS },
  { label: "12 lbs", value: ExtinguisherSize.SIZE_12_LBS },
];

export const EXTINGUISHER_STATUS_OPTIONS: Option[] = [
  { label: "Active", value: ExtinguisherStatus.ACTIVE },
  { label: "Expired", value: ExtinguisherStatus.EXPIRED },
  { label: "Under Maintenance", value: ExtinguisherStatus.UNDER_MAINTENANCE },
  { label: "Inspection Due", value: ExtinguisherStatus.INSPECTION_DUE },
  { label: "Out of Service", value: ExtinguisherStatus.OUT_OF_SERVICE },
];

export const INSPECTION_STATUS_OPTIONS: Option[] = [
  { label: "Pending", value: InspectionStatus.PENDING },
  { label: "Completed", value: InspectionStatus.COMPLETED },
  { label: "Overdue", value: InspectionStatus.OVERDUE },
  { label: "Cancelled", value: InspectionStatus.CANCELLED },
];

// Badge variants are semantic; keep status colors minimal & consistent.
export type BadgeTone = "default" | "success" | "warning" | "destructive" | "info" | "muted";

export const EXTINGUISHER_STATUS_TONE: Record<ExtinguisherStatus, BadgeTone> = {
  ACTIVE: "success",
  EXPIRED: "destructive",
  UNDER_MAINTENANCE: "warning",
  INSPECTION_DUE: "info",
  OUT_OF_SERVICE: "muted",
};

export const INSPECTION_STATUS_TONE: Record<InspectionStatus, BadgeTone> = {
  PENDING: "info",
  COMPLETED: "success",
  OVERDUE: "destructive",
  CANCELLED: "muted",
};

export const ROLE_TONE: Record<Role, BadgeTone> = {
  ADMIN: "default",
  INSPECTOR: "info",
  USER: "muted",
};
