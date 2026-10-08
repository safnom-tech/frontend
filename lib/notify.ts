import { toast } from "sonner";
import { ApiClientError } from "@/lib/api-client";

type ToastOpts = { description?: string };

export const notify = {
  success(message: string, opts?: ToastOpts) {
    toast.success(message, opts);
  },
  error(message: string, opts?: ToastOpts) {
    toast.error(message, opts);
  },
  info(message: string, opts?: ToastOpts) {
    toast.info(message, opts);
  },
  warning(message: string, opts?: ToastOpts) {
    toast.warning(message, opts);
  },
};

export function apiErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiClientError ? err.message : fallback;
}

export function notifyApiError(err: unknown, fallback: string): string {
  const message = apiErrorMessage(err, fallback);
  notify.error(message);
  return message;
}
