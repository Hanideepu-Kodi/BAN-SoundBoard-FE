"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Sound } from "@/lib/types";
import Header from "@/components/Header";
import { useAudio } from "@/components/AudioProvider";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";

type SharePlaylist = {
  id: string;
  name: string;
  description: string | null;
  privacy: "public" | "link_only" | "private";
  created_at: string | null;
  sound_count: number;
};

type SharePayload = {
  playlist: SharePlaylist;
  sounds: Sound[];
};

export default function SharePage() {
  const params = useParams();
  const token = params?.token as string;
  const { playSound } = useAudio();
  const { user, signInWithGoogle } = useAuth();
  const [data, setData] = useState<SharePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    let active = true;
    const fetchShare = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFetch(`/playlists/share/${token}`, { skipAuth: true });
        if (!response.ok) {
          const payload = await response.json();
          if (active) {
            setError(payload.detail ?? "Share link not found.");
          }
          return;
        }
        const payload = await response.json();
        if (active) {
          setData(payload);
        }
      } catch (err) {
        console.error("Failed to load share link", err);
        if (active) {
          setError("Share link not found.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchShare();
    return () => {
      active = false;
    };
  }, [token]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus("Link copied.");
    } catch (err) {
      console.error("Failed to copy link", err);
      setCopyStatus("Copy failed.");
    }
  };

  const handlePlayAll = () => {
    if (!data) {
      return;
    }
    data.sounds.forEach((sound) => playSound(sound));
  };

  return (
    <div className="relative overflow-hidden pb-20">
      <Header />

      <section className="container mx-auto px-6 pt-16 pb-12 lg:pt-24">
        <div className="glass-card rounded-3xl p-8">
          {loading ? (
            <div className="text-sm text-fg-muted">Loading shared board...</div>
          ) : error ? (
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-white">Share link not found</h1>
              <p className="text-sm text-fg-muted">{error}</p>
              {!user ? (
                <button
                  onClick={() => signInWithGoogle()}
                  className="mt-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                >
                  Sign in to create your own boards
                </button>
              ) : null}
            </div>
          ) : data ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-brand-primary">Shared board</p>
                  <h1 className="mt-2 text-3xl font-semibold text-white">{data.playlist.name}</h1>
                  <p className="mt-2 max-w-2xl text-sm text-fg-muted">
                    {data.playlist.description || "A curated mix ready to play in your stream or call."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-fg-muted">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {data.playlist.sound_count} sounds
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {data.playlist.privacy.replace("_", "-")}
                    </span>
                    {data.playlist.created_at ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        {new Date(data.playlist.created_at).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handlePlayAll}
                    className="rounded-full bg-brand-primary/15 px-4 py-2 text-sm text-brand-primary"
                  >
                    Play all
                  </button>
                  <button
                    onClick={handleCopy}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                  >
                    Copy link
                  </button>
                </div>
              </div>

              {copyStatus ? <p className="text-xs text-brand-primary">{copyStatus}</p> : null}

              {data.sounds.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-fg-muted">
                  No sounds yet. The owner is still building this board.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.sounds.map((sound) => (
                    <div
                      key={sound.id}
                      className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-bg-card/80 p-4 shadow-panel"
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
                            <span key={`${sound.id}-${tag}`} className="rounded-full bg-white/5 px-2 py-1">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full bg-white/5 px-2 py-1">untagged</span>
                        )}
                      </div>
                      <button
                        onClick={() => playSound(sound)}
                        className="rounded-full bg-brand-primary/15 px-2 py-1 text-xs text-brand-primary"
                      >
                        Play
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
