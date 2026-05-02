'use client';

import React, { useState, useEffect } from 'react';

interface FactoryStatus {
  queue_length: number;
  processing: boolean;
  current_build: {
    build_id: string;
    game_type: string;
    status: string;
  } | null;
  last_heartbeat: string;
  render_modes: {
    cloud: boolean;
    local: boolean;
  };
}

export default function AdminHeartbeat() {
  const [status, setStatus] = useState<FactoryStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/sla113/status');
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        console.error('Heartbeat failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="admin-heartbeat loading">
        <div className="indicator pulse"></div>
        <span className="gotham">INITIALIZING...</span>
      </div>
    );
  }

  return (
    <div className="admin-heartbeat">
      <header className="system-status">
        <div className={`indicator ${status?.processing ? 'active processing' : 'active'}`}></div>
        <span className="gotham">
          KERNEL: SLA113_REV_7 // STATUS: {status?.processing ? 'PROCESSING' : 'OPERATIONAL'}
        </span>
        <span className="timestamp">
          {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')} // {new Date().toLocaleTimeString('en-GB')}
        </span>
      </header>
      
      <main className="ledger-view">
        <div className="hex-stream">
          0x1A 0xF2 0x88 0xC4 0x01...
        </div>
        <div className="math-stats">
          <p>QUEUE_LENGTH: {status?.queue_length || 0}</p>
          <p>RTB_BRACKET: [88.5% - 94.2%]</p>
          {status?.current_build && (
            <p>BUILD: {status.current_build.build_id} // {status.current_build.game_type}</p>
          )}
        </div>
      </main>
    </div>
  );
}
