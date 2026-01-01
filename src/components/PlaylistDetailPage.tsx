"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Playlist, Sound } from "@/lib/types";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/components/AuthProvider";
import { useAudio } from "@/components/AudioProvider";
import SoundCard from "@/components/SoundCard";
import { useSavedPlaylists } from "@/lib/use-saved-playlists";

type PlaylistDetailPageProps = {
  playlistId: string;
};

export default function PlaylistDetailPage({ playlistId }: PlaylistDetailPageProps) {
  const { user, signInWithGoogle } = useAuth();
  const { playSound } = useAudio();
  const { save, remove, isSaved } = useSavedPlaylists();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const isAuthed = Boolean(user?.id);

  const loadPlaylist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/playlists/${playlistId}`, { skipAuth: !isAuthed });
      if (!response.ok) {
        setPlaylist(null);
        setSounds([]);
        return;
      }
      const data = await response.json();
      setPlaylist(data.playlist ?? null);
      setSounds(data.sounds ?? []);
    } catch (error) {
      console.error("Failed to load playlist", error);
    } finally {
      setLoading(false);
    }
  }, [playlistId, isAuthed]);

  const loadPlaylists = useCallback(async () => {
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
    loadPlaylist();
    loadPlaylists();
  }, [loadPlaylist, loadPlaylists]);

  const handleAddToPlaylist = async (targetId: string, soundId: string) => {
    setStatus(null);
    if (!isAuthed) {
      setStatus("Sign in to save sounds.");
      return;
    }
    try {
      const response = await apiFetch(`/playlists/${targetId}/sounds`, {
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

  const handlePlayAll = () => {
    sounds.forEach((sound) => playSound(sound));
  };

  const handleSavePlaylist = () => {
    if (!playlist) {
      return;
    }
    if (!isAuthed) {
      setStatus("Sign in to save playlists.");
      return;
    }
    if (isSaved(playlist.id)) {
      remove(playlist.id);
      setStatus("Playlist removed from Saved.");
      return;
    }
    save(playlist.id);
    setStatus("Playlist saved.");
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
        Loading playlist...
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
        Playlist not found.
      </div>
    );
  }

  const isOwner = playlist.owner_id && playlist.owner_id === user?.id;
  const saved = isSaved(playlist.id);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-primary">Playlist</p>
          <h1 className="text-3xl font-semibold text-white">{playlist.name}</h1>
          {playlist.description ? <p className="text-sm text-fg-muted">{playlist.description}</p> : null}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
              {playlist.sound_count} sounds
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
              {playlist.privacy.replace("_", "-")}
            </span>
            {playlist.creator?.id ? (
              <Link href={`/creator/${playlist.creator.id}`} className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                {playlist.creator.display_name || playlist.creator.handle || "Creator"}
              </Link>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePlayAll}
            className="rounded-full bg-brand-primary/15 px-4 py-2 text-xs text-brand-primary"
          >
            Play all
          </button>
          {!isOwner ? (
            <button
              onClick={handleSavePlaylist}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white"
            >
              {saved ? "Saved" : "Save playlist"}
            </button>
          ) : null}
          {!isAuthed ? (
            <button
              onClick={() => signInWithGoogle()}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white"
            >
              Sign in
            </button>
          ) : null}
        </div>
      </div>

      {status ? <p className="text-xs text-brand-primary">{status}</p> : null}

      {sounds.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
          No sounds in this playlist yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sounds.map((sound) => (
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
