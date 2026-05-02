import type { Metadata } from 'next';
import Sla113ConsoleEntry from '@/components/admin/Sla113ConsoleEntry';

export const metadata: Metadata = {
  title: 'SLA113',
  description: 'SLA113 operator console',
};

export default function Sla113StandalonePage() {
  return <Sla113ConsoleEntry />;
}
