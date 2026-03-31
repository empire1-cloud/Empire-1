'use client';

import { useState, useEffect } from 'react';

interface MachineType {
  id: string;
  name: string;
  count: number;
  status: 'active' | 'inactive' | 'maintenance';
  rtp: number;
  volatility: 'low' | 'medium' | 'high';
}

export default function MachinesPanel() {
  const [loading, setLoading] = useState(false);
  const [machines, setMachines] = useState<MachineType[]>([
    { id: 'fish_shooting', name: 'Fish Shooting', count: 65, status: 'active', rtp: 0.94, volatility: 'medium' },
    { id: 'slots_classic', name: 'Classic Slots', count: 120, status: 'active', rtp: 0.95, volatility: 'high' },
    { id: 'slots_video', name: 'Video Slots', count: 80, status: 'active', rtp: 0.95, volatility: 'medium' },
    { id: 'keno', name: 'Keno', count: 35, status: 'active', rtp: 0.93, volatility: 'low' },
    { id: 'custom_haunted', name: 'Haunted Reels', count: 10, status: 'active', rtp: 0.92, volatility: 'high' },
    { id: 'custom_hero', name: 'Hero Duel', count: 8, status: 'maintenance', rtp: 0.94, volatility: 'medium' },
  ]);

  const totalMachines = machines.reduce((sum, m) => sum + m.count, 0);
  const activeMachines = machines.filter(m => m.status === 'active').reduce((sum, m) => sum + m.count, 0);

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Machine Catalog</h1>
        <p className="text-sm text-gray-500 mt-1">Game machine inventory and configuration</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Total Machines</p>
          <p className="text-3xl font-semibold text-gray-900 mt-2">{totalMachines}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-3xl font-semibold text-green-600 mt-2">{activeMachines}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Maintenance</p>
          <p className="text-3xl font-semibold text-yellow-600 mt-2">{machines.filter(m => m.status === 'maintenance').reduce((s, m) => s + m.count, 0)}</p>
        </div>
      </div>

      {/* Machine Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Machines</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RTP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volatility</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {machines.map((machine) => (
                <tr key={machine.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{machine.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{machine.count}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(machine.status)}`}>
                      {machine.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(machine.rtp * 100).toFixed(0)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{machine.volatility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
