import { REPORT_ID, json } from '../../../lib/scorecard/server/http';
import type { LmCtx } from '../../../lib/local-map/server/env';
import { originOf, sendReadyEmails } from '../../../lib/local-map/server/leads';
import { loadStatus } from '../../../lib/local-map/server/pipeline';

/* GET /api/local-map/status?id=<report id>
   The report page calls this every few seconds. Each call also does one slice of the scan's work (see pipeline.ts), so the scan
   moves forward only while someone is watching it. Once the report is done it returns the whole report; that is also how a shared link loads. */
export const onRequestGet = async ({ request, env, waitUntil }: LmCtx) => {
  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!REPORT_ID.test(id)) return json({ error: 'not_found', message: 'We could not find that report.' }, 404);
  const origin = originOf(request, env);
  const status = await loadStatus(env, id, true, async (reportId) => {
    waitUntil(sendReadyEmails(env, reportId, origin));
  });
  if (!status) return json({ error: 'not_found', message: 'We could not find that report.' }, 404);
  return json(status);
};
