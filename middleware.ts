import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware: Admin Route Protection & Tenant Detection
 */

const PUBLIC_SOUTHERN_URL = 'https://southernlifestyle.org/'

function detectTenant(host: string): string {
  if (!host) return 'empire1'
  const cleanHost = host.split(':')[0].toLowerCase()
  
  if (cleanHost.includes('sla113.southernlifestyle.org')) {
    return 'sla113'
  }

  if (cleanHost === 'arcade.southernlifestyle.org') {
    return 'southern_arcade'
  }

  if (cleanHost === 'southernlifestyle.org' || 
      cleanHost === 'www.southernlifestyle.org') {
    return 'southern_lyfestyle'
  }
  
  if (cleanHost.includes('empire1.cloud')) {
    return 'empire1'
  }
  
  if (cleanHost.startsWith('sla113-')) return 'sla113'
  if (cleanHost.startsWith('arcade-')) return 'southern_lyfestyle'

  return 'empire1'
}

export function middleware(request: NextRequest) {
  let pathname = request.nextUrl.pathname
  const host = request.headers.get('host') || ''
  const isDev = host.includes('localhost') || host.includes('127.0.0.1')
  
  // 1. Skip middleware for assets
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || 
      pathname.endsWith('.png') || pathname.endsWith('.ico') || 
      pathname.endsWith('.jpg') || pathname.endsWith('.svg') || 
      pathname.endsWith('.mp3') || pathname.endsWith('.wav')) {
    return NextResponse.next()
  }
  
  const tenant = detectTenant(host)
  const token = request.cookies.get('admin_token')?.value

  // Empire1 Routes - only allow on empire1.cloud
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/operator')) {
    if (tenant !== 'empire1') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // SLA113 Routes - only allow on sla113
  if (pathname.startsWith('/admin') || pathname.startsWith('/foundry')) {
    if (tenant !== 'sla113') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Arcade routes live exclusively on the arcade subdomain.
  if (pathname.startsWith('/joey-game')) {
    if (tenant !== 'southern_arcade') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  // Southern Routes - only allow on southernlifestyle.org
  if (pathname.startsWith('/southern')) {
    if (tenant !== 'southern_lyfestyle') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Legacy: check auth for admin routes
  if (pathname.endsWith('.html')) {
    const cleanPath = pathname.replace('.html', '')
    return NextResponse.rewrite(new URL(cleanPath, request.url))
  }

  // SLA113 host is admin-only. Root should land in admin, and unauthenticated access is pushed back to the public site.
  if (tenant === 'sla113') {
    if (!token && !isDev) {
      return NextResponse.redirect(PUBLIC_SOUTHERN_URL)
    }

    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    if (!pathname.startsWith('/admin') && !pathname.startsWith('/foundry')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // 3. Admin Partitioning
  if (pathname.startsWith('/admin')) {
    if (tenant !== 'sla113') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Auth Check
    if (!token && !isDev) {
      return NextResponse.redirect(PUBLIC_SOUTHERN_URL)
    }
  }
  
  // 4. Custom Tenant Header
  const response = NextResponse.next()
  response.headers.set('x-tenant-id', tenant)
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
