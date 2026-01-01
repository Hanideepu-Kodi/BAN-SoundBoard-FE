"use client";

import { useCallback, useEffect, useState } from "react";
import type { Creator, Playlist, Sound } from "@/lib/types";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/components/AuthProvider";
import { useAudio } from "@/components/AudioProvider";
import SoundCard from "@/components/SoundCard";
import PlaylistCard from "@/components/PlaylistCard";
import { useSavedPlaylists } from "@/lib/use-saved-playlists";

type CreatorProfilePageProps = {
  creatorId: string;
};

type CreatorResponse = {
  profile: Creator | null;
  stats: {
    plays: number;
    sounds: number;
    playlists: number;
  };
  sounds: Sound[];
  playlists: Playlist[];
};

export default function CreatorProfilePage({ creatorId }: CreatorProfilePageProps) {
  const { user, signInWithGoogle } = useAuth();
  const { playSound } = useAudio();
  const { save, remove, isSaved } = useSavedPlaylists();
  const [profile, setProfile] = useState<Creator | null>(null);
  const [stats, setStats] = useState({ plays: 0, sounds: 0, playlists: 0 });
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [creatorPlaylists, setCreatorPlaylists] = useState<Playlist[]>([]);
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const isAuthed = Boolean(user?.id);

  const loadCreator = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/creators/${creatorId}`, { skipAuth: !isAuthed });
      if (!response.ok) {
        setProfile(null);
        setSounds([]);
        setCreatorPlaylists([]);
        return;
      }
      const data = (await response.json()) as CreatorResponse;
      setProfile(data.profile ?? null);
      setStats(data.stats ?? { plays: 0, sounds: 0, playlists: 0 });
      setSounds(data.sounds ?? []);
      setCreatorPlaylists(data.playlists ?? []);
    } catch (error) {
      console.error("Failed to load creator", error);
    } finally {
      setLoading(false);
    }
  }, [creatorId, isAuthed]);

  const loadMyPlaylists = useCallback(async () => {
    if (!isAuthed) {
      setMyPlaylists([]);
      return;
    }
    try {
      const response = await apiFetch("/playlists");
      if (!response.ok) {
        setMyPlaylists([]);
        return;
      }
      const data = await response.json();
      setMyPlaylists(data.playlists ?? []);
    } catch (error) {
      console.error("Failed to load playlists", error);
    }
  }, [isAuthed]);

  useEffect(() => {
    loadCreator();
    loadMyPlaylists();
  }, [loadCreator, loadMyPlaylists]);

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

  const handleSavePlaylist = (playlist: Playlist) => {
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
        Loading creator profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
        Creator not found.
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || profile.handle || "Creator avatar"}
              className="h-16 w-16 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/30 via-brand-accent/20 to-brand-warm/20 text-white">
              {profile.display_name?.charAt(0) || profile.handle?.charAt(0) || "C"}
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-primary">Creator</p>
            <h1 className="text-3xl font-semibold text-white">
              {profile.display_name || profile.handle || "Unknown creator"}
            </h1>
            {profile.handle ? <p className="text-sm text-fg-muted">@{profile.handle}</p> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Total plays", value: stats.plays },
            { label: "Sounds", value: stats.sounds },
            { label: "Playlists", value: stats.playlists },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
              <p className="text-xs text-fg-muted">{stat.label}</p>
              <p className="text-lg font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {status ? <p className="text-xs text-brand-primary">{status}</p> : null}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Sounds</h2>
        </div>
        {sounds.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
            No sounds yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sounds.map((sound) => (
              <SoundCard
                key={sound.id}
                sound={sound}
                playlists={myPlaylists}
                onPlay={playSound}
                onAddToPlaylist={handleAddToPlaylist}
                onShare={handleShare}
                onRequireAuth={isAuthed ? undefined : signInWithGoogle}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Playlists</h2>
        </div>
        {creatorPlaylists.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
            No playlists yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {creatorPlaylists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                href={`/playlists/${playlist.id}`}
                actions={
                  !isAuthed ? (
                    <button
                      onClick={() => signInWithGoogle()}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white"
                    >
                      Sign in to save
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSavePlaylist(playlist)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white"
                    >
                      {isSaved(playlist.id) ? "Saved" : "Save playlist"}
                    </button>
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
