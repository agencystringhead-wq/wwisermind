import { json } from '../../../lib/scorecard/server/http';
import type { LmCtx } from '../../../lib/local-map/server/env';
import { clientIp, underDailyLimit } from '../../../lib/local-map/server/limits';

/* GET /api/local-map/geocode?q=78701
   Finds a point for a ZIP or a city, to centre the "drop a pin" map for a practice whose address Google hides. OpenStreetMap's free
   Nominatim service: light use only, with an identifying User-Agent, as its usage policy asks. */

export const onRequestGet = async ({ request, env }: LmCtx) => {
  const q = (new URL(request.url).searchParams.get('q') ?? '').replace(/\s+/g, ' ').trim().slice(0, 80);
  if (q.length < 2) return json({ error: 'bad_request', message: 'Enter a city or ZIP code.' }, 400);
  if (!(await underDailyLimit(env, 'geo-ip', clientIp(request), 30))) {
    return json({ error: 'rate_limited', message: 'Too many searches today. Please drop the pin by hand.' }, 429);
  }
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(q)}`, {
      headers: { 'user-agent': 'wwisermind-local-map/1.0 (admin@wwisermind.com)', accept: 'application/json' },
    });
    const data = (await res.json()) as { lat?: string; lon?: string; display_name?: string }[];
    const hit = data?.[0];
    if (!hit?.lat || !hit.lon) return json({ error: 'not_found', message: 'We could not find that place. Drop the pin by hand.' }, 404);
    return json({ lat: Number(hit.lat), lng: Number(hit.lon), label: hit.display_name ?? q });
  } catch {
    return json({ error: 'geocode_failed', message: 'We could not look that up. Drop the pin by hand.' }, 502);
  }
};
