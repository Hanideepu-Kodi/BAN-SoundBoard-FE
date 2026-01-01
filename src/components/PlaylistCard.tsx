"use client";

import type { Route } from "next";
import Link from "next/link";
import type { Playlist } from "@/lib/types";

type PlaylistCardProps = {
  playlist: Playlist;
  href: Route;
  actions?: React.ReactNode;
  showCreator?: boolean;
};

export default function PlaylistCard({ playlist, href, actions, showCreator = true }: PlaylistCardProps) {
  const creatorLabel =
    playlist.creator?.display_name ||
    playlist.creator?.handle ||
    (playlist.owner_id ? `Creator ${playlist.owner_id.slice(0, 6)}` : null);

  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/5 bg-bg-card/80 p-4 shadow-panel transition hover:-translate-y-1 hover:border-brand-primary/60">
      <div className="space-y-2">
        <Link href={href} className="text-lg font-semibold text-white">
          {playlist.name}
        </Link>
        {showCreator && creatorLabel ? <p className="text-xs text-fg-muted">{creatorLabel}</p> : null}
        <div className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
            {playlist.sound_count} sounds
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
            {playlist.privacy.replace("_", "-")}
          </span>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
