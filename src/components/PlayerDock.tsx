"use client";

import { useEffect } from "react";
import { useAudio } from "@/components/AudioProvider";

export default function PlayerDock() {
  const {
    activeSounds,
    hotkeySounds,
    playSound,
    stopSound,
    stopAll,
    volume,
    setVolume,
    crossfadeMs,
    setCrossfadeMs,
  } = useAudio();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.getAttribute("role") === "textbox");
      if (isInput) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        stopAll();
        return;
      }

      if (event.shiftKey && event.code === "ArrowUp") {
        event.preventDefault();
        setVolume(Math.min(1, Number((volume + 0.05).toFixed(2))));
        return;
      }

      if (event.shiftKey && event.code === "ArrowDown") {
        event.preventDefault();
        setVolume(Math.max(0, Number((volume - 0.05).toFixed(2))));
        return;
      }

      if (/^[1-9]$/.test(event.key)) {
        const index = Number(event.key) - 1;
        const sound = hotkeySounds[index];
        if (sound) {
          event.preventDefault();
          playSound(sound);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hotkeySounds, playSound, setVolume, stopAll, volume]);

  return (
    <section className="container mx-auto px-6 pb-16">
      <div className="glass-card rounded-3xl p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-brand-warm">Player dock</p>
            <h2 className="text-3xl font-semibold text-white">Always-on controls.</h2>
            <p className="text-sm text-fg-muted">
              Stop-all, crossfade, master volume, and shortcut legend in one sticky dock.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
            <span className="rounded-full bg-white/5 px-3 py-1">1-9 triggers current list</span>
            <span className="rounded-full bg-white/5 px-3 py-1">Space stops all</span>
            <span className="rounded-full bg-white/5 px-3 py-1">Shift + Up/Down adjusts volume</span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
          <div className="rounded-2xl border border-white/5 bg-bg-card/80 p-4 shadow-panel">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-fg-muted">
                <span className={`h-2 w-2 rounded-full ${activeSounds.length ? "bg-status-success" : "bg-brand-warm"}`} />
                {activeSounds.length ? "Active" : "Idle"}
              </div>
              <button
                onClick={stopAll}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white transition hover:-translate-y-0.5"
              >
                Stop all
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {activeSounds.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-fg-muted">
                  Nothing playing yet. Trigger a sound to light up the dock.
                </div>
              ) : (
                activeSounds.map((sound) => (
                  <div
                    key={`dock-${sound.id}`}
                    className="flex items-center gap-3 rounded-full border border-white/5 bg-white/5 px-3 py-2 text-xs text-white"
                  >
                    <span className="h-2 w-2 rounded-full bg-brand-primary" />
                    {sound.name}
                    <button
                      onClick={() => stopSound(sound.id)}
                      className="rounded-full bg-brand-primary/15 px-2 py-0.5 text-[11px] text-brand-primary"
                    >
                      Stop
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-xs text-fg-muted">
                Volume
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  className="w-full accent-brand-primary"
                />
              </label>
              <label className="space-y-2 text-xs text-fg-muted">
                Crossfade (ms)
                <input
                  type="range"
                  min={0}
                  max={600}
                  step={10}
                  value={crossfadeMs}
                  onChange={(event) => setCrossfadeMs(Number(event.target.value))}
                  className="w-full accent-brand-accent"
                />
              </label>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/5 bg-bg-card/80 p-4 shadow-panel">
            <h4 className="text-lg font-semibold text-white">Shortcut legend</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-fg-muted">
              <span className="rounded-lg bg-white/5 px-3 py-2">Space stop-all</span>
              <span className="rounded-lg bg-white/5 px-3 py-2">Shift + Up/Down volume</span>
              <span className="rounded-lg bg-white/5 px-3 py-2">Cmd + K focus search</span>
              <span className="rounded-lg bg-white/5 px-3 py-2">Tab focus dock</span>
            </div>
            {hotkeySounds.length > 0 ? (
              <div className="mt-3 grid gap-2 text-xs text-fg-muted">
                {hotkeySounds.slice(0, 6).map((sound, index) => (
                  <div key={sound.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-white">{index + 1}</span>
                    <span className="truncate">{sound.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-fg-muted">Run a search in Explore to load hotkeys.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
