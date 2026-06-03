import { useMemo, useState } from "react";
import { Plus, Wrench, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { RoleGate } from "@/components/common/RoleGate";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { MaintenanceFormDialog } from "./MaintenanceFormDialog";
import { useFetch } from "@/hooks/useApi";
import { maintenanceService } from "@/services/maintenance.service";
import { useToast } from "@/contexts/ToastContext";
import { normalizeError } from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import { Role, type Maintenance } from "@/types/models";

export default function MaintenancePage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Maintenance | null>(null);
  const [deleting, setDeleting] = useState<Maintenance | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const query = useMemo(() => ({ page, limit: 10 }), [page]);
  const { data, loading, error, refetch } = useFetch(
    () => maintenanceService.list(query),
    [query]
  );

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await maintenanceService.remove(deleting.id);
      toast.success("Maintenance record deleted");
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
        title="Maintenance"
        description="Log and review maintenance activities for extinguishers."
        actions={
          <RoleGate roles={[Role.ADMIN, Role.INSPECTOR]}>
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" /> Log maintenance
            </Button>
          </RoleGate>
        }
      />

      <Card className="p-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : error ? (
          <EmptyState title="Failed to load maintenance" description={error} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No maintenance records"
            description="Logged maintenance activities will appear here."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Extinguisher</TableHead>
                  <TableHead>Action taken</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="font-medium">{m.extinguisher?.serialNumber ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{m.extinguisher?.location}</div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate">{m.actionTaken}</div>
                      <div className="truncate text-xs text-muted-foreground">{m.conditionNotes}</div>
                    </TableCell>
                    <TableCell>{formatDate(m.maintenanceDate)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.inspector ? `${m.inspector.firstName} ${m.inspector.lastName}` : "—"}
                    </TableCell>
                    <TableCell>
                      <RoleGate roles={[Role.ADMIN, Role.INSPECTOR]}>
                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="icon" aria-label="Actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <DropdownItem onClick={() => { setEditing(m); setFormOpen(true); }}>
                            <Pencil className="h-4 w-4" /> Edit
                          </DropdownItem>
                          <RoleGate roles={[Role.ADMIN]}>
                            <DropdownItem
                              onClick={() => setDeleting(m)}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownItem>
                          </RoleGate>
                        </Dropdown>
                      </RoleGate>
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
      </Card>

      <MaintenanceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        maintenance={editing}
        onSaved={refetch}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete maintenance record?"
        description="This will permanently remove the maintenance log."
        confirmLabel="Delete"
        destructive
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
