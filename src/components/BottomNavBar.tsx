"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, Library, Plus, User2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type BottomNavBarProps = {
  onCreate: () => void;
};

const navItems: ReadonlyArray<{ label: string; href: Route; icon: LucideIcon }> = [
  { label: "Home", href: "/", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Playlists", href: "/playlists", icon: Library },
  { label: "Profile", href: "/my-sounds", icon: User2 },
];

export default function BottomNavBar({ onCreate }: BottomNavBarProps) {
  const pathname = usePathname();

  const isActive = (href: Route) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="mx-auto w-full max-w-xl px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-1 rounded-3xl border border-white/10 bg-bg-base/90 px-3 py-2 shadow-panel backdrop-blur">
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] text-fg-muted transition",
                  active && "bg-white/10 text-brand-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={onCreate}
            className="flex h-12 w-12 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary via-brand-accent to-brand-warm text-bg-base shadow-glow"
            aria-label="Create"
          >
            <Plus className="h-5 w-5" />
          </button>

          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] text-fg-muted transition",
                  active && "bg-white/10 text-brand-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
