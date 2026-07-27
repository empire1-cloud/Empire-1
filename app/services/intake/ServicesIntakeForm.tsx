'use client';

import { FormEvent, useMemo, useState } from 'react';

type IntakeState = {
  name: string;
  company: string;
  email: string;
  website: string;
  problem: string;
  outcome: string;
  systems: string;
  risk: string;
  budget: string;
  timeline: string;
};

const EMPTY_FORM: IntakeState = {
  name: '',
  company: '',
  email: '',
  website: '',
  problem: '',
  outcome: '',
  systems: '',
  risk: '',
  budget: '',
  timeline: '',
};

export default function ServicesIntakeForm() {
  const [form, setForm] = useState<IntakeState>(EMPTY_FORM);
  const [prepared, setPrepared] = useState(false);
  const [copied, setCopied] = useState(false);

  const projectEmail = useMemo(() => {
    return [
      'Empire-1 Applied AI Services — Project Intake',
      '',
      `Name: ${form.name || 'Not provided'}`,
      `Company: ${form.company || 'Not provided'}`,
      `Email: ${form.email || 'Not provided'}`,
      `Website: ${form.website || 'Not provided'}`,
      `Budget range: ${form.budget || 'Not selected'}`,
      `Target timeline: ${form.timeline || 'Not selected'}`,
      '',
      'What is broken or taking too much time?',
      form.problem || 'Not provided',
      '',
      'What outcome should the project produce?',
      form.outcome || 'Not provided',
      '',
      'Which tools, systems, or data are involved?',
      form.systems || 'Not provided',
      '',
      'What must be handled carefully?',
      form.risk || 'Not provided',
    ].join('\n');
  }, [form]);

  function updateField<K extends keyof IntakeState>(field: K, value: IntakeState[K]) {
    setPrepared(false);
    setCopied(false);
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPrepared(true);

    const subject = encodeURIComponent(`Applied AI project — ${form.company || form.name || 'new inquiry'}`);
    const body = encodeURIComponent(projectEmail);
    window.location.href = `mailto:founder@empire1.cloud?subject=${subject}&body=${body}`;
  }

  async function copyProjectEmail() {
    try {
      await navigator.clipboard.writeText(projectEmail);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <form className="intake-form" onSubmit={submit}>
        <div className="form-grid two">
          <label>
            <span>Your name *</span>
            <input required value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Name" />
          </label>
          <label>
            <span>Business or organization *</span>
            <input required value={form.company} onChange={(event) => updateField('company', event.target.value)} placeholder="Company" />
          </label>
          <label>
            <span>Email *</span>
            <input required type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="you@company.com" />
          </label>
          <label>
            <span>Website</span>
            <input value={form.website} onChange={(event) => updateField('website', event.target.value)} placeholder="https://" />
          </label>
        </div>

        <label>
          <span>What is broken or taking too much time? *</span>
          <textarea required rows={5} value={form.problem} onChange={(event) => updateField('problem', event.target.value)} placeholder="Describe the current workflow, the bottleneck, and who is affected." />
        </label>

        <label>
          <span>What outcome should this project produce? *</span>
          <textarea required rows={4} value={form.outcome} onChange={(event) => updateField('outcome', event.target.value)} placeholder="Example: qualify every inbound lead and produce a same-day follow-up with human approval." />
        </label>

        <label>
          <span>Which tools, systems, or data are involved?</span>
          <textarea rows={4} value={form.systems} onChange={(event) => updateField('systems', event.target.value)} placeholder="CRM, email, spreadsheets, payment systems, internal documents, APIs, or other tools." />
        </label>

        <label>
          <span>What must be handled carefully?</span>
          <textarea rows={4} value={form.risk} onChange={(event) => updateField('risk', event.target.value)} placeholder="Sensitive data, approvals, legal constraints, brand voice, payment risk, customer trust, or other boundaries." />
        </label>

        <div className="form-grid two">
          <label>
            <span>Working budget *</span>
            <select required value={form.budget} onChange={(event) => updateField('budget', event.target.value)}>
              <option value="">Select a range</option>
              <option>$750–$1,500</option>
              <option>$1,500–$2,500</option>
              <option>$2,500–$7,500</option>
              <option>$7,500–$12,000</option>
              <option>$12,000+</option>
              <option>Need help scoping</option>
            </select>
          </label>
          <label>
            <span>Target timeline *</span>
            <select required value={form.timeline} onChange={(event) => updateField('timeline', event.target.value)}>
              <option value="">Select timing</option>
              <option>As soon as practical</option>
              <option>Within 30 days</option>
              <option>Within 60 days</option>
              <option>This quarter</option>
              <option>Exploring options</option>
            </select>
          </label>
        </div>

        <div className="intake-actions">
          <button type="submit" className="btn btn-primary">Prepare Project Email →</button>
          <a className="btn btn-ghost" href="mailto:founder@empire1.cloud">Email Directly</a>
        </div>
        <p className="form-note">Submitting opens your email app with this intake prefilled. Nothing is silently transmitted or stored by this page.</p>
      </form>

      {prepared && (
        <section className="prepared-panel" aria-live="polite">
          <div className="eyebrow">PROJECT EMAIL PREPARED</div>
          <h2>Your intake is ready.</h2>
          <p>Your mail app should open automatically. You can also copy the complete intake below and send it to <strong>founder@empire1.cloud</strong>.</p>
          <textarea readOnly rows={18} value={projectEmail} aria-label="Prepared project email" />
          <button type="button" className="btn btn-ghost" onClick={copyProjectEmail}>{copied ? 'Copied ✓' : 'Copy Intake'}</button>
        </section>
      )}
    </>
  );
}
