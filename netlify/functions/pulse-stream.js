/**
 * Netlify Serverless Function: pulse-stream
 * Returns aggregated 24h community pulse metrics and constellation telemetry
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const PULSE_TMP_PATH = path.join(os.tmpdir(), 'sanctuary-pulses.json');

function getPersistedPulses() {
  try {
    if (fs.existsSync(PULSE_TMP_PATH)) {
      return JSON.parse(fs.readFileSync(PULSE_TMP_PATH, 'utf8') || '[]');
    }
  } catch (e) {}
  return [];
}

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

// Base seed data for healthy community pulse representation
const DEFAULT_SEED_PULSES = [
  { state: 'peace', minutesAgo: 8 },
  { state: 'processing', minutesAgo: 22 },
  { state: 'tension', minutesAgo: 38 },
  { state: 'battery', minutesAgo: 54 },
  { state: 'peace', minutesAgo: 71 },
  { state: 'processing', minutesAgo: 95 },
  { state: 'tension', minutesAgo: 110 },
  { state: 'peace', minutesAgo: 140 },
  { state: 'battery', minutesAgo: 180 },
  { state: 'processing', minutesAgo: 210 },
  { state: 'peace', minutesAgo: 260 },
  { state: 'tension', minutesAgo: 310 },
  { state: 'processing', minutesAgo: 390 },
  { state: 'battery', minutesAgo: 480 },
  { state: 'peace', minutesAgo: 550 },
  { state: 'peace', minutesAgo: 620 },
  { state: 'processing', minutesAgo: 740 },
  { state: 'tension', minutesAgo: 890 }
];

exports.handler = async function(event, context) {
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  const now = Date.now();

  // Load real pulses submitted to this serverless environment
  const persisted = getPersistedPulses().filter(p => (now - p.timestamp) < TWENTY_FOUR_HOURS);
  const liveNodes = persisted.map((p, idx) => {
    const ageMinutes = Math.max(1, Math.round((now - p.timestamp) / (60 * 1000)));
    return {
      id: `live-node-${idx}-${p.timestamp}`,
      state: p.state,
      ageMinutes: ageMinutes,
      intensity: Math.max(0.45, +(1 - (ageMinutes / 1440)).toFixed(2)),
      isLive: true
    };
  });

  // Generate constellation nodes based on seeds + active minutes
  const seedNodes = DEFAULT_SEED_PULSES.map((seed, idx) => {
    const timestamp = now - (seed.minutesAgo * 60 * 1000);
    return {
      id: `pulse-node-${idx}`,
      state: seed.state,
      ageMinutes: seed.minutesAgo,
      // Freshness decay: 1.0 (recent) down to 0.35 (older)
      intensity: Math.max(0.35, +(1 - (seed.minutesAgo / 1440)).toFixed(2))
    };
  });

  const nodes = liveNodes.concat(seedNodes);

  const breakdown = {
    processing: 0,
    tension: 0,
    battery: 0,
    peace: 0
  };

  nodes.forEach(n => {
    if (breakdown[n.state] !== undefined) {
      breakdown[n.state]++;
    }
  });

  const total = nodes.length;
  const percentages = {
    processing: total ? Math.round((breakdown.processing / total) * 100) : 0,
    tension: total ? Math.round((breakdown.tension / total) * 100) : 0,
    battery: total ? Math.round((breakdown.battery / total) * 100) : 0,
    peace: total ? Math.round((breakdown.peace / total) * 100) : 0
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=15, stale-while-revalidate=45'
    },
    body: JSON.stringify({
      totalCheckins24h: total,
      breakdown: breakdown,
      percentages: percentages,
      nodes: nodes,
      timestamp: now
    })
  };
};
