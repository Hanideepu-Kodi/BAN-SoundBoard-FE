"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Playlist, Sound } from "@/lib/types";
import { useAudio } from "@/components/AudioProvider";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";

type DiscoverSectionProps = {
  refreshKey?: number;
  query?: string;
  onQueryChange?: (value: string) => void;
};

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

export default function DiscoverSection({ refreshKey, query: externalQuery, onQueryChange }: DiscoverSectionProps) {
  const { user, signInWithGoogle } = useAuth();
  const { playSound, setHotkeySounds } = useAudio();
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [localQuery, setLocalQuery] = useState(externalQuery ?? "");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<TagOption | null>(null);
  const [sortMode, setSortMode] = useState<"newest" | "name">("newest");

  const isAuthed = Boolean(user?.id);
  const queryValue = externalQuery ?? localQuery;

  useEffect(() => {
    if (externalQuery !== undefined) {
      setLocalQuery(externalQuery);
    }
  }, [externalQuery]);

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
  }, [fetchPlaylists, refreshKey]);

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchSounds(queryValue.trim(), selectedTag?.slug);
    }, 300);
    return () => clearTimeout(handle);
  }, [fetchSounds, queryValue, selectedTag, refreshKey]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    fetchSounds(queryValue.trim(), selectedTag?.slug);
  };

  const handleQueryChange = (value: string) => {
    setLocalQuery(value);
    onQueryChange?.(value);
  };

  const handleTagSelect = (tag: TagOption | null) => {
    setSelectedTag((prev) => {
      if (tag && prev?.slug === tag.slug) {
        return null;
      }
      return tag;
    });
  };

  const handleAddToBoard = async (playlistId: string, soundId: string) => {
    setStatus(null);
    if (!isAuthed) {
      setStatus("Sign in to add sounds to a board.");
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
        setStatus(error.error ?? "Could not add sound.");
        return;
      }

      setStatus("Added to board.");
    } catch (error) {
      console.error("Failed to add to playlist", error);
      setStatus("Could not add sound.");
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
    const list = [...sounds];
    if (sortMode === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
      return list;
    }
    return list.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
  }, [sounds, sortMode]);

  return (
    <section id="discover" className="container mx-auto px-6 pb-14">
      <div className="glass-card rounded-3xl p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">Discover</p>
            <h2 className="text-3xl font-semibold text-white">Search, filter, trigger.</h2>
            <p className="text-sm text-fg-muted">
              Faceted search with live tags and quick filters. Preview without leaving the grid.
            </p>
          </div>
          <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center gap-2">
            <input
              value={queryValue}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Search sounds"
              className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-fg-muted focus-ring focus-visible:outline-none"
            />
            <button
              type="submit"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:-translate-y-0.5"
            >
              Search
            </button>
          </form>
        </div>

        {status ? <p className="mt-3 text-xs text-brand-primary">{status}</p> : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTagSelect(null)}
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
                    onClick={() => handleTagSelect(tag)}
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
                  Tags appear after your first uploads.
                </span>
              )}
            </div>

            {loading ? (
              <div className="text-sm text-fg-muted">Loading sounds...</div>
            ) : sortedSounds.length === 0 ? (
              <div className="glass-card rounded-2xl p-4 text-sm text-fg-muted">
                No sounds yet. Upload your first sound to light up the grid.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sortedSounds.map((sound) => (
                  <div
                    key={sound.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-bg-card/80 p-4 shadow-panel transition hover:-translate-y-1 hover:border-brand-primary/60"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white">{sound.name}</p>
                      <span className="text-[11px] text-fg-muted">
                        {sound.duration_seconds ? `${sound.duration_seconds}s` : "n/a"}
                      </span>
                    </div>
                    <div className="h-16 rounded-lg bg-gradient-to-r from-brand-primary/20 via-brand-accent/15 to-brand-warm/20" />
                    <div className="flex flex-wrap gap-2 text-xs text-fg-muted">
                      {sound.tags.length > 0 ? (
                        sound.tags.map((tag) => (
                          <button
                            key={`${sound.id}-${tag}`}
                            onClick={() => handleTagSelect({ label: tag, slug: slugify(tag), count: 0 })}
                            className="rounded-full bg-white/5 px-2 py-1"
                          >
                            {tag}
                          </button>
                        ))
                      ) : (
                        <span className="rounded-full bg-white/5 px-2 py-1">untagged</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => playSound(sound)}
                        className="rounded-full bg-brand-primary/15 px-2 py-1 text-xs text-brand-primary"
                      >
                        Play
                      </button>
                      {playlists.length > 0 ? (
                        <select
                          className="select-theme flex-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white focus-ring focus-visible:outline-none"
                          onChange={(event) => {
                            const value = event.target.value;
                            if (value) {
                              handleAddToBoard(value, sound.id);
                              event.currentTarget.value = "";
                            }
                          }}
                        >
                          <option value="">Add to board</option>
                          {playlists.map((playlist) => (
                            <option key={playlist.id} value={playlist.id}>
                              {playlist.name}
                            </option>
                          ))}
                        </select>
                      ) : isAuthed ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-fg-muted">
                          Create a board to add
                        </span>
                      ) : (
                        <button
                          onClick={() => signInWithGoogle()}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-fg-muted"
                        >
                          Sign in to add
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-2xl border border-white/5 bg-bg-card/80 p-4 shadow-panel">
            <h4 className="text-lg font-semibold text-white">Filters</h4>
            <div className="space-y-2 text-sm text-fg-muted">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <span>Query</span>
                <span className="text-white">{queryValue ? `"${queryValue}"` : "All sounds"}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <span>Tag</span>
                <span className="text-white">{selectedTag ? selectedTag.label : "Any"}</span>
              </div>
              <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <span>Sort</span>
                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as "newest" | "name")}
                  className="select-theme rounded-md border border-white/10 bg-bg-base/60 px-2 py-1 text-xs text-white focus-ring focus-visible:outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="name">Name</option>
                </select>
              </label>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <span>Results</span>
                <span className="text-white">{sortedSounds.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
