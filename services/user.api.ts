import { apiRequest } from "@/lib/api-client";
import type { PublicUser, UserResponse } from "@/types/user";

export async function getMe(): Promise<UserResponse> {
  return apiRequest<UserResponse>("/users/me");
}

export async function updateMe(input: {
  name?: string;
}): Promise<UserResponse> {
  return apiRequest<UserResponse>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export type { PublicUser };
