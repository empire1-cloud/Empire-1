import type { Metadata } from 'next';
import PublicPageShell from '@/components/public/PublicPageShell';
import PipelineComposer from '@/components/hic/PipelineComposer';

export const metadata: Metadata = {
  title: 'Pipeline Composer — Hybrid Intelligence Core',
  description: 'Chain HIC engines into complex, sequenced workflows.',
};

export default function ComposerPage() {
  return (
    <PublicPageShell>
      <PipelineComposer />
    </PublicPageShell>
  );
}
