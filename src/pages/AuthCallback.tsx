import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Supabase client will exchange the OAuth code automatically (PKCE),
      // but we wait for the session to exist before navigating.
      await supabase.auth.getSession();

      if (cancelled) return;
      let to = "/";
      try {
        const stored = localStorage.getItem("auth:redirectTo");
        if (stored) {
          to = stored;
          localStorage.removeItem("auth:redirectTo");
        }
      } catch {
        // ignore
      }
      navigate(to, { replace: true });
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

