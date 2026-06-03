import { useMemo, useState } from "react";
import {
  Plus,
  ClipboardCheck,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { RoleGate } from "@/components/common/RoleGate";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { InspectionStatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InspectionFormDialog } from "./InspectionFormDialog";
import { INSPECTION_STATUS_OPTIONS } from "@/constants/enums";
import { useFetch } from "@/hooks/useApi";
import { inspectionService } from "@/services/inspection.service";
import { useToast } from "@/contexts/ToastContext";
import { normalizeError } from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import { Role, type Inspection } from "@/types/models";

export default function InspectionsPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Inspection | null>(null);
  const [deleting, setDeleting] = useState<Inspection | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const query = useMemo(
    () => ({ page, limit: 10, status: (status || undefined) as never }),
    [page, status]
  );
  const { data, loading, error, refetch } = useFetch(
    () => inspectionService.list(query),
    [query]
  );

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await inspectionService.remove(deleting.id);
      toast.success("Inspection deleted");
      setDeleting(null);
      refetch();
    } catch (err) {
      toast.error("Delete failed", normalizeError(err).message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inspections"
        description="Schedule, track and complete extinguisher inspections."
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Schedule inspection
          </Button>
        }
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {data ? `${data.pagination.total} inspection(s)` : "Loading…"}
          </p>
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-full sm:w-48">
            <option value="">All statuses</option>
            {INSPECTION_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : error ? (
            <EmptyState title="Failed to load inspections" description={error} />
          ) : !data || data.data.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="No inspections found"
              description="Schedule an inspection to get started."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Extinguisher</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((ins) => (
                    <TableRow key={ins.id}>
                      <TableCell>
                        <div className="font-medium">{ins.extinguisher?.serialNumber ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{ins.extinguisher?.location}</div>
                      </TableCell>
                      <TableCell>
                        {formatDate(ins.scheduledDate)}
                        <span className="ml-1 text-muted-foreground">{ins.scheduledTime}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {ins.inspector ? `${ins.inspector.firstName} ${ins.inspector.lastName}` : "Unassigned"}
                      </TableCell>
                      <TableCell><InspectionStatusBadge status={ins.status} /></TableCell>
                      <TableCell>
                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="icon" aria-label="Actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <RoleGate
                            roles={[Role.ADMIN, Role.INSPECTOR]}
                            fallback={
                              <DropdownItem disabled>No actions available</DropdownItem>
                            }
                          >
                            <DropdownItem onClick={() => { setEditing(ins); setFormOpen(true); }}>
                              <Pencil className="h-4 w-4" /> Update
                            </DropdownItem>
                          </RoleGate>
                          <RoleGate roles={[Role.ADMIN]}>
                            <DropdownItem
                              onClick={() => setDeleting(ins)}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownItem>
                          </RoleGate>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Pagination pagination={data.pagination} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>
      </Card>

      <InspectionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        inspection={editing}
        onSaved={refetch}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete inspection?"
        description="This will permanently remove the inspection record."
        confirmLabel="Delete"
        destructive
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
