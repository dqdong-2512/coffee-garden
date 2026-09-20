"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, ArrowUpRight } from "lucide-react";
import { navigation } from "./navigation";
import { cn } from "@/lib/utils";
import type { AuthenticatedUser } from "@/lib/auth/authorization";
export function Brand({ shopName }: { shopName: string }) {
  return (
    <Link href="/" className="brand">
      <span className="brand-icon">
        <Coffee size={23} />
      </span>
      <span>
        {shopName}<small>MANAGEMENT WORKSPACE</small>
      </span>
    </Link>
  );
}
export function OwnerSidebar({ shopName, user, onNavigate }: { shopName: string; user: AuthenticatedUser; onNavigate?: () => void }) {
  const path = usePathname();
  const development = process.env.NODE_ENV !== "production";
  return (
    <>
      <Brand shopName={shopName} />
      <nav aria-label="Management navigation" className="sidebar-nav">
        {navigation.map((section) => ({
          ...section,
          items: section.items.filter((item) => !("superAdminOnly" in item) || user.isSuperAdmin),
        })).filter((section) => section.items.length).map((section) => (
          <div className="nav-group" key={section.group}>
            {section.group && <p className="nav-label">{section.group}</p>}
            {section.items.map((item) => (
              <Link
                key={item.slug}
                href={`/owner/${item.slug}`}
                onClick={onNavigate}
                aria-current={
                  path === `/owner/${item.slug}` ? "page" : undefined
                }
                className={cn(
                  "nav-item",
                  path === `/owner/${item.slug}` && "active",
                )}
              >
                <item.icon size={17} />
                {item.title}
                {item.slug === "dashboard" && (
                  <span className="ml-auto text-xs">↗</span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      {development && <div className="sidebar-foot">
        <span className="status-dot" /> UI preview{" "}
        <Link href="/" aria-label="Development home">
          <ArrowUpRight size={16} />
        </Link>
      </div>}
    </>
  );
}
