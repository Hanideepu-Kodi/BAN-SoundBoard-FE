"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import type { Sound } from "@/lib/types";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/components/AuthProvider";
import { useAudio } from "@/components/AudioProvider";
import ConfirmModal from "@/components/ConfirmModal";

type SoundEditorProps = {
  sound: Sound;
  onPlay: (sound: Sound) => void;
  onSave: (soundId: string, payload: { name: string; tags: string; privacy: string }) => void;
  onDelete: (soundId: string) => void;
};

function SoundEditorCard({ sound, onPlay, onSave, onDelete }: SoundEditorProps) {
  const [name, setName] = useState(sound.name);
  const [tags, setTags] = useState(sound.tags.join(", "));
  const [privacy, setPrivacy] = useState(sound.privacy);

  return (
    <div className="rounded-2xl border border-white/5 bg-bg-card/80 p-4 shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-fg-muted focus-ring focus-visible:outline-none"
          />
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Tags (comma-separated)"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-fg-muted focus-ring focus-visible:outline-none"
          />
        </div>
        <button
          onClick={() => onPlay(sound)}
          className="rounded-full bg-brand-primary/15 px-4 py-2 text-xs text-brand-primary"
        >
          Play
        </button>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <select
          value={privacy}
          onChange={(event) => setPrivacy(event.target.value as Sound["privacy"])}
          className="select-theme rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white focus-ring focus-visible:outline-none"
        >
          <option value="public">Public</option>
          <option value="link_only">Link-only</option>
          <option value="private">Private</option>
        </select>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSave(sound.id, { name, tags, privacy })}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white"
          >
            Save changes
          </button>
          <button
            onClick={() => onDelete(sound.id)}
            className="flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MySoundsPage() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const { playSound } = useAudio();
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const isAuthed = Boolean(user?.id);

  const loadSounds = useCallback(async () => {
    if (!user?.id) {
      setSounds([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const params = new URLSearchParams({ owner_id: user.id });
      const response = await apiFetch(`/sounds?${params.toString()}`);
      if (!response.ok) {
        setSounds([]);
        return;
      }
      const data = await response.json();
      setSounds(data.sounds ?? []);
    } catch (error) {
      console.error("Failed to load sounds", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSounds();
  }, [loadSounds]);

  const handleSave = async (soundId: string, payload: { name: string; tags: string; privacy: string }) => {
    setStatus(null);
    try {
      const response = await apiFetch(`/sounds/${soundId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        setStatus(error.error ?? "Failed to update sound.");
        return;
      }
      setStatus("Sound updated.");
      loadSounds();
    } catch (error) {
      console.error("Failed to update sound", error);
      setStatus("Failed to update sound.");
    }
  };

  const handleDelete = async (soundId: string) => {
    setStatus(null);
    try {
      const response = await apiFetch(`/sounds/${soundId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        setStatus(error.error ?? "Failed to delete sound.");
        return;
      }
      setStatus("Sound deleted.");
      loadSounds();
    } catch (error) {
      console.error("Failed to delete sound", error);
      setStatus("Failed to delete sound.");
    }
  };

  if (!isAuthed) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
        <p>Sign in to manage your sounds.</p>
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
        <p className="text-xs uppercase tracking-[0.2em] text-brand-primary">My sounds</p>
        <h1 className="text-3xl font-semibold text-white">Manage your uploads.</h1>
        <p className="text-sm text-fg-muted">Edit names, tags, and privacy in one place.</p>
      </div>

      {status ? <p className="text-xs text-brand-primary">{status}</p> : null}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
          Loading your sounds...
        </div>
      ) : sounds.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-fg-muted">
          No sounds yet. Use Create to upload your first clip.
        </div>
      ) : (
        <div className="space-y-4">
          {sounds.map((sound) => (
            <SoundEditorCard key={sound.id} sound={sound} onPlay={playSound} onSave={handleSave} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <div className="pt-6 md:hidden">
        <button
          onClick={() => setSignOutOpen(true)}
          className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
        >
          Sign out
        </button>
      </div>

      <ConfirmModal
        open={signOutOpen}
        title="Sign out?"
        description="You can sign back in anytime to access your sounds and playlists."
        confirmLabel="Sign out"
        onClose={() => setSignOutOpen(false)}
        onConfirm={async () => {
          await signOut();
          setSignOutOpen(false);
        }}
      />
    </section>
  );
}
