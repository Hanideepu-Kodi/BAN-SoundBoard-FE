"use client";

import { useEffect, useRef, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Search } from "lucide-react";

type HeaderProps = {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
};

export default function Header({ searchQuery, onSearchChange, onSearchSubmit }: HeaderProps) {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [internalQuery, setInternalQuery] = useState(searchParams.get("q") ?? "");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const controlled = typeof onSearchChange === "function";
  const query = controlled ? searchQuery ?? "" : internalQuery;

  useEffect(() => {
    if (controlled) {
      return;
    }
    setInternalQuery(searchParams.get("q") ?? "");
  }, [controlled, searchParams]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (!mobileSearchOpen) {
      return;
    }
    const handle = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(handle);
  }, [mobileSearchOpen]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = query.trim();
    if (onSearchSubmit) {
      onSearchSubmit(next);
      return;
    }
    const target = `/explore${next ? `?q=${encodeURIComponent(next)}` : ""}` as Route;
    if (pathname === "/explore") {
      router.push(target);
      return;
    }
    router.push(target);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-bg-base/70 backdrop-blur">
      <div className="md:hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/90 via-brand-accent/80 to-brand-warm/70 shadow-glow">
              <span className="text-xs font-semibold text-bg-base">KB</span>
            </div>
            <span className="sr-only">Kodi-board</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
        {mobileSearchOpen ? (
          <form onSubmit={handleSubmit} className="px-6 pb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                suppressHydrationWarning
                onChange={(event) => {
                  const value = event.target.value;
                  if (controlled) {
                    onSearchChange?.(value);
                  } else {
                    setInternalQuery(value);
                  }
                }}
                placeholder="Search sounds, tags, creators"
                className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-11 pr-4 text-sm text-white placeholder:text-fg-muted focus-ring focus-visible:outline-none"
              />
            </div>
          </form>
        ) : null}
      </div>

      <div className="hidden md:grid md:grid-cols-[1fr_minmax(240px,520px)_1fr] md:items-center md:gap-4 md:px-6 md:py-4">
        <div className="hidden md:block" />
        <form onSubmit={handleSubmit} className="relative w-full max-w-xl justify-self-center">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            suppressHydrationWarning
            onChange={(event) => {
              const value = event.target.value;
              if (controlled) {
                onSearchChange?.(value);
              } else {
                setInternalQuery(value);
              }
            }}
            placeholder="Search sounds, tags, creators"
            className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-11 pr-4 text-sm text-white placeholder:text-fg-muted focus-ring focus-visible:outline-none"
          />
        </form>
        <div className="flex items-center justify-end gap-3">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-full bg-white/10" />
          ) : user ? null : (
            <button
              onClick={() => signInWithGoogle()}
              className="rounded-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-warm px-4 py-2 text-sm font-semibold text-bg-base shadow-glow transition hover:-translate-y-0.5"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
