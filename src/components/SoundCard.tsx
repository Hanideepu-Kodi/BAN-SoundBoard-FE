"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { ListPlus, MoreHorizontal, Share2 } from "lucide-react";
import type { Playlist, Sound } from "@/lib/types";
import { cn } from "@/lib/utils";

type SoundCardProps = {
  sound: Sound;
  playlists?: Playlist[];
  onPlay: (sound: Sound) => void;
  onAddToPlaylist?: (playlistId: string, soundId: string) => void;
  onShare?: (sound: Sound) => void;
  onRequireAuth?: () => void;
};

export default function SoundCard({
  sound,
  playlists = [],
  onPlay,
  onAddToPlaylist,
  onShare,
  onRequireAuth,
}: SoundCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      if (!cardRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const creatorLabel =
    sound.creator?.display_name ||
    sound.creator?.handle ||
    (sound.owner_id ? `Creator ${sound.owner_id.slice(0, 6)}` : "Creator");

  const creatorId = sound.creator?.id ?? sound.owner_id ?? null;
  const creatorRoute = creatorId ? (`/creator/${creatorId}` as Route) : null;

  const tags = useMemo(() => sound.tags.slice(0, 3), [sound.tags]);

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={() => onPlay(sound)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onPlay(sound);
        }
      }}
      className="relative flex flex-col gap-4 rounded-2xl border border-white/5 bg-bg-card/80 p-4 shadow-panel transition hover:-translate-y-1 hover:border-brand-primary/60 focus-ring focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-base font-semibold text-white">{sound.name}</p>
          {creatorRoute ? (
            <Link
              href={creatorRoute}
              onClick={(event) => event.stopPropagation()}
              className="text-xs text-fg-muted hover:text-brand-primary"
            >
              {creatorLabel}
            </Link>
          ) : (
            <span className="text-xs text-fg-muted">{creatorLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-fg-muted">
            {sound.duration_seconds ? `${sound.duration_seconds}s` : "n/a"}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-fg-muted transition hover:text-white",
              menuOpen && "text-white"
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="h-20 rounded-xl bg-gradient-to-r from-brand-primary/15 via-brand-accent/10 to-brand-warm/15" />

      <div className="flex flex-wrap gap-2 text-xs text-fg-muted">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <span key={`${sound.id}-${tag}`} className="rounded-full bg-white/5 px-2 py-1">
              {tag}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-white/5 px-2 py-1">No tags</span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-fg-muted">
        <span>Click to play (stacks)</span>
        <span className="uppercase tracking-[0.2em] text-brand-primary">Live</span>
      </div>

      {menuOpen ? (
        <div
          className="absolute right-4 top-12 z-20 w-56 rounded-2xl border border-white/10 bg-bg-base/95 p-3 shadow-panel"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="space-y-2">
            {playlists.length > 0 ? (
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-[0.2em] text-fg-muted">Save to playlist</label>
                <select
                  className="select-theme w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus-ring focus-visible:outline-none"
                  onChange={(event) => {
                    const value = event.target.value;
                    if (!value) {
                      return;
                    }
                    onAddToPlaylist?.(value, sound.id);
                    event.currentTarget.value = "";
                    setMenuOpen(false);
                  }}
                >
                  <option value="">Select</option>
                  {playlists.map((playlist) => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : onRequireAuth ? (
              <button
                type="button"
                onClick={() => {
                  onRequireAuth?.();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-fg-muted"
              >
                <ListPlus className="h-4 w-4" />
                Sign in to save
              </button>
            ) : (
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-fg-muted"
              >
                <ListPlus className="h-4 w-4" />
                Create a playlist first
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onShare?.(sound);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-fg-muted"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
            {creatorRoute ? (
              <Link
                href={creatorRoute}
                onClick={(event) => event.stopPropagation()}
                className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-fg-muted"
              >
                View creator
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
