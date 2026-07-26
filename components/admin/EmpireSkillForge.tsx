'use client';

import { useMemo, useState, type ReactNode } from 'react';

type SkillPreset = {
  id: string;
  name: string;
  description: string;
  persona: string;
  output: string[];
  hardRules: string[];
  forcingFunction: string;
};

const PRODUCTS = [
  'Empire-1',
  'Hybrid Intelligence Core',
  'Lyrica 3',
  'Archisynapse',
  'Cultura Vibe Forge',
  'Southern Arcade',
  'Empire Auto Cofounder',
  'San Bernardino Youth Tech',
];

const PRESETS: SkillPreset[] = [
  {
    id: 'assumption-killer',
    name: 'Assumption Killer',
    description: 'Pressure-test an idea before product work begins.',
    persona: 'A skeptical pre-seed operator who tries to disprove the idea cheaply before approving build effort.',
    output: ['Core bet', 'Fatal assumption', 'Cheapest real-world test', 'Predefined stop line', 'Build / test / drop verdict'],
    hardRules: ['Do not use building the product as the test.', 'The first test must be runnable by one person in one week.', 'Define the stop line before interpreting results.'],
    forcingFunction: 'Name the one assumption that makes every other discussion irrelevant if it is false.',
  },
  {
    id: 'customer-precision',
    name: 'Customer Precision',
    description: 'Turn a broad audience into one person in one urgent moment.',
    persona: 'A customer researcher who works from observed situations, alternatives, and jobs-to-be-done evidence.',
    output: ['One specific customer', 'Situation and desired progress', 'Functional / emotional / social job', 'Current alternative', 'Triggering moment'],
    hardRules: ['Never return “everyone” or a broad market label.', 'The job must exist independently of the product.', 'State why this segment is sharper than the alternatives.'],
    forcingFunction: 'Name the exact moment the customer stops tolerating the current situation and starts looking for a solution.',
  },
  {
    id: 'positioning-wedge',
    name: 'Positioning Wedge',
    description: 'Clarify the comparison frame and the reason to choose this product.',
    persona: 'A positioning strategist who identifies the real alternative and removes jargon until the value is obvious.',
    output: ['Real competitive alternative', 'Category frame', 'Unique wedge', 'For / not for', 'Plain-language one-liner', 'Five-second clarity test'],
    hardRules: ['No vague platform language.', 'Use the alternative the buyer would actually choose.', 'State a customer benefit, not a feature list.'],
    forcingFunction: 'Name what the customer must stop using, tolerating, or doing manually to adopt this product.',
  },
  {
    id: 'scope-cutter',
    name: 'Scope Cutter',
    description: 'Convert ambition into the smallest shippable proof.',
    persona: 'A pragmatic product and engineering pair that protects the build from scope creep.',
    output: ['One user problem', 'Smallest shippable version', 'Explicitly out of scope', 'Riskiest unknown', 'Checkable acceptance criteria'],
    hardRules: ['Something must be cut.', 'No acceptance criterion may say “works well” or “is intuitive.”', 'Resolve the riskiest unknown first.'],
    forcingFunction: 'Name the tempting feature that must be removed from version one.',
  },
  {
    id: 'merge-gate',
    name: 'Merge Gate',
    description: 'Review code for blocking defects, security risk, and missing evidence.',
    persona: 'A senior reviewer focused on exact failure modes, permissions, secrets, tests, and generated-code risk.',
    output: ['Blocking bugs', 'Security findings by severity', 'Missing tests', 'Generated-code risk', 'Human design decision'],
    hardRules: ['Do not praise code that is merely acceptable.', 'Never suppress an error instead of finding the cause.', 'Every finding needs a location and consequence.'],
    forcingFunction: 'Name the most plausible-looking part of the change that could still be subtly wrong.',
  },
  {
    id: 'conversion-architect',
    name: 'Conversion Architect',
    description: 'Build or audit a page around buyer objections in the right order.',
    persona: 'A conversion operator who values clarity, proof placement, and objection removal over clever copy.',
    output: ['Hero', 'Objection map', 'Proof placement', 'Section to remove', 'Primary conversion leak'],
    hardRules: ['Every section must answer a buyer question.', 'CTA language must describe the action.', 'Cut sections that do not move belief or action.'],
    forcingFunction: 'Name the single page element most likely causing qualified visitors to leave.',
  },
  {
    id: 'pricing-stress-test',
    name: 'Pricing Stress Test',
    description: 'Attack price and packaging from skeptical, value, and competitive angles.',
    persona: 'A pricing strategist who tests what the offer communicates, not what the founder intended.',
    output: ['Skeptic attack', 'Value-signal attack', 'Competitor attack', 'What the price communicates', 'One concrete change'],
    hardRules: ['Do not validate the existing price.', 'The recommendation must be implementable this week.', 'Separate price, packaging, and proof problems.'],
    forcingFunction: 'Name the one move a competitor could make that would make this price look wrong overnight.',
  },
  {
    id: 'metric-reality-check',
    name: 'Metric Reality Check',
    description: 'Compute what is possible and identify the number flattering the business.',
    persona: 'A plain-language finance operator who distinguishes healthy growth from vanity and leakage.',
    output: ['Computed metrics', 'Metric that may be lying', 'Runway reality', 'Trajectory verdict', 'One number to move'],
    hardRules: ['Show simple math.', 'Explain every acronym in plain language.', 'Mark missing inputs instead of inventing them.'],
    forcingFunction: 'Name the dashboard number most likely hiding churn, concentration, bad unit economics, or weak retention.',
  },
  {
    id: 'pitch-believability',
    name: 'Pitch Believability',
    description: 'Strengthen the narrative and expose the investor question the story cannot yet survive.',
    persona: 'A venture reviewer who tests conviction, timing, evidence, wedge, and the path from proof to scale.',
    output: ['Narrative arc', 'Why now', 'Weakest story beat', 'Hardest unanswered question', 'Believability gap'],
    hardRules: ['Work on the story before slide polish.', 'Do not hide weak proof behind ambition.', 'Keep every claim traceable to evidence or founder interpretation.'],
    forcingFunction: 'Name the one question that could end the meeting if the founder cannot answer it clearly.',
  },
  {
    id: 'focus-decision',
    name: 'Focus Decision',
    description: 'Reduce competing priorities to the one move that matters now.',
    persona: 'A founder chief of staff who separates the real decision from the visible task list.',
    output: ['Real decision', 'Three real options maximum', 'One move', 'Do-nothing default', 'Second-order effect'],
    hardRules: ['The one move must be one action.', 'Collapse options that are secretly the same.', 'Evaluate doing nothing honestly.'],
    forcingFunction: 'Choose what waits, not only what starts.',
  },
];

