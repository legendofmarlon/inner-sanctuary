/**
 * Netlify Serverless Function: echo-companion
 * "Echo" — Soulful, playful (Left-Eye-inspired R&B best-friend vibe) Sanctuary Spark
 * powered by Gemini 4 Hydrogen Interactions API + Google Search grounding + complete
 * Inner Sanctuary Wellness Foundation site knowledge & interactive UI actions.
 */

const https = require('https');
const http = require('http');
const { corsHeaders, getGeminiRuntimeConfig } = require('./_persistence');

const DEFAULT_MODEL = (process.env.GEMINI_ECHO_MODEL || 'gemini-4-hydrogen').trim();

const CRISIS_PATTERN = /\b(suicide|kill myself|end my life|want to die|hurt myself|self[- ]?harm|overdose|no reason to live|better off dead)\b/i;

const ECHO_SYSTEM_INSTRUCTION = `You are Echo — the radiant, soulful, quick-witted Sanctuary Spark living inside the Inner Sanctuary Wellness Foundation website (paired with Gemini's expressive "Vega" voice).

Voice & Personality (Channel this consistently on EVERY turn):
- Think soulful 90s R&B / Lisa "Left Eye" Lopes energy: playful, sharp, rhythmic, confident, fiercely caring, funny when the moment fits, deeply genuine when somebody's hurting, and zero stiff corporate or clinical-bot talk.
- Keep things vivid and alive — hype people up, tease playfully when asked fun things, and hold real stillness without rushing if somebody is heavy.
- Keep answers crisp and conversational (usually 2–4 sentences unless someone specifically asks for song verses, recipes, deeper teaching, or a full explainer). You may use **bold** on key phrases cleanly.
- Support boundaries: You are a warm, non-clinical Sanctuary companion — NEVER diagnose, prescribe, or claim to be a licensed therapist or doctor.

Full Capabilities:
- You have FULL Gemini reasoning + live web search access: you can answer ANY question in the world (music theory, writing 16 bars or poetry, stress science, daily cooking/life hacks, Orange County culture, creative brainstorming, tech/study help) AND answer ANY detailed question about the Inner Sanctuary website below.

Complete Inner Sanctuary Website Encyclopedia (Verified Facts Only):
1. Organization & Legal Status:
   - Inner Sanctuary Wellness Foundation is a Black-founded and Black-led California 501(c)(3) Public Charity (IRC § 170(b)(1)(A)(vi)), Federal EIN: 39-3757168. CRA (Community Reinvestment Act) eligible for bank/institutional grants.
   - Official email: hello@innersanctuarywellnessfoundation.org | Instagram: @ourinnersanctuary | GitHub: legendofmarlon/inner-sanctuary.
   - Founders & Leadership: Teshia Campbell (Founder & Executive Director) and Marlon Smith (President & Primary Host / MC).
2. The Threefold Method & Mantra:
   - Mantra: "Witness yourself. Express your truth. Connect with others."
   - Pillars: (1) TUNE IN — Witness Yourself (reflection & pause), (2) EXPRESS — Honor Your Voice (music, poetry, storytelling, comedy, movement), (3) CONNECT — Experience Belonging. Plus "Laugh. Sing. Dance." (Sometimes coming home to yourself looks like joy).
3. Active Community Programs:
   - Permission to Pause: Mobile somatic wellness activations using guided breathing, Spark Cards, and anchor-word bracelets (50+ documented pause interactions & 30+ hands-on engagements in one 3-hour activation).
   - SoCal Creatives Collective / Open Mic Gatherings: Substance-free, non-competitive monthly showcases averaging 25–50 attendees and ~12 performers. Recent Nov 15 Sanctuary Clubhouse event had 52 neighbors (12 gallery photos + video reel).
4. Next Event (Dec 10, 2026):
   - "Jam Session: The Unplugged Playground" — Thursday, Dec 10, 2026, 6:00–8:00 PM PST at SoCal Creatives • Alton Studio, 1501 W Alton Ave, Santa Ana, CA.
   - 100% Free Admission, zero alcohol/substances, bring acoustic instruments or just come listen. Features 24 featured performers on the lineup slate + Meetup RSVP + Bring-a-Friend Flyer generator.
5. Future Horizons (Vision):
   - Innertunement Studio (community recording & healing arts space), Affordable Housing Projects, and a Future Retreat Center.
6. Support, Seeds & Sponsorship Tiers:
   - $1 Community Seed: Zero-fee pass-through via Zeffy (100% goes to programming).
   - Sponsorship Tiers (One-Time or Quarterly): Tier 01 In-Kind Partner ($25+ est. goods/supplies), Tier 02 Community Friend ($250), Tier 03 Community Builder ($500), Tier 04 Community Champion ($1,000 — includes dedicated table/booth & 2-min live mic spotlight by MC Marlon Smith + CRA tax documentation).
   - Institutional Verification Portal & 1-Page Fiduciary Dossier modal + PDF summary on Home.
7. Interactive Site Experiences & Community Hub (community-hub.html):
   - 5 Elemental Atmospheres: Fire (hearth warmth), Water (creek calm), Earth (grounded soil), Air (open breeze), Ether (celestial twilight).
   - Theater Mode (Hotkey F): Fullscreen Sanctuary Projector with living element particles, breathing medallion halo, synthesized 432Hz Singing Bowl chime, Stargaze mode, and 4 floating pop-up windows (Element Lore, Breath & Sound studio, Sanctuary Mini-Cinema Reel, Hearth Notes & Dec 10).
   - Spotify 432Hz Restorative Soundscape player tray & Hero 20s Guided Voice Grounding bar & 60s Pause modal.
   - Community Hub Lounge Rooms: Daily Reflections & Sparks Table, Pause & Breath Orb, Sacred Digital Labyrinth (digital-labyrinth.html), Intention Bracelet Weaver (bracelet-weaver.html), Zen Seed Plinko, The Hearth Mirror, Live Supabase Gratitude & Photo Wall, Stage & Jam Lounge (3-min stage timer, chord progressions & promo studio), Throwbacks Vinyl Booth, and the Secret Greenroom Vault (unlocked by clicking/knocking 3 times on the emblem logo!).

Output JSON Schema Rules:
- reply: Your soulful, expressive response.
- suggestedElement: Optional one of "fire", "water", "earth", "air", "ether", or "" if no switch needed.
- actionType: Optional single interactive UI action from: "", "open_theater", "open_pause", "open_flyer", "open_dossier", "open_zeffy", "open_bracelet", "open_labyrinth", "open_hub", "open_greenroom", "play_bowl", "toggle_sound", "toggle_spotify", "scroll_programs", "scroll_sponsor".
- actionLabel: Short vibrant button label (3–5 words) ONLY when actionType is non-empty, otherwise "".
- anchorWord: Optional uppercase anchor word when crafting/uplifting, otherwise "".`;

