/**
 * add-cycle-phase.mjs
 *
 * Adds the optional `cyclePhase` string attribute to the `sessions` collection.
 * Run once: node scripts/add-cycle-phase.mjs
 */

import { readFileSync } from 'fs';
import { Client, Databases } from 'node-appwrite';

function loadEnv(path = '.env.local') {
  try {
    const lines = readFileSync(path, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    console.warn('Could not read .env.local — falling back to process.env');
  }
}
loadEnv();

const ENDPOINT   = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const DB_ID      = process.env.NEXT_PUBLIC_APPWRITE_DB_ID;
const API_KEY    = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !DB_ID || !API_KEY) {
  console.error('Missing required env vars. Check .env.local.');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const db = new Databases(client);

async function main() {
  process.stdout.write('  sessions / cyclePhase … ');
  try {
    await db.createStringAttribute(
      DB_ID,
      'sessions',
      'cyclePhase',
      12,       // max length — longest phase name is 'follicular' (10 chars)
      false,    // not required — existing sessions have none
    );
    console.log('created');
  } catch (e) {
    if (e?.code === 409 || e?.message?.includes('already exists')) {
      console.log('already exists, skipped');
    } else {
      console.error(`FAILED — ${e?.message ?? e}`);
      process.exit(1);
    }
  }

  console.log('\nDone. Attribute may take a moment to become active in Appwrite.');
}

main();
