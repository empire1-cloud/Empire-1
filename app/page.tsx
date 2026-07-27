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

  return (
    <>
      <EmpireHome />
      <style dangerouslySetInnerHTML={{ __html: `
        .services-launch-link{position:fixed;right:18px;bottom:18px;z-index:40;background:#e8b923;color:#080808;padding:13px 17px;border-radius:2px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;box-shadow:0 10px 30px rgba(0,0,0,.38);transition:transform .18s ease,box-shadow .18s ease;}
        .services-launch-link:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(232,185,35,.24);}
        .services-launch-link:focus-visible{outline:2px solid #007aff;outline-offset:3px;}
        @media(max-width:520px){.services-launch-link{left:14px;right:14px;bottom:14px;text-align:center;}}
      ` }} />
      <a className="services-launch-link" href="/services" aria-label="Explore Empire-1 Applied AI Services">Applied AI Services →</a>
    </>
  );
}
