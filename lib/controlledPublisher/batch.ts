import { PublisherJob, RecordMap, boundedInteger, cleanString, ensureAuthorization, getCampaignOrThrow, getDb, writeReceipt } from './core';
import { dispatchJob } from './dispatch';

export async function dispatchCampaignBatch(campaignId: string, input: RecordMap) {
  if (input.confirm_external_action !== true) {
    throw Object.assign(new Error('Explicit external-action confirmation is required.'), { status: 400 });
  }
  const confirmedBy = cleanString(input.confirmed_by, 'Confirmed by', 120);
  const campaign = await getCampaignOrThrow(campaignId);
  ensureAuthorization(campaign);
  const maxJobs = boundedInteger(input.max_jobs, 10, 1, 20);
  const db = await getDb();
  const jobs = await db.collection<PublisherJob>('gtm_publish_jobs')
    .find({ campaign_id: campaignId, status: { $in: ['QUEUED', 'BLOCKED', 'FAILED'] } }, { projection: { _id: 0 } })
    .sort({ created_at: 1 })
    .limit(maxJobs)
    .toArray();

  const results: Array<{ id: string; status: string; detail?: string }> = [];
  for (const job of jobs) {
    try {
      const updated = await dispatchJob(job.id, input);
      results.push({ id: updated.id, status: updated.status, detail: updated.provider_message });
    } catch (cause) {
      results.push({ id: job.id, status: 'ERROR', detail: cause instanceof Error ? cause.message : 'Dispatch failed.' });
    }
  }

  await writeReceipt('CAMPAIGN_BATCH_DISPATCH_ATTEMPTED', {
    campaign_id: campaignId, attempted: jobs.length, max_jobs: maxJobs, results, confirmed_by: confirmedBy,
  });
  return { campaign_id: campaignId, attempted: jobs.length, results };
}
