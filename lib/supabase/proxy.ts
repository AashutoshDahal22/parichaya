import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Refresh and validate the user's authentication session.
  const { data, error } = await supabase.auth.getClaims();

  const isAuthenticated = !error && !!data?.claims?.sub;
  const pathname = request.nextUrl.pathname;

  // Redirect authenticated users away from the auth page.
  if (isAuthenticated && pathname === "/auth") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";

    const redirectResponse = NextResponse.redirect(redirectUrl);

    // Preserve Supabase cookies.
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  // Redirect unauthenticated users away from dashboard pages.
  if (!isAuthenticated && pathname.startsWith("/dashboard")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth";

    const redirectResponse = NextResponse.redirect(redirectUrl);

    // Preserve Supabase cookies.
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  return supabaseResponse;
}
