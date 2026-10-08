import type { ApiSuccessResponse } from "./api";

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserResponse = ApiSuccessResponse<PublicUser>;
