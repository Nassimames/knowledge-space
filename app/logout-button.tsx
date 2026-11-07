"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        setErrorMessage(error.message);
        setIsSigningOut(false);
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign out right now.");
      setIsSigningOut(false);
    }
  };

  return (
    <div className="workspace-account">
      <button className="auth-signout" type="button" onClick={() => void handleSignOut()} disabled={isSigningOut}>
        <span aria-hidden="true">↪</span>
        {isSigningOut ? "Signing out…" : "Sign out"}
      </button>
      {errorMessage ? <span className="account-error" role="alert">{errorMessage}</span> : null}
    </div>
  );
}