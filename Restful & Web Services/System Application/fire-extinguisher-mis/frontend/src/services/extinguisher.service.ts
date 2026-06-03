import { apiClient, unwrap } from "@/lib/axios";
import type { ApiResponse, ListQuery, PaginatedResult } from "@/types/api";
import type {
  Extinguisher,
  ExtinguisherSize,
  ExtinguisherStatus,
  ExtinguisherType,
} from "@/types/models";

export interface ExtinguisherListQuery extends ListQuery {
  status?: ExtinguisherStatus;
  type?: ExtinguisherType;
  size?: ExtinguisherSize;
  location?: string;
}

export interface CreateExtinguisherPayload {
  serialNumber: string;
  location: string;
  type: ExtinguisherType;
  size: ExtinguisherSize;
  installationDate: string;
  expiryDate: string;
  status?: ExtinguisherStatus;
}

export type UpdateExtinguisherPayload = Partial<CreateExtinguisherPayload>;

export const extinguisherService = {
  async list(
    query: ExtinguisherListQuery = {}
  ): Promise<PaginatedResult<Extinguisher>> {
    const { data } = await apiClient.get<ApiResponse<Extinguisher[]>>(
      "/extinguishers",
      { params: query }
    );
    return { data: data.data, pagination: data.pagination! };
  },

  async getById(id: string): Promise<Extinguisher> {
    const { data } = await apiClient.get<ApiResponse<Extinguisher>>(
      `/extinguishers/${id}`
    );
    return unwrap(data);
  },

  async create(payload: CreateExtinguisherPayload): Promise<Extinguisher> {
    const { data } = await apiClient.post<ApiResponse<Extinguisher>>(
      "/extinguishers",
      payload
    );
    return unwrap(data);
  },

  async update(
    id: string,
    payload: UpdateExtinguisherPayload
  ): Promise<Extinguisher> {
    const { data } = await apiClient.put<ApiResponse<Extinguisher>>(
      `/extinguishers/${id}`,
      payload
    );
    return unwrap(data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/extinguishers/${id}`);
  },
};
