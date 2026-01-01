"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { Sound } from "@/lib/types";

type ActiveSound = {
  id: string;
  name: string;
  url: string;
  startedAt: number;
  audio: HTMLAudioElement;
};

type AudioContextValue = {
  activeSounds: ActiveSound[];
  hotkeySounds: Sound[];
  setHotkeySounds: (sounds: Sound[]) => void;
  playSound: (sound: Sound) => void;
  stopSound: (soundId: string) => void;
  stopAll: () => void;
  volume: number;
  setVolume: (value: number) => void;
  crossfadeMs: number;
  setCrossfadeMs: (value: number) => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [activeSounds, setActiveSounds] = useState<ActiveSound[]>([]);
  const [hotkeySounds, setHotkeySounds] = useState<Sound[]>([]);
  const volume = 1;
  const crossfadeMs = 0;
  const audioMapRef = useRef(new Map<string, HTMLAudioElement>());

  const stopSound = useCallback((soundId: string) => {
    const audio = audioMapRef.current.get(soundId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audioMapRef.current.delete(soundId);
      setActiveSounds((prev) => prev.filter((sound) => sound.id !== soundId));
    }
  }, []);

  const stopAll = useCallback(() => {
    audioMapRef.current.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    audioMapRef.current.clear();
    setActiveSounds([]);
  }, []);

  const playSound = useCallback((sound: Sound) => {
    if (!sound.url) {
      return;
    }

    stopSound(sound.id);

    const audio = new Audio(sound.url);
    audio.volume = volume;
    audio.play().catch(() => undefined);
    audio.addEventListener("ended", () => {
      stopSound(sound.id);
    });

    audioMapRef.current.set(sound.id, audio);
    setActiveSounds((prev) => [
      ...prev.filter((existing) => existing.id !== sound.id),
      {
        id: sound.id,
        name: sound.name,
        url: sound.url,
        startedAt: Date.now(),
        audio,
      },
    ]);
  }, [stopSound, volume]);

  const setVolume = useCallback((_value: number) => {}, []);
  const setCrossfadeMs = useCallback((_value: number) => {}, []);

  const value = useMemo(
    () => ({
      activeSounds,
      hotkeySounds,
      setHotkeySounds,
      playSound,
      stopSound,
      stopAll,
      volume,
      setVolume,
      crossfadeMs,
      setCrossfadeMs,
    }),
    [activeSounds, hotkeySounds, playSound, stopSound, stopAll, volume, setVolume, crossfadeMs, setCrossfadeMs]
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}
