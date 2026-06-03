import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FireExtinguisher,
  ClipboardCheck,
  Wrench,
  Users,
  BarChart3,
  UserCircle,
} from "lucide-react";
import { Role } from "@/types/models";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: [Role.ADMIN, Role.INSPECTOR, Role.USER],
  },
  {
    label: "Extinguishers",
    to: "/extinguishers",
    icon: FireExtinguisher,
    roles: [Role.ADMIN, Role.INSPECTOR, Role.USER],
  },
  {
    label: "Inspections",
    to: "/inspections",
    icon: ClipboardCheck,
    roles: [Role.ADMIN, Role.INSPECTOR, Role.USER],
  },
  {
    label: "Maintenance",
    to: "/maintenance",
    icon: Wrench,
    roles: [Role.ADMIN, Role.INSPECTOR],
  },
  {
    label: "Reports",
    to: "/reports",
    icon: BarChart3,
    roles: [Role.ADMIN, Role.INSPECTOR],
  },
  {
    label: "Users",
    to: "/users",
    icon: Users,
    roles: [Role.ADMIN],
  },
  {
    label: "Profile",
    to: "/profile",
    icon: UserCircle,
    roles: [Role.ADMIN, Role.INSPECTOR, Role.USER],
  },
];
