/**
 * Inner Sanctuary Wellness Foundation — "Echo" the Living Sanctuary Spark
 * A gentle wandering companion sprite + interactive Gemini-powered guide window
 * offering mood-matched Sanctuary actions, informative 501(c)(3)/event answers,
 * Anchor Word creation, Open Mic inspiration, and offline fallback intelligence.
 */
(function () {
  'use strict';

  const ENDPOINT = '/.netlify/functions/echo-companion';
  const STORAGE_PREF_KEY = 'sanctuary_echo_prefs_v1';
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ANCHOR_WORDS = [
    { word: 'STILLNESS', line: 'Soften your shoulders. Nothing is chasing you in this moment.' },
    { word: 'ROOTED', line: 'Feel the floor beneath you—steady, quiet, and already enough.' },
    { word: 'COURAGE', line: 'Your real voice belongs in the room without needing perfection.' },
    { word: 'EXHALE', line: 'Let the last hour melt outward with a slow, unhurried breath.' },
    { word: 'BELONG', line: 'No one heals alone here. You already have a seat by the hearth.' },
    { word: 'RADIANT', line: 'What glows gently inside you does not have to shout to shine.' },
    { word: 'MERCY', line: 'Treat yourself tonight with the warmth you offer your closest friend.' }
  ];

  const ELEMENT_LABELS = {
    fire: '🔥 Fire Warmth',
    water: '🌊 Water Creek Calm',
    earth: '🌿 Earth Stillness',
    air: '🌬️ Air Open Sky',
    ether: '🌌 Ether Starlight'
  };

  function loadPrefs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_PREF_KEY) || '{}');
    } catch (_) {
      return {};
    }
  }

  function savePrefs(next) {
    try {
      localStorage.setItem(STORAGE_PREF_KEY, JSON.stringify(next));
    } catch (_) {}
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  function detectCurrentPage() {
    const p = (window.location.pathname || '').toLowerCase();
    if (p.includes('community-hub')) return 'community-hub';
    if (p.includes('bracelet')) return 'bracelet-weaver';
    if (p.includes('labyrinth')) return 'digital-labyrinth';
    return 'home';
  }

  function buildUI() {
    if (document.getElementById('echoSparkLayer')) return;

    const layer = document.createElement('div');
    layer.id = 'echoSparkLayer';
    layer.className = 'echo-spark-layer';

    layer.innerHTML = `
      <div id="echoSparkActor" class="echo-spark-actor">
        <div id="echoWhisperBubble" class="echo-whisper-bubble" role="status" aria-live="polite">
          <span id="echoWhisperText"></span>
          <button type="button" id="echoWhisperClose" class="echo-whisper-close" aria-label="Dismiss Echo whisper">&times;</button>
        </div>
        <button type="button" id="echoSpriteBtn" class="echo-sprite-btn" aria-label="Chat with Echo, your Sanctuary Spark Friend" title="Hey! I'm Echo — tap to chat or drag me anywhere">
          <span class="echo-halo-aura" aria-hidden="true"></span>
          <span class="echo-wing echo-wing--left" aria-hidden="true"></span>
          <span class="echo-wing echo-wing--right" aria-hidden="true"></span>
          <span class="echo-core-star" aria-hidden="true"></span>
          <span class="echo-name-pill">Echo</span>
        </button>
      </div>

      <button type="button" id="echoSummonPill" class="echo-summon-pill" hidden aria-label="Summon Echo Sanctuary Spark">
        <span class="echo-summon-dot" aria-hidden="true"></span>
        <span>Summon Echo</span>
      </button>

      <section id="echoCompanionWindow" class="echo-companion-window" role="dialog" aria-label="Echo Sanctuary Friend" aria-hidden="true">
        <header id="echoWinHeader" class="echo-win-header">
          <div class="echo-win-identity">
            <div class="echo-avatar-mini" aria-hidden="true"></div>
            <div>
              <div class="echo-win-title">Echo • Sanctuary Spark</div>
              <div id="echoWinStatus" class="echo-win-status">🕯️ Sanctuary Friend Ready</div>
            </div>
          </div>
          <div class="echo-win-controls">
            <button type="button" id="echoSpeakToggleBtn" class="echo-icon-btn" aria-pressed="false" title="Read Echo replies softly aloud">🔇 Voice</button>
            <button type="button" id="echoRoamToggleBtn" class="echo-icon-btn" aria-pressed="true" title="Toggle Echo gently flying around screen">🪽 Roam</button>
            <button type="button" id="echoHideBtn" class="echo-icon-btn" title="Tuck Echo into a corner pill">―</button>
            <button type="button" id="echoCloseBtn" class="echo-icon-btn" aria-label="Close Echo window" title="Close">&times;</button>
          </div>
        </header>

        <div class="echo-win-tabs" role="tablist" aria-label="Echo Modes">
          <button type="button" class="echo-tab-btn active" data-echo-tab="chat" role="tab" aria-selected="true">💬 Talk</button>
          <button type="button" class="echo-tab-btn" data-echo-tab="guide" role="tab" aria-selected="false">🧭 Guide</button>
          <button type="button" class="echo-tab-btn" data-echo-tab="studio" role="tab" aria-selected="false">✨ Spark Lab</button>
        </div>

        <div id="echoTabChat" class="echo-win-body" style="padding-bottom:6px;">
          <div id="echoChatStream" class="echo-chat-stream"></div>
        </div>

        <div id="echoTabGuide" class="echo-win-body" hidden></div>
        <div id="echoTabStudio" class="echo-win-body" hidden></div>

        <div id="echoStarterRow" class="echo-starter-row">
          <button type="button" class="echo-starter-chip" data-echo-prompt="Match my room vibe — my head feels busy today.">🌊 Calm my vibe</button>
          <button type="button" class="echo-starter-chip" data-echo-prompt="Tell me everything about the Dec 10 open mic in Santa Ana!">🎶 Dec 10 Jam</button>
          <button type="button" class="echo-starter-chip" data-echo-prompt="Help me write 4 warm lines to read at open mic.">✍️ Lyric spark</button>
          <button type="button" class="echo-starter-chip" data-echo-prompt="Quick 30-second overview for a donor or grant officer?">📄 501(c)(3) Info</button>
        </div>

        <form id="echoComposerForm" class="echo-composer">
          <input id="echoComposerInput" class="echo-composer-input" type="text" maxlength="500" placeholder="Tell Echo how you're feeling or ask anything..." autocomplete="off" />
          <button type="submit" id="echoSendBtn" class="echo-send-btn">Send ✦</button>
        </form>
        <div class="echo-disclaimer">Echo is your supportive Sanctuary friend — not medical or clinical therapy. Crisis? Text/Call 988.</div>
      </section>
    `;

    document.body.appendChild(layer);
  }

  function initEcho() {
    if (typeof window !== 'undefined' && window.self !== window.top) return;
    buildUI();

    const prefs = loadPrefs();
    let isOpen = false;
    let isHidden = Boolean(prefs.hidden);
    let isRoaming = prefs.roam !== false && !prefersReducedMotion;
    let speakEnabled = Boolean(prefs.speak);
    let activeTab = 'chat';
    let previousInteractionId = '';
    let liveGemini = false;
    let anchorIdx = 0;

    // Physics state
    let posX = Math.max(40, window.innerWidth - 94);
    let posY = Math.max(120, Math.round(window.innerHeight * 0.56));
    let targetX = posX;
    let targetY = posY;
    let isHovered = false;
    let isDraggingSprite = false;
    let pointerMovedDuringDrag = false;
    let lastTrailAt = 0;
    let whisperTimer = null;
    let ambientWhisperLoop = null;
    let rafId = null;

    const actor = document.getElementById('echoSparkActor');
    const spriteBtn = document.getElementById('echoSpriteBtn');
    const whisperBubble = document.getElementById('echoWhisperBubble');
    const whisperTextEl = document.getElementById('echoWhisperText');
    const whisperClose = document.getElementById('echoWhisperClose');
    const summonPill = document.getElementById('echoSummonPill');
    const winEl = document.getElementById('echoCompanionWindow');
    const winHeader = document.getElementById('echoWinHeader');
    const statusEl = document.getElementById('echoWinStatus');
    const chatStream = document.getElementById('echoChatStream');
    const starterRow = document.getElementById('echoStarterRow');
    const composerForm = document.getElementById('echoComposerForm');
    const composerInput = document.getElementById('echoComposerInput');
    const sendBtn = document.getElementById('echoSendBtn');
    const roamBtn = document.getElementById('echoRoamToggleBtn');
    const speakBtn = document.getElementById('echoSpeakToggleBtn');

    function persistPrefs() {
      savePrefs({ hidden: isHidden, roam: isRoaming, speak: speakEnabled });
    }

    function pickSafeTarget() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const inTheater = document.body.classList.contains('cinema-theater-mode');
      const padX = w < 640 ? 28 : 42;
      const minY = inTheater ? 74 : 96;
      const maxY = Math.max(minY + 80, h - (inTheater ? 110 : 96));

      // Keep clear of middle reading block by favoring soft outer corridor lanes on wide screens
      if (w >= 820 && !inTheater) {
        const useLeft = Math.random() < 0.36;
        targetX = useLeft ? padX + Math.random() * 110 : w - 160 + Math.random() * 95;
      } else {
        targetX = padX + Math.random() * Math.max(40, w - padX * 2 - 48);
      }
      targetY = minY + Math.random() * Math.max(40, maxY - minY);
    }

    function spawnTrailMote(x, y) {
      if (prefersReducedMotion || isHidden || isOpen) return;
      const layer = document.getElementById('echoSparkLayer');
      if (!layer) return;
      const mote = document.createElement('span');
      mote.className = 'echo-trail-mote';
      mote.style.left = `${x + 24}px`;
      mote.style.top = `${y + 24}px`;
      layer.appendChild(mote);
      requestAnimationFrame(() => {
        mote.style.opacity = '0';
        mote.style.transform = 'translate(-50%, -50%) scale(0.2)';
      });
      setTimeout(() => mote.remove(), 680);
    }

    let stepCount = 0;
    function tickFlight() {
      if (isHidden) {
        rafId = null;
        return;
      }
      stepCount += 1;

      if (isRoaming && !isHovered && !isDraggingSprite && !isOpen) {
        const dx = targetX - posX;
        const dy = targetY - posY;
        const dist = Math.hypot(dx, dy);

        if (dist < 18 || stepCount % 320 === 0) {
          pickSafeTarget();
        } else {
          // Gentle firefly ease + subtle wing bob
          posX += dx * 0.014;
          posY += dy * 0.014 + Math.sin(stepCount * 0.05) * 0.35;
        }

        const now = Date.now();
        if (dist > 28 && now - lastTrailAt > 240) {
          lastTrailAt = now;
          spawnTrailMote(posX, posY);
        }
      }

      const maxX = Math.max(16, window.innerWidth - 62);
      const maxY = Math.max(70, window.innerHeight - 68);
      posX = Math.min(maxX, Math.max(12, posX));
      posY = Math.min(maxY, Math.max(70, posY));

      if (actor) {
        actor.style.transform = `translate3d(${posX.toFixed(1)}px, ${posY.toFixed(1)}px, 0)`;
      }
      if (whisperBubble) {
        whisperBubble.classList.toggle('is-left-side', posX < window.innerWidth * 0.45);
      }

      rafId = requestAnimationFrame(tickFlight);
    }

    function ensureFlightLoop() {
      if (!isHidden && !rafId) {
        rafId = requestAnimationFrame(tickFlight);
      }
    }

    function hideWhisper() {
      if (whisperBubble) whisperBubble.classList.remove('is-visible');
      if (whisperTimer) {
        clearTimeout(whisperTimer);
        whisperTimer = null;
      }
    }

    function showWhisper(text, durationMs = 6800) {
      if (isHidden || isOpen || !whisperBubble || !whisperTextEl) return;
      whisperTextEl.textContent = text;
      whisperBubble.classList.toggle('is-left-side', posX < window.innerWidth * 0.45);
      whisperBubble.classList.add('is-visible');
      if (whisperTimer) clearTimeout(whisperTimer);
      whisperTimer = setTimeout(hideWhisper, durationMs);
    }

    function speakTextSoftly(text) {
      if (!speakEnabled || !('speechSynthesis' in window) || !text) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.94;
        utter.pitch = 1.06;
        utter.volume = 0.85;
        window.speechSynthesis.speak(utter);
      } catch (_) {}
    }

    function syncVisibilityState() {
      if (actor) actor.hidden = isHidden || isOpen;
      if (summonPill) summonPill.hidden = !isHidden || isOpen;
      if (roamBtn) {
        roamBtn.classList.toggle('active', isRoaming);
        roamBtn.setAttribute('aria-pressed', isRoaming ? 'true' : 'false');
        roamBtn.textContent = isRoaming ? '🪽 Roam' : '📍 Perched';
      }
      if (speakBtn) {
        speakBtn.classList.toggle('active', speakEnabled);
        speakBtn.setAttribute('aria-pressed', speakEnabled ? 'true' : 'false');
        speakBtn.textContent = speakEnabled ? '🔊 Voice On' : '🔇 Voice';
      }
      if (winEl) {
        winEl.classList.toggle('is-open', isOpen);
        winEl.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      }
      if (!isHidden) ensureFlightLoop();
    }

    function executeEchoAction(actionType) {
      switch (actionType) {
        case 'open_theater':
          if (window.sanctuaryCinema && typeof window.sanctuaryCinema.toggleTheater === 'function') {
            window.sanctuaryCinema.toggleTheater(true);
          }
          break;
        case 'open_pause':
          if (typeof window.openPauseModal === 'function') {
            window.openPauseModal();
          }
          break;
        case 'open_flyer':
          if (window.sanctuaryCinema && typeof window.sanctuaryCinema.openInviteFlyer === 'function') {
            window.sanctuaryCinema.openInviteFlyer();
          }
          break;
        case 'open_dossier':
          if (typeof window.openFunderDossierModal === 'function') {
            window.openFunderDossierModal();
          } else {
            const portal = document.getElementById('grant-hub-portal');
            if (portal) portal.scrollIntoView({ behavior: 'smooth' });
            else window.location.href = 'index.html#grant-hub-portal';
          }
          break;
        case 'open_zeffy':
          if (typeof window.openZeffyModal === 'function') {
            window.openZeffyModal();
          }
          break;
        case 'open_bracelet':
          if (document.getElementById('bracelet-creator') && window.sanctuaryHubWings) {
            window.sanctuaryHubWings.focusClubhouseZone('bracelet', { scroll: true });
          } else {
            window.location.href = 'bracelet-weaver.html';
          }
          break;
        case 'open_hub':
          window.location.href = 'community-hub.html';
          break;
        case 'play_bowl':
          if (window.sanctuaryCinema && typeof window.sanctuaryCinema.playBowl === 'function') {
            window.sanctuaryCinema.playBowl();
          }
          break;
        case 'toggle_sound':
          if (window.soundscape && typeof window.soundscape.toggle === 'function') {
            window.soundscape.toggle();
          }
          break;
        default:
          break;
      }
    }

    function appendMessage(role, text, meta = {}) {
      if (!chatStream) return;
      const row = document.createElement('div');
      row.className = `echo-msg-row echo-msg-row--${role}`;

      const bubble = document.createElement('div');
      bubble.className = 'echo-msg-bubble';
      bubble.textContent = text;
      row.appendChild(bubble);

      if (role === 'echo' && meta.anchorWord) {
        const badge = document.createElement('span');
        badge.className = 'echo-anchor-badge';
        badge.textContent = `✦ Anchor Word: ${meta.anchorWord}`;
        row.appendChild(badge);
      }

      if (role === 'echo' && (meta.suggestedElement || meta.actionType)) {
        const actionsWrap = document.createElement('div');
        actionsWrap.className = 'echo-action-pills';

        if (meta.suggestedElement && ELEMENT_LABELS[meta.suggestedElement]) {
          const elBtn = document.createElement('button');
          elBtn.type = 'button';
          elBtn.className = 'echo-action-chip';
          elBtn.textContent = `Sync ${ELEMENT_LABELS[meta.suggestedElement]}`;
          elBtn.addEventListener('click', () => {
            if (window.switchElementTheme) window.switchElementTheme(meta.suggestedElement, true);
            elBtn.textContent = `✓ Synced ${ELEMENT_LABELS[meta.suggestedElement]}`;
          });
          actionsWrap.appendChild(elBtn);
        }

        if (meta.actionType) {
          const actBtn = document.createElement('button');
          actBtn.type = 'button';
          actBtn.className = 'echo-action-chip';
          actBtn.textContent = meta.actionLabel || 'Open Sanctuary Space ✨';
          actBtn.addEventListener('click', () => executeEchoAction(meta.actionType));
          actionsWrap.appendChild(actBtn);
        }

        row.appendChild(actionsWrap);
      }

      chatStream.appendChild(row);
      const body = document.getElementById('echoTabChat');
      if (body) body.scrollTop = body.scrollHeight;
    }

    async function checkBackendHealth() {
      try {
        const res = await fetch(ENDPOINT);
        if (!res.ok) return;
        const data = await res.json();
        liveGemini = Boolean(data && data.liveGeminiConfigured);
        if (statusEl) {
          statusEl.textContent = liveGemini ? '✨ Live Gemini Spark Active' : '🕯️ Sanctuary Friend Guide';
        }
      } catch (_) {}
    }

    async function sendChatMessage(rawText) {
      const msg = String(rawText || '').trim();
      if (!msg) return;
      appendMessage('user', msg);
      if (composerInput) composerInput.value = '';
      if (sendBtn) sendBtn.disabled = true;

      const typingRow = document.createElement('div');
      typingRow.className = 'echo-msg-row echo-msg-row--echo';
      typingRow.innerHTML = '<div class="echo-msg-bubble" style="opacity:0.7;">✨ Listening gently...</div>';
      if (chatStream) chatStream.appendChild(typingRow);

      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: msg,
            previousInteractionId,
            context: {
              page: detectCurrentPage(),
              element: document.body.getAttribute('data-element') || 'fire',
              inTheater: document.body.classList.contains('cinema-theater-mode')
            }
          })
        });
        const data = await res.json();
        typingRow.remove();

        if (data && data.interactionId) {
          previousInteractionId = data.interactionId;
        }
        const reply = (data && data.reply) || "I'm right here with you beside the hearth.";
        if (data && data.mode === 'gemini-live' && statusEl) {
          liveGemini = true;
          statusEl.textContent = '✨ Live Gemini Spark Active';
        }
        appendMessage('echo', reply, {
          suggestedElement: data && data.suggestedElement,
          actionType: data && data.actionType,
          actionLabel: data && data.actionLabel,
          anchorWord: data && data.anchorWord
        });
        speakTextSoftly(reply);
      } catch (_) {
        typingRow.remove();
        const fallback = "I'm glowing right here with you! Ask about Dec 10 in Santa Ana, draw an Anchor Word in Spark Lab, or let's launch Theater Mode.";
        appendMessage('echo', fallback, {
          suggestedElement: 'fire',
          actionType: 'open_theater',
          actionLabel: '🎭 Launch Theater Mode'
        });
      } finally {
        if (sendBtn) sendBtn.disabled = false;
        if (composerInput) composerInput.focus();
      }
    }

    function renderGuideTab() {
      const el = document.getElementById('echoTabGuide');
      if (!el) return;
      el.innerHTML = `
        <div class="echo-info-card">
          <div class="echo-info-kicker">🎶 Next Free Gathering</div>
          <h4 class="echo-info-heading">Jam Session: The Unplugged Playground</h4>
          <p class="echo-info-copy">Thursday, Dec 10, 2026 • 6:00–8:00 PM PST<br>📍 1501 W Alton Ave, Santa Ana, CA<br>100% Free Admission • Substance-Free • Bring an acoustic instrument or just listen.</p>
          <div class="echo-action-pills">
            <button type="button" class="echo-action-chip" data-echo-act="open_flyer">🎨 Bring-a-Friend Flyer</button>
            <a href="https://www.meetup.com/socal-creatives-collective/events/317462800/" target="_blank" rel="noopener noreferrer" class="echo-action-chip" style="text-decoration:none;">🎟️ Meetup RSVP ↗</a>
          </div>
        </div>

        <div class="echo-info-card">
          <div class="echo-info-kicker">🏛️ 501(c)(3) Nonprofit Snapshot</div>
          <h4 class="echo-info-heading">Inner Sanctuary Wellness Foundation</h4>
          <p class="echo-info-copy">IRS EIN: <strong>39-3757168</strong> • Founded by <strong>Teshia Campbell</strong> &amp; led with President <strong>Marlon Smith</strong>. Zero-fee $1 Community Seeds sustain substance-free arts &amp; wellness nights across Orange County.</p>
          <div class="echo-action-pills">
            <button type="button" class="echo-action-chip" data-echo-act="open_dossier">📊 Open Grant Dossier</button>
            <button type="button" class="echo-action-chip" data-echo-act="open_zeffy">🌱 Plant $1 Seed</button>
          </div>
        </div>

        <div class="echo-info-card">
          <div class="echo-info-kicker">🧭 Explore Sanctuary Portals</div>
          <div class="echo-action-pills">
            <button type="button" class="echo-action-chip" data-echo-act="open_theater">🎭 Theater Mode</button>
            <button type="button" class="echo-action-chip" data-echo-act="open_hub">🏡 Community Hub</button>
            <button type="button" class="echo-action-chip" data-echo-act="open_bracelet">📿 Bracelet Weaver</button>
            <button type="button" class="echo-action-chip" data-echo-act="open_pause">🍃 60s Pause Reset</button>
          </div>
        </div>
      `;
      el.querySelectorAll('[data-echo-act]').forEach((btn) => {
        btn.addEventListener('click', () => executeEchoAction(btn.getAttribute('data-echo-act')));
      });
    }

    function renderStudioTab() {
      const el = document.getElementById('echoTabStudio');
      if (!el) return;
      const item = ANCHOR_WORDS[anchorIdx % ANCHOR_WORDS.length];
      el.innerHTML = `
        <div class="echo-info-card">
          <div class="echo-info-kicker">🎲 Today's Anchor Word</div>
          <div id="echoAnchorWordBox" class="echo-word-display">${item.word}</div>
          <p id="echoAnchorLine" class="echo-info-copy" style="text-align:center;">${item.line}</p>
          <div class="echo-action-pills" style="justify-content:center;">
            <button type="button" id="echoNextAnchorBtn" class="echo-action-chip">✨ Draw Another Word</button>
            <button type="button" id="echoGoBraceletBtn" class="echo-action-chip">📿 Weave Bracelet</button>
          </div>
        </div>

        <div class="echo-info-card">
          <div class="echo-info-kicker">🎙️ Stage Muse (Instant Writing Spark)</div>
          <p class="echo-info-copy">Prepping a poem, song, or honesty share? Pick a mood and Echo will write a 4-line spark in chat:</p>
          <div class="echo-action-pills">
            <button type="button" class="echo-action-chip" data-muse="Write a 4-line hopeful acoustic open mic opener for an unplugged room in Santa Ana.">🌅 Hopeful</button>
            <button type="button" class="echo-action-chip" data-muse="Write 4 tender spoken-word lines about laying down heavy burdens and exhaling.">🌊 Tender</button>
            <button type="button" class="echo-action-chip" data-muse="Write a warm 4-line gratitude verse about finding real community around a fire.">🔥 Grateful</button>
          </div>
        </div>

        <div class="echo-info-card">
          <div class="echo-info-kicker">🔔 Sonic &amp; Element Reset</div>
          <div class="echo-action-pills">
            <button type="button" id="echoBowlPlayBtn" class="echo-action-chip">🔔 Ring 432Hz Bowl</button>
            <button type="button" class="echo-action-chip" data-el-shift="fire">🔥 Fire</button>
            <button type="button" class="echo-action-chip" data-el-shift="water">🌊 Water</button>
            <button type="button" class="echo-action-chip" data-el-shift="earth">🌿 Earth</button>
            <button type="button" class="echo-action-chip" data-el-shift="air">🌬️ Air</button>
            <button type="button" class="echo-action-chip" data-el-shift="ether">🌌 Ether</button>
          </div>
        </div>
      `;

      el.querySelector('#echoNextAnchorBtn').addEventListener('click', () => {
        anchorIdx = (anchorIdx + 1) % ANCHOR_WORDS.length;
        const next = ANCHOR_WORDS[anchorIdx];
        document.getElementById('echoAnchorWordBox').textContent = next.word;
        document.getElementById('echoAnchorLine').textContent = next.line;
      });
      el.querySelector('#echoGoBraceletBtn').addEventListener('click', () => executeEchoAction('open_bracelet'));
      el.querySelector('#echoBowlPlayBtn').addEventListener('click', () => executeEchoAction('play_bowl'));

      el.querySelectorAll('[data-el-shift]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const k = btn.getAttribute('data-el-shift');
          if (window.switchElementTheme) window.switchElementTheme(k, true);
        });
      });

      el.querySelectorAll('[data-muse]').forEach((btn) => {
        btn.addEventListener('click', () => {
          switchTab('chat');
          sendChatMessage(btn.getAttribute('data-muse'));
        });
      });
    }

    function switchTab(nextTab) {
      activeTab = nextTab;
      document.querySelectorAll('.echo-tab-btn[data-echo-tab]').forEach((btn) => {
        const match = btn.getAttribute('data-echo-tab') === nextTab;
        btn.classList.toggle('active', match);
        btn.setAttribute('aria-selected', match ? 'true' : 'false');
      });

      const chatEl = document.getElementById('echoTabChat');
      const guideEl = document.getElementById('echoTabGuide');
      const studioEl = document.getElementById('echoTabStudio');
      if (chatEl) chatEl.hidden = nextTab !== 'chat';
      if (guideEl) guideEl.hidden = nextTab !== 'guide';
      if (studioEl) studioEl.hidden = nextTab !== 'studio';
      if (starterRow) starterRow.style.display = nextTab === 'chat' ? 'flex' : 'none';
      if (composerForm) composerForm.style.display = nextTab === 'chat' ? 'flex' : 'none';
    }

    function openWindow(tab = 'chat') {
      isOpen = true;
      isHidden = false;
      hideWhisper();
      syncVisibilityState();
      switchTab(tab);
      checkBackendHealth();
      if (tab === 'chat' && composerInput) {
        setTimeout(() => composerInput.focus(), 120);
      }
    }

    function closeWindow() {
      isOpen = false;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      syncVisibilityState();
    }

    // Bind events
    if (spriteBtn) {
      spriteBtn.addEventListener('mouseenter', () => { isHovered = true; });
      spriteBtn.addEventListener('mouseleave', () => { isHovered = false; });

      // Support dragging the flying sprite anywhere, or clicking it to open Echo
      let dragStartX = 0;
      let dragStartY = 0;
      let spriteOrigX = 0;
      let spriteOrigY = 0;

      spriteBtn.addEventListener('pointerdown', (e) => {
        isDraggingSprite = true;
        pointerMovedDuringDrag = false;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        spriteOrigX = posX;
        spriteOrigY = posY;
        if (actor) actor.classList.add('is-dragging');
        spriteBtn.setPointerCapture(e.pointerId);
      });

      spriteBtn.addEventListener('pointermove', (e) => {
        if (!isDraggingSprite) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        if (Math.hypot(dx, dy) > 6) pointerMovedDuringDrag = true;
        posX = spriteOrigX + dx;
        posY = spriteOrigY + dy;
        targetX = posX;
        targetY = posY;
      });

      const endSpriteDrag = (e) => {
        if (!isDraggingSprite) return;
        isDraggingSprite = false;
        if (actor) actor.classList.remove('is-dragging');
        try { spriteBtn.releasePointerCapture(e.pointerId); } catch (_) {}
      };
      spriteBtn.addEventListener('pointerup', endSpriteDrag);
      spriteBtn.addEventListener('pointercancel', endSpriteDrag);

      spriteBtn.addEventListener('click', () => {
        if (pointerMovedDuringDrag) return;
        openWindow('chat');
      });
    }

    if (whisperBubble) {
      whisperBubble.addEventListener('click', (e) => {
        if (e.target.closest('#echoWhisperClose')) {
          e.stopPropagation();
          hideWhisper();
          return;
        }
        openWindow('chat');
      });
    }

    if (summonPill) {
      summonPill.addEventListener('click', () => {
        isHidden = false;
        persistPrefs();
        syncVisibilityState();
        showWhisper("I'm back glowing beside you ✨", 4200);
      });
    }

    document.getElementById('echoCloseBtn').addEventListener('click', closeWindow);
    document.getElementById('echoHideBtn').addEventListener('click', () => {
      isOpen = false;
      isHidden = true;
      persistPrefs();
      syncVisibilityState();
    });

    if (roamBtn) {
      roamBtn.addEventListener('click', () => {
        isRoaming = !isRoaming;
        persistPrefs();
        syncVisibilityState();
      });
    }

    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        speakEnabled = !speakEnabled;
        if (!speakEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
        persistPrefs();
        syncVisibilityState();
      });
    }

    document.querySelectorAll('.echo-tab-btn[data-echo-tab]').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.getAttribute('data-echo-tab')));
    });

    document.querySelectorAll('.echo-starter-chip[data-echo-prompt]').forEach((btn) => {
      btn.addEventListener('click', () => sendChatMessage(btn.getAttribute('data-echo-prompt')));
    });

    if (composerForm) {
      composerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendChatMessage(composerInput ? composerInput.value : '');
      });
    }

    // Draggable Echo Window Header on Desktop
    if (winHeader && winEl) {
      let winDrag = false;
      let wStartX = 0;
      let wStartY = 0;
      let wLeft = 0;
      let wTop = 0;

      winHeader.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button') || window.innerWidth <= 640) return;
        winDrag = true;
        const rect = winEl.getBoundingClientRect();
        wLeft = rect.left;
        wTop = rect.top;
        winEl.style.left = `${wLeft}px`;
        winEl.style.top = `${wTop}px`;
        winEl.style.right = 'auto';
        winEl.style.bottom = 'auto';
        wStartX = e.clientX;
        wStartY = e.clientY;
        winHeader.setPointerCapture(e.pointerId);
      });

      winHeader.addEventListener('pointermove', (e) => {
        if (!winDrag) return;
        const maxL = Math.max(8, window.innerWidth - winEl.offsetWidth - 8);
        const maxT = Math.max(8, window.innerHeight - winEl.offsetHeight - 8);
        winEl.style.left = `${Math.min(maxL, Math.max(8, wLeft + (e.clientX - wStartX)))}px`;
        winEl.style.top = `${Math.min(maxT, Math.max(8, wTop + (e.clientY - wStartY)))}px`;
      });

      const endWinDrag = (e) => {
        if (!winDrag) return;
        winDrag = false;
        try { winHeader.releasePointerCapture(e.pointerId); } catch (_) {}
      };
      winHeader.addEventListener('pointerup', endWinDrag);
      winHeader.addEventListener('pointercancel', endWinDrag);
    }

    // Seed initial greeting, Guide, Studio & periodic gentle whispers
    appendMessage(
      'echo',
      "Hey friend — I'm Echo, your wandering Sanctuary Spark! Tell me how today's been feeling, ask anything about Dec 10 in Santa Ana, or tap Spark Lab for an Anchor Word & open mic inspiration.",
      {
        suggestedElement: '',
        actionType: 'open_theater',
        actionLabel: '🎭 Step Into Theater'
      }
    );
    renderGuideTab();
    renderStudioTab();
    syncVisibilityState();

    // React gently when Element changes or Theater Mode opens
    const bodyObserver = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.attributeName === 'data-element') {
          const elKey = document.body.getAttribute('data-element') || 'fire';
          showWhisper(`Synced glow to ${ELEMENT_LABELS[elKey] || elKey} ✨`, 4200);
        } else if (m.attributeName === 'class' && document.body.classList.contains('cinema-theater-mode')) {
          showWhisper('Ooh Theater Mode 🎭 Need a vibe switch or song spark?', 4500);
        }
      }
    });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['data-element', 'class'] });

    setTimeout(() => {
      showWhisper("Psst — I'm Echo! Tap me for calm vibes, Dec 10 info, or a spark ✨", 6500);
    }, 2800);

    const PERIODIC_WHISPERS = [
      'No pressure to perform tonight. Unclench your jaw for one breath ✨',
      'Want a custom 4-line open mic spark or an Anchor Word? Tap me!',
      'Dec 10 Unplugged Jam at 1501 W Alton Ave is 100% free & alcohol-free 🎶',
      'Drag me anywhere or click 🪽 Roam to perch me gently on your screen.'
    ];
    let wIdx = 0;
    ambientWhisperLoop = setInterval(() => {
      if (!document.hidden && !isOpen && !isHidden && Math.random() < 0.55) {
        showWhisper(PERIODIC_WHISPERS[wIdx % PERIODIC_WHISPERS.length], 5800);
        wIdx += 1;
      }
    }, 45000);

    window.sanctuaryEcho = {
      open: openWindow,
      close: closeWindow,
      whisper: showWhisper,
      ask: (prompt) => {
        openWindow('chat');
        sendChatMessage(prompt);
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEcho);
  } else {
    initEcho();
  }
})();
