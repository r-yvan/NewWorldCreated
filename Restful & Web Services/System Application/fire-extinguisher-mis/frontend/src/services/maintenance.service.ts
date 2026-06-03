import { apiClient, unwrap } from "@/lib/axios";
import type { ApiResponse, ListQuery, PaginatedResult } from "@/types/api";
import type { Maintenance } from "@/types/models";

export interface MaintenanceListQuery extends ListQuery {
  extinguisherId?: string;
  inspectorId?: string;
}

export interface CreateMaintenancePayload {
  extinguisherId: string;
  actionTaken: string;
  conditionNotes: string;
  maintenanceDate: string;
  inspectorId?: string;
}

export interface UpdateMaintenancePayload {
  actionTaken?: string;
  conditionNotes?: string;
  maintenanceDate?: string;
  inspectorId?: string | null;
}

export const maintenanceService = {
  async list(
    query: MaintenanceListQuery = {}
  ): Promise<PaginatedResult<Maintenance>> {
    const { data } = await apiClient.get<ApiResponse<Maintenance[]>>(
      "/maintenance",
      { params: query }
    );
    return { data: data.data, pagination: data.pagination! };
  },

  async getById(id: string): Promise<Maintenance> {
    const { data } = await apiClient.get<ApiResponse<Maintenance>>(
      `/maintenance/${id}`
    );
    return unwrap(data);
  },

  async create(payload: CreateMaintenancePayload): Promise<Maintenance> {
    const { data } = await apiClient.post<ApiResponse<Maintenance>>(
      "/maintenance",
      payload
    );
    return unwrap(data);
  },

  async update(
    id: string,
    payload: UpdateMaintenancePayload
  ): Promise<Maintenance> {
    const { data } = await apiClient.put<ApiResponse<Maintenance>>(
      `/maintenance/${id}`,
      payload
    );
    return unwrap(data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/maintenance/${id}`);
  },
};
