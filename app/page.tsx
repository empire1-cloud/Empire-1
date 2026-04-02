import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import EmpireHome from '@/components/tenants/EmpireHome';
import SouthernHome from '@/components/tenants/SouthernHome';
import ArcadeHome from '@/components/tenants/ArcadeHome';

/**
 * Root Dispatcher
 * 
 * Domain Routing:
 * 1. sla113.southernlifestyle.org -> PRIVATE ADMIN CONSOLE (redirects to /admin)
 * 2. arcade.southernlifestyle.org -> PERSONAL SWEEPSTAKES ARCADE
 * 3. southernlifestyle.org        -> SOUTHERN LYFESTYLE FRONTEND
 * 4. empire1.cloud                -> EMPIRE ONE FRONTEND
 */
export default function RootPage() {
  const headersList = headers();
  const host = headersList.get('host') || '';
  const cleanHost = host.split(':')[0].toLowerCase();

  // 1. SLA113 ADMIN CONSOLE (Private)
  if (cleanHost === 'sla113.southernlifestyle.org') {
    redirect('/admin');
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
