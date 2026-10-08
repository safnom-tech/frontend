"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import {
  IconBusiness,
  IconDomains,
  IconExternal,
  IconMedia,
  IconMenu,
  IconOverview,
  IconWebsites,
  IconWorkspace,
} from "@/components/dashboard/DashboardNavIcons";
import { SafnomLogo } from "@/components/SafnomLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WorkspaceSelector } from "@/components/workspace/WorkspaceSelector";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Overview", Icon: IconOverview, exact: true },
  { href: "/dashboard/websites", label: "Websites", Icon: IconWebsites },
  { href: "/dashboard/business", label: "Business profile", Icon: IconBusiness },
  { href: "/dashboard/media", label: "Media", Icon: IconMedia },
  { href: "/dashboard/workspace", label: "Workspace", Icon: IconWorkspace },
  {
    href: "/dashboard/domains",
    label: "Domains (soon)",
    Icon: IconDomains,
  },
];

function userInitial(email: string) {
  return (email[0] ?? "?").toUpperCase();
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!authLoading && !user) {
      const from = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?from=${from}`);
    }
  }, [authLoading, user, router, pathname]);

  const isFullScreenEditor =
    /\/dashboard\/websites\/[^/]+\/(editor|preview)(\/|$)/.test(pathname) ||
    /\/dashboard\/websites\/themes\/[^/]+\/preview(\/|$)/.test(pathname);

  async function onLogout() {
    await logout();
    router.push("/login");
  }

  function navLinkClass(href: string, exact?: boolean) {
    const active = exact
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);
    return active ? "dashboard-nav-link dashboard-nav-link-active" : "dashboard-nav-link";
  }

  const sidebar = (
    <>
      <div className="flex h-14 shrink-0 items-center border-b border-[var(--dash-sidebar-border)] px-4 lg:h-16 lg:px-5">
        <SafnomLogo href="/dashboard" />
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
        <p className="dashboard-nav-section mb-2">Product</p>
        <nav className="flex flex-col gap-0.5">
          {navItems.map(({ href, label, Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={navLinkClass(href, exact)}
              onClick={() => setMobileNavOpen(false)}
            >
              <Icon className="h-[1.125rem] w-[1.125rem] shrink-0 opacity-80" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-3 pt-6">
          <p className="dashboard-nav-section mb-2">Workspace</p>
          <WorkspaceSelector variant="sidebar" />
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--dash-sidebar-border)] p-3">
        {user ? (
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-semibold text-brand-deep dark:text-accent-soft"
              aria-hidden
            >
              {userInitial(user.email)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name || "Account"}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
        ) : null}
        <div className="mt-2 flex flex-col gap-0.5">
          <Link href="/profile" className="dashboard-nav-link text-xs">
            Profile
          </Link>
          <Link
            href="/"
            className="dashboard-nav-link text-xs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconExternal className="h-4 w-4 shrink-0 opacity-70" />
            Marketing site
          </Link>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="dashboard-nav-link w-full text-left text-xs text-red-600 dark:text-red-400"
          >
            Log out
          </button>
        </div>
      </div>
    </>
  );

  if (isFullScreenEditor) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div className="dashboard-layout flex h-full min-h-0 flex-1">
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside
        className={`dashboard-sidebar fixed inset-y-0 left-0 z-50 flex h-full min-h-[100dvh] w-[15.5rem] flex-col border-r transition-transform duration-200 lg:static lg:h-full lg:min-h-0 lg:shrink-0 lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:pl-0">
        <header className="dashboard-sidebar sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 sm:px-6 lg:h-14">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-muted hover:bg-[var(--dash-nav-hover)] lg:hidden"
              aria-label="Open menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <IconMenu className="h-5 w-5" />
            </button>
            <p className="text-sm font-medium text-muted lg:hidden">Safnom</p>
          </div>
          <ThemeToggle className="shrink-0" />
        </header>

        <main className="flex-1 overflow-y-auto bg-[var(--dash-main)] px-4 py-6 text-foreground sm:px-5 sm:py-8 lg:px-6">
          <div className="mx-auto w-full max-w-[100rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
