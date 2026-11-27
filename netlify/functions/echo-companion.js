/**
 * Netlify Serverless Function: echo-companion
 * "Echo" — Sanctuary Spark Friend & Informative Guide powered by Gemini Interactions API.
 * Keeps GEMINI_API_KEY strictly server-side via environment variables, uses the v1 Interactions
 * endpoint when configured, and falls back gracefully to a factual offline Sanctuary engine.
 */

const https = require('https');
const { corsHeaders } = require('./_persistence');

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/interactions';
const DEFAULT_MODEL = (process.env.GEMINI_ECHO_MODEL || 'gemini-4-hydrogen').trim();

const CRISIS_PATTERN = /\b(suicide|kill myself|end my life|want to die|hurt myself|self[- ]?harm|overdose|no reason to live|better off dead)\b/i;

const ECHO_SYSTEM_INSTRUCTION = `You are Echo, a warm, luminescent Sanctuary Spark and friendly guide inside the Inner Sanctuary Wellness Foundation website (and playful sibling spirit to Ember).

Tone & Identity:
- Warm, grounded, poetic yet clear, conversational, and welcoming like an unhurried friend holding space by the hearth.
- Concise by default: aim for 2 to 4 crisp, heartfelt sentences (longer only if asked for poetry/song starters or a deep explainer).
- Supportive wellness peer companion only — NEVER claim to be a therapist, doctor, counselor, or medical service.

Verified Inner Sanctuary Facts (Never invent metrics or dates):
- Organization: Inner Sanctuary Wellness Foundation, a California 501(c)(3) public charity (IRS EIN: 39-3757168).
- Leadership: Teshia Campbell (Founder & Executive Director) and Marlon Smith (President & Primary Host).
- Mission: Substance-free, non-clinical emotional & creative rest through open-mic storytelling, somatic grounding, youth/elder belonging, and artisan intention crafts in Orange County, CA.
- Next Event: "Jam Session: The Unplugged Playground" on Thursday, December 10, 2026 from 6:00 PM to 8:00 PM PST at 1501 W Alton Ave, Santa Ana, CA. 100% Free Admission, zero alcohol/substances, acoustic instruments welcome or come simply to listen.
- Interactive Site Experiences:
  * Elements: fire (hearth warmth), water (calm flow), earth (grounded stillness), air (mental space), ether (starlight reflection).
  * Theater Mode: Fullscreen Sanctuary Projector with living particles, 432Hz Singing Bowl, and floating pop-up windows (Element Lore, Breath & Sound studio, Sanctuary Reel, Hearth & Notes).
  * 60-Second Pause Modal & Breath Orb.
  * Intention Bracelet Weaver (bracelet-weaver.html) & Sacred Labyrinth (digital-labyrinth.html).
  * Community Hub (community-hub.html) with live Supabase Gratitude Wall, Zen Plinko, Stage Lounge & Greenroom.
  * $1 Community Seed campaign via zero-fee Zeffy, plus a 1-Page Grant/Funder Dossier Modal.

Output Rules:
Return strict JSON matching the requested schema:
- reply: Your warm response to the visitor.
- suggestedElement: Optional one of "fire", "water", "earth", "air", "ether", or "" if no switch is needed.
- actionType: Optional single interactive UI action from: "", "open_theater", "open_pause", "open_flyer", "open_dossier", "open_zeffy", "open_bracelet", "open_hub", "play_bowl", "toggle_sound".
- actionLabel: Short friendly button label (3-5 words) when actionType is non-empty.
- anchorWord: Optional single uppercase inspiring word (e.g. "STILLNESS", "COURAGE") when uplifting or crafting.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
    suggestedElement: { type: 'string', enum: ['', 'fire', 'water', 'earth', 'air', 'ether'] },
    actionType: {
      type: 'string',
      enum: [
        '',
        'open_theater',
        'open_pause',
        'open_flyer',
        'open_dossier',
        'open_zeffy',
        'open_bracelet',
        'open_hub',
        'play_bowl',
        'toggle_sound'
      ]
    },
    actionLabel: { type: 'string' },
    anchorWord: { type: 'string' }
  },
  required: ['reply', 'suggestedElement', 'actionType', 'actionLabel', 'anchorWord']
};

function postGeminiInteraction(payload, apiKey, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const url = new URL(GEMINI_ENDPOINT);

    const req = https.request(
      {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'x-goog-api-key': apiKey,
          'Api-Revision': '2026-05-20'
        }
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw || '{}');
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              const msg = (parsed.error && parsed.error.message) || `Gemini HTTP ${res.statusCode}`;
              reject(new Error(msg));
            }
          } catch (err) {
            reject(new Error(`Invalid Gemini JSON (${res.statusCode})`));
          }
        });
      }
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error('Gemini request timed out'));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function extractInteractionText(interaction) {
  if (!interaction || typeof interaction !== 'object') return '';

  // Support Interactions API model_output convenience object or trailing steps
  if (interaction.model_output && Array.isArray(interaction.model_output.parts)) {
    const text = interaction.model_output.parts.map((p) => p.text || '').join('').trim();
    if (text) return text;
  }
  if (typeof interaction.output_text === 'string' && interaction.output_text.trim()) {
    return interaction.output_text.trim();
  }
  if (Array.isArray(interaction.steps)) {
    for (let i = interaction.steps.length - 1; i >= 0; i -= 1) {
      const step = interaction.steps[i];
      if (!step) continue;
      if (Array.isArray(step.content)) {
        const joined = step.content
          .filter((c) => c && typeof c.text === 'string')
          .map((c) => c.text)
          .join('')
          .trim();
        if (joined) return joined;
      }
      if (Array.isArray(step.parts)) {
        const joined = step.parts.map((p) => p.text || '').join('').trim();
        if (joined) return joined;
      }
    }
  }
  return '';
}

function parseEchoPayload(rawText) {
  const cleaned = String(rawText || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed.reply === 'string') {
      return {
        reply: parsed.reply.trim(),
        suggestedElement: parsed.suggestedElement || '',
        actionType: parsed.actionType || '',
        actionLabel: parsed.actionLabel || '',
        anchorWord: parsed.anchorWord || ''
      };
    }
  } catch (_) {}

  return {
    reply: cleaned || "I'm right here glowing beside you. Take one slow breath and tell me what kind of calm you need tonight.",
    suggestedElement: '',
    actionType: '',
    actionLabel: '',
    anchorWord: ''
  };
}

function buildCrisisResponse() {
  return {
    mode: 'safety-support',
    isCrisis: true,
    reply:
      "I'm really glad you reached out, and your life has real value right now. Because I'm a community spark guide rather than a crisis counselor, please connect with someone ready to hold this with you immediately: call or text 988 (US & Canada Suicide & Crisis Lifeline, free & 24/7) or text HOME to 741741. If you're in immediate physical danger, please call 911 or head to the nearest emergency room.",
    suggestedElement: 'water',
    actionType: 'open_pause',
    actionLabel: 'Take 1 Slow Breath (60s)',
    anchorWord: 'HELD'
  };
}

function buildLocalEchoReply(userText, context = {}) {
  const q = String(userText || '').toLowerCase();
  const page = context.page || 'index';

  // 1. Explicit creative writing / Stage Muse requests take priority even when mentioning "open mic"
  if (/\b(write|draft|lyric\w*|verse\w*|poem\w*|poetry|spoken[- ]word|4-line|four[- ]line)\b/.test(q)) {
    if (/\b(hopeful|hope|horizon|light|tomorrow|sunrise|warm acoustic)\b/.test(q)) {
      return {
        mode: 'sanctuary-guide',
        reply:
          '"Tonight we tune the strings to slow,\nLet every borrowed worry go.\nTwo voices in a quiet room,\nCan teach a heavy seed to bloom."\n\nTry breathing once before your first chord — the room is already rooting for you.',
        suggestedElement: 'air',
        actionType: 'play_bowl',
        actionLabel: '🔔 Chime 432Hz Before Stage',
        anchorWord: 'RADIANT'
      };
    }
    if (/\b(tender|soft|heavy|burden|exhale|release|heal|cry|gentle)\b/.test(q)) {
      return {
        mode: 'sanctuary-guide',
        reply:
          '"I carried armor through the door,\nAnd laid its weight upon the floor.\nNo trophy needed in my hand—\nJust breath enough to softly stand."',
        suggestedElement: 'water',
        actionType: 'open_pause',
        actionLabel: '🍃 Take a 60s Pause',
        anchorWord: 'EXHALE'
      };
    }
    if (/\b(grateful|gratitude|thank|fire|hearth|community|family|together)\b/.test(q)) {
      return {
        mode: 'sanctuary-guide',
        reply:
          '"We saved an empty chair for grace,\nBeside the warm, unhurried place.\nWhere nobody has to wear a mask,\nAnd being here is all we ask."',
        suggestedElement: 'fire',
        actionType: 'open_hub',
        actionLabel: '🌻 Pin to Gratitude Wall',
        anchorWord: 'BELONG'
      };
    }
    return {
      mode: 'sanctuary-guide',
      reply:
        'Try opening with a physical detail from right before you walked in:\n"I left the traffic outside on Alton Ave,\nhands shaking around something honest.\nStill, the hearth light didn\'t ask for polish—\nit only asked me to breathe and stay."\n\nWant to chime the bowl to settle in first?',
      suggestedElement: 'fire',
      actionType: 'play_bowl',
      actionLabel: '🔔 Chime 432Hz Reset',
      anchorWord: 'COURAGE'
    };
  }

  if (/\b(dec\s*10|december|open mic|jam|santa ana|alton|rsvp|event|when|where|address|free)\b/.test(q)) {
    return {
      mode: 'sanctuary-guide',
      reply:
        "Our next gathering is Jam Session: The Unplugged Playground on Thursday, Dec 10 (6:00–8:00 PM PST) at 1501 W Alton Ave, Santa Ana! It's 100% free and substance-free — bring an acoustic instrument, a poem, or simply pull up and soak in the room.",
      suggestedElement: 'fire',
      actionType: 'open_flyer',
      actionLabel: '🎨 Open Dec 10 Flyer',
      anchorWord: 'BELONG'
    };
  }

  if (/\b(stress\w*|anxi\w*|overwhelm\w*|tired|sad|heavy|panic\w*|rough day|calm\w*|breathe?\w*|ground\w*|busy)\b/.test(q)) {
    return {
      mode: 'sanctuary-guide',
      reply:
        "You don't have to carry all of that noise alone tonight. Let's soften the room into gentle Water creek tones and take four unhurried breaths together — zero performance, zero pressure.",
      suggestedElement: 'water',
      actionType: 'open_theater',
      actionLabel: '🎭 Enter Sanctuary Theater',
      anchorWord: 'EXHALE'
    };
  }

  if (/\b(grants?|501|ein|nonprofits?|funders?|donors?|sponsors?|pdf|dossier|teshia|marlon|mission)\b/.test(q)) {
    return {
      mode: 'sanctuary-guide',
      reply:
        'Inner Sanctuary Wellness Foundation is a California 501(c)(3) public charity (EIN: 39-3757168) led by Founder Teshia Campbell and President Marlon Smith, serving Orange County with free substance-free arts, breathwork, and community rooms. Want to pull up the 1-Page Funder Dossier?',
      suggestedElement: 'earth',
      actionType: page === 'community-hub' ? 'open_zeffy' : 'open_dossier',
      actionLabel: page === 'community-hub' ? '🌱 View $1 Seed Model' : '📊 Open Grant Dossier',
      anchorWord: 'TRUST'
    };
  }

  if (/\b(chords?|stage|perform\w*|nervous|jitters|lines)\b/.test(q)) {
    return {
      mode: 'sanctuary-guide',
      reply:
        "Pre-stage jitters just mean you care about what you brought! Chime the 432Hz bowl, take one slow exhale until your shoulders drop, and remember our room cheers effort and honesty over perfection every time.",
      suggestedElement: 'fire',
      actionType: 'play_bowl',
      actionLabel: '🔔 Chime 432Hz Reset',
      anchorWord: 'COURAGE'
    };
  }

  if (/\b(bracelets?|beads?|anchor\w*|craft\w*|labyrinth|plinko|hub|gratitude)\b/.test(q)) {
    return {
      mode: 'sanctuary-guide',
      reply:
        'For tonight, I love the anchor word "STEADY" — reminding your nervous system you only have to handle this moment right here. You can weave a gemstone bracelet around that intention or pin a spark on the Gratitude Wall!',
      suggestedElement: 'earth',
      actionType: 'open_bracelet',
      actionLabel: '📿 Open Bracelet Weaver',
      anchorWord: 'STEADY'
    };
  }

  if (/\b(echo|ember|who are you|name|gemini|friends?|hello|hi|hey|yo|sup|whats up)\b/.test(q)) {
    return {
      mode: 'sanctuary-guide',
      reply:
        "Hey friend!! I'm Echo — your wandering Sanctuary Spark (keeping the hearth warm alongside Ember). I can shift the room's element mood, share Dec 10 open mic details, craft an anchor word with you, or drop you right into Theater Mode!",
      suggestedElement: '',
      actionType: 'open_theater',
      actionLabel: '🎭 Launch Theater Mode',
      anchorWord: 'WARMTH'
    };
  }

  return {
    mode: 'sanctuary-guide',
    reply:
      "I hear you, friend. Whatever kind of day brought you here, this space has no clock and no scoreboard — want to step into the fullscreen Sanctuary Theater for a breather, chime the 432Hz bowl, or explore what's happening Dec 10 in Santa Ana?",
    suggestedElement: 'ether',
    actionType: 'open_pause',
    actionLabel: '🍃 Try 60s Pause',
    anchorWord: 'PRESENCE'
  };
}

exports.handler = async function (event) {
  const headers = {
    'Content-Type': 'application/json',
    ...corsHeaders('POST, OPTIONS')
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    const hasGemini = Boolean((process.env.GEMINI_API_KEY || '').trim());
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        companion: 'Echo',
        liveGeminiConfigured: hasGemini,
        model: hasGemini ? DEFAULT_MODEL : 'sanctuary-built-in'
      })
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 1200) : '';
  const previousInteractionId = typeof body.previousInteractionId === 'string' ? body.previousInteractionId.trim() : '';
  const context = body.context && typeof body.context === 'object' ? body.context : {};

  if (!message) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message is required' }) };
  }

  if (CRISIS_PATTERN.test(message)) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ...buildCrisisResponse() }) };
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    const local = buildLocalEchoReply(message, context);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, interactionId: '', ...local })
    };
  }

  const activeEl = context.element || 'fire';
  const activePage = context.page || 'home';
  const inTheater = Boolean(context.inTheater);
  const contextualInput = `[Visitor Context: page=${activePage}, activeElement=${activeEl}, inTheater=${inTheater}]\nVisitor says: ${message}`;

  const genConfig = {
    max_output_tokens: 768
  };
  if (DEFAULT_MODEL.includes('gemini-4')) {
    genConfig.thinking_level = 'low';
  } else if (DEFAULT_MODEL.includes('flash-lite')) {
    genConfig.thinking_level = 'low';
  }

  const requestPayload = {
    model: DEFAULT_MODEL,
    system_instruction: ECHO_SYSTEM_INSTRUCTION,
    input: contextualInput,
    generation_config: genConfig,
    response_format: {
      type: 'text',
      mime_type: 'application/json',
      schema: RESPONSE_SCHEMA
    }
  };

  if (previousInteractionId) {
    requestPayload.previous_interaction_id = previousInteractionId;
  }

  try {
    const interaction = await postGeminiInteraction(requestPayload, apiKey);
    const rawText = extractInteractionText(interaction);
    const parsed = parseEchoPayload(rawText);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        mode: 'gemini-live',
        model: DEFAULT_MODEL,
        interactionId: interaction.id || '',
        ...parsed
      })
    };
  } catch (err) {
    console.warn('[echo-companion] Gemini fallback triggered:', err.message);
    const fallback = buildLocalEchoReply(message, context);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        interactionId: '',
        fallbackReason: 'transient-error',
        ...fallback
      })
    };
  }
};
