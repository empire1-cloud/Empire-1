'use client';

import { useState, useEffect } from 'react';

const REVENUE_LANES = [
  'full_stack_builds', 'automation', 'micro_saas',
  'white_label', 'enterprise', 'creative_ai', 'admin_ops', 'other',
];

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

export default function BusinessAnalyticsPanel() {
  const [revenue, setRevenue] = useState<any>(null);
  const [usage, setUsage] = useState<any>(null);
  const [kpi, setKpi] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [revRes, usageRes, kpiRes] = await Promise.all([
        fetch('/api/business-analytics/revenue'),
        fetch('/api/business-analytics/usage'),
        fetch('/api/business-analytics/kpi'),
      ]);
      const rev = await revRes.json();
      const usg = await usageRes.json();
      const kp = await kpiRes.json();
      if (rev.success) setRevenue(rev);
      if (usg.success) setUsage(usg);
      if (kp.success) setKpi(kp);
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Business Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Revenue, usage, and platform KPIs</p>
      </div>

      {/* KPI Cards */}
      {kpi && (
        <div className="grid grid-cols-6 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500">Total Users</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{kpi.kpis.total_users}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500">Active Teams</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{kpi.kpis.active_teams}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500">CRM Leads</p>
            <p className="text-2xl font-semibold text-blue-600 mt-1">{kpi.kpis.crm_leads}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500">Active Clients</p>
            <p className="text-2xl font-semibold text-emerald-600 mt-1">{kpi.kpis.active_clients}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500">Conversion</p>
            <p className="text-2xl font-semibold text-purple-600 mt-1">{kpi.kpis.conversion_rate}%</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500">Pending Invites</p>
            <p className="text-2xl font-semibold text-amber-600 mt-1">{kpi.kpis.pending_invites}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Revenue by Lane */}
        {revenue && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Revenue by Lane</h2>
            <p className="text-3xl font-semibold text-emerald-600 mb-4">${revenue.total_mrr.toLocaleString()}</p>
            <div className="space-y-3">
              {REVENUE_LANES.map(lane => (
                <div key={lane} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{laneLabels[lane]}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, ((revenue.lane_mrr?.[lane] || 0) / Math.max(1, revenue.total_mrr)) * 100)}%` }} />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-20 text-right">${(revenue.lane_mrr?.[lane] || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Stats */}
        {usage && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Platform Usage</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-500">Total Executions</p>
                <p className="text-xl font-semibold text-gray-900">{usage.metrics.total_executions}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pipelines</p>
                <p className="text-xl font-semibold text-gray-900">{usage.metrics.total_pipelines}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Teams</p>
                <p className="text-xl font-semibold text-gray-900">{usage.metrics.total_teams}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Active Users</p>
                <p className="text-xl font-semibold text-gray-900">{usage.metrics.total_users}</p>
              </div>
            </div>
            <h3 className="text-xs font-medium text-gray-500 mb-2">Top Engines</h3>
            <div className="space-y-2">
              {usage.metrics.top_engines?.map((e: any) => (
                <div key={e.engine} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate">{e.engine}</span>
                  <span className="font-medium text-gray-900">{e.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
