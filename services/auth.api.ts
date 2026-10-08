import { apiRequest } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/types/api";
import type { PublicUser } from "@/types/user";

export interface SignupInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function signup(
  input: SignupInput
): Promise<ApiSuccessResponse<PublicUser>> {
  return apiRequest<ApiSuccessResponse<PublicUser>>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function login(
  input: LoginInput
): Promise<ApiSuccessResponse<PublicUser>> {
  return apiRequest<ApiSuccessResponse<PublicUser>>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function loginWithFirebase(
  idToken: string
): Promise<ApiSuccessResponse<PublicUser>> {
  return apiRequest<ApiSuccessResponse<PublicUser>>("/auth/firebase", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

export async function logout(): Promise<ApiSuccessResponse<null>> {
  return apiRequest<ApiSuccessResponse<null>>("/auth/logout", {
    method: "POST",
  });
}

export async function forgotPassword(
  email: string
): Promise<ApiSuccessResponse<null>> {
  return apiRequest<ApiSuccessResponse<null>>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<ApiSuccessResponse<null>> {
  return apiRequest<ApiSuccessResponse<null>>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}
