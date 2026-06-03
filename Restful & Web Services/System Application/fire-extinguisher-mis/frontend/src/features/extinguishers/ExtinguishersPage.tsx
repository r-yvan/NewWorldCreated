import { useMemo, useState } from "react";
import {
  Plus,
  FireExtinguisher,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpDown,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { RoleGate } from "@/components/common/RoleGate";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ExtinguisherStatusBadge } from "@/components/common/StatusBadge";
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
import { ExtinguisherFormDialog } from "./ExtinguisherFormDialog";
import {
  EXTINGUISHER_STATUS_OPTIONS,
  EXTINGUISHER_TYPE_OPTIONS,
} from "@/constants/enums";
import { useFetch } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { extinguisherService } from "@/services/extinguisher.service";
import { useToast } from "@/contexts/ToastContext";
import { normalizeError } from "@/lib/axios";
import { formatDate, humanize, sizeLabel } from "@/lib/utils";
import { Role, type Extinguisher } from "@/types/models";

export default function ExtinguishersPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const debouncedSearch = useDebounce(search);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Extinguisher | null>(null);
  const [deleting, setDeleting] = useState<Extinguisher | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const query = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      status: (status || undefined) as never,
      type: (type || undefined) as never,
      sortBy,
      sortOrder,
    }),
    [page, debouncedSearch, status, type, sortBy, sortOrder]
  );

  const { data, loading, error, refetch } = useFetch(
    () => extinguisherService.list(query),
    [query]
  );

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await extinguisherService.remove(deleting.id);
      toast.success("Extinguisher deleted");
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
        title="Extinguishers"
        description="Register, track and manage every fire extinguisher unit."
        actions={
          <RoleGate roles={[Role.ADMIN]}>
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" /> Add extinguisher
            </Button>
          </RoleGate>
        }
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search serial number or location…"
            className="flex-1"
          />
          <div className="flex flex-wrap gap-3">
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-44">
              <option value="">All statuses</option>
              {EXTINGUISHER_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
            <Select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="w-40">
              <option value="">All types</option>
              {EXTINGUISHER_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <EmptyState title="Failed to load extinguishers" description={error} />
          ) : !data || data.data.length === 0 ? (
            <EmptyState
              icon={FireExtinguisher}
              title="No extinguishers found"
              description="Try adjusting your filters or add a new extinguisher."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button onClick={() => toggleSort("serialNumber")} className="flex items-center gap-1 hover:text-foreground">
                        Serial <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type / Size</TableHead>
                    <TableHead>
                      <button onClick={() => toggleSort("expiryDate")} className="flex items-center gap-1 hover:text-foreground">
                        Expiry <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((ext) => (
                    <TableRow key={ext.id}>
                      <TableCell className="font-medium">{ext.serialNumber}</TableCell>
                      <TableCell className="text-muted-foreground">{ext.location}</TableCell>
                      <TableCell>{humanize(ext.type)} · {sizeLabel(ext.size)}</TableCell>
                      <TableCell>{formatDate(ext.expiryDate)}</TableCell>
                      <TableCell><ExtinguisherStatusBadge status={ext.status} /></TableCell>
                      <TableCell>
                        <RoleGate roles={[Role.ADMIN]}>
                          <Dropdown
                            trigger={
                              <Button variant="ghost" size="icon" aria-label="Actions">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            }
                          >
                            <DropdownItem onClick={() => { setEditing(ext); setFormOpen(true); }}>
                              <Pencil className="h-4 w-4" /> Edit
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => setDeleting(ext)}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownItem>
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
        </div>
      </Card>

      <ExtinguisherFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        extinguisher={editing}
        onSaved={refetch}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete extinguisher?"
        description={`This will permanently remove ${deleting?.serialNumber}. This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
