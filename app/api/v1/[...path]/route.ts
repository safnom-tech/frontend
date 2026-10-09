import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UPSTREAM_TIMEOUT_MS = 120_000;

function backendOrigin(): string {
  return (process.env.BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[]
): Promise<NextResponse> {
  const backend = backendOrigin();
  if (!process.env.BACKEND_URL && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        success: false,
        message: "BACKEND_URL is not configured on the frontend host",
        error: { code: "PROXY_MISCONFIGURED" },
      },
      { status: 503 }
    );
  }

  const path = pathSegments.join("/");
  const target = `${backend}/api/v1/${path}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  for (const key of [...headers.keys()]) {
    const lower = key.toLowerCase();
    if (
      lower === "host" ||
      lower === "connection" ||
      lower.startsWith("cf-") ||
      lower.startsWith("x-forwarded-")
    ) {
      headers.delete(key);
    }
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upstream request failed";
    const waking =
      message.includes("timeout") ||
      message.includes("AbortError") ||
      message.includes("ECONNREFUSED");

    return NextResponse.json(
      {
        success: false,
        message: waking
          ? "API is waking up or unreachable. Wait ~60s and try again (Render free tier)."
          : "Could not reach the API server. Check BACKEND_URL on the frontend host.",
        error: { code: "UPSTREAM_ERROR", details: message },
      },
      { status: waking ? 503 : 502 }
    );
  }
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path ?? []);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
