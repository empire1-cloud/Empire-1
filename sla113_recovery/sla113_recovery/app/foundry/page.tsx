import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * /foundry - Only accessible from SLA113 domain
 */
export default function FoundryRoute() {
  const headersList = headers();
  const host = headersList.get('host') || '';
  const cleanHost = host.split(':')[0].toLowerCase();

  // ONLY allow on sla113.southernlifestyle.org
  if (cleanHost === 'sla113.southernlifestyle.org') {
    return import('../admin/foundry/page').then(mod => mod.default);
  }

  redirect('/');
}
