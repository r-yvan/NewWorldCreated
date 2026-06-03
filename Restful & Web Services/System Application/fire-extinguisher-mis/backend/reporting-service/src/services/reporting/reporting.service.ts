import { reportingRepository } from "./reporting.repository";
import { generateCsv, generatePdf, type PdfSection } from "../../shared/export";
import { recordAudit } from "../../shared/audit";

function startOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfYear(d = new Date()): Date {
  return new Date(d.getFullYear(), 0, 1);
}

export const reportingService = {
  async dashboard() {
    const now = new Date();
    const [
      totalExtinguishers,
      totalInspections,
      totalMaintenance,
      totalUsers,
      extinguisherStatus,
      inspectionStatus,
      expired,
      daily,
      monthly,
      yearly,
    ] = await Promise.all([
      reportingRepository.countExtinguishers(),
      reportingRepository.countInspections(),
      reportingRepository.countMaintenance(),
      reportingRepository.countUsers(),
      reportingRepository.extinguisherStatusBreakdown(),
      reportingRepository.inspectionStatusBreakdown(),
      reportingRepository.listExpired(now),
      reportingRepository.countExtinguishersSince(startOfDay(now)),
      reportingRepository.countExtinguishersSince(startOfMonth(now)),
      reportingRepository.countExtinguishersSince(startOfYear(now)),
    ]);

    return {
      totals: {
        extinguishers: totalExtinguishers,
        inspections: totalInspections,
        maintenance: totalMaintenance,
        users: totalUsers,
        expired: expired.length,
      },
      newExtinguishers: { daily, monthly, yearly },
      extinguisherStatus,
      inspectionStatus,
    };
  },

  async extinguisherReport() {
    const now = new Date();
    const [total, daily, monthly, yearly, statusBreakdown] = await Promise.all([
      reportingRepository.countExtinguishers(),
      reportingRepository.countExtinguishersSince(startOfDay(now)),
      reportingRepository.countExtinguishersSince(startOfMonth(now)),
      reportingRepository.countExtinguishersSince(startOfYear(now)),
      reportingRepository.extinguisherStatusBreakdown(),
    ]);
    return {
      total,
      newExtinguishers: { daily, monthly, yearly },
      statusBreakdown,
    };
  },

  async inspectionStatusReport() {
    const breakdown = await reportingRepository.inspectionStatusBreakdown();
    return {
      pending: breakdown.PENDING ?? 0,
      completed: breakdown.COMPLETED ?? 0,
      overdue: breakdown.OVERDUE ?? 0,
      cancelled: breakdown.CANCELLED ?? 0,
      total: Object.values(breakdown).reduce((a, b) => a + b, 0),
    };
  },

  async expiredReport() {
    const expired = await reportingRepository.listExpired(new Date());
    return { count: expired.length, items: expired };
  },

  async maintenanceHistory() {
    const records = await reportingRepository.maintenanceWithExtinguisher();
    // Group by extinguisher.
    const groups = new Map<
      string,
      {
        extinguisherId: string;
        serialNumber: string;
        location: string;
        records: unknown[];
      }
    >();
    for (const rec of records) {
      const key = rec.extinguisherId;
      if (!groups.has(key)) {
        groups.set(key, {
          extinguisherId: key,
          serialNumber: rec.extinguisher.serialNumber,
          location: rec.extinguisher.location,
          records: [],
        });
      }
      groups.get(key)!.records.push({
        id: rec.id,
        actionTaken: rec.actionTaken,
        conditionNotes: rec.conditionNotes,
        maintenanceDate: rec.maintenanceDate,
        inspector: rec.inspector,
      });
    }
    return Array.from(groups.values());
  },

  async exportCsv(actorId?: string): Promise<string> {
    const items = await reportingRepository.allExtinguishers();
    const rows = items.map((e) => ({
      id: e.id,
      serialNumber: e.serialNumber,
      location: e.location,
      type: e.type,
      size: e.size,
      status: e.status,
      installationDate: e.installationDate.toISOString(),
      expiryDate: e.expiryDate.toISOString(),
    }));
    const fileName = generateCsv(rows, "extinguishers-report");
    await recordAudit({
      userId: actorId ?? null,
      action: "REPORT_EXPORTED_CSV",
      entity: "Report",
      metadata: { fileName, count: rows.length },
    });
    return fileName;
  },

  async exportPdf(actorId?: string): Promise<string> {
    const dashboard = await this.dashboard();
    const inspection = await this.inspectionStatusReport();
    const expired = await this.expiredReport();

    const sections: PdfSection[] = [
      {
        heading: "Overview",
        lines: [
          `Total Extinguishers: ${dashboard.totals.extinguishers}`,
          `Total Inspections: ${dashboard.totals.inspections}`,
          `Total Maintenance Records: ${dashboard.totals.maintenance}`,
          `Total Users: ${dashboard.totals.users}`,
          `Expired Extinguishers: ${dashboard.totals.expired}`,
        ],
      },
      {
        heading: "New Extinguishers Registered",
        lines: [
          `Today: ${dashboard.newExtinguishers.daily}`,
          `This Month: ${dashboard.newExtinguishers.monthly}`,
          `This Year: ${dashboard.newExtinguishers.yearly}`,
        ],
      },
      {
        heading: "Extinguisher Status Breakdown",
        lines: Object.entries(dashboard.extinguisherStatus).map(
          ([k, v]) => `${k}: ${v}`
        ),
      },
      {
        heading: "Inspection Status",
        lines: [
          `Pending: ${inspection.pending}`,
          `Completed: ${inspection.completed}`,
          `Overdue: ${inspection.overdue}`,
          `Cancelled: ${inspection.cancelled}`,
        ],
      },
      {
        heading: "Expired Extinguishers",
        lines: expired.items.length
          ? expired.items.map(
              (e) =>
                `${e.serialNumber} @ ${e.location} (expired ${e.expiryDate
                  .toISOString()
                  .slice(0, 10)})`
            )
          : ["No expired extinguishers."],
      },
    ];

    const fileName = await generatePdf(
      "FEMS Compliance Report",
      sections,
      "compliance-report"
    );
    await recordAudit({
      userId: actorId ?? null,
      action: "REPORT_EXPORTED_PDF",
      entity: "Report",
      metadata: { fileName },
    });
    return fileName;
  },
};
