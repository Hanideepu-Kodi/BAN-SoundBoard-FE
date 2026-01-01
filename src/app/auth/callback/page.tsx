"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Finishing sign-in...");

  useEffect(() => {
    const finalize = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            throw error;
          }
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            throw error;
          }
        } else {
          await supabase.auth.getSession();
        }

        router.replace("/");
      } catch (error) {
        console.error("Auth callback failed", error);
        setStatus("We couldn't finish signing you in. Please try again.");
      }
    };

    finalize();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base text-sm text-fg-muted">
      {status}
    </div>
  );
}
