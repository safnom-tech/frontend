"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Input";
import { notify, notifyApiError } from "@/lib/notify";
import * as authApi from "@/services/auth.api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenFromQuery = searchParams.get("token") ?? "";

  const [token, setToken] = useState(tokenFromQuery);
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authApi.resetPassword(token, newPassword);
      notify.success(res.message);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      notifyApiError(err, "Unable to reset password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
        {!tokenFromQuery ? (
          <div className="space-y-2">
            <FieldLabel htmlFor="token">Reset token</FieldLabel>
            <Input
              id="token"
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
        ) : null}
        <div className="space-y-2">
          <FieldLabel htmlFor="newPassword">New password</FieldLabel>
          <Input
            id="newPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
          />
        </div>
        <Button type="submit" disabled={submitting} className="w-full py-3">
          {submitting ? "Updating…" : "Update password"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted">
        <Link
          href="/login"
          className="font-medium text-brand hover:underline dark:text-accent-soft"
        >
          Back to sign in
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      variant="default"
      badge="Almost done"
      title="Choose a new password"
      subtitle="Use at least 8 characters for a strong, secure password."
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
