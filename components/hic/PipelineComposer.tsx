'use client';

import { useEffect, useRef, useState } from 'react';

type Tone = 'gold' | 'pink';
type StepStatus = 'queued' | 'running' | 'done';

type EngineDef = { name: string; tone: Tone };
type Step = { uid: number; name: string; tone: Tone; status: StepStatus };

const ENGINES: EngineDef[] = [
  { name: 'Hybrid Intelligence Core', tone: 'gold' },
  { name: 'Routing Engine', tone: 'gold' },
  { name: 'Omni Engine', tone: 'gold' },
  { name: 'Execution Engine', tone: 'gold' },
  { name: 'Strategy Engine', tone: 'gold' },
  { name: 'Plan Builder Engine', tone: 'gold' },
  { name: 'Analysis Engine', tone: 'gold' },
  { name: 'Opportunity Mapper Engine', tone: 'gold' },
  { name: 'Evaluator Engine', tone: 'gold' },
  { name: 'Pricing Engine', tone: 'gold' },
  { name: 'Blueprint Engine', tone: 'gold' },
  { name: 'Money Pipeline Engine', tone: 'gold' },
  { name: 'Pipeline Composer Engine', tone: 'gold' },
  { name: 'Persona Engine', tone: 'pink' },
  { name: 'Anime Character Engine', tone: 'pink' },
  { name: 'Anime Lore Engine', tone: 'pink' },
  { name: 'Anime Story Engine', tone: 'pink' },
  { name: 'Art Direction Engine', tone: 'pink' },
  { name: 'Canon Enforcer', tone: 'gold' },
  { name: 'Drift Monitor', tone: 'gold' },
  { name: 'Error Handler', tone: 'gold' },
];

const STATUS_LABELS: Record<StepStatus, string> = {
  queued: 'QUEUED',
  running: 'RUNNING',
  done: 'DONE',
};

const STEP_DURATION_MS = 850;

