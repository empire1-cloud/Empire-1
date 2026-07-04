'use client';

import { useState, useEffect } from 'react';
import { getSla113AdminHeaders } from '@/lib/sla113Auth';

interface ComplianceReport {
  id: string;
  project_id: string;
  project_name: string;
  game_type: string;
  jurisdiction: string;
  check_type: string;
  status: 'CERTIFIED' | 'CONDITIONAL' | 'NEEDS_REMEDIATION';
  pass_rate: string;
  actual_rtp: string;
  min_rtp_required: string;
  has_logic_data: boolean;
  results: { check: string; status: string; severity: string; details: string }[];
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  CERTIFIED: 'bg-green-100 text-green-800',
  CONDITIONAL: 'bg-yellow-100 text-yellow-800',
  NEEDS_REMEDIATION: 'bg-red-100 text-red-800',
};

const CHECK_STYLES: Record<string, string> = {
  PASS: 'text-green-600',
  WARN: 'text-yellow-600',
  FAIL: 'text-red-600',
};

export default function RegulatoryPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sla113/compliance', {
        headers: getSla113AdminHeaders(),
      });
      if (!res.ok) throw new Error(`Compliance fetch failed: ${res.status}`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load compliance reports');
    } finally {
      setLoading(false);
    }
  }

  async function deleteReport(id: string) {
    try {
      await fetch(`/api/sla113/compliance/${id}`, {
        method: 'DELETE',
        headers: getSla113AdminHeaders(),
      });
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (expanded === id) setExpanded(null);
    } catch {
      // swallow — report will still show
    }
  }

  const certified = reports.filter((r) => r.status === 'CERTIFIED').length;
  const conditional = reports.filter((r) => r.status === 'CONDITIONAL').length;
  const failing = reports.filter((r) => r.status === 'NEEDS_REMEDIATION').length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Regulatory</h1>
          <p className="text-sm text-gray-500 mt-1">Compliance reports from the backend. Run checks from any project via the AI Studio or Logic Engine.</p>
        </div>
        <button
          onClick={loadReports}
          disabled={loading}
          className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Certified</p>
          <p className="text-3xl font-semibold text-green-600 mt-2">{loading ? '—' : certified}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Conditional</p>
          <p className="text-3xl font-semibold text-yellow-600 mt-2">{loading ? '—' : conditional}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Needs Remediation</p>
          <p className="text-3xl font-semibold text-red-600 mt-2">{loading ? '—' : failing}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Compliance Reports</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button onClick={loadReports} className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800">
              Retry
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-sm">No compliance reports yet.</p>
            <p className="text-xs mt-1">Run a compliance check from any project in the AI Studio.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reports.map((r) => (
              <div key={r.id}>
                <div
                  className="flex items-center px-6 py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.project_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {r.jurisdiction} · {r.game_type} · {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                    <span className="text-xs text-gray-500">{r.pass_rate}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteReport(r.id); }}
                      className="text-xs text-gray-300 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {expanded === r.id && (
                  <div className="px-6 pb-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex gap-8 py-3 text-xs text-gray-500">
                      <span><strong>RTP:</strong> {r.actual_rtp} (min {r.min_rtp_required})</span>
                      <span><strong>Logic data:</strong> {r.has_logic_data ? 'Yes' : 'No'}</span>
                      <span><strong>Report ID:</strong> {r.id}</span>
                    </div>
                    <div className="space-y-1">
                      {r.results.map((chk, i) => (
                        <div key={i} className="flex items-start gap-3 text-xs py-1">
                          <span className={`font-bold w-10 flex-shrink-0 ${CHECK_STYLES[chk.status] ?? 'text-gray-500'}`}>
                            {chk.status}
                          </span>
                          <span className="font-medium text-gray-700 w-48 flex-shrink-0">{chk.check}</span>
                          <span className="text-gray-500">{chk.details}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
