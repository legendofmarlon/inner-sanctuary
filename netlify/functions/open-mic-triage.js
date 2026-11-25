/**
 * Netlify Serverless Function: open-mic-triage
 * Automated triage, categorization, slot drafting, and stage roster management for Inner Sanctuary Open Mics.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { corsHeaders, appendLedgerRecord } = require('./_persistence');

const ROSTER_PATH = path.resolve(__dirname, '../../content/run-of-show-roster.json');
const TMP_ROSTER_PATH = path.join(os.tmpdir(), 'sanctuary-roster.json');
const STAGE_PASSKEY = process.env.SANCTUARY_STAGE_PASSKEY || 'sanctuary432';

let inMemoryRoster = null;

function loadRoster() {
  try {
    if (fs.existsSync(ROSTER_PATH)) {
      return JSON.parse(fs.readFileSync(ROSTER_PATH, 'utf8'));
    }
  } catch (e) {}

  try {
    if (fs.existsSync(TMP_ROSTER_PATH)) {
      return JSON.parse(fs.readFileSync(TMP_ROSTER_PATH, 'utf8'));
    }
  } catch (e) {}

  if (!inMemoryRoster) {
    inMemoryRoster = {
      eventTitle: 'Inner Sanctuary Open Mic & Somatic Circle',
      eventDate: new Date().toISOString().slice(0, 10),
      performers: []
    };
  }
  return inMemoryRoster;
}

function saveRoster(roster) {
  inMemoryRoster = roster;
  let saved = false;
  try {
    const dir = path.dirname(ROSTER_PATH);
    if (fs.existsSync(dir)) {
      fs.writeFileSync(ROSTER_PATH, JSON.stringify(roster, null, 2), 'utf8');
      saved = true;
    }
  } catch (e) {}

  if (!saved) {
    try {
      fs.writeFileSync(TMP_ROSTER_PATH, JSON.stringify(roster, null, 2), 'utf8');
    } catch (e) {}
  }
}

function categorizeArtType(type, description = '') {
  const raw = `${type} ${description}`.toLowerCase();

  if (raw.includes('poet') || raw.includes('spoken') || raw.includes('verse')) {
    return { category: 'Spoken Word & Soul Poetry', icon: '🎙️', recommendedDuration: 7, stageArc: 'introspective' };
  }
  if (raw.includes('comed') || raw.includes('funny') || raw.includes('humor') || raw.includes('standup')) {
    return { category: 'Comedic Storytelling & Laughter Medicine', icon: '😄', recommendedDuration: 8, stageArc: 'release' };
  }
  if (raw.includes('sing') || raw.includes('guitar') || raw.includes('acoustic') || raw.includes('music') || raw.includes('song')) {
    return { category: 'Acoustic Soul & Harmonies', icon: '🎸', recommendedDuration: 9, stageArc: 'harmonic' };
  }
  if (raw.includes('paint') || raw.includes('art') || raw.includes('draw') || raw.includes('visual')) {
    return { category: 'Live Visual Expression', icon: '🎨', recommendedDuration: 10, stageArc: 'presence' };
  }
  return { category: 'Community Creative Expression', icon: '✨', recommendedDuration: 7, stageArc: 'open' };
}

function calculateNextSlot(roster) {
  if (!roster.performers || roster.performers.length === 0) return '2:15 PM';
  const lastPerformer = roster.performers[roster.performers.length - 1];
  const slotStr = lastPerformer.slot || '2:15 PM';
  const match = slotStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return '2:45 PM';

  let hour = parseInt(match[1], 10);
  let min = parseInt(match[2], 10) + (lastPerformer.durationMinutes || 8) + 3;
  const ampm = match[3].toUpperCase();

  while (min >= 60) {
    min -= 60;
    hour = (hour % 12) + 1;
  }
  return `${hour}:${min < 10 ? `0${min}` : min} ${ampm}`;
}

exports.handler = async function (event) {
  const headers = corsHeaders('GET, POST, PATCH, OPTIONS', 'x-stage-passkey');

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    const passkey = event.headers['x-stage-passkey'] || (event.queryStringParameters && event.queryStringParameters.key);
    if (!passkey || passkey !== STAGE_PASSKEY) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized: Valid Host Passkey Required' }) };
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ success: true, roster: loadRoster() })
    };
  }

  if (event.httpMethod === 'PATCH') {
    const passkey = event.headers['x-stage-passkey'];
    if (passkey !== STAGE_PASSKEY) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
    try {
      const { performerId, stageStatus, reorderedPerformers } = JSON.parse(event.body || '{}');
      const roster = loadRoster();
      if (reorderedPerformers && Array.isArray(reorderedPerformers)) {
        roster.performers = reorderedPerformers;
      } else if (performerId && stageStatus) {
        const perf = roster.performers.find((p) => p.id === performerId);
        if (perf) perf.stageStatus = stageStatus;
      }
      saveRoster(roster);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ success: true, roster })
      };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body || '{}');
      const name = (data.name || '').trim();
      const email = (data.email || '').trim().toLowerCase();
      const artType = (data.artType || 'poetry').trim();
      const description = (data.description || data.pieceTitle || '').trim();
      const instagram = (data.instagram || '').trim();
      const techNeeds = (data.techNeeds || '1 vocal mic').trim();

      if (!name || !email) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Artist Name and Email are required.' }) };
      }

      const roster = loadRoster();
      const cat = categorizeArtType(artType, description);
      const slot = calculateNextSlot(roster);

      const newPerformer = {
        id: `act-${Date.now()}`,
        name,
        email,
        artType,
        category: cat.category,
        slot,
        durationMinutes: cat.recommendedDuration,
        status: 'confirmed',
        stageStatus: 'ready',
        instagram: instagram || '@ourinnersanctuary',
        pieceTitle: description || 'Sacred Community Expression',
        techNeeds,
        registeredAt: new Date().toISOString()
      };

      roster.performers.push(newPerformer);
      saveRoster(roster);

      const persistResult = await appendLedgerRecord(
        'openmic_rsvp',
        'openmic_rsvps',
        'sanctuary-openmic-rsvps.json',
        newPerformer,
        { maxItems: 500 }
      );

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          success: true,
          message: 'Artist successfully triaged and added to Run-of-Show roster.',
          storageMode: persistResult.storageMode,
          webhookForwarded: persistResult.webhookForwarded,
          artist: newPerformer,
          promoGraphicData: {
            artistName: newPerformer.name,
            category: newPerformer.category,
            slot: newPerformer.slot,
            eventTitle: roster.eventTitle,
            eventDate: roster.eventDate
          }
        })
      };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
};
