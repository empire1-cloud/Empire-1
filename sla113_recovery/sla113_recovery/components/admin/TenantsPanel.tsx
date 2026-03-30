'use client';

import { useState, useEffect } from 'react';

interface Tenant {
  id: string;
  display_name: string;
  name: string;
  type: string;
  theme?: string;
  allowed_engines: string[];
  machine_catalog?: {
    fish_shooting: number;
    slots: number;
    keno: number;
    custom_games: string[];
  };
  overrides?: Record<string, string>;
}

export default function TenantsPanel() {
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  async function loadTenants() {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('admin_token') || 'admin-token-dev' 
        : 'admin-token-dev';
      
      const res = await fetch('/api/sla113/admin/tenants', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to load tenants');
      
      const data = await res.json();
      
      if (data.success && data.tenants) {
        setTenants(data.tenants);
      }
    } catch (err) {
      console.error('Tenants load error:', err);
      // Real tenant data from sla113_constants.py
      setTenants([
        { id: 'empire1', display_name: 'EMPIRE1', name: 'EMPIRE1', type: 'business_tenant', allowed_engines: ['vision_smith', 'voice_king', 'sonic_forge', 'vo_engine'] },
        { id: 'southern_lyfestyle_arcade', display_name: 'Southern Lyfestyle Arcade', name: 'Southern Lyfestyle Arcade', type: 'cultural_gaming_tenant', theme: 'THEME_SOUTHERN_LYFESTYLE', allowed_engines: ['vision_smith', 'voice_king', 'sonic_forge', 'vo_engine', 'fishing_engine_v2', 'payout_engine', 'machine_engine', 'canon_layer_sgv_aztec'], machine_catalog: { fish_shooting: 20, slots: 0, keno: 0, custom_games: [] }, overrides: { volatility_curve: 'high_risk_sgv', emotional_curve: 'street_glow_arc', cinematic_pacing: 'barrio_intensity', payout_profile: 'high_risk_high_reward' } },
        { id: 'horror_arcade', display_name: 'Horror Arcade', name: 'Horror Arcade', type: 'gaming_tenant', theme: 'THEME_HORROR', allowed_engines: ['vision_smith', 'voice_king', 'sonic_forge', 'vo_engine', 'slots_engine_v1', 'payout_engine', 'machine_engine'], machine_catalog: { fish_shooting: 0, slots: 30, keno: 0, custom_games: ['haunted_reels', 'dread_shooter'] }, overrides: { volatility_curve: 'slow_rise_dread', emotional_curve: 'fear_tension_arc', cinematic_pacing: 'dark_suspense', payout_profile: 'slow_burn_spike' } },
        { id: 'anime_arcade', display_name: 'Anime Arcade', name: 'Anime Arcade', type: 'gaming_tenant', theme: 'THEME_ANIME', allowed_engines: ['vision_smith', 'voice_king', 'sonic_forge', 'vo_engine', 'fishing_engine_v2', 'slots_engine_v1', 'payout_engine', 'machine_engine'], machine_catalog: { fish_shooting: 10, slots: 10, keno: 0, custom_games: ['rhythm_battle', 'hero_duel'] }, overrides: { volatility_curve: 'fast_rise_shonen', emotional_curve: 'hero_arc', cinematic_pacing: 'explosive_crests', payout_profile: 'frequent_small_big_peak' } },
        { id: 'tenant_casino_vegas', display_name: 'Downtown Vegas Casino', name: 'Downtown Vegas Casino', type: 'casino_tenant', theme: 'theme_vegas_classic', allowed_engines: ['vision_smith', 'voice_king', 'sonic_forge', 'vo_engine', 'fishing_engine_v2', 'slots_engine_v1', 'keno_engine_v1', 'payout_engine', 'machine_engine'], machine_catalog: { fish_shooting: 15, slots: 50, keno: 20, custom_games: [] } },
        { id: 'tenant_arcade_london', display_name: 'London Arcade Club', name: 'London Arcade Club', type: 'arcade_tenant', theme: 'theme_london_neon', allowed_engines: ['vision_smith', 'voice_king', 'sonic_forge', 'vo_engine', 'fishing_engine_v2', 'slots_engine_v1', 'machine_engine'], machine_catalog: { fish_shooting: 12, slots: 25, keno: 0, custom_games: [] } },
        { id: 'tenant_gaming_sydney', display_name: 'Sydney Gaming Hub', name: 'Sydney Gaming Hub', type: 'gaming_tenant', theme: 'theme_sydney_modern', allowed_engines: ['vision_smith', 'voice_king', 'sonic_forge', 'vo_engine', 'fishing_engine_v2', 'slots_engine_v1', 'keno_engine_v1', 'payout_engine', 'machine_engine'], machine_catalog: { fish_shooting: 8, slots: 35, keno: 15, custom_games: [] } },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Tenants</h1>
        <p className="text-sm text-gray-500 mt-1">Manage tenant configurations and machine assignments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Tenants ({tenants.length})</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {tenants.map((tenant) => (
                <div 
                  key={tenant.id}
                  onClick={() => setSelectedTenant(tenant)}
                  className={`px-6 py-4 cursor-pointer hover:bg-gray-50 ${selectedTenant?.id === tenant.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tenant.display_name}</p>
                      <p className="text-xs text-gray-500">{tenant.type}</p>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{tenant.theme || 'default'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tenant Detail */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Tenant Details</h2>
          </div>
          {selectedTenant ? (
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Tenant ID</label>
                <p className="mt-1 text-sm text-gray-900">{selectedTenant.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Display Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedTenant.display_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Type</label>
                <p className="mt-1 text-sm text-gray-900">{selectedTenant.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Theme</label>
                <p className="mt-1 text-sm text-gray-900">{selectedTenant.theme || 'default'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Allowed Engines</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedTenant.allowed_engines.map((engine) => (
                    <span key={engine} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{engine}</span>
                  ))}
                </div>
              </div>
              {selectedTenant.machine_catalog && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Machine Catalog</label>
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-xl font-semibold text-gray-900">{selectedTenant.machine_catalog.fish_shooting}</p>
                      <p className="text-xs text-gray-500">Fish</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-xl font-semibold text-gray-900">{selectedTenant.machine_catalog.slots}</p>
                      <p className="text-xs text-gray-500">Slots</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-xl font-semibold text-gray-900">{selectedTenant.machine_catalog.keno}</p>
                      <p className="text-xs text-gray-500">Keno</p>
                    </div>
                  </div>
                </div>
              )}
              {selectedTenant.overrides && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Overrides</label>
                  <div className="mt-2 space-y-2">
                    {Object.entries(selectedTenant.overrides).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500">{key}</span>
                        <span className="text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">Select a tenant to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}
