/**
 * Netlify Serverless Function: hub-checkin
 * Persists anonymous Community Hub pre/post mood check-ins cleanly via
 * Netlify Blobs, Google Sheets Apps Script webhook, or /tmp fallback.
 */

const { corsHeaders, readLedgerRecords, appendLedgerRecord } = require('./_persistence');

const TMP_FILE = 'sanctuary-hub-checkins.json';
const BLOB_KEY = 'hub_checkins';

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders('GET, POST, OPTIONS'), body: '' };
  }

  if (event.httpMethod === 'GET') {
    const { records, source } = await readLedgerRecords(BLOB_KEY, TMP_FILE);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders('GET, POST, OPTIONS') },
      body: JSON.stringify({
        success: true,
        count: records.length,
        storageMode: source
      })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders('GET, POST, OPTIONS'),
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const entry = {
      timestamp: data.timestamp || new Date().toISOString(),
      portal: String(data.portal || 'Community Hub Hearth Mirror').slice(0, 80),
      arrivalMood: String(data.arrivalMood || 'Reflecting in Hub').slice(0, 60),
      postFeeling: String(data.postFeeling || 'Calmer & Grounded').slice(0, 60),
      takeawayNote: String(data.takeawayNote || 'Paused & checked in anonymously').slice(0, 140),
      source: String(data.source || 'Anonymous Hub Check-In').slice(0, 60)
    };

    const result = await appendLedgerRecord('hub_checkin', BLOB_KEY, TMP_FILE, entry, { maxItems: 1000 });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders('GET, POST, OPTIONS') },
      body: JSON.stringify({
        success: true,
        entry,
        persistedCount: result.totalCount,
        storageMode: result.storageMode,
        webhookForwarded: result.webhookForwarded
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders('GET, POST, OPTIONS'),
      body: JSON.stringify({ error: 'Internal Error', details: err.message })
    };
  }
};
