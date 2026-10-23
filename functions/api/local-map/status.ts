import { REPORT_ID, json } from '../../../lib/scorecard/server/http';
import type { LmCtx } from '../../../lib/local-map/server/env';
import { originOf, sendReadyEmails, sendStallAlert } from '../../../lib/local-map/server/leads';
import { loadStatus } from '../../../lib/local-map/server/pipeline';
import { instrument } from '../../../lib/local-map/server/trace';

/* GET /api/local-map/status?id=<report id>
   The report page calls this every few seconds. Each call does ONE small step of the scan's work (see pipeline.ts), so the scan moves
   forward only while someone is watching it, and reopening the report link carries on from where it stopped. Once the report is done
   the stored text is handed back as it is: that is also how a shared link loads. */
export const onRequestGet = ({ request, env, waitUntil }: LmCtx) =>
  instrument('status', env, request, async (e, trace) => {
    const id = new URL(request.url).searchParams.get('id') ?? '';
    if (!REPORT_ID.test(id)) return json({ error: 'not_found', message: 'We could not find that report.' }, 404);
    const origin = originOf(request, e);
    const text = await loadStatus(e, id, true, {
      onDone: async (reportId) => {
        trace.phase = 'build';
        waitUntil(sendReadyEmails(e, reportId, origin));
      },
      onStalled: async (info) => {
        console.warn(JSON.stringify({ lm: true, event: 'stalled', reportId: info.reportId, status: info.status, checksDone: info.progress.checksDone, error: info.error }));
        waitUntil(
          sendStallAlert(e, origin, {
            reportId: info.reportId,
            practice: info.listing.name,
            status: info.status,
            error: info.error,
            checksDone: info.progress.checksDone,
            checksTotal: info.progress.checksTotal,
            retries: info.retries,
          }),
        );
      },
    });
    if (text === null) return json({ error: 'not_found', message: 'We could not find that report.' }, 404);
    trace.phase ||= (/"status":"(\w+)"/.exec(text.slice(0, 40)) ?? [])[1] ?? '';
    return new Response(text, {
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' },
    });
  });
