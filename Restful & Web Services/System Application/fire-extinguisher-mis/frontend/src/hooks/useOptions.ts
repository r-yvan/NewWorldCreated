import { useFetch } from "./useApi";
import { extinguisherService } from "@/services/extinguisher.service";
import { userService } from "@/services/user.service";
import { Role } from "@/types/models";
import type { Option } from "@/constants/enums";

// All extinguishers (capped) for relational selects. Any authenticated role
// may read extinguishers.
export function useExtinguisherOptions() {
  const { data, loading } = useFetch(
    () => extinguisherService.list({ limit: 100, sortBy: "serialNumber", sortOrder: "asc" }),
    []
  );
  const options: Option[] = (data?.data ?? []).map((e) => ({
    label: `${e.serialNumber} — ${e.location}`,
    value: e.id,
  }));
  return { options, loading };
}

// Inspectors for assignment. Only ADMIN can list users, so this is gated.
export function useInspectorOptions(enabled: boolean) {
  const { data, loading } = useFetch(async () => {
    if (!enabled) return { data: [], pagination: { page: 1, limit: 0, total: 0, pages: 1 } };
    return userService.list({ role: Role.INSPECTOR, limit: 100, isActive: true });
  }, [enabled]);
  const options: Option[] = (data?.data ?? []).map((u) => ({
    label: `${u.firstName} ${u.lastName}`,
    value: u.id,
  }));
  return { options, loading };
}
