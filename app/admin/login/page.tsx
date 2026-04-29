import { headers } from 'next/headers';

import Sla113ConsoleEntry from '@/components/admin/Sla113ConsoleEntry';
import AdminLoginForm from './AdminLoginForm';

export default function AdminLoginPage() {
  const host = headers().get('host') || '';
  const cleanHost = host.split(':')[0].toLowerCase();
  const isLocalDev = cleanHost.includes('localhost') || cleanHost.includes('127.0.0.1');

  if (isLocalDev) {
    return <Sla113ConsoleEntry />;
  }

  return <AdminLoginForm />;
}