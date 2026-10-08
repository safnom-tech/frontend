"use client";

import { FormEvent, useEffect, useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { ImageField } from "@/components/editor/media/ImageField";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Input";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { notify, notifyApiError } from "@/lib/notify";
import * as workspacesApi from "@/services/workspaces.api";
import {
  emptyBusinessProfile,
  type WorkspaceBusinessProfile,
} from "@/types/business-profile";

export function BusinessProfilePanel() {
  const { currentWorkspace, loading: wsLoading, refreshWorkspaces } =
    useWorkspace();
  const [profile, setProfile] = useState<WorkspaceBusinessProfile>(
    emptyBusinessProfile()
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentWorkspace?.businessProfile) {
      setProfile({ ...emptyBusinessProfile(), ...currentWorkspace.businessProfile });
    } else {
      setProfile(emptyBusinessProfile());
    }
  }, [currentWorkspace]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!currentWorkspace) return;
    if (!profile.businessName?.trim()) {
      notify.warning("Business name is required.");
      return;
    }
    setSubmitting(true);
    try {
      await workspacesApi.updateWorkspace(currentWorkspace.id, {
        businessProfile: profile,
      });
      await refreshWorkspaces();
      notify.success(
        "Business details saved. New themes will use this info automatically."
      );
    } catch (err) {
      notifyApiError(err, "Could not save details");
    } finally {
      setSubmitting(false);
    }
  }

  if (wsLoading) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (!currentWorkspace) {
    return (
      <p className="text-sm text-muted">
        Select a workspace to manage business details.
      </p>
    );
  }

  return (
    <div className="w-full max-w-none">
      <DashboardPageHeader
        title="Business profile"
        description="Fill this once per workspace. When you pick any website theme, we inject your name, logo, phone, email, and social links into the design — no retyping on each site."
      />

      <form
        onSubmit={(e) => void handleSave(e)}
        className="dashboard-panel mt-6 p-5 sm:p-6 lg:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Brand & contact
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                <FieldLabel htmlFor="business-name">Business name</FieldLabel>
                <Input
                  id="business-name"
                  value={profile.businessName ?? ""}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, businessName: e.target.value }))
                  }
                  required
                  placeholder="Ocean Crown Shipping LLC"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                <FieldLabel htmlFor="tagline">Tagline / subtitle</FieldLabel>
                <Input
                  id="tagline"
                  value={profile.tagline ?? ""}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, tagline: e.target.value }))
                  }
                  placeholder="Shipping Services LLC"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                <FieldLabel>Logo</FieldLabel>
                <ImageField
                  url={profile.logoUrl ?? ""}
                  alt={profile.businessName ?? "Logo"}
                  onUrlChange={(logoUrl) =>
                    setProfile((p) => ({ ...p, logoUrl: logoUrl || null }))
                  }
                  onAltChange={() => {}}
                  onClear={() => setProfile((p) => ({ ...p, logoUrl: null }))}
                />
              </div>
              <div>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  value={profile.phone ?? ""}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+1 555 0100"
                />
              </div>
              <div>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={profile.email ?? ""}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="hello@yourbusiness.com"
                />
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <textarea
                id="address"
                className="w-full rounded-xl border border-card-border bg-background px-3 py-2 text-sm"
                rows={3}
                value={profile.address ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="Optional — for future templates"
              />
            </div>
          </section>

          <section className="space-y-5">
            <fieldset className="space-y-4">
              <legend className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                Social links
              </legend>
              <p className="text-xs text-muted">
                Paste profile URLs. Footer and headers use these across themes.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["socialInstagram", "Instagram"],
                    ["socialFacebook", "Facebook"],
                    ["socialTwitter", "X / Twitter"],
                    ["socialLinkedin", "LinkedIn"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <FieldLabel htmlFor={key}>{label}</FieldLabel>
                    <Input
                      id={key}
                      value={profile[key] ?? ""}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, [key]: e.target.value }))
                      }
                      placeholder="https://…"
                    />
                  </div>
                ))}
              </div>
            </fieldset>
          </section>
        </div>

        <div className="mt-8 flex justify-end border-t border-card-border pt-6">
          <Button type="submit" disabled={submitting} className="shrink-0 sm:px-8">
            {submitting ? "Saving…" : "Save business profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
