"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { AuthEmailDivider } from "@/components/auth/AuthEmailDivider";
import { AuthSwitchPrompt } from "@/components/auth/AuthSwitchPrompt";
import { SocialSignInButtons } from "@/components/auth/SocialSignInButtons";
import { AuthShell } from "@/components/AuthShell";
import { notifyApiError } from "@/lib/notify";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Input";
import { BrandWordmark } from "@/components/BrandWordmark";
import { useAuth } from "@/contexts/AuthContext";
import { safeInternalPath } from "@/lib/safe-redirect";

function LoginForm() {
  const { login, completeFirebaseLogin, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = safeInternalPath(searchParams.get("from"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(from);
    }
  }, [loading, user, router, from]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      router.push(from);
    } catch (err) {
      notifyApiError(err, "Unable to log in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
      </div>
    );
  }

  return (
    <>
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
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-brand hover:underline dark:text-accent-soft"
            >
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        <Button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 text-base font-semibold"
        >
          {submitting ? "Signing in…" : "Sign in to your account"}
        </Button>
      </form>
      <AuthSwitchPrompt
        prompt="New to SafNom?"
        actionLabel="Create a free account"
        href="/signup"
      />
      <AuthEmailDivider />
      <SocialSignInButtons
        disabled={submitting}
        onAuthenticated={async (idToken) => {
          await completeFirebaseLogin(idToken);
          router.push(from);
        }}
      />
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      variant="login"
      title={
        <>
          Sign in to <BrandWordmark size="title" />
        </>
      }
      subtitle="Manage your website, update your business details, and publish — all from one place."
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
