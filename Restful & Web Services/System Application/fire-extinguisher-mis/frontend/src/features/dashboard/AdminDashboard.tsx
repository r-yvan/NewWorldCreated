import { useNavigate } from "react-router-dom";
import {
  FireExtinguisher,
  ClipboardCheck,
  Wrench,
  Users,
  AlertTriangle,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Download,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { ChartCard } from "@/components/charts/ChartCard";
import {
  AreaTrendChart,
  BarBreakdownChart,
  DonutBreakdownChart,
} from "@/components/charts/Charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FullPageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useFetch } from "@/hooks/useApi";
import { reportService } from "@/services/report.service";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { humanize } from "@/lib/utils";
import { useState } from "react";
import { normalizeError } from "@/lib/axios";

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

export function AdminDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(() => reportService.dashboard(), []);
  const [exporting, setExporting] = useState<"pdf" | "csv" | null>(null);

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

  if (loading) return <FullPageSpinner label="Loading analytics…" />;
  if (error || !data)
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Unable to load dashboard"
        description={error ?? "Please try again later."}
      />
    );

  const statusData = Object.entries(data.extinguisherStatus).map(([name, value]) => ({
    name: humanize(name),
    value: value ?? 0,
    color: STATUS_COLORS[name],
  }));
  const inspectionData = Object.entries(data.inspectionStatus).map(([name, value]) => ({
    name: humanize(name),
    value: value ?? 0,
    color: STATUS_COLORS[name],
  }));
  const trendData = [
    { name: "Today", value: data.newExtinguishers.daily },
    { name: "This Month", value: data.newExtinguishers.monthly },
    { name: "This Year", value: data.newExtinguishers.yearly },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.firstName ?? ""}`}
        description="Operational overview of your fire safety estate."
        actions={
          <>
            <Button variant="outline" onClick={() => handleExport("csv")} loading={exporting === "csv"}>
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button onClick={() => handleExport("pdf")} loading={exporting === "pdf"}>
              <Download className="h-4 w-4" /> PDF Report
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard index={0} label="Extinguishers" value={data.totals.extinguishers} icon={FireExtinguisher} hint="Total registered units" />
        <StatCard index={1} label="Inspections" value={data.totals.inspections} icon={ClipboardCheck} hint="All time" />
        <StatCard index={2} label="Maintenance" value={data.totals.maintenance} icon={Wrench} hint="Logged records" />
        <StatCard index={3} label="Expired" value={data.totals.expired} icon={AlertTriangle} hint="Require attention" />
        <StatCard index={4} label="Users" value={data.totals.users} icon={Users} hint="Platform accounts" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Registration trend" description="New extinguishers over time" icon={TrendingUp} index={0}>
            <AreaTrendChart data={trendData} />
          </ChartCard>
        </div>
        <ChartCard title="Inspection status" description="Distribution by state" icon={PieIcon} index={1}>
          <DonutBreakdownChart data={inspectionData} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Extinguisher status" description="Fleet health breakdown" icon={BarChart3} index={0}>
            <BarBreakdownChart data={statusData} />
          </ChartCard>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/extinguishers")}>
              <FireExtinguisher className="h-4 w-4" /> Manage extinguishers
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/inspections")}>
              <ClipboardCheck className="h-4 w-4" /> Review inspections
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/maintenance")}>
              <Wrench className="h-4 w-4" /> Log maintenance
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/reports")}>
              <BarChart3 className="h-4 w-4" /> Open reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
