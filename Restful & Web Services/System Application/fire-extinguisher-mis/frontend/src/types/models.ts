// ===== Enums (mirror Prisma schema) =====
export const Role = {
  ADMIN: "ADMIN",
  INSPECTOR: "INSPECTOR",
  USER: "USER",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const ExtinguisherType = {
  WATER: "WATER",
  CO2: "CO2",
  FOAM: "FOAM",
  DRY_CHEMICAL: "DRY_CHEMICAL",
} as const;
export type ExtinguisherType =
  (typeof ExtinguisherType)[keyof typeof ExtinguisherType];

export const ExtinguisherSize = {
  SIZE_2_5_LBS: "SIZE_2_5_LBS",
  SIZE_5_LBS: "SIZE_5_LBS",
  SIZE_9_LBS: "SIZE_9_LBS",
  SIZE_12_LBS: "SIZE_12_LBS",
} as const;
export type ExtinguisherSize =
  (typeof ExtinguisherSize)[keyof typeof ExtinguisherSize];

export const ExtinguisherStatus = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  UNDER_MAINTENANCE: "UNDER_MAINTENANCE",
  INSPECTION_DUE: "INSPECTION_DUE",
  OUT_OF_SERVICE: "OUT_OF_SERVICE",
} as const;
export type ExtinguisherStatus =
  (typeof ExtinguisherStatus)[keyof typeof ExtinguisherStatus];

export const InspectionStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  OVERDUE: "OVERDUE",
  CANCELLED: "CANCELLED",
} as const;
export type InspectionStatus =
  (typeof InspectionStatus)[keyof typeof InspectionStatus];

// ===== Entities =====
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: User;
}

export interface Extinguisher {
  id: string;
  serialNumber: string;
  location: string;
  type: ExtinguisherType;
  size: ExtinguisherSize;
  installationDate: string;
  expiryDate: string;
  status: ExtinguisherStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ExtinguisherRef {
  id: string;
  serialNumber: string;
  location: string;
}

export interface InspectorRef {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Inspection {
  id: string;
  extinguisherId: string;
  scheduledDate: string;
  scheduledTime: string;
  inspectorId: string | null;
  status: InspectionStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  extinguisher?: ExtinguisherRef;
  inspector?: InspectorRef | null;
}

export interface Maintenance {
  id: string;
  extinguisherId: string;
  inspectorId: string | null;
  actionTaken: string;
  conditionNotes: string;
  maintenanceDate: string;
  createdAt: string;
  updatedAt: string;
  extinguisher?: ExtinguisherRef;
  inspector?: InspectorRef | null;
}

// ===== Reports =====
export interface DashboardReport {
  totals: {
    extinguishers: number;
    inspections: number;
    maintenance: number;
    users: number;
    expired: number;
  };
  newExtinguishers: { daily: number; monthly: number; yearly: number };
  extinguisherStatus: Partial<Record<ExtinguisherStatus, number>>;
  inspectionStatus: Partial<Record<InspectionStatus, number>>;
}

export interface ExtinguisherReport {
  total: number;
  newExtinguishers: { daily: number; monthly: number; yearly: number };
  statusBreakdown: Partial<Record<ExtinguisherStatus, number>>;
}

export interface InspectionStatusReport {
  pending: number;
  completed: number;
  overdue: number;
  cancelled: number;
  total: number;
}

export interface ExpiredReport {
  count: number;
  items: Extinguisher[];
}

export interface MaintenanceHistoryGroup {
  extinguisherId: string;
  serialNumber: string;
  location: string;
  records: {
    id: string;
    actionTaken: string;
    conditionNotes: string;
    maintenanceDate: string;
    inspector: InspectorRef | null;
  }[];
}

export interface ExportResult {
  fileName: string;
  downloadUrl: string;
}
