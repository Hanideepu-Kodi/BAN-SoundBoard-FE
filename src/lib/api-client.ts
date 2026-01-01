import { supabase } from "@/lib/supabase-client";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
};

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const { skipAuth, headers, ...rest } = options;
  const session = skipAuth ? null : (await supabase.auth.getSession()).data.session;
  const authHeader = session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};

  return fetch(`${baseUrl}${path}`, {
    ...rest,
    headers: {
      ...authHeader,
      ...(headers ?? {}),
    },
  });
}
