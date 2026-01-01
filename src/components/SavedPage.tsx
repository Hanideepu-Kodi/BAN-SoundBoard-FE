"use client";

import { useEffect, useState } from "react";
import type { Playlist } from "@/lib/types";
import { apiFetch } from "@/lib/api-client";
import PlaylistCard from "@/components/PlaylistCard";
import { useSavedPlaylists } from "@/lib/use-saved-playlists";
import { useAuth } from "@/components/AuthProvider";

export default function SavedPage() {
  const { user } = useAuth();
  const { savedIds, remove } = useSavedPlaylists();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (savedIds.length === 0) {
        setPlaylists([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const results = await Promise.all(
          savedIds.map(async (id) => {
            const response = await apiFetch(`/playlists/${id}`, { skipAuth: !user });
            if (!response.ok) {
              return null;
            }
            const data = await response.json();
            return data.playlist ?? null;
          })
        );
        setPlaylists(results.filter(Boolean) as Playlist[]);
      } catch (error) {
        console.error("Failed to load saved playlists", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [savedIds, user]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-brand-primary">Saved</p>
        <h1 className="text-3xl font-semibold text-white">Playlists you bookmarked.</h1>
        <p className="text-sm text-fg-muted">Keep your favorite creator boards close.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
          Loading saved playlists...
        </div>
      ) : playlists.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
          No saved playlists yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              href={`/playlists/${playlist.id}`}
              actions={
                <button
                  onClick={() => remove(playlist.id)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white"
                >
                  Remove
                </button>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
