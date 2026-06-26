'use client';

import { useState, useEffect } from 'react';

interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source: string;
  pipeline_stage: string;
  lane?: string;
  value: number;
  probability: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface CrmMetrics {
  total_leads: number;
  total_pipeline_value: number;
  stage_counts: Record<string, number>;
  lane_counts: Record<string, number>;
}

const PIPELINE_STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'onboarding', 'active', 'at_risk', 'churned'];
const REVENUE_LANES = ['full_stack_builds', 'automation', 'micro_saas', 'white_label', 'enterprise', 'creative_ai', 'admin_ops', 'other'];
const LEAD_SOURCES = ['website', 'referral', 'cold_outreach', 'conference', 'linkedin', 'partner', 'existing_client', 'other'];

const stageColors: Record<string, string> = {
  lead: 'bg-gray-100 text-gray-700',
  qualified: 'bg-blue-100 text-blue-700',
  proposal: 'bg-purple-100 text-purple-700',
  negotiation: 'bg-amber-100 text-amber-700',
  onboarding: 'bg-cyan-100 text-cyan-700',
  active: 'bg-emerald-100 text-emerald-700',
  at_risk: 'bg-orange-100 text-orange-700',
  churned: 'bg-red-100 text-red-700',
};

const laneLabels: Record<string, string> = {
  full_stack_builds: 'Full-Stack Builds',
  automation: 'Automation',
  micro_saas: 'Micro-SaaS',
  white_label: 'White Label',
  enterprise: 'Enterprise',
  creative_ai: 'Creative AI',
  admin_ops: 'Admin Ops',
  other: 'Other',
};

