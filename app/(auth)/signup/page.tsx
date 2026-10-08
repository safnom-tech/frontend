"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthEmailDivider } from "@/components/auth/AuthEmailDivider";
import { AuthSwitchPrompt } from "@/components/auth/AuthSwitchPrompt";
import { SocialSignInButtons } from "@/components/auth/SocialSignInButtons";
import { AuthShell } from "@/components/AuthShell";
import { notifyApiError } from "@/lib/notify";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Input";
import { BrandWordmark } from "@/components/BrandWordmark";
import { useAuth } from "@/contexts/AuthContext";
export default function SignupPage() {
  const { signup, completeFirebaseLogin, user, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard/websites");
    }
  }, [loading, user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signup(email, password, name.trim() || undefined);
      router.push("/dashboard/websites/new");
    } catch (err) {
      notifyApiError(err, "Unable to sign up. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      variant="signup"
      title={
        <>
          Create your <BrandWordmark size="title" /> account
        </>
      }
      subtitle="Free to start. No credit card. Launch your business online in minutes."
      footer={
        <p className="text-xs leading-relaxed">
          By signing up, you agree to our terms of service and privacy policy.
        </p>
      }
    >
      <ul className="-mt-1 flex flex-wrap justify-center gap-2 text-xs font-medium text-muted">
        <li className="rounded-full border border-card-border bg-background/60 px-3 py-1">
          No code needed
        </li>
        <li className="rounded-full border border-card-border bg-background/60 px-3 py-1">
          Templates included
        </li>
        <li className="rounded-full border border-card-border bg-background/60 px-3 py-1">
          Hosting & SSL
        </li>
      </ul>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
        <div className="space-y-2">
          <FieldLabel htmlFor="name">Your name</FieldLabel>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sharma"
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="email">Business email</FieldLabel>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@yourshop.com"
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
          />
        </div>
        <Button type="submit" disabled={submitting} className="w-full py-3">
          {submitting ? "Creating account…" : "Create free account"}
        </Button>
      </form>

      <AuthSwitchPrompt
        prompt="Already have an account?"
        actionLabel="Sign in"
        href="/login"
      />
      <AuthEmailDivider />
      <SocialSignInButtons
        disabled={submitting}
        onAuthenticated={async (idToken) => {
          await completeFirebaseLogin(idToken);
          router.push("/dashboard/websites/new");
        }}
      />
    </AuthShell>
  );
}
