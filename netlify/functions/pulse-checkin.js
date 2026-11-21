/**
 * Netlify Serverless Function: pulse-checkin
 * Anonymous, privacy-preserving somatic pulse ingest for Inner Sanctuary
 */

// Resilient in-memory store for serverless instance lifetime
let inMemoryPulses = [
  { state: 'peace', timestamp: Date.now() - 1000 * 60 * 15, origin: 'web' },
  { state: 'processing', timestamp: Date.now() - 1000 * 60 * 35, origin: 'qr-booth' },
  { state: 'tension', timestamp: Date.now() - 1000 * 60 * 55, origin: 'web' },
  { state: 'battery', timestamp: Date.now() - 1000 * 60 * 85, origin: 'qr-booth' },
  { state: 'peace', timestamp: Date.now() - 1000 * 60 * 120, origin: 'web' },
  { state: 'processing', timestamp: Date.now() - 1000 * 60 * 140, origin: 'web' },
  { state: 'tension', timestamp: Date.now() - 1000 * 60 * 180, origin: 'web' }
];

const VALID_STATES = ['processing', 'tension', 'battery', 'peace'];
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

exports.handler = async function(event, context) {
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const state = (data.state || '').toLowerCase();

    if (!VALID_STATES.includes(state)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid somatic state' })
      };
    }

    const now = Date.now();
    const entry = {
      state: state,
      timestamp: now,
      origin: (data.origin === 'qr-booth' ? 'qr-booth' : 'web')
    };

    // Prune stale pulses older than 24h
    inMemoryPulses = inMemoryPulses.filter(p => (now - p.timestamp) < TWENTY_FOUR_HOURS);
    inMemoryPulses.push(entry);

    // Limit maximum retained in-memory events to prevent unbounded growth
    if (inMemoryPulses.length > 500) {
      inMemoryPulses = inMemoryPulses.slice(-500);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        recordedState: state,
        totalActive24h: inMemoryPulses.length
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Error', details: err.message })
    };
  }
};
