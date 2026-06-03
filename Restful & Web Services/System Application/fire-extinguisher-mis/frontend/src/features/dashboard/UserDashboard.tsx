import { useNavigate } from "react-router-dom";
import {
  FireExtinguisher,
  ClipboardCheck,
  AlertTriangle,
  CalendarPlus,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExtinguisherStatusBadge } from "@/components/common/StatusBadge";
import { FullPageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useFetch } from "@/hooks/useApi";
import { extinguisherService } from "@/services/extinguisher.service";
import { inspectionService } from "@/services/inspection.service";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, sizeLabel, humanize } from "@/lib/utils";

export function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, loading } = useFetch(async () => {
    const [soon, pending, expired] = await Promise.all([
      extinguisherService.list({ limit: 5, sortBy: "expiryDate", sortOrder: "asc" }),
      inspectionService.list({ status: "PENDING", limit: 1 }),
      extinguisherService.list({ status: "EXPIRED", limit: 1 }),
    ]);
    return {
      total: soon.pagination.total,
      pending: pending.pagination.total,
      expired: expired.pagination.total,
      items: soon.data,
    };
  }, []);

  if (loading) return <FullPageSpinner label="Loading your overview…" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.firstName ?? ""}`}
        description="Your fire safety overview and quick actions."
        actions={
          <Button onClick={() => navigate("/inspections")}>
            <CalendarPlus className="h-4 w-4" /> Schedule inspection
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Extinguishers" value={data?.total ?? 0} icon={FireExtinguisher} hint="Total visible units" />
        <StatCard index={1} label="Pending inspections" value={data?.pending ?? 0} icon={ClipboardCheck} hint="Awaiting completion" />
        <StatCard index={2} label="Expired units" value={data?.expired ?? 0} icon={AlertTriangle} hint="Need replacement" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Extinguishers expiring soonest</CardTitle>
        </CardHeader>
        <CardContent>
          {data && data.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((ext) => (
                  <TableRow key={ext.id}>
                    <TableCell className="font-medium">{ext.serialNumber}</TableCell>
                    <TableCell className="text-muted-foreground">{ext.location}</TableCell>
                    <TableCell>{humanize(ext.type)} · {sizeLabel(ext.size)}</TableCell>
                    <TableCell>{formatDate(ext.expiryDate)}</TableCell>
                    <TableCell><ExtinguisherStatusBadge status={ext.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={FireExtinguisher}
              title="No extinguishers found"
              description="There are no extinguishers to display yet."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
