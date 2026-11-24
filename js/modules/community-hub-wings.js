/**
 * Inner Sanctuary Wellness Foundation — Community Hub Modular Wings & Stage Lounge
 * Clean, extensible wing router + Open Mic rehearsal timer + Acoustic Pocket chord/rhythm engine.
 */
(function() {
  'use strict';

  // =========================================================================
  // 1. EXPANDABLE HUB WING ROUTER
  // Allows focusing on one room on mobile or viewing All Wings without losing widgets.
  // =========================================================================
  let activeWing = 'all';

  function filterWing(wingKey) {
    activeWing = wingKey || 'all';
    const wings = document.querySelectorAll('.hub-wing-section[data-hub-wing]');
    wings.forEach((sec) => {
      const w = sec.getAttribute('data-hub-wing');
      sec.hidden = activeWing !== 'all' && w !== activeWing;
    });

    document.querySelectorAll('.hub-wing-pill').forEach((btn) => {
      const btnWing = btn.getAttribute('data-wing-filter');
      const isActive = btnWing === activeWing;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function revealWingForTarget(hashId) {
    if (!hashId) return;
    const cleanId = hashId.replace(/^#/, '');
    const targetEl = document.getElementById(cleanId);
    if (!targetEl) return;
    const wingSec = targetEl.closest('.hub-wing-section[data-hub-wing]');
    if (wingSec && wingSec.hidden) {
      filterWing(wingSec.getAttribute('data-hub-wing'));
    }
  }

  // =========================================================================
  // 2. WARM WEB AUDIO ENGINE (ON-DEMAND ONLY — NO AUTOPLAY)
  // Synthesizes gentle acoustic chord voicings & soft hand-drum/shaker groove
  // =========================================================================
  let audioCtx = null;
  let rhythmTimer = null;
  let groovePlaying = false;
  let grooveBpm = 84;
  let grooveStep = 0;
  let activeProgKey = 'soul';
  let tapTimes = [];

  const CHORD_PROGRESSIONS = {
    soul: [
      { label: 'Fmaj7', feel: 'Warm Root', freqs: [174.61, 220.0, 261.63, 329.63] },
      { label: 'Em7', feel: 'Soft Drift', freqs: [164.81, 196.0, 246.94, 293.66] },
      { label: 'Dm7', feel: 'Spoken Pocket', freqs: [146.83, 174.61, 220.0, 261.63] },
      { label: 'Cmaj7', feel: 'Home Resolve', freqs: [130.81, 164.81, 196.0, 246.94] }
    ],
    hearth: [
      { label: 'G', feel: 'Open Strumming', freqs: [196.0, 246.94, 293.66, 392.0] },
      { label: 'D/F#', feel: 'Story Lift', freqs: [185.0, 220.0, 293.66, 369.99] },
      { label: 'Em7', feel: 'Evening Reflection', freqs: [164.81, 196.0, 246.94, 329.63] },
      { label: 'Cadd9', feel: 'Gentle Landing', freqs: [130.81, 196.0, 261.63, 293.66] }
    ],
    poet: [
      { label: 'Am7', feel: 'Quiet Depth', freqs: [220.0, 261.63, 329.63, 392.0] },
      { label: 'Fmaj7', feel: 'Heart Opening', freqs: [174.61, 220.0, 261.63, 329.63] },
      { label: 'Dm9', feel: 'Tension Release', freqs: [146.83, 220.0, 261.63, 329.63] },
      { label: 'E7sus4', feel: 'Breath Turn', freqs: [164.81, 220.0, 246.94, 293.66] }
    ]
  };

  function ensureAudioCtx() {
    if (!audioCtx) {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (AudioContextCtor) {
        audioCtx = new AudioContextCtor();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playChordPad(idx) {
    const ctx = ensureAudioCtx();
    const chords = CHORD_PROGRESSIONS[activeProgKey] || CHORD_PROGRESSIONS.soul;
    const chord = chords[idx];
    if (!chord) return;

    const pads = document.querySelectorAll('.jam-chord-pad');
    pads.forEach((p, i) => {
      if (i === idx) {
        p.classList.add('playing');
        setTimeout(() => p.classList.remove('playing'), 380);
      }
    });

    if (!ctx) return;
    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1150, now);
    filter.Q.setValueAtTime(0.7, now);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(0.14, now + 0.04);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    chord.freqs.forEach((freq, n) => {
      const osc = ctx.createOscillator();
      osc.type = n % 2 === 0 ? 'triangle' : 'sine';
      // Slight acoustic strum stagger (14ms per string/voice)
      const start = now + n * 0.014;
      osc.frequency.setValueAtTime(freq, start);
      osc.connect(filter);
      osc.start(start);
      osc.stop(now + 2.25);
    });
  }

  function playSoftDjembeStep(step) {
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    // 8th-note pocket pattern: bass on 0 & 3, gentle muted slap on 4, soft shaker on even/odd
    if (step % 8 === 0 || step % 8 === 3) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(step % 8 === 0 ? 118 : 145, now);
      osc.frequency.exponentialRampToValueAtTime(52, now + 0.14);
      g.gain.setValueAtTime(0.16, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (step % 8 === 4) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.08);
      g.gain.setValueAtTime(0.09, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (step % 2 === 1) {
      // Soft shaker transient
      const bufSize = Math.floor(ctx.sampleRate * 0.035);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.35));
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(3600, now);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.03, now);
      src.connect(hp);
      hp.connect(g);
      g.connect(ctx.destination);
      src.start(now);
    }
  }

  function toggleGroove() {
    const btn = document.getElementById('btnJamGrooveToggle');
    if (groovePlaying) {
      clearInterval(rhythmTimer);
      rhythmTimer = null;
      groovePlaying = false;
      if (btn) btn.textContent = '▶ Play Soft Pocket Groove';
      return;
    }

    ensureAudioCtx();
    groovePlaying = true;
    grooveStep = 0;
    const stepMs = Math.round((60 / grooveBpm / 2) * 1000);
    playSoftDjembeStep(grooveStep++);
    rhythmTimer = setInterval(() => {
      playSoftDjembeStep(grooveStep++);
    }, stepMs);
    if (btn) btn.textContent = '⏸ Pause Pocket Groove';
  }

  function setGrooveBpm(val) {
    grooveBpm = Math.min(112, Math.max(66, Number(val) || 84));
    const label = document.getElementById('jamBpmLabel');
    if (label) label.textContent = `${grooveBpm} BPM`;
    const slider = document.getElementById('jamBpmSlider');
    if (slider && Number(slider.value) !== grooveBpm) slider.value = String(grooveBpm);
    if (groovePlaying) {
      clearInterval(rhythmTimer);
      const stepMs = Math.round((60 / grooveBpm / 2) * 1000);
      rhythmTimer = setInterval(() => playSoftDjembeStep(grooveStep++), stepMs);
    }
  }

  function tapTempo() {
    const now = performance.now();
    tapTimes = tapTimes.filter((t) => now - t < 2500);
    tapTimes.push(now);
    if (tapTimes.length >= 2) {
      const diffs = [];
      for (let i = 1; i < tapTimes.length; i++) diffs.push(tapTimes[i] - tapTimes[i - 1]);
      const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      const bpm = Math.round(60000 / avg);
      setGrooveBpm(bpm);
    }
  }

  function selectProgression(key) {
    if (!CHORD_PROGRESSIONS[key]) return;
    activeProgKey = key;
    document.querySelectorAll('.jam-key-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-prog') === key);
    });
    const chords = CHORD_PROGRESSIONS[key];
    document.querySelectorAll('.jam-chord-pad').forEach((pad, idx) => {
      const ch = chords[idx];
      if (!ch) return;
      const nameEl = pad.querySelector('.jam-chord-name');
      const feelEl = pad.querySelector('.jam-chord-feel');
      if (nameEl) nameEl.textContent = ch.label;
      if (feelEl) feelEl.textContent = ch.feel;
    });
  }

  // =========================================================================
  // 3. OPEN MIC REHEARSAL TIMER + OPTIONAL 4-2-6 BREATH CUE
  // =========================================================================
  let timerTotalSec = 180;
  let timerRemainingSec = 180;
  let timerInterval = null;
  let timerRunning = false;
  let preBreathRemaining = 0;

  function formatMmSs(sec) {
    const m = Math.floor(Math.max(0, sec) / 60);
    const s = Math.max(0, sec) % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function renderStageTimer() {
    const box = document.getElementById('stageTimerBox');
    const digits = document.getElementById('stageTimerDigits');
    const status = document.getElementById('stageTimerStatus');
    const bar = document.getElementById('stageTimerBar');
    if (!box || !digits || !status || !bar) return;

    box.classList.remove('state-breath', 'state-wrapup', 'state-done');

    if (preBreathRemaining > 0) {
      box.classList.add('state-breath');
      digits.textContent = `00:${String(preBreathRemaining).padStart(2, '0')}`;
      if (preBreathRemaining > 8) status.textContent = '🍃 Grounding Cue: Inhale gently (4s)...';
      else if (preBreathRemaining > 6) status.textContent = '🍃 Hold softly (2s)...';
      else status.textContent = '🍃 Slow exhale (6s) — step to your mic...';
      bar.style.width = `${(preBreathRemaining / 12) * 100}%`;
      bar.style.background = '#7DD3FC';
      return;
    }

    digits.textContent = formatMmSs(timerRemainingSec);
    const pct = timerTotalSec > 0 ? (timerRemainingSec / timerTotalSec) * 100 : 0;
    bar.style.width = `${pct}%`;

    if (timerRemainingSec === 0) {
      box.classList.add('state-done');
      status.textContent = '✨ Time Complete — Take a bow & exhale softly!';
      bar.style.background = '#4ADE80';
    } else if (timerRunning && timerRemainingSec <= 30) {
      box.classList.add('state-wrapup');
      status.textContent = '🟡 Gentle 30-second wrap-up cue';
      bar.style.background = '#FBBF24';
    } else if (timerRunning) {
      status.textContent = '🎙️ Your stage time is flowing cleanly...';
      bar.style.background = 'linear-gradient(90deg, #4ADE80 0%, #D4AF37 100%)';
    } else {
      status.textContent = 'Ready when you are — set your pace';
      bar.style.background = 'linear-gradient(90deg, #4ADE80 0%, #D4AF37 100%)';
    }
  }

  function setStagePreset(sec) {
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning = false;
    preBreathRemaining = 0;
    timerTotalSec = Number(sec) || 180;
    timerRemainingSec = timerTotalSec;
    document.querySelectorAll('.stage-preset-btn').forEach((btn) => {
      btn.classList.toggle('active', Number(btn.getAttribute('data-seconds')) === timerTotalSec);
    });
    const toggleBtn = document.getElementById('btnStageTimerToggle');
    if (toggleBtn) toggleBtn.textContent = '▶ Start Set Timer';
    renderStageTimer();
  }

  function toggleStageTimer() {
    const toggleBtn = document.getElementById('btnStageTimerToggle');
    if (timerRunning) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerRunning = false;
      if (toggleBtn) toggleBtn.textContent = '▶ Resume Timer';
      renderStageTimer();
      return;
    }

    if (timerRemainingSec === 0) {
      timerRemainingSec = timerTotalSec;
    }

    const useBreath = document.getElementById('chkStageBreathCue');
    if (timerRemainingSec === timerTotalSec && useBreath && useBreath.checked && preBreathRemaining === 0) {
      preBreathRemaining = 12;
    }

    timerRunning = true;
    if (toggleBtn) toggleBtn.textContent = '⏸ Pause Timer';
    renderStageTimer();

    timerInterval = setInterval(() => {
      if (preBreathRemaining > 0) {
        preBreathRemaining--;
        renderStageTimer();
        return;
      }
      if (timerRemainingSec > 0) {
        timerRemainingSec--;
        renderStageTimer();
        if (timerRemainingSec === 0) {
          clearInterval(timerInterval);
          timerInterval = null;
          timerRunning = false;
          if (toggleBtn) toggleBtn.textContent = '🔄 Practice Again';
          playChordPad(3);
        }
      }
    }, 1000);
  }

  function resetStageTimer() {
    setStagePreset(timerTotalSec);
  }

  // =========================================================================
  // 4. ANONYMOUS MOOD CHECK-IN PULSE & GOOGLE SHEETS / CSV EXPORT
  // Captures non-PII pre/post check-in shifts for grant reporting ledgers
  // =========================================================================
  const LEDGER_STORAGE_KEY = 'sanctuary_anonymous_checkin_ledger_v1';

  function getLedgerRows() {
    try {
      const raw = localStorage.getItem(LEDGER_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveLedgerRows(rows) {
    try {
      localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(rows.slice(-200)));
    } catch (_) {}
  }

  function renderLedgerCount() {
    const rows = getLedgerRows();
    const countEl = document.getElementById('hubCheckInCountVal');
    if (countEl) countEl.textContent = String(rows.length);
  }

  function logMoodCheckIn(postFeeling) {
    const activeEmotionBtn = document.querySelector('.hearth-pill-btn.active');
    const arrivalMood = activeEmotionBtn
      ? activeEmotionBtn.textContent.trim()
      : 'Reflecting in Hub';
    const noteEl = document.getElementById('hearthReflectionInput');
    const noteText = noteEl && noteEl.value ? noteEl.value.trim().slice(0, 140) : '';

    const row = {
      timestamp: new Date().toISOString(),
      portal: 'Community Hub Hearth Mirror',
      arrivalMood,
      postFeeling: postFeeling || 'Calmer & Grounded',
      takeawayNote: noteText || 'Paused & checked in anonymously',
      source: 'Anonymous Hub Check-In'
    };

    const rows = getLedgerRows();
    rows.push(row);
    saveLedgerRows(rows);
    renderLedgerCount();

    const statusEl = document.getElementById('hubCheckInToast');
    if (statusEl) {
      statusEl.textContent = `✓ Logged anonymously (${row.postFeeling}) — thank you for checking in!`;
      statusEl.style.display = 'block';
      setTimeout(() => { statusEl.style.display = 'none'; }, 3500);
    }
  }

  function csvEscape(val) {
    const s = String(val == null ? '' : val).replace(/"/g, '""');
    return `"${s}"`;
  }

  function exportCheckInCsv() {
    const rows = getLedgerRows();
    const header = ['Timestamp', 'Portal', 'Arrival_Mood', 'Post_Feeling', 'Takeaway_Note', 'Source'];
    const dataRows = rows.length ? rows : [{
      timestamp: new Date().toISOString(),
      portal: 'Community Hub Hearth Mirror',
      arrivalMood: 'Seeking Peace',
      postFeeling: 'Calmer & Grounded',
      takeawayNote: 'Sample row (log check-ins above)',
      source: 'Anonymous Hub Check-In'
    }];

    const csv = [
      header.join(','),
      ...dataRows.map((r) => [
        csvEscape(r.timestamp),
        csvEscape(r.portal),
        csvEscape(r.arrivalMood),
        csvEscape(r.postFeeling),
        csvEscape(r.takeawayNote),
        csvEscape(r.source)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inner-sanctuary-hub-checkins-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function copyCheckInsForSheet() {
    const rows = getLedgerRows();
    const targetRows = rows.length ? rows : [{
      timestamp: new Date().toISOString(),
      portal: 'Community Hub Hearth Mirror',
      arrivalMood: 'Seeking Peace',
      postFeeling: 'Calmer & Grounded',
      takeawayNote: 'Sample check-in entry',
      source: 'Anonymous Hub Check-In'
    }];
    const tsv = targetRows
      .map((r) => [r.timestamp, r.portal, r.arrivalMood, r.postFeeling, r.takeawayNote, r.source].join('\t'))
      .join('\n');

    const showCopied = () => {
      const statusEl = document.getElementById('hubCheckInToast');
      if (statusEl) {
        statusEl.textContent = `✓ Copied ${targetRows.length} check-in row(s) — paste straight into Google Sheets!`;
        statusEl.style.display = 'block';
        setTimeout(() => { statusEl.style.display = 'none'; }, 3500);
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tsv).then(showCopied).catch(showCopied);
    }
  }

  // Expose cleanly on shared Sanctuary namespace
  window.sanctuaryHubWings = {
    filterWing,
    revealWingForTarget,
    setStagePreset,
    toggleStageTimer,
    resetStageTimer,
    selectProgression,
    playChordPad,
    toggleGroove,
    setGrooveBpm,
    tapTempo,
    logMoodCheckIn,
    exportCheckInCsv,
    copyCheckInsForSheet
  };

  document.addEventListener('DOMContentLoaded', () => {
    renderStageTimer();
    renderLedgerCount();

    // Sync nav links & in-page anchor clicks cleanly with Wing visibility
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', () => {
        revealWingForTarget(anchor.getAttribute('href'));
      });
    });

    if (window.location.hash) {
      revealWingForTarget(window.location.hash);
    }
  });
})();
