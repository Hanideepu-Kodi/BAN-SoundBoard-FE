"use client";

import { useEffect, useMemo, useState } from "react";
import type { Playlist, Sound } from "@/lib/types";
import Header from "@/components/Header";
import DashboardSection from "@/components/DashboardSection";
import UploadSection from "@/components/UploadSection";
import DiscoverSection from "@/components/DiscoverSection";
import PlayerDock from "@/components/PlayerDock";
import { useAuth } from "@/components/AuthProvider";
import { useAudio } from "@/components/AudioProvider";
import { apiFetch } from "@/lib/api-client";

const features = [
  {
    title: "Instant command",
    body: "Trigger multiple sounds at once, map hotkeys, and keep stop-all within reach.",
  },
  {
    title: "Creator-grade polish",
    body: "Glassy panels, neon focus rings, and spacing built for legibility on any DPI.",
  },
  {
    title: "Share your vibe",
    body: "Public, link-only, or private invites. Copy, embed, and track reactions.",
  },
];

export default function RealDealPage() {
  const { user, signInWithGoogle } = useAuth();
  const { crossfadeMs, volume, playSound } = useAudio();
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [heroSounds, setHeroSounds] = useState<Sound[]>([]);
  const [heroPlaylists, setHeroPlaylists] = useState<Playlist[]>([]);
  const [featuredPlaylist, setFeaturedPlaylist] = useState<Playlist | null>(null);
  const [featuredSounds, setFeaturedSounds] = useState<Sound[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(false);

  const handleUploadComplete = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleSearchSubmit = (value: string) => {
    const next = value.trim();
    setSearchQuery(next);
    const section = document.getElementById("discover");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    let active = true;
    const loadHeroData = async () => {
      setHeroLoading(true);
      try {
        const soundsResponse = await apiFetch("/sounds", { skipAuth: !user });
        if (soundsResponse.ok) {
          const data = await soundsResponse.json();
          if (active) {
            setHeroSounds(data.sounds ?? []);
          }
        } else if (active) {
          setHeroSounds([]);
        }

        if (!user) {
          if (active) {
            setHeroPlaylists([]);
            setFeaturedPlaylist(null);
            setFeaturedSounds([]);
          }
          return;
        }

        const playlistsResponse = await apiFetch("/playlists");
        if (playlistsResponse.ok) {
          const data = await playlistsResponse.json();
          if (active) {
            setHeroPlaylists(data.playlists ?? []);
          }
        } else if (active) {
          setHeroPlaylists([]);
        }
      } catch (error) {
        console.error("Failed to load hero data", error);
        if (active) {
          setHeroSounds([]);
          setHeroPlaylists([]);
        }
      } finally {
        if (active) {
          setHeroLoading(false);
        }
      }
    };
    loadHeroData();
    return () => {
      active = false;
    };
  }, [user, refreshKey]);

  useEffect(() => {
    if (heroPlaylists.length === 0) {
      setFeaturedPlaylist(null);
      setFeaturedSounds([]);
      return;
    }
    const sorted = [...heroPlaylists].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
    setFeaturedPlaylist(sorted[0]);
  }, [heroPlaylists]);

  useEffect(() => {
    if (!featuredPlaylist) {
      setFeaturedSounds([]);
      return;
    }
    let active = true;
    const loadFeatured = async () => {
      setFeaturedLoading(true);
      try {
        const response = await apiFetch(`/playlists/${featuredPlaylist.id}`);
        if (response.ok) {
          const data = await response.json();
          if (active) {
            setFeaturedSounds(data.sounds ?? []);
          }
        } else if (active) {
          setFeaturedSounds([]);
        }
      } catch (error) {
        console.error("Failed to load featured board", error);
        if (active) {
          setFeaturedSounds([]);
        }
      } finally {
        if (active) {
          setFeaturedLoading(false);
        }
      }
    };
    loadFeatured();
    return () => {
      active = false;
    };
  }, [featuredPlaylist]);

  const heroStats = useMemo(() => {
    const tagCount = new Set(heroSounds.flatMap((sound) => sound.tags)).size;
    const boardsValue = user ? `${heroPlaylists.length}` : "-";
    return [
      {
        label: "Sounds indexed",
        value: heroLoading ? "..." : `${heroSounds.length}`,
        delta: "public + yours",
      },
      {
        label: "Tags live",
        value: heroLoading ? "..." : `${tagCount}`,
        delta: "community labels",
      },
      {
        label: "Your boards",
        value: heroLoading ? "..." : boardsValue,
        delta: user ? "private to you" : "sign in to view",
      },
    ];
  }, [heroLoading, heroPlaylists.length, heroSounds, user]);

  return (
    <div className="relative overflow-hidden pb-20">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} onSearchSubmit={handleSearchSubmit} />

      <div className="pointer-events-none absolute -left-20 -top-32 h-96 w-96 rounded-full bg-brand-primary/14 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-10 h-[420px] w-[420px] rounded-full bg-brand-accent/12 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-warm/10 blur-[150px]" />

      <section id="hero" className="container relative mx-auto px-6 pt-16 pb-12 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/40 bg-brand-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-brand-primary shadow-glow">
              Studio-grade control
              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary shadow-glow" />
            </div>
            <div className="space-y-5">
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                Your board, your broadcast,{" "}
                <span className="text-transparent bg-gradient-to-r from-brand-primary via-brand-accent to-brand-warm bg-clip-text">
                  zero friction.
                </span>
              </h1>
              <p className="max-w-2xl text-lg text-fg-muted">
                Find, mix, and fire sounds without breaking flow. Build boards, trigger multiple clips at once, and
                share with your crew in seconds.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#dashboard"
                className="rounded-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-warm px-6 py-3 text-sm font-semibold text-bg-base shadow-glow transition-transform duration-200 ease-snap hover:-translate-y-0.5 focus-ring focus-visible:outline-none"
              >
                Build my board
              </a>
              <a
                href="#discover"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-brand-primary/60 focus-ring focus-visible:outline-none"
              >
                Explore the community
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="glass-card rounded-2xl p-4">
                  <p className="text-sm text-fg-muted">{stat.label}</p>
                  <div className={`mt-2 text-2xl font-semibold text-white ${heroLoading ? "animate-pulse" : ""}`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-brand-primary">{stat.delta}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-brand-primary/25 via-brand-accent/20 to-brand-warm/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-bg-surface/80 p-6 shadow-panel backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-fg-muted">{featuredPlaylist ? "Featured board" : "Board preview"}</p>
                  <h3 className="text-xl font-semibold text-white">
                    {featuredPlaylist ? featuredPlaylist.name : "No boards yet"}
                  </h3>
                  <p className="text-xs text-fg-muted">
                    {featuredPlaylist
                      ? `${featuredPlaylist.sound_count} sounds - ${featuredPlaylist.privacy.replace("_", "-")}`
                      : "Create a board to see it here."}
                  </p>
                </div>
                {featuredPlaylist ? (
                  <div className="rounded-full border border-brand-primary/40 bg-brand-primary/15 px-3 py-1 text-xs text-brand-primary shadow-glow">
                    Live
                  </div>
                ) : (
                  <a
                    href="#dashboard"
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white"
                  >
                    Create
                  </a>
                )}
              </div>
              <div className="mt-6 space-y-3">
                {featuredLoading ? (
                  <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-3 text-sm text-fg-muted">
                    Loading board preview...
                  </div>
                ) : featuredSounds.length > 0 ? (
                  featuredSounds.slice(0, 4).map((sound) => (
                    <button
                      key={sound.id}
                      onClick={() => playSound(sound)}
                      className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-3 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-brand-primary" />
                        <div>
                          <p className="text-sm text-white">{sound.name}</p>
                          <p className="text-xs text-fg-muted">Tap to preview</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-fg-muted">
                        <span className="rounded-full bg-black/30 px-2 py-1 text-[11px] text-white">
                          {sound.duration_seconds ? `${sound.duration_seconds}s` : "n/a"}
                        </span>
                        <span className="h-2 w-2 rounded-full bg-status-success" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-3 text-sm text-fg-muted">
                    Add sounds from Discover to light up the board preview.
                  </div>
                )}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                  <p className="text-xs text-fg-muted">Crossfade</p>
                  <p className="text-lg font-semibold text-white">{crossfadeMs} ms</p>
                  <div className="mt-3 h-2 rounded-full bg-stroke-subtle/80">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent"
                      style={{ width: `${Math.min(100, (crossfadeMs / 600) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                  <p className="text-xs text-fg-muted">Master volume</p>
                  <p className="text-lg font-semibold text-white">{Math.round(volume * 100)}%</p>
                  <div className="mt-3 h-10 rounded-lg bg-gradient-to-br from-brand-warm/30 via-brand-primary/20 to-brand-accent/25" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-14">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="glass-card rounded-2xl p-5 transition hover:-translate-y-1 hover:border-brand-primary/40"
            >
              <h3 className="text-lg font-semibold text-white">{feat.title}</h3>
              <p className="mt-2 text-sm text-fg-muted">{feat.body}</p>
            </div>
          ))}
        </div>
      </section>

      <DashboardSection />
      <UploadSection onUploadComplete={handleUploadComplete} />
      <DiscoverSection refreshKey={refreshKey} query={searchQuery} onQueryChange={setSearchQuery} />
      <PlayerDock />

      <section className="container mx-auto px-6">
        <div className="rounded-3xl border border-brand-primary/40 bg-gradient-to-r from-brand-primary/12 via-brand-accent/12 to-brand-warm/12 p-8 text-center shadow-glow backdrop-blur">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-primary">Ready to launch</p>
          <h3 className="mt-2 text-3xl font-semibold text-white">Look like a million bucks on stream.</h3>
          <p className="mt-2 text-sm text-fg-muted">Upload a sound, build a board, and ship your first share link.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {user ? (
              <a
                href="#dashboard"
                className="rounded-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-warm px-6 py-3 text-sm font-semibold text-bg-base shadow-glow transition-transform duration-200 hover:-translate-y-0.5"
              >
                Go to dashboard
              </a>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="rounded-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-warm px-6 py-3 text-sm font-semibold text-bg-base shadow-glow transition-transform duration-200 hover:-translate-y-0.5"
              >
                Sign in to start
              </button>
            )}
            <a
              href="#upload"
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
            >
              Jump to upload
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
