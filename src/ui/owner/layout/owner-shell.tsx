"use client";
import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Bell, ChevronDown } from "lucide-react";
import { OwnerSidebar } from "./owner-sidebar";
import { navigation } from "./navigation";
import { Modal } from "@/ui/core/modal";
import { LogoutButton } from "@/ui/auth/logout-button";
import type { AuthenticatedUser } from "@/lib/auth/authorization";

export function OwnerShell({
  children,
  user,
}: {
  children: ReactNode;
  user: AuthenticatedUser;
}) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<"notifications" | "user" | null>(null);
  const path = usePathname();
  const title =
    navigation.flatMap((s) => s.items).find((i) => path === `/owner/${i.slug}`)
      ?.title ?? "Overview";
  const initials = user.displayName
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <div className="owner-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="desktop-sidebar">
        <OwnerSidebar />
      </aside>
      {open && (
        <Modal title="Navigation" drawer onClose={() => setOpen(false)}>
          <OwnerSidebar onNavigate={() => setOpen(false)} />
        </Modal>
      )}
      <div className="owner-body">
        <header className="owner-header">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="icon-button mobile-toggle"
              aria-label="Open navigation"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu size={21} />
            </button>
            <span className="header-breadcrumb">
              Workspace <span>/</span> <strong>{title}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              aria-expanded={panel === "notifications"}
              onClick={() =>
                setPanel(panel === "notifications" ? null : "notifications")
              }
            >
              <Bell size={19} />
              <span />
            </button>
            <button
              className="user-button"
              aria-label="Owner menu"
              aria-expanded={panel === "user"}
              onClick={() => setPanel(panel === "user" ? null : "user")}
            >
              <span className="avatar">{initials}</span>
              <span className="user-name">
                {user.displayName}<small>Owner</small>
              </span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>
        {panel && (
          <Modal
            title={
              panel === "notifications" ? "Notifications" : "Owner workspace"
            }
            onClose={() => setPanel(null)}
          >
            <div className="p-6">
              {panel === "notifications" ? (
                <>
                  <p className="font-medium">You’re all caught up</p>
                  <p className="muted mt-2 text-sm">
                    Live order and inventory notifications will appear here in a
                    future release.
                  </p>
                </>
              ) : (
                <>
                  <p>{user.displayName} · Owner</p>
                  <p className="muted my-3 text-sm">
                    @{user.username} · Coffee Garden
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/" className="button" onClick={() => setPanel(null)}>
                      Trang phát triển
                    </Link>
                    <LogoutButton />
                  </div>
                </>
              )}
            </div>
          </Modal>
        )}
        <main id="main-content" className="owner-content">
          {children}
          <footer className="page-footer">
            <span>© 2026 Coffee Garden</span>
            <span>
              Made for a better everyday.{" "}
              <span className="ml-2 text-green-800">♧</span>
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
