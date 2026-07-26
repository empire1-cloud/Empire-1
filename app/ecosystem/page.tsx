import type { Metadata } from 'next';
import PublicPageShell from '@/components/public/PublicPageShell';

export const metadata: Metadata = {
  title: 'Ecosystem — Empire-1',
  description: 'The product universes built on the Hybrid Intelligence Core.',
};

const ECOSYSTEMS = [
  { tag: 'Intelligence Layer', tagColor: 'var(--blue)', name: 'Hybrid Intelligence Core', desc: 'The routing engine, canon enforcement, format normalization, and drift monitoring that powers every universe. Multi-model orchestration behind one voice.', status: 'Operational build — backend verification pending', dot: 'dot-active' },
  { tag: 'Factory', tagColor: 'var(--gold)', name: 'SLA113', desc: 'The sovereign control plane and factory for white-label operating systems, platforms, and branded business instances, with a specialized engine and white-label platform stack.', status: 'Internal operational build', dot: 'dot-active' },
  { tag: 'Revenue Engine', tagColor: '#3ddc84', name: 'Revenue OS', desc: 'Turn your business into a revenue system. AI-powered pipeline orchestration — from lead generation to deal closure, with receipts and evidence.', status: 'Public experience available', dot: 'dot-live' },
  { tag: 'Music Ecosystem', tagColor: 'var(--pink)', name: 'Lyrica 3', desc: 'Creator-owned music intelligence — provenance, rights, and cultural context carried with every piece of work from creation forward.', status: 'Active development', dot: 'dot-active' },
  { tag: 'Trust Layer', tagColor: 'var(--gold)', name: 'Archisynapse', desc: 'The trust, ledger, fraud, royalty, and payment infrastructure. Settlement and verification for transactions across the empire.', status: 'Active development', dot: 'dot-active' },
  { tag: 'Public Proof', tagColor: 'var(--blue)', name: 'Southern Lyfestyle', desc: 'An independent experience business powered by SLA113, built to demonstrate factory output.', status: 'Public proof experience', dot: 'dot-live' },
  { tag: 'Gaming', tagColor: 'var(--pink)', name: 'Southern Arcade', desc: 'Arcade OS built on SLA113 — entertainment designed to support an independent revenue model, with its own identity and provenance chain.', status: 'Active development', dot: 'dot-active' },
  { tag: 'Platform', tagColor: 'var(--muted)', name: 'Sonance Pro', desc: 'Professional audio intelligence — sound design, mastering, and production tools built on the Empire-1 core.', status: 'Active development', dot: 'dot-dev' },
  { tag: 'Narrative', tagColor: 'var(--muted)', name: 'Empire Narrative', desc: 'Story intelligence — character consistency, world-building, and narrative coherence across creative projects.', status: 'In development', dot: 'dot-dev' },
];

export default function EcosystemPage() {
  return (
    <PublicPageShell>
      <style dangerouslySetInnerHTML={{ __html: `
        .eco-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line-strong);border:1px solid var(--line-strong);margin-top:40px;}
        @media(max-width:760px){.eco-grid{grid-template-columns:1fr 1fr;}}
        @media(max-width:480px){.eco-grid{grid-template-columns:1fr;}}
        .eco-card{background:var(--surface);padding:28px 24px;transition:background .2s;}
        .eco-card:hover{background:rgba(232,185,35,0.04);}
        .eco-tag{font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;}
        .eco-card h3{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:20px;margin:0 0 10px;}
        .eco-card p{font-size:13.5px;line-height:1.6;color:#b4b4bb;margin:0 0 16px;}
        .eco-status{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;display:flex;align-items:flex-start;gap:8px;line-height:1.5;}
        .eco-status .dot{width:6px;height:6px;border-radius:50%;flex:0 0 auto;margin-top:5px;}
        .dot-live{background:#3ddc84;box-shadow:0 0 8px #3ddc84;}
        .dot-active{background:var(--gold);box-shadow:0 0 8px var(--gold);}
        .dot-dev{background:var(--muted);}
      ` }} />

      <section className="hero wrap">
        <div className="eyebrow">ECOSYSTEM</div>
        <h1>Every universe runs on the same core.</h1>
        <p>Empire-1 is not one product — it&apos;s a system of independent universes, each built on the Hybrid Intelligence Core. Every universe carries its own identity, its own provenance, and its own obligation to survive on revenue, not permission.</p>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eco-grid">
            {ECOSYSTEMS.map((eco) => (
              <div className="eco-card" key={eco.name}>
                <div className="eco-tag" style={{ color: eco.tagColor }}>{eco.tag}</div>
                <h3>{eco.name}</h3>
                <p>{eco.desc}</p>
                <div className="eco-status">
                  <span className={`dot ${eco.dot}`} />
                  {eco.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">THE LAW</div>
          <h2>If it doesn&apos;t generate revenue, it doesn&apos;t stay.</h2>
          <p>Every universe under Empire-1 answers to the same law: pull your own weight or get cut. No universe survives on story alone. No universe survives on founder sentiment. Every universe is built to demonstrate a viable revenue path on its own terms.</p>
        </div>
      </section>
    </PublicPageShell>
  );
}
