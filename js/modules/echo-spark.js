/**
 * Inner Sanctuary Wellness Foundation — "Echo" the Living Sanctuary Spark
 * A gentle wandering companion sprite + interactive Gemini-powered guide window
 * offering mood-matched Sanctuary actions, informative 501(c)(3)/event answers,
 * Anchor Word creation, Open Mic inspiration, and offline fallback intelligence.
 */
(function () {
  'use strict';

  const ENDPOINT = '/.netlify/functions/echo-companion';
  const TTS_ENDPOINT = '/.netlify/functions/echo-tts';
  const STORAGE_PREF_KEY = 'sanctuary_echo_prefs_v1';
  const STORAGE_SESSION_KEY = 'sanctuary_echo_session_v1';
  const MAX_SESSION_MESSAGES = 18;
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

  function loadSessionMemory() {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(STORAGE_SESSION_KEY) || '{}');
      return {
        previousInteractionId: typeof parsed.previousInteractionId === 'string' ? parsed.previousInteractionId : '',
        messages: Array.isArray(parsed.messages) ? parsed.messages.slice(-MAX_SESSION_MESSAGES) : []
      };
    } catch (_) {
      return { previousInteractionId: '', messages: [] };
    }
  }

  function saveSessionMemory(state) {
    try {
      sessionStorage.setItem(
        STORAGE_SESSION_KEY,
        JSON.stringify({
          previousInteractionId: state.previousInteractionId || '',
          messages: (state.messages || []).slice(-MAX_SESSION_MESSAGES)
        })
      );
    } catch (_) {}
  }

  let standaloneBowlCtx = null;
  function playStandaloneBowl() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return false;
      if (!standaloneBowlCtx) standaloneBowlCtx = new Ctx();
      if (standaloneBowlCtx.state === 'suspended') standaloneBowlCtx.resume();
      const now = standaloneBowlCtx.currentTime;
      const master = standaloneBowlCtx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.linearRampToValueAtTime(0.2, now + 0.04);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);
      master.connect(standaloneBowlCtx.destination);
      [
        { freq: 216, gain: 0.42, decay: 4.1 },
        { freq: 432, gain: 0.58, decay: 3.9 },
        { freq: 648, gain: 0.2, decay: 2.9 },
        { freq: 1084, gain: 0.08, decay: 2.0 }
      ].forEach((p) => {
        const osc = standaloneBowlCtx.createOscillator();
        const g = standaloneBowlCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(p.freq, now);
        g.gain.setValueAtTime(p.gain, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + p.decay);
        osc.connect(g);
        g.connect(master);
        osc.start(now);
        osc.stop(now + p.decay + 0.05);
      });
      return true;
    } catch (_) {
      return false;
    }
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
          <svg class="echo-ember-svg" viewBox="0 0 64 64" width="52" height="52" aria-hidden="true">
            <defs>
              <radialGradient id="echoEmberOuter" cx="50%" cy="62%" r="55%">
                <stop offset="0%" stop-color="#FFFFFF" />
                <stop offset="45%" stop-color="var(--echo-core)" />
                <stop offset="100%" stop-color="var(--echo-mid)" />
              </radialGradient>
              <linearGradient id="echoStarGleam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
                <stop offset="55%" stop-color="var(--echo-core)" stop-opacity="0.85" />
                <stop offset="100%" stop-color="var(--echo-mid)" stop-opacity="0.2" />
              </linearGradient>
            </defs>
            <!-- Tall slender celestial 4-point star flare -->
            <path class="echo-svg-flare" d="M32 2 L34.2 28.5 L58 32 L34.2 35.5 L32 62 L29.8 35.5 L6 32 L29.8 28.5 Z" fill="url(#echoStarGleam)" />
            <!-- Organic teardrop ember flame body -->
            <path class="echo-svg-flame" d="M32 13 C38.5 24 42.5 32.5 42.5 40 C42.5 46.2 37.8 51 32 51 C26.2 51 21.5 46.2 21.5 40 C21.5 32.5 25.5 24 32 13 Z" fill="url(#echoEmberOuter)" />
            <!-- White-hot inner spark tongue -->
            <path class="echo-svg-tongue" d="M32 23 C35.5 30 37.5 35.2 37.5 39.5 C37.5 43.2 35.1 46 32 46 C28.9 46 26.5 43.2 26.5 39.5 C26.5 35.2 28.5 30 32 23 Z" fill="#FFFFFF" opacity="0.94" />
            <!-- Tiny rising ember flecks -->
            <circle class="echo-svg-fleck echo-svg-fleck--1" cx="22" cy="18" r="1.7" fill="#FFFDF7" />
            <circle class="echo-svg-fleck echo-svg-fleck--2" cx="43" cy="21" r="1.4" fill="var(--echo-core)" />
            <circle class="echo-svg-fleck echo-svg-fleck--3" cx="32" cy="8" r="1.5" fill="#FFFFFF" />
          </svg>
          <span class="echo-name-pill">Echo</span>
        </button>
      </div>

      <button type="button" id="echoSummonPill" class="echo-summon-pill" hidden aria-label="Summon Echo Sanctuary Spark">
        <span class="echo-summon-dot" aria-hidden="true"></span>
        <span>Summon Echo</span>
      </button>

      <section id="echoCompanionWindow" class="echo-companion-window" data-echo-theme="prism" role="dialog" aria-label="Echo Sanctuary Friend" aria-hidden="true">
        <header id="echoWinHeader" class="echo-win-header">
          <div class="echo-win-identity">
            <div class="echo-avatar-mini" aria-hidden="true"></div>
            <div>
              <div class="echo-win-title">Echo</div>
              <div id="echoWinStatus" class="echo-win-status">Your Celestial Spark</div>
            </div>
          </div>
          <div class="echo-win-controls">
            <button type="button" id="echoModeToggleBtn" class="echo-icon-btn" title="Switch between Chat and Daily Reflection Mirror">🪞 Reflect</button>
            <button type="button" id="echoMenuBtn" class="echo-icon-btn echo-icon-btn--round" aria-expanded="false" aria-controls="echoMenuPopover" title="Themes &amp; Echo Settings">⋯</button>
            <button type="button" id="echoCloseBtn" class="echo-icon-btn echo-icon-btn--round" aria-label="Close Echo window" title="Close">&times;</button>
          </div>
        </header>

        <div id="echoMenuPopover" class="echo-menu-popover" hidden>
          <div class="echo-menu-label">Mirror Theme</div>
          <div class="echo-theme-grid">
            <button type="button" class="echo-theme-swatch active" data-echo-theme-pick="prism">🔮 Prism</button>
            <button type="button" class="echo-theme-swatch" data-echo-theme-pick="mist">🌸 Mist</button>
            <button type="button" class="echo-theme-swatch" data-echo-theme-pick="portal">✨ Star</button>
          </div>
          <div class="echo-menu-actions">
            <button type="button" id="echoSpeakToggleBtn" class="echo-menu-item" aria-pressed="false">🔇 Voice Read-Aloud: Off</button>
            <button type="button" id="echoRoamToggleBtn" class="echo-menu-item" aria-pressed="true">🪽 Spark Flight: Roaming</button>
            <button type="button" id="echoOpenGuideBtn" class="echo-menu-item">🧭 Sanctuary Guide &amp; Dec 10</button>
            <button type="button" id="echoResetChatBtn" class="echo-menu-item">↻ Start Fresh Chat</button>
            <button type="button" id="echoHideBtn" class="echo-menu-item">― Tuck Echo to Corner</button>
          </div>
        </div>

        <div id="echoTabChat" class="echo-win-body">
          <div id="echoChatStream" class="echo-chat-stream"></div>
        </div>

        <div id="echoTabGuide" class="echo-win-body" hidden></div>
        <div id="echoTabStudio" class="echo-win-body" hidden></div>

        <div id="echoStarterRow" class="echo-starter-row">
          <button type="button" class="echo-starter-chip" data-echo-prompt="I want to feel a little lighter and more joyful tonight.">☀️ Lift my spirit</button>
          <button type="button" class="echo-starter-chip" data-echo-prompt="Tell me everything about the Dec 10 open mic in Santa Ana!">🎶 Dec 10 Jam</button>
          <button type="button" class="echo-starter-chip" data-echo-prompt="Help me write 4 warm lines to read at open mic.">✍️ Lyric spark</button>
        </div>

        <form id="echoComposerForm" class="echo-composer">
          <input id="echoComposerInput" class="echo-composer-input" type="text" maxlength="500" placeholder="Share a thought or ask anything..." autocomplete="off" />
          <button type="submit" id="echoSendBtn" class="echo-send-btn">Send</button>
        </form>
        <div class="echo-disclaimer">Warm Sanctuary peer spark · Not clinical therapy · Crisis? Call/Text 988</div>
      </section>
    `;

    document.body.appendChild(layer);
  }

  function initEcho() {
    if (typeof window !== 'undefined' && window.self !== window.top) return;
    buildUI();

    const prefs = loadPrefs();
    const sessionMemory = loadSessionMemory();
    let isOpen = false;
    let isHidden = Boolean(prefs.hidden);
    let isRoaming = prefs.roam !== false && !prefersReducedMotion;
    let speakEnabled = Boolean(prefs.speak);
    let windowTheme = ['prism', 'mist', 'portal'].includes(prefs.theme) ? prefs.theme : 'prism';
    let activeTab = 'chat';
    let previousInteractionId = sessionMemory.previousInteractionId || '';
    let sessionMessages = Array.isArray(sessionMemory.messages) ? sessionMemory.messages : [];
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
    const modeToggleBtn = document.getElementById('echoModeToggleBtn');
    const menuBtn = document.getElementById('echoMenuBtn');
    const menuPopover = document.getElementById('echoMenuPopover');

    function persistPrefs() {
      savePrefs({ hidden: isHidden, roam: isRoaming, speak: speakEnabled, theme: windowTheme });
    }

    function applyWindowTheme(nextTheme) {
      windowTheme = ['prism', 'mist', 'portal'].includes(nextTheme) ? nextTheme : 'prism';
      if (winEl) winEl.setAttribute('data-echo-theme', windowTheme);
      document.querySelectorAll('.echo-theme-swatch[data-echo-theme-pick]').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-echo-theme-pick') === windowTheme);
      });
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

    function spawnTrailMote(x, y, vx = 0, vy = 0) {
      if (prefersReducedMotion || isHidden || isOpen) return;
      const layer = document.getElementById('echoSparkLayer');
      if (!layer) return;

      const isStarSpark = Math.random() < 0.34;
      const mote = document.createElement('span');
      mote.className = isStarSpark ? 'echo-trail-mote echo-trail-mote--spark' : 'echo-trail-mote';
      const size = isStarSpark ? 7 + Math.random() * 4 : 3.5 + Math.random() * 4.5;
      mote.style.width = `${size.toFixed(1)}px`;
      mote.style.height = `${size.toFixed(1)}px`;

      const jitterX = (Math.random() - 0.5) * 10;
      const jitterY = (Math.random() - 0.5) * 10;
      mote.style.left = `${x + 26 + jitterX}px`;
      mote.style.top = `${y + 26 + jitterY}px`;
      layer.appendChild(mote);

      // Trail drifts gently behind motion + curls upward like a warm rising ember
      const driftX = Math.max(-28, Math.min(28, -vx * 3.2 + (Math.random() - 0.5) * 14));
      const driftY = Math.max(-34, Math.min(18, -vy * 3.2 - 12 - Math.random() * 14));
      const rotDeg = isStarSpark ? Math.round((Math.random() - 0.5) * 90) : 0;

      requestAnimationFrame(() => {
        mote.style.opacity = '0';
        mote.style.transform = `translate(calc(-50% + ${driftX.toFixed(1)}px), calc(-50% + ${driftY.toFixed(1)}px)) scale(0.15) rotate(${rotDeg}deg)`;
      });
      setTimeout(() => mote.remove(), 880);
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
        const elKey = document.body.getAttribute('data-element') || 'fire';

        const flightStyles = {
          fire: { ease: 0.017, bobFreq: 0.085, bobAmp: 0.62, waveX: 0.14, trailGap: 78 },
          water: { ease: 0.011, bobFreq: 0.032, bobAmp: 0.45, waveX: 0.35, trailGap: 98 },
          earth: { ease: 0.009, bobFreq: 0.03, bobAmp: 0.22, waveX: 0.08, trailGap: 112 },
          air: { ease: 0.02, bobFreq: 0.045, bobAmp: 0.32, waveX: 0.42, trailGap: 74 },
          ether: { ease: 0.011, bobFreq: 0.025, bobAmp: 0.28, waveX: 0.24, trailGap: 88 }
        };
        const style = flightStyles[elKey] || flightStyles.fire;

        if (dist < 18 || stepCount % 320 === 0) {
          pickSafeTarget();
        } else {
          const stepVx = dx * style.ease + Math.cos(stepCount * (style.bobFreq * 0.7)) * style.waveX;
          const stepVy = dy * style.ease + Math.sin(stepCount * style.bobFreq) * style.bobAmp;
          posX += stepVx;
          posY += stepVy;

          const now = Date.now();
          if (dist > 16 && now - lastTrailAt > style.trailGap) {
            lastTrailAt = now;
            spawnTrailMote(posX, posY, stepVx, stepVy);
          }
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

    let activeVoiceAudio = null;

    function stopEchoAudio() {
      if (activeVoiceAudio) {
        try {
          activeVoiceAudio.pause();
          activeVoiceAudio.currentTime = 0;
        } catch (_) {}
        activeVoiceAudio = null;
      }
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (_) {}
      }
    }

    function speakWithBrowserFallback() {
      // Avoid uncanny OS speechSynthesis; chime a gentle 432Hz singing bowl instead
      playStandaloneBowl();
    }

    async function speakTextSoftly(text, options = {}) {
      const force = Boolean(options.force);
      const triggerBtn = options.triggerBtn || null;
      if ((!force && !speakEnabled) || !text) return;

      stopEchoAudio();
      const origLabel = triggerBtn ? triggerBtn.textContent : '';
      if (triggerBtn) {
        triggerBtn.disabled = true;
        triggerBtn.textContent = '⏳ Vega...';
      }

      try {
        const res = await fetch(TTS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        const data = await res.json();
        if (data && data.ok && data.audioBase64) {
          const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
          activeVoiceAudio = audio;
          audio.onended = () => {
            if (activeVoiceAudio === audio) activeVoiceAudio = null;
            if (triggerBtn) triggerBtn.textContent = origLabel || '🔊 Listen';
          };
          audio.onerror = () => {
            if (activeVoiceAudio === audio) activeVoiceAudio = null;
            speakWithBrowserFallback();
          };
          if (triggerBtn) {
            triggerBtn.disabled = false;
            triggerBtn.textContent = '🔊 Vega Speaking';
          }
          await audio.play();
          return;
        }
      } catch (_) {}

      if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.textContent = '🔔 Chime (Set GEMINI_API_KEY for Vega)';
        setTimeout(() => {
          if (triggerBtn) triggerBtn.textContent = origLabel || '🔊 Listen';
        }, 3200);
      }
      speakWithBrowserFallback();
    }

    function syncVisibilityState() {
      if (actor) actor.hidden = isHidden || isOpen;
      if (summonPill) summonPill.hidden = !isHidden || isOpen;
      if (roamBtn) {
        roamBtn.setAttribute('aria-pressed', isRoaming ? 'true' : 'false');
        roamBtn.textContent = isRoaming ? '🪽 Spark Flight: Roaming' : '📍 Spark Flight: Perched';
      }
      if (speakBtn) {
        speakBtn.setAttribute('aria-pressed', speakEnabled ? 'true' : 'false');
        speakBtn.textContent = speakEnabled ? '🔊 Voice Read-Aloud: On' : '🔇 Voice Read-Aloud: Off';
      }
      if (winEl) {
        winEl.classList.toggle('is-open', isOpen);
        winEl.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      }
      if (!isHidden) ensureFlightLoop();
    }

    function executeEchoAction(actionType, extraVal = '') {
      // Prevent open companion window from sitting in front of Sanctuary modals
      if (['open_theater', 'open_pause', 'open_flyer', 'open_dossier', 'open_zeffy'].includes(actionType)) {
        closeWindow();
      }

      switch (actionType) {
        case 'open_theater':
          if (window.sanctuaryCinema && typeof window.sanctuaryCinema.toggleTheater === 'function') {
            window.sanctuaryCinema.toggleTheater(true);
          } else {
            window.location.href = 'index.html?echo=theater';
          }
          break;
        case 'open_pause':
          if (typeof window.openPauseModal === 'function') {
            window.openPauseModal();
          } else {
            window.location.href = 'index.html?echo=pause';
          }
          break;
        case 'open_flyer':
          if (window.sanctuaryCinema && typeof window.sanctuaryCinema.openInviteFlyer === 'function') {
            window.sanctuaryCinema.openInviteFlyer();
          } else {
            window.location.href = 'index.html?echo=flyer';
          }
          break;
        case 'open_dossier':
          if (typeof window.openFunderDossierModal === 'function') {
            window.openFunderDossierModal();
          } else {
            const portal = document.getElementById('grant-hub-portal');
            if (portal) portal.scrollIntoView({ behavior: 'smooth' });
            else window.location.href = 'index.html?echo=dossier';
          }
          break;
        case 'open_zeffy':
          if (typeof window.openZeffyModal === 'function') {
            window.openZeffyModal();
          } else {
            window.location.href = 'index.html?echo=zeffy';
          }
          break;
        case 'open_bracelet': {
          const anchor = String(extraVal || '').trim().toUpperCase().slice(0, 12);
          if (document.getElementById('bracelet-creator') && window.sanctuaryHubWings) {
            closeWindow();
            window.sanctuaryHubWings.focusClubhouseZone('bracelet', { scroll: true });
          } else if (detectCurrentPage() === 'bracelet-weaver') {
            if (anchor) {
              const input = document.getElementById('customWordInput');
              if (input) {
                input.value = anchor;
                input.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }
            closeWindow();
          } else {
            window.location.href = anchor ? `bracelet-weaver.html?anchor=${encodeURIComponent(anchor)}` : 'bracelet-weaver.html';
          }
          break;
        }
        case 'open_hub':
          window.location.href = 'community-hub.html';
          break;
        case 'play_bowl':
          if (window.sanctuaryCinema && typeof window.sanctuaryCinema.playBowl === 'function') {
            window.sanctuaryCinema.playBowl();
          } else {
            playStandaloneBowl();
          }
          break;
        case 'toggle_sound':
          if (window.soundscape && typeof window.soundscape.toggle === 'function') {
            window.soundscape.toggle();
          } else {
            playStandaloneBowl();
          }
          break;
        default:
          break;
      }
    }

    function appendMessage(role, text, meta = {}, persist = true) {
      if (!chatStream) return;
      if (persist) {
        sessionMessages.push({ role, text, meta });
        if (sessionMessages.length > MAX_SESSION_MESSAGES) {
          sessionMessages = sessionMessages.slice(-MAX_SESSION_MESSAGES);
        }
        saveSessionMemory({ previousInteractionId, messages: sessionMessages });
      }

      const row = document.createElement('div');
      row.className = `echo-msg-row echo-msg-row--${role}`;

      if (role === 'echo' && meta.isWelcome) {
        const welcomeCard = document.createElement('div');
        welcomeCard.className = 'echo-info-card';
        welcomeCard.innerHTML = `<div class="echo-info-kicker">✦ Joyful Mirror</div><div style="font-size:0.82rem;line-height:1.5;">${escapeHtml(text)}</div>`;
        row.className = 'echo-msg-row echo-msg-row--echo';
        row.style.maxWidth = '100%';
        row.appendChild(welcomeCard);
      } else {
        const bubble = document.createElement('div');
        bubble.className = 'echo-msg-bubble';
        bubble.textContent = text;
        row.appendChild(bubble);
      }

      if (role === 'echo' && !meta.isWelcome && (meta.actionType || meta.suggestedElement)) {
        const actionsWrap = document.createElement('div');
        actionsWrap.className = 'echo-action-pills';

        const listenBtn = document.createElement('button');
        listenBtn.type = 'button';
        listenBtn.className = 'echo-action-chip';
        listenBtn.textContent = '🔊';
        listenBtn.title = 'Hear Echo speak (Gemini Vega)';
        listenBtn.addEventListener('click', () => speakTextSoftly(text, { force: true, triggerBtn: listenBtn }));
        actionsWrap.appendChild(listenBtn);

        if (meta.actionType) {
          const actBtn = document.createElement('button');
          actBtn.type = 'button';
          actBtn.className = 'echo-action-chip';
          actBtn.textContent = meta.actionLabel || 'Open ✨';
          actBtn.addEventListener('click', () => executeEchoAction(meta.actionType, meta.anchorWord || ''));
          actionsWrap.appendChild(actBtn);
        } else if (meta.suggestedElement && ELEMENT_LABELS[meta.suggestedElement]) {
          const elBtn = document.createElement('button');
          elBtn.type = 'button';
          elBtn.className = 'echo-action-chip';
          elBtn.textContent = `Sync ${ELEMENT_LABELS[meta.suggestedElement]}`;
          elBtn.addEventListener('click', () => {
            if (window.switchElementTheme) window.switchElementTheme(meta.suggestedElement, true);
            elBtn.textContent = `✓ ${ELEMENT_LABELS[meta.suggestedElement]}`;
          });
          actionsWrap.appendChild(elBtn);
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
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="echo-info-kicker">🧭 Sanctuary Field Guide</span>
          <button type="button" id="echoBackToChatBtn" class="echo-action-chip">← Back to Chat</button>
        </div>
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
      const backBtn = el.querySelector('#echoBackToChatBtn');
      if (backBtn) backBtn.addEventListener('click', () => switchTab('chat'));
    }

    function renderStudioTab() {
      const el = document.getElementById('echoTabStudio');
      if (!el) return;
      const item = ANCHOR_WORDS[anchorIdx % ANCHOR_WORDS.length];
      el.innerHTML = `
        <div class="echo-info-card" style="margin:auto 0;text-align:center;padding:18px 16px;gap:12px;">
          <div class="echo-info-kicker">Today’s Mirror Word</div>
          <div id="echoAnchorWordBox" class="echo-word-display">${item.word}</div>
          <p id="echoAnchorLine" class="echo-info-copy" style="text-align:center;">“${item.line}”</p>
          <div class="echo-action-pills" style="justify-content:center;padding-top:4px;">
            <button type="button" id="echoNextAnchorBtn" class="echo-action-chip">✨ New Spark</button>
            <button type="button" id="echoGoBraceletBtn" class="echo-action-chip">📿 Weave Word</button>
            <button type="button" id="echoBowlPlayBtn" class="echo-action-chip">🔔 432Hz Bowl</button>
          </div>
        </div>
      `;

      el.querySelector('#echoNextAnchorBtn').addEventListener('click', () => {
        anchorIdx = (anchorIdx + 1) % ANCHOR_WORDS.length;
        const next = ANCHOR_WORDS[anchorIdx];
        document.getElementById('echoAnchorWordBox').textContent = next.word;
        document.getElementById('echoAnchorLine').textContent = `“${next.line}”`;
      });
      el.querySelector('#echoGoBraceletBtn').addEventListener('click', () => {
        const wordBox = document.getElementById('echoAnchorWordBox');
        const activeWord = wordBox ? wordBox.textContent.trim() : '';
        executeEchoAction('open_bracelet', activeWord);
      });
      el.querySelector('#echoBowlPlayBtn').addEventListener('click', () => executeEchoAction('play_bowl'));
    }

    function switchTab(nextTab) {
      const normalized = nextTab === 'reflect' ? 'studio' : nextTab;
      activeTab = normalized;

      const chatEl = document.getElementById('echoTabChat');
      const guideEl = document.getElementById('echoTabGuide');
      const studioEl = document.getElementById('echoTabStudio');
      if (chatEl) chatEl.hidden = normalized !== 'chat';
      if (guideEl) guideEl.hidden = normalized !== 'guide';
      if (studioEl) studioEl.hidden = normalized !== 'studio';
      if (starterRow) starterRow.style.display = normalized === 'chat' ? 'flex' : 'none';
      if (composerForm) composerForm.style.display = normalized === 'chat' ? 'flex' : 'none';
      if (modeToggleBtn) {
        const showingReflect = normalized === 'studio';
        modeToggleBtn.textContent = showingReflect ? '💬 Chat' : '🪞 Reflect';
        modeToggleBtn.classList.toggle('active', showingReflect);
      }
      if (menuPopover) {
        menuPopover.hidden = true;
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      }
    }

    function openWindow(tab = 'chat') {
      isOpen = true;
      isHidden = false;
      hideWhisper();
      applyWindowTheme(windowTheme);
      syncVisibilityState();
      switchTab(tab);
      checkBackendHealth();
      if (tab === 'chat' && composerInput) {
        setTimeout(() => composerInput.focus(), 120);
      }
    }

    function closeWindow() {
      isOpen = false;
      if (menuPopover) menuPopover.hidden = true;
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      stopEchoAudio();
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
        const prevX = posX;
        const prevY = posY;
        posX = spriteOrigX + dx;
        posY = spriteOrigY + dy;
        targetX = posX;
        targetY = posY;
        const now = Date.now();
        if (now - lastTrailAt > 48) {
          lastTrailAt = now;
          spawnTrailMote(posX, posY, posX - prevX, posY - prevY);
        }
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
    if (modeToggleBtn) {
      modeToggleBtn.addEventListener('click', () => {
        switchTab(activeTab === 'studio' ? 'chat' : 'studio');
      });
    }
    if (menuBtn && menuPopover) {
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = menuPopover.hidden;
        menuPopover.hidden = !willOpen;
        menuBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
      document.addEventListener('click', (e) => {
        if (!menuPopover.hidden && !menuPopover.contains(e.target) && e.target !== menuBtn) {
          menuPopover.hidden = true;
          menuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
    document.querySelectorAll('.echo-theme-swatch[data-echo-theme-pick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        applyWindowTheme(btn.getAttribute('data-echo-theme-pick'));
        persistPrefs();
      });
    });
    const openGuideBtn = document.getElementById('echoOpenGuideBtn');
    if (openGuideBtn) {
      openGuideBtn.addEventListener('click', () => switchTab('guide'));
    }
    const resetBtn = document.getElementById('echoResetChatBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        previousInteractionId = '';
        sessionMessages = [];
        saveSessionMemory({ previousInteractionId: '', messages: [] });
        if (chatStream) chatStream.innerHTML = '';
        appendMessage(
          'echo',
          "Fresh spark, clean mirror ✨ What's one bright thing you're celebrating tonight, or how can I help you unwind?",
          { isWelcome: true },
          true
        );
        switchTab('chat');
      });
    }
    document.getElementById('echoHideBtn').addEventListener('click', () => {
      isOpen = false;
      isHidden = true;
      if (menuPopover) menuPopover.hidden = true;
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
        if (!speakEnabled) stopEchoAudio();
        persistPrefs();
        syncVisibilityState();
      });
    }

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

    // Seed initial greeting or restore cross-page conversation from sessionStorage
    if (sessionMessages.length > 0) {
      sessionMessages.forEach((entry) => {
        if (entry && entry.text) {
          appendMessage(entry.role === 'user' ? 'user' : 'echo', entry.text, entry.meta || {}, false);
        }
      });
    } else {
      appendMessage(
        'echo',
        "Hey friend ✨ Take a slow breath with me. What’s one small bright thing you want to celebrate or lean into tonight?",
        { isWelcome: true },
        true
      );
    }
    applyWindowTheme(windowTheme);
    renderGuideTab();
    renderStudioTab();
    syncVisibilityState();

    // Support deep-linked ?echo= actions when routed back from standalone pages
    try {
      const params = new URLSearchParams(window.location.search);
      const echoParam = params.get('echo');
      if (echoParam) {
        const cleanUrl = `${window.location.pathname}${window.location.hash || ''}`;
        window.history.replaceState({}, document.title, cleanUrl);
        setTimeout(() => {
          if (echoParam === 'theater') executeEchoAction('open_theater');
          else if (echoParam === 'pause') executeEchoAction('open_pause');
          else if (echoParam === 'flyer') executeEchoAction('open_flyer');
          else if (echoParam === 'dossier') executeEchoAction('open_dossier');
          else if (echoParam === 'zeffy') executeEchoAction('open_zeffy');
        }, 280);
      }
    } catch (_) {}

    // Close Echo cleanly with Esc before propagating to page/Theater Esc handlers
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && isOpen) {
          e.stopPropagation();
          closeWindow();
        }
      },
      true
    );

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
