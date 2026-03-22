import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_PATH = path.join(DATA_DIR, 'guild-settings.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStore() {
  ensureDataDir();
  if (!fs.existsSync(STORE_PATH)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const data = JSON.parse(raw);
    return typeof data === 'object' && data !== null && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

function writeStoreAtomic(obj) {
  ensureDataDir();
  const tmp = `${STORE_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2), 'utf8');
  fs.renameSync(tmp, STORE_PATH);
}

/**
 * @param {string} guildId
 * @returns {string | null}
 */
export function getDefaultTimezone(guildId) {
  const store = readStore();
  const z = store[guildId];
  return typeof z === 'string' && z.length > 0 ? z : null;
}

/**
 * @param {string} guildId
 * @param {string} zone IANA timezone
 */
export function setDefaultTimezone(guildId, zone) {
  const store = readStore();
  store[guildId] = zone;
  writeStoreAtomic(store);
}

/**
 * @param {string} guildId
 */
export function clearDefaultTimezone(guildId) {
  const store = readStore();
  if (!(guildId in store)) return;
  delete store[guildId];
  writeStoreAtomic(store);
}
