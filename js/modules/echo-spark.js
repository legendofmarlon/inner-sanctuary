/**
 * Inner Sanctuary Wellness Foundation — "Echo" the Living Sanctuary Spark
 * Dancing SVG ember-star sprite + clean, simple Ether chat window with
 * 1-click theme switching (Prism, Mist, Orchid) and Gemini / Vega TTS support.
 */
(function () {
  'use strict';

  const ENDPOINT = '/.netlify/functions/echo-companion';
  const TTS_ENDPOINT = '/.netlify/functions/echo-tts';
  const STORAGE_PREF_KEY = 'sanctuary_echo_prefs_v1';
  const STORAGE_SESSION_KEY = 'sanctuary_echo_session_v1';
  const MAX_SESSION_MESSAGES = 18;
  const THEME_ORDER = ['prism', 'mist', 'portal'];
  const THEME_META = {
    prism: { label: '🔮 Prism', title: 'Theme: Celestial Prism (tap to switch)' },
    mist: { label: '🌸 Mist', title: 'Theme: Bright Ether Mist (tap to switch)' },
    portal: { label: '✨ Orchid', title: 'Theme: Twilight Orchid (tap to switch)' }
  };

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  const ELEMENT_CHIP_LABELS = {
    fire: '🔥 Shift to Fire',
    water: '💧 Shift to Water',
    earth: '🌿 Shift to Earth',
    air: '🌬️ Shift to Air',
    ether: '🔮 Shift to Ether'
  };

  const ACTION_FALLBACK_LABELS = {
    open_theater: '🎭 Enter Theater Mode',
    open_pause: '🍃 Take 60s Pause',
    open_flyer: '🎨 Dec 10 Invite Flyer',
    open_dossier: '📑 View 501(c)(3) Dossier',
    open_zeffy: '🌱 Plant $1 Seed',
    open_bracelet: '📿 Weave Bracelet',
    open_labyrinth: '🌀 Walk Labyrinth',
    open_hub: '🏡 Enter Community Hub',
    open_greenroom: '🗝️ Find the Greenroom',
    play_bowl: '🔔 Chime 432Hz Bowl',
    toggle_sound: '🔊 Nature Soundscape',
    toggle_spotify: '🎧 Spotify 432Hz Tray',
    scroll_programs: '🎶 See Programs & Events',
    scroll_sponsor: '🤝 View Sponsorship Tiers'
  };

  const WHISPER_LINES = [
    "Psst… knock 3 times on the emblem 👀🗝️",
    "Drop your shoulders real quick — want me to shift the vibe? ✨",
    "Ask me literally anything — Dec 10 in Santa Ana or 16 fresh bars 🎶",
    "Need fire, water breeze, or twilight ether tonight? Tap me 🔮"
  ];

  function formatEchoHtml(rawText) {
    const escaped = String(rawText || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
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
        <button type="button" id="echoSpriteBtn" class="echo-sprite-btn" aria-label="Chat with Echo" title="Hey! I'm Echo — tap to chat or drag me anywhere">
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
            <path class="echo-svg-flare" d="M32 2 L34.2 28.5 L58 32 L34.2 35.5 L32 62 L29.8 35.5 L6 32 L29.8 28.5 Z" fill="url(#echoStarGleam)" />
            <path class="echo-svg-flame" d="M32 13 C38.5 24 42.5 32.5 42.5 40 C42.5 46.2 37.8 51 32 51 C26.2 51 21.5 46.2 21.5 40 C21.5 32.5 25.5 24 32 13 Z" fill="url(#echoEmberOuter)" />
            <path class="echo-svg-tongue" d="M32 23 C35.5 30 37.5 35.2 37.5 39.5 C37.5 43.2 35.1 46 32 46 C28.9 46 26.5 43.2 26.5 39.5 C26.5 35.2 28.5 30 32 23 Z" fill="#FFFFFF" opacity="0.94" />
            <circle class="echo-svg-fleck echo-svg-fleck--1" cx="22" cy="18" r="1.7" fill="#FFFDF7" />
            <circle class="echo-svg-fleck echo-svg-fleck--2" cx="43" cy="21" r="1.4" fill="var(--echo-core)" />
            <circle class="echo-svg-fleck echo-svg-fleck--3" cx="32" cy="8" r="1.5" fill="#FFFFFF" />
          </svg>
          <span class="echo-name-pill">Echo</span>
        </button>
      </div>

      <section id="echoCompanionWindow" class="echo-companion-window" data-echo-theme="prism" role="dialog" aria-label="Chat with Echo" aria-hidden="true">
        <header id="echoWinHeader" class="echo-win-header">
          <div class="echo-win-identity">
            <div id="echoMiniAvatar" class="echo-avatar-mini" aria-hidden="true"></div>
            <span class="echo-win-title">Echo</span>
          </div>
          <div class="echo-win-controls">
            <button type="button" id="echoThemeCycleBtn" class="echo-icon-btn" title="Switch Echo window theme">🔮 Prism</button>
            <button type="button" id="echoResetChatBtn" class="echo-icon-btn echo-icon-btn--round" aria-label="Start fresh conversation" title="Fresh chat">↻</button>
            <button type="button" id="echoCloseBtn" class="echo-icon-btn echo-icon-btn--round" aria-label="Close Echo chat" title="Close">&times;</button>
          </div>
        </header>

        <div id="echoTabChat" class="echo-win-body">
          <div id="echoChatStream" class="echo-chat-stream"></div>
        </div>

        <div id="echoStarterRow" class="echo-starter-row">
          <button type="button" class="echo-starter-chip" data-echo-prompt="I want to drop my shoulders and feel brighter right now — surprise me with a mood shift!">☀️ Shift my mood</button>
          <button type="button" class="echo-starter-chip" data-echo-prompt="Break down everything happening at Dec 10 The Unplugged Playground in Santa Ana!">🎶 Dec 10 Santa Ana</button>
          <button type="button" class="echo-starter-chip" data-echo-prompt="What is the secret Greenroom Easter egg and everything inside the Community Hub?">🗝️ 3-knock secret</button>
          <button type="button" class="echo-starter-chip" data-echo-prompt="Give me a bold creative life hack or fun 4-line spark verse right now!">✨ Ask Gemini</button>
        </div>

        <form id="echoComposerForm" class="echo-composer">
          <input id="echoComposerInput" class="echo-composer-input" type="text" maxlength="500" placeholder="Say anything..." autocomplete="off" />
          <button type="submit" id="echoSendBtn" class="echo-send-btn">Send</button>
        </form>
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
    let windowTheme = THEME_ORDER.includes(prefs.theme) ? prefs.theme : 'prism';
    let previousInteractionId = sessionMemory.previousInteractionId || '';
    let sessionMessages = Array.isArray(sessionMemory.messages) ? sessionMemory.messages : [];
    let activeVoiceAudio = null;

    // Flight state
    let posX = Math.max(40, window.innerWidth - 94);
    let posY = Math.max(120, Math.round(window.innerHeight * 0.56));
    let targetX = posX;
    let targetY = posY;
    let isHovered = false;
    let isDraggingSprite = false;
    let pointerMovedDuringDrag = false;
    let lastTrailAt = 0;
    let whisperTimer = null;
    let rafId = null;

    const actor = document.getElementById('echoSparkActor');
    const spriteBtn = document.getElementById('echoSpriteBtn');
    const whisperBubble = document.getElementById('echoWhisperBubble');
    const whisperTextEl = document.getElementById('echoWhisperText');
    const winEl = document.getElementById('echoCompanionWindow');
    const winHeader = document.getElementById('echoWinHeader');
    const chatStream = document.getElementById('echoChatStream');
    const composerForm = document.getElementById('echoComposerForm');
    const composerInput = document.getElementById('echoComposerInput');
    const sendBtn = document.getElementById('echoSendBtn');
    const themeBtn = document.getElementById('echoThemeCycleBtn');
    const miniAvatar = document.getElementById('echoMiniAvatar');
    const resetChatBtn = document.getElementById('echoResetChatBtn');
    let whisperIndex = 0;

    function applyWindowTheme(nextTheme) {
      windowTheme = THEME_ORDER.includes(nextTheme) ? nextTheme : 'prism';
      if (winEl) winEl.setAttribute('data-echo-theme', windowTheme);
      if (themeBtn && THEME_META[windowTheme]) {
        themeBtn.textContent = THEME_META[windowTheme].label;
        themeBtn.title = THEME_META[windowTheme].title;
      }
      savePrefs({ ...loadPrefs(), theme: windowTheme });
    }

    function stopEchoAudio() {
      if (miniAvatar) miniAvatar.classList.remove('is-speaking');
      if (activeVoiceAudio) {
        try {
          activeVoiceAudio.pause();
          activeVoiceAudio.currentTime = 0;
        } catch (_) {}
        activeVoiceAudio = null;
      }
    }

    async function playMessageAudio(text, triggerBtn) {
      if (!text) return;
      stopEchoAudio();
      const orig = triggerBtn ? triggerBtn.textContent : '🔊';
      if (triggerBtn) {
        triggerBtn.disabled = true;
        triggerBtn.textContent = '⏳';
      }
      if (miniAvatar) miniAvatar.classList.add('is-speaking');

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
            if (miniAvatar) miniAvatar.classList.remove('is-speaking');
            if (triggerBtn) triggerBtn.textContent = orig;
          };
          if (triggerBtn) {
            triggerBtn.disabled = false;
            triggerBtn.textContent = '🔊';
          }
          await audio.play();
          return;
        }
      } catch (_) {}

      if (miniAvatar) miniAvatar.classList.remove('is-speaking');
      if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.textContent = '🔔';
        setTimeout(() => {
          if (triggerBtn) triggerBtn.textContent = orig;
        }, 2000);
      }
      playStandaloneBowl();
    }

    function pickSafeTarget() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const inTheater = document.body.classList.contains('cinema-theater-mode');
      const padX = w < 640 ? 28 : 42;
      const minY = inTheater ? 74 : 96;
      const maxY = Math.max(minY + 80, h - (inTheater ? 110 : 96));

      if (w >= 820 && !inTheater) {
        const useLeft = Math.random() < 0.36;
        targetX = useLeft ? padX + Math.random() * 110 : w - 160 + Math.random() * 95;
      } else {
        targetX = padX + Math.random() * Math.max(40, w - padX * 2 - 48);
      }
      targetY = minY + Math.random() * Math.max(40, maxY - minY);
    }

    function spawnTrailMote(x, y, vx = 0, vy = 0) {
      if (prefersReducedMotion || isOpen) return;
      const layer = document.getElementById('echoSparkLayer');
      if (!layer) return;

      const isStarSpark = Math.random() < 0.34;
      const mote = document.createElement('span');
      mote.className = isStarSpark ? 'echo-trail-mote echo-trail-mote--spark' : 'echo-trail-mote';
      const size = isStarSpark ? 7 + Math.random() * 4 : 3.5 + Math.random() * 4.5;
      mote.style.width = `${size.toFixed(1)}px`;
      mote.style.height = `${size.toFixed(1)}px`;

      mote.style.left = `${x + 26 + (Math.random() - 0.5) * 10}px`;
      mote.style.top = `${y + 26 + (Math.random() - 0.5) * 10}px`;
      layer.appendChild(mote);

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
      stepCount += 1;

      if (!prefersReducedMotion && !isHovered && !isDraggingSprite && !isOpen) {
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

    function hideWhisper() {
      if (whisperBubble) whisperBubble.classList.remove('is-visible');
      if (whisperTimer) {
        clearTimeout(whisperTimer);
        whisperTimer = null;
      }
    }

    function showWhisper(text, durationMs = 6000) {
      if (isOpen || !whisperBubble || !whisperTextEl) return;
      whisperTextEl.textContent = text;
      whisperBubble.classList.toggle('is-left-side', posX < window.innerWidth * 0.45);
      whisperBubble.classList.add('is-visible');
      if (whisperTimer) clearTimeout(whisperTimer);
      whisperTimer = setTimeout(hideWhisper, durationMs);
    }

    function syncVisibilityState() {
      if (actor) actor.hidden = isOpen;
      if (winEl) {
        winEl.classList.toggle('is-open', isOpen);
        winEl.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      }
      if (!rafId) rafId = requestAnimationFrame(tickFlight);
    }

    function shiftElementVibe(elKey) {
      if (!elKey || !ELEMENT_CHIP_LABELS[elKey]) return;
      if (typeof window.switchElementTheme === 'function') {
        window.switchElementTheme(elKey, true);
      } else {
        document.body.setAttribute('data-element', elKey);
      }
      if (window.sanctuaryCinema && typeof window.sanctuaryCinema.selectTheaterElement === 'function' && document.body.classList.contains('cinema-theater-mode')) {
        window.sanctuaryCinema.selectTheaterElement(elKey);
      }
    }

    function executeEchoAction(actionType, meta = {}) {
      const page = detectCurrentPage();
      const closeOnMobileOverlay = () => {
        if (window.innerWidth <= 640) closeWindow();
      };

      switch (actionType) {
        case 'open_theater':
          closeOnMobileOverlay();
          if (window.sanctuaryCinema && typeof window.sanctuaryCinema.toggleTheater === 'function') {
            window.sanctuaryCinema.toggleTheater(true);
          } else {
            window.location.href = 'index.html#sanctuaryPortalSection';
          }
          break;
        case 'open_pause':
          closeOnMobileOverlay();
          if (typeof window.openPauseModal === 'function') {
            window.openPauseModal();
          } else {
            window.location.href = 'index.html#programs';
          }
          break;
        case 'open_flyer':
          closeOnMobileOverlay();
          if (window.sanctuaryCinema && typeof window.sanctuaryCinema.openInviteFlyer === 'function') {
            window.sanctuaryCinema.openInviteFlyer();
          } else {
            window.location.href = 'index.html#programs';
          }
          break;
        case 'open_dossier':
          closeOnMobileOverlay();
          if (typeof window.openFunderModal === 'function') {
            window.openFunderModal(null, 'summary');
          } else {
            window.location.href = 'index.html#sponsorship';
          }
          break;
        case 'open_zeffy':
          closeOnMobileOverlay();
          if (typeof window.openZeffyModal === 'function') {
            window.openZeffyModal();
          } else {
            window.open('https://www.zeffy.com/en-US/donation-form/plant-a-seed-make-it-grow', '_blank', 'noopener,noreferrer');
          }
          break;
        case 'open_bracelet': {
          const anchorParam = meta && meta.anchorWord ? `?anchor=${encodeURIComponent(meta.anchorWord)}` : '';
          window.location.href = `bracelet-weaver.html${anchorParam}`;
          break;
        }
        case 'open_labyrinth':
          window.location.href = 'digital-labyrinth.html';
          break;
        case 'open_hub':
          if (page === 'community-hub') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            window.location.href = 'community-hub.html';
          }
          break;
        case 'open_greenroom':
          if (page === 'community-hub' && window.sanctuaryHubWings && typeof window.sanctuaryHubWings.focusClubhouseZone === 'function') {
            window.sanctuaryHubWings.focusClubhouseZone('vinyl', { scroll: true });
          } else {
            window.location.href = 'community-hub.html#greenroom-vault';
          }
          break;
        case 'play_bowl':
          if (window.sanctuaryCinema && typeof window.sanctuaryCinema.playBowl === 'function') {
            window.sanctuaryCinema.playBowl();
          } else {
            playStandaloneBowl();
          }
          break;
        case 'toggle_sound':
          if (window.sanctuaryCinema && typeof window.sanctuaryCinema.theaterToggleSound === 'function') {
            window.sanctuaryCinema.theaterToggleSound();
          } else {
            playStandaloneBowl();
          }
          break;
        case 'toggle_spotify':
          if (typeof window.toggleSpotifyPlayer === 'function') {
            window.toggleSpotifyPlayer();
          } else {
            window.location.href = 'index.html';
          }
          break;
        case 'scroll_programs': {
          const el = document.getElementById('programs');
          if (el) {
            closeOnMobileOverlay();
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.location.href = 'index.html#programs';
          }
          break;
        }
        case 'scroll_sponsor': {
          const el = document.getElementById('sponsorship');
          if (el) {
            closeOnMobileOverlay();
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.location.href = 'index.html#sponsorship';
          }
          break;
        }
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

      const bubble = document.createElement('div');
      bubble.className = 'echo-msg-bubble';
      bubble.innerHTML = formatEchoHtml(text);

      if (role === 'echo' && !meta.isWelcome) {
        const audioBtn = document.createElement('button');
        audioBtn.type = 'button';
        audioBtn.className = 'echo-inline-voice';
        audioBtn.textContent = '🔊';
        audioBtn.title = 'Listen (Gemini Vega TTS / Chime)';
        audioBtn.addEventListener('click', () => playMessageAudio(text, audioBtn));
        bubble.appendChild(audioBtn);
      }

      row.appendChild(bubble);

      if (role === 'echo' && !meta.isWelcome) {
        const hasAction = Boolean(meta.actionType && ACTION_FALLBACK_LABELS[meta.actionType]);
        const hasElement = Boolean(meta.suggestedElement && ELEMENT_CHIP_LABELS[meta.suggestedElement]);
        if (hasAction || hasElement) {
          const pillRow = document.createElement('div');
          pillRow.className = 'echo-action-pills';
          if (hasAction) {
            const actionBtn = document.createElement('button');
            actionBtn.type = 'button';
            actionBtn.className = 'echo-action-chip';
            actionBtn.textContent = meta.actionLabel || ACTION_FALLBACK_LABELS[meta.actionType];
            actionBtn.addEventListener('click', () => executeEchoAction(meta.actionType, meta));
            pillRow.appendChild(actionBtn);
          }
          if (hasElement) {
            const elBtn = document.createElement('button');
            elBtn.type = 'button';
            elBtn.className = 'echo-action-chip echo-action-chip--element';
            elBtn.textContent = ELEMENT_CHIP_LABELS[meta.suggestedElement];
            elBtn.addEventListener('click', () => shiftElementVibe(meta.suggestedElement));
            pillRow.appendChild(elBtn);
          }
          row.appendChild(pillRow);
        }
      }

      chatStream.appendChild(row);

      const body = document.getElementById('echoTabChat');
      if (body) body.scrollTop = body.scrollHeight;
    }

    async function sendChatMessage(rawText) {
      const msg = String(rawText || '').trim();
      if (!msg) return;
      appendMessage('user', msg);
      if (composerInput) composerInput.value = '';
      if (sendBtn) sendBtn.disabled = true;
      if (miniAvatar) miniAvatar.classList.add('is-thinking');

      const typingRow = document.createElement('div');
      typingRow.className = 'echo-msg-row echo-msg-row--echo';
      typingRow.innerHTML = '<div class="echo-msg-bubble" style="opacity:0.78;">✨ Echo is tuning in...</div>';
      if (chatStream) chatStream.appendChild(typingRow);
      const bodyEl = document.getElementById('echoTabChat');
      if (bodyEl) bodyEl.scrollTop = bodyEl.scrollHeight;

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

        if (data && data.interactionId) previousInteractionId = data.interactionId;
        const reply = (data && data.reply) || "Yo I'm right here beside the fire with you ✨";
        appendMessage('echo', reply, {
          suggestedElement: data && data.suggestedElement,
          actionType: data && data.actionType,
          actionLabel: data && data.actionLabel,
          anchorWord: data && data.anchorWord
        });
      } catch (_) {
        typingRow.remove();
        appendMessage('echo', "Yo I'm right here glowing beside you! Ask about Dec 10 in Santa Ana, anything in the universe, or take a quick breath with me ✨", {
          actionType: 'open_pause',
          actionLabel: '🍃 Take 60s Pause'
        });
      } finally {
        if (miniAvatar) miniAvatar.classList.remove('is-thinking');
        if (sendBtn) sendBtn.disabled = false;
        if (composerInput) composerInput.focus();
      }
    }

    function openWindow() {
      isOpen = true;
      hideWhisper();
      applyWindowTheme(windowTheme);
      syncVisibilityState();
      if (composerInput) setTimeout(() => composerInput.focus(), 120);
    }

    function closeWindow() {
      isOpen = false;
      stopEchoAudio();
      syncVisibilityState();
    }

    // Drag or click sprite
    if (spriteBtn) {
      spriteBtn.addEventListener('mouseenter', () => { isHovered = true; });
      spriteBtn.addEventListener('mouseleave', () => { isHovered = false; });

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

      const endDrag = (e) => {
        if (!isDraggingSprite) return;
        isDraggingSprite = false;
        if (actor) actor.classList.remove('is-dragging');
        try { spriteBtn.releasePointerCapture(e.pointerId); } catch (_) {}
      };
      spriteBtn.addEventListener('pointerup', endDrag);
      spriteBtn.addEventListener('pointercancel', endDrag);
      spriteBtn.addEventListener('click', () => {
        if (!pointerMovedDuringDrag) openWindow();
      });
    }

    if (whisperBubble) {
      whisperBubble.addEventListener('click', (e) => {
        if (e.target.closest('#echoWhisperClose')) {
          e.stopPropagation();
          hideWhisper();
          return;
        }
        openWindow();
      });
    }

    document.getElementById('echoCloseBtn').addEventListener('click', closeWindow);
    if (resetChatBtn) {
      resetChatBtn.addEventListener('click', () => {
        stopEchoAudio();
        previousInteractionId = '';
        sessionMessages = [];
        saveSessionMemory({ previousInteractionId: '', messages: [] });
        if (chatStream) chatStream.innerHTML = '';
        appendMessage(
          'echo',
          "Fresh slate! I'm **Echo** ✨ Ask me anything in the universe, weave a bracelet, or shift the whole Sanctuary vibe.",
          { isWelcome: true },
          true
        );
        if (composerInput) composerInput.focus();
      });
    }
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const nextIdx = (THEME_ORDER.indexOf(windowTheme) + 1) % THEME_ORDER.length;
        applyWindowTheme(THEME_ORDER[nextIdx]);
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

    // Draggable desktop window header
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

    // Restore session messages or show clean greeting
    if (sessionMessages.length > 0) {
      sessionMessages.forEach((entry) => {
        if (entry && entry.text) {
          appendMessage(entry.role === 'user' ? 'user' : 'echo', entry.text, entry.meta || {}, false);
        }
      });
    } else {
      appendMessage(
        'echo',
        "Yo — welcome in! I'm **Echo** ✨ Drop your shoulders real quick. Ask me anything in the universe, weave a bracelet, or tell me what kind of night we're having.",
        { isWelcome: true },
        true
      );
    }

    applyWindowTheme(windowTheme);
    syncVisibilityState();

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

    const cycleWhisper = () => {
      const line = WHISPER_LINES[whisperIndex % WHISPER_LINES.length];
      whisperIndex += 1;
      showWhisper(line, 5600);
    };
    setTimeout(cycleWhisper, 2600);
    setInterval(() => {
      if (!isOpen && document.visibilityState === 'visible') cycleWhisper();
    }, 34000);

    window.sanctuaryEcho = {
      open: openWindow,
      close: closeWindow,
      whisper: showWhisper,
      ask: (prompt) => {
        openWindow();
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
