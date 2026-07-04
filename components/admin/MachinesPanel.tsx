'use client';

import { useState, useEffect } from 'react';
import { getSla113AdminHeaders } from '@/lib/sla113Auth';

interface GameType {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface MachineRow {
  id: string;
  name: string;
  category: string;
  count: number;
  status: 'active' | 'inactive';
}

export default function MachinesPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [machines, setMachines] = useState<MachineRow[]>([]);

  useEffect(() => {
    loadMachines();
  }, []);

  async function loadMachines() {
    setLoading(true);
    setError(null);
    try {
      const headers = getSla113AdminHeaders();
      const [typesRes, statsRes] = await Promise.all([
        fetch('/api/sla113/game-types', { headers }),
        fetch('/api/sla113/stats', { headers }),
      ]);

      if (!typesRes.ok) throw new Error(`Game types fetch failed: ${typesRes.status}`);
      if (!statsRes.ok) throw new Error(`Stats fetch failed: ${statsRes.status}`);

      const typesData = await typesRes.json();
      const statsData = await statsRes.json();
      const countsByType: Record<string, number> = statsData.by_game_type || {};

      const rows: MachineRow[] = Object.entries(typesData.game_types as Record<string, GameType>).map(
        ([id, gt]) => ({
          id,
          name: gt.name,
          category: gt.category,
          count: countsByType[id] ?? 0,
          status: (countsByType[id] ?? 0) > 0 ? 'active' : 'inactive',
        })
      );

      rows.sort((a, b) => b.count - a.count);
      setMachines(rows);
    } catch (err: any) {
      setError(err.message || 'Failed to load machines');
    } finally {
      setLoading(false);
    }
  }

  const totalProjects = machines.reduce((s, m) => s + m.count, 0);
  const activeTypes = machines.filter((m) => m.status === 'active').length;

  const categoryColor: Record<string, string> = {
    arcade: 'bg-blue-100 text-blue-800',
    casino: 'bg-yellow-100 text-yellow-800',
    music: 'bg-purple-100 text-purple-800',
    cultural: 'bg-pink-100 text-pink-800',
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Machine Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">Game types and project counts from the backend</p>
        </div>
        <button
          onClick={loadMachines}
          disabled={loading}
          className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Total Projects</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">{loading ? '—' : totalProjects}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Active Types</p>
          <p className="text-3xl font-semibold text-green-600 mt-2">{loading ? '—' : activeTypes}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Total Types</p>
          <p className="text-3xl font-semibold text-gray-700 mt-2">{loading ? '—' : machines.length}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Game Type Registry</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button
              onClick={loadMachines}
              className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Retry
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {machines.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColor[m.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {m.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{m.count}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
