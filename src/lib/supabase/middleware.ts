import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { categoryForPath, limits, rateLimit } from "@/lib/rate-limit";

export async function updateSession(request: NextRequest) {
  const { pathname: path } = request.nextUrl;
  if (path.startsWith("/api/")) {
    const cat = categoryForPath(path);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
    const result = rateLimit(`${cat}:${ip}:${path}`, limits[cat]);
    if (!result.allowed) {
      return new NextResponse(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: {
          "content-type": "application/json",
          "x-ratelimit-remaining": String(result.remaining),
          "x-ratelimit-reset": String(result.resetAt),
        },
      });
    }
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const rawDemo = request.cookies.get("demo_session")?.value;
  const demoSession = rawDemo ? decodeURIComponent(rawDemo) : undefined;
  let user = null;

  if (demoSession) {
    user = {
      id: demoSession,
      email: demoSession,
      app_metadata: { role: demoSession.includes("admin") ? "SUPER_ADMIN" : "USER" },
      user_metadata: { role: demoSession.includes("admin") ? "SUPER_ADMIN" : "USER" },
    } as any;
  } else {
    try {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();
      user = supabaseUser;
    } catch {
      user = null;
    }
  }

  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith("/krishna/admin");
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/company") ||
    isAdmin;

  const hasAdminCode = Boolean(request.cookies.get("krishna_admin")?.value);

  if (!user && isProtected && !(isAdmin && hasAdminCode)) {
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/krishna" : "/login";
    if (!isAdmin) url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAdmin && !hasAdminCode) {
    const role = (user.app_metadata?.role ?? user.user_metadata?.role) as
      | string
      | undefined;
    if (role !== "SUPER_ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/krishna";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
