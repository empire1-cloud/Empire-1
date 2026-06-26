'use client';

import { useState, useEffect } from 'react';

interface Campaign {
  id: string;
  name: string;
  objective: string;
  target_audience?: string;
  channels: string[];
  budget?: number;
  status: string;
  outreach_steps: number;
  created_at: string;
}

const CAMPAIGN_STATUSES = ['draft', 'active', 'paused', 'completed'];
const CHANNELS = ['email', 'linkedin', 'cold_call', 'dm', 'event', 'partner', 'other'];

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
};

export default function GTMPanel() {
  const [tab, setTab] = useState<'campaigns' | 'new' | 'checklists'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [outreachSteps, setOutreachSteps] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formName, setFormName] = useState('');
  const [formObjective, setFormObjective] = useState('');
  const [formAudience, setFormAudience] = useState('');
  const [formChannels, setFormChannels] = useState<string[]>([]);
  const [formBudget, setFormBudget] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');

  // Outreach step form
  const [stepSubject, setStepSubject] = useState('');
  const [stepTemplate, setStepTemplate] = useState('');
  const [stepChannel, setStepChannel] = useState('email');
  const [stepDelay, setStepDelay] = useState('0');

  // Checklist form
  const [checklistName, setChecklistName] = useState('');
  const [checklistItems, setChecklistItems] = useState('');

  useEffect(() => {
    loadCampaigns();
    loadChecklists();
  }, []);

  async function loadCampaigns() {
    setLoading(true);
    try {
      const res = await fetch('/api/gtm/campaigns');
      const data = await res.json();
      if (data.success) setCampaigns(data.campaigns);
    } catch (err) {
      console.error('Campaigns load error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadCampaignDetails(campaign: Campaign) {
    setSelectedCampaign(campaign);
    try {
      const res = await fetch(`/api/gtm/campaigns/${campaign.id}`);
      const data = await res.json();
      if (data.success) setOutreachSteps(data.outreach_steps || []);
    } catch (err) {
      console.error('Campaign detail error:', err);
    }
  }

  async function loadChecklists() {
    try {
      const res = await fetch('/api/gtm/launch-checklist');
      const data = await res.json();
      if (data.success) setChecklists(data.checklists);
    } catch (err) {
      console.error('Checklists load error:', err);
    }
  }

  async function createCampaign() {
    if (!formName.trim() || !formObjective.trim()) return;
    try {
      const res = await fetch('/api/gtm/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName, objective: formObjective,
          target_audience: formAudience || undefined,
          channels: formChannels,
          budget: formBudget ? parseFloat(formBudget) : undefined,
          start_date: formStart || undefined, end_date: formEnd || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFormName(''); setFormObjective(''); setFormAudience('');
        setFormChannels([]); setFormBudget(''); setFormStart(''); setFormEnd('');
        loadCampaigns();
      }
    } catch (err) {
      console.error('Create campaign error:', err);
    }
  }

  async function toggleChannel(channel: string) {
    setFormChannels(prev => prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]);
  }

  async function updateCampaignStatus(id: string, status: string) {
    try {
      await fetch(`/api/gtm/campaigns/${id}?status=${status}`, { method: 'PUT' });
      loadCampaigns();
      if (selectedCampaign?.id === id) setSelectedCampaign({ ...selectedCampaign, status });
    } catch (err) {
      console.error('Update status error:', err);
    }
  }

  async function addOutreachStep() {
    if (!selectedCampaign || !stepSubject.trim() || !stepTemplate.trim()) return;
    try {
      await fetch('/api/gtm/outreach-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: selectedCampaign.id,
          channel: stepChannel,
          subject: stepSubject,
          template: stepTemplate,
          delay_days: parseInt(stepDelay) || 0,
          order: outreachSteps.length + 1,
        }),
      });
      setStepSubject(''); setStepTemplate(''); setStepChannel('email'); setStepDelay('0');
      loadCampaignDetails(selectedCampaign);
      loadCampaigns();
    } catch (err) {
      console.error('Add step error:', err);
    }
  }

  async function toggleChecklistItem(checklistId: string, itemIndex: number) {
    try {
      await fetch(`/api/gtm/launch-checklist/${checklistId}/item/${itemIndex}`, { method: 'PUT' });
      loadChecklists();
    } catch (err) {
      console.error('Toggle item error:', err);
    }
  }

  async function createChecklist() {
    if (!checklistName.trim() || !checklistItems.trim()) return;
    try {
      const items = checklistItems.split('\n').map(s => s.trim()).filter(Boolean);
      await fetch('/api/gtm/launch-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: checklistName, items }),
      });
      setChecklistName(''); setChecklistItems('');
      loadChecklists();
    } catch (err) {
      console.error('Create checklist error:', err);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">GTM</h1>
        <p className="text-sm text-gray-500 mt-1">Campaign builder, outreach sequences, launch checklists</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('campaigns')} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'campaigns' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Campaigns</button>
        <button onClick={() => setTab('new')} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'new' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>New Campaign</button>
        <button onClick={() => setTab('checklists')} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'checklists' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Launch Checklists</button>
      </div>

      {tab === 'campaigns' && (
        <div className="grid grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-center py-12 text-gray-500">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-400">No campaigns yet. Create your first one.</div>
          ) : campaigns.map(c => (
            <button key={c.id} onClick={() => loadCampaignDetails(c)} className={`text-left bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow ${selectedCampaign?.id === c.id ? 'ring-2 ring-gray-900' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 truncate">{c.name}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[c.status] || 'bg-gray-100'}`}>{c.status}</span>
              </div>
              <p className="text-xs text-gray-500 mb-2 truncate">{c.objective}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{c.channels?.length || 0} channels</span>
                <span>·</span>
                <span>{c.outreach_steps || 0} steps</span>
                {c.budget ? <><span>·</span><span>${c.budget.toLocaleString()}</span></> : null}
              </div>
            </button>
          ))}
        </div>
      )}

      {tab === 'new' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-xl">
          <h2 className="text-lg font-medium text-gray-900 mb-6">New Campaign</h2>
          <div className="space-y-4">
            <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Campaign name *" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <textarea value={formObjective} onChange={e => setFormObjective(e.target.value)} placeholder="Objective *" rows={2} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <input value={formAudience} onChange={e => setFormAudience(e.target.value)} placeholder="Target audience" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <div>
              <p className="text-xs text-gray-500 mb-2">Channels</p>
              <div className="flex flex-wrap gap-2">
                {CHANNELS.map(ch => (
                  <button key={ch} onClick={() => toggleChannel(ch)} className={`px-3 py-1 rounded text-xs font-medium ${formChannels.includes(ch) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{ch}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <input value={formBudget} onChange={e => setFormBudget(e.target.value)} placeholder="Budget $" type="number" className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
              <input value={formStart} onChange={e => setFormStart(e.target.value)} placeholder="Start date" type="date" className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
              <input value={formEnd} onChange={e => setFormEnd(e.target.value)} placeholder="End date" type="date" className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <button onClick={createCampaign} className="w-full bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800">Create Campaign</button>
          </div>
        </div>
      )}

      {tab === 'checklists' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-4">New Launch Checklist</h2>
            <div className="space-y-3">
              <input value={checklistName} onChange={e => setChecklistName(e.target.value)} placeholder="Checklist name" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              <textarea value={checklistItems} onChange={e => setChecklistItems(e.target.value)} placeholder="One item per line&#10;Item 1&#10;Item 2&#10;Item 3" rows={6} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              <button onClick={createChecklist} className="w-full bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800">Create Checklist</button>
            </div>
          </div>
          <div className="space-y-4">
            {checklists.map(cl => (
              <div key={cl.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">{cl.name}</h3>
                  <span className="text-xs text-gray-500">{cl.progress || 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
                  <div className="h-full bg-gray-900 rounded-full" style={{ width: `${cl.progress || 0}%` }} />
                </div>
                <div className="space-y-1">
                  {cl.items.map((item: any, i: number) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer py-0.5">
                      <input type="checkbox" checked={item.done} onChange={() => toggleChecklistItem(cl.id, i)} className="rounded border-gray-300" />
                      <span className={`text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaign && tab === 'campaigns' && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setSelectedCampaign(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedCampaign.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{selectedCampaign.objective}</p>
              </div>
              <button onClick={() => setSelectedCampaign(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Status:</span> <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${statusColors[selectedCampaign.status] || 'bg-gray-100'}`}>{selectedCampaign.status}</span></div>
                <div><span className="text-gray-500">Budget:</span> <span className="ml-2 font-medium">${selectedCampaign.budget?.toLocaleString() || '-'}</span></div>
                {selectedCampaign.target_audience && <div className="col-span-2"><span className="text-gray-500">Audience:</span> <span className="ml-2">{selectedCampaign.target_audience}</span></div>}
                {selectedCampaign.channels?.length > 0 && <div className="col-span-2"><span className="text-gray-500">Channels:</span> <div className="inline-flex gap-1 ml-2">{selectedCampaign.channels.map((ch: string) => <span key={ch} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">{ch}</span>)}</div></div>}
              </div>

              {/* Status changer */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Change status:</p>
                <div className="flex gap-1">
                  {CAMPAIGN_STATUSES.map(s => (
                    <button key={s} onClick={() => updateCampaignStatus(selectedCampaign.id, s)} className={`px-3 py-1 rounded text-xs font-medium ${selectedCampaign.status === s ? 'ring-2 ring-gray-900 ' + statusColors[s] : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Outreach Steps */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Outreach Sequence ({outreachSteps.length} steps)</p>
                <div className="space-y-2 mb-3">
                  {outreachSteps.map((step: any) => (
                    <div key={step.id} className="bg-gray-50 rounded p-3 text-sm border-l-4 border-gray-300">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Step {step.order} · {step.channel}</span>
                        <span>Day +{step.delay_days}</span>
                      </div>
                      <p className="font-medium text-gray-900">{step.subject}</p>
                      <p className="text-gray-600 mt-0.5 text-xs truncate">{step.template.substring(0, 120)}</p>
                    </div>
                  ))}
                </div>

                {/* Add step form */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <p className="text-xs text-gray-500 mb-2">Add outreach step:</p>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <select value={stepChannel} onChange={e => setStepChannel(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 text-xs">
                        {CHANNELS.map(ch => <option key={ch} value={ch}>{ch}</option>)}
                      </select>
                      <input value={stepDelay} onChange={e => setStepDelay(e.target.value)} placeholder="Delay days" type="number" className="w-20 border border-gray-300 rounded-md px-2 py-1 text-xs" />
                    </div>
                    <input value={stepSubject} onChange={e => setStepSubject(e.target.value)} placeholder="Subject line" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                    <textarea value={stepTemplate} onChange={e => setStepTemplate(e.target.value)} placeholder="Template content..." rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                    <button onClick={addOutreachStep} className="w-full bg-gray-900 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-800">Add Step</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
