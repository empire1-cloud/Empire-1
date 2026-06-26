import type { Metadata } from 'next';
import { headers } from 'next/headers';
import EmpireHome from '@/components/tenants/EmpireHome';
import SouthernHome from '@/components/tenants/SouthernHome';
import { redirect } from 'next/navigation';

export function generateMetadata(): Metadata {
  const host = headers().get('host') || '';
  const cleanHost = host.split(':')[0].toLowerCase();

  if (cleanHost === 'sla113.southernlifestyle.org' || cleanHost.includes('localhost') || cleanHost.includes('127.0.0.1')) {
    return {
      title: 'SLA113',
      description: 'SLA113 standalone',
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

export default function RootPage() {
  const headersList = headers();
  const host = headersList.get('host') || '';
  const cleanHost = host.split(':')[0].toLowerCase();

  if (cleanHost === 'sla113.southernlifestyle.org') {
    redirect('/sla113');
  }

  if (cleanHost === 'southernlifestyle.org' || cleanHost === 'www.southernlifestyle.org') {
    return <SouthernHome />;
  }

  return <EmpireHome />;
}
