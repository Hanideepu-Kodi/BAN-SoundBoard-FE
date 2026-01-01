export type Creator = {
  id: string;
  handle: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export type Playlist = {
  id: string;
  name: string;
  description: string | null;
  privacy: "public" | "link_only" | "private";
  sound_count: number;
  created_at: string;
  owner_id?: string;
  creator?: Creator | null;
};

export type Sound = {
  id: string;
  name: string;
  url: string;
  tags: string[];
  privacy: "public" | "link_only" | "private";
  duration_seconds: number | null;
  created_at: string;
  owner_id?: string;
  creator?: Creator | null;
  play_count?: number;
};
