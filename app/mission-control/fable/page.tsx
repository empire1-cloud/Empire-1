import type { Metadata } from 'next';
import Fable5Connection from '@/components/mission-control/Fable5Connection';

export const metadata: Metadata = {
  title: 'Fable 5 Connection · Empire-1',
  description: 'Read-only Fable 5 and Empire Auto Cofounder execution connection status.',
};

export default function Fable5ConnectionPage() {
  return <Fable5Connection detailed />;
}
