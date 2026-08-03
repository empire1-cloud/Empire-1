'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';

type ViralChannel = 'linkedin' | 'carousel' | 'short_video' | 'newsletter';
type TabId = 'overview' | 'create' | 'signals' | 'analytics' | 'learning' | 'history';
type EvidenceClassification = 'external_signal' | 'empire_proof' | 'founder_perspective' | 'unverified_claim';
type StoryPattern = 'audit_to_verdict' | 'problem_failed_assumption' | 'founder_struggle' | 'signal_to_position' | 'build_receipt';

type ViralPack = {
  id: string;
  engine_version?: string;
  pattern: string;
  story_pattern?: StoryPattern;
  product_universe: string;
  objective: string;
  conversion_goal?: string;
  audience: string;
  channels: ViralChannel[];
  headline: string;
  subheadline: string;
  verdict: string;
  survival_rate_percent?: number | null;
  evidence?: {
    classification?: EvidenceClassification;
    proof_basis?: string;
    proof_reference?: string | null;
    source_title?: string | null;
    source_url?: string | null;
    source_publisher?: string | null;
    source_date?: string | null;
    extracted_signal?: string | null;
    founder_perspective?: string | null;
  };
  scoring?: {
    scores: Record<string, number>;
    overall_score: number;
    publish_ready: boolean;
    blockers: string[];
  };
  content_assets: {
    linkedin_post: string;
    carousel: Array<{ slide: number; role: string; copy: string }>;
    short_video: Array<{ seconds: string; beat: string; copy: string }>;
    newsletter: {
      subject_lines: string[];
      opening: string;
      sections: string[];
    };
    short_posts?: string[];
    hooks?: string[];
    investor_message?: string;
    call_to_action?: string;
  };
  distribution_plan?: Array<{ day: number; stage: string; action: string; approval_required: boolean }>;
  proof_checklist: string[];
  integrity_rules: string[];
  empire_examples: Array<{ universe: string; headline: string; proof: string }>;
  created_at: string;
  updated_at?: string;
  status: string;
  founder_approved?: boolean;
};

type Signal = {
  id: string;
  title: string;
  source_url?: string | null;
  publisher?: string | null;
  published_date?: string | null;
  category: string;
  extracted_signal: string;
  founder_angle?: string | null;
  product_universe: string;
  evidence_classification: EvidenceClassification;
  status: string;
  created_at: string;
};

type Metric = {
  id: string;
  content_pack_id?: string | null;
  product_universe: string;
  channel: string;
  hook?: string | null;
  format?: string | null;
  proof_asset?: string | null;
  audience?: string | null;
  reach: number;
  saves: number;
  qualified_comments: number;
  profile_visits: number;
  direct_messages: number;
  applications: number;
  meetings: number;
  attributed_revenue: number;
  created_at: string;
};

type Learning = {
  id: string;
  product_universe: string;
  content_pack_id?: string | null;
  note_type: string;
  observation: string;
  recommendation: string;
  action: string;
  created_at: string;
};

type Dashboard = {
  workflow: string[];
  counts: {
    signals: number;
    packs: number;
    publish_ready: number;
    founder_approved: number;
    published: number;
    learning_notes: number;
  };
  totals: {
    reach: number;
    saves: number;
    qualified_comments: number;
    profile_visits: number;
    direct_messages: number;
    applications: number;
    meetings: number;
    attributed_revenue: number;
  };
  conversion_rate_percent: number;
  recent_signals: Signal[];
  recent_packs: ViralPack[];
  recent_learnings: Learning[];
  next_actions: string[];
};

type Preset = {
  product_universe: string;
  audited_subject: string;
  total_examined: string;
  survivors: string;
  proof_basis: string;
  proof_reference: string;
  audience: string;
  call_to_action: string;
  conversion_goal: string;
};

const CHANNELS: Array<{ id: ViralChannel; label: string }> = [
  { id: 'linkedin', label: 'LinkedIn post' },
  { id: 'carousel', label: 'Carousel' },
  { id: 'short_video', label: 'Short video' },
  { id: 'newsletter', label: 'Newsletter' },
];

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Command board' },
  { id: 'create', label: 'Create' },
  { id: 'signals', label: 'Signal intake' },
  { id: 'analytics', label: 'Growth analytics' },
  { id: 'learning', label: 'Learning library' },
  { id: 'history', label: 'History' },
];

const WORKFLOW = ['DISCOVER', 'VERIFY', 'CREATE', 'DISTRIBUTE', 'CONVERT', 'LEARN', 'REUSE'];

const UNIVERSES = [
  'Empire-1',
  'Lyrica 3',
  'Archisynapse',
  'Cultura Vibe Forge',
  'HIC / Empire Auto Cofounder',
  'Southern Lifestyle',
  'Founding 8 Youth Tech',
];

const STORY_PATTERNS: Array<{ id: StoryPattern; label: string; formula: string }> = [
  { id: 'audit_to_verdict', label: 'Audit → Verdict', formula: 'Audit → brutal filter → surprising result → specific proof' },
  { id: 'problem_failed_assumption', label: 'Failed assumption', formula: 'Problem → failed industry assumption → Empire answer → proof' },
  { id: 'founder_struggle', label: 'Founder build story', formula: 'Founder struggle → decision → build → result' },
  { id: 'signal_to_position', label: 'Signal → Position', formula: 'Signal → why it matters → Empire position → next action' },
  { id: 'build_receipt', label: 'Build receipt', formula: 'Build receipt → lesson → invitation' },
];

const EVIDENCE_OPTIONS: Array<{ id: EvidenceClassification; label: string; detail: string }> = [
  { id: 'empire_proof', label: 'Empire Proof', detail: 'Test, receipt, artifact, metric, screenshot, deployment, or customer result.' },
  { id: 'external_signal', label: 'External Signal', detail: 'Supported by a named source; never presented as an Empire-1 achievement.' },
  { id: 'founder_perspective', label: 'Founder Perspective', detail: 'Manda’s interpretation or belief, clearly labeled as perspective.' },
  { id: 'unverified_claim', label: 'Unverified Claim', detail: 'Stored for review but blocked from publish-ready status.' },
];

