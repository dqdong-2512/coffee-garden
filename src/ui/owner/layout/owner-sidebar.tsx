"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, ArrowUpRight } from "lucide-react";
import { navigation } from "./navigation";
import { cn } from "@/lib/utils";
export function Brand() {
  return (
    <Link href="/" className="brand">
      <span className="brand-icon">
        <Coffee size={23} />
      </span>
      <span>
        Coffee Garden<small>OWNER WORKSPACE</small>
      </span>
    </Link>
  );
}
export function OwnerSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <>
      <Brand />
      <nav aria-label="Owner navigation" className="sidebar-nav">
        {navigation.map((section) => (
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
      <div className="sidebar-foot">
        <span className="status-dot" /> UI preview{" "}
        <Link href="/" aria-label="Development home">
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </>
  );
}
