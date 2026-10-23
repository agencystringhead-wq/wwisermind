import { json } from '../../../lib/scorecard/server/http';
import { LOOKUPS_PER_DAY } from '../../../lib/local-map/rules';
import { liveMapsSearch } from '../../../lib/local-map/server/dfs';
import type { LmCtx } from '../../../lib/local-map/server/env';
import { clientIp, underDailyLimit } from '../../../lib/local-map/server/limits';
import { toListing } from '../../../lib/local-map/server/parse';
import { logCost } from '../../../lib/local-map/server/pipeline';

/* POST /api/local-map/lookup  { practice, where }
   One live Google Maps search for the practice name plus the city or ZIP the visitor typed, answered with up to eight listings to pick from.
   About $0.002 a call, so it is limited to a few a day per connection. */

const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';

export const onRequestPost = async ({ request, env }: LmCtx) => {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'bad_request', message: 'That did not look right. Please try again.' }, 400);
  }
  const practice = clean(body.practice, 120);
  const where = clean(body.where, 80);
  if (practice.length < 2) return json({ error: 'bad_request', message: 'Please enter your practice name.' }, 400);

  if (!(await underDailyLimit(env, 'lookup-ip', clientIp(request), LOOKUPS_PER_DAY))) {
    return json({ error: 'rate_limited', message: 'That is a lot of searches from one connection today. Please try again tomorrow.' }, 429);
  }

  try {
    const { items, cost, ms } = await liveMapsSearch(env, `${practice} ${where}`.trim(), 10);
    await logCost(env, null, 'lookup', 1, 1, cost, ms);
    const seen = new Set<string>();
    const listings = items
      .filter((it) => it?.type === 'maps_search' && it.title && (it.cid || it.place_id))
      .map(toListing)
      .filter((l) => {
        const key = l.cid ?? l.placeId ?? l.name;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8);
    return json({ listings });
  } catch {
    return json({ error: 'lookup_failed', message: 'We could not search Google Maps just now. Please try again in a moment.' }, 502);
  }
};
