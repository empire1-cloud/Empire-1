import type { Metadata } from 'next';
import PublicPageShell from '@/components/public/PublicPageShell';
import ArchisynapseProofConsole from '@/components/public/ArchisynapseProofConsole';

export const metadata: Metadata = {
  title: 'Archisynapse Proof Mode — Empire-1',
  description: 'Public sandbox proof for the Archisynapse ledger, royalty, receipt, and fail-closed processor boundary.',
};

const statusRows = [
  ['Fable-5 intent exchange', 'Interface proof only', 'Direct signed token exchange remains an integration gate.'],
  ['Payment records', 'Implemented in code', 'Approved processor sandbox proof remains a release gate.'],
  ['Double-entry ledger', 'Implemented in code', 'Reconciliation and failure testing continue.'],
  ['Royalty receipt path', 'Implemented behind a flag', 'Deployment verification with approved tenant keys remains.'],
  ['Signed receipts', 'Implemented as an option', 'A deployment signing key and rotation rules are required.'],
  ['External processor', 'Disabled by default', 'No production money movement is enabled.'],
  ['Live settlement', 'Not claimed', 'A test adapter is not a banking or settlement partnership.'],
];

export default function ArchisynapsePage() {
  return (
    <PublicPageShell>
      <style>{`
        .archi-hero{padding-bottom:72px}.archi-badges{display:flex;gap:10px;flex-wrap:wrap;margin:26px 0 0}.archi-badge{padding:8px 11px;border:1px solid var(--line-strong);border-radius:999px;font:10px 'JetBrains Mono',monospace;letter-spacing:.07em;text-transform:uppercase}.archi-badge.gold{color:var(--gold)}.archi-badge.red{color:#ff7888;border-color:rgba(255,76,96,.4)}
        .archi-flow{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;margin-top:34px}.archi-step{min-height:118px;padding:16px;border:1px solid var(--line);border-radius:10px;background:rgba(255,255,255,.025)}.archi-step b{display:block;font:10px 'JetBrains Mono',monospace;color:var(--gold);margin-bottom:10px}.archi-step span{font-size:12px;line-height:1.55;color:#c7c7cd}.archi-step.block{border-color:rgba(255,76,96,.35)}.archi-step.block b{color:#ff7888}
        .archi-status{margin-top:32px;border:1px solid var(--line-strong);border-radius:12px;overflow:hidden}.archi-status-row{display:grid;grid-template-columns:.75fr .7fr 1.55fr;gap:18px;padding:15px 18px;border-bottom:1px solid var(--line);font-size:12px;line-height:1.5}.archi-status-row:last-child{border-bottom:0}.archi-status-row b{font-family:'JetBrains Mono',monospace;font-size:11px}.archi-status-row span{color:var(--gold)}.archi-status-row small{color:var(--muted);font-size:11px}.archi-truth{margin-top:26px;padding:22px;border-left:2px solid var(--gold);background:rgba(232,185,35,.045)}.archi-truth p{margin:0!important;max-width:none!important;font-size:14px!important}.archi-links{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}
        @media(max-width:800px){.archi-flow{grid-template-columns:1fr 1fr}.archi-status-row{grid-template-columns:1fr}.archi-status-row span{margin-top:-10px}}@media(max-width:520px){.archi-flow{grid-template-columns:1fr}}
      `}</style>

      <section className="hero wrap archi-hero">
        <div className="eyebrow">ARCHISYNAPSE · PUBLIC PROOF MODE</div>
        <h1>Money does not move because a screen says “done.”</h1>
        <p>Archisynapse is the independent ledger, risk, royalty, receipt, and payment-orchestration rail inside the Empire-1 federation. Fable-5 governs intent, evidence, authorization, and release policy; Archisynapse owns the financial execution boundary. This public surface proves that relationship without pretending the financial backend is already in production.</p>
        <div className="archi-badges">
          <span className="archi-badge gold">Sandbox interface live</span>
          <span className="archi-badge red">External processor disabled</span>
          <span className="archi-badge">No live settlement claim</span>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">FABLE-5 GOVERNED ROYALTY PATH</div>
          <h2>Lyrica owns the creator event. Archisynapse proves the money path.</h2>
          <div className="archi-flow">
            <div className="archi-step"><b>01 · FABLE-5 INTENT</b><span>A scoped intent authorizes only Lyrica&apos;s royalty obligation.</span></div>
            <div className="archi-step"><b>02 · IDENTITY</b><span>Tenant and merchant boundaries are checked.</span></div>
            <div className="archi-step"><b>03 · PROVENANCE</b><span>Ownership, lineage, splits, and idempotency are verified.</span></div>
            <div className="archi-step"><b>04 · LEDGER</b><span>Only the transaction service may create balanced postings.</span></div>
            <div className="archi-step block"><b>05 · RELEASE</b><span>Settlement fails closed until processor and deployment proof exist.</span></div>
          </div>
          <ArchisynapseProofConsole />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">EVIDENCE BEFORE CLAIMS</div>
          <h2>What exists, and what still has to be proved.</h2>
          <div className="archi-status">
            {statusRows.map(([area, state, boundary]) => (
              <div className="archi-status-row" key={area}>
                <b>{area}</b><span>{state}</span><small>{boundary}</small>
              </div>
            ))}
          </div>
          <div className="archi-truth">
            <p><strong>Current public truth:</strong> the console models the Fable-5 governance contract with sandbox fixtures; it is not yet a signed Fable-5 token exchange. The multi-service backend contains payment, ledger, risk, analytics, gateway, idempotency, merchant lifecycle, and receipt implementation. Production database verification, managed secrets, processor sandbox evidence, and recovery proof remain release gates. Until those gates pass, this page stays a sandbox proof and external money movement stays off.</p>
          </div>
          <div className="archi-links">
            <a className="btn btn-primary" href="https://github.com/empire1-cloud/archisynapse-v2" target="_blank" rel="noreferrer">Inspect canonical code ↗</a>
            <a className="btn btn-ghost" href="/ecosystem">Return to ecosystem →</a>
            <a className="btn btn-ghost" href="/hic">Open HIC →</a>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
