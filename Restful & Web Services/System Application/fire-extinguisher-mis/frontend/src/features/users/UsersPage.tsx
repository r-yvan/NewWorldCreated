import { useMemo, useState } from "react";
import { Plus, Users, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { RoleBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
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
import { UserFormDialog } from "./UserFormDialog";
import { ROLE_OPTIONS } from "@/constants/enums";
import { useFetch } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { userService } from "@/services/user.service";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeError } from "@/lib/axios";
import { formatDate, initials } from "@/lib/utils";
import type { Role, User } from "@/types/models";

export default function UsersPage() {
  const toast = useToast();
  const { user: current } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const debouncedSearch = useDebounce(search);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const query = useMemo(
    () => ({ page, limit: 10, search: debouncedSearch || undefined, role: (role || undefined) as Role | undefined }),
    [page, debouncedSearch, role]
  );
  const { data, loading, error, refetch } = useFetch(() => userService.list(query), [query]);

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await userService.remove(deleting.id);
      toast.success("User deleted");
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
        title="Users"
        description="Manage platform accounts, roles and access."
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Add user
          </Button>
        }
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search name or email…"
            className="flex-1"
          />
          <Select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="w-full sm:w-44">
            <option value="">All roles</option>
            {ROLE_OPTIONS.map((o) => (
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
            <EmptyState title="Failed to load users" description={error} />
          ) : !data || data.data.length === 0 ? (
            <EmptyState icon={Users} title="No users found" description="Try a different search or add a new user." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar initials={initials(u.firstName, u.lastName)} />
                          <div>
                            <div className="font-medium">{u.firstName} {u.lastName}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><RoleBadge role={u.role} /></TableCell>
                      <TableCell>
                        <Badge tone={u.isActive ? "success" : "muted"} dot>
                          {u.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                      <TableCell>
                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="icon" aria-label="Actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <DropdownItem onClick={() => { setEditing(u); setFormOpen(true); }}>
                            <Pencil className="h-4 w-4" /> Edit
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => setDeleting(u)}
                            disabled={u.id === current?.id}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownItem>
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

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editing} onSaved={refetch} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete user?"
        description={`This will permanently remove ${deleting?.firstName} ${deleting?.lastName}.`}
        confirmLabel="Delete"
        destructive
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
