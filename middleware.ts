import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const aiBucket = new Map<string, RateLimitBucket>();
const contactBucket = new Map<string, RateLimitBucket>();

function getClientKey(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  return forwarded || request.headers.get("x-real-ip") || "anonymous";
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!origin) {
    const fetchSite = request.headers.get("sec-fetch-site");

    return !fetchSite || fetchSite === "same-origin" || fetchSite === "same-site" || fetchSite === "none";
  }

  try {
    const originUrl = new URL(origin);

    return originUrl.host === request.nextUrl.host;
  } catch {
    return false;
  }
}

function applyRateLimit(
  map: Map<string, RateLimitBucket>,
  key: string,
  limit: number,
) {
  const now = Date.now();
  const current = map.get(key);

  if (!current || current.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 60 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  map.set(key, current);

  return { allowed: true, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
}

function tooManyRequestsResponse(pathname: string, retryAfter: number) {
  if (pathname === "/api/contact") {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
        },
      },
    );
  }

  return new NextResponse("Too many requests. Try again in a minute.", {
    status: 429,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Retry-After": String(retryAfter),
      "Cache-Control": "no-store",
    },
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method !== "POST") {
    return NextResponse.next();
  }

  if (!isSameOrigin(request)) {
    return pathname === "/api/contact"
      ? NextResponse.json({ error: "Forbidden origin." }, { status: 403 })
      : new NextResponse("Forbidden origin.", {
          status: 403,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
  }

  const key = `${pathname}:${getClientKey(request)}`;

  if (pathname === "/api/ai-agent" || pathname === "/api/ai-service") {
    const result = applyRateLimit(aiBucket, key, 10);

    if (!result.allowed) {
      return tooManyRequestsResponse(pathname, result.retryAfter);
    }
  }

  if (pathname === "/api/contact") {
    const result = applyRateLimit(contactBucket, key, 3);

    if (!result.allowed) {
      return tooManyRequestsResponse(pathname, result.retryAfter);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/ai-agent", "/api/ai-service", "/api/contact"],
};
