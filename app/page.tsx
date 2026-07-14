import type { Metadata } from 'next';
import { headers } from 'next/headers';
import EmpireHome from '@/components/tenants/EmpireHome';
import SouthernHome from '@/components/tenants/SouthernHome';
import { redirect } from 'next/navigation';

export function generateMetadata(): Metadata {
  const host = headers().get('host') || '';
  const cleanHost = host.split(':')[0].toLowerCase();

  if (cleanHost === 'sla113.southernlifestyle.org') {
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
    title: 'Empire 1 — Hybrid Intelligence Core',
    description:
      'Empire-1 runs on the Hybrid Intelligence Core — a self-governing architecture built on Emergent DNA.',
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