const composerCSS = String.raw`
.pc-wrap{max-width:1180px;margin:0 auto;padding:0 28px 100px;}
.pc-hero{padding:80px 0 48px;}
.pc-hero h1{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:clamp(36px,6vw,56px);line-height:1;text-transform:uppercase;margin:16px 0 0;}
.pc-hero p{font-size:15px;color:#b4b4bb;margin:14px 0 0;max-width:520px;line-height:1.6;}

.pc-grid{display:grid;grid-template-columns:340px 1fr;gap:1px;background:var(--line);border:1px solid var(--line);}
@media(max-width:900px){.pc-grid{grid-template-columns:1fr;}}
.pc-panel{background:#0a0a0a;padding:28px;}
.pc-main{display:flex;flex-direction:column;}

.pc-label{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.14em;color:var(--muted);text-transform:uppercase;margin-bottom:6px;}
.pc-hint{font-size:12px;color:var(--muted);margin-bottom:20px;}

.pc-engines{display:flex;flex-direction:column;gap:1px;background:var(--line);border:1px solid var(--line);max-height:640px;overflow-y:auto;}
.pc-engine{background:#050505;padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;border:none;width:100%;text-align:left;color:inherit;font:inherit;}
.pc-engine:hover:not(:disabled){background:#0d0d0e;}
.pc-engine:disabled{cursor:not-allowed;opacity:0.4;}
.pc-tone{width:7px;height:7px;border-radius:2px;flex-shrink:0;}
.pc-tone-gold{background:var(--gold);}
.pc-tone-pink{background:var(--pink);}
.pc-engine-name{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:16px;text-transform:uppercase;letter-spacing:0.01em;}
.pc-badge{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--gold);margin-left:auto;flex-shrink:0;}

.pc-builder-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;gap:16px;}
.pc-builder-head .pc-label{margin-bottom:0;}
.pc-clear{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.05em;color:var(--text);background:transparent;cursor:pointer;padding:7px 16px;border:1px solid var(--line-strong);border-radius:2px;}
.pc-clear:hover:not(:disabled){border-color:var(--pink);color:var(--pink);}
.pc-clear:disabled{opacity:0.35;cursor:not-allowed;}

.pc-steps{display:flex;flex-direction:column;gap:1px;background:var(--line);border:1px solid var(--line);margin-bottom:24px;}
.pc-step{background:#050505;padding:16px 18px;display:flex;align-items:center;gap:14px;}
.pc-step-index{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--gold);width:16px;flex-shrink:0;}
.pc-step-name{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:17px;text-transform:uppercase;flex:1;}
.pc-step-status{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.06em;flex-shrink:0;}
.pc-step-status-queued{color:var(--muted);}
.pc-step-status-running{color:var(--gold);}
.pc-step-status-done{color:#3ddc84;}

.pc-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.pc-dot-queued{background:#4a4a52;}
.pc-dot-running{background:var(--gold);box-shadow:0 0 6px var(--gold);animation:pcPulse 1s ease-in-out infinite;}
.pc-dot-done{background:#3ddc84;box-shadow:0 0 6px #3ddc84;}
@keyframes pcPulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
@media(prefers-reduced-motion:reduce){.pc-dot-running{animation:none;}}

.pc-remove{width:22px;height:22px;border-radius:2px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--muted);font-size:15px;line-height:1;background:transparent;border:none;flex-shrink:0;}
.pc-remove:hover:not(:disabled){background:rgba(230,0,122,0.15);color:var(--pink);}
.pc-remove:disabled{opacity:0.3;cursor:not-allowed;}

.pc-empty{flex:1;display:flex;align-items:center;justify-content:center;padding:60px 0;border:1px dashed rgba(245,245,247,0.12);margin-bottom:24px;font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--muted);text-align:center;}

.pc-input{margin-bottom:24px;}
.pc-input .pc-label{margin-bottom:12px;}
.pc-input textarea{width:100%;border:1px solid rgba(245,245,247,0.12);background:transparent;padding:16px;font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--text);min-height:80px;resize:vertical;outline:none;}
.pc-input textarea:focus{border-color:var(--gold);}
.pc-input textarea::placeholder{color:#5c5c64;}

.pc-runbar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-top:20px;border-top:1px solid var(--line);}
@media(max-width:600px){.pc-runbar{flex-direction:column;align-items:stretch;}}
.pc-run-status{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--muted);}
.pc-run{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.08em;font-weight:600;padding:13px 30px;border:1px solid var(--gold);color:var(--gold);cursor:pointer;border-radius:2px;background:transparent;flex-shrink:0;}
.pc-run:hover:not(:disabled){background:rgba(232,185,35,0.08);}
.pc-run:disabled{border-color:var(--line-strong);color:#5c5c64;cursor:not-allowed;}
.pc-run.is-running{border-color:var(--gold);color:var(--gold);cursor:default;}
`;

