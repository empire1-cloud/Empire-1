import type { Metadata } from 'next';
import MissionControlClient from '@/components/mission-control/MissionControlClient';

export const metadata: Metadata = {
  title: 'Empire-1 Mission Control',
  description: 'Private founder governance and approval-controlled command loop for Empire-1.',
};

export default function MissionControlPage() {
  return <MissionControlClient />;
}
