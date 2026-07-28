import { NextRequest, NextResponse } from 'next/server';
import {
  approveCampaign,
  authorizeCampaign,
  createCampaign,
  dispatchCampaignBatch,
  dispatchJob,
  providerStatus,
  publisherSummary,
  queueJobs,
  recordOutcome,
  requireOperator,
  revokeCampaign,
} from '@/lib/controlledPublisher';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: { action?: string[] } };

type ErrorWithStatus = Error & { status?: number };

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function body(request: NextRequest): Promise<Record<string, unknown>> {
  try {
    return await request.json();
  } catch {
    throw Object.assign(new Error('A valid JSON body is required.'), { status: 400 });
  }
}

function fail(error: unknown) {
  const typed = error as ErrorWithStatus;
  const status = typed?.status && Number.isInteger(typed.status) ? typed.status : 500;
  const detail = typed instanceof Error ? typed.message : 'Controlled publisher request failed.';
  return json({ success: false, detail }, status);
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const action = context.params.action || [];
    if (action.length === 1 && action[0] === 'status') {
      return json({ success: true, provider_status: providerStatus() });
    }
    if (action.length === 0 || (action.length === 1 && action[0] === 'summary')) {
      requireOperator(request);
      const summary = await publisherSummary();
      return json({ success: true, ...summary });
    }
    return json({ success: false, detail: 'Publisher route not found.' }, 404);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest, context: Context) {
  try {
    requireOperator(request);
    const action = context.params.action || [];
    const input = await body(request);

    if (action.length === 1 && action[0] === 'campaigns') {
      const campaign = await createCampaign(input);
      return json({ success: true, campaign }, 201);
    }

    if (action.length === 3 && action[0] === 'campaigns' && action[2] === 'approve') {
      const campaign = await approveCampaign(action[1], input);
      return json({ success: true, campaign });
    }

    if (action.length === 3 && action[0] === 'campaigns' && action[2] === 'authorize') {
      const campaign = await authorizeCampaign(action[1], input);
      return json({ success: true, campaign });
    }

    if (action.length === 3 && action[0] === 'campaigns' && action[2] === 'queue') {
      const result = await queueJobs(action[1], input);
      return json({ success: true, ...result }, 201);
    }

    if (action.length === 3 && action[0] === 'campaigns' && action[2] === 'revoke') {
      const campaign = await revokeCampaign(action[1], input);
      return json({ success: true, campaign });
    }

    if (action.length === 3 && action[0] === 'campaigns' && action[2] === 'dispatch-batch') {
      const result = await dispatchCampaignBatch(action[1], input);
      return json({ success: true, ...result });
    }

    if (action.length === 3 && action[0] === 'jobs' && action[2] === 'dispatch') {
      const job = await dispatchJob(action[1], input);
      return json({ success: true, job });
    }

    if (action.length === 3 && action[0] === 'jobs' && action[2] === 'outcome') {
      const job = await recordOutcome(action[1], input);
      return json({ success: true, job });
    }

    return json({ success: false, detail: 'Publisher route not found.' }, 404);
  } catch (error) {
    return fail(error);
  }
}