export default function CRMPanel() {
  const [tab, setTab] = useState<'pipeline' | 'add' | 'metrics'>('pipeline');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<CrmMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSource, setFormSource] = useState('website');
  const [formNotes, setFormNotes] = useState('');
  const [formStage, setFormStage] = useState('lead');
  const [formLane, setFormLane] = useState('');
  const [formValue, setFormValue] = useState('');
  const [activityText, setActivityText] = useState('');

  useEffect(() => {
    loadPipeline();
    loadMetrics();
  }, []);

  async function loadPipeline() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/crm/pipeline');
      if (!res.ok) throw new Error('Failed to load pipeline');
      const data = await res.json();
      if (data.success) setLeads(data.leads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function loadMetrics() {
    try {
      const res = await fetch('/api/crm/metrics');
      if (!res.ok) throw new Error('Failed to load metrics');
      const data = await res.json();
      if (data.success) setMetrics(data.metrics);
    } catch (err) {
      console.error('Metrics load error:', err);
    }
  }

  async function loadLeadDetails(lead: Lead) {
    setSelectedLead(lead);
    try {
      const res = await fetch(`/api/crm/leads/${lead.id}`);
      if (!res.ok) throw new Error('Failed to load lead');
      const data = await res.json();
      if (data.success) setActivities(data.activities || []);
    } catch (err) {
      console.error('Lead details error:', err);
    }
  }

  async function createLead() {
    if (!formName.trim()) return;
    try {
      const payload: any = { name: formName, source: formSource };
      if (formCompany) payload.company = formCompany;
      if (formEmail) payload.email = formEmail;
      if (formPhone) payload.phone = formPhone;
      if (formNotes) payload.notes = formNotes;

      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create lead');
      const data = await res.json();
      if (data.success) {
        if (formStage !== 'lead' || formLane || formValue) {
          await fetch(`/api/crm/leads/${data.lead.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pipeline_stage: formStage !== 'lead' ? formStage : undefined,
              lane: formLane || undefined,
              value: formValue ? parseFloat(formValue) : undefined,
            }),
          });
        }
        setFormName(''); setFormCompany(''); setFormEmail('');
        setFormPhone(''); setFormNotes(''); setFormStage('lead');
        setFormLane(''); setFormValue('');
        loadPipeline();
        loadMetrics();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    }
  }

  async function updateLeadStage(leadId: string, stage: string) {
    try {
      await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline_stage: stage }),
      });
      loadPipeline();
    } catch (err) {
      console.error('Update stage error:', err);
    }
  }

  async function addActivity() {
    if (!selectedLead || !activityText.trim()) return;
    try {
      await fetch('/api/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: selectedLead.id, type: 'note', description: activityText }),
      });
      setActivityText('');
      loadLeadDetails(selectedLead);
    } catch (err) {
      console.error('Add activity error:', err);
    }
  }

  const leadsByStage = (stage: string) => leads.filter(l => l.pipeline_stage === stage);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">CRM</h1>
        <p className="text-sm text-gray-500 mt-1">Deal pipeline, lead tracking, client lifecycle</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('pipeline')} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'pipeline' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Pipeline</button>
        <button onClick={() => setTab('add')} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'add' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Add Lead</button>
        <button onClick={() => setTab('metrics')} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'metrics' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Metrics</button>
      </div>

      {tab === 'metrics' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-500">Total Leads</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">{metrics.total_leads}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-500">Pipeline Value</p>
              <p className="text-3xl font-semibold text-emerald-600 mt-2">${metrics.total_pipeline_value.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-500">Active Deals</p>
              <p className="text-3xl font-semibold text-blue-600 mt-2">{(metrics.stage_counts?.qualified || 0) + (metrics.stage_counts?.proposal || 0) + (metrics.stage_counts?.negotiation || 0)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-500">Active Clients</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">{metrics.stage_counts?.active || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Pipeline Stages</h3>
              <div className="space-y-3">
                {PIPELINE_STAGES.map(stage => (
                  <div key={stage} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{stage}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-900 rounded-full" style={{ width: `${Math.min(100, ((metrics.stage_counts?.[stage] || 0) / Math.max(1, metrics.total_leads)) * 100)}%` }} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">{metrics.stage_counts?.[stage] || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Revenue Lanes</h3>
              <div className="space-y-3">
                {REVENUE_LANES.map(lane => (
                  <div key={lane} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{laneLabels[lane] || lane}</span>
                    <span className="text-sm font-medium text-gray-900">{metrics.lane_counts?.[lane] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'add' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-xl">
          <h2 className="text-lg font-medium text-gray-900 mb-6">New Lead</h2>
          <div className="space-y-4">
            <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Name *" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <input value={formCompany} onChange={e => setFormCompany(e.target.value)} placeholder="Company" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-4">
              <input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="Email" type="email" className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
              <input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="Phone" className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <select value={formSource} onChange={e => setFormSource(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              {LEAD_SOURCES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <div className="grid grid-cols-3 gap-4">
              <select value={formStage} onChange={e => setFormStage(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={formLane} onChange={e => setFormLane(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="">No lane</option>
                {REVENUE_LANES.map(l => <option key={l} value={l}>{laneLabels[l]}</option>)}
              </select>
              <input value={formValue} onChange={e => setFormValue(e.target.value)} placeholder="Deal value $" type="number" className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Notes" rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <button onClick={createLead} className="w-full bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800">Create Lead</button>
          </div>
        </div>
      )}

      {tab === 'pipeline' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading pipeline...</div>
          ) : (
            <>
              {/* Kanban-style pipeline grid */}
              <div className="grid grid-cols-4 gap-4">
                {PIPELINE_STAGES.slice(0, 4).map(stage => (
                  <div key={stage} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900 capitalize">{stage}</h3>
                      <span className="text-xs text-gray-500">{leadsByStage(stage).length}</span>
                    </div>
                    <div className="space-y-2">
                      {leadsByStage(stage).map(lead => (
                        <button
                          key={lead.id}
                          onClick={() => loadLeadDetails(lead)}
                          className={`w-full text-left bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow ${selectedLead?.id === lead.id ? 'ring-2 ring-gray-900' : ''}`}
                        >
                          <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                          {lead.company && <p className="text-xs text-gray-500 truncate mt-0.5">{lead.company}</p>}
                          {lead.value > 0 && <p className="text-xs font-medium text-emerald-600 mt-1">${lead.value.toLocaleString()}</p>}
                          <div className="flex gap-1 mt-2">
                            {lead.lane && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{laneLabels[lead.lane] || lead.lane}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-4">
                {PIPELINE_STAGES.slice(4).map(stage => (
                  <div key={stage} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900 capitalize">{stage}</h3>
                      <span className="text-xs text-gray-500">{leadsByStage(stage).length}</span>
                    </div>
                    <div className="space-y-2">
                      {leadsByStage(stage).map(lead => (
                        <button
                          key={lead.id}
                          onClick={() => loadLeadDetails(lead)}
                          className={`w-full text-left bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow ${selectedLead?.id === lead.id ? 'ring-2 ring-gray-900' : ''}`}
                        >
                          <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                          {lead.company && <p className="text-xs text-gray-500 truncate mt-0.5">{lead.company}</p>}
                          {lead.value > 0 && <p className="text-xs font-medium text-emerald-600 mt-1">${lead.value.toLocaleString()}</p>}
                          <div className="flex gap-1 mt-2">
                            {lead.lane && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{laneLabels[lead.lane] || lead.lane}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setSelectedLead(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedLead.name}</h2>
                {selectedLead.company && <p className="text-sm text-gray-500">{selectedLead.company}</p>}
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Stage:</span> <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${stageColors[selectedLead.pipeline_stage] || 'bg-gray-100'}`}>{selectedLead.pipeline_stage}</span></div>
                <div><span className="text-gray-500">Value:</span> <span className="ml-2 font-medium">${selectedLead.value.toLocaleString()}</span></div>
                <div><span className="text-gray-500">Lane:</span> <span className="ml-2">{selectedLead.lane ? (laneLabels[selectedLead.lane] || selectedLead.lane) : '-'}</span></div>
                <div><span className="text-gray-500">Source:</span> <span className="ml-2 capitalize">{selectedLead.source.replace('_', ' ')}</span></div>
                {selectedLead.email && <div className="col-span-2"><span className="text-gray-500">Email:</span> <span className="ml-2">{selectedLead.email}</span></div>}
                {selectedLead.phone && <div className="col-span-2"><span className="text-gray-500">Phone:</span> <span className="ml-2">{selectedLead.phone}</span></div>}
              </div>

              {/* Stage quick-change */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Move to stage:</p>
                <div className="flex flex-wrap gap-1">
                  {PIPELINE_STAGES.map(stage => (
                    <button
                      key={stage}
                      onClick={() => updateLeadStage(selectedLead.id, stage)}
                      className={`px-2 py-1 rounded text-xs font-medium ${selectedLead.pipeline_stage === stage ? 'ring-2 ring-gray-900 ' + stageColors[stage] : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              {selectedLead.notes && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Notes:</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">{selectedLead.notes}</p>
                </div>
              )}

              {/* Activity Log */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Activity ({activities.length})</p>
                <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                  {activities.map((a: any) => (
                    <div key={a.id} className="bg-gray-50 rounded p-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">{new Date(a.timestamp).toLocaleString()}</span>
                        <span className="text-[10px] font-medium text-gray-500 uppercase">{a.type}</span>
                      </div>
                      <p className="text-gray-700 mt-1">{a.description}</p>
                    </div>
                  ))}
                  {activities.length === 0 && <p className="text-xs text-gray-400 italic">No activity recorded</p>}
                </div>
                <div className="flex gap-2">
                  <input value={activityText} onChange={e => setActivityText(e.target.value)} placeholder="Add note..." className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm" onKeyDown={e => e.key === 'Enter' && addActivity()} />
                  <button onClick={addActivity} className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-800">Add</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
