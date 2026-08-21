import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_BACKEND_URL = 'https://empire-1-api.onrender.com';
const DEFAULT_SLA113_BACKEND_URL = 'https://api.sla113.southernlifestyle.org';

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, '');
}

function isFoundryPath(pathParts: string[]): boolean {
  return pathParts[0] === 'foundry';
}

function getBackendBase(pathParts: string[]): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const hybridConfigured = process.env.PUBLIC_BACKEND_URL
    || process.env.NEXT_PUBLIC_API_URL
    || (!isProduction ? process.env.BACKEND_URL : undefined);
  const sla113Configured = process.env.PUBLIC_SLA113_BACKEND_URL
    || (!isProduction ? process.env.SLA113_BACKEND_URL : undefined);

  if (isFoundryPath(pathParts)) {
    return normalizeBaseUrl(sla113Configured || DEFAULT_SLA113_BACKEND_URL);
  }

  return normalizeBaseUrl(hybridConfigured || DEFAULT_BACKEND_URL);
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
  headers.delete('x-serverless-authorization');

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

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Empire API proxy failed', { targetUrl, error });
    return NextResponse.json(
      {
        error: 'backend_unreachable',
        message: 'Empire-1 could not reach its configured API backend.',
      },
      { status: 502 },
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
