"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Input";
import { notify, notifyApiError } from "@/lib/notify";
import * as authApi from "@/services/auth.api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authApi.forgotPassword(email);
      notify.success(res.message);
    } catch (err) {
      notifyApiError(err, "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      variant="default"
      badge="Password help"
      title="Reset your password"
      subtitle="Enter your email and we’ll send a secure link if an account exists."
    >
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
        <div className="space-y-2">
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourbusiness.com"
          />
        </div>
        <Button type="submit" disabled={submitting} className="w-full py-3">
          {submitting ? "Sending…" : "Send reset link"}
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
    </AuthShell>
  );
}
