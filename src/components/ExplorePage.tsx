"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Playlist, Sound } from "@/lib/types";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/components/AuthProvider";
import { useAudio } from "@/components/AudioProvider";
import SoundCard from "@/components/SoundCard";

type TagOption = {
  label: string;
  slug: string;
  count: number;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function ExplorePage() {
  const { user, signInWithGoogle } = useAuth();
  const { playSound, setHotkeySounds } = useAudio();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedTag, setSelectedTag] = useState<TagOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const isAuthed = Boolean(user?.id);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const fetchSounds = useCallback(
    async (search?: string, tagSlug?: string) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) {
          params.set("q", search);
        }
        if (tagSlug) {
          params.set("tag", tagSlug);
        }
        const response = await apiFetch(`/sounds${params.toString() ? `?${params.toString()}` : ""}`, {
          skipAuth: !isAuthed,
        });
        if (!response.ok) {
          setSounds([]);
          setHotkeySounds([]);
          return;
        }
        const data = await response.json();
        const nextSounds = data.sounds ?? [];
        setSounds(nextSounds);
        setHotkeySounds(nextSounds.slice(0, 9));
      } catch (error) {
        console.error("Failed to load sounds", error);
      } finally {
        setLoading(false);
      }
    },
    [isAuthed, setHotkeySounds]
  );

  const fetchPlaylists = useCallback(async () => {
    if (!isAuthed) {
      setPlaylists([]);
      return;
    }
    try {
      const response = await apiFetch("/playlists");
      if (!response.ok) {
        setPlaylists([]);
        return;
      }
      const data = await response.json();
      setPlaylists(data.playlists ?? []);
    } catch (error) {
      console.error("Failed to load playlists", error);
    }
  }, [isAuthed]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchSounds(query.trim(), selectedTag?.slug);
    }, 250);
    return () => clearTimeout(handle);
  }, [fetchSounds, query, selectedTag]);

  const handleAddToPlaylist = async (playlistId: string, soundId: string) => {
    setStatus(null);
    if (!isAuthed) {
      setStatus("Sign in to save sounds.");
      return;
    }
    try {
      const response = await apiFetch(`/playlists/${playlistId}/sounds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soundId }),
      });
      if (!response.ok) {
        const error = await response.json();
        setStatus(error.error ?? "Could not save sound.");
        return;
      }
      setStatus("Saved to playlist.");
    } catch (error) {
      console.error("Failed to save sound", error);
      setStatus("Could not save sound.");
    }
  };

  const handleShare = async (sound: Sound) => {
    if (!sound.url) {
      return;
    }
    try {
      await navigator.clipboard.writeText(sound.url);
      setStatus("Sound link copied.");
    } catch (error) {
      console.error("Failed to copy link", error);
      setStatus("Copy failed. Try again.");
    }
  };

  const tagOptions = useMemo<TagOption[]>(() => {
    const counts = new Map<string, number>();
    sounds.forEach((sound) => {
      sound.tags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, slug: slugify(label), count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, 8);
  }, [sounds]);

  const sortedSounds = useMemo(() => {
    return [...sounds].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
  }, [sounds]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-primary">Explore</p>
          <h1 className="text-3xl font-semibold text-white">Search, filter, stack.</h1>
          <p className="text-sm text-fg-muted">Find the right hit and drop it into your mix.</p>
        </div>
      </div>

      {status ? <p className="text-xs text-brand-primary">{status}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTag(null)}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            !selectedTag
              ? "border border-brand-primary/40 bg-brand-primary/15 text-brand-primary"
              : "border border-white/10 bg-white/5 text-fg-muted"
          }`}
        >
          All
        </button>
        {tagOptions.length > 0 ? (
          tagOptions.map((tag) => (
            <button
              key={tag.slug}
              onClick={() => setSelectedTag(tag)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                selectedTag?.slug === tag.slug
                  ? "border border-brand-primary/40 bg-brand-primary/15 text-brand-primary"
                  : "border border-white/10 bg-white/5 text-fg-muted"
              }`}
            >
              {tag.label} - {tag.count}
            </button>
          ))
        ) : (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-fg-muted">
            Tags appear after uploads.
          </span>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
          Loading search results...
        </div>
      ) : sortedSounds.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
          No sounds yet. Try a different search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sortedSounds.map((sound) => (
            <SoundCard
              key={sound.id}
              sound={sound}
              playlists={playlists}
              onPlay={playSound}
              onAddToPlaylist={handleAddToPlaylist}
              onShare={handleShare}
              onRequireAuth={isAuthed ? undefined : signInWithGoogle}
            />
          ))}
        </div>
      )}
    </section>
  );
}
