export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: string;
  };
}

export interface HealthData {
  status: string;
  database: "connected" | "disconnected";
}

export type HealthResponse = ApiSuccessResponse<HealthData>;
