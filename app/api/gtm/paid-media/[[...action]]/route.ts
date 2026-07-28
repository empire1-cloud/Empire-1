import { NextRequest, NextResponse } from 'next/server';
import {
  amendBudget,
  approveCreative,
  authorizeBudget,
  createPaidMediaCampaign,
  launchPaidMediaCampaign,
  paidMediaSummary,
  pausePaidMediaCampaign,
  providerStatus,
  requireOperator,
  revokePaidMediaCampaign,
  revokeProviderCampaigns,
  syncAllPaidMediaCampaigns,
  syncPaidMediaCampaign,
} from '@/lib/paidMedia';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: { action?: string[] } };
type ErrorWithStatus = Error & { status?: number };

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function body(request: NextRequest): Promise<Record<string, unknown>> {
  try { return await request.json(); }
  catch { throw Object.assign(new Error('A valid JSON body is required.'), { status: 400 }); }
}

function fail(error: unknown) {
  const typed = error as ErrorWithStatus;
  const status = typed?.status && Number.isInteger(typed.status) ? typed.status : 500;
  return json({ success: false, detail: typed instanceof Error ? typed.message : 'Paid media request failed.' }, status);
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const action = context.params.action || [];
    if (action.length === 1 && action[0] === 'status') return json({ success: true, provider_status: providerStatus() });
    if (action.length === 0 || (action.length === 1 && action[0] === 'summary')) {
      requireOperator(request);
      return json({ success: true, ...(await paidMediaSummary()) });
    }
    return json({ success: false, detail: 'Paid media route not found.' }, 404);
  } catch (error) { return fail(error); }
}

export async function POST(request: NextRequest, context: Context) {
  try {
    requireOperator(request);
    const action = context.params.action || [];
    const input = await body(request);
    if (action.length === 1 && action[0] === 'sync-all') {
      return json({ success: true, ...(await syncAllPaidMediaCampaigns(input)) });
    }
    if (action.length === 1 && action[0] === 'campaigns') {
      return json({ success: true, campaign: await createPaidMediaCampaign(input) }, 201);
    }
    if (action.length === 3 && action[0] === 'campaigns') {
      const id = action[1];
      if (action[2] === 'approve-creative') return json({ success: true, campaign: await approveCreative(id, input) });
      if (action[2] === 'authorize-budget') return json({ success: true, campaign: await authorizeBudget(id, input) });
      if (action[2] === 'amend-budget') return json({ success: true, campaign: await amendBudget(id, input) });
      if (action[2] === 'launch') return json({ success: true, campaign: await launchPaidMediaCampaign(id, input) });
      if (action[2] === 'pause') return json({ success: true, campaign: await pausePaidMediaCampaign(id, input) });
      if (action[2] === 'sync') return json({ success: true, campaign: await syncPaidMediaCampaign(id, input) });
      if (action[2] === 'revoke-providers') return json({ success: true, campaign: await revokeProviderCampaigns(id, input) });
      if (action[2] === 'revoke') return json({ success: true, campaign: await revokePaidMediaCampaign(id, input) });
    }
    return json({ success: false, detail: 'Paid media route not found.' }, 404);
  } catch (error) { return fail(error); }
}
