import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_PUBLIC_BACKEND_URL = 'https://api.empire1.cloud';
const DEFAULT_PUBLIC_SLA113_BACKEND_URL = 'https://api.empire1.cloud';

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, '');
}

function isFoundryPath(pathParts: string[]): boolean {
  return pathParts[0] === 'foundry';
}

function getBackendBase(pathParts: string[]): string {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isFoundryPath(pathParts)) {
    const configured = process.env.PUBLIC_SLA113_BACKEND_URL
      || (!isProduction ? process.env.SLA113_BACKEND_URL : undefined);
    return normalizeBaseUrl(configured || DEFAULT_PUBLIC_SLA113_BACKEND_URL);
  }

  const configured = process.env.PUBLIC_BACKEND_URL
    || process.env.NEXT_PUBLIC_API_URL
    || (!isProduction ? process.env.BACKEND_URL : undefined);

  return normalizeBaseUrl(configured || DEFAULT_PUBLIC_BACKEND_URL);
}

function buildTargetUrl(pathParts: string[], request: NextRequest): string {
  const base = getBackendBase(pathParts);
  const path = pathParts.join('/');
  const search = request.nextUrl.search || '';
  return `${base}/${path}${search}`;
}

async function proxy(request: NextRequest, context: { params: { path: string[] } }): Promise<NextResponse> {
  const pathParts = context.params.path || [];
  const targetUrl = buildTargetUrl(pathParts, request);

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');
  headers.set('x-empire-proxy', 'public-next-route');

  const method = request.method.toUpperCase();
  const hasBody = !['GET', 'HEAD'].includes(method);

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body: hasBody ? request.body : undefined,
      duplex: hasBody ? 'half' : undefined,
      redirect: 'manual',
      cache: 'no-store',
    } as RequestInit & { duplex?: 'half' });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('transfer-encoding');
    responseHeaders.set('cache-control', 'no-store');

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Empire public API proxy failed', {
      path: pathParts.join('/'),
      error: error instanceof Error ? error.message : 'unknown error',
    });

    return NextResponse.json(
      {
        error: 'Empire backend is temporarily unavailable.',
        code: 'UPSTREAM_UNAVAILABLE',
        path: pathParts.join('/'),
      },
      { status: 502, headers: { 'cache-control': 'no-store' } },
    );
  }
}

export async function GET(request: NextRequest, context: { params: { path: string[] } }) {
  return proxy(request, context);
}

export async function POST(request: NextRequest, context: { params: { path: string[] } }) {
  return proxy(request, context);
}

export async function PUT(request: NextRequest, context: { params: { path: string[] } }) {
  return proxy(request, context);
}

export async function PATCH(request: NextRequest, context: { params: { path: string[] } }) {
  return proxy(request, context);
}

export async function DELETE(request: NextRequest, context: { params: { path: string[] } }) {
  return proxy(request, context);
}

export async function OPTIONS(request: NextRequest, context: { params: { path: string[] } }) {
  return proxy(request, context);
}
