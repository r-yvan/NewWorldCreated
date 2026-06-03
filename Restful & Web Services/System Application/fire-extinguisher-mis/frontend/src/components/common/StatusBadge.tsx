import { Badge } from "@/components/ui/badge";
import {
  EXTINGUISHER_STATUS_TONE,
  INSPECTION_STATUS_TONE,
  ROLE_TONE,
} from "@/constants/enums";
import { humanize } from "@/lib/utils";
import type {
  ExtinguisherStatus,
  InspectionStatus,
  Role,
} from "@/types/models";

export function ExtinguisherStatusBadge({
  status,
}: {
  status: ExtinguisherStatus;
}) {
  return (
    <Badge tone={EXTINGUISHER_STATUS_TONE[status]} dot>
      {humanize(status)}
    </Badge>
  );
}

export function InspectionStatusBadge({
  status,
}: {
  status: InspectionStatus;
}) {
  return (
    <Badge tone={INSPECTION_STATUS_TONE[status]} dot>
      {humanize(status)}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  return <Badge tone={ROLE_TONE[role]}>{humanize(role)}</Badge>;
}
