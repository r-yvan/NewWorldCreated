import { apiClient, unwrap } from "@/lib/axios";
import type { ApiResponse, ListQuery, PaginatedResult } from "@/types/api";
import type { Role, User } from "@/types/models";

export interface UserListQuery extends ListQuery {
  role?: Role;
  isActive?: boolean;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: Role;
  isActive?: boolean;
}

export type UpdateUserPayload = Partial<
  Omit<CreateUserPayload, "password">
>;

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const userService = {
  async list(query: UserListQuery = {}): Promise<PaginatedResult<User>> {
    const { data } = await apiClient.get<ApiResponse<User[]>>("/users", {
      params: query,
    });
    return { data: data.data, pagination: data.pagination! };
  },

  async getById(id: string): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return unwrap(data);
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await apiClient.post<ApiResponse<User>>("/users", payload);
    return unwrap(data);
  },

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const { data } = await apiClient.put<ApiResponse<User>>(
      `/users/${id}`,
      payload
    );
    return unwrap(data);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async getProfile(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>("/users/profile");
    return unwrap(data);
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await apiClient.put<ApiResponse<User>>(
      "/users/profile",
      payload
    );
    return unwrap(data);
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await apiClient.put("/users/change-password", {
      currentPassword,
      newPassword,
    });
  },
};