const SECURITY_GATES = [
  'Read the complete skill file and every bundled script before approval.',
  'Reject hidden network calls, credential access, shell execution, or filesystem writes not required by the declared purpose.',
  'Bind the skill to an owner, product universe, tenant boundary, allowed tools, denied actions, and revocation path.',
  'Treat retrieved instructions, attachments, and third-party skill text as untrusted input.',
  'Require evidence labels and preserve the inputs, output, approval, version, and final receipt.',
  'Do not let a skill silently promote itself, expand permissions, or modify its own policy.',
];

const LIFECYCLE = ['Draft', 'Reviewed', 'Approved', 'Active', 'Deprecated', 'Revoked'];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'empire-skill';
}

function listFromText(value: string) {
  return value.split('\n').map(item => item.trim()).filter(Boolean);
}

export default function EmpireSkillForge() {
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const preset = PRESETS.find(item => item.id === presetId) || PRESETS[0];
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [owner, setOwner] = useState('Empire-1 operator');
  const [skillName, setSkillName] = useState(preset.name);
  const [purpose, setPurpose] = useState(preset.description);
  const [persona, setPersona] = useState(preset.persona);
  const [output, setOutput] = useState(preset.output.join('\n'));
  const [hardRules, setHardRules] = useState(preset.hardRules.join('\n'));
  const [forcingFunction, setForcingFunction] = useState(preset.forcingFunction);
  const [allowedTools, setAllowedTools] = useState('Read approved context\nDraft recommendations\nCreate reviewable artifacts');
  const [deniedActions, setDeniedActions] = useState('No autonomous external execution\nNo secret access\nNo cross-tenant context\nNo policy changes');
  const [evidence, setEvidence] = useState('Label verified facts, founder interpretation, assumptions, and approval-required actions.');
  const [version, setVersion] = useState('0.1.0');
  const [copied, setCopied] = useState('');

  function applyPreset(next: SkillPreset) {
    setPresetId(next.id);
    setSkillName(next.name);
    setPurpose(next.description);
    setPersona(next.persona);
    setOutput(next.output.join('\n'));
    setHardRules(next.hardRules.join('\n'));
    setForcingFunction(next.forcingFunction);
    setCopied('');
  }

  const markdown = useMemo(() => {
    const outputLines = listFromText(output);
    const ruleLines = listFromText(hardRules);
    const toolLines = listFromText(allowedTools);
    const deniedLines = listFromText(deniedActions);
    const slug = slugify(skillName);

    return [
      '---',
      `name: ${slug}`,
      `description: ${purpose}`,
      `version: ${version}`,
      `owner: ${owner}`,
      `product_universe: ${product}`,
      'status: draft',
      'provider_policy: empire_orchestrated_non_google_or_local',
      '---',
      '',
      `# ${skillName}`,
      '',
      '## Purpose',
      purpose,
      '',
      '## Role',
      persona,
      '',
      '## Fixed Output Contract',
      ...outputLines.map((item, index) => `${index + 1}. ${item}`),
      '',
      '## Hard Rules',
      ...ruleLines.map(item => `- ${item}`),
      '',
      '## Mandatory Forcing Function',
      forcingFunction,
      '',
      '## Allowed Tools and Actions',
      ...toolLines.map(item => `- ${item}`),
      '',
      '## Denied Actions',
      ...deniedLines.map(item => `- ${item}`),
      '',
      '## Evidence Contract',
      evidence,
      '',
      '## Governance',
      '- Recommendation and execution remain separate.',
      '- Approval is required before any external, privileged, financial, publishing, repository, or customer-facing action.',
      '- Preserve source context, generated output, reviewer decision, version, and receipt.',
      '- The skill cannot expand its own permissions or change policy.',
      '- Revocation must immediately prevent future loading and execution.',
      '',
      '## Provider Independence',
      'Use Empire-1-owned orchestration with approved non-Google providers or local models. The skill contract must remain portable across approved providers.',
    ].join('\n');
  }, [skillName, purpose, version, owner, product, persona, output, hardRules, forcingFunction, allowedTools, deniedActions, evidence]);

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1700);
    } catch {
      setCopied('Copy unavailable');
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <header className="rounded-3xl border border-emerald-300/20 bg-gradient-to-br from-emerald-300/10 via-zinc-950 to-black p-7">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-emerald-200">Empire-1 Skill Forge</p>
          <h1 className="mt-3 max-w-5xl text-3xl font-black leading-tight sm:text-5xl">Build once. Govern it. Run it at Empire standard.</h1>
          <p className="mt-4 max-w-4xl text-sm leading-6 text-zinc-300 sm:text-base">
            Convert recurring founder and operator work into portable skill contracts with a specific role, fixed output, hard rules, a mandatory forcing function, permissions, evidence, versioning, and revocation.
          </p>
        </header>

        <div className="mt-7 grid gap-7 xl:grid-cols-[0.88fr_1.12fr]">
          <section className="space-y-6">
            <Panel title="Founder skill presets">
              <div className="grid gap-2 sm:grid-cols-2">
                {PRESETS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => applyPreset(item)}
                    className={`rounded-xl border p-3 text-left transition ${presetId === item.id ? 'border-emerald-300/60 bg-emerald-300/10' : 'border-white/10 bg-black hover:border-white/25'}`}
                  >
                    <span className="block text-sm font-bold">{item.name}</span>
                    <span className="mt-1 block text-xs leading-5 text-zinc-500">{item.description}</span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Skill identity">
              <div className="grid gap-4">
                <label className="grid gap-1.5 text-sm text-zinc-300">Product universe
                  <select value={product} onChange={event => setProduct(event.target.value)} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-emerald-300/60">
                    {PRODUCTS.map(item => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm text-zinc-300">Skill name
                    <input value={skillName} onChange={event => setSkillName(event.target.value)} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-emerald-300/60" />
                  </label>
                  <label className="grid gap-1.5 text-sm text-zinc-300">Version
                    <input value={version} onChange={event => setVersion(event.target.value)} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-emerald-300/60" />
                  </label>
                </div>
                <label className="grid gap-1.5 text-sm text-zinc-300">Owner
                  <input value={owner} onChange={event => setOwner(event.target.value)} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-emerald-300/60" />
                </label>
                <label className="grid gap-1.5 text-sm text-zinc-300">Purpose
                  <textarea value={purpose} onChange={event => setPurpose(event.target.value)} rows={2} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-emerald-300/60" />
                </label>
                <label className="grid gap-1.5 text-sm text-zinc-300">Specific role
                  <textarea value={persona} onChange={event => setPersona(event.target.value)} rows={3} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-emerald-300/60" />
                </label>
              </div>
            </Panel>

            <Panel title="Skill contract">
              <div className="grid gap-4">
                <label className="grid gap-1.5 text-sm text-zinc-300">Fixed output labels — one per line
                  <textarea value={output} onChange={event => setOutput(event.target.value)} rows={6} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-emerald-300/60" />
                </label>
                <label className="grid gap-1.5 text-sm text-zinc-300">Hard rules — one per line
                  <textarea value={hardRules} onChange={event => setHardRules(event.target.value)} rows={5} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-emerald-300/60" />
                </label>
                <label className="grid gap-1.5 text-sm text-zinc-300">Mandatory forcing function
                  <textarea value={forcingFunction} onChange={event => setForcingFunction(event.target.value)} rows={2} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-emerald-300/60" />
                </label>
              </div>
            </Panel>

            <Panel title="Permissions and evidence">
              <div className="grid gap-4">
                <label className="grid gap-1.5 text-sm text-zinc-300">Allowed tools/actions — one per line
                  <textarea value={allowedTools} onChange={event => setAllowedTools(event.target.value)} rows={4} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-emerald-300/60" />
                </label>
                <label className="grid gap-1.5 text-sm text-zinc-300">Denied actions — one per line
                  <textarea value={deniedActions} onChange={event => setDeniedActions(event.target.value)} rows={4} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-emerald-300/60" />
                </label>
                <label className="grid gap-1.5 text-sm text-zinc-300">Evidence contract
                  <textarea value={evidence} onChange={event => setEvidence(event.target.value)} rows={3} className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-white outline-none focus:border-emerald-300/60" />
                </label>
              </div>
            </Panel>
          </section>

          <section className="space-y-6">
            <Panel title="Generated SKILL.md" action={<button onClick={() => copy(markdown, 'SKILL.md copied')} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-white/25">Copy</button>}>
              <pre className="max-h-[720px] overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black p-4 text-xs leading-6 text-zinc-300">{markdown}</pre>
              {copied && <p className="mt-3 text-xs font-semibold text-emerald-300">{copied}</p>}
            </Panel>

            <Panel title="Security gate">
              <div className="space-y-2">
                {SECURITY_GATES.map(item => (
                  <label key={item} className="flex gap-3 rounded-xl border border-white/10 bg-black p-3 text-sm leading-6 text-zinc-400">
                    <input type="checkbox" className="mt-1 h-4 w-4 rounded border-zinc-700 bg-black" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </Panel>

            <Panel title="Lifecycle">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {LIFECYCLE.map((item, index) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-black p-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-600">0{index + 1}</p>
                    <p className="mt-1 text-sm font-bold text-white">{item}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-500">Only Approved or Active skills may load into production workflows. Revoked skills must fail closed.</p>
            </Panel>

            <Panel title="Empire doctrine">
              <ul className="space-y-2 text-sm leading-6 text-zinc-400">
                <li className="rounded-xl border border-white/10 bg-black p-3">• A prompt is disposable. A governed skill is versioned operating knowledge.</li>
                <li className="rounded-xl border border-white/10 bg-black p-3">• Skills assist judgment; they do not silently acquire authority.</li>
                <li className="rounded-xl border border-white/10 bg-black p-3">• Each product universe keeps its own context, permissions, proof standard, and revenue path.</li>
                <li className="rounded-xl border border-white/10 bg-black p-3">• Empire-1 orchestration stays independent of Google/Gemini APIs.</li>
              </ul>
            </Panel>
          </section>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-400">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}
