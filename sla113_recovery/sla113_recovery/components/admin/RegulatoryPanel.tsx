'use client';

import { useState, useEffect } from 'react';

interface RegulatoryProfile {
  jurisdiction: string;
  min_rtp: number;
  max_rtp: number;
  age_gate_minimum: number;
  session_time_limit_minutes: number;
  tax_rate_pct: number;
}

export default function RegulatoryPanel() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<RegulatoryProfile[]>([
    { jurisdiction: 'Nevada, USA (Las Vegas)', min_rtp: 0.90, max_rtp: 0.98, age_gate_minimum: 21, session_time_limit_minutes: 480, tax_rate_pct: 6 },
    { jurisdiction: 'United Kingdom (Gambling Commission)', min_rtp: 0.85, max_rtp: 0.99, age_gate_minimum: 18, session_time_limit_minutes: 300, tax_rate_pct: 12 },
    { jurisdiction: 'Australia (Illyarrie)', min_rtp: 0.87, max_rtp: 0.98, age_gate_minimum: 18, session_time_limit_minutes: 360, tax_rate_pct: 10 },
    { jurisdiction: 'California, USA (High Compliance)', min_rtp: 0.92, max_rtp: 0.97, age_gate_minimum: 21, session_time_limit_minutes: 360, tax_rate_pct: 8 },
  ]);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    setLoading(false);
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Regulatory</h1>
        <p className="text-sm text-gray-500 mt-1">Compliance and jurisdiction rules</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Jurisdiction Profiles</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jurisdiction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RTP Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {profiles.map((profile, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{profile.jurisdiction}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{(profile.min_rtp * 100).toFixed(0)}% - {(profile.max_rtp * 100).toFixed(0)}%</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{profile.age_gate_minimum}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{Math.floor(profile.session_time_limit_minutes / 60)}h</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{profile.tax_rate_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
