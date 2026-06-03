import { apiClient, unwrap } from "@/lib/axios";
import type { ApiResponse, ListQuery, PaginatedResult } from "@/types/api";
import type { Inspection, InspectionStatus } from "@/types/models";

export interface InspectionListQuery extends ListQuery {
  status?: InspectionStatus;
  extinguisherId?: string;
  inspectorId?: string;
}

export interface CreateInspectionPayload {
  extinguisherId: string;
  scheduledDate: string;
  scheduledTime: string;
  inspectorId?: string;
  notes?: string;
}

export interface UpdateInspectionPayload {
  scheduledDate?: string;
  scheduledTime?: string;
  inspectorId?: string | null;
  status?: InspectionStatus;
  notes?: string;
}

export const inspectionService = {
  async list(
    query: InspectionListQuery = {}
  ): Promise<PaginatedResult<Inspection>> {
    const { data } = await apiClient.get<ApiResponse<Inspection[]>>(
      "/inspections",
      { params: query }
    );
    return { data: data.data, pagination: data.pagination! };
  },

  async getById(id: string): Promise<Inspection> {
    const { data } = await apiClient.get<ApiResponse<Inspection>>(
      `/inspections/${id}`
    );
    return unwrap(data);
  },

  async create(payload: CreateInspectionPayload): Promise<Inspection> {
    const { data } = await apiClient.post<ApiResponse<Inspection>>(
      "/inspections",
      payload
    );
    return unwrap(data);
  },

  async update(
    id: string,
    payload: UpdateInspectionPayload
  ): Promise<Inspection> {
    const { data } = await apiClient.put<ApiResponse<Inspection>>(
      `/inspections/${id}`,
      payload
    );
    return unwrap(data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/inspections/${id}`);
  },
};