const PRESETS: Preset[] = [
  {
    product_universe: 'Empire-1',
    audited_subject: 'public product claims',
    total_examined: 'All current claims',
    survivors: 'Only evidence-backed claims',
    proof_basis: 'tests, receipts, release evidence, dated screenshots, and live workflow output',
    proof_reference: 'Public-claims hardening and HIC front-door release evidence',
    audience: 'founders, operators, buyers, and investors',
    call_to_action: 'Open the evidence trail',
    conversion_goal: 'Architecture review requests',
  },
  {
    product_universe: 'Lyrica 3',
    audited_subject: 'proof layers in one creator workflow',
    total_examined: '6',
    survivors: '6',
    proof_basis: 'creation, audio identity, Soulprint, VICS signing, royalty obligation, and payout receipt',
    proof_reference: 'Signed $1.25 Flip royalty receipt and production deployment proof',
    audience: 'independent artists, producers, and music partners',
    call_to_action: 'Apply for the creator royalty pilot',
    conversion_goal: 'Creator pilot applications',
  },
  {
    product_universe: 'Archisynapse',
    audited_subject: 'money and royalty events',
    total_examined: 'Every payable event',
    survivors: 'Only VICS-verified events',
    proof_basis: 'fail-closed verification, durable royalty state, transaction-owned ledger posting, concurrency tests, and balanced receipts',
    proof_reference: 'Archisynapse v2 royalty verification and ledger-boundary evidence',
    audience: 'creator platforms, labels, distributors, fintech operators, and enterprise buyers',
    call_to_action: 'Request a VICS acceptance pilot',
    conversion_goal: 'Enterprise pilot conversations',
  },
  {
    product_universe: 'Cultura Vibe Forge',
    audited_subject: 'cultural integrity decisions',
    total_examined: 'Every generated workflow',
    survivors: 'Only culturally governed outputs',
    proof_basis: 'heritage logic, dialect integrity, authenticity filters, community context, and provider-neutral orchestration',
    proof_reference: 'El Centro → El Terminal → The Taller governed workflow demonstration',
    audience: 'cultural creators, community partners, brands, and app builders',
    call_to_action: 'See what respectful cultural intelligence requires',
    conversion_goal: 'Design-partner conversations',
  },
  {
    product_universe: 'HIC / Empire Auto Cofounder',
    audited_subject: 'agent actions',
    total_examined: 'Every proposed action',
    survivors: 'Only approved evidence-backed actions',
    proof_basis: 'approval state, preflight, sealed manifest, Hermes intake, execution boundary, receipt, and audit status',
    proof_reference: 'Phase 13 approval-to-receipt chain with execution-disabled truth preserved',
    audience: 'founders, AI operators, governance teams, and enterprise buyers',
    call_to_action: 'Inspect the authorization chain',
    conversion_goal: 'Governance architecture conversations',
  },
  {
    product_universe: 'Southern Lifestyle',
    audited_subject: 'tenant experiences running on Empire-1 infrastructure',
    total_examined: 'Every customer-facing route',
    survivors: 'Only live or honestly labeled experiences',
    proof_basis: 'tenant boundaries, routes, feature state, live activity, and customer-facing workflow evidence',
    proof_reference: 'Southern Lifestyle and Arcade tenant map',
    audience: 'community members, operators, partners, and sponsors',
    call_to_action: 'Join the experience feedback list',
    conversion_goal: 'Community waitlist signups',
  },
  {
    product_universe: 'Founding 8 Youth Tech',
    audited_subject: 'youth technology and creative projects',
    total_examined: '8 founding participants',
    survivors: '8 creator-owned learning paths',
    proof_basis: 'completed projects, learned tools, safe consent-based demos, and creator-owned portfolios',
    proof_reference: 'Founding 8 program design and participant project receipts',
    audience: 'families, schools, mentors, sponsors, and San Bernardino community partners',
    call_to_action: 'Become a founding community partner',
    conversion_goal: 'Sponsor and partner inquiries',
  },
];

type ScoreKey = 'proofStrength' | 'audienceRelevance' | 'originality' | 'conversionPotential' | 'universeAlignment';

const SCORE_LABELS: Array<{ key: ScoreKey; label: string }> = [
  { key: 'proofStrength', label: 'Proof strength' },
  { key: 'audienceRelevance', label: 'Audience relevance' },
  { key: 'originality', label: 'Originality' },
  { key: 'conversionPotential', label: 'Conversion potential' },
  { key: 'universeAlignment', label: 'Universe alignment' },
];

const emptyDashboard: Dashboard = {
  workflow: WORKFLOW,
  counts: { signals: 0, packs: 0, publish_ready: 0, founder_approved: 0, published: 0, learning_notes: 0 },
  totals: { reach: 0, saves: 0, qualified_comments: 0, profile_visits: 0, direct_messages: 0, applications: 0, meetings: 0, attributed_revenue: 0 },
  conversion_rate_percent: 0,
  recent_signals: [],
  recent_packs: [],
  recent_learnings: [],
  next_actions: [],
};

