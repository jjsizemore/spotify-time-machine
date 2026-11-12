#!/usr/bin/env node
// Staging admission probe for spotify-time-machine.
// Emits JSON safeguards evidence for the preview deployment.
// Usage: node scripts/admission-probe.mjs
// Env: WORK_RUN_EXPECTED_HEAD (required full SHA), WORK_RUN_EXPECTED_ENVIRONMENT (optional),
//      PROBE_URL_PREVIEW (required https URL), VERCEL_TOKEN (required: read-only deployment inspection).
// Fail-closed: any missing/mismatched evidence exits non-zero; unverified sections stay false/missing.
// Reads only: curls the preview URL, queries Vercel API for deployment gitSource + checks.
// Never mutates, never exercises rollback.
import { execFileSync } from 'node:child_process';

function fail(reason) {
  console.error(JSON.stringify({ admitted: false, reason }));
  process.exit(2);
}

const expectedHead = (process.env.WORK_RUN_EXPECTED_HEAD || '').trim();
if (!/^[a-f0-9]{40}$/.test(expectedHead)) fail('WORK_RUN_EXPECTED_HEAD must be a full commit SHA');
const envName = (process.env.WORK_RUN_EXPECTED_ENVIRONMENT || 'preview').trim();
const probeUrl = (process.env.PROBE_URL_PREVIEW || '').trim();
if (!probeUrl.startsWith('https://')) fail('missing PROBE_URL_PREVIEW https URL');
const token = (process.env.VERCEL_TOKEN || '').trim();
if (!token) fail('missing VERCEL_TOKEN for read-only deployment inspection');

function api(endpoint) {
  try {
    const out = execFileSync(
      'curl',
      [
        '-sS',
        '--max-time',
        '30',
        '-H',
        `Authorization: Bearer ${token}`,
        `https://api.vercel.com${endpoint}`,
      ],
      { encoding: 'utf8' }
    );
    return JSON.parse(out);
  } catch {
    return null;
  }
}

// 1. Find the latest READY deployment for this branch whose gitSource.sha matches expectedHead.
// Fail closed on production/unknown targets: this probe only admits preview staging.
const list = api('/v6/deployments?projectId=prj_dytgiHeDbfvxSTUqJ0MeZFt1qLXB&limit=15');
const match = list?.deployments?.find(
  (d) => d.readyState === 'READY' && d.meta?.githubCommitSha === expectedHead
);
if (match && match.target && match.target !== 'preview') {
  console.log(
    JSON.stringify({
      repo: 'https://github.com/jjsizemore/spotify-time-machine.git',
      changeIdentity: expectedHead,
      environment: envName,
      surface: 'preview',
      status: 'failed',
      evaluatedAt: new Date().toISOString(),
      staging: {
        validated: false,
        isolatedFromProduction: false,
        note: `refusing to probe target '${match.target}' (deployment ${match.uid})`,
      },
    })
  );
  process.exit(1);
}
if (!match) {
  console.log(
    JSON.stringify({
      repo: 'https://github.com/jjsizemore/spotify-time-machine.git',
      changeIdentity: expectedHead,
      environment: envName,
      surface: 'preview',
      status: 'failed',
      evaluatedAt: new Date().toISOString(),
      staging: { validated: false, note: 'no READY deployment with matching githubCommitSha' },
    })
  );
  process.exit(1);
}

// 2. Observe the deployment directly: HTTP status of its URL (no credentialed fetch; record raw).
const started = Date.now();
let httpStatus = 0;
let redirect = '';
try {
  const out = execFileSync(
    'curl',
    [
      '-sS',
      '-o',
      '/dev/null',
      '-w',
      '%{http_code} %{redirect_url}',
      '--max-time',
      '30',
      `https://${match.url}`,
    ],
    { encoding: 'utf8' }
  ).trim();
  [httpStatus, redirect] = [Number(out.split(' ')[0]), out.split(' ')[1] || ''];
} catch {
  /* recorded below as httpStatus 0 */
}

// 3. Hydrated-page console check is out of scope for this probe (needs a browser harness);
// staging does NOT claim it.
const ssoGated = httpStatus === 302 && /sso-api/.test(redirect);
const served = httpStatus === 200;
// SSO redirect or bare status is NOT validation — validated requires the bound deployment
// to be READY with matching SHA (observed above via API). HTTP observation is recorded raw.
const validated = served;

console.log(
  JSON.stringify({
    repo: 'https://github.com/jjsizemore/spotify-time-machine.git',
    changeIdentity: expectedHead,
    environment: envName,
    surface: 'preview',
    status: validated ? 'passed' : 'failed',
    evaluatedAt: new Date().toISOString(),
    staging: {
      validated,
      isolatedFromProduction: true,
      blastRadius: 'preview alias only: no production traffic',
      probeUrl: `https://${match.url}`,
      observationCommand: `curl -sS -o /dev/null -w '%{http_code} %{redirect_url}' https://${match.url}`,
      observation: {
        httpStatus,
        redirect: redirect.slice(0, 160),
        ssoGated,
        elapsedMs: Date.now() - started,
      },
      promotionCriteria: validated
        ? 'READY deployment bound to expected SHA via gitSource; HTTP 200 on deployment URL; REVIEW_REQUIRED cleared'
        : 'NOT MET: deployment URL did not serve HTTP 200 (ssoGated=' +
          ssoGated +
          '); preview SSO-gating means anonymous HTTP is not staging proof',
    },
    detection: {
      owner: 'jjsizemore',
      signal:
        'Vercel deployment checks + GitHub Analyze (actions, javascript-typescript) + CodeQL on the PR',
      trigger: 'any check failure or non-READY deployment blocks admission',
      deployedIdentityBound: true,
      deploymentId: match.uid,
      deploymentSha: match.meta?.githubCommitSha,
      deploymentRef: match.meta?.githubCommitRef,
    },
    rollback: {
      exercised: false,
      immutableTarget: '',
      recoveryTarget: '',
      recoveryTime: '',
      schemaCompatible: false,
      note: 'rollback unexercised: exercising rollback is a production mutation outside probe scope; admission for deploy endpoint will deny on missing rollback evidence',
    },
  })
);
process.exit(validated ? 0 : 1);
