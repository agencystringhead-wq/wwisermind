/**
 * A stand-in for Cloudflare D1 over Node's built-in SQLite, STRICT in the ways the real one is, so a mistake that D1 would reject fails the test too:
 *   - batch() accepts only statements made by this database's own prepare(). A wrapper object, a plain object or a statement from somewhere else
 *     is refused with D1's "Malformed input" error. (A tracing wrapper once passed local tests because the old fake accepted anything.)
 *   - batch() is one transaction: if any statement fails, none of them are kept.
 *   - a statement takes at most 100 bound values.
 */
import type { DatabaseSync } from 'node:sqlite';

export const failures = { nextBatch: 0 }; // set above 0 to make that many batches fail, for testing a failed save

export function strictD1(sqlite: DatabaseSync) {
  class Stmt {
    constructor(readonly sql: string, readonly args: unknown[] = []) {}
    bind(...values: unknown[]) {
      if (values.length > 100) throw new Error('D1_ERROR: too many SQL variables');
      return new Stmt(this.sql, values);
    }
    async first() {
      return (sqlite.prepare(this.sql).get(...(this.args as any[])) as any) ?? null;
    }
    async all() {
      return { results: sqlite.prepare(this.sql).all(...(this.args as any[])) as any[] };
    }
    async run() {
      return { meta: { changes: Number(sqlite.prepare(this.sql).run(...(this.args as any[])).changes) } };
    }
  }
  return {
    prepare: (sql: string) => new Stmt(sql),
    batch: async (list: unknown[]) => {
      if (!list.every((s) => s instanceof Stmt)) {
        throw new Error(`D1_ERROR: Malformed input: ${JSON.stringify(list)}, should be {sql: string, params?: any[]} or an array of those`);
      }
      if (failures.nextBatch > 0) {
        failures.nextBatch--;
        throw new Error('D1_ERROR: simulated failure while saving');
      }
      sqlite.exec('BEGIN');
      try {
        const out = [];
        for (const s of list as Stmt[]) out.push(await s.run());
        sqlite.exec('COMMIT');
        return out;
      } catch (e) {
        sqlite.exec('ROLLBACK');
        throw e;
      }
    },
  };
}
