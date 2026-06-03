import { useState } from "react";
import {
  Download,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  AlertTriangle,
  History,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ChartCard } from "@/components/charts/ChartCard";
import {
  AreaTrendChart,
  BarBreakdownChart,
  DonutBreakdownChart,
} from "@/components/charts/Charts";
import { ExtinguisherStatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FullPageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFetch } from "@/hooks/useApi";
import { reportService } from "@/services/report.service";
import { useToast } from "@/contexts/ToastContext";
import { normalizeError } from "@/lib/axios";
import { formatDate, humanize } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "hsl(var(--success))",
  EXPIRED: "hsl(var(--destructive))",
  UNDER_MAINTENANCE: "hsl(var(--warning))",
  INSPECTION_DUE: "hsl(var(--info))",
  OUT_OF_SERVICE: "hsl(var(--muted-foreground))",
  PENDING: "hsl(var(--info))",
  COMPLETED: "hsl(var(--success))",
  OVERDUE: "hsl(var(--destructive))",
  CANCELLED: "hsl(var(--muted-foreground))",
};

export default function ReportsPage() {
  const toast = useToast();
  const [tab, setTab] = useState("overview");
  const [exporting, setExporting] = useState<"pdf" | "csv" | null>(null);

  const { data, loading, error } = useFetch(async () => {
    const [dashboard, expired, history] = await Promise.all([
      reportService.dashboard(),
      reportService.expired(),
      reportService.maintenanceHistory(),
    ]);
    return { dashboard, expired, history };
  }, []);

  const handleExport = async (type: "pdf" | "csv") => {
    setExporting(type);
    try {
      const file = await reportService.exportAndDownload(type);
      toast.success("Report ready", `${file} downloaded.`);
    } catch (err) {
      toast.error("Export failed", normalizeError(err).message);
    } finally {
      setExporting(null);
    }
  };

  if (loading) return <FullPageSpinner label="Building reports…" />;
  if (error || !data)
    return <EmptyState icon={AlertTriangle} title="Unable to load reports" description={error ?? undefined} />;

  const { dashboard, expired, history } = data;
  const statusData = Object.entries(dashboard.extinguisherStatus).map(([name, value]) => ({
    name: humanize(name), value: value ?? 0, color: STATUS_COLORS[name],
  }));
  const inspectionData = Object.entries(dashboard.inspectionStatus).map(([name, value]) => ({
    name: humanize(name), value: value ?? 0, color: STATUS_COLORS[name],
  }));
  const trendData = [
    { name: "Today", value: dashboard.newExtinguishers.daily },
    { name: "This Month", value: dashboard.newExtinguishers.monthly },
    { name: "This Year", value: dashboard.newExtinguishers.yearly },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Compliance insights and exportable reports."
        actions={
          <>
            <Button variant="outline" onClick={() => handleExport("csv")} loading={exporting === "csv"}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button onClick={() => handleExport("pdf")} loading={exporting === "pdf"}>
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expired.count})</TabsTrigger>
          <TabsTrigger value="history">Maintenance history</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ChartCard title="Registration trend" description="New units over time" icon={TrendingUp}>
                  <AreaTrendChart data={trendData} />
                </ChartCard>
              </div>
              <ChartCard title="Inspection status" icon={PieIcon}>
                <DonutBreakdownChart data={inspectionData} />
              </ChartCard>
            </div>
            <ChartCard title="Extinguisher status breakdown" icon={BarChart3}>
              <BarBreakdownChart data={statusData} />
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="expired">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expired extinguishers</CardTitle>
            </CardHeader>
            <CardContent>
              {expired.items.length === 0 ? (
                <EmptyState icon={AlertTriangle} title="No expired extinguishers" description="All units are within their valid period." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Expired on</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expired.items.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.serialNumber}</TableCell>
                        <TableCell className="text-muted-foreground">{e.location}</TableCell>
                        <TableCell>{formatDate(e.expiryDate)}</TableCell>
                        <TableCell><ExtinguisherStatusBadge status={e.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          {history.length === 0 ? (
            <EmptyState icon={History} title="No maintenance history" description="Maintenance grouped by extinguisher will appear here." />
          ) : (
            <div className="space-y-4">
              {history.map((group) => (
                <Card key={group.extinguisherId}>
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base">{group.serialNumber}</CardTitle>
                      <p className="text-sm text-muted-foreground">{group.location}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{group.records.length} record(s)</span>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Inspector</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.records.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>{formatDate(r.maintenanceDate)}</TableCell>
                            <TableCell>{r.actionTaken}</TableCell>
                            <TableCell className="text-muted-foreground">{r.conditionNotes}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {r.inspector ? `${r.inspector.firstName} ${r.inspector.lastName}` : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
