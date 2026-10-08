"use client";

import { useState } from "react";
import { ApiClientError } from "@/lib/api-client";
import { normalizeMongoObjectId } from "@/lib/mongo-id";
import * as inquiriesApi from "@/services/inquiries.api";
import type { ContactInquiryTarget } from "@/types/inquiry";

export function ContactInquiryForm({
  target,
  submitLabel = "Send message",
  successMessage = "Thanks — your message was sent. We’ll reply soon.",
  className = "",
  dark = false,
}: {
  target: ContactInquiryTarget;
  submitLabel?: string;
  successMessage?: string;
  className?: string;
  dark?: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const workspaceId = normalizeMongoObjectId(target.workspaceId);
      const websiteId = normalizeMongoObjectId(target.websiteId);
      const payload = {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        ...(websiteId ? { websiteId } : {}),
      };
      if (workspaceId) {
        await inquiriesApi.submitWorkspaceInquiry(workspaceId, payload);
      } else if (target.websitePublicId) {
        await inquiriesApi.submitPublicWebsiteInquiry(
          target.websitePublicId,
          payload
        );
      } else {
        setStatus("error");
        setError("Contact form is not configured for this page.");
        return;
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not send your message. Try again later."
      );
    }
  }

  if (status === "sent") {
    return (
      <p
        className={`mt-6 rounded-lg border px-4 py-3 text-sm ${
          dark
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
            : "border-emerald-200 bg-emerald-50 text-emerald-900"
        }`}
        role="status"
      >
        {successMessage}
      </p>
    );
  }

  const inputClass = dark
    ? "w-full rounded-md border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/50"
    : "w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-500";

  const labelClass = dark
    ? "mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70"
    : "mb-1 block text-xs font-medium text-neutral-700";

  return (
    <form onSubmit={(e) => void onSubmit(e)} className={`mt-6 space-y-4 ${className}`}>
      <div className="grid gap-4 @md/site:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="inq-name">
            Your name
          </label>
          <input
            id="inq-name"
            required
            maxLength={120}
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="inq-email">
            Your email
          </label>
          <input
            id="inq-email"
            type="email"
            required
            maxLength={254}
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="inq-message">
          Message
        </label>
        <textarea
          id="inq-message"
          required
          maxLength={5000}
          rows={5}
          className={`${inputClass} resize-y min-h-[120px]`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "sending"}
        className={
          dark
            ? "inline-flex rounded-full border border-white bg-white px-8 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-900 transition hover:bg-transparent hover:text-white disabled:opacity-60"
            : "inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-black/10 disabled:opacity-60"
        }
        style={dark ? undefined : { background: "var(--editor-primary)" }}
      >
        {status === "sending" ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
