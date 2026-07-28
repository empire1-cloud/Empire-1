"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  TriangleAlert,
  Users,
} from "lucide-react";

type Lead = {
  id: string;
  name: string;
  company?: string | null;
  title?: string | null;
  email?: string | null;
  linkedin_url?: string | null;
  source_url?: string | null;
  source_evidence?: string | null;
  source?: string | null;
  pipeline_stage: string;
  lane?: string | null;
  value?: number;
  probability?: number;
  next_action?: string | null;
  next_action_at?: string | null;
  email_verification_status?: string;
  tags?: string[];
};

type Metrics = {
  total_leads: number;
  total_pipeline_value: number;
  weighted_pipeline_value: number;
  due_follow_ups: number;
  verified_receipts: number;
  contradictions: number;
  stage_counts: Record<string, number>;
};

const stages = [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "onboarding",
  "active",
  "at_risk",
  "churned",
];

const stageLabel = (stage: string) =>
  stage
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function safeDate(value?: string | null) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
}

export default function CRMCommandCenter() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [search, setSearch] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    source_url: "",
    source_evidence: "",
  });

  async function loadCRM() {
    setLoading(true);
    setError("");
    try {
      const [pipelineResponse, metricsResponse, followUpResponse] =
        await Promise.all([
          fetch("/api/crm/pipeline", { cache: "no-store" }),
          fetch("/api/crm/metrics", { cache: "no-store" }),
          fetch("/api/crm/follow-ups/due", { cache: "no-store" }),
        ]);

      if (!pipelineResponse.ok || !metricsResponse.ok || !followUpResponse.ok) {
        throw new Error("CRM API is not available.");
      }

      const pipelineData = await pipelineResponse.json();
      const metricsData = await metricsResponse.json();
      const followUpData = await followUpResponse.json();

      setLeads(pipelineData.leads ?? []);
      setMetrics(metricsData.metrics ?? null);
      setFollowUps(followUpData.leads ?? []);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load the CRM command center.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCRM();
  }, []);

  const filteredLeads = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (selectedStage !== "all" && lead.pipeline_stage !== selectedStage) {
        return false;
      }
      if (!needle) return true;
      return [
        lead.name,
        lead.company,
        lead.title,
        lead.email,
        lead.lane,
        lead.source,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [leads, search, selectedStage]);

  async function createLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          company: form.company || null,
          email: form.email || null,
          source: form.source_url ? "public_web" : "other",
          source_url: form.source_url || null,
          source_evidence: form.source_evidence || null,
          lane: "receipts",
          lead_type: "prospect",
          email_verification_status: form.email ? "unverified" : "unknown",
          next_action: "Review prospect and approve outreach",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : data.detail?.message || "Lead could not be created.";
        throw new Error(detail);
      }
      setForm({
        name: "",
        company: "",
        email: "",
        source_url: "",
        source_evidence: "",
      });
      setShowCreate(false);
      await loadCRM();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Lead could not be created.",
      );
    } finally {
      setSaving(false);
    }
  }

  const cards = [
    {
      label: "Grounded leads",
      value: metrics?.total_leads ?? 0,
      detail: "Active CRM records",
      icon: Users,
    },
    {
      label: "Pipeline",
      value: money.format(metrics?.total_pipeline_value ?? 0),
      detail: `${money.format(metrics?.weighted_pipeline_value ?? 0)} weighted`,
      icon: Database,
    },
    {
      label: "Follow-ups due",
      value: metrics?.due_follow_ups ?? 0,
      detail: "Needs founder action",
      icon: Clock3,
    },
    {
      label: "Verified receipts",
      value: metrics?.verified_receipts ?? 0,
      detail: `${metrics?.contradictions ?? 0} contradictions`,
      icon: ShieldCheck,
    },
  ];

  return (
    <main className="min-h-screen bg-[#060606] text-[#f4f1e8]">
      <div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-10">
        <header className="mb-8 flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.32em] text-[#d8b44a]">
              <ShieldCheck className="h-4 w-4" />
              Empire-1 Revenue OS
            </div>
            <h1 className="text-3xl font-light tracking-tight text-white sm:text-5xl">
              Verified CRM Command Center
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/45">
              Grounded prospects, pipeline state, follow-ups, and proof receipts
              in one operating surface. Unverified contacts stay labeled
              unverified.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void loadCRM()}
              className="inline-flex h-11 items-center gap-2 border border-white/10 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/65 transition hover:border-white/25 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowCreate((current) => !current)}
              className="inline-flex h-11 items-center gap-2 bg-[#d8b44a] px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition hover:bg-[#efd06f]"
            >
              <Plus className="h-4 w-4" />
              Add grounded lead
            </button>
          </div>
        </header>

        {error ? (
          <div className="mb-6 flex items-start gap-3 border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {showCreate ? (
          <form
            onSubmit={createLead}
            className="mb-8 border border-[#d8b44a]/25 bg-[#0d0d0d] p-5 lg:p-7"
          >
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d8b44a]">
                New grounded lead
              </p>
              <p className="mt-2 text-xs text-white/40">
                A source URL and evidence note create the first discovery
                receipt. Email addresses begin unverified.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Contact or role"
                className="h-12 border border-white/10 bg-black px-4 text-sm outline-none placeholder:text-white/20 focus:border-[#d8b44a]/60"
              />
              <input
                value={form.company}
                onChange={(event) =>
                  setForm({ ...form, company: event.target.value })
                }
                placeholder="Company"
                className="h-12 border border-white/10 bg-black px-4 text-sm outline-none placeholder:text-white/20 focus:border-[#d8b44a]/60"
              />
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                placeholder="Email (optional)"
                className="h-12 border border-white/10 bg-black px-4 text-sm outline-none placeholder:text-white/20 focus:border-[#d8b44a]/60"
              />
              <input
                type="url"
                value={form.source_url}
                onChange={(event) =>
                  setForm({ ...form, source_url: event.target.value })
                }
                placeholder="Public source URL"
                className="h-12 border border-white/10 bg-black px-4 text-sm outline-none placeholder:text-white/20 focus:border-[#d8b44a]/60"
              />
              <button
                disabled={saving}
                className="inline-flex h-12 items-center justify-center gap-2 bg-white px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Save lead
              </button>
            </div>
            <textarea
              value={form.source_evidence}
              onChange={(event) =>
                setForm({ ...form, source_evidence: event.target.value })
              }
              placeholder="What public signal makes this account relevant?"
              className="mt-4 min-h-24 w-full border border-white/10 bg-black p-4 text-sm outline-none placeholder:text-white/20 focus:border-[#d8b44a]/60"
            />
          </form>
        ) : null}

        <section className="mb-8 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.label} className="bg-[#0a0a0a] p-6">
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/35">
                    {card.label}
                  </span>
                  <Icon className="h-4 w-4 text-[#d8b44a]" />
                </div>
                <p className="text-3xl font-light text-white">{card.value}</p>
                <p className="mt-2 text-xs text-white/30">{card.detail}</p>
              </article>
            );
          })}
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="min-w-0 border border-white/10 bg-[#090909]">
            <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                  Pipeline
                </p>
                <p className="mt-1 text-xs text-white/25">
                  {filteredLeads.length} visible records
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex h-10 items-center gap-2 border border-white/10 bg-black px-3">
                  <Search className="h-4 w-4 text-white/25" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search leads"
                    className="w-full bg-transparent text-xs outline-none placeholder:text-white/20 sm:w-52"
                  />
                </label>
                <select
                  value={selectedStage}
                  onChange={(event) => setSelectedStage(event.target.value)}
                  className="h-10 border border-white/10 bg-black px-3 text-xs text-white/60 outline-none"
                >
                  <option value="all">All stages</option>
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stageLabel(stage)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-80 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#d8b44a]" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="grid min-w-[1360px] grid-cols-8 gap-px bg-white/10">
                  {stages.map((stage) => {
                    const stageLeads = filteredLeads.filter(
                      (lead) => lead.pipeline_stage === stage,
                    );
                    return (
                      <div key={stage} className="min-h-[470px] bg-[#080808]">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0c0c0c] px-3 py-4">
                          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
                            {stageLabel(stage)}
                          </span>
                          <span className="rounded-full bg-white/5 px-2 py-1 text-[9px] text-white/35">
                            {stageLeads.length}
                          </span>
                        </div>
                        <div className="space-y-2 p-2">
                          {stageLeads.map((lead) => (
                            <article
                              key={lead.id}
                              className="border border-white/10 bg-[#101010] p-3 transition hover:border-[#d8b44a]/35"
                            >
                              <div className="mb-3 flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-xs font-semibold text-white">
                                    {lead.name}
                                  </p>
                                  <p className="mt-1 text-[10px] text-white/35">
                                    {lead.company || "No company"}
                                  </p>
                                </div>
                                {lead.source_url ? (
                                  <a
                                    href={lead.source_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Open public evidence"
                                    className="text-[#d8b44a]"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                ) : null}
                              </div>
                              <div className="space-y-2 text-[10px] text-white/35">
                                <div className="flex items-center justify-between">
                                  <span>{lead.lane || "Unassigned lane"}</span>
                                  <span>
                                    {money.format(Number(lead.value || 0))}
                                  </span>
                                </div>
                                {lead.email ? (
                                  <div className="flex items-center gap-1.5">
                                    {lead.email_verification_status ===
                                    "verified" ? (
                                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                    ) : (
                                      <TriangleAlert className="h-3 w-3 text-amber-400" />
                                    )}
                                    <span className="truncate">{lead.email}</span>
                                  </div>
                                ) : null}
                                {lead.next_action ? (
                                  <p className="border-t border-white/5 pt-2 leading-4 text-white/45">
                                    {lead.next_action}
                                  </p>
                                ) : null}
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <aside className="border border-white/10 bg-[#090909]">
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-[#d8b44a]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/45">
                  Follow-up queue
                </p>
              </div>
              <p className="mt-2 text-xs text-white/25">
                Oldest due action first
              </p>
            </div>
            <div className="max-h-[590px] space-y-px overflow-y-auto bg-white/10">
              {followUps.length ? (
                followUps.map((lead) => (
                  <article key={lead.id} className="bg-[#0b0b0b] p-5">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/10 bg-black">
                        <Building2 className="h-4 w-4 text-white/35" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-white">
                          {lead.company || lead.name}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-white/30">
                          {lead.name}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs leading-5 text-white/55">
                      {lead.next_action || "Follow up"}
                    </p>
                    <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[#d8b44a]">
                      {safeDate(lead.next_action_at)}
                    </p>
                  </article>
                ))
              ) : (
                <div className="bg-[#0b0b0b] p-8 text-center">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-400/70" />
                  <p className="mt-3 text-xs text-white/40">
                    No overdue follow-ups.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/10 py-6 text-[10px] uppercase tracking-[0.18em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <span>Empire-1 CRM · Evidence before outreach</span>
          <span>FABLE bridge requires CRM_INTEGRATION_KEY</span>
        </footer>
      </div>
    </main>
  );
}
