import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AuthLoading, AuthShell } from "@/app/auth-shell";
import { LoginForm } from "@/app/login/login-form";
import { createClient } from "@/lib/supabase/server";

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <LoginContent />
    </Suspense>
  );
}

async function LoginContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims?.sub) {
    redirect("/documents");
  }

  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      title="Sign in"
      description="Pick up where your knowledge left off."
    >
      <LoginForm />
    </AuthShell>
  );
}