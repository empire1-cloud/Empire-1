import { headers } from 'next/headers';
import EmpireHome from '@/components/tenants/EmpireHome';
import Sla113Home from '@/components/tenants/Sla113Home';
import SouthernHome from '@/components/tenants/SouthernHome';
import ArcadeHome from '@/components/tenants/ArcadeHome';

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
  const host = headersList.get('host') || '';
  const cleanHost = host.split(':')[0].toLowerCase();

  // 1. SLA113 ADMIN CONSOLE (Private)
  if (cleanHost === 'sla113.southernlifestyle.org') {
    return <Sla113Home />;
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
