"use client";

import { useEffect, useMemo, useState } from "react";
import type { Playlist, Sound } from "@/lib/types";
import { useAudio } from "@/components/AudioProvider";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";

type SoundsByPlaylist = Record<string, Sound[]>;

type ActivityEntry = {
  label: string;
  time: string;
  timestamp: number;
};

const formatRelativeTime = (value: string | null) => {
  if (!value) {
    return "Just now";
  }
  const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (diffSeconds < 10) {
    return "Just now";
  }
  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function DashboardSection() {
  const { user, signInWithGoogle } = useAuth();
  const { playSound } = useAudio();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentSounds, setRecentSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("link_only");
  const [status, setStatus] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [playlistSounds, setPlaylistSounds] = useState<SoundsByPlaylist>({});
  const [soundsLoading, setSoundsLoading] = useState<Record<string, boolean>>({});
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [sharePlaylistName, setSharePlaylistName] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [shareLoadingId, setShareLoadingId] = useState<string | null>(null);

  const isAuthed = Boolean(user?.id);

  const fetchPlaylists = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentSounds = async () => {
    try {
      const response = await apiFetch("/sounds");
      if (!response.ok) {
        setRecentSounds([]);
        return;
      }
      const data = await response.json();
      setRecentSounds(data.sounds ?? []);
    } catch (error) {
      console.error("Failed to load sounds", error);
    }
  };

  const fetchPlaylistSounds = async (playlistId: string) => {
    setSoundsLoading((prev) => ({ ...prev, [playlistId]: true }));
    try {
      const response = await apiFetch(`/playlists/${playlistId}`);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setPlaylistSounds((prev) => ({ ...prev, [playlistId]: data.sounds ?? [] }));
    } catch (error) {
      console.error("Failed to load playlist sounds", error);
    } finally {
      setSoundsLoading((prev) => ({ ...prev, [playlistId]: false }));
    }
  };

  useEffect(() => {
    if (isAuthed) {
      fetchPlaylists();
      fetchRecentSounds();
    } else {
      setLoading(false);
      setPlaylists([]);
      setRecentSounds([]);
    }
  }, [isAuthed]);

  const activityFeed = useMemo(() => {
    if (!isAuthed) {
      return [];
    }
    const entries: ActivityEntry[] = [];
    playlists.forEach((playlist) => {
      entries.push({
        label: `Board "${playlist.name}" created`,
        time: formatRelativeTime(playlist.created_at),
        timestamp: playlist.created_at ? new Date(playlist.created_at).getTime() : 0,
      });
    });
    recentSounds.slice(0, 6).forEach((sound) => {
      entries.push({
        label: `Sound "${sound.name}" uploaded`,
        time: formatRelativeTime(sound.created_at),
        timestamp: sound.created_at ? new Date(sound.created_at).getTime() : 0,
      });
    });
    return entries
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6)
      .map(({ label, time }) => ({ label, time }));
  }, [isAuthed, playlists, recentSounds]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);

    if (!isAuthed) {
      setStatus("Sign in to create boards.");
      return;
    }

    if (!name.trim()) {
      setStatus("Name is required.");
      return;
    }

    try {
      const response = await apiFetch("/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          privacy,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setStatus(error.error ?? "Could not create playlist.");
        return;
      }

      setName("");
      setDescription("");
      setPrivacy("link_only");
      setStatus("Board created.");
      fetchPlaylists();
    } catch (error) {
      console.error("Failed to create playlist", error);
      setStatus("Could not create playlist.");
    }
  };

  const handleToggle = (playlistId: string) => {
    const nextId = expandedId === playlistId ? null : playlistId;
    setExpandedId(nextId);
    if (nextId && !playlistSounds[nextId]) {
      fetchPlaylistSounds(nextId);
    }
  };

  const handleRemoveSound = async (playlistId: string, soundId: string) => {
    try {
      const response = await apiFetch(`/playlists/${playlistId}/sounds`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soundId }),
      });
      if (!response.ok) {
        return;
      }
      setPlaylistSounds((prev) => ({
        ...prev,
        [playlistId]: (prev[playlistId] ?? []).filter((sound) => sound.id !== soundId),
      }));
    } catch (error) {
      console.error("Failed to remove sound", error);
    }
  };

  const handleReorder = async (playlistId: string, fromIndex: number, toIndex: number) => {
    const list = [...(playlistSounds[playlistId] ?? [])];
    if (toIndex < 0 || toIndex >= list.length) {
      return;
    }
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    setPlaylistSounds((prev) => ({ ...prev, [playlistId]: list }));

    try {
      await apiFetch(`/playlists/${playlistId}/sounds`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soundIds: list.map((sound) => sound.id) }),
      });
    } catch (error) {
      console.error("Failed to reorder sounds", error);
    }
  };

  const handlePlayAll = async (playlistId: string) => {
    let list = playlistSounds[playlistId] ?? [];
    if (list.length === 0) {
      try {
        const response = await apiFetch(`/playlists/${playlistId}`);
        if (response.ok) {
          const data = await response.json();
          list = data.sounds ?? [];
          setPlaylistSounds((prev) => ({ ...prev, [playlistId]: list }));
        }
      } catch (error) {
        console.error("Failed to load playlist sounds", error);
      }
    }
    list.forEach((sound: Sound) => playSound(sound));
  };

  const handleShare = async (playlistId: string, playlistName: string) => {
    setShareStatus(null);
    setShareLoadingId(playlistId);
    const playlist = playlists.find((entry) => entry.id === playlistId);
    if (playlist && playlist.privacy !== "link_only") {
      setShareStatus("Set privacy to link-only to enable share links.");
      setShareLoadingId(null);
      return;
    }
    try {
      const response = await apiFetch(`/playlists/${playlistId}/share`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        setShareStatus(error.error ?? "Could not create share link.");
        return;
      }
      const data = await response.json();
      const shareUrl = `${window.location.origin}/share/${data.share_token}`;
      setShareLink(shareUrl);
      setSharePlaylistName(playlistName);
      setShareStatus("Share link ready.");
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus("Share link copied.");
      }
    } catch (error) {
      console.error("Failed to share playlist", error);
      setShareStatus("Could not create share link.");
    } finally {
      setShareLoadingId(null);
    }
  };

  const handleCopyShare = async () => {
    if (!shareLink) {
      return;
    }
    try {
      await navigator.clipboard.writeText(shareLink);
      setShareStatus("Share link copied.");
    } catch (error) {
      console.error("Failed to copy share link", error);
      setShareStatus("Could not copy share link.");
    }
  };

  return (
    <section id="dashboard" className="container mx-auto px-6 pb-14">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">Dashboard</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Board cockpit</h2>
          <p className="mt-2 max-w-2xl text-sm text-fg-muted">
            Manage playlists, see live activity, and jump into any board with simultaneous playback.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-primary/40 bg-brand-primary/15 px-4 py-2 text-sm font-semibold text-brand-primary shadow-glow">
          {loading ? "Syncing boards..." : `${playlists.length} boards`}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr,0.9fr]">
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white">Create a new board</h3>
            <p className="mt-1 text-sm text-fg-muted">
              Name it, set the vibe, and choose who can access it.
            </p>
            <form className="mt-4 space-y-3" onSubmit={handleCreate}>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Board name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-fg-muted focus-ring focus-visible:outline-none"
              />
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Description (optional)"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-fg-muted focus-ring focus-visible:outline-none"
              />
              <div className="flex flex-wrap items-center gap-2">
                {["public", "link_only", "private"].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPrivacy(value)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      privacy === value
                        ? "bg-brand-primary/20 text-brand-primary border border-brand-primary/40"
                        : "border border-white/10 bg-white/5 text-fg-muted"
                    }`}
                  >
                    {value.replace("_", "-")}
                  </button>
                ))}
              </div>
              {status ? <p className="text-xs text-brand-primary">{status}</p> : null}
              {isAuthed ? (
                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-warm px-5 py-2 text-sm font-semibold text-bg-base shadow-glow transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Create board
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => signInWithGoogle()}
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Sign in to create
                </button>
              )}
            </form>
          </div>

          {!isAuthed ? (
            <div className="glass-card rounded-2xl p-5 text-sm text-fg-muted">
              Sign in to see your boards and build your sound universe.
            </div>
          ) : loading ? (
            <div className="glass-card rounded-2xl p-5 text-sm text-fg-muted">
              Loading your boards...
            </div>
          ) : playlists.length === 0 ? (
            <div className="glass-card rounded-2xl p-5 text-sm text-fg-muted">
              No boards yet. Create your first board to start building your sound universe.
            </div>
          ) : (
            playlists.map((playlist) => (
              <div key={playlist.id} className="glass-card rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{playlist.name}</h3>
                    <p className="text-xs text-fg-muted">
                      {playlist.sound_count} sounds - {playlist.privacy.replace("_", "-")}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleToggle(playlist.id)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white"
                    >
                      {expandedId === playlist.id ? "Hide" : "View"}
                    </button>
                    <button
                      onClick={() => handlePlayAll(playlist.id)}
                      className="rounded-full bg-brand-primary/15 px-3 py-1 text-xs text-brand-primary"
                    >
                      Play all
                    </button>
                    <button
                      onClick={() => handleShare(playlist.id, playlist.name)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white"
                      disabled={shareLoadingId === playlist.id}
                    >
                      {shareLoadingId === playlist.id ? "Sharing..." : "Share"}
                    </button>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-fg-muted">
                      {new Date(playlist.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {playlist.description ? (
                  <p className="mt-3 text-sm text-fg-muted">{playlist.description}</p>
                ) : null}

                {expandedId === playlist.id ? (
                  <div className="mt-4 space-y-2 rounded-2xl border border-white/5 bg-white/5 p-4">
                    {soundsLoading[playlist.id] ? (
                      <p className="text-sm text-fg-muted">Loading sounds...</p>
                    ) : (playlistSounds[playlist.id] ?? []).length === 0 ? (
                      <p className="text-sm text-fg-muted">No sounds yet. Add some from Discover.</p>
                    ) : (
                      (playlistSounds[playlist.id] ?? []).map((sound, index) => (
                        <div
                          key={`${playlist.id}-${sound.id}`}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-bg-card/80 px-3 py-2"
                        >
                          <div className="text-sm text-white">{sound.name}</div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                            <button
                              onClick={() => playSound(sound)}
                              className="rounded-full bg-brand-primary/15 px-2 py-1 text-brand-primary"
                            >
                              Play
                            </button>
                            <button
                              onClick={() => handleRemoveSound(playlist.id, sound.id)}
                              className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-fg-muted"
                            >
                              Remove
                            </button>
                            <button
                              onClick={() => handleReorder(playlist.id, index, index - 1)}
                              className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-fg-muted"
                            >
                              Up
                            </button>
                            <button
                              onClick={() => handleReorder(playlist.id, index, index + 1)}
                              className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-fg-muted"
                            >
                              Down
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4">
            <h4 className="text-lg font-semibold text-white">Activity</h4>
            <div className="mt-3 space-y-3">
              {!isAuthed ? (
                <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-fg-muted">
                  Sign in to see live activity from your boards.
                </div>
              ) : activityFeed.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-fg-muted">
                  Activity will appear after your first uploads and board changes.
                </div>
              ) : (
                activityFeed.map((item) => (
                  <div
                    key={`${item.label}-${item.time}`}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2"
                  >
                    <div className="text-sm text-white">{item.label}</div>
                    <span className="text-xs text-fg-muted">{item.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <h4 className="text-lg font-semibold text-white">Share link</h4>
            <p className="mt-2 text-sm text-fg-muted">
              Link-only boards get a private URL you can send or embed.
            </p>
            <div className="mt-3 space-y-3 text-sm text-fg-muted">
              {!isAuthed ? (
                <div className="rounded-lg border border-white/10 bg-bg-card/80 px-3 py-2">
                  Sign in to generate share links.
                </div>
              ) : shareLink ? (
                <>
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-bg-card/80 px-3 py-2">
                    <span className="truncate">{shareLink}</span>
                    <button
                      onClick={handleCopyShare}
                      className="whitespace-nowrap rounded-md bg-brand-primary/15 px-2 py-1 text-xs font-semibold text-brand-primary"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-fg-muted">
                    Latest link for <span className="text-white">{sharePlaylistName}</span>.
                  </p>
                </>
              ) : (
                <div className="rounded-lg border border-white/10 bg-bg-card/80 px-3 py-2">
                  Choose a board and hit Share to generate a link.
                </div>
              )}
              {shareStatus ? <p className="text-xs text-brand-primary">{shareStatus}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
