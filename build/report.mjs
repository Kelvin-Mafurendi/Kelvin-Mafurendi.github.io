#!/usr/bin/env node
// Tells the Kelvin Studio app how a site build went, in builds/{id}
// (DESIGN.md, Website integration, step 5).
//
//   BUILD_ID=... RUN_URL=... node build/report.mjs building|live|failed
//
// BUILD_ID comes from the app's publish request (repository_dispatch). Builds
// started any other way (a push, the nightly run) have none, and report nothing.
// Uses the same service account as the build, from FIREBASE_SERVICE_ACCOUNT.

import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const STATES = new Set(['building', 'live', 'failed']);

export function reportFields(state, { runUrl, now = new Date() } = {}) {
  if (!STATES.has(state)) throw new Error(`Unknown state "${state}"`);
  const fields = { status: state, runUrl: runUrl || null };
  if (state === 'building') fields.startedAt = now;
  else fields.finishedAt = now;
  return fields;
}

async function main() {
  const state = process.argv[2];
  const id = process.env.BUILD_ID;
  if (!id) {
    console.log('No build id (not started by a publish): nothing to report.');
    return;
  }
  if (!/^[A-Za-z0-9]{10,40}$/.test(id)) throw new Error('BUILD_ID is malformed');
  const account = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!account) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set');
  const { initializeApp, cert } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  const db = getFirestore(initializeApp({ credential: cert(JSON.parse(account)) }));
  await db.doc(`builds/${id}`).set(reportFields(state, { runUrl: process.env.RUN_URL }), { merge: true });
  console.log(`builds/${id}: ${state}`);
}

// Run only when called as a script, not when the tests import it.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    // A failed report must never fail the deploy itself.
    console.error(`Could not report the build: ${e.message}`);
  });
}
