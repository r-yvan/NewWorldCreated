import { apiClient, unwrap } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { AuthResult, AuthTokens, User } from "@/types/models";

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResult> {
    const { data } = await apiClient.post<ApiResponse<AuthResult>>(
      "/auth/register",
      payload
    );
    return unwrap(data);
  },

  async login(payload: LoginPayload): Promise<AuthResult> {
    const { data } = await apiClient.post<ApiResponse<AuthResult>>(
      "/auth/login",
      payload
    );
    return unwrap(data);
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post("/auth/logout", { refreshToken });
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const { data } = await apiClient.post<ApiResponse<AuthTokens>>(
      "/auth/refresh-token",
      { refreshToken }
    );
    return unwrap(data);
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User>>("/auth/me");
    return unwrap(data);
  },

  async forgotPassword(email: string): Promise<{ resetToken?: string }> {
    const { data } = await apiClient.post<ApiResponse<{ resetToken?: string }>>(
      "/auth/forgot-password",
      { email }
    );
    return unwrap(data);
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post("/auth/reset-password", { token, newPassword });
  },
};
