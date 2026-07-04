import { redirect } from 'next/navigation';

/**
 * /foundry — Middleware already enforces SLA113-domain-only access.
 * Delegate to the admin foundry page.
 */
export default function FoundryRoute() {
  redirect('/admin/foundry');
}