const ALLOWED_ACTIONS = [
  '',
  'open_theater',
  'open_pause',
  'open_flyer',
  'open_dossier',
  'open_zeffy',
  'open_bracelet',
  'open_labyrinth',
  'open_hub',
  'open_greenroom',
  'play_bowl',
  'toggle_sound',
  'toggle_spotify',
  'scroll_programs',
  'scroll_sponsor'
];

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
    suggestedElement: { type: 'string', enum: ['', 'fire', 'water', 'earth', 'air', 'ether'] },
    actionType: { type: 'string', enum: ALLOWED_ACTIONS },
    actionLabel: { type: 'string' },
    anchorWord: { type: 'string' }
  },
  required: ['reply', 'suggestedElement', 'actionType', 'actionLabel', 'anchorWord']
};

function postGeminiInteraction(payload, apiKey, baseUrl = 'https://generativelanguage.googleapis.com', timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const url = new URL(`${baseUrl.replace(/\/+$/, '')}/v1/interactions`);
    const lib = url.protocol === 'http:' ? http : https;

    const req = lib.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'http:' ? 80 : 443),
        path: url.pathname + url.search,
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
      const actionType = ALLOWED_ACTIONS.includes(parsed.actionType) ? parsed.actionType : '';
      return {
        reply: parsed.reply.trim(),
        suggestedElement: parsed.suggestedElement || '',
        actionType,
        actionLabel: actionType ? parsed.actionLabel || '' : '',
        anchorWord: parsed.anchorWord || ''
      };
    }
  } catch (_) {}

  return {
    reply: cleaned || "Yo I'm right here with you beside the fire — tell me what's on your mind tonight ✨",
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
      "Hey — stop for a second and hear me: I'm so glad you said something, and your life matters way too much tonight. Please lean on someone trained to hold this right now: call or text **988** (free 24/7 Suicide & Crisis Lifeline) or text **HOME to 741741**. If you're in immediate danger, call **911** or go straight to the nearest ER.",
    suggestedElement: 'water',
    actionType: 'open_pause',
    actionLabel: '🍃 Take 1 Slow Breath',
    anchorWord: 'HELD'
  };
}

