"use client";

import { useCallback, useEffect, useState } from "react";
import type { Route } from "next";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";
import type { Playlist } from "@/lib/types";
import PlaylistCard from "@/components/PlaylistCard";

export default function PlaylistsPage() {
  const { user, signInWithGoogle } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "link_only" | "private">("link_only");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthed = Boolean(user?.id);

  const loadPlaylists = useCallback(async () => {
    if (!isAuthed) {
      setPlaylists([]);
      setLoading(false);
      return;
    }
    setLoading(true);
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
  }, [isAuthed]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    if (!name.trim()) {
      setStatus("Add a playlist name.");
      return;
    }
    try {
      const response = await apiFetch("/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null, privacy }),
      });
      if (!response.ok) {
        const error = await response.json();
        setStatus(error.error ?? "Failed to create playlist.");
        return;
      }
      setName("");
      setDescription("");
      setPrivacy("link_only");
      setStatus("Playlist created.");
      loadPlaylists();
    } catch (error) {
      console.error("Failed to create playlist", error);
      setStatus("Failed to create playlist.");
    }
  };

  const handlePrivacyChange = async (playlistId: string, value: string) => {
    setStatus(null);
    try {
      const response = await apiFetch(`/playlists/${playlistId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacy: value }),
      });
      if (!response.ok) {
        const error = await response.json();
        setStatus(error.error ?? "Failed to update playlist.");
        return;
      }
      setStatus("Playlist updated.");
      loadPlaylists();
    } catch (error) {
      console.error("Failed to update playlist", error);
      setStatus("Failed to update playlist.");
    }
  };

  if (!isAuthed) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
        <p>Sign in to build playlists and manage your boards.</p>
        <button
          onClick={() => signInWithGoogle()}
          className="mt-4 rounded-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-warm px-4 py-2 text-xs font-semibold text-bg-base shadow-glow"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-brand-primary">Playlists</p>
        <h1 className="text-3xl font-semibold text-white">Your boards.</h1>
        <p className="text-sm text-fg-muted">Create, edit, and share your playlists anytime.</p>
      </div>

      <form onSubmit={handleCreate} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1.4fr,1.6fr,0.8fr,auto]">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Playlist name"
          className="rounded-xl border border-white/10 bg-bg-base/50 px-4 py-2 text-sm text-white placeholder:text-fg-muted focus-ring focus-visible:outline-none"
        />
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description (optional)"
          className="rounded-xl border border-white/10 bg-bg-base/50 px-4 py-2 text-sm text-white placeholder:text-fg-muted focus-ring focus-visible:outline-none"
        />
        <select
          value={privacy}
          onChange={(event) => setPrivacy(event.target.value as "public" | "link_only" | "private")}
          className="select-theme rounded-xl border border-white/10 bg-bg-base/50 px-3 py-2 text-sm text-white focus-ring focus-visible:outline-none"
        >
          <option value="public">Public</option>
          <option value="link_only">Link-only</option>
          <option value="private">Private</option>
        </select>
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-warm px-4 py-2 text-sm font-semibold text-bg-base shadow-glow"
        >
          Create
        </button>
      </form>

      {status ? <p className="text-xs text-brand-primary">{status}</p> : null}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
          Loading playlists...
        </div>
      ) : playlists.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
          No playlists yet. Create your first board above.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              href={`/playlists/${playlist.id}` as Route}
              showCreator={false}
              actions={
                <select
                  value={playlist.privacy}
                  onChange={(event) => handlePrivacyChange(playlist.id, event.target.value)}
                  className="select-theme rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white focus-ring focus-visible:outline-none"
                >
                  <option value="public">Public</option>
                  <option value="link_only">Link-only</option>
                  <option value="private">Private</option>
                </select>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
