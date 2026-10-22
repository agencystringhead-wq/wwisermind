import type { Ctx } from '../../../../lib/scorecard/server/env';
import { REPORT_ID, json } from '../../../../lib/scorecard/server/http';

/* GET /api/scorecard/result/<id>  returns the stored report. Never returns the lead's details. */
export const onRequestGet = async ({ env, params }: Ctx<'id'>) => {
  const id = String(params.id ?? '');
  if (!REPORT_ID.test(id)) return json({ error: 'not_found' }, 404);
  const row = await env.DB.prepare('SELECT report_json FROM reports WHERE id = ?1').bind(id).first<{ report_json: string }>();
  if (!row) return json({ error: 'not_found' }, 404);
  return json(JSON.parse(row.report_json));
};
