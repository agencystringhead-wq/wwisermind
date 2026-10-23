import { REPORT_ID, json } from '../../../lib/scorecard/server/http';
import type { LmCtx } from '../../../lib/local-map/server/env';
import { retryScan } from '../../../lib/local-map/server/pipeline';

/* POST /api/local-map/retry  { id }
   After a scan that did not finish, posts again only the checks that failed. Twice per report at most. */
export const onRequestPost = async ({ request, env }: LmCtx) => {
  let id = '';
  try {
    id = String(((await request.json()) as { id?: unknown }).id ?? '');
  } catch {
    /* falls through to the not found answer */
  }
  if (!REPORT_ID.test(id)) return json({ error: 'not_found', message: 'We could not find that report.' }, 404);
  const result = await retryScan(env, id);
  if (result === 'ok') return json({ ok: true });
  if (result === 'limit') return json({ error: 'limit', message: 'We have tried this scan twice already. Please book a free call and we will run it with you.' }, 429);
  if (result === 'unavailable') return json({ error: 'unavailable', message: 'We could not reach our data provider. Please try again in a few minutes.' }, 503);
  return json({ error: 'not_found', message: 'That report does not need a retry.' }, 404);
};
