import type { Permission, Role } from "@/types";

/** Mock role -> permission mapping enforced across the UI. */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  student: ["dictionary.search", "dictionary.audio.play", "history.view"],
  examiner: [
    "dictionary.search",
    "dictionary.audio.play",
    "history.view",
    "history.clear",
    "dashboard.view",
  ],
  admin: [
    "dictionary.search",
    "dictionary.audio.play",
    "history.view",
    "history.clear",
    "dashboard.view",
    "settings.manage",
  ],
};

export const ROLE_LABELS: Record<Role, string> = {
  student: "Student",
  examiner: "Examiner",
  admin: "Administrator",
};

export const ALL_PERMISSIONS: Permission[] = [
  "dictionary.search",
  "dictionary.audio.play",
  "history.view",
  "history.clear",
  "dashboard.view",
  "settings.manage",
];
