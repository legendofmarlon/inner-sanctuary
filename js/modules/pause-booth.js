/**
 * Inner Sanctuary Wellness Foundation — Digital Pause Booth
 * Mobile-First QR-Ready Nervous System Check-In & 60-Second Guided Grounding
 */
(function() {
  'use strict';

  const STATES = {
    processing: {
      id: 'processing',
      icon: '🍃',
      label: 'Processing the Day',
      microcopy: 'Unwinding thoughts, digesting events, seeking quiet space',
      color: '#D8AA49',
      freq: 528,
      pattern: [
        { label: 'Breathe In Gently', duration: 4000, orbClass: 'inhale', prompt: 'Inhale clarity, receiving the day as it was.' },
        { label: 'Softly Hold', duration: 7000, orbClass: 'hold', prompt: 'Notice this unhurried space between thoughts.' },
        { label: 'Release & Soften', duration: 8000, orbClass: 'exhale', prompt: 'Exhale completely, letting the mental noise settle.' }
      ]
    },
    tension: {
      id: 'tension',
      icon: '🪨',
      label: 'Holding Tension',
      microcopy: 'Softening the shoulders, releasing the grip, letting go',
      color: '#5F7B6B',
      freq: 432,
      pattern: [
        { label: 'Breathe In Peace', duration: 4000, orbClass: 'inhale', prompt: 'Inhale deep into the belly, creating space inside.' },
        { label: 'Long Slow Exhale', duration: 8000, orbClass: 'exhale', prompt: 'Drop your shoulders, unclench your jaw, let the floor hold you.' },
        { label: 'Rest in Stillness', duration: 2000, orbClass: 'rest', prompt: 'You do not have to carry everything right now.' }
      ]
    },
    battery: {
      id: 'battery',
      icon: '🕯️',
      label: 'Low on Battery',
      microcopy: 'Quiet restoration, resting the mind, gently replenishing',
      color: '#C59A3F',
      freq: 396,
      pattern: [
        { label: 'Gently Inhale', duration: 4000, orbClass: 'inhale', prompt: 'Drink in rest; you have given enough today.' },
        { label: 'Hold in Warmth', duration: 4000, orbClass: 'hold', prompt: 'Resting here without any obligation to perform.' },
        { label: 'Gently Exhale', duration: 4000, orbClass: 'exhale', prompt: 'Softening into stillness.' },
        { label: 'Rest Quietly', duration: 4000, orbClass: 'rest', prompt: 'Replenishing your cup, breath by breath.' }
      ]
    },
    peace: {
      id: 'peace',
      icon: '🌿',
      label: 'At Peace & Open',
      microcopy: 'Savoring presence, anchoring gratitude, breathing deep',
      color: '#2B4436',
      freq: 639,
      pattern: [
        { label: 'Harmonic Inhale', duration: 5500, orbClass: 'inhale', prompt: 'Expand with gratitude for this present moment.' },
        { label: 'Harmonic Exhale', duration: 5500, orbClass: 'exhale', prompt: 'Radiate stillness out to your community and home.' }
      ]
    }
  };

  let audioCtx = null;
  let activeOsc = null;
  let activeGain = null;
  let soundEnabled = true;

  let sessionTimer = null;
  let cycleTimer = null;
  let secondsRemaining = 60;
  let currentState = null;
  let currentStepIdx = 0;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playHarmonicTone(freq) {
    if (!soundEnabled) return;
    try {
      initAudioContext();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Smooth exponential envelope
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.045, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 3.3);
    } catch (e) {
      console.warn('[PauseBooth] Audio tone note:', e);
    }
  }

  function renderModalStructure() {
    if (document.getElementById('pauseBoothModal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'pauseBoothModal';
    overlay.className = 'pause-booth-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'pauseBoothHeading');

    overlay.innerHTML = `
      <div class="pause-booth-container">
        <button type="button" class="pause-booth-close-btn" id="pauseBoothCloseBtn" aria-label="Close Pause Booth">✕</button>

        <!-- VIEW 1: State Selection -->
        <div id="pauseBoothStepSelect">
          <div class="pause-booth-header">
            <span class="pause-booth-badge">✦ Digital Pause Booth</span>
            <h2 id="pauseBoothHeading" class="pause-booth-title">How does your body want to be met?</h2>
            <p class="pause-booth-sub">Tap a feeling to receive 60 seconds of gentle, unhurried guidance.</p>
          </div>

          <div class="pause-states-grid">
            <button type="button" class="pause-state-card" data-state="processing">
              <span class="pause-state-icon">🍃</span>
              <span class="pause-state-label">Processing the Day</span>
              <span class="pause-state-microcopy">Unwinding thoughts, digesting events, seeking quiet space</span>
            </button>
            <button type="button" class="pause-state-card" data-state="tension">
              <span class="pause-state-icon">🪨</span>
              <span class="pause-state-label">Holding Tension</span>
              <span class="pause-state-microcopy">Softening the shoulders, releasing the grip, letting go</span>
            </button>
            <button type="button" class="pause-state-card" data-state="battery">
              <span class="pause-state-icon">🕯️</span>
              <span class="pause-state-label">Low on Battery</span>
              <span class="pause-state-microcopy">Quiet restoration, resting the mind, gently replenishing</span>
            </button>
            <button type="button" class="pause-state-card" data-state="peace">
              <span class="pause-state-icon">🌿</span>
              <span class="pause-state-label">At Peace &amp; Open</span>
              <span class="pause-state-microcopy">Savoring presence, anchoring gratitude, breathing deep</span>
            </button>
          </div>
          
          <div style="text-align: center; font-size: 0.74rem; opacity: 0.7; letter-spacing: 0.02em;">
            🔒 100% Anonymous • Syncs with Community Pulse Wall
          </div>
        </div>

        <!-- VIEW 2: 60-Second Guided Immersion -->
        <div id="pauseBoothStepImmersion" class="pause-immersion-stage">
          <span class="pause-booth-badge" id="pauseImmersionStateBadge">🍃 Processing the Day</span>
          
          <div class="pause-somatic-halo">
            <svg class="pause-ring-svg" viewBox="0 0 160 160">
              <circle class="pause-ring-bg" cx="80" cy="80" r="75"></circle>
              <circle class="pause-ring-progress" id="pauseProgressRing" cx="80" cy="80" r="75"></circle>
            </svg>
            <div class="pause-living-orb" id="pauseImmersionOrb">
              <span id="pauseOrbWord">Breathe</span>
            </div>
          </div>

          <div class="pause-instruction-text" id="pauseImmersionPhase">Breathe In Gently</div>
          <div class="pause-sub-instruction" id="pauseImmersionSubPrompt">Inhale clarity, receiving the day as it was.</div>

          <div class="pause-controls-row">
            <span class="pause-timer-readout" id="pauseSecondsRemainingLabel">60s remaining</span>
            <button type="button" id="pauseSoundToggle" class="pause-sound-toggle-btn">
              <span id="pauseSoundIcon">🔔</span>
              <span id="pauseSoundLabel">Sound On</span>
            </button>
          </div>
        </div>

        <!-- VIEW 3: Completion Screen -->
        <div id="pauseBoothStepComplete" class="pause-complete-screen">
          <div class="pause-complete-icon">🕊️</div>
          <h3 class="pause-booth-title" style="margin-bottom: 8px;">Your Breath is Your Anchor</h3>
          <p class="pause-booth-sub" style="max-width: 400px; margin-bottom: 16px;">
            Thank you for honoring yourself with this pause. Whatever you are carrying, you are not alone in this community.
          </p>
          <div class="pause-actions-group">
            <button type="button" id="pauseJoinCircleBtn" class="btn btn-gold" style="padding: 9px 22px; border-radius: 999px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
              <span>🌿 Stay Connected &amp; Receive Reminders</span>
            </button>
            <button type="button" id="pauseAgainBtn" class="btn btn-outline" style="border-color: var(--sunburst-gold); color: var(--forest-green); padding: 8px 18px; border-radius: 999px; font-weight: 700; cursor: pointer;">
              <span>Breathe Again</span>
            </button>
            <button type="button" id="pauseDoneBtn" class="btn btn-outline" style="border: none; color: var(--charcoal-muted); padding: 8px 14px; font-size: 0.82rem; cursor: pointer;">
              <span>Close</span>
            </button>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(overlay);
    attachBoothListeners();
  }

  function attachBoothListeners() {
    const overlay = document.getElementById('pauseBoothModal');
    const closeBtn = document.getElementById('pauseBoothCloseBtn');
    const doneBtn = document.getElementById('pauseDoneBtn');
    const againBtn = document.getElementById('pauseAgainBtn');
    const soundToggle = document.getElementById('pauseSoundToggle');

    const handleClose = () => window.sanctuaryPauseBooth.close();

    closeBtn.addEventListener('click', handleClose);
    if (doneBtn) doneBtn.addEventListener('click', handleClose);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) handleClose();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        handleClose();
      }
    });

    if (againBtn) {
      againBtn.addEventListener('click', () => {
        showSelectStep();
      });
    }

    const joinCircleBtn = document.getElementById('pauseJoinCircleBtn');
    if (joinCircleBtn) {
      joinCircleBtn.addEventListener('click', () => {
        const recordedState = currentState ? currentState.id : null;
        window.sanctuaryPauseBooth.close();
        if (window.sanctuaryCommunityModal) {
          window.sanctuaryCommunityModal.open('pause-booth-completion', recordedState);
        }
      });
    }

    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        const icon = document.getElementById('pauseSoundIcon');
        const label = document.getElementById('pauseSoundLabel');
        if (icon) icon.textContent = soundEnabled ? '🔔' : '🔕';
        if (label) label.textContent = soundEnabled ? 'Sound On' : 'Muted';
      });
    }

    // State card clicks
    document.querySelectorAll('.pause-state-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const stateKey = btn.getAttribute('data-state');
        startImmersion(stateKey);
      });
    });
  }

  function showSelectStep() {
    stopTimers();
    const s1 = document.getElementById('pauseBoothStepSelect');
    const s2 = document.getElementById('pauseBoothStepImmersion');
    const s3 = document.getElementById('pauseBoothStepComplete');
    if (s1) s1.style.display = 'block';
    if (s2) s2.classList.remove('active');
    if (s3) s3.classList.remove('active');
  }

  function startImmersion(stateKey) {
    currentState = STATES[stateKey] || STATES.processing;

    initAudioContext();

    // Trigger anonymous pulse checkin ingest
    sendAnonymousPulse(currentState.id);

    // Switch UI views
    const s1 = document.getElementById('pauseBoothStepSelect');
    const s2 = document.getElementById('pauseBoothStepImmersion');
    const s3 = document.getElementById('pauseBoothStepComplete');
    if (s1) s1.style.display = 'none';
    if (s2) s2.classList.add('active');
    if (s3) s3.classList.remove('active');

    // Update state badge
    const badge = document.getElementById('pauseImmersionStateBadge');
    if (badge) {
      badge.textContent = `${currentState.icon} ${currentState.label}`;
      badge.style.color = currentState.color;
    }

    secondsRemaining = 60;
    updateProgressRing();

    // Begin breath steps
    currentStepIdx = 0;
    runCycleStep();

    // 1-second countdown clock
    sessionTimer = setInterval(() => {
      secondsRemaining--;
      updateProgressRing();
      if (secondsRemaining <= 0) {
        finishImmersion();
      }
    }, 1000);
  }

  function runCycleStep() {
    if (!currentState) return;
    const pattern = currentState.pattern;
    const step = pattern[currentStepIdx];

    const orb = document.getElementById('pauseImmersionOrb');
    const orbWord = document.getElementById('pauseOrbWord');
    const phaseLabel = document.getElementById('pauseImmersionPhase');
    const subPrompt = document.getElementById('pauseImmersionSubPrompt');

    if (orb) {
      orb.className = `pause-living-orb ${step.orbClass}`;
    }
    if (orbWord) orbWord.textContent = step.label.split(' ')[0] || 'Breathe';
    if (phaseLabel) phaseLabel.textContent = step.label;
    if (subPrompt) subPrompt.textContent = step.prompt;

    // Harmonic chime on inhale and exhale
    if (step.orbClass === 'inhale' || step.orbClass === 'exhale') {
      playHarmonicTone(currentState.freq);
    }

    cycleTimer = setTimeout(() => {
      currentStepIdx = (currentStepIdx + 1) % pattern.length;
      runCycleStep();
    }, step.duration);
  }

  function updateProgressRing() {
    const ring = document.getElementById('pauseProgressRing');
    const label = document.getElementById('pauseSecondsRemainingLabel');
    if (label) label.textContent = `${secondsRemaining}s remaining`;

    if (ring) {
      const circumference = 471; // 2 * PI * 75
      const offset = circumference - ((60 - secondsRemaining) / 60) * circumference;
      ring.style.strokeDashoffset = offset;
    }
  }

  function stopTimers() {
    clearInterval(sessionTimer);
    clearTimeout(cycleTimer);
    sessionTimer = null;
    cycleTimer = null;
  }

  function finishImmersion() {
    stopTimers();
    playHarmonicTone(528); // Completion chime

    const s2 = document.getElementById('pauseBoothStepImmersion');
    const s3 = document.getElementById('pauseBoothStepComplete');
    if (s2) s2.classList.remove('active');
    if (s3) s3.classList.add('active');

    // Notify pulse constellation and general listeners
    window.dispatchEvent(new CustomEvent('sanctuary:pause-completed', {
      detail: { state: currentState.id }
    }));
  }

  function sendAnonymousPulse(stateId) {
    const isQR = window.location.search.includes('qr=') || window.location.search.includes('pause=');
    const payload = {
      state: stateId,
      timestamp: Date.now(),
      origin: isQR ? 'qr-booth' : 'web'
    };

    // Non-blocking asynchronous ingest
    fetch('/.netlify/functions/pulse-checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => res.json()).then(data => {
      // Refresh constellation if present
      if (window.sanctuaryPulseConstellation && window.sanctuaryPulseConstellation.fetchPulse) {
        window.sanctuaryPulseConstellation.fetchPulse();
      }
    }).catch(err => {
      // In offline or local preview without function server, record locally in memory
      if (window.sanctuaryPulseConstellation && window.sanctuaryPulseConstellation.recordLocalPulse) {
        window.sanctuaryPulseConstellation.recordLocalPulse(stateId);
      }
    });
  }

  // Public API
  window.sanctuaryPauseBooth = {
    open: function(initialState) {
      renderModalStructure();
      const modal = document.getElementById('pauseBoothModal');
      if (!modal) return;
      document.body.style.overflow = 'hidden';
      modal.classList.add('active');

      if (initialState && STATES[initialState]) {
        startImmersion(initialState);
      } else {
        showSelectStep();
      }
    },
    close: function() {
      stopTimers();
      const modal = document.getElementById('pauseBoothModal');
      if (modal) modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Deep link checker (?pause=true or #pause-booth)
  function checkUrlTriggers() {
    renderModalStructure();
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;

    if (urlParams.get('pause') === 'true' || hash === '#pause-booth' || hash === '#pause') {
      const stateParam = urlParams.get('state');
      window.sanctuaryPauseBooth.open(stateParam);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkUrlTriggers);
  } else {
    checkUrlTriggers();
  }

  window.addEventListener('hashchange', checkUrlTriggers);
})();
