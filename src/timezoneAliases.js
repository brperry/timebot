/**
 * US-centric abbreviations and common words → IANA ids.
 * DST is applied automatically by the target zone (e.g. PDT/PST → America/Los_Angeles).
 */
const ALIASES = Object.freeze({
  PST: 'America/Los_Angeles',
  PDT: 'America/Los_Angeles',
  PT: 'America/Los_Angeles',
  MST: 'America/Denver',
  MDT: 'America/Denver',
  CST: 'America/Chicago',
  CDT: 'America/Chicago',
  CT: 'America/Chicago',
  EST: 'America/New_York',
  EDT: 'America/New_York',
  ET: 'America/New_York',
  ZULU: 'UTC',
  GMT: 'UTC',
});

/**
 * @param {string} input
 * @returns {string} trimmed; if the whole string matches a known alias (case-insensitive), the canonical IANA name
 */
export function normalizeTimezoneInput(input) {
  const t = input.trim();
  if (!t) return t;
  const key = t.toUpperCase();
  return ALIASES[key] !== undefined ? ALIASES[key] : t;
}
