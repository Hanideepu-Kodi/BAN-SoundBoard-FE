"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Library, Bookmark, User2, Plus, LogIn, LogOut } from "lucide-react";
import Header from "@/components/Header";
import UploadModal from "@/components/UploadModal";
import ConfirmModal from "@/components/ConfirmModal";
import BottomNavBar from "@/components/BottomNavBar";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "My Sounds", href: "/my-sounds", icon: User2 },
  { label: "Playlists", href: "/playlists", icon: Library },
  { label: "Saved", href: "/saved", icon: Bookmark },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const labelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  useEffect(() => {
    if (labelTimerRef.current) {
      clearTimeout(labelTimerRef.current);
      labelTimerRef.current = null;
    }
    if (sidebarOpen) {
      labelTimerRef.current = setTimeout(() => {
        setShowLabels(true);
      }, 200);
    } else {
      setShowLabels(false);
    }
    return () => {
      if (labelTimerRef.current) {
        clearTimeout(labelTimerRef.current);
        labelTimerRef.current = null;
      }
    };
  }, [sidebarOpen]);

  const primaryNav = useMemo(
    () =>
      navLinks.map((link) => {
        const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <SidebarLink
            key={link.href}
            link={{
              label: link.label,
              href: link.href,
              icon: <Icon className={cn("h-4 w-4", isActive ? "text-brand-primary" : "text-fg-muted")} />,
            }}
            className={cn(
              "text-sm",
              isActive && "bg-white/10 text-white",
              pathname !== link.href && "text-fg-muted"
            )}
          />
        );
      }),
    [pathname]
  );

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
          <SidebarBody className="gap-6">
            <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center")}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/90 via-brand-accent/80 to-brand-warm/70 shadow-glow">
                <span className="text-sm font-semibold text-bg-base">KB</span>
              </div>
              {showLabels ? (
                <div>
                  <Link href="/" className="text-base font-semibold text-white">
                    Kodi-board
                  </Link>
                  <p className="text-xs text-fg-muted">Sound stacks for creators</p>
                </div>
              ) : null}
            </div>

            <nav className="flex flex-1 flex-col gap-1">{primaryNav}</nav>

            <div className="mt-auto space-y-3">
              <button
                onClick={() => setUploadOpen(true)}
                aria-label="Create"
                className={cn(
                  "flex items-center justify-center rounded-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-warm text-sm font-semibold text-bg-base shadow-glow transition hover:-translate-y-0.5",
                  sidebarOpen ? "w-full gap-2 px-4 py-2" : "h-11 w-11 self-center"
                )}
              >
                <Plus className="h-4 w-4" />
                <span className={cn(!showLabels && "sr-only")}>Create</span>
              </button>
              {loading ? (
                <div
                  className={cn(
                    "animate-pulse rounded-2xl bg-white/5",
                    sidebarOpen ? "h-10 w-full" : "h-11 w-11 self-center"
                  )}
                />
              ) : user ? (
                <button
                  onClick={() => setSignOutOpen(true)}
                  aria-label="Sign out"
                  className={cn(
                    "flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-white",
                    sidebarOpen ? "w-full gap-2 px-4 py-2" : "h-11 w-11 self-center"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  <span className={cn(!showLabels && "sr-only")}>Sign out</span>
                </button>
              ) : (
                <button
                  onClick={() => signInWithGoogle()}
                  aria-label="Sign in"
                  className={cn(
                    "flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-white",
                    sidebarOpen ? "w-full gap-2 px-4 py-2" : "h-11 w-11 self-center"
                  )}
                >
                  <LogIn className="h-4 w-4" />
                  <span className={cn(!showLabels && "sr-only")}>Sign in</span>
                </button>
              )}
            </div>
          </SidebarBody>
        </Sidebar>

        <div className="flex min-h-screen flex-1 flex-col">
          <Header />
          <div className="flex-1 px-6 pb-28 pt-8 md:pb-8">{children}</div>
        </div>
      </div>
      <BottomNavBar onCreate={() => setUploadOpen(true)} />
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <ConfirmModal
        open={signOutOpen}
        title="Sign out?"
        description="You can sign back in anytime to access your sounds and playlists."
        confirmLabel="Sign out"
        onClose={() => setSignOutOpen(false)}
        onConfirm={async () => {
          await signOut();
          setSignOutOpen(false);
        }}
      />
    </div>
  );
}
