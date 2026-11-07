import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AuthLoading, AuthShell } from "@/app/auth-shell";
import { SignupForm } from "@/app/signup/signup-form";
import { createClient } from "@/lib/supabase/server";

export default function SignupPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <SignupContent />
    </Suspense>
  );
}

async function SignupContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims?.sub) {
    redirect("/documents");
  }

  return (
    <AuthShell
      eyebrow="START YOUR WORKSPACE"
      title="Create your account"
      description="A private space for the documents and ideas you want to keep."
    >
      <SignupForm />
    </AuthShell>
  );
}