export default function PipelineComposer() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);
  const [initialInput, setInitialInput] = useState('');
  const uidRef = useRef(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const addEngine = (engine: EngineDef) => {
    if (running) return;
    const uid = uidRef.current;
    uidRef.current += 1;
    setSteps((prev) => [...prev, { uid, name: engine.name, tone: engine.tone, status: 'queued' }]);
  };

  const removeStep = (uid: number) => {
    if (running) return;
    setSteps((prev) => prev.filter((step) => step.uid !== uid));
  };

  const clearAll = () => {
    if (running) return;
    setSteps([]);
  };

  const runStep = (index: number, total: number) => {
    if (index >= total) {
      setRunning(false);
      return;
    }
    setSteps((prev) => prev.map((step, i) => (i === index ? { ...step, status: 'running' } : step)));
    timerRef.current = setTimeout(() => {
      setSteps((prev) => prev.map((step, i) => (i === index ? { ...step, status: 'done' } : step)));
      runStep(index + 1, total);
    }, STEP_DURATION_MS);
  };

  const runPipeline = () => {
    if (running || steps.length === 0) return;
    setRunning(true);
    setSteps((prev) => prev.map((step) => ({ ...step, status: 'queued' })));
    runStep(0, steps.length);
  };

  const counts = steps.reduce<Record<string, number>>((acc, step) => {
    acc[step.name] = (acc[step.name] || 0) + 1;
    return acc;
  }, {});

  const runningIndex = steps.findIndex((step) => step.status === 'running');
  const allDone = steps.length > 0 && steps.every((step) => step.status === 'done');
  const plural = steps.length > 1 ? 'S' : '';

  let runStatusText = 'ADD ENGINES TO BUILD YOUR PIPELINE';
  if (steps.length > 0) {
    if (running && runningIndex >= 0) {
      runStatusText = `RUNNING STEP ${runningIndex + 1} OF ${steps.length}: ${steps[runningIndex].name.toUpperCase()}`;
    } else if (allDone) {
      runStatusText = `PIPELINE COMPLETE — ${steps.length} STEP${plural} EXECUTED`;
    } else {
      runStatusText = `${steps.length} STEP${plural} READY TO RUN`;
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: composerCSS }} />

      <div className="pc-wrap">
        <section className="pc-hero">
          <div className="eyebrow">WORKFLOW ORCHESTRATION</div>
          <h1>Pipeline Composer</h1>
          <p>
            Chain multiple engines together for complex, sequenced workflows. This is an
            interface preview — steps are simulated locally, not executed against the Core.
          </p>
        </section>

        <div className="pc-grid">
          <aside className="pc-panel">
            <div className="pc-label">Available Engines</div>
            <div className="pc-hint">Click to add to pipeline</div>
            <div className="pc-engines">
              {ENGINES.map((engine) => (
                <button
                  type="button"
                  key={engine.name}
                  className="pc-engine"
                  onClick={() => addEngine(engine)}
                  disabled={running}
                >
                  <span className={`pc-tone pc-tone-${engine.tone}`} />
                  <span className="pc-engine-name">{engine.name}</span>
                  {counts[engine.name] > 0 && <span className="pc-badge">×{counts[engine.name]}</span>}
                </button>
              ))}
            </div>
          </aside>

          <main className="pc-panel pc-main">
            <div className="pc-builder-head">
              <div className="pc-label">Pipeline Steps ({steps.length})</div>
              <button
                type="button"
                className="pc-clear"
                onClick={clearAll}
                disabled={running || steps.length === 0}
              >
                CLEAR ALL
              </button>
            </div>

            {steps.length === 0 ? (
              <div className="pc-empty">Add engines from the left panel to build your pipeline</div>
            ) : (
              <div className="pc-steps">
                {steps.map((step, index) => (
                  <div className="pc-step" key={step.uid}>
                    <span className="pc-step-index">{index + 1}</span>
                    <span className="pc-step-name">{step.name}</span>
                    <span className={`pc-step-status pc-step-status-${step.status}`}>
                      {STATUS_LABELS[step.status]}
                    </span>
                    <span className={`pc-dot pc-dot-${step.status}`} />
                    <button
                      type="button"
                      className="pc-remove"
                      onClick={() => removeStep(step.uid)}
                      disabled={running}
                      aria-label={`Remove ${step.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pc-input">
              <label className="pc-label" htmlFor="pc-initial-input">Initial Input</label>
              <textarea
                id="pc-initial-input"
                value={initialInput}
                onChange={(event) => setInitialInput(event.target.value)}
                placeholder="Enter the starting input for your pipeline (e.g., 'Build an AI-powered fitness app')"
              />
            </div>

            <div className="pc-runbar">
              <div className="pc-run-status">{runStatusText}</div>
              <button
                type="button"
                className={`pc-run${running ? ' is-running' : ''}`}
                onClick={runPipeline}
                disabled={running || steps.length === 0}
              >
                {running ? 'RUNNING…' : 'RUN PIPELINE'}
              </button>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
