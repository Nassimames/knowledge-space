import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function getSafeRedirectPath(value: string | null, baseUrl: URL): string {
  if (!value) {
    return "/documents";
  }

  const destination = new URL(value, baseUrl);

  if (destination.origin !== baseUrl.origin) {
    return "/documents";
  }

  return `${destination.pathname}${destination.search}${destination.hash}`;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = getSafeRedirectPath(request.nextUrl.searchParams.get("next"), request.nextUrl);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?authError=confirmation", request.url));
}