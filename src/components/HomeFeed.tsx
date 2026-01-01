"use client";

import { useCallback, useEffect, useState } from "react";
import type { Playlist, Sound } from "@/lib/types";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/components/AuthProvider";
import { useAudio } from "@/components/AudioProvider";
import SoundCard from "@/components/SoundCard";

export default function HomeFeed() {
  const { user, signInWithGoogle } = useAuth();
  const { playSound, setHotkeySounds } = useAudio();
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const isAuthed = Boolean(user?.id);

  const loadSounds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/sounds", { skipAuth: !isAuthed });
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
  }, [isAuthed, setHotkeySounds]);

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
    loadSounds();
    loadPlaylists();
  }, [loadSounds, loadPlaylists]);

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

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-primary">Home feed</p>
          <h1 className="text-3xl font-semibold text-white">All sounds, instantly playable.</h1>
          <p className="text-sm text-fg-muted">Click any card to stack it in your live mix.</p>
        </div>
      </div>

      {status ? <p className="text-xs text-brand-primary">{status}</p> : null}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
          Loading the sound feed...
        </div>
      ) : sounds.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
          No sounds yet. Be the first to upload a clip.
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
