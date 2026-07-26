import type { Metadata } from 'next';
import Fable5Connection from '@/components/mission-control/Fable5Connection';
import MissionControlClient from '@/components/mission-control/MissionControlClient';

export const metadata: Metadata = {
  title: 'Empire-1 Mission Control',
  description: 'Private founder governance, Fable 5 execution visibility, and the approval-controlled Empire-1 command loop.',
};

export default function MissionControlPage() {
  return (
    <>
      <Fable5Connection />
      <MissionControlClient />
    </>
  );
}
