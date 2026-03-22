import * as chrono from 'chrono-node';
import { DateTime } from 'luxon';

/**
 * @param {string} when
 * @param {string} zone IANA
 * @returns {number | null} Unix seconds, or null if unparseable
 */
export function parseWhenToUnixSeconds(when, zone) {
  const ref = DateTime.now().setZone(zone);
  const refDate = ref.toJSDate();
  const results = chrono.parse(when.trim(), refDate, { forwardDate: true });
  if (!results.length) return null;

  const first = results[0];
  const start = first.start;
  if (!start) return null;

  const y = start.get('year');
  const m = start.get('month');
  const d = start.get('day');
  const h = start.get('hour');
  const mi = start.get('minute');
  const s = start.get('second') ?? 0;

  if (y != null && m != null && d != null) {
    const dt = DateTime.fromObject(
      {
        year: y,
        month: m,
        day: d,
        hour: h ?? 0,
        minute: mi ?? 0,
        second: s,
      },
      { zone }
    );
    if (dt.isValid) return Math.floor(dt.toSeconds());
  }

  try {
    const js = first.date();
    if (js) return Math.floor(js.getTime() / 1000);
  } catch {
    /* ignore */
  }
  return null;
}