export default function ViralContentEngine() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [productUniverse, setProductUniverse] = useState(PRESETS[0].product_universe);
  const [auditedSubject, setAuditedSubject] = useState(PRESETS[0].audited_subject);
  const [totalExamined, setTotalExamined] = useState(PRESETS[0].total_examined);
  const [survivors, setSurvivors] = useState(PRESETS[0].survivors);
  const [proofBasis, setProofBasis] = useState(PRESETS[0].proof_basis);
  const [proofReference, setProofReference] = useState(PRESETS[0].proof_reference);
  const [audience, setAudience] = useState(PRESETS[0].audience);
  const [objective, setObjective] = useState('Turn verified product activity into authority, qualified conversations, adoption, and measurable revenue');
  const [callToAction, setCallToAction] = useState(PRESETS[0].call_to_action);
  const [conversionGoal, setConversionGoal] = useState(PRESETS[0].conversion_goal);
  const [channels, setChannels] = useState<ViralChannel[]>(CHANNELS.map(channel => channel.id));
  const [storyPattern, setStoryPattern] = useState<StoryPattern>('audit_to_verdict');
  const [evidenceClassification, setEvidenceClassification] = useState<EvidenceClassification>('empire_proof');
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourcePublisher, setSourcePublisher] = useState('');
  const [sourceDate, setSourceDate] = useState('');
  const [extractedSignal, setExtractedSignal] = useState('');
  const [founderPerspective, setFounderPerspective] = useState('');
  const [scores, setScores] = useState<Record<ScoreKey, number>>({
    proofStrength: 80,
    audienceRelevance: 80,
    originality: 78,
    conversionPotential: 75,
    universeAlignment: 95,
  });

  const [pack, setPack] = useState<ViralPack | null>(null);
  const [history, setHistory] = useState<ViralPack[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard>(emptyDashboard);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState('');

  const [signalForm, setSignalForm] = useState({
    title: '',
    source_url: '',
    publisher: '',
    published_date: '',
    category: 'emerging_technology',
    extracted_signal: '',
    founder_angle: '',
    product_universe: 'Empire-1',
    evidence_classification: 'external_signal' as EvidenceClassification,
  });

  const [metricForm, setMetricForm] = useState({
    content_pack_id: '',
    product_universe: 'Empire-1',
    channel: 'linkedin',
    hook: '',
    format: 'Founder verdict post',
    proof_asset: '',
    audience: '',
    reach: '0',
    saves: '0',
    qualified_comments: '0',
    profile_visits: '0',
    direct_messages: '0',
    applications: '0',
    meetings: '0',
    attributed_revenue: '0',
  });

  const [learningForm, setLearningForm] = useState({
    product_universe: 'Empire-1',
    content_pack_id: '',
    note_type: 'audience_objection',
    observation: '',
    recommendation: '',
    action: 'adapt',
  });

  useEffect(() => {
    void loadAllData();
  }, []);

  const canGenerate = useMemo(
    () => Boolean(auditedSubject.trim() && totalExamined.trim() && survivors.trim() && proofBasis.trim() && productUniverse.trim()),
    [auditedSubject, totalExamined, survivors, proofBasis, productUniverse],
  );

  const localScore = useMemo(
    () => Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length),
    [scores],
  );

  const localBlockers = useMemo(() => {
    const blockers: string[] = [];
    if (evidenceClassification === 'unverified_claim') blockers.push('Unverified claims cannot become publish-ready.');
    if (scores.proofStrength < 70) blockers.push('Performance claims require proof strength of at least 70.');
    if (evidenceClassification === 'empire_proof' && !proofReference.trim()) blockers.push('Empire Proof needs a receipt, test, artifact, metric, screenshot, deployment, or source reference.');
    if (scores.universeAlignment < 70) blockers.push('Universe alignment must be at least 70.');
    return blockers;
  }, [evidenceClassification, proofReference, scores]);

  async function loadAllData() {
    setDataLoading(true);
    setError('');
    try {
      const [historyResponse, dashboardResponse, signalsResponse, metricsResponse, learningResponse] = await Promise.all([
        fetch('/api/gtm/viral-audit-packs'),
        fetch('/api/gtm/content-growth/dashboard'),
        fetch('/api/gtm/content-growth/signals'),
        fetch('/api/gtm/content-growth/metrics'),
        fetch('/api/gtm/content-growth/learnings'),
      ]);
      const [historyData, dashboardData, signalsData, metricsData, learningData] = await Promise.all([
        historyResponse.json(),
        dashboardResponse.json(),
        signalsResponse.json(),
        metricsResponse.json(),
        learningResponse.json(),
      ]);
      if (historyResponse.ok && historyData.success) setHistory(historyData.packs || []);
      if (dashboardResponse.ok && dashboardData.success) setDashboard(dashboardData.dashboard || emptyDashboard);
      if (signalsResponse.ok && signalsData.success) setSignals(signalsData.signals || []);
      if (metricsResponse.ok && metricsData.success) setMetrics(metricsData.metrics || []);
      if (learningResponse.ok && learningData.success) setLearnings(learningData.learnings || []);
    } catch (loadError) {
      console.error('Content growth data load error:', loadError);
      setError('The growth engine could not load all persisted data. Existing creation tools remain available.');
    } finally {
      setDataLoading(false);
    }
  }

  function applyPreset(preset: Preset) {
    setProductUniverse(preset.product_universe);
    setAuditedSubject(preset.audited_subject);
    setTotalExamined(preset.total_examined);
    setSurvivors(preset.survivors);
    setProofBasis(preset.proof_basis);
    setProofReference(preset.proof_reference);
    setAudience(preset.audience);
    setCallToAction(preset.call_to_action);
    setConversionGoal(preset.conversion_goal);
    setEvidenceClassification('empire_proof');
    setPack(null);
    setError('');
    setNotice(`${preset.product_universe} proof lane loaded.`);
  }

  function toggleChannel(channel: ViralChannel) {
    setChannels(current => current.includes(channel)
      ? current.filter(item => item !== channel)
      : [...current, channel]);
  }

  async function generatePack() {
    if (!canGenerate) return;
    setLoading(true);
    setError('');
    setNotice('');
    setCopied('');

    try {
      const response = await fetch('/api/gtm/viral-audit-packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_universe: productUniverse,
          audited_subject: auditedSubject,
          total_examined: totalExamined,
          survivors,
          proof_basis: proofBasis,
          proof_reference: proofReference || null,
          audience,
          objective,
          call_to_action: callToAction,
          conversion_goal: conversionGoal,
          channels,
          story_pattern: storyPattern,
          evidence_classification: evidenceClassification,
          source_title: sourceTitle || null,
          source_url: sourceUrl || null,
          source_publisher: sourcePublisher || null,
          source_date: sourceDate || null,
          extracted_signal: extractedSignal || null,
          founder_perspective: founderPerspective || null,
          proof_strength: scores.proofStrength,
          audience_relevance: scores.audienceRelevance,
          originality: scores.originality,
          conversion_potential: scores.conversionPotential,
          universe_alignment: scores.universeAlignment,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.detail || 'The engine could not generate this pack.');
      setPack(data.pack);
      setHistory(current => [data.pack, ...current.filter(item => item.id !== data.pack.id)].slice(0, 50));
      setActiveTab('create');
      setNotice(data.pack.scoring?.publish_ready
        ? 'Pack generated. Proof gates passed; founder approval is still required before external action.'
        : 'Pack generated and preserved in proof review. Resolve blockers before approval.');
      void refreshDashboard();
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : 'The content growth engine failed to generate a pack.');
    } finally {
      setLoading(false);
    }
  }

  async function refreshDashboard() {
    try {
      const response = await fetch('/api/gtm/content-growth/dashboard');
      const data = await response.json();
      if (response.ok && data.success) setDashboard(data.dashboard || emptyDashboard);
    } catch (refreshError) {
      console.error('Dashboard refresh failed:', refreshError);
    }
  }

  async function saveSignal() {
    setError('');
    setNotice('');
    if (!signalForm.title.trim() || !signalForm.extracted_signal.trim()) {
      setError('Signal title and extracted signal are required.');
      return;
    }
    try {
      const response = await fetch('/api/gtm/content-growth/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signalForm),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.detail || 'Signal could not be saved.');
      setSignals(current => [data.signal, ...current]);
      setSignalForm(current => ({ ...current, title: '', source_url: '', publisher: '', published_date: '', extracted_signal: '', founder_angle: '' }));
      setNotice('Signal saved to the discover lane.');
      void refreshDashboard();
    } catch (signalError) {
      setError(signalError instanceof Error ? signalError.message : 'Signal could not be saved.');
    }
  }

  function loadSignalIntoBuilder(signal: Signal) {
    setProductUniverse(signal.product_universe);
    setStoryPattern('signal_to_position');
    setEvidenceClassification(signal.evidence_classification);
    setSourceTitle(signal.title);
    setSourceUrl(signal.source_url || '');
    setSourcePublisher(signal.publisher || '');
    setSourceDate(signal.published_date || '');
    setExtractedSignal(signal.extracted_signal);
    setFounderPerspective(signal.founder_angle || '');
    setAuditedSubject(signal.category.replaceAll('_', ' '));
    setTotalExamined('1 verified signal');
    setSurvivors('1 actionable position');
    setProofBasis(signal.evidence_classification === 'external_signal' ? 'a named source plus a clearly separated founder interpretation' : 'the attached Empire-1 proof reference');
    setProofReference(signal.source_url || signal.title);
    setActiveTab('create');
    setNotice('Signal loaded into the story builder.');
  }

  async function saveMetric() {
    setError('');
    setNotice('');
    try {
      const numericKeys = ['reach', 'saves', 'qualified_comments', 'profile_visits', 'direct_messages', 'applications', 'meetings', 'attributed_revenue'] as const;
      const payload: Record<string, string | number | null> = { ...metricForm };
      numericKeys.forEach(key => { payload[key] = Number(metricForm[key]) || 0; });
      payload.content_pack_id = metricForm.content_pack_id || null;
      const response = await fetch('/api/gtm/content-growth/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.detail || 'Metric record could not be saved.');
      setMetrics(current => [data.metric, ...current]);
      setMetricForm(current => ({ ...current, hook: '', proof_asset: '', reach: '0', saves: '0', qualified_comments: '0', profile_visits: '0', direct_messages: '0', applications: '0', meetings: '0', attributed_revenue: '0' }));
      setNotice('Performance record saved. The learning loop now has evidence.');
      void refreshDashboard();
    } catch (metricError) {
      setError(metricError instanceof Error ? metricError.message : 'Metric record could not be saved.');
    }
  }

  async function saveLearning() {
    setError('');
    setNotice('');
    if (!learningForm.observation.trim() || !learningForm.recommendation.trim()) {
      setError('Observation and recommendation are required.');
      return;
    }
    try {
      const response = await fetch('/api/gtm/content-growth/learnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...learningForm, content_pack_id: learningForm.content_pack_id || null }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.detail || 'Learning note could not be saved.');
      setLearnings(current => [data.learning, ...current]);
      setLearningForm(current => ({ ...current, observation: '', recommendation: '' }));
      setNotice('Learning preserved. Nothing was deleted or overwritten.');
      void refreshDashboard();
    } catch (learningError) {
      setError(learningError instanceof Error ? learningError.message : 'Learning note could not be saved.');
    }
  }

  async function updatePackStatus(nextStatus: string) {
    if (!pack) return;
    setError('');
    setNotice('');
    try {
      const requiresFounderApproval = ['approved', 'scheduled', 'published'].includes(nextStatus);
      const response = await fetch(`/api/gtm/viral-audit-packs/${pack.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          founder_approved: requiresFounderApproval,
          approval_note: requiresFounderApproval ? 'Founder-approved from the Content Growth Engine control surface.' : null,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.detail || 'Pack status could not be updated.');
      setPack(data.pack);
      setHistory(current => current.map(item => item.id === data.pack.id ? data.pack : item));
      setNotice(`Pack moved to ${nextStatus}. No external publishing action was performed.`);
      void refreshDashboard();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Pack status could not be updated.');
    }
  }

  async function copyText(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1800);
    } catch {
      setCopied('Copy unavailable');
    }
  }

  const fullPackText = pack ? [
    pack.headline,
    pack.subheadline,
    '',
    pack.content_assets.linkedin_post,
    '',
    'HOOKS',
    ...(pack.content_assets.hooks || []),
    '',
    'SHORT POSTS',
    ...(pack.content_assets.short_posts || []),
    '',
    'CAROUSEL',
    ...pack.content_assets.carousel.map(slide => `${slide.slide}. ${slide.copy}`),
    '',
    'SHORT VIDEO',
    ...pack.content_assets.short_video.map(beat => `${beat.seconds} — ${beat.beat}: ${beat.copy}`),
    '',
    'DISTRIBUTION',
    ...(pack.distribution_plan || []).map(day => `Day ${day.day} — ${day.stage}: ${day.action}`),
    '',
    'PROOF CHECKLIST',
    ...pack.proof_checklist.map(item => `- ${item}`),
  ].join('\n') : '';

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-7 lg:px-10">
        <header className="overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 shadow-2xl">
          <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1.2fr_0.8fr] xl:p-10">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">Empire-1 Content Growth Engine</p>
              <h1 className="max-w-5xl text-3xl font-black leading-[0.95] sm:text-5xl lg:text-6xl">Turn every real build into compounding growth.</h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
                The original Viral Content Engine is preserved inside a governed system for signals, evidence, content packs, distribution, conversion, analytics, and reusable learning.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <StatusPill label="WE EVOLVE. NEVER DELETE." tone="amber" />
                <StatusPill label="Founder approval required" tone="zinc" />
                <StatusPill label="Provider-neutral" tone="zinc" />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/60 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Operating loop</p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">
                {(dashboard.workflow.length ? dashboard.workflow : WORKFLOW).map((stage, index) => (
                  <div key={stage} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <span className="text-[10px] font-black text-amber-300">0{index + 1}</span>
                    <span className="ml-2 text-xs font-bold tracking-wide text-zinc-200">{stage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-white/10 bg-black/60 px-4 py-3 sm:px-7">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition ${activeTab === tab.id ? 'bg-amber-300 text-black' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {(error || notice) && (
          <div className="mt-5 space-y-2">
            {error && <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
            {notice && <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</div>}
          </div>
        )}

        <main className="mt-6">
          {activeTab === 'overview' && (
            <Overview dashboard={dashboard} dataLoading={dataLoading} onOpenCreate={() => setActiveTab('create')} onRefresh={loadAllData} />
          )}

          {activeTab === 'create' && (
            <div className="grid gap-6 2xl:grid-cols-[0.82fr_1.18fr]">
              <section className="space-y-5">
                <Panel title="Protected universe lanes" eyebrow="Never flatten">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {PRESETS.map(preset => (
                      <button
                        key={preset.product_universe}
                        onClick={() => applyPreset(preset)}
                        className={`rounded-xl border px-3 py-3 text-left text-sm transition ${productUniverse === preset.product_universe ? 'border-amber-300/70 bg-amber-300/10 text-amber-100' : 'border-white/10 bg-black text-zinc-300 hover:border-white/25'}`}
                      >
                        <span className="block font-semibold">{preset.product_universe}</span>
                        <span className="mt-1 block text-xs text-zinc-500">Load proof lane</span>
                      </button>
                    ))}
                  </div>
                </Panel>

                <Panel title="Story builder" eyebrow="Create">
                  <div className="grid gap-4">
                    <Field label="Product universe">
                      <Select value={productUniverse} onChange={setProductUniverse} options={UNIVERSES} />
                    </Field>
                    <Field label="Story pattern">
                      <select value={storyPattern} onChange={event => setStoryPattern(event.target.value as StoryPattern)} className={inputClass}>
                        {STORY_PATTERNS.map(pattern => <option key={pattern.id} value={pattern.id}>{pattern.label} — {pattern.formula}</option>)}
                      </select>
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Total examined"><input value={totalExamined} onChange={event => setTotalExamined(event.target.value)} className={inputClass} /></Field>
                      <Field label="Survivors / result"><input value={survivors} onChange={event => setSurvivors(event.target.value)} className={inputClass} /></Field>
                    </div>
                    <Field label="What was examined?"><input value={auditedSubject} onChange={event => setAuditedSubject(event.target.value)} className={inputClass} /></Field>
                    <Field label="What proof decided survival?"><textarea value={proofBasis} onChange={event => setProofBasis(event.target.value)} rows={3} className={inputClass} /></Field>
                    <Field label="Proof reference"><textarea value={proofReference} onChange={event => setProofReference(event.target.value)} rows={2} placeholder="Commit, test, receipt, screenshot, metric, deployment, customer result, or source" className={inputClass} /></Field>
                    <Field label="Audience"><input value={audience} onChange={event => setAudience(event.target.value)} className={inputClass} /></Field>
                    <Field label="Growth objective"><textarea value={objective} onChange={event => setObjective(event.target.value)} rows={2} className={inputClass} /></Field>
                    <Field label="Conversion goal"><input value={conversionGoal} onChange={event => setConversionGoal(event.target.value)} className={inputClass} /></Field>
                    <Field label="Call to action"><input value={callToAction} onChange={event => setCallToAction(event.target.value)} className={inputClass} /></Field>
                  </div>
                </Panel>

                <Panel title="Evidence classification" eyebrow="Verify">
                  <div className="space-y-2">
                    {EVIDENCE_OPTIONS.map(option => (
                      <button
                        key={option.id}
                        onClick={() => setEvidenceClassification(option.id)}
                        className={`w-full rounded-xl border p-3 text-left ${evidenceClassification === option.id ? 'border-amber-300/60 bg-amber-300/10' : 'border-white/10 bg-black'}`}
                      >
                        <span className="block text-sm font-bold text-zinc-100">{option.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-zinc-500">{option.detail}</span>
                      </button>
                    ))}
                  </div>
                  {(evidenceClassification === 'external_signal' || storyPattern === 'signal_to_position') && (
                    <div className="mt-5 grid gap-4 border-t border-white/10 pt-5">
                      <Field label="Source title"><input value={sourceTitle} onChange={event => setSourceTitle(event.target.value)} className={inputClass} /></Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Publisher"><input value={sourcePublisher} onChange={event => setSourcePublisher(event.target.value)} className={inputClass} /></Field>
                        <Field label="Source date"><input type="date" value={sourceDate} onChange={event => setSourceDate(event.target.value)} className={inputClass} /></Field>
                      </div>
                      <Field label="Source URL"><input value={sourceUrl} onChange={event => setSourceUrl(event.target.value)} className={inputClass} /></Field>
                      <Field label="Extracted signal"><textarea value={extractedSignal} onChange={event => setExtractedSignal(event.target.value)} rows={3} className={inputClass} /></Field>
                      <Field label="Founder perspective"><textarea value={founderPerspective} onChange={event => setFounderPerspective(event.target.value)} rows={3} className={inputClass} /></Field>
                    </div>
                  )}
                </Panel>

                <Panel title="Content scoring" eyebrow="Publish gate">
                  <div className="space-y-4">
                    {SCORE_LABELS.map(item => (
                      <label key={item.key} className="block">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-zinc-300">{item.label}</span>
                          <span className="font-black text-amber-200">{scores[item.key]}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={scores[item.key]}
                          onChange={event => setScores(current => ({ ...current, [item.key]: Number(event.target.value) }))}
                          className="w-full accent-amber-300"
                        />
                      </label>
                    ))}
                  </div>
                  <div className="mt-5 rounded-xl border border-white/10 bg-black p-4">
                    <div className="flex items-end justify-between">
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Overall</span>
                      <span className="text-4xl font-black">{localScore}</span>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-zinc-500">
                      {localBlockers.length ? localBlockers.map(blocker => <p key={blocker} className="text-red-300">• {blocker}</p>) : <p className="text-emerald-300">Proof gates pass. Founder approval remains required.</p>}
                    </div>
                  </div>
                </Panel>

                <Panel title="Content pack" eyebrow="Formats">
                  <div className="flex flex-wrap gap-2">
                    {CHANNELS.map(channel => (
                      <button
                        key={channel.id}
                        onClick={() => toggleChannel(channel.id)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${channels.includes(channel.id) ? 'border-amber-300/60 bg-amber-300/10 text-amber-100' : 'border-white/10 text-zinc-500'}`}
                      >
                        {channel.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={generatePack}
                    disabled={!canGenerate || loading}
                    className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? 'Building governed growth pack…' : 'Generate Content Growth Pack'}
                  </button>
                </Panel>
              </section>

              <section>
                {!pack ? (
                  <div className="sticky top-6 flex min-h-[720px] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-zinc-950/70 p-8 text-center">
                    <div className="max-w-lg">
                      <div className="text-6xl">✦</div>
                      <h2 className="mt-5 text-3xl font-black">Evidence first. Growth second.</h2>
                      <p className="mt-3 text-sm leading-7 text-zinc-500">Load a protected universe, attach the proof, choose one measurable conversion goal, and generate the full five-day content system.</p>
                    </div>
                  </div>
                ) : (
                  <PackOutput pack={pack} copied={copied} fullPackText={fullPackText} onCopy={copyText} onStatus={updatePackStatus} />
                )}
              </section>
            </div>
          )}

          {activeTab === 'signals' && (
            <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
              <Panel title="Signal intake" eyebrow="Discover">
                <div className="grid gap-4">
                  <Field label="Signal title"><input value={signalForm.title} onChange={event => setSignalForm(current => ({ ...current, title: event.target.value }))} className={inputClass} /></Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Universe"><Select value={signalForm.product_universe} onChange={value => setSignalForm(current => ({ ...current, product_universe: value }))} options={UNIVERSES} /></Field>
                    <Field label="Category">
                      <select value={signalForm.category} onChange={event => setSignalForm(current => ({ ...current, category: event.target.value }))} className={inputClass}>
                        <option value="emerging_technology">Emerging technology</option>
                        <option value="ai_infrastructure">AI infrastructure</option>
                        <option value="creator_economy">Creator economy</option>
                        <option value="investor_signal">Investor signal</option>
                        <option value="youth_technology">Youth technology</option>
                        <option value="cultural_technology">Cultural technology</option>
                        <option value="market_opportunity">Market opportunity</option>
                      </select>
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Publisher"><input value={signalForm.publisher} onChange={event => setSignalForm(current => ({ ...current, publisher: event.target.value }))} className={inputClass} /></Field>
                    <Field label="Published date"><input type="date" value={signalForm.published_date} onChange={event => setSignalForm(current => ({ ...current, published_date: event.target.value }))} className={inputClass} /></Field>
                  </div>
                  <Field label="Source URL"><input value={signalForm.source_url} onChange={event => setSignalForm(current => ({ ...current, source_url: event.target.value }))} className={inputClass} /></Field>
                  <Field label="Extracted signal"><textarea value={signalForm.extracted_signal} onChange={event => setSignalForm(current => ({ ...current, extracted_signal: event.target.value }))} rows={4} placeholder="Capture the framework, market movement, or opportunity. Do not copy the article." className={inputClass} /></Field>
                  <Field label="Founder angle"><textarea value={signalForm.founder_angle} onChange={event => setSignalForm(current => ({ ...current, founder_angle: event.target.value }))} rows={3} className={inputClass} /></Field>
                  <button onClick={saveSignal} className="rounded-xl bg-white px-4 py-3 text-sm font-black text-black hover:bg-amber-200">Save signal</button>
                </div>
              </Panel>
              <Panel title="Signal library" eyebrow={`${signals.length} preserved`}>
                <div className="space-y-3">
                  {signals.length === 0 ? <EmptyState copy="No signals saved yet." /> : signals.map(signal => (
                    <div key={signal.id} className="rounded-xl border border-white/10 bg-black p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2">
                          <StatusPill label={signal.product_universe} tone="amber" />
                          <StatusPill label={signal.evidence_classification.replaceAll('_', ' ')} tone="zinc" />
                        </div>
                        <button onClick={() => loadSignalIntoBuilder(signal)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:border-amber-300/40 hover:text-amber-200">Build story</button>
                      </div>
                      <h3 className="mt-4 text-lg font-black">{signal.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">{signal.extracted_signal}</p>
                      {signal.founder_angle && <p className="mt-3 border-l-2 border-amber-300 pl-3 text-sm text-zinc-300">Founder angle: {signal.founder_angle}</p>}
                      <p className="mt-3 text-xs text-zinc-600">{signal.publisher || 'Source not named'} · {signal.category.replaceAll('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Reach" value={formatNumber(dashboard.totals.reach)} />
                <MetricCard label="Qualified actions" value={formatNumber(dashboard.totals.direct_messages + dashboard.totals.applications + dashboard.totals.meetings)} />
                <MetricCard label="Content conversion" value={`${dashboard.conversion_rate_percent}%`} />
                <MetricCard label="Revenue influenced" value={formatMoney(dashboard.totals.attributed_revenue)} />
              </div>
              <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                <Panel title="Record performance" eyebrow="Convert">
                  <div className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Universe"><Select value={metricForm.product_universe} onChange={value => setMetricForm(current => ({ ...current, product_universe: value }))} options={UNIVERSES} /></Field>
                      <Field label="Content pack">
                        <select value={metricForm.content_pack_id} onChange={event => setMetricForm(current => ({ ...current, content_pack_id: event.target.value }))} className={inputClass}>
                          <option value="">No linked pack</option>
                          {history.map(item => <option key={item.id} value={item.id}>{item.product_universe} — {item.headline}</option>)}
                        </select>
                      </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Channel"><input value={metricForm.channel} onChange={event => setMetricForm(current => ({ ...current, channel: event.target.value }))} className={inputClass} /></Field>
                      <Field label="Format"><input value={metricForm.format} onChange={event => setMetricForm(current => ({ ...current, format: event.target.value }))} className={inputClass} /></Field>
                    </div>
                    <Field label="Hook"><textarea value={metricForm.hook} onChange={event => setMetricForm(current => ({ ...current, hook: event.target.value }))} rows={2} className={inputClass} /></Field>
                    <Field label="Proof asset"><input value={metricForm.proof_asset} onChange={event => setMetricForm(current => ({ ...current, proof_asset: event.target.value }))} className={inputClass} /></Field>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {(['reach', 'saves', 'qualified_comments', 'profile_visits', 'direct_messages', 'applications', 'meetings'] as const).map(key => (
                        <Field key={key} label={key.replaceAll('_', ' ')}><input type="number" min="0" value={metricForm[key]} onChange={event => setMetricForm(current => ({ ...current, [key]: event.target.value }))} className={inputClass} /></Field>
                      ))}
                      <Field label="Attributed revenue"><input type="number" min="0" step="0.01" value={metricForm.attributed_revenue} onChange={event => setMetricForm(current => ({ ...current, attributed_revenue: event.target.value }))} className={inputClass} /></Field>
                    </div>
                    <button onClick={saveMetric} className="rounded-xl bg-white px-4 py-3 text-sm font-black text-black hover:bg-amber-200">Save performance record</button>
                  </div>
                </Panel>
                <Panel title="Performance history" eyebrow={`${metrics.length} records`}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="text-xs uppercase tracking-[0.14em] text-zinc-600">
                        <tr><th className="pb-3">Universe</th><th className="pb-3">Format</th><th className="pb-3">Reach</th><th className="pb-3">Saves</th><th className="pb-3">Qualified</th><th className="pb-3">Meetings</th><th className="pb-3">Revenue</th></tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {metrics.map(metric => (
                          <tr key={metric.id} className="text-zinc-300">
                            <td className="py-3 pr-4 font-semibold">{metric.product_universe}</td>
                            <td className="py-3 pr-4 text-zinc-500">{metric.format || metric.channel}</td>
                            <td className="py-3 pr-4">{formatNumber(metric.reach)}</td>
                            <td className="py-3 pr-4">{formatNumber(metric.saves)}</td>
                            <td className="py-3 pr-4">{formatNumber(metric.direct_messages + metric.applications)}</td>
                            <td className="py-3 pr-4">{formatNumber(metric.meetings)}</td>
                            <td className="py-3">{formatMoney(metric.attributed_revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {metrics.length === 0 && <EmptyState copy="No content performance has been recorded. Recommendations remain tests, not proven winners." />}
                  </div>
                </Panel>
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
              <Panel title="Capture a learning" eyebrow="Learn → Reuse">
                <div className="grid gap-4">
                  <Field label="Universe"><Select value={learningForm.product_universe} onChange={value => setLearningForm(current => ({ ...current, product_universe: value }))} options={UNIVERSES} /></Field>
                  <Field label="Linked content pack">
                    <select value={learningForm.content_pack_id} onChange={event => setLearningForm(current => ({ ...current, content_pack_id: event.target.value }))} className={inputClass}>
                      <option value="">No linked pack</option>
                      {history.map(item => <option key={item.id} value={item.id}>{item.product_universe} — {item.headline}</option>)}
                    </select>
                  </Field>
                  <Field label="Learning type">
                    <select value={learningForm.note_type} onChange={event => setLearningForm(current => ({ ...current, note_type: event.target.value }))} className={inputClass}>
                      <option value="audience_objection">Audience objection</option>
                      <option value="winning_hook">Winning hook</option>
                      <option value="failed_angle">Failed angle</option>
                      <option value="conversion_insight">Conversion insight</option>
                      <option value="proof_asset">Reusable proof asset</option>
                    </select>
                  </Field>
                  <Field label="What happened?"><textarea value={learningForm.observation} onChange={event => setLearningForm(current => ({ ...current, observation: event.target.value }))} rows={4} className={inputClass} /></Field>
                  <Field label="What should change next?"><textarea value={learningForm.recommendation} onChange={event => setLearningForm(current => ({ ...current, recommendation: event.target.value }))} rows={4} className={inputClass} /></Field>
                  <Field label="Reuse action">
                    <select value={learningForm.action} onChange={event => setLearningForm(current => ({ ...current, action: event.target.value }))} className={inputClass}>
                      <option value="repeat">Repeat</option>
                      <option value="improve">Improve</option>
                      <option value="adapt">Adapt</option>
                      <option value="retire">Retire without deleting</option>
                    </select>
                  </Field>
                  <button onClick={saveLearning} className="rounded-xl bg-white px-4 py-3 text-sm font-black text-black hover:bg-amber-200">Preserve learning</button>
                </div>
              </Panel>
              <Panel title="Learning library" eyebrow="Historical memory">
                <div className="space-y-3">
                  {learnings.length === 0 ? <EmptyState copy="No learning notes yet. Publish carefully, record the response, and feed the result back into the engine." /> : learnings.map(learning => (
                    <div key={learning.id} className="rounded-xl border border-white/10 bg-black p-4">
                      <div className="flex flex-wrap gap-2"><StatusPill label={learning.product_universe} tone="amber" /><StatusPill label={learning.note_type.replaceAll('_', ' ')} tone="zinc" /><StatusPill label={learning.action} tone="zinc" /></div>
                      <p className="mt-4 text-sm font-semibold leading-6 text-zinc-200">{learning.observation}</p>
                      <p className="mt-2 text-sm leading-6 text-zinc-500">Next: {learning.recommendation}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {activeTab === 'history' && (
            <Panel title="Content growth history" eyebrow="WE EVOLVE. NEVER DELETE.">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {history.length === 0 ? <EmptyState copy="No packs yet." /> : history.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setPack(item); setActiveTab('create'); }}
                    className="rounded-xl border border-white/10 bg-black p-4 text-left transition hover:border-amber-300/40"
                  >
                    <div className="flex flex-wrap gap-2"><StatusPill label={item.product_universe} tone="amber" /><StatusPill label={item.status} tone="zinc" /></div>
                    <p className="mt-4 text-lg font-black leading-6 text-zinc-100">{item.headline}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-zinc-600">
                      <span>{item.id}</span>
                      <span>{item.scoring?.overall_score ?? 'Legacy'} score</span>
                    </div>
                  </button>
                ))}
              </div>
            </Panel>
          )}
        </main>
      </div>
    </div>
  );
}

function Overview({ dashboard, dataLoading, onOpenCreate, onRefresh }: { dashboard: Dashboard; dataLoading: boolean; onOpenCreate: () => void; onRefresh: () => void }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Signals" value={formatNumber(dashboard.counts.signals)} />
        <MetricCard label="Growth packs" value={formatNumber(dashboard.counts.packs)} />
        <MetricCard label="Publish-ready" value={formatNumber(dashboard.counts.publish_ready)} />
        <MetricCard label="Founder-approved" value={formatNumber(dashboard.counts.founder_approved)} />
        <MetricCard label="Published" value={formatNumber(dashboard.counts.published)} />
        <MetricCard label="Learning notes" value={formatNumber(dashboard.counts.learning_notes)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Growth command board" eyebrow="Current operating truth" action={<button onClick={onRefresh} className="text-xs font-bold text-amber-200">Refresh</button>}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Reach" value={formatNumber(dashboard.totals.reach)} compact />
            <MetricCard label="Meetings" value={formatNumber(dashboard.totals.meetings)} compact />
            <MetricCard label="Conversion rate" value={`${dashboard.conversion_rate_percent}%`} compact />
            <MetricCard label="Revenue influenced" value={formatMoney(dashboard.totals.attributed_revenue)} compact />
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-black p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">Next recommended actions</p>
            <div className="mt-4 space-y-3">
              {(dashboard.next_actions.length ? dashboard.next_actions : [
                'Convert one verified Lyrica 3 or Archisynapse proof into a founder authority post.',
                'Attach a specific proof reference to every performance claim.',
                'Choose one conversion target before scheduling the five-day sequence.',
                'Record audience objections and performance after publication.',
              ]).map((action, index) => (
                <div key={action} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <span className="text-xs font-black text-amber-300">0{index + 1}</span>
                  <span className="text-sm leading-6 text-zinc-300">{action}</span>
                </div>
              ))}
            </div>
            <button onClick={onOpenCreate} className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-black hover:bg-amber-200">Build next proof-backed pack</button>
          </div>
        </Panel>

        <Panel title="Operating boundaries" eyebrow="Trust system">
          <div className="space-y-3">
            <Boundary title="One protected universe" copy="Every piece belongs to Empire-1, Lyrica 3, Archisynapse, Cultura Vibe Forge, HIC / Cofounder, Southern Lifestyle, or Founding 8 Youth Tech." />
            <Boundary title="Evidence classification" copy="External Signal, Empire Proof, Founder Perspective, and Unverified Claim never blur into one another." />
            <Boundary title="Founder approval" copy="Approval can advance a pack’s internal status. The engine never publishes, emails, or sends direct messages automatically." />
            <Boundary title="Historical memory" copy="Packs, metrics, objections, winning hooks, and failed angles stay preserved for reuse." />
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Recent signals" eyebrow={dataLoading ? 'Loading' : `${dashboard.recent_signals.length} shown`}>
          <MiniList items={dashboard.recent_signals.map(signal => ({ label: signal.product_universe, title: signal.title }))} empty="No signals saved." />
        </Panel>
        <Panel title="Recent packs" eyebrow={dataLoading ? 'Loading' : `${dashboard.recent_packs.length} shown`}>
          <MiniList items={dashboard.recent_packs.map(item => ({ label: item.status, title: item.headline }))} empty="No growth packs generated." />
        </Panel>
        <Panel title="Recent learning" eyebrow={dataLoading ? 'Loading' : `${dashboard.recent_learnings.length} shown`}>
          <MiniList items={dashboard.recent_learnings.map(item => ({ label: item.product_universe, title: item.observation }))} empty="No learning notes preserved." />
        </Panel>
      </div>
    </div>
  );
}

function PackOutput({ pack, copied, fullPackText, onCopy, onStatus }: { pack: ViralPack; copied: string; fullPackText: string; onCopy: (label: string, text: string) => void; onStatus: (status: string) => void }) {
  const hooks = pack.content_assets.hooks || [];
  const shortPosts = pack.content_assets.short_posts || [];
  const blockers = pack.scoring?.blockers || [];
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
        <div className="border-b border-white/10 bg-gradient-to-br from-amber-300/15 via-transparent to-transparent p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2"><StatusPill label={pack.product_universe} tone="amber" /><StatusPill label={pack.status} tone="zinc" />{pack.founder_approved && <StatusPill label="Founder approved" tone="green" />}</div>
            <button onClick={() => onCopy('Full pack copied', fullPackText)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-white/25">Copy full pack</button>
          </div>
          <h2 className="mt-6 text-3xl font-black leading-tight sm:text-5xl">{pack.headline}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-300">{pack.subheadline}</p>
          <p className="mt-5 border-l-2 border-amber-300 pl-4 text-sm font-semibold text-amber-100">{pack.verdict}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MetricCard label="Growth score" value={String(pack.scoring?.overall_score ?? 'Legacy')} compact />
            <MetricCard label="Proof gate" value={pack.scoring?.publish_ready ? 'PASS' : 'REVIEW'} compact />
            <MetricCard label="Conversion" value={pack.conversion_goal || 'Qualified conversations'} compact />
          </div>
          {copied && <p className="mt-3 text-xs font-semibold text-emerald-300">{copied}</p>}
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-3">
          <button onClick={() => onStatus('proof_review')} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 hover:border-white/25">Move to proof review</button>
          <button onClick={() => onStatus('approved')} className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-300/15">Founder approve</button>
          <button onClick={() => onStatus('published')} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 hover:border-white/25">Mark published manually</button>
        </div>
      </div>

      {blockers.length > 0 && (
        <AssetCard title="Publish blockers">
          <div className="space-y-2">{blockers.map(blocker => <p key={blocker} className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">{blocker}</p>)}</div>
        </AssetCard>
      )}

      {hooks.length > 0 && <AssetCard title="Five hooks" onCopy={() => onCopy('Hooks copied', hooks.join('\n'))}><div className="space-y-2">{hooks.map((hook, index) => <p key={hook} className="rounded-xl border border-white/10 bg-black p-3 text-sm font-semibold leading-6 text-zinc-200"><span className="mr-2 text-amber-300">0{index + 1}</span>{hook}</p>)}</div></AssetCard>}

      {pack.channels.includes('linkedin') && <AssetCard title="LinkedIn authority post" onCopy={() => onCopy('LinkedIn post copied', pack.content_assets.linkedin_post)}><p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">{pack.content_assets.linkedin_post}</p></AssetCard>}

      {shortPosts.length > 0 && <AssetCard title="Three short posts" onCopy={() => onCopy('Short posts copied', shortPosts.join('\n\n'))}><div className="space-y-3">{shortPosts.map(post => <p key={post} className="rounded-xl border border-white/10 bg-black p-4 text-sm leading-7 text-zinc-300">{post}</p>)}</div></AssetCard>}

      {pack.channels.includes('carousel') && (
        <AssetCard title="7-slide carousel" onCopy={() => onCopy('Carousel copied', pack.content_assets.carousel.map(slide => `${slide.slide}. ${slide.copy}`).join('\n'))}>
          <div className="grid gap-3 sm:grid-cols-2">{pack.content_assets.carousel.map(slide => <div key={slide.slide} className="rounded-xl border border-white/10 bg-black p-4"><div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-600"><span>Slide {slide.slide}</span><span>{slide.role}</span></div><p className="mt-3 text-sm font-semibold leading-6 text-zinc-200">{slide.copy}</p></div>)}</div>
        </AssetCard>
      )}

      {pack.channels.includes('short_video') && (
        <AssetCard title="40-second vertical-video script" onCopy={() => onCopy('Video script copied', pack.content_assets.short_video.map(beat => `${beat.seconds} — ${beat.beat}: ${beat.copy}`).join('\n'))}>
          <div className="space-y-2">{pack.content_assets.short_video.map(beat => <div key={`${beat.seconds}-${beat.beat}`} className="grid gap-2 rounded-xl border border-white/10 bg-black p-3 sm:grid-cols-[80px_110px_1fr]"><span className="text-xs font-bold text-amber-200">{beat.seconds}</span><span className="text-xs font-semibold text-zinc-500">{beat.beat}</span><span className="text-sm text-zinc-300">{beat.copy}</span></div>)}</div>
        </AssetCard>
      )}

      {pack.channels.includes('newsletter') && (
        <AssetCard title="Newsletter opening" onCopy={() => onCopy('Newsletter copy copied', [pack.content_assets.newsletter.subject_lines.join('\n'), '', pack.content_assets.newsletter.opening].join('\n'))}>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-600">Subject options</p><div className="mt-3 space-y-2">{pack.content_assets.newsletter.subject_lines.map(subject => <p key={subject} className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-zinc-200">{subject}</p>)}</div><p className="mt-4 text-sm leading-7 text-zinc-300">{pack.content_assets.newsletter.opening}</p>
        </AssetCard>
      )}

      {pack.content_assets.investor_message && <AssetCard title="Investor proof message" onCopy={() => onCopy('Investor message copied', pack.content_assets.investor_message || '')}><p className="text-sm leading-7 text-zinc-300">{pack.content_assets.investor_message}</p></AssetCard>}

      {pack.distribution_plan && (
        <AssetCard title="Five-day distribution sequence">
          <div className="grid gap-3 md:grid-cols-5">{pack.distribution_plan.map(day => <div key={day.day} className="rounded-xl border border-white/10 bg-black p-4"><span className="text-xs font-black text-amber-300">DAY {day.day}</span><h4 className="mt-2 text-sm font-black">{day.stage}</h4><p className="mt-2 text-xs leading-5 text-zinc-500">{day.action}</p><p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-red-300">Approval required</p></div>)}</div>
        </AssetCard>
      )}

      <AssetCard title="Proof-before-publish gate">
        <div className="space-y-2">{pack.proof_checklist.map(item => <label key={item} className="flex gap-3 rounded-xl border border-white/10 bg-black p-3 text-sm text-zinc-300"><input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-black" /><span>{item}</span></label>)}</div>
        <div className="mt-5 border-t border-white/10 pt-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-600">Integrity rules</p><ul className="mt-3 space-y-2 text-sm text-zinc-500">{pack.integrity_rules.map(rule => <li key={rule}>• {rule}</li>)}</ul></div>
      </AssetCard>
    </div>
  );
}

const inputClass = 'w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-300/70';

function Panel({ title, eyebrow, action, children }: { title: string; eyebrow?: string; action?: ReactNode; children: ReactNode }) {
  return <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5 sm:p-6"><div className="mb-5 flex items-start justify-between gap-3"><div>{eyebrow && <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">{eyebrow}</p>}<h2 className="mt-1 text-lg font-black text-zinc-100">{title}</h2></div>{action}</div>{children}</section>;
}

function AssetCard({ title, children, onCopy }: { title: string; children: ReactNode; onCopy?: () => void }) {
  return <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5"><div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-sm font-black uppercase tracking-[0.16em] text-zinc-400">{title}</h3>{onCopy && <button onClick={onCopy} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:border-white/25 hover:text-white">Copy</button>}</div>{children}</div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-1.5 text-sm capitalize text-zinc-300"><span>{label}</span>{children}</label>;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <select value={value} onChange={event => onChange(event.target.value)} className={inputClass}>{options.map(option => <option key={option} value={option}>{option}</option>)}</select>;
}

function MetricCard({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return <div className={`rounded-2xl border border-white/10 bg-zinc-950 ${compact ? 'p-4' : 'p-5'}`}><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">{label}</p><p className={`${compact ? 'mt-2 text-2xl' : 'mt-3 text-3xl'} font-black text-zinc-100`}>{value}</p></div>;
}

function StatusPill({ label, tone }: { label: string; tone: 'amber' | 'zinc' | 'green' }) {
  const styles = tone === 'amber' ? 'border-amber-300/30 bg-amber-300/10 text-amber-200' : tone === 'green' ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200' : 'border-white/10 bg-white/5 text-zinc-400';
  return <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${styles}`}>{label}</span>;
}

function Boundary({ title, copy }: { title: string; copy: string }) {
  return <div className="rounded-xl border border-white/10 bg-black p-4"><h3 className="text-sm font-black text-zinc-100">{title}</h3><p className="mt-2 text-xs leading-5 text-zinc-500">{copy}</p></div>;
}

function MiniList({ items, empty }: { items: Array<{ label: string; title: string }>; empty: string }) {
  if (!items.length) return <EmptyState copy={empty} />;
  return <div className="space-y-2">{items.map((item, index) => <div key={`${item.label}-${item.title}-${index}`} className="rounded-xl border border-white/10 bg-black p-3"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-300">{item.label}</p><p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-zinc-300">{item.title}</p></div>)}</div>;
}

function EmptyState({ copy }: { copy: string }) {
  return <div className="rounded-xl border border-dashed border-white/10 bg-black/50 p-6 text-center text-sm text-zinc-600">{copy}</div>;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value || 0);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value || 0);
}
