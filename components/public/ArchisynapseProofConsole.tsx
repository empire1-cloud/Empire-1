'use client';

import { useState } from 'react';

type ProofState = 'ready' | 'validated' | 'blocked';

const checks = [
  ['Fable-5 intent scope', 'PASS', 'Sandbox intent permits only this Lyrica royalty proof.'],
  ['Merchant identity', 'PASS', 'Sandbox fixture is scoped to Lyrica 3.'],
  ['Provenance packet', 'PASS', 'Ownership event and remix lineage are present.'],
  ['Royalty splits', 'PASS', 'Creator 80% + collaborator 20% = 100%.'],
  ['Idempotency', 'PASS', 'The demo key resolves to one obligation.'],
  ['Processor boundary', 'DISABLED', 'External settlement is not enabled.'],
];

export default function ArchisynapseProofConsole() {
  const [proofState, setProofState] = useState<ProofState>('ready');

  return (
    <div className="archi-console">
      <style>{`
        .archi-console{margin-top:34px;border:1px solid var(--line-strong);border-radius:16px;overflow:hidden;background:linear-gradient(155deg,rgba(17,17,27,.98),rgba(8,8,13,.98));box-shadow:0 28px 70px rgba(0,0,0,.35)}
        .archi-console-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:14px 18px;border-bottom:1px solid var(--line);font:10px 'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
        .archi-live{display:inline-flex;align-items:center;gap:8px;color:#41e18b}.archi-live i{width:7px;height:7px;border-radius:50%;background:#41e18b;box-shadow:0 0 9px #41e18b}
        .archi-console-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr)}
        .archi-request,.archi-result{padding:28px}.archi-request{border-right:1px solid var(--line)}
        .archi-label{font:10px 'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);margin-bottom:16px}
        .archi-fields{display:grid;gap:10px}.archi-field{display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid var(--line);font-size:13px}.archi-field span{color:var(--muted)}.archi-field b{font-family:'JetBrains Mono',monospace;font-size:12px;text-align:right}
        .archi-actions{display:grid;gap:10px;margin-top:24px}.archi-button{border:0;border-radius:7px;padding:13px 15px;font:700 11px 'JetBrains Mono',monospace;letter-spacing:.05em;text-transform:uppercase;cursor:pointer}.archi-button.primary{background:var(--gold);color:#080808}.archi-button.danger{background:transparent;border:1px solid rgba(255,76,96,.55);color:#ff7888}.archi-button:hover{filter:brightness(1.08)}
        .archi-note{margin-top:14px!important;font:10px/1.6 'JetBrains Mono',monospace!important;color:var(--muted)!important}
        .archi-checks{display:grid;gap:9px}.archi-check{display:grid;grid-template-columns:minmax(120px,.7fr) 72px minmax(0,1.3fr);gap:12px;align-items:center;padding:11px 12px;border:1px solid var(--line);border-radius:8px;font-size:12px}.archi-check strong{font:10px 'JetBrains Mono',monospace;color:#41e18b}.archi-check:last-child strong{color:#ff7888}.archi-check small{color:var(--muted);line-height:1.45}
        .archi-outcome{margin-top:20px;padding:18px;border-radius:10px;border:1px solid var(--line-strong);background:rgba(255,255,255,.025)}.archi-outcome h3{font:700 17px 'JetBrains Mono',monospace;margin:0 0 8px}.archi-outcome p{font-size:12px!important;line-height:1.6!important;margin:0!important;color:#b8b8c0!important}.archi-outcome.ready h3{color:var(--muted)}.archi-outcome.validated{border-color:rgba(65,225,139,.35)}.archi-outcome.validated h3{color:#41e18b}.archi-outcome.blocked{border-color:rgba(255,76,96,.45)}.archi-outcome.blocked h3{color:#ff7888}
        .archi-journal{margin-top:14px;display:grid;grid-template-columns:1fr auto auto;gap:8px 14px;font:10px 'JetBrains Mono',monospace}.archi-journal span{padding:7px 0;border-bottom:1px solid var(--line)}.archi-journal .money{text-align:right;color:#fff}.archi-balanced{grid-column:1/-1;color:#41e18b!important;border-bottom:0!important;padding-top:11px!important}
        @media(max-width:760px){.archi-console-grid{grid-template-columns:1fr}.archi-request{border-right:0;border-bottom:1px solid var(--line)}.archi-check{grid-template-columns:1fr 70px}.archi-check small{grid-column:1/-1}}
      `}</style>

      <div className="archi-console-head">
        <span>archisynapse://royalty-proof/demo</span>
        <span className="archi-live"><i /> interface online</span>
      </div>

      <div className="archi-console-grid">
        <div className="archi-request">
          <div className="archi-label">Sandbox royalty event</div>
          <div className="archi-fields">
            <div className="archi-field"><span>Source universe</span><b>Lyrica 3</b></div>
            <div className="archi-field"><span>Event</span><b>LYR-DEMO-001</b></div>
            <div className="archi-field"><span>Gross obligation</span><b>$100.00 USD</b></div>
            <div className="archi-field"><span>Creator</span><b>$80.00</b></div>
            <div className="archi-field"><span>Collaborator</span><b>$20.00</b></div>
          </div>
          <div className="archi-actions">
            <button className="archi-button primary" onClick={() => setProofState('validated')}>Validate sandbox event</button>
            <button className="archi-button danger" onClick={() => setProofState('blocked')}>Attempt external settlement</button>
          </div>
          <p className="archi-note">Deterministic interface proof only. No customer data, processor call, signature, or money movement occurs.</p>
        </div>

        <div className="archi-result" aria-live="polite">
          <div className="archi-label">Governance gates</div>
          <div className="archi-checks">
            {checks.map(([name, status, detail]) => (
              <div className="archi-check" key={name}>
                <span>{name}</span><strong>{status}</strong><small>{detail}</small>
              </div>
            ))}
          </div>

          {proofState === 'ready' && (
            <div className="archi-outcome ready">
              <h3>READY FOR PROOF</h3>
              <p>Validate the obligation or test the fail-closed settlement boundary.</p>
            </div>
          )}

          {proofState === 'validated' && (
            <div className="archi-outcome validated">
              <h3>VALIDATED — NOT SETTLED</h3>
              <p>The ownership packet and splits satisfy the sandbox policy. The obligation is balanced, but external settlement remains disabled.</p>
              <div className="archi-journal">
                <span>Royalty expense</span><span className="money">Debit</span><span className="money">$100.00</span>
                <span>Creator payables</span><span className="money">Credit</span><span className="money">$100.00</span>
                <span className="archi-balanced">BALANCED · DEBITS $100.00 = CREDITS $100.00</span>
              </div>
            </div>
          )}

          {proofState === 'blocked' && (
            <div className="archi-outcome blocked">
              <h3>BLOCKED — NO MONEY MOVED</h3>
              <p>The external processor is disabled. Archisynapse refuses to convert a validated obligation into a settlement without the required deployment and processor proof.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
