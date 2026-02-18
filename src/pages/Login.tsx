import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [loading, user, navigate]);

  const handleGoogle = async () => {
    setSubmitting(true);
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
    if (error) {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold">
            QR
          </div>
          <div>
            <h1 className="text-xl font-bold">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Continue to your QR Generator dashboard
            </p>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleGoogle}
          disabled={submitting || loading}
        >
          Continue with Google
        </Button>

        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
          By continuing, you agree that your QR codes and analytics are stored in
          your Supabase project under your account.
        </p>
      </div>
    </div>
  );
}

