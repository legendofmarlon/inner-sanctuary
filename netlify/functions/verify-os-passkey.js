/**
 * Netlify Serverless Function: verify-os-passkey
 * Verifies Sanctuary OS leadership passkeys server-side using SHA-256 + timing-safe comparison
 * so plain-text credentials are never exposed in client-side JavaScript.
 */

const crypto = require('crypto');
const { corsHeaders } = require('./_persistence');

const DEFAULT_OPERATOR_HASHES = {
  // SHA-256 digests of leadership passkeys; override via SANCTUARY_OS_PASSKEYS_JSON in Netlify env
  bb75d08c22ad3c2849ca9324a72690ef65985efd7693672eac63f2663aca39f1: {
    user: 'marlon',
    name: 'Marlon Smith',
    role: 'President & Primary Host',
    avatar: '🎙️',
    badge: 'MC HOST COMMAND'
  },
  '11fe08866b4c8d56a96799c1f2487fbbf6e84928e2212e59b716bfd69b1b6ec8': {
    user: 'teshia',
    name: 'Teshia Campbell',
    role: 'Founder & Executive Director',
    avatar: '🌿',
    badge: 'EXECUTIVE STEWARD'
  }
};

function getOperatorRegistry() {
  const raw = process.env.SANCTUARY_OS_PASSKEYS_JSON;
  if (!raw) return DEFAULT_OPERATOR_HASHES;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (err) {
    console.warn('[verify-os-passkey] Invalid SANCTUARY_OS_PASSKEYS_JSON; using defaults.');
  }
  return DEFAULT_OPERATOR_HASHES;
}

function timingSafeHexEqual(aHex, bHex) {
  const aBuf = Buffer.from(aHex, 'hex');
  const bBuf = Buffer.from(bHex, 'hex');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

exports.handler = async function (event) {
  const headers = {
    'Content-Type': 'application/json',
    ...corsHeaders('POST, OPTIONS')
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ ok: false, error: 'Method Not Allowed' })
    };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ ok: false, error: 'Invalid JSON body' })
    };
  }

  const candidate = typeof body.passkey === 'string' ? body.passkey.trim() : '';
  if (!candidate) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ ok: false, error: 'Passkey required' })
    };
  }

  const candidateHash = crypto.createHash('sha256').update(candidate, 'utf8').digest('hex');
  const registry = getOperatorRegistry();

  let matchedOperator = null;
  for (const [storedKey, operator] of Object.entries(registry)) {
    const targetHash = /^[0-9a-f]{64}$/i.test(storedKey)
      ? storedKey.toLowerCase()
      : crypto.createHash('sha256').update(storedKey, 'utf8').digest('hex');

    if (timingSafeHexEqual(candidateHash, targetHash)) {
      matchedOperator = operator;
    }
  }

  if (!matchedOperator) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ ok: false, error: 'Invalid leadership passkey' })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      operator: matchedOperator
    })
  };
};
