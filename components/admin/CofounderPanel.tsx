'use client';

import { useEffect, useState } from 'react';
import { getSla113AdminHeaders } from '@/lib/sla113Auth';

type Brief = {
  // adjust based on actual structure
  [key: string]: any;
};

type Goal = {
  [key: string]: any;
};

type Watchdog = {
  [key: string]: any;
};

type AuditEntry = {
  [key: string]: any;
};

type BriefMarkdown = string;

type QueueItem = {
  id: string;
  type: string;
  title: string;
  status: string;
  priority?: number;
  // etc
};

type ActivityEvent = {
  [key: string]: any;
};

export default function CofounderPanel() {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [watchdog, setWatchdog] = useState<Watchdog | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [latestBrief, setLatestBrief] = useState<BriefMarkdown>('');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = await getSla113AdminHeaders();
        const base = '/api/empire-os-cofounder';

        // Fetch brief
        const briefRes = await fetch(`${base}/brief`, { headers });
        if (briefRes.ok) setBrief(await briefRes.json());

        // Fetch goals
        const goalsRes = await fetch(`${base}/goals`, { headers });
        if (goalsRes.ok) setGoals(await goalsRes.json());

        // Fetch watchdog
        const watchdogRes = await fetch(`${base}/watchdog`, { headers });
        if (watchdogRes.ok) setWatchdog(await watchdogRes.json());

        // Fetch audit (limit 10)
        const auditRes = await fetch(`${base}/audit?limit=10`, { headers });
        if (auditRes.ok) setAudit(await auditRes.json());

        // Fetch latest brief (markdown)
        const latestBriefRes = await fetch(`${base}/latest-brief`, { headers });
        if (latestBriefRes.ok) setLatestBrief(await latestBriefRes.text());

        // Fetch queue (limit 20)
        const queueRes = await fetch(`${base}/queue?limit=20`, { headers });
        if (queueRes.ok) setQueue(await queueRes.json());

        // Fetch activity (limit 20)
        const activityRes = await fetch(`${base}/activity?limit=20`, { headers });
        if (activityRes.ok) setActivity(await activityRes.json());
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Action handlers
  const runSafeLoop = async () => {
    try {
      const headers = await getSla113AdminHeaders();
      const res = await fetch(`${'/api/empire-os-cofounder'}/run-safe-loop`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) throw new Error('Failed to run safe loop');
      // Optionally refetch data
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const runLoop = async () => {
    try {
      const headers = await getSla113AdminHeaders();
      const res = await fetch(`${'/api/empire-os-cofounder'}/run-loop`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) throw new Error('Failed to run loop');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const runSurvivalLoop = async () => {
    try {
      const headers = await getSla113AdminHeaders();
      const res = await fetch(`${'/api/empire-os-cofounder'}/run-survival-loop`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) throw new Error('Failed to run survival loop');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const runNextSafe = async () => {
    try {
      const headers = await getSla113AdminHeaders();
      const res = await fetch(`${'/api/empire-os-cofounder'}/run-next-safe`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) throw new Error('Failed to run next safe');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const runAutonomousCycle = async () => {
    try {
      const headers = await getSla113AdminHeaders();
      const res = await fetch(`${'/api/empire-os-cofounder'}/run-autonomous-cycle`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) throw new Error('Failed to run autonomous cycle');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (loading) {
    return <div className="p-8">Loading Cofounder data...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Empire OS Cofounder</h1>
      <div className="grid grid-cols-1 gap-6">
        {/* Brief */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Brief</h2>
          {brief ? (
            <pre className="bg-gray-50 p-4 rounded-md overflow-auto">{JSON.stringify(brief, null, 2)}</pre>
          ) : (
            <p className="text-gray-500">No brief available</p>
          )}
        </section>

        {/* Goals */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Goals</h2>
          {goals.length > 0 ? (
            <ul className="space-y-2">
              {goals.map((goal, idx) => (
                <li key={idx} className="p-3 bg-gray-50 rounded-md">
                  <pre className="text-sm">{JSON.stringify(goal, null, 2)}</pre>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No goals available</p>
          )}
        </section>

        {/* Watchdog */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Watchdog</h2>
          {watchdog ? (
            <pre className="bg-gray-50 p-4 rounded-md overflow-auto">{JSON.stringify(watchdog, null, 2)}</pre>
          ) : (
            <p className="text-gray-500">No watchdog data</p>
          )}
        </section>

        {/* Audit Log */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Audit Log (latest 10)</h2>
          {audit.length > 0 ? (
            <ul className="space-y-2">
              {audit.map((entry, idx) => (
                <li key={idx} className="p-3 bg-gray-50 rounded-md border-l-2 border-blue-500">
                  <p className="font-medium">{entry.type || 'Event'}</p>
                  <pre className="text-xs mt-1">{JSON.stringify(entry, null, 2)}</pre>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No audit entries</p>
          )}
        </section>

        {/* Latest Brief (Markdown) */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Latest Brief (Markdown)</h2>
          {latestBrief ? (
            <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-md">
              {/* Note: We are not rendering markdown here for simplicity; in a real app you'd use a markdown renderer */}
              <pre className="text-sm">{latestBrief}</pre>
            </div>
          ) : (
            <p className="text-gray-500">No latest brief</p>
          )}
        </section>

        {/* Queue */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Queue (latest 20)</h2>
          {queue.length > 0 ? (
            <ul className="space-y-2">
              {queue.map((item) => (
                <li key={item.id} className="p-3 bg-gray-50 rounded-md border-l-2 border-green-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">Type: {item.type}</p>
                      <p className="text-sm text-gray-500">Status: {item.status}</p>
                      {item.priority !== undefined && <p className="text-sm text-gray-500">Priority: {item.priority}</p>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No queue items</p>
          )}
        </section>

        {/* Activity Feed */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Activity Feed (latest 20)</h2>
          {activity.length > 0 ? (
            <ul className="space-y-2">
              {activity.map((event, idx) => (
                <li key={idx} className="p-3 bg-gray-50 rounded-md border-l-2 border-purple-500">
                  <p className="font-medium">{event.type || 'Activity'}</p>
                  <pre className="text-xs mt-1">{JSON.stringify(event, null, 2)}</pre>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No activity</p>
          )}
        </section>

        {/* Action Buttons */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Cofounder Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={runSafeLoop} className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800">
              Run Safe Loop
            </button>
            <button onClick={runLoop} className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800">
              Run Loop
            </button>
            <button onClick={runSurvivalLoop} className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800">
              Run Survival Loop
            </button>
            <button onClick={runNextSafe} className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800">
              Run Next Safe
            </button>
            <button onClick={runAutonomousCycle} className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800">
              Run Autonomous Cycle
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}