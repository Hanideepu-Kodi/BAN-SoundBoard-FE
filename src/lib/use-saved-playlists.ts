"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "kodi.savedPlaylists";

export function useSavedPlaylists() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedIds(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load saved playlists", error);
    }
  }, []);

  const persist = useCallback((next: string[]) => {
    setSavedIds(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error("Failed to store saved playlists", error);
    }
  }, []);

  const save = useCallback(
    (playlistId: string) => {
      if (savedIds.includes(playlistId)) {
        return;
      }
      persist([...savedIds, playlistId]);
    },
    [persist, savedIds]
  );

  const remove = useCallback(
    (playlistId: string) => {
      persist(savedIds.filter((id) => id !== playlistId));
    },
    [persist, savedIds]
  );

  const isSaved = useCallback((playlistId: string) => savedIds.includes(playlistId), [savedIds]);

  return {
    savedIds,
    save,
    remove,
    isSaved,
  };
}
