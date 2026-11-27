/**
 * Shared persistence, CORS, webhook forwarding, and email transport helper
 * for Inner Sanctuary Wellness Foundation Netlify Functions.
 * Zero mandatory npm dependencies; activates Netlify Blobs, Google Sheets
 * Apps Script webhook, or Resend email automatically when configured.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');
const https = require('https');

function loadLocalEnvOnce() {
  if (process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY || process.env.NODE_ENV === 'test') return;
  const repoRoot = path.resolve(__dirname, '..', '..');
  for (const envName of ['.env', '.env.local']) {
    try {
      const envPath = path.join(repoRoot, envName);
      if (!fs.existsSync(envPath)) continue;
      const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const eqIdx = line.indexOf('=');
        if (eqIdx <= 0) continue;
        const key = line.slice(0, eqIdx).trim();
        let val = line.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (key && !(key in process.env) && val && !val.includes('your_gemini_api_key')) {
          process.env[key] = val;
        }
      }
    } catch (_) {}
  }
}

loadLocalEnvOnce();

function corsHeaders(methods = 'GET, POST, OPTIONS', extraHeaders = '') {
  const allowHeaders = extraHeaders ? `Content-Type, ${extraHeaders}` : 'Content-Type';
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': allowHeaders,
    'Access-Control-Allow-Methods': methods
  };
}

function getWebhookUrl() {
  return (process.env.SANCTUARY_SHEETS_WEBHOOK_URL || process.env.SANCTUARY_WEBHOOK_URL || '').trim();
}

function postJson(targetUrl, payload, headers = {}, timeoutMs = 4500) {
  return new Promise((resolve) => {
    if (!targetUrl) return resolve({ ok: false, reason: 'missing-url' });
    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch (err) {
      return resolve({ ok: false, reason: err.message });
    }

    const body = JSON.stringify(payload);
    const lib = parsed.protocol === 'http:' ? http : https;
    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'http:' ? 80 : 443),
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          ...headers
        }
      },
      (res) => {
        res.resume();
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, statusCode: res.statusCode });
      }
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve({ ok: false, reason: 'timeout' });
    });
    req.on('error', (err) => resolve({ ok: false, reason: err.message }));
    req.write(body);
    req.end();
  });
}

async function getBlobStore(storeName = 'sanctuary-ledger') {
  try {
    const blobs = require('@netlify/blobs');
    if (blobs && typeof blobs.getStore === 'function') {
      return blobs.getStore(storeName);
    }
  } catch (_) {}
  return null;
}

function readTmpJson(fileName, fallback = []) {
  try {
    const p = path.join(os.tmpdir(), fileName);
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8') || JSON.stringify(fallback));
    }
  } catch (_) {}
  return Array.isArray(fallback) ? [...fallback] : { ...fallback };
}

function writeTmpJson(fileName, value) {
  try {
    const p = path.join(os.tmpdir(), fileName);
    fs.writeFileSync(p, JSON.stringify(value), 'utf8');
    return true;
  } catch (_) {
    return false;
  }
}

async function readLedgerRecords(blobKey, tmpFileName) {
  const store = await getBlobStore();
  if (store) {
    try {
      const data = await store.get(blobKey, { type: 'json' });
      if (Array.isArray(data)) return { records: data, source: 'netlify-blobs' };
    } catch (_) {}
  }
  return { records: readTmpJson(tmpFileName, []), source: 'tmp-ephemeral' };
}

async function appendLedgerRecord(kind, blobKey, tmpFileName, record, options = {}) {
  const maxItems = options.maxItems || 500;
  let storageMode = 'tmp-ephemeral';

  const { records, source } = await readLedgerRecords(blobKey, tmpFileName);
  const next = Array.isArray(records) ? records.concat([record]).slice(-maxItems) : [record];

  const store = await getBlobStore();
  if (store) {
    try {
      await store.setJSON(blobKey, next);
      storageMode = 'netlify-blobs';
    } catch (_) {}
  } else if (source === 'netlify-blobs') {
    storageMode = 'netlify-blobs';
  }

  writeTmpJson(tmpFileName, next);

  const webhookUrl = getWebhookUrl();
  let webhookForwarded = false;
  if (webhookUrl) {
    const hookRes = await postJson(webhookUrl, {
      kind,
      record,
      sentAt: new Date().toISOString()
    });
    webhookForwarded = Boolean(hookRes.ok);
    if (webhookForwarded && storageMode === 'tmp-ephemeral') {
      storageMode = 'sheets-webhook';
    }
  }

  return {
    records: next,
    totalCount: next.length,
    storageMode,
    webhookForwarded
  };
}

async function sendResendNotification({ subject, text, to }) {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const fromEmail = (process.env.SANCTUARY_FROM_EMAIL || 'Inner Sanctuary <onboarding@resend.dev>').trim();
  if (!apiKey || !to || !to.length) {
    return { sent: false, reason: apiKey ? 'missing-recipients' : 'resend-unconfigured' };
  }

  const res = await postJson(
    'https://api.resend.com/emails',
    { from: fromEmail, to, subject, text },
    { Authorization: `Bearer ${apiKey}` }
  );
  return { sent: Boolean(res.ok), statusCode: res.statusCode };
}

function getEnvVal(name) {
  const fromProc = (process.env[name] || '').trim();
  if (fromProc) return fromProc;
  try {
    if (typeof globalThis !== 'undefined' && globalThis.Netlify && globalThis.Netlify.env) {
      return (globalThis.Netlify.env.get(name) || '').trim();
    }
  } catch (_) {}
  return '';
}

function getGeminiRuntimeConfig() {
  const apiKey = getEnvVal('GEMINI_API_KEY') || getEnvVal('GOOGLE_API_KEY');
  const rawBaseUrl = getEnvVal('GOOGLE_GEMINI_BASE_URL') || 'https://generativelanguage.googleapis.com';
  return {
    apiKey,
    baseUrl: rawBaseUrl.replace(/\/+$/, ''),
    customBaseUrl: Boolean(getEnvVal('GOOGLE_GEMINI_BASE_URL')),
    hasGatewayEnv: Boolean(getEnvVal('NETLIFY_AI_GATEWAY_KEY') && getEnvVal('NETLIFY_AI_GATEWAY_URL'))
  };
}

module.exports = {
  corsHeaders,
  postJson,
  getBlobStore,
  readTmpJson,
  writeTmpJson,
  readLedgerRecords,
  appendLedgerRecord,
  sendResendNotification,
  getGeminiRuntimeConfig
};