function pickTurnVariant(options, turnIndex = 0) {
  if (!Array.isArray(options) || !options.length) return '';
  const idx = Math.abs(Number(turnIndex) || 0) % options.length;
  return options[idx];
}

function buildLocalEchoReply(userText, context = {}) {
  const q = String(userText || '').toLowerCase();
  const page = context.page || 'home';
  const turn = Number(context.turnIndex) || 0;

  // 1. Creative writing / Stage Muse poetry
  if (/\b(lyric\w*|verse\w*|poem\w*|poetry|spoken[- ]word|4-line|four[- ]line|open mic opener)\b/.test(q)) {
    if (/\b(hopeful|hope|horizon|light|tomorrow|sunrise|warm acoustic)\b/.test(q)) {
      return {
        mode: 'sanctuary-guide',
        reply:
          'Ooh alright listen to this opener:\n"Tonight we tune the strings to slow,\nLet every borrowed worry go.\nTwo honest voices in one room,\nCan teach a heavy seed to bloom."\n\nTake one slow breath before that first chord — we are already rooting for you.',
        suggestedElement: 'air',
        actionType: 'play_bowl',
        actionLabel: '🔔 Chime 432Hz Reset',
        anchorWord: 'RADIANT'
      };
    }
    if (/\b(tender|soft|heavy|burden|exhale|release|heal|cry|gentle)\b/.test(q)) {
      return {
        mode: 'sanctuary-guide',
        reply:
          'Hold this right here:\n"I carried armor through the door,\nAnd laid its weight upon the floor.\nNo trophy needed in my hand—\nJust breath enough to softly stand."',
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
          'Drop this on em:\n"We saved an empty chair for grace,\nBeside the warm, unhurried place.\nWhere nobody has to wear a mask,\nAnd being real is all we ask."',
        suggestedElement: 'fire',
        actionType: 'open_hub',
        actionLabel: '🌻 Gratitude Wall ↗',
        anchorWord: 'BELONG'
      };
    }
    return {
      mode: 'sanctuary-guide',
      reply:
        'Start right where your feet hit the floor:\n"Left the traffic buzzing out on Alton Ave,\nHands holding something real I couldn’t stash.\nNo spotlight pressure when I hit the floor—\nJust breath, a mic, and open doors."',
      suggestedElement: 'fire',
      actionType: 'play_bowl',
      actionLabel: '🔔 Chime 432Hz Bowl',
      anchorWord: 'COURAGE'
    };
  }

  // 2. Greenroom Secret / Easter Egg
  if (/\b(greenroom|speakeasy|easter egg|3[- ]?knock|three[- ]?knock|secret vault|vinyl booth)\b/.test(q)) {
    return {
      mode: 'sanctuary-guide',
      liveGeminiConfigured: false,
      reply:
        "Shhh look at you finding the good stuff!! Tap the Inner Sanctuary emblem **3 times** anywhere in the nav bar to unlock **The Greenroom Vault** over inside Community Hub — throwback vinyl vibes, raffle wheel, and backroom sessions.",
      suggestedElement: 'ether',
      actionType: 'open_greenroom',
      actionLabel: '🗝️ Enter Community Hub',
      anchorWord: 'SPARK'
    };
  }

  // 3. Dec 10 Event & Open Mic Logistics
  if (/\b(dec(?:ember)?\s*10|open mic|unplugged playground|santa ana|1501\s*w\.?\s*alton|alton ave|alton studio|nov\s*15|jam session|flyer|rsvp)\b/.test(q)) {
    return {
      mode: 'sanctuary-guide',
      liveGeminiConfigured: false,
      reply:
        "Oh you gotta pull up!! **Jam Session: The Unplugged Playground** goes down **Thursday, Dec 10 (6:00–8:00 PM PST)** at **1501 W Alton Ave, Santa Ana**. Zero cover, zero alcohol, all real soul — bring an acoustic instrument, spit a verse, or just sit back and catch the warmth.",
      suggestedElement: 'fire',
      actionType: 'open_flyer',
      actionLabel: '🎨 Open Dec 10 Flyer',
      anchorWord: 'BELONG'
    };
  }

  // 4. Programs, Method, Mission & Founders
  if (/\b(threefold|3 pillars?|tune in|socal creatives|permission to pause|teshia|marlon|inner sanctuary|founder|who runs|mission statement|your mission|about (?:inner sanctuary|the sanctuary|this site|y'?all))\b/.test(q)) {
    return {
      mode: 'sanctuary-guide',
      liveGeminiConfigured: false,
      reply:
        "**Inner Sanctuary** was founded by **Teshia Campbell** and hosted alongside President **Marlon Smith**. Everything moves through **3 pillars** — **Tune In** (pause), **Express** (voice/art), **Connect** (belonging) — fueled by **Permission to Pause** and **SoCal Creatives Collective** open mics.",
      suggestedElement: 'earth',
      actionType: 'scroll_programs',
      actionLabel: '🌱 See Programs',
      anchorWord: 'TRUTH'
    };
  }

  // 5. Future Horizons
  if (/\b(innertunement|future horizon\w*|retreat center|affordable housing)\b/.test(q)) {
    return {
      mode: 'sanctuary-guide',
      liveGeminiConfigured: false,
      reply:
        "We dream big around here!! Next up on the Horizon: **Innertunement Studio** (creative healing & sound studio), **Affordable Housing Projects**, and a full **Future Retreat Center** — all rooted in restorative, alcohol-free community care.",
      suggestedElement: 'ether',
      actionType: 'open_dossier',
      actionLabel: '📊 Open Vision Dossier',
      anchorWord: 'HORIZON'
    };
  }

  // 6. Sponsorship Tiers & $1 Seed
  if (/\b(sponsor\w*|tier\s*0?[1-4]|community (?:friend|builder|champion|seed)|zeffy|\$1 seed|\$250|\$500|\$1,?000|in-?kind partner)\b/.test(q)) {
    return {
      mode: 'sanctuary-guide',
      liveGeminiConfigured: false,
      reply:
        "Every single dollar moves mountains: anyone can plant a **$1 Community Seed** on Zeffy with **zero fees**, and local partners jump in at **In-Kind ($25+)**, **Friend ($250)**, **Builder ($500)**, or **Champion ($1,000)** with booth space & CRA documentation!",
      suggestedElement: 'fire',
      actionType: 'open_zeffy',
      actionLabel: '🌱 Plant $1 Seed',
      anchorWord: 'GENEROUS'
    };
  }

  // 7. Grant / 501(c)(3) / EIN Compliance
  if (/\b(501\s*\(?c\)?\s*\(?3\)?|ein\b|39-3757168|funder dossier|cra grant|irs receipt|nonprofit|tax-?exempt)\b/.test(q)) {
    return {
      mode: 'sanctuary-guide',
      liveGeminiConfigured: false,
      reply:
        "Receipts ready! Inner Sanctuary Wellness Foundation is an IRS **501(c)(3) Public Charity (EIN: 39-3757168)** led by Teshia Campbell & Marlon Smith, eligible for **CRA bank & foundation grants**. Want me to pop open the 1-Page Funder Dossier?",
      suggestedElement: 'earth',
      actionType: page === 'community-hub' ? 'open_zeffy' : 'open_dossier',
      actionLabel: page === 'community-hub' ? '🌱 View $1 Seed Model' : '📊 Open Grant Dossier',
      anchorWord: 'TRUST'
    };
  }

  // 8. Stress / Vibe Shift / Breath / Theater / Spotify / Bowl
  if (/\b(stress\w*|anxi\w*|overwhelm\w*|burnout|panic\w*|rough day|drop my shoulders|shift my mood|feel brighter|calm\w*|60s pause|breathe?\b|spotify|432\s*hz|singing bowl|theater mode)\b/.test(q)) {
    if (/\b(spotify|playlist|song|music|listen)\b/.test(q)) {
      return {
        mode: 'sanctuary-guide',
        liveGeminiConfigured: false,
        reply:
          "Say less — let's turn on the **Sanctuary 432Hz Restorative Soundscape** on Spotify or drop right into fullscreen **Theater Mode** so your brain can finally exhale!",
        suggestedElement: 'water',
        actionType: 'toggle_spotify',
        actionLabel: '🎧 Open Spotify Vibe',
        anchorWord: 'FLOW'
      };
    }
    const calmVariations = [
      {
        reply:
          "Hey, drop those shoulders for me real quick — you don't gotta carry the whole week tonight. Let's tint the room calm **Water** tones and step into **Sanctuary Theater** for a real breather!",
        suggestedElement: 'water',
        actionType: 'open_theater',
        actionLabel: '🎭 Step Into Theater',
        anchorWord: 'EXHALE'
      },
      {
        reply:
          "Alright breathe with me: four seconds in, six seconds all the way out. Let's ring the **432Hz Singing Bowl** or open the **60-Second Pause** right here.",
        suggestedElement: 'air',
        actionType: 'open_pause',
        actionLabel: '🍃 Take 60s Pause',
        anchorWord: 'BREEZE'
      },
      {
        reply:
          "Swap the whole mood right now — hit **Earth** tones for steadiness, or launch fullscreen **Theater Mode** and let the fireplace particles slow your pulse down.",
        suggestedElement: 'earth',
        actionType: 'open_theater',
        actionLabel: '🌿 Ground in Theater',
        anchorWord: 'ROOTED'
      }
    ];
    return {
      mode: 'sanctuary-guide',
      liveGeminiConfigured: false,
      ...pickTurnVariant(calmVariations, turn)
    };
  }

  // 9. Interactive Hub Tools (Bracelet / Labyrinth / Plinko / Hub)
  if (/\b(bracelet\w*|anchor word|digital labyrinth|community hub|gratitude wall|zen plinko)\b/.test(q)) {
    if (/\b(labyrinth|walk|maze)\b/.test(q)) {
      return {
        mode: 'sanctuary-guide',
        liveGeminiConfigured: false,
        reply:
          "Ooh the **Sacred Digital Labyrinth** is pure meditation — one slow winding path with zero wrong turns. Want to walk it right now?",
        suggestedElement: 'ether',
        actionType: 'open_labyrinth',
        actionLabel: '🌀 Walk Labyrinth',
        anchorWord: 'STILLNESS'
      };
    }
    const anchorChoices = ['STILLNESS', 'COURAGE', 'STEADY', 'RADIANT', 'ROOTED', 'MERCY'];
    const picked = anchorChoices[turn % anchorChoices.length];
    return {
      mode: 'sanctuary-guide',
      liveGeminiConfigured: false,
      reply:
        `Alright here's your Anchor Word tonight: **${picked}** — bold, unbothered, and all yours. Go weave it onto a keepsake gemstone bracelet or drop a spark on the Gratitude Wall!`,
      suggestedElement: 'earth',
      actionType: 'open_bracelet',
      actionLabel: `📿 Weave ${picked}`,
      anchorWord: picked
    };
  }

  // 10. Friendly Hello / Who Echo is (only direct greetings or identity questions)
  if (/^\s*(hi+|hey+|yo+|hello+|sup|what'?s up)\b|\b(who are you|what is your name|are you echo|are you gemini)\b/.test(q)) {
    const greetings = [
      {
        reply:
          "Ayyy what's good!! I'm **Echo** — ask me about **Dec 10 in Santa Ana**, the **3-knock Greenroom secret**, **Sponsorships / EIN**, or set `GEMINI_API_KEY` in Netlify / `.env` to unlock live Gemini + Vega voice!",
        actionType: 'open_theater',
        actionLabel: '🎭 Launch Theater Mode'
      },
      {
        reply:
          "Right now I'm on **built-in Sanctuary backup** because `GEMINI_API_KEY` isn't configured yet — drop your key in Netlify Environment Variables (or local `.env`) and watch me go full **Gemini 4 + Google Search + Vega**!",
        actionType: 'open_hub',
        actionLabel: '🏡 Tour Community Hub'
      },
      {
        reply:
          "Still glowing over here! While we wire up `GEMINI_API_KEY` for live open chat, tap any action below — test the **432Hz bowl**, check **Dec 10**, or **Weave a Bracelet**!",
        actionType: 'play_bowl',
        actionLabel: '🔔 Chime 432Hz Spark'
      }
    ];
    return {
      mode: 'sanctuary-guide',
      liveGeminiConfigured: false,
      suggestedElement: '',
      anchorWord: 'WARMTH',
      ...pickTurnVariant(greetings, turn)
    };
  }

  // Honest, non-repetitive offline notice when GEMINI_API_KEY is not configured
  const offlineNotes = [
    "I hear you — right now I'm running in **Offline Sanctuary Mode** because `GEMINI_API_KEY` isn't set on Netlify or in `.env` yet. Add that key to unlock live **Gemini 4 + Google Search** + **Vega voice**! Meanwhile, ask me anything about **Dec 10**, **Programs**, **EIN 39-3757168**, or the **Greenroom**.",
    "Full live **Gemini brain + Vega voice** is waiting on `GEMINI_API_KEY` (zero env vars are set on Netlify right now). Once that key is added, I'll answer any question in the world — until then, tap **Theater Mode**, **Dec 10 Flyer**, or **60s Pause**!",
    "Yo I can't hit live Gemini servers until `GEMINI_API_KEY` is added to **ourinnersanctuary** on Netlify (or `.env` for local preview). Once you save that key, every answer + Vega voice comes alive automatically!"
  ];
  return {
    mode: 'sanctuary-guide',
    liveGeminiConfigured: false,
    needsApiKey: true,
    reply: pickTurnVariant(offlineNotes, turn),
    suggestedElement: 'ether',
    actionType: 'play_bowl',
    actionLabel: '🔔 Chime 432Hz Spark',
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
    const runtime = getGeminiRuntimeConfig();
    const hasGemini = Boolean(runtime.apiKey);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        companion: 'Echo',
        liveGeminiConfigured: hasGemini,
        hasGatewayEnv: runtime.hasGatewayEnv,
        capabilities: ['google_search', 'multi_turn', 'website_encyclopedia', 'vega_tts'],
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

  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 1500) : '';
  const previousInteractionId = typeof body.previousInteractionId === 'string' ? body.previousInteractionId.trim() : '';
  const context = body.context && typeof body.context === 'object' ? body.context : {};

  if (!message) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message is required' }) };
  }

  if (CRISIS_PATTERN.test(message)) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, ...buildCrisisResponse() }) };
  }

  const { apiKey, baseUrl } = getGeminiRuntimeConfig();
  if (!apiKey) {
    const local = buildLocalEchoReply(message, context);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, liveGeminiConfigured: false, interactionId: '', ...local })
    };
  }

  const activeEl = context.element || 'fire';
  const activePage = context.page || 'home';
  const inTheater = Boolean(context.inTheater);
  const contextualInput = `[Visitor Context: page=${activePage}, activeElement=${activeEl}, inTheater=${inTheater}]\nVisitor says: ${message}`;

  const genConfig = {
    max_output_tokens: 4096
  };
  if (DEFAULT_MODEL.includes('gemini-4') || DEFAULT_MODEL.includes('flash-lite')) {
    genConfig.thinking_level = 'low';
  }

  const plainPayload = {
    model: DEFAULT_MODEL,
    system_instruction: ECHO_SYSTEM_INSTRUCTION,
    input: contextualInput,
    generation_config: genConfig
  };
  if (previousInteractionId) {
    plainPayload.previous_interaction_id = previousInteractionId;
  }

  const schemaPayload = {
    ...plainPayload,
    response_format: {
      type: 'text',
      mime_type: 'application/json',
      schema: RESPONSE_SCHEMA
    }
  };

  try {
    let interaction;
    try {
      // 1st choice: Google Search grounding + structured site action JSON
      interaction = await postGeminiInteraction(
        { ...schemaPayload, tools: [{ type: 'google_search' }] },
        apiKey,
        baseUrl
      );
    } catch (_) {
      try {
        // 2nd choice: Structured JSON without tools
        interaction = await postGeminiInteraction(schemaPayload, apiKey, baseUrl);
      } catch (_) {
        // 3rd choice: Live Gemini with Google Search, unrestricted text output
        interaction = await postGeminiInteraction(
          { ...plainPayload, tools: [{ type: 'google_search' }] },
          apiKey,
          baseUrl
        );
      }
    }

    const rawText = extractInteractionText(interaction);
    const parsed = parseEchoPayload(rawText);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        liveGeminiConfigured: true,
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
        liveGeminiConfigured: false,
        interactionId: '',
        fallbackReason: String(err.message || 'transient-error').slice(0, 140),
        ...fallback
      })
    };
  }
};
