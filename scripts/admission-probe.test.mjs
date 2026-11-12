#!/usr/bin/env node
// Failing-path tests for scripts/admission-probe.mjs. No network, no mutation.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const probe = path.join(path.dirname(fileURLToPath(import.meta.url)), 'admission-probe.mjs');
const HEAD = 'a'.repeat(40);
let failures = 0;

function check(name, env, expectStatus, expectText) {
  const run = spawnSync(process.execPath, [probe], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
  const combined = `${run.stdout || ''}\n${run.stderr || ''}`;
  const pass = run.status === expectStatus && combined.includes(expectText);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name} (exit ${run.status})`);
  if (!pass) {
    failures++;
    console.log(`  wanted exit ${expectStatus} +: ${expectText}\n  got: ${combined.slice(0, 300)}`);
  }
}

// Stubbed-curl run: fakes both the Vercel API list and the deployment URL fetch.
function stubbedRun(name, stubJson, urlStatus, expectStatus, expectText) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'probe-stub-'));
  fs.writeFileSync(
    path.join(dir, 'curl'),
    `#!/bin/sh\nif echo "$@" | grep -q "api.vercel.com"; then echo '${stubJson}'; else echo -n "${urlStatus} "; fi\n`
  );
  fs.chmodSync(path.join(dir, 'curl'), 0o755);
  check(name, { ...full, PATH: `${dir}:${process.env.PATH}` }, expectStatus, expectText);
  fs.rmSync(dir, { recursive: true, force: true });
}

const full = {
  WORK_RUN_EXPECTED_HEAD: HEAD,
  PROBE_URL_PREVIEW: 'https://example.com/',
  VERCEL_TOKEN: 'dummy',
};
const { WORK_RUN_EXPECTED_HEAD: _h, ...noHead } = full;
const { PROBE_URL_PREVIEW: _u, ...noUrl } = full;
const { VERCEL_TOKEN: _t, ...noToken } = full;

check('missing head', noHead, 2, 'WORK_RUN_EXPECTED_HEAD must be a full commit SHA');
check(
  'short head',
  { ...noHead, WORK_RUN_EXPECTED_HEAD: 'abc123' },
  2,
  'WORK_RUN_EXPECTED_HEAD must be a full commit SHA'
);
check('missing url', noUrl, 2, 'missing PROBE_URL_PREVIEW');
check('missing token', noToken, 2, 'missing VERCEL_TOKEN');

// Production-target SHA match refuses to probe.
stubbedRun(
  'production target refused',
  JSON.stringify({
    deployments: [
      {
        uid: 'dpl_prod123',
        url: 'prod.example.com',
        readyState: 'READY',
        target: 'production',
        meta: { githubCommitSha: HEAD },
      },
    ],
  }),
  '200',
  1,
  'refusing to probe target'
);

// No READY deployment with matching SHA.
stubbedRun(
  'no matching deployment',
  JSON.stringify({ deployments: [] }),
  '200',
  1,
  'no READY deployment'
);

// Matching READY preview deployment but SSO-gated URL (302) is not validation.
stubbedRun(
  'sso gated url not validation',
  JSON.stringify({
    deployments: [
      {
        uid: 'dpl_prev123',
        url: 'prev.example.com',
        readyState: 'READY',
        target: null,
        meta: { githubCommitSha: HEAD, githubCommitRef: 'feat/x' },
      },
    ],
  }),
  '302 https://vercel.com/sso-api?x=1',
  1,
  'NOT MET'
);

if (failures > 0) {
  console.error(`${failures} failing-path test(s) failed`);
  process.exit(1);
}
console.log('all failing-path tests pass');
