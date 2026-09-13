import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

/**
 * GitHub OAuth lands here with ?code=... to be exchanged for a session cookie,
 * or with ?error=... when the provider or Supabase rejected the attempt.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  // Behind Vercel's proxy `origin` is the internal deployment URL, which would
  // send the browser somewhere it can't reach. The forwarded host is the real one.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const base =
    process.env.NODE_ENV === "development" || !forwardedHost ? origin : `https://${forwardedHost}`;

  const fail = (reason: string) =>
    NextResponse.redirect(`${base}/login?error=${encodeURIComponent(reason.slice(0, 200))}`);

  // Supabase forwards the provider's rejection here rather than an auth code.
  const providerError = searchParams.get("error_description") ?? searchParams.get("error");
  if (providerError) return fail(providerError);

  const code = searchParams.get("code");
  if (!code) return fail("No authorization code was returned.");

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return fail(error.message);

  return NextResponse.redirect(`${base}${safeNext}`);
}
