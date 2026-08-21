'use client';

import { useState, useEffect, useCallback } from 'react';

const API = '/api/hybrid';

type Tab = 'engines' | 'composer' | 'analytics' | 'history';

interface Engine {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  status: string;
  version: string;
  total_executions: number;
  error_rate: number;
  avg_latency_ms: number;
}

interface Execution {
  id: string;
  engine: string;
  success: boolean;
  latency_ms: number;
  error: string | null;
  timestamp: string;
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'engines', label: 'Engines' },
  { key: 'composer', label: 'Composer' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'history', label: 'History' },
];

const CATEGORY_COLORS: Record<string, string> = {
  Core: '#e6007a',
  Intelligence: '#007aff',
  Creative: '#bf5af2',
  Business: '#30d158',
};

export default function HicPage() {
  const [tab, setTab] = useState<Tab>('engines');
  const [engines, setEngines] = useState<Engine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/engines`)
      .then(r => r.json())
      .then(d => { setEngines(d.engines); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root { --bg:#050505; --surface:#0a0a0d; --surface2:#111115; --line:rgba(245,245,247,0.09); --line-strong:rgba(245,245,247,0.16); --text:#f2f2f4; --muted:#8c8c95; --gold:#e8b923; --pink:#e6007a; --blue:#007aff; --green:#30d158; --purple:#bf5af2; }
        *{box-sizing:border-box;} html{scroll-behavior:smooth;}
        body{margin:0;background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
        .hic-header{position:sticky;top:0;z-index:20;background:rgba(5,5,5,0.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--line);padding:16px 0;}
        .hic-header-inner{max-width:1100px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;}
        .hic-logo{display:flex;align-items:center;gap:12px;}
        .hic-logo img{width:30px;height:30px;border-radius:4px;}
        .hic-wordmark{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:16px;letter-spacing:0.08em;text-transform:uppercase;}
        .hic-wordmark span{color:var(--pink);}
        .hic-status{display:flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--green);}
        .hic-status::before{content:'';width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);}
        .hic-tabs{display:flex;gap:0;background:var(--surface);border:1px solid var(--line-strong);border-radius:4px;overflow:hidden;margin:0 auto;max-width:1100px;}
        .hic-tab{flex:1;padding:14px 0;text-align:center;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:var(--muted);background:transparent;border:none;border-right:1px solid var(--line);cursor:pointer;transition:all .2s;}
        .hic-tab:last-child{border-right:none;}
        .hic-tab:hover{color:var(--text);background:rgba(245,245,247,0.03);}
        .hic-tab.active{color:var(--gold);background:rgba(232,185,35,0.06);box-shadow:inset 0 -2px 0 var(--gold);}
        .hic-wrap{max-width:1100px;margin:0 auto;padding:32px 24px 80px;}
        .hic-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1px;background:var(--line-strong);border:1px solid var(--line-strong);border-radius:4px;overflow:hidden;margin-top:24px;}
        .hic-card{background:var(--surface);padding:22px 20px;display:flex;flex-direction:column;gap:10px;transition:background .2s;}
        .hic-card:hover{background:var(--surface2);}
        .hic-card-top{display:flex;align-items:center;justify-content:space-between;}
        .hic-card-cat{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;padding:3px 8px;border-radius:2px;font-weight:600;}
        .hic-card-status{width:7px;height:7px;border-radius:50%;background:var(--green);}
        .hic-card h3{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:17px;margin:0;line-height:1.2;}
        .hic-card p{font-size:12.5px;color:var(--muted);line-height:1.5;margin:0;}
        .hic-card-meta{display:flex;gap:16px;margin-top:4px;font-family:'JetBrains Mono',monospace;font-size:10.5px;color:var(--muted);}
        .hic-card-meta span{display:flex;align-items:center;gap:4px;}
        .hic-section{margin-top:32px;}
        .hic-section-title{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:24px;margin-bottom:16px;}
        .hic-stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line-strong);border:1px solid var(--line-strong);border-radius:4px;overflow:hidden;}
        .hic-stat{background:var(--surface);padding:20px;text-align:center;}
        .hic-stat-num{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:36px;color:var(--gold);line-height:1;}
        .hic-stat-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);margin-top:8px;}
        .hic-composer-wrap{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px;}
        .hic-composer-panel{background:var(--surface);border:1px solid var(--line-strong);border-radius:4px;padding:24px;}
        .hic-composer-panel h3{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:18px;margin:0 0 16px;}
        .hic-engine-btn{display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;background:var(--surface2);border:1px solid var(--line);border-radius:4px;color:var(--text);font-size:13px;cursor:pointer;transition:all .2s;font-family:inherit;}
        .hic-engine-btn:hover{border-color:var(--gold);background:rgba(232,185,35,0.05);}
        .hic-engine-btn.selected{border-color:var(--gold);background:rgba(232,185,35,0.08);}
        .hic-engine-btn small{display:block;color:var(--muted);font-size:11px;margin-top:3px;}
        .hic-pipeline-steps{min-height:200px;}
        .hic-pipeline-step{display:flex;align-items:center;gap:10px;padding:10px 14px;margin-bottom:6px;background:var(--surface2);border:1px solid var(--line);border-radius:4px;font-size:13px;}
        .hic-pipeline-step .num{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--gold);min-width:20px;}
        .hic-pipeline-step .remove{margin-left:auto;color:var(--muted);cursor:pointer;font-size:16px;}
        .hic-pipeline-step .remove:hover{color:var(--pink);}
        .hic-input{width:100%;padding:12px 16px;background:var(--surface2);border:1px solid var(--line-strong);border-radius:4px;color:var(--text);font-size:14px;font-family:inherit;outline:none;transition:border-color .2s;}
        .hic-input:focus{border-color:var(--gold);}
        .hic-btn{padding:12px 24px;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.05em;text-transform:uppercase;border:none;border-radius:2px;cursor:pointer;transition:all .2s;font-weight:600;}
        .hic-btn-primary{background:var(--gold);color:#0a0a0a;}
        .hic-btn-primary:hover{box-shadow:0 4px 16px rgba(232,185,35,0.3);transform:translateY(-1px);}
        .hic-btn-ghost{background:transparent;border:1px solid var(--line-strong);color:var(--text);}
        .hic-btn-ghost:hover{border-color:var(--pink);color:var(--pink);}
        .hic-result{background:var(--surface);border:1px solid var(--line-strong);border-radius:4px;padding:20px;margin-top:16px;font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.7;white-space:pre-wrap;color:#c7c7cd;max-height:400px;overflow-y:auto;}
        .hic-history-item{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);font-size:13px;}
        .hic-history-item:last-child{border-bottom:none;}
        .hic-history-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
        .hic-history-dot.ok{background:var(--green);}
        .hic-history-dot.err{background:var(--pink);}
        .hic-history-engine{font-weight:600;min-width:160px;}
        .hic-history-time{color:var(--muted);margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:11px;}
        .hic-history-latency{color:var(--gold);font-family:'JetBrains Mono',monospace;font-size:11px;min-width:60px;text-align:right;}
        .hic-empty{text-align:center;padding:60px 20px;color:var(--muted);font-size:14px;}
        .hic-loading{text-align:center;padding:80px 20px;color:var(--muted);font-family:'JetBrains Mono',monospace;font-size:12px;}
        @media(max-width:760px){.hic-stats-row{grid-template-columns:1fr 1fr;}.hic-composer-wrap{grid-template-columns:1fr;}.hic-grid{grid-template-columns:1fr;}}
        @media(max-width:480px){.hic-stats-row{grid-template-columns:1fr;}}
      ` }} />

      <div className="hic-header">
        <div className="hic-header-inner">
          <div className="hic-logo">
            <img src="/empire1_logo.jpeg" alt="Empire-1" />
            <div className="hic-wordmark">HYBRID <span>INTELLIGENCE</span> CORE</div>
          </div>
          <div className="hic-status">ONLINE</div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 24px 0'}}>
        <div className="hic-tabs">
          {TABS.map(t => (
            <button key={t.key} className={`hic-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hic-wrap">
        {loading && <div className="hic-loading">Connecting to HIC core...</div>}
        {error && <div className="hic-empty">Error: {error}</div>}

        {!loading && !error && tab === 'engines' && <EnginesTab engines={engines} />}
        {!loading && !error && tab === 'composer' && <ComposerTab engines={engines} />}
        {!loading && !error && tab === 'analytics' && <AnalyticsTab />}
        {!loading && !error && tab === 'history' && <HistoryTab />}
      </div>
    </>
  );
}

function EnginesTab({ engines }: { engines: Engine[] }) {
  const categories = [...new Set(engines.map(e => e.category))];
  return (
    <>
      <div className="hic-stats-row">
        <div className="hic-stat">
          <div className="hic-stat-num">{engines.length}</div>
          <div className="hic-stat-label">Engines</div>
        </div>
        <div className="hic-stat">
          <div className="hic-stat-num">{categories.length}</div>
          <div className="hic-stat-label">Categories</div>
        </div>
        <div className="hic-stat">
          <div className="hic-stat-num">{engines.filter(e => e.status === 'ready').length}</div>
          <div className="hic-stat-label">Ready</div>
        </div>
        <div className="hic-stat">
          <div className="hic-stat-num">3</div>
          <div className="hic-stat-label">Models</div>
        </div>
      </div>

      {categories.map(cat => (
        <div className="hic-section" key={cat}>
          <div className="hic-section-title" style={{color: CATEGORY_COLORS[cat] || '#fff'}}>{cat}</div>
          <div className="hic-grid">
            {engines.filter(e => e.category === cat).map(e => (
              <div className="hic-card" key={e.id}>
                <div className="hic-card-top">
                  <span className="hic-card-cat" style={{color: e.color, background: e.color + '15'}}>{e.category}</span>
                  <span className="hic-card-status" />
                </div>
                <h3>{e.name}</h3>
                <p>{e.description}</p>
                <div className="hic-card-meta">
                  <span>v{e.version}</span>
                  <span>{e.total_executions} runs</span>
                  <span>{e.avg_latency_ms > 0 ? e.avg_latency_ms + 'ms' : '—'}</span>
                  <span>{e.error_rate}% err</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function ComposerTab({ engines }: { engines: Engine[] }) {
  const [pipeline, setPipeline] = useState<{engine: string; name: string}[]>([]);
  const [objective, setObjective] = useState('');
  const [result, setResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  const addEngine = (e: Engine) => {
    setPipeline(prev => [...prev, { engine: e.id, name: e.name }]);
  };

  const removeStep = (idx: number) => {
    setPipeline(prev => prev.filter((_, i) => i !== idx));
  };

  const runPipeline = async () => {
    if (!pipeline.length || !objective.trim()) return;
    setRunning(true);
    try {
      const res = await fetch(`${API}/pipeline/compose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective: objective,
          steps: pipeline.map(p => ({ engine: p.engine, input: objective })),
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({ error: e.message });
    }
    setRunning(false);
  };

  return (
    <div className="hic-composer-wrap">
      <div className="hic-composer-panel">
        <h3>Available Engines</h3>
        <p style={{fontSize:13,color:'var(--muted)',margin:'0 0 16px'}}>Click to add to pipeline</p>
        {engines.map(e => (
          <button key={e.id} className="hic-engine-btn" onClick={() => addEngine(e)}>
            {e.name}
            <small>{e.description}</small>
          </button>
        ))}
      </div>
      <div className="hic-composer-panel">
        <h3>Pipeline ({pipeline.length} steps)</h3>
        {pipeline.length === 0 ? (
          <div className="hic-empty" style={{padding:'40px 20px'}}>Add engines from the left panel to build your pipeline</div>
        ) : (
          <div className="hic-pipeline-steps">
            {pipeline.map((step, i) => (
              <div className="hic-pipeline-step" key={i}>
                <span className="num">{i + 1}</span>
                {step.name}
                <span className="remove" onClick={() => removeStep(i)}>×</span>
              </div>
            ))}
          </div>
        )}

        <div style={{marginTop:16}}>
          <input
            className="hic-input"
            placeholder="Enter objective (e.g. 'Build an AI-powered fitness app')"
            value={objective}
            onChange={e => setObjective(e.target.value)}
          />
        </div>

        <div style={{display:'flex',gap:12,marginTop:16}}>
          <button
            className="hic-btn hic-btn-primary"
            onClick={runPipeline}
            disabled={running || !pipeline.length || !objective.trim()}
          >
            {running ? 'Running...' : 'Run Pipeline'}
          </button>
          <button className="hic-btn hic-btn-ghost" onClick={() => { setPipeline([]); setResult(null); setObjective(''); }}>
            Clear
          </button>
        </div>

        {result && (
          <div className="hic-result">
            {result.error ? (
              <span style={{color:'var(--pink)'}}>Error: {result.error}</span>
            ) : (
              <>
                <div style={{color:'var(--green)',marginBottom:8}}>✓ Pipeline completed — {result.steps_completed} steps — {result.total_latency_ms}ms</div>
                {result.results?.map((r: any, i: number) => (
                  <div key={i} style={{marginBottom:12,paddingBottom:12,borderBottom:'1px solid var(--line)'}}>
                    <div style={{color:'var(--gold)'}}>Step {r.step}: {r.engine?.replace(/_engine/g,'').replace(/_/g,' ').toUpperCase()}</div>
                    <div style={{marginTop:4}}>{r.output?.summary || r.output?.result || JSON.stringify(r.output, null, 2)}</div>
                    {r.model && <div style={{color:'var(--muted)',marginTop:4}}>Model: {r.model}</div>}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    fetch(`${API}/analytics`)
      .then(r => r.json())
      .then(d => { setAnalytics(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  if (loading) return <div className="hic-loading">Loading analytics...</div>;
  if (!analytics) return <div className="hic-empty">No analytics data yet. Run some engines first.</div>;

  const s = analytics.summary;
  const engines = Object.entries(analytics.per_engine || {});

  return (
    <>
      <div className="hic-stats-row">
        <div className="hic-stat">
          <div className="hic-stat-num">{s.total_executions}</div>
          <div className="hic-stat-label">Total Executions</div>
        </div>
        <div className="hic-stat">
          <div className="hic-stat-num" style={{color: s.success_rate >= 80 ? 'var(--green)' : 'var(--pink)'}}>{s.success_rate}%</div>
          <div className="hic-stat-label">Success Rate</div>
        </div>
        <div className="hic-stat">
          <div className="hic-stat-num">{s.avg_latency_ms > 0 ? s.avg_latency_ms + 'ms' : '—'}</div>
          <div className="hic-stat-label">Avg Latency</div>
        </div>
        <div className="hic-stat">
          <div className="hic-stat-num" style={{color: s.total_errors > 0 ? 'var(--pink)' : 'var(--green)'}}>{s.total_errors}</div>
          <div className="hic-stat-label">Errors</div>
        </div>
      </div>

      {engines.length > 0 && (
        <div className="hic-section">
          <div className="hic-section-title">Engine Performance</div>
          <div style={{background:'var(--surface)',border:'1px solid var(--line-strong)',borderRadius:4,overflow:'hidden'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 80px 80px 80px 80px',padding:'12px 16px',background:'var(--surface2)',fontFamily:'JetBrains Mono',monospace,fontSize:11,letterSpacing:'0.06em',color:'var(--muted)',textTransform:'uppercase'}}>
              <span>Engine</span><span style={{textAlign:'right'}}>Runs</span><span style={{textAlign:'right'}}>Success</span><span style={{textAlign:'right'}}>Errors</span><span style={{textAlign:'right'}}>Avg Latency</span>
            </div>
            {engines.map(([id, data]: [string, any]) => (
              <div key={id} style={{display:'grid',gridTemplateColumns:'1fr 80px 80px 80px 80px',padding:'10px 16px',borderTop:'1px solid var(--line)',fontSize:13}}>
                <span style={{fontWeight:600}}>{data.name}</span>
                <span style={{textAlign:'right',fontFamily:'JetBrains Mono',monospace,fontSize:12}}>{data.total}</span>
                <span style={{textAlign:'right',fontFamily:'JetBrains Mono',monospace,fontSize:12,color:'var(--green)'}}>{data.success_rate}%</span>
                <span style={{textAlign:'right',fontFamily:'JetBrains Mono',monospace,fontSize:12,color:data.errors > 0 ? 'var(--pink)' : 'var(--muted)'}}>{data.errors}</span>
                <span style={{textAlign:'right',fontFamily:'JetBrains Mono',monospace,fontSize:12,color:'var(--gold)'}}>{data.avg_latency_ms > 0 ? data.avg_latency_ms + 'ms' : '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics.recent?.length > 0 && (
        <div className="hic-section">
          <div className="hic-section-title">Recent Executions</div>
          <div style={{background:'var(--surface)',border:'1px solid var(--line-strong)',borderRadius:4,overflow:'hidden'}}>
            {analytics.recent.map((e: Execution) => (
              <div className="hic-history-item" key={e.id}>
                <span className={`hic-history-dot ${e.success ? 'ok' : 'err'}`} />
                <span className="hic-history-engine">{e.engine.replace(/_engine/g, '').replace(/_/g, ' ')}</span>
                <span style={{color: e.success ? 'var(--green)' : 'var(--pink)', fontSize:12}}>{e.success ? 'OK' : 'ERR'}</span>
                <span className="hic-history-latency">{e.latency_ms}ms</span>
                <span className="hic-history-time">{new Date(e.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{marginTop:16}}>
        <button className="hic-btn hic-btn-ghost" onClick={refresh}>Refresh</button>
      </div>
    </>
  );
}

function HistoryTab() {
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/history`)
      .then(r => r.json())
      .then(d => { setHistory(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="hic-loading">Loading history...</div>;
  if (!history?.executions?.length) return <div className="hic-empty">No executions yet. Run an engine or pipeline to see history here.</div>;

  return (
    <div className="hic-section">
      <div className="hic-section-title">Execution History ({history.total} total)</div>
      <div style={{background:'var(--surface)',border:'1px solid var(--line-strong)',borderRadius:4,overflow:'hidden'}}>
        {history.executions.map((e: Execution) => (
          <div className="hic-history-item" key={e.id}>
            <span className={`hic-history-dot ${e.success ? 'ok' : 'err'}`} />
            <span className="hic-history-engine">{e.engine.replace(/_engine/g, '').replace(/_/g, ' ')}</span>
            <span style={{color: e.success ? 'var(--green)' : 'var(--pink)', fontSize:12}}>
              {e.success ? 'OK' : 'ERR'}
            </span>
            {e.error && <span style={{color:'var(--muted)',fontSize:11,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.error}</span>}
            <span className="hic-history-latency">{e.latency_ms}ms</span>
            <span className="hic-history-time">{new Date(e.timestamp).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
