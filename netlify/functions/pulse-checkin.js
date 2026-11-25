/**
 * Netlify Serverless Function: pulse-checkin
 * Anonymous, privacy-preserving somatic pulse ingest for Inner Sanctuary
 */

const { corsHeaders, appendLedgerRecord } = require('./_persistence');

const TMP_FILE = 'sanctuary-pulses.json';
const BLOB_KEY = 'pulses_24h';
const VALID_STATES = ['processing', 'tension', 'battery', 'peace'];
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

let inMemoryCountFallback = 7;

exports.handler = async function (event) {
  const headers = corsHeaders('POST, OPTIONS');

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const state = (data.state || '').toLowerCase();

    if (!VALID_STATES.includes(state)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid somatic state' }) };
    }

    const now = Date.now();
    const entry = {
      state,
      timestamp: now,
      origin: data.origin === 'qr-booth' ? 'qr-booth' : 'web'
    };

    const result = await appendLedgerRecord('pulse', BLOB_KEY, TMP_FILE, entry, { maxItems: 500 });
    const active24h = (result.records || []).filter((p) => (now - (p.timestamp || 0)) < TWENTY_FOUR_HOURS);
    const totalActive24h = Math.max(active24h.length, inMemoryCountFallback + 1);
    inMemoryCountFallback = totalActive24h;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({
        success: true,
        recordedState: state,
        totalActive24h,
        storageMode: result.storageMode,
        webhookForwarded: result.webhookForwarded
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Error', details: err.message })
    };
  }
};
