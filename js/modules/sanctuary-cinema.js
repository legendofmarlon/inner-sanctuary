/**
 * Inner Sanctuary Wellness Foundation — Cinema Atmosphere & Documentary Reel
 * Coordinates Ken Burns documentary reel playback, gentle background scroll
 * parallax, and staggered below-the-fold scroll reveals.
 */
(function () {
  'use strict';

  const REEL_INTERVAL_MS = 7000;
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const SCENES = [
    {
      index: 0,
      tag: 'Scene 01 • Real Community Warmth',
      title: 'Come As You Are, Together',
      desc: 'Artists, families, youth, and elders sharing the room in substance-free warmth and belonging.'
    },
    {
      index: 1,
      tag: 'Scene 02 • The Unhurried Stage',
      title: 'Raw Voices, Zero Competition',
      desc: 'An alcohol-free stage where poets, musicians, and first-timers are witnessed with care.'
    },
    {
      index: 2,
      tag: 'Scene 03 • Anchor-Word Keepsakes',
      title: 'Intention Woven by Hand',
      desc: 'Neighbors craft personal gemstone anchor bracelets to carry calm back into daily life.'
    },
    {
      index: 3,
      tag: 'Scene 04 • Shared Hearth Circle',
      title: 'Because No One Should Heal Alone',
      desc: 'Youth, elders, and local creators gathering in Santa Ana and across Orange County.'
    }
  ];

  let activeScene = 0;
  let isPlaying = !prefersReducedMotion;
  let reelTimer = null;

  function updateReelUI(nextIndex) {
    const reel = document.getElementById('sanctuary-cinema-reel');
    if (!reel) return;

    const slides = reel.querySelectorAll('.cinema-reel-slide');
    const chapters = reel.querySelectorAll('.cinema-chapter-btn');
    const progress = document.getElementById('cinemaReelProgress');
    const tagEl = document.getElementById('cinemaReelTag');
    const titleEl = document.getElementById('cinemaReelHeading');
    const descEl = document.getElementById('cinemaReelDesc');

    activeScene = ((nextIndex % SCENES.length) + SCENES.length) % SCENES.length;
    const meta = SCENES[activeScene];

    slides.forEach((slide, idx) => {
      const active = idx === activeScene;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      // Restart subtle Ken Burns animation cleanly on reveal
      if (active && !prefersReducedMotion) {
        const img = slide.querySelector('img');
        if (img) {
          img.style.animation = 'none';
          void img.offsetWidth;
          img.style.animation = '';
        }
      }
    });

    chapters.forEach((btn, idx) => {
      const active = idx === activeScene;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    if (progress) {
      progress.style.width = `${((activeScene + 1) / SCENES.length) * 100}%`;
    }
    if (tagEl) tagEl.textContent = meta.tag;
    if (titleEl) titleEl.textContent = meta.title;
    if (descEl) descEl.textContent = meta.desc;
  }

  function updatePlayToggleUI() {
    const btn = document.getElementById('cinemaReelPlayBtn');
    if (!btn) return;
    btn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    btn.innerHTML = isPlaying
      ? '<span>⏸</span><span>Pause Reel</span>'
      : '<span>▶</span><span>Play Reel</span>';
  }

  function stopReelTimer() {
    if (reelTimer) {
      clearInterval(reelTimer);
      reelTimer = null;
    }
  }

  function startReelTimer() {
    stopReelTimer();
    if (!isPlaying || prefersReducedMotion) return;
    reelTimer = setInterval(() => {
      updateReelUI(activeScene + 1);
    }, REEL_INTERVAL_MS);
  }

  function initReel() {
    const reel = document.getElementById('sanctuary-cinema-reel');
    if (!reel) return;

    const viewport = reel.querySelector('.cinema-reel-viewport');
    if (viewport) {
      viewport.addEventListener('mouseenter', stopReelTimer);
      viewport.addEventListener('mouseleave', startReelTimer);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopReelTimer();
      else startReelTimer();
    });

    updateReelUI(0);
    updatePlayToggleUI();
    startReelTimer();
  }

  function initScrollParallax() {
    if (prefersReducedMotion) return;

    let ticking = false;
    const updateParallax = () => {
      const y = window.scrollY || 0;
      const bgShift = Math.max(-24, Math.min(24, -(y * 0.018)));
      const emblemShift = Math.max(-18, Math.min(18, y * 0.05));
      document.documentElement.style.setProperty('--cinema-bg-shift', `${bgShift.toFixed(2)}px`);
      document.documentElement.style.setProperty('--cinema-emblem-shift', `${emblemShift.toFixed(2)}px`);
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  function initStaggeredReveals() {
    const targets = document.querySelectorAll(
      [
        'main#main-content > section .section-header',
        '.cinema-reel-shell',
        '.impact-story-card',
        '.core-activation-card',
        '.lsd-focus-card',
        '.program-spotlight-card',
        '.horizon-card',
        '.pathway-card',
        '.tier-box'
      ].join(', ')
    );

    if (!targets.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const foldThreshold = window.innerHeight * 0.92;
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    // Group siblings for crisp 0..3 stagger cadence
    const parentCounts = new WeakMap();
    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= foldThreshold) {
        // Above or near fold: keep immediately visible
        return;
      }
      const parent = el.parentElement || document.body;
      const order = parentCounts.get(parent) || 0;
      parentCounts.set(parent, (order + 1) % 4);
      el.style.setProperty('--reveal-order', String(order));
      el.classList.add('cinema-reveal');
      observer.observe(el);
    });
  }

  window.sanctuaryCinema = {
    goToScene: function (idx) {
      updateReelUI(idx);
      if (isPlaying) startReelTimer();
    },
    nextScene: function () {
      updateReelUI(activeScene + 1);
      if (isPlaying) startReelTimer();
    },
    prevScene: function () {
      updateReelUI(activeScene - 1);
      if (isPlaying) startReelTimer();
    },
    togglePlay: function () {
      isPlaying = !isPlaying;
      updatePlayToggleUI();
      if (isPlaying) startReelTimer();
      else stopReelTimer();
    }
  };

  function initSubnavScrollSpy() {
    const links = Array.from(document.querySelectorAll('#sanctuarySubnavBar .subnav-pill-link[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;

    const map = new Map();
    links.forEach((link) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) map.set(target, link);
    });

    if (!map.size) return;

    const setActive = (activeLink) => {
      links.forEach((l) => {
        const match = l === activeLink;
        l.classList.toggle('is-active', match);
        if (match) l.setAttribute('aria-current', 'location');
        else l.removeAttribute('aria-current');
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) {
          const link = map.get(visible[0].target);
          if (link) setActive(link);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.05, 0.25, 0.5] }
    );

    map.forEach((_, section) => observer.observe(section));
  }

  function initStoryProgressAndAudioPulse() {
    let ticking = false;
    const updateProgress = () => {
      const doc = document.documentElement;
      const scrollMax = Math.max(1, doc.scrollHeight - window.innerHeight);
      const pct = Math.max(0, Math.min(1, (window.scrollY || 0) / scrollMax));
      doc.style.setProperty('--cinema-scroll-pct', pct.toFixed(4));
      ticking = false;
    };

    updateProgress();
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateProgress);
          ticking = true;
        }
      },
      { passive: true }
    );

    if (prefersReducedMotion) return;

    const pulseLoop = () => {
      if (!document.hidden) {
        const energy =
          typeof window.getSanctuaryAudioEnergy === 'function'
            ? window.getSanctuaryAudioEnergy()
            : 0;
        document.documentElement.style.setProperty('--cinema-audio-energy', energy.toFixed(3));
      }
      window.requestAnimationFrame(pulseLoop);
    };
    window.requestAnimationFrame(pulseLoop);
  }

  function initCursorLanternLit() {
    if (prefersReducedMotion || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) {
      return;
    }

    const cards = document.querySelectorAll(
      '.cinema-reel-shell, .core-activation-card, .impact-story-card, .program-spotlight-card, .horizon-card, .photo-wheel-card'
    );
    cards.forEach((card) => {
      card.classList.add('cinema-lantern-lit');
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100;
        const y = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 100;
        card.style.setProperty('--mx', `${x.toFixed(1)}%`);
        card.style.setProperty('--my', `${y.toFixed(1)}%`);
      });
    });
  }

  function initHubCabinParallax() {
    if (prefersReducedMotion || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) {
      return;
    }
    const hero = document.querySelector('.hub-lodge-hero');
    if (!hero) return;

    hero.addEventListener('pointermove', (e) => {
      const rect = hero.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
      const ny = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
      hero.style.setProperty('--hub-cam-x', `${(-nx * 14).toFixed(2)}px`);
      hero.style.setProperty('--hub-cam-y', `${(-ny * 10).toFixed(2)}px`);
    });

    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--hub-cam-x', '0px');
      hero.style.setProperty('--hub-cam-y', '0px');
    });
  }

  function initTheaterMode() {
    let isTheater = false;

    const syncTheaterUI = () => {
      document.body.classList.toggle('cinema-theater-mode', isTheater);
      const stage = document.getElementById('cinemaTheaterStage');
      if (stage) stage.setAttribute('aria-hidden', isTheater ? 'false' : 'true');

      const toggleBtn = document.getElementById('cinemaTheaterToggleBtn');
      if (toggleBtn) toggleBtn.setAttribute('aria-pressed', isTheater ? 'true' : 'false');

      const audioBtn = document.getElementById('theaterAudioBtn');
      if (audioBtn && window.soundscape) {
        audioBtn.textContent = window.soundscape.isPlaying ? '🔊 Pause Sound' : '🔈 Tune In';
      }
    };

    window.sanctuaryCinema.toggleTheater = function (forceState) {
      isTheater = typeof forceState === 'boolean' ? forceState : !isTheater;
      syncTheaterUI();

      if (isTheater && window.soundscape && !window.soundscape.isPlaying) {
        try {
          window.soundscape.start();
          setTimeout(syncTheaterUI, 80);
        } catch (_) {}
      }

      if (isTheater && document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (!isTheater && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };

    window.sanctuaryCinema.theaterToggleSound = function () {
      if (window.soundscape) {
        window.soundscape.toggle();
        syncTheaterUI();
      }
    };

    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag) || (e.target && e.target.isContentEditable)) return;

      if (e.key === 'Escape' && isTheater) {
        window.sanctuaryCinema.toggleTheater(false);
      } else if ((e.key === 'f' || e.key === 'F') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (document.getElementById('cinemaTheaterStage')) {
          window.sanctuaryCinema.toggleTheater();
        }
      }
    });

    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && isTheater) {
        syncTheaterUI();
      }
    });
  }

  function initInviteFlyer() {
    let lastBlob = null;

    function loadImg(src) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    }

    function wrapLines(ctx, text, maxWidth) {
      const words = text.split(' ');
      const lines = [];
      let cur = '';
      words.forEach((w) => {
        const test = cur ? `${cur} ${w}` : w;
        if (ctx.measureText(test).width > maxWidth && cur) {
          lines.push(cur);
          cur = w;
        } else {
          cur = test;
        }
      });
      if (cur) lines.push(cur);
      return lines;
    }

    async function renderInviteCanvas() {
      const canvas = document.getElementById('inviteFlyerCanvas');
      const preview = document.getElementById('inviteFlyerPreviewImg');
      if (!canvas || !preview) return;
      const ctx = canvas.getContext('2d');
      const W = 1080;
      const H = 1920;

      // Background emerald obsidian gradient
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0B1F16');
      bg.addColorStop(0.45, '#153A2A');
      bg.addColorStop(1, '#07130D');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Warm radial hearth halo
      const glow = ctx.createRadialGradient(W / 2, 520, 40, W / 2, 520, 560);
      glow.addColorStop(0, 'rgba(245, 196, 86, 0.28)');
      glow.addColorStop(0.5, 'rgba(197, 154, 63, 0.08)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // Outer gold frame border
      ctx.strokeStyle = 'rgba(245, 215, 127, 0.55)';
      ctx.lineWidth = 4;
      ctx.strokeRect(42, 42, W - 84, H - 84);

      const [emblemImg, heroImg] = await Promise.all([
        loadImg('emblem.png'),
        loadImg('images/openmic/community-sanctuary-family.jpg')
      ]);

      // Sacred Emblem
      if (emblemImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, 185, 86, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(emblemImg, W / 2 - 86, 99, 172, 172);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(W / 2, 185, 90, 0, Math.PI * 2);
        ctx.strokeStyle = '#F5D77F';
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      // Eyebrow & Title
      ctx.textAlign = 'center';
      ctx.fillStyle = '#F8D98C';
      ctx.font = '700 28px Montserrat, sans-serif';
      ctx.fillText("YOU'RE INVITED • FREE COMMUNITY GATHERING", W / 2, 340);

      ctx.fillStyle = '#FFFDF7';
      ctx.font = '700 66px Cinzel, Georgia, serif';
      const titleLines = wrapLines(ctx, 'Jam Session: The Unplugged Playground', W - 160);
      titleLines.forEach((ln, idx) => {
        ctx.fillText(ln, W / 2, 430 + idx * 78);
      });

      ctx.fillStyle = '#DCEEE2';
      ctx.font = '500 32px Montserrat, sans-serif';
      ctx.fillText('10 Humans • A Few Instruments • Endless Possibilities', W / 2, 608);

      // Community photo card
      if (heroImg) {
        const px = 96;
        const py = 670;
        const pw = W - 192;
        const ph = 520;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(px, py, pw, ph, 28);
        ctx.clip();
        const scale = Math.max(pw / heroImg.width, ph / heroImg.height);
        const dw = heroImg.width * scale;
        const dh = heroImg.height * scale;
        ctx.drawImage(heroImg, px + (pw - dw) / 2, py + (ph - dh) * 0.25, dw, dh);
        ctx.restore();
        ctx.strokeStyle = 'rgba(245, 215, 127, 0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(px, py, pw, ph, 28);
        ctx.stroke();
      }

      // Details Box
      ctx.fillStyle = 'rgba(9, 22, 16, 0.88)';
      ctx.strokeStyle = 'rgba(245, 215, 127, 0.5)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(96, 1245, W - 192, 410, 26);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F5D77F';
      ctx.font = '700 42px Cinzel, Georgia, serif';
      ctx.fillText('THURSDAY, DECEMBER 10, 2026', W / 2, 1325);

      ctx.fillStyle = '#FFFDF7';
      ctx.font = '700 38px Montserrat, sans-serif';
      ctx.fillText('6:00 PM – 8:00 PM PST', W / 2, 1390);

      ctx.fillStyle = '#86EFAC';
      ctx.font = '600 34px Montserrat, sans-serif';
      ctx.fillText('📍 1501 W Alton Ave • Santa Ana, CA', W / 2, 1465);

      ctx.fillStyle = '#DCEEE2';
      ctx.font = '500 29px Montserrat, sans-serif';
      ctx.fillText('Bring an acoustic instrument or just your ears.', W / 2, 1545);
      ctx.fillText('100% Free Admission • Substance-Free Sanctuary', W / 2, 1595);

      // Footer
      ctx.fillStyle = '#F8D98C';
      ctx.font = '700 28px Cinzel, Georgia, serif';
      ctx.fillText('Inner Sanctuary Wellness Foundation × SoCal Creatives Collective', W / 2, 1745);
      ctx.fillStyle = '#CBD7D0';
      ctx.font = '600 26px Montserrat, sans-serif';
      ctx.fillText('@ourinnersanctuary • innersanctuarywellnessfoundation.org', W / 2, 1805);

      preview.src = canvas.toDataURL('image/png');
      canvas.toBlob((blob) => {
        lastBlob = blob;
      }, 'image/png');
    }

    const setFlyerToast = (msg) => {
      const el = document.getElementById('inviteFlyerToast');
      if (el) el.textContent = msg;
    };

    window.sanctuaryCinema.openInviteFlyer = function () {
      const modal = document.getElementById('inviteFlyerModal');
      if (!modal) return;
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      setFlyerToast('Rendering your Dec 10 invite flyer...');
      renderInviteCanvas().then(() => setFlyerToast('Ready to save or text to a friend!'));
    };

    window.sanctuaryCinema.closeInviteFlyer = function () {
      const modal = document.getElementById('inviteFlyerModal');
      if (!modal) return;
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    };

    window.sanctuaryCinema.downloadInviteFlyer = function () {
      const canvas = document.getElementById('inviteFlyerCanvas');
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = 'dec10-unplugged-playground-invite.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      setFlyerToast('✓ Flyer saved as PNG!');
    };

    window.sanctuaryCinema.shareInviteFlyer = async function () {
      const text =
        'Come pull up to Jam Session: The Unplugged Playground on Thu, Dec 10 (6–8 PM) at 1501 W Alton Ave, Santa Ana! 100% free & alcohol-free. RSVP: https://www.meetup.com/socal-creatives-collective/events/317462800/';
      try {
        if (navigator.share && lastBlob) {
          const file = new File([lastBlob], 'dec10-inner-sanctuary-invite.png', { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ title: 'Jam Session: The Unplugged Playground (Dec 10)', text, files: [file] });
            setFlyerToast('✓ Shared invite flyer!');
            return;
          }
          await navigator.share({ title: 'Jam Session: The Unplugged Playground (Dec 10)', text });
          setFlyerToast('✓ Invite shared!');
          return;
        }
      } catch (_) {}
      window.sanctuaryCinema.downloadInviteFlyer();
    };

    window.sanctuaryCinema.copyInviteText = function () {
      const text =
        'Come pull up with me to Jam Session: The Unplugged Playground! 🎶\nThu, Dec 10 • 6:00–8:00 PM PST\n📍 1501 W Alton Ave, Santa Ana, CA\n100% Free • Alcohol-Free Sanctuary\nRSVP: https://www.meetup.com/socal-creatives-collective/events/317462800/';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => setFlyerToast('✓ Invite message copied—paste into a text!'));
      }
    };

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('inviteFlyerModal');
        if (modal && modal.style.display === 'flex') {
          window.sanctuaryCinema.closeInviteFlyer();
        }
      }
    });
  }

  function initVoiceGrounding() {
    const STEPS = [
      { key: 'inhale', src: 'audio/voice_inhale.wav', prompt: 'Breathe in slowly...', stokeStep: 0 },
      { key: 'hold', src: 'audio/voice_hold.wav', prompt: 'Hold gently...', stokeStep: 0 },
      { key: 'exhale', src: 'audio/voice_exhale.wav', prompt: 'Exhale and soften...', stokeStep: 1 },
      { key: 'remember', src: 'audio/voice_remember.wav', prompt: 'Remember who you are.', stokeStep: 1 }
    ];

    let isPlaying = false;
    let currentStepIdx = -1;
    let currentAudio = null;
    let priorSoundscapeVol = null;

    function updateUI() {
      const btn = document.getElementById('voiceGroundingToggleBtn');
      const status = document.getElementById('voiceGroundingStatus');
      const dots = document.querySelectorAll('#voicePhaseDots .voice-phase-dot');

      if (btn) {
        btn.classList.toggle('is-playing', isPlaying);
        btn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
        btn.innerHTML = isPlaying
          ? '<span>⏹</span><span>Stop Voice</span>'
          : '<span>🎙️</span><span>20s Voice Grounding</span>';
      }

      if (status) {
        status.textContent =
          isPlaying && currentStepIdx >= 0 && STEPS[currentStepIdx]
            ? STEPS[currentStepIdx].prompt
            : 'Guided breath cue • Hear a 20-sec sanctuary reset';
      }

      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', isPlaying && idx === currentStepIdx);
      });
    }

    function stopGrounding() {
      isPlaying = false;
      currentStepIdx = -1;
      if (currentAudio) {
        currentAudio.onended = null;
        currentAudio.onerror = null;
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
      }
      if (window.sanctuaryBreathSync) {
        window.sanctuaryBreathSync.active = false;
      }
      if (priorSoundscapeVol !== null && window.soundscape && window.soundscape.isPlaying) {
        window.soundscape.setVolume(priorSoundscapeVol);
      }
      priorSoundscapeVol = null;
      updateUI();
    }

    function playStep(idx) {
      if (!isPlaying) return;
      if (idx >= STEPS.length) {
        stopGrounding();
        return;
      }

      currentStepIdx = idx;
      const step = STEPS[idx];
      if (window.sanctuaryBreathSync) {
        window.sanctuaryBreathSync.active = true;
        window.sanctuaryBreathSync.step = step.stokeStep;
        window.sanctuaryBreathSync.ease = 0.75;
      }
      updateUI();

      const audio = new Audio(step.src);
      audio.preload = 'auto';
      currentAudio = audio;

      audio.onended = () => {
        if (isPlaying) playStep(idx + 1);
      };
      audio.onerror = () => {
        if (isPlaying) playStep(idx + 1);
      };

      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => stopGrounding());
      }
    }

    window.sanctuaryCinema.toggleVoiceGrounding = function () {
      if (isPlaying) {
        stopGrounding();
        return;
      }
      isPlaying = true;
      if (window.soundscape && window.soundscape.isPlaying) {
        priorSoundscapeVol = window.soundscape.volume;
        window.soundscape.setVolume(Math.max(0.12, priorSoundscapeVol * 0.45));
      }
      playStep(0);
    };
  }

  function initLiveEventDayMode() {
    const EVENT_START = new Date('2026-12-10T18:00:00-08:00').getTime();
    const EVENT_END = new Date('2026-12-10T20:00:00-08:00').getTime();
    const DAY_START = new Date('2026-12-10T00:00:00-08:00').getTime();

    let previewMode = false;

    function syncEventState() {
      const now = Date.now();
      const card = document.querySelector('.event-featured-card');
      const liveBanner = document.getElementById('liveTonightStageBanner');
      const tag = document.getElementById('featuredEventTag');
      const previewBtn = document.getElementById('btnPreviewLiveTonight');
      const pillText = document.getElementById('liveTonightPillText');

      if (!card || !liveBanner) return;

      const isLiveWindow = now >= EVENT_START && now <= EVENT_END;
      const isEventDay = now >= DAY_START && now < EVENT_START;

      if (previewMode || isLiveWindow) {
        card.classList.add('is-live-tonight');
        liveBanner.hidden = false;
        if (pillText) {
          pillText.textContent = previewMode && !isLiveWindow
            ? 'LIVE TONIGHT PREVIEW • DOORS OPEN AT 6:00 PM'
            : 'LIVE TONIGHT • SANCTUARY DOORS ARE OPEN';
        }
        if (tag) tag.innerHTML = '<span>🔴</span> HAPPENING TONIGHT · DOORS OPEN 6–8 PM PST';
      } else if (isEventDay) {
        card.classList.remove('is-live-tonight');
        liveBanner.hidden = false;
        if (pillText) pillText.textContent = 'EVENT DAY • DOORS OPEN TONIGHT AT 6:00 PM PST';
        if (tag) tag.innerHTML = '<span>✦</span> TODAY · UNPLUGGED JAM SESSION AT 6:00 PM';
      } else {
        card.classList.remove('is-live-tonight');
        liveBanner.hidden = true;
        if (tag) tag.innerHTML = '<span>✦</span> NEXT UPCOMING · UNPLUGGED JAM SESSION';
      }

      if (previewBtn) {
        previewBtn.classList.toggle('btn-live-preview-active', previewMode);
        previewBtn.setAttribute('aria-pressed', previewMode ? 'true' : 'false');
        const label = previewBtn.querySelector('span');
        if (label) label.textContent = previewMode ? '🔴 Exit Live Preview' : '🔴 Preview Live Tonight';
      }
    }

    window.sanctuaryCinema.toggleLiveTonightPreview = function () {
      previewMode = !previewMode;
      syncEventState();
    };

    syncEventState();
    setInterval(syncEventState, 30000);
  }

  function boot() {
    initReel();
    initScrollParallax();
    initStaggeredReveals();
    initSubnavScrollSpy();
    initStoryProgressAndAudioPulse();
    initCursorLanternLit();
    initHubCabinParallax();
    initTheaterMode();
    initInviteFlyer();
    initVoiceGrounding();
    initLiveEventDayMode();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
