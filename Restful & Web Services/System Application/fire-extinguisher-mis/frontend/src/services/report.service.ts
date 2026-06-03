import { apiClient, unwrap } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type {
  DashboardReport,
  ExpiredReport,
  ExportResult,
  ExtinguisherReport,
  InspectionStatusReport,
  MaintenanceHistoryGroup,
} from "@/types/models";

export const reportService = {
  async dashboard(): Promise<DashboardReport> {
    const { data } = await apiClient.get<ApiResponse<DashboardReport>>(
      "/reports/dashboard"
    );
    return unwrap(data);
  },

  async extinguishers(): Promise<ExtinguisherReport> {
    const { data } = await apiClient.get<ApiResponse<ExtinguisherReport>>(
      "/reports/extinguishers"
    );
    return unwrap(data);
  },

  async inspectionStatus(): Promise<InspectionStatusReport> {
    const { data } = await apiClient.get<ApiResponse<InspectionStatusReport>>(
      "/reports/inspection-status"
    );
    return unwrap(data);
  },

  async expired(): Promise<ExpiredReport> {
    const { data } = await apiClient.get<ApiResponse<ExpiredReport>>(
      "/reports/expired"
    );
    return unwrap(data);
  },

  async maintenanceHistory(): Promise<MaintenanceHistoryGroup[]> {
    const { data } = await apiClient.get<ApiResponse<MaintenanceHistoryGroup[]>>(
      "/reports/maintenance-history"
    );
    return unwrap(data);
  },

  async exportPdf(): Promise<ExportResult> {
    const { data } = await apiClient.get<ApiResponse<ExportResult>>(
      "/reports/export/pdf"
    );
    return unwrap(data);
  },

  async exportCsv(): Promise<ExportResult> {
    const { data } = await apiClient.get<ApiResponse<ExportResult>>(
      "/reports/export/csv"
    );
    return unwrap(data);
  },

  // Downloads a generated report through the authenticated endpoint and
  // triggers a browser save dialog.
  async downloadAndSave(fileName: string): Promise<void> {
    const response = await apiClient.get(`/reports/download/${fileName}`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async exportAndDownload(type: "pdf" | "csv"): Promise<string> {
    const result =
      type === "pdf" ? await this.exportPdf() : await this.exportCsv();
    await this.downloadAndSave(result.fileName);
    return result.fileName;
  },
};
