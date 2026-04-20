import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import EmpireHome from '@/components/tenants/EmpireHome';
import SouthernHome from '@/components/tenants/SouthernHome';
import ArcadeHome from '@/components/tenants/ArcadeHome';
import { redirect } from 'next/navigation';

export function generateMetadata(): Metadata {
  const host = headers().get('host') || '';
  const cleanHost = host.split(':')[0].toLowerCase();
  const isLocalDev = cleanHost.includes('localhost') || cleanHost.includes('127.0.0.1');

  if (cleanHost === 'sla113.southernlifestyle.org' || isLocalDev) {
    return {
      title: 'SLA113 Admin',
      description: 'SLA113 operator console',
    };
  }

  if (cleanHost === 'arcade.southernlifestyle.org') {
    return {
      title: 'Southern Arcade',
      description: 'Southern Lyfestyle arcade experience',
    };
  }

  if (cleanHost === 'southernlifestyle.org' || cleanHost === 'www.southernlifestyle.org') {
    return {
      title: 'Southern Lyfestyle',
      description: 'Southern Lyfestyle public homepage',
    };
  }

  return {
    title: 'Empire One',
    description: 'Empire One platform homepage',
  };
}

/**
 * Root Dispatcher
 * 
 * Domain Routing:
 * 1. sla113.southernlifestyle.org -> PRIVATE ADMIN CONSOLE (SLA113)
 * 2. arcade.southernlifestyle.org -> PERSONAL SWEEPSTAKES ARCADE (PixiJS Body)
 * 3. southernlifestyle.org        -> SOUTHERN LYFESTYLE ARCADE (Public Homepage)
 * 4. empire1.cloud                -> EMPIRE ONE (MAIN BUSINESS)
 */
export default function RootPage() {
  const headersList = headers();
  const cookieStore = cookies();
  const host = headersList.get('host') || '';
  const cleanHost = host.split(':')[0].toLowerCase();
  const isLocalDev = cleanHost.includes('localhost') || cleanHost.includes('127.0.0.1');

  // 1. SLA113 ADMIN CONSOLE (Private)
  if (cleanHost === 'sla113.southernlifestyle.org' || isLocalDev) {
    const adminToken = cookieStore.get('admin_token')?.value;
    redirect(adminToken ? '/admin' : '/admin/login');
  }

  // 2. PERSONAL SWEEPSTAKES ARCADE (The "Body")
  if (cleanHost === 'arcade.southernlifestyle.org') {
    return <ArcadeHome />;
  }

  // 3. SOUTHERN LYFESTYLE ARCADE (Public Business Layer)
  if (cleanHost === 'southernlifestyle.org' || 
      cleanHost === 'www.southernlifestyle.org') {
    return <SouthernHome />;
  }

  // 4. EMPIRE ONE (Primary SaaS)
  return <EmpireHome />;
}
