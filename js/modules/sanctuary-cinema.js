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
    let isStargaze = false;
    let currentEl = document.body.getAttribute('data-element') || 'fire';
    let promptCursor = { fire: 0, water: 0, earth: 0, air: 0, ether: 0 };
    let zCounter = 20;
    let idleTimer = null;
    let particleRaf = null;
    let particles = [];
    let bowlCtx = null;
    let hasShownWelcomePop = false;

    // Breathing Box state inside Breath & Sound pop-up
    let breathTimer = null;
    let breathRunning = false;
    let breathStepIdx = 0;
    let breathTick = 4;

    // Mini-Cinema Reel state
    let miniReelIdx = 0;

    // Hearth & Notes subtab state
    let notesTab = 'note';
    let showTheaterSpotify = false;
    let cachedNotes = [];

    // 4-Mode Backdrop & Visual Stage Engine ('living' DEFAULT | 'video' | 'slideshow' | 'nature')
    const SLIDE_INTERVAL_MS = 8500;
    const BACKDROP_MODES = [
      { key: 'living', label: '✨ Living Sky' },
      { key: 'video', label: '🎬 Motion Video' },
      { key: 'slideshow', label: '📸 Story Slides' },
      { key: 'nature', label: '🏔️ 8K Horizons' }
    ];

    const BACKDROP_PLAYLISTS = {
      video: [
        {
          type: 'video',
          tag: 'Film 01 • Stone Hearth Gathering',
          title: 'Nov 15 Stone Hearth Circle',
          poster: 'images/openmic/openmic-nov15-stone-hearth-celebration.jpg',
          webm: 'images/openmic/openmic-nov15-stone-hearth-celebration.webm',
          mp4: 'images/openmic/openmic-nov15-stone-hearth-celebration.mp4',
          thumb: 'images/openmic/openmic-nov15-stone-hearth-celebration.jpg'
        },
        {
          type: 'image',
          tag: 'Scene 02 • Candlelit Room',
          title: 'Acoustic Strings & Presence',
          src: 'images/video-frame-acoustic-stage.jpg',
          thumb: 'images/video-frame-acoustic-stage.jpg'
        },
        {
          type: 'image',
          tag: 'Scene 03 • 432Hz Resonance',
          title: 'Warm Sound Bowl Immersion',
          src: 'images/video-frame-sound-bowl.jpg',
          thumb: 'images/video-frame-sound-bowl.jpg'
        },
        {
          type: 'image',
          tag: 'Scene 04 • Handwoven Intentions',
          title: 'Anchor Gemstone Circle',
          src: 'images/video-frame-bead-weaver.jpg',
          thumb: 'images/video-frame-bead-weaver.jpg'
        },
        {
          type: 'image',
          tag: 'Scene 05 • The Unhurried Circle',
          title: 'Shared Sanctuary Warmth',
          src: 'images/video-frame-unhurried-circle.jpg',
          thumb: 'images/video-frame-unhurried-circle.jpg'
        }
      ],
      slideshow: [
        { type: 'image', tag: 'Chapter 01 • Hearth Warmth', title: '52 Neighbors Finding Home in One Room', src: 'images/openmic/community-sanctuary-family.jpg', thumb: 'images/openmic/community-sanctuary-family.jpg' },
        { type: 'image', tag: 'Chapter 02 • Acoustic Harmony', title: 'Unplugged Strings & Pure Breath', src: 'images/openmic/openmic-nov15-acoustic-duo-harmony.jpg', thumb: 'images/openmic/openmic-nov15-acoustic-duo-harmony.jpg' },
        { type: 'image', tag: 'Chapter 03 • Stone Hearth', title: 'Where Nobody Has to Wear a Mask', src: 'images/openmic/openmic-nov15-stone-hearth-celebration.jpg', thumb: 'images/openmic/openmic-nov15-stone-hearth-celebration.jpg' },
        { type: 'image', tag: 'Chapter 04 • Twilight Stillness', title: 'Poolside Dusk & Gathering', src: 'images/openmic/openmic-nov15-clubhouse-pool-dusk.jpg', thumb: 'images/openmic/openmic-nov15-clubhouse-pool-dusk.jpg' },
        { type: 'image', tag: 'Chapter 05 • Spoken Word', title: 'Honoring the Sacred Voice', src: 'images/openmic/openmic-nov15-spoken-word-circle.jpg', thumb: 'images/openmic/openmic-nov15-spoken-word-circle.jpg' },
        { type: 'image', tag: 'Chapter 06 • Storytelling', title: 'Stories That Mend the Spirit', src: 'images/openmic/openmic-nov15-storyteller-reflection.jpg', thumb: 'images/openmic/openmic-nov15-storyteller-reflection.jpg' },
        { type: 'image', tag: 'Chapter 07 • Ancestral Drum', title: 'Poolside Djembe Rhythm', src: 'images/openmic/openmic-nov15-djembe-poolside-rhythm.jpg', thumb: 'images/openmic/openmic-nov15-djembe-poolside-rhythm.jpg' },
        { type: 'image', tag: 'Chapter 08 • Belonging', title: 'Tender Presence & Sisterhood', src: 'images/openmic/openmic-nov15-reconnect-sisterhood.jpg', thumb: 'images/openmic/openmic-nov15-reconnect-sisterhood.jpg' }
      ],
      nature: [
        { type: 'image', tag: '8K Horizon • Fire', title: 'Warm Ember Hearth', src: 'images/nature-fire-8k.jpg', thumb: 'images/nature-fire-8k.jpg' },
        { type: 'image', tag: '8K Horizon • Water', title: 'Mountain Creek Stillness', src: 'images/nature-water-8k.jpg', thumb: 'images/nature-water-8k.jpg' },
        { type: 'image', tag: '8K Horizon • Ocean', title: 'Endless Ocean Horizon', src: 'images/sky-ocean-infinite-8k.jpg', thumb: 'images/sky-ocean-infinite-8k.jpg' },
        { type: 'image', tag: '8K Horizon • Earth', title: 'Ancient Forest Canopy', src: 'images/nature-earth-8k.jpg', thumb: 'images/nature-earth-8k.jpg' },
        { type: 'image', tag: '8K Horizon • Air', title: 'Open Sky Clarity', src: 'images/sky-air-8k.jpg', thumb: 'images/sky-air-8k.jpg' },
        { type: 'image', tag: '8K Horizon • Ether', title: 'Celestial Twilight', src: 'images/nature-ether-8k.jpg', thumb: 'images/nature-ether-8k.jpg' },
        { type: 'image', tag: '8K Horizon • Sanctuary', title: 'Twilight Cabin Lodge', src: 'images/clubhouse-cabin-speakeasy.jpg', thumb: 'images/clubhouse-cabin-speakeasy.jpg' }
      ]
    };

    let backdropMode = 'living'; // Preserve original Living Sky atmosphere by default
    let currentSlideIdx = 0;
    let isSlideshowPlaying = !prefersReducedMotion;
    let slideTimer = null;
    let stageDrawerOpen = false;
    let mountedPlaylistKey = null;

    function getActivePlaylist() {
      return BACKDROP_PLAYLISTS[backdropMode] || [];
    }

    function mountTheaterSlides(forceRebuild) {
      const container = document.getElementById('theaterBackdropSlides');
      if (!container) return;

      if (backdropMode === 'living') {
        container.classList.add('is-hidden-media');
        container.innerHTML = '';
        mountedPlaylistKey = 'living';
        updateSlideUI();
        renderStageDrawer();
        return;
      }

      container.classList.remove('is-hidden-media');
      const list = getActivePlaylist();

      if (mountedPlaylistKey !== backdropMode || forceRebuild) {
        currentSlideIdx = ((currentSlideIdx % list.length) + list.length) % list.length;
        container.innerHTML = list.map((s, idx) => `
          <div class="cinema-theater-slide${idx === currentSlideIdx ? ' active' : ''}" data-slide-idx="${idx}" aria-hidden="${idx === currentSlideIdx ? 'false' : 'true'}">
            ${
              s.type === 'video'
                ? `<video class="theater-slide-video" autoplay muted loop playsinline poster="${s.poster}"><source src="${s.webm}" type="video/webm" /><source src="${s.mp4}" type="video/mp4" /></video>`
                : `<img src="${s.src}" alt="${escapeHtml(s.title)}" class="theater-slide-img ken-burns-${(idx % 2) + 1}" loading="${idx === 0 ? 'eager' : 'lazy'}" />`
            }
            <div class="theater-slide-overlay" aria-hidden="true"></div>
          </div>
        `).join('');
        mountedPlaylistKey = backdropMode;
      }

      updateSlideUI();
      renderStageDrawer();
    }

    function renderStageDrawer() {
      const drawer = document.getElementById('theaterStageDrawer');
      if (!drawer) return;

      const list = getActivePlaylist();
      const modeMeta = BACKDROP_MODES.find((m) => m.key === backdropMode) || BACKDROP_MODES[0];

      drawer.innerHTML = `
        <div class="theater-stage-header">
          <div>
            <div class="theater-card-label" style="margin-bottom:2px;">Visual Sanctuary Backdrop</div>
            <div style="font-size:0.74rem;color:#CBD7D0;">${
              backdropMode === 'living'
                ? 'Displaying your original 8K Living Sky, Constellations & Ambient Particles.'
                : `${modeMeta.label} • Playing item ${(currentSlideIdx % Math.max(1, list.length)) + 1} of ${list.length}`
            }</div>
          </div>
          <button type="button" class="theater-win-btn theater-win-btn--close" onclick="window.sanctuaryCinema.toggleStageDrawer(false)" aria-label="Close backdrop panel">✕</button>
        </div>

        <div class="theater-mode-tabs" role="tablist" aria-label="Backdrop Display Modes">
          ${BACKDROP_MODES.map((m) => `
            <button type="button" class="theater-mode-tab${backdropMode === m.key ? ' active' : ''}" role="tab" aria-selected="${backdropMode === m.key ? 'true' : 'false'}" onclick="window.sanctuaryCinema.setBackdropMode('${m.key}')">${m.label}</button>
          `).join('')}
        </div>

        ${
          backdropMode !== 'living' && list.length
            ? `
              <div class="theater-stage-transport">
                <div class="theater-action-row">
                  <button type="button" class="theater-mini-btn" onclick="window.sanctuaryCinema.stepSlide(-1)">‹ Prev</button>
                  <button type="button" class="theater-mini-btn ${isSlideshowPlaying ? 'active' : ''}" onclick="window.sanctuaryCinema.toggleAutoPlaySlides()">${isSlideshowPlaying ? '⏸ Pause Auto' : '▶ Auto-Play'}</button>
                  <button type="button" class="theater-mini-btn" onclick="window.sanctuaryCinema.stepSlide(1)">Next ›</button>
                </div>
                <button type="button" class="theater-mini-btn ${isStargaze ? 'active' : ''}" onclick="window.sanctuaryCinema.toggleStargaze()">${isStargaze ? '👁️ Show Text' : '👁️ Hide Center Text'}</button>
              </div>
              <div class="theater-stage-thumbs">
                ${list.map((s, idx) => `
                  <button type="button" class="theater-chapter-chip${idx === currentSlideIdx ? ' active' : ''}" onclick="window.sanctuaryCinema.selectSlide(${idx})">
                    <img src="${s.thumb || s.src}" alt="" class="theater-chapter-thumb" loading="lazy" />
                    <div class="theater-chapter-meta">
                      <span class="theater-chapter-tag">${s.type === 'video' ? '🎬 Film' : escapeHtml(s.tag.split('•')[0].trim())}</span>
                      <span class="theater-chapter-name">${escapeHtml(s.title)}</span>
                    </div>
                  </button>
                `).join('')}
              </div>
            `
            : ''
        }
      `;
    }

    function updateSlideUI() {
      const progressBar = document.getElementById('theaterSlideProgressBar');
      const captionBox = document.getElementById('theaterStoryCaption');
      const stageBtn = document.getElementById('theaterStageDrawerBtn');
      const isMedia = backdropMode !== 'living';

      if (progressBar) progressBar.classList.toggle('is-hidden', !isMedia);
      if (captionBox) captionBox.classList.toggle('is-hidden', !isMedia);
      if (stageBtn) {
        const modeMeta = BACKDROP_MODES.find((m) => m.key === backdropMode);
        stageBtn.textContent = isMedia && modeMeta ? modeMeta.label.split(' ')[0] + ' Backdrop' : '🖼️ Backdrop';
        stageBtn.classList.toggle('active', stageDrawerOpen || isMedia);
      }

      if (!isMedia) return;
      const list = getActivePlaylist();
      if (!list.length) return;

      const slides = document.querySelectorAll('.cinema-theater-slide');
      slides.forEach((slide, idx) => {
        const active = idx === currentSlideIdx;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        const vid = slide.querySelector('video');
        if (vid) {
          if (active) {
            vid.play().catch(() => {});
          } else {
            vid.pause();
          }
        }
        if (active && !prefersReducedMotion) {
          const img = slide.querySelector('.theater-slide-img');
          if (img) {
            img.style.animation = 'none';
            void img.offsetWidth;
            img.style.animation = '';
          }
        }
      });

      const fill = document.getElementById('theaterSlideProgressFill');
      if (fill) {
        fill.style.width = `${((currentSlideIdx + 1) / list.length) * 100}%`;
      }

      const s = list[currentSlideIdx];
      const tagEl = document.getElementById('theaterCaptionTag');
      const titleEl = document.getElementById('theaterCaptionTitle');
      if (tagEl && s) tagEl.textContent = s.tag;
      if (titleEl && s) titleEl.textContent = s.title;

      if (stageDrawerOpen) renderStageDrawer();
    }

    function stopSlideTimer() {
      if (slideTimer) {
        clearInterval(slideTimer);
        slideTimer = null;
      }
    }

    function startSlideTimer() {
      stopSlideTimer();
      if (backdropMode === 'living' || !isSlideshowPlaying || prefersReducedMotion || !isTheater) return;
      const list = getActivePlaylist();
      if (!list.length) return;
      slideTimer = setInterval(() => {
        if (!isTheater || backdropMode === 'living') {
          stopSlideTimer();
          return;
        }
        const activeList = getActivePlaylist();
        if (!activeList.length) return;
        currentSlideIdx = (currentSlideIdx + 1) % activeList.length;
        updateSlideUI();
      }, SLIDE_INTERVAL_MS);
    }

    const SUPABASE_URL = 'https://xleadnehhbzjltykhtsn.supabase.co';
    const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_QbXx1RuAukuz7M-fgCXH7w_fBOj25wm';

    const ELEMENT_LORE = {
      fire: {
        badge: '🔥 FIRE • HEARTH WARMTH & COURAGE',
        kicker: 'Warmth Without Performance',
        quote: 'Come Warm Your Hands by the Fire.',
        intention: 'Courageous belonging & creative release',
        affirmation: 'You do not have to earn rest, warmth, or a seat by the fire.',
        colors: ['#FBBF24', '#F97316', '#FDE68A'],
        prompts: [
          'Where in your chest could use a little more warmth tonight?',
          'If you could lay down one heavy expectation before midnight, what is it?',
          'What song, poem, or truth has been waiting for a safe room to land in?'
        ]
      },
      water: {
        badge: '🌊 WATER • FLOW & EXHALE',
        kicker: 'Wash Away the Hurry',
        quote: 'Let Everything Rush Past Except This Breath.',
        intention: 'Unforced rhythm & emotional softness',
        affirmation: 'Even slow rivers reach the ocean without forcing a single wave.',
        colors: ['#38BDF8', '#7DD3FC', '#BAE6FD'],
        prompts: [
          'What rushing thought can you hand back to the creek tonight?',
          'Notice your jaw and shoulders—can they drop half an inch right now?',
          'What does unhurried peace feel like inside your ribs?'
        ]
      },
      earth: {
        badge: '🌿 EARTH • ROOTS & STILLNESS',
        kicker: 'Held by Living Ground',
        quote: 'Feel Your Feet Upon the Living Soil.',
        intention: 'Grounded safety & steady presence',
        affirmation: 'You are held right where you stand; nothing needs to be rushed.',
        colors: ['#4ADE80', '#86EFAC', '#FDE68A'],
        prompts: [
          'Notice three places where your body is supported by the chair or floor.',
          'What small quiet win from today deserves to be honored?',
          'Who in your community is an anchor stone you are grateful for?'
        ]
      },
      air: {
        badge: '🌬️ AIR • CLARITY & SPACE',
        kicker: 'Open Sky Inside You',
        quote: 'Make Room for a Weightless Peace.',
        intention: 'Mental spaciousness & gentle release',
        affirmation: 'You are allowed more sky than noise inside your own mind.',
        colors: ['#93C5FD', '#E0F2FE', '#FFFFFF'],
        prompts: [
          'Exhale a second slower than you inhaled—what opens up in your chest?',
          'Which headline or worry can gently wait until tomorrow morning?',
          'If calm had a color moving through the room right now, what shade is it?'
        ]
      },
      ether: {
        badge: '🌌 ETHER • STARLIGHT & MEMORY',
        kicker: 'The Sanctuary Within',
        quote: 'Pause. Breathe. Remember Who You Are.',
        intention: 'Awe, memory & shared humanity',
        affirmation: 'The sanctuary you spent years looking for is already breathing inside you.',
        colors: ['#C084FC', '#F8D98C', '#E9D5FF'],
        prompts: [
          'What quiet part of you still remembers how to create without fear?',
          'Imagine fifty neighbors breathing slowly together in one candlelit room.',
          'What memory brings you straight home to yourself in five seconds?'
        ]
      }
    };

    const MINI_REEL_CLIPS = [
      {
        type: 'video',
        chip: '🎬 Stone Hearth Loop',
        title: 'Nov 15 • Stone Hearth Celebration',
        desc: 'Candlelight, laughter, and unplugged instruments in our Orange County circle.',
        poster: 'images/openmic/openmic-nov15-stone-hearth-celebration.jpg',
        webm: 'images/openmic/openmic-nov15-stone-hearth-celebration.webm',
        mp4: 'images/openmic/openmic-nov15-stone-hearth-celebration.mp4'
      },
      {
        type: 'image',
        chip: '🏡 Community Family',
        title: 'Come As You Are, Together',
        desc: 'Artists, elders, and youth sharing substance-free warmth side by side.',
        src: 'images/openmic/community-sanctuary-family.jpg'
      },
      {
        type: 'image',
        chip: '🎸 Unplugged Stage',
        title: 'Acoustic Harmony Under String Lights',
        desc: 'Zero competition, zero pressure—just raw human voices witnessed with care.',
        src: 'images/openmic/openmic-nov15-acoustic-duo-harmony.jpg'
      },
      {
        type: 'image',
        chip: '🥁 Dusk Circle',
        title: 'Poolside Djembe & Rhythm Circle',
        desc: 'Drums, spoken word, and sunset breath across Orange County.',
        src: 'images/openmic/openmic-nov15-djembe-poolside-rhythm.jpg'
      },
      {
        type: 'image',
        chip: '📿 Anchor Keepsakes',
        title: 'Intention Woven by Hand',
        desc: 'Every attendee weaves an anchor-word gemstone bracelet to carry home.',
        src: 'images/video-frame-bead-weaver.jpg'
      }
    ];

    const BREATH_PHASES = [
      { key: 'inhale', label: 'Inhale', secs: 4, hint: 'Breathe in slowly through the nose' },
      { key: 'hold', label: 'Hold', secs: 4, hint: 'Rest softly at the top' },
      { key: 'exhale', label: 'Exhale', secs: 4, hint: 'Let shoulders fall as you release' },
      { key: 'hold', label: 'Settle', secs: 4, hint: 'Quiet stillness before the next wave' }
    ];

    const POPUP_META = {
      ritual: { title: '✨ Element Lore & Prompt', wide: false, defaultPos: { x: 18, y: 18 } },
      mixer: { title: '🌬️ Breath & Sound Studio', wide: false, defaultPos: { x: -18, y: 18 } },
      reel: { title: '🎬 Sanctuary Mini-Cinema', wide: true, defaultPos: { x: 18, y: -18 } },
      notes: { title: '🌻 Hearth Notes & Dec 10', wide: false, defaultPos: { x: -18, y: -18 } }
    };

    const escapeHtml = (str) =>
      String(str || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

    function getActiveElementKey() {
      return document.body.getAttribute('data-element') || currentEl || 'fire';
    }

    function wakeDockIdleTimer() {
      document.body.classList.remove('cinema-theater-idle');
      if (idleTimer) clearTimeout(idleTimer);
      if (!isTheater) return;
      idleTimer = setTimeout(() => {
        if (isTheater && !document.body.classList.contains('cinema-theater-typing')) {
          document.body.classList.add('cinema-theater-idle');
        }
      }, 4500);
    }

    function syncElementCopy() {
      const key = getActiveElementKey();
      currentEl = key;
      const lore = ELEMENT_LORE[key] || ELEMENT_LORE.fire;

      const hudText = document.getElementById('theaterHudElementText');
      if (hudText) hudText.textContent = lore.badge;

      const kickerEl = document.getElementById('theaterKickerText');
      const quoteEl = document.getElementById('theaterMainQuote');
      const subEl = document.getElementById('theaterSubQuote');
      if (kickerEl && !breathRunning) kickerEl.textContent = lore.kicker;
      if (quoteEl) quoteEl.textContent = lore.quote;
      if (subEl) subEl.textContent = `${lore.intention} • Choose Living Sky, Video, or Slides from Backdrop below.`;

      document.querySelectorAll('.theater-el-chip[data-theater-el]').forEach((btn) => {
        const match = btn.getAttribute('data-theater-el') === key;
        btn.classList.toggle('active', match);
        btn.setAttribute('aria-pressed', match ? 'true' : 'false');
      });

      const ritualWin = document.getElementById('theaterWin-ritual');
      if (ritualWin) renderPopupBody('ritual', ritualWin.querySelector('.theater-pop-body'));
    }

    function syncDockPopupButtons() {
      let hasAnyOpen = false;
      document.querySelectorAll('.theater-pop-trigger[data-theater-pop]').forEach((btn) => {
        const key = btn.getAttribute('data-theater-pop');
        const isOpen = !!document.getElementById(`theaterWin-${key}`);
        if (isOpen) hasAnyOpen = true;
        btn.classList.toggle('active', isOpen);
        btn.setAttribute('aria-pressed', isOpen ? 'true' : 'false');
      });
      document.body.classList.toggle('cinema-theater-has-popup', hasAnyOpen);
    }

    const syncTheaterUI = () => {
      document.body.classList.toggle('cinema-theater-mode', isTheater);
      document.body.classList.toggle('cinema-theater-stargaze', isTheater && isStargaze);
      const stage = document.getElementById('cinemaTheaterStage');
      if (stage) stage.setAttribute('aria-hidden', isTheater ? 'false' : 'true');

      const toggleBtn = document.getElementById('cinemaTheaterToggleBtn');
      if (toggleBtn) toggleBtn.setAttribute('aria-pressed', isTheater ? 'true' : 'false');

      const stargazeBtn = document.getElementById('theaterStargazeBtn');
      if (stargazeBtn) {
        stargazeBtn.classList.toggle('active', isStargaze);
        stargazeBtn.setAttribute('aria-pressed', isStargaze ? 'true' : 'false');
        stargazeBtn.textContent = isStargaze ? '👁️ Exit Stargaze' : '👁️ Stargaze';
      }

      const stargazeDockBtn = document.getElementById('theaterStargazeDockBtn');
      if (stargazeDockBtn) {
        stargazeDockBtn.classList.toggle('active', isStargaze);
        stargazeDockBtn.setAttribute('aria-pressed', isStargaze ? 'true' : 'false');
        stargazeDockBtn.textContent = isStargaze ? '👁️ Exit Stargaze' : '👁️ Stargaze';
      }

      const audioBtn = document.getElementById('theaterAudioBtn');
      if (audioBtn && window.soundscape) {
        audioBtn.classList.toggle('sound-active', !!window.soundscape.isPlaying);
      }

      const mixerSoundBtn = document.getElementById('theaterMixerSoundBtn');
      if (mixerSoundBtn && window.soundscape) {
        mixerSoundBtn.textContent = window.soundscape.isPlaying ? '🔊 Sound Playing (Pause)' : '🔈 Start Nature Soundscape';
        mixerSoundBtn.classList.toggle('active', !!window.soundscape.isPlaying);
      }

      const hudText = document.getElementById('theaterHudElementText');
      const activeKey = getActiveElementKey();
      const modeMeta = BACKDROP_MODES.find((m) => m.key === backdropMode);
      if (hudText) {
        const elLabel = (ELEMENT_LORE[activeKey] || ELEMENT_LORE.fire).badge.split('•')[0].trim();
        hudText.textContent = `${elLabel} • ${(modeMeta ? modeMeta.label.replace(/^[^A-Za-z]+/, '') : 'Living Sky').toUpperCase()}`;
      }

      syncElementCopy();
      syncDockPopupButtons();
      updateSlideUI();
    };

    // Ambient Element-Reactive Theater Particles
    function initParticles(canvas) {
      particles = [];
      const count = 42;
      const w = canvas.width || window.innerWidth;
      const h = canvas.height || window.innerHeight;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 1.2 + Math.random() * 2.8,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          phase: Math.random() * Math.PI * 2,
          colorIdx: i % 3
        });
      }
    }

    function startParticleLoop() {
      if (prefersReducedMotion || particleRaf) return;
      const canvas = document.getElementById('theaterAmbienceCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resize();
      if (!particles.length) initParticles(canvas);

      const handleResize = () => {
        if (!isTheater) return;
        if (Math.abs(canvas.width - window.innerWidth) > 2 || Math.abs(canvas.height - window.innerHeight) > 48) {
          resize();
        }
      };
      if (!canvas.dataset.resizeBound) {
        canvas.dataset.resizeBound = 'true';
        window.addEventListener('resize', handleResize, { passive: true });
      }

      const frame = () => {
        if (!isTheater) {
          particleRaf = null;
          return;
        }
        const key = getActiveElementKey();
        const lore = ELEMENT_LORE[key] || ELEMENT_LORE.fire;
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.phase += 0.02;

          if (key === 'fire') {
            p.y -= 0.48 + (i % 3) * 0.14;
            p.x += Math.sin(p.phase) * 0.35;
          } else if (key === 'water') {
            p.y -= 0.28;
            p.x += Math.sin(p.phase * 0.8) * 0.45;
          } else if (key === 'earth') {
            p.x += Math.cos(p.phase * 0.6) * 0.32;
            p.y += Math.sin(p.phase * 0.5) * 0.28;
          } else if (key === 'air') {
            p.x += 0.58 + (i % 2) * 0.25;
            p.y += Math.sin(p.phase) * 0.22;
          } else {
            p.x += Math.cos(p.phase * 0.3) * 0.12;
            p.y += Math.sin(p.phase * 0.3) * 0.12;
          }

          if (p.y < -12) p.y = h + 12;
          if (p.y > h + 12) p.y = -12;
          if (p.x < -12) p.x = w + 12;
          if (p.x > w + 12) p.x = -12;

          const alpha = 0.25 + (Math.sin(p.phase) + 1) * 0.28;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = lore.colors[p.colorIdx] || '#F5D77F';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        particleRaf = window.requestAnimationFrame(frame);
      };

      particleRaf = window.requestAnimationFrame(frame);
    }

    function stopParticleLoop() {
      if (particleRaf) {
        window.cancelAnimationFrame(particleRaf);
        particleRaf = null;
      }
    }

    // 432Hz Warm Singing Bowl Synthesizer (zero external audio required)
    window.sanctuaryCinema.playBowl = function () {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        if (!bowlCtx) bowlCtx = new Ctx();
        if (bowlCtx.state === 'suspended') bowlCtx.resume();

        const now = bowlCtx.currentTime;
        const master = bowlCtx.createGain();
        master.gain.setValueAtTime(0.0001, now);
        master.gain.linearRampToValueAtTime(0.22, now + 0.04);
        master.gain.exponentialRampToValueAtTime(0.0001, now + 4.4);
        master.connect(bowlCtx.destination);

        const partials = [
          { freq: 216, gain: 0.45, decay: 4.3 },
          { freq: 432, gain: 0.6, decay: 4.0 },
          { freq: 648, gain: 0.22, decay: 3.1 },
          { freq: 1084, gain: 0.08, decay: 2.1 }
        ];

        partials.forEach((p) => {
          const osc = bowlCtx.createOscillator();
          const g = bowlCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(p.freq, now);
          g.gain.setValueAtTime(p.gain, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + p.decay);
          osc.connect(g);
          g.connect(master);
          osc.start(now);
          osc.stop(now + p.decay + 0.05);
        });

        const btn = document.getElementById('theaterBowlBtn');
        if (btn) {
          btn.classList.add('active');
          setTimeout(() => btn.classList.remove('active'), 1600);
        }
      } catch (_) {}
    };

    // Box Breath Controller inside Mixer Pop-Up & Sacred Medallion
    function updateBreathWidgetUI() {
      const orb = document.getElementById('theaterBreathOrb');
      const title = document.getElementById('theaterBreathPhaseName');
      const hint = document.getElementById('theaterBreathPhaseHint');
      const btn = document.getElementById('theaterBreathToggleBtn');
      const dockBreathBtn = document.getElementById('theaterBreathDockBtn');
      const kickerEl = document.getElementById('theaterKickerText');
      const phase = BREATH_PHASES[breathStepIdx] || BREATH_PHASES[0];

      if (orb) {
        orb.setAttribute('data-phase', breathRunning ? phase.key : 'idle');
        orb.textContent = breathRunning ? `${breathTick}s` : '4·4·4·4';
      }
      if (title) {
        title.textContent = breathRunning ? `${phase.label} (${breathTick}s)` : 'Ready for 4-4-4-4 Breath';
      }
      if (hint) {
        hint.textContent = breathRunning ? phase.hint : 'Pace your inhale, hold, exhale & settle.';
      }
      if (btn) {
        btn.textContent = breathRunning ? '⏸ Pause Breath' : '▶ Start Breath';
        btn.classList.toggle('active', breathRunning);
      }
      if (dockBreathBtn) {
        dockBreathBtn.classList.toggle('active', breathRunning);
        dockBreathBtn.textContent = breathRunning ? `🌬️ ${phase.label} (${breathTick}s)` : '🌬️ Breath';
      }
      if (kickerEl) {
        if (breathRunning) {
          kickerEl.textContent = `✦ ${phase.label.toUpperCase()} (${breathTick}s) • ${phase.hint.toUpperCase()} ✦`;
        } else {
          const lore = ELEMENT_LORE[getActiveElementKey()] || ELEMENT_LORE.fire;
          kickerEl.textContent = lore.kicker;
        }
      }

      // Dynamic Medallion Halo Expansion
      const halos = document.querySelectorAll('.theater-breath-halo');
      halos.forEach((h) => {
        if (breathRunning) {
          if (phase.key === 'inhale' || phase.key === 'hold') {
            h.style.transform = 'scale(1.22)';
            h.style.opacity = '0.9';
          } else if (phase.key === 'exhale') {
            h.style.transform = 'scale(0.88)';
            h.style.opacity = '0.4';
          } else {
            h.style.transform = 'scale(1.0)';
            h.style.opacity = '0.6';
          }
        } else {
          h.style.transform = '';
          h.style.opacity = '';
        }
      });
    }

    function stopBreathTimer() {
      breathRunning = false;
      if (breathTimer) {
        clearInterval(breathTimer);
        breathTimer = null;
      }
      updateBreathWidgetUI();
    }

    window.sanctuaryCinema.toggleTheaterBreath = function () {
      if (breathRunning) {
        stopBreathTimer();
        return;
      }
      breathRunning = true;
      breathStepIdx = 0;
      breathTick = BREATH_PHASES[0].secs;
      if (window.soundscape && window.soundscape.isPlaying) {
        window.soundscape.syncBreath(BREATH_PHASES[0].key, BREATH_PHASES[0].secs);
      }
      updateBreathWidgetUI();

      breathTimer = setInterval(() => {
        breathTick -= 1;
        if (breathTick <= 0) {
          breathStepIdx = (breathStepIdx + 1) % BREATH_PHASES.length;
          const next = BREATH_PHASES[breathStepIdx];
          breathTick = next.secs;
          if (window.soundscape && window.soundscape.isPlaying) {
            window.soundscape.syncBreath(next.key, next.secs);
          }
        }
        updateBreathWidgetUI();
      }, 1000);
    };

    // Fetch latest 3 Gratitude notes from Supabase for Hearth & Notes pop-up
    async function loadRecentTheaterNotes() {
      const listEl = document.getElementById('theaterNotesRecentList');
      if (!listEl) return;
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/clubhouse_gratitude_posts?select=author_name,neighborhood,message,created_at&order=created_at.desc&limit=3`,
          {
            headers: {
              apikey: SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
            }
          }
        );
        if (!res.ok) throw new Error('Unable to load notes');
        cachedNotes = await res.json();
        renderRecentTheaterNotes();
      } catch (_) {
        if (listEl) {
          listEl.innerHTML = '<div class="theater-note-item">Community notes will appear live once online.</div>';
        }
      }
    }

    function renderRecentTheaterNotes() {
      const listEl = document.getElementById('theaterNotesRecentList');
      if (!listEl) return;
      if (!Array.isArray(cachedNotes) || !cachedNotes.length) {
        listEl.innerHTML = '<div class="theater-note-item">Be the first tonight to leave a gratitude spark.</div>';
        return;
      }
      listEl.innerHTML = cachedNotes
        .slice(0, 3)
        .map(
          (n) => `
          <div class="theater-note-item">
            <div class="theater-note-meta">${escapeHtml(n.author_name || 'Neighbor')} • ${escapeHtml(n.neighborhood || 'OC')}</div>
            <div>"${escapeHtml(n.message)}"</div>
          </div>`
        )
        .join('');
    }

    async function submitTheaterNote(e) {
      if (e && e.preventDefault) e.preventDefault();
      const nameIn = document.getElementById('theaterNoteName');
      const msgIn = document.getElementById('theaterNoteMsg');
      const statusEl = document.getElementById('theaterNoteStatus');
      const submitBtn = document.getElementById('theaterNoteSubmit');
      if (!msgIn) return;

      const message = msgIn.value.trim().slice(0, 260);
      if (message.length < 3) {
        if (statusEl) statusEl.textContent = 'Write at least a few words to share.';
        msgIn.focus();
        return;
      }
      const authorName = (nameIn && nameIn.value.trim().slice(0, 50)) || 'Theater Guest';
      if (submitBtn) submitBtn.disabled = true;
      if (statusEl) statusEl.textContent = 'Sending spark to Sanctuary Wall...';

      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/clubhouse_gratitude_posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            Prefer: 'return=representation'
          },
          body: JSON.stringify({
            author_name: authorName,
            neighborhood: 'Sanctuary Theater',
            category: 'gratitude',
            message: message,
            warmth_base: 1
          })
        });
        if (!res.ok) throw new Error('Could not save note right now');
        msgIn.value = '';
        if (statusEl) statusEl.textContent = '✓ Pinned live to the Gratitude Wall!';
        await loadRecentTheaterNotes();
        if (window.sanctuaryCommunitySync && typeof window.sanctuaryCommunitySync.refresh === 'function') {
          window.sanctuaryCommunitySync.refresh();
        }
      } catch (err) {
        if (statusEl) statusEl.textContent = `⚠️ ${err.message || 'Please try again.'}`;
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    }

    // Pop-Up Window Renderer
    function renderPopupBody(key, bodyEl) {
      if (!bodyEl) return;
      const elKey = getActiveElementKey();
      const lore = ELEMENT_LORE[elKey] || ELEMENT_LORE.fire;

      if (key === 'ritual') {
        const pIdx = (promptCursor[elKey] || 0) % lore.prompts.length;
        bodyEl.innerHTML = `
          <div class="theater-card-box">
            <div class="theater-card-label">${lore.badge}</div>
            <p style="margin:0;color:#CBD7D0;font-size:0.78rem;">${lore.intention}</p>
          </div>
          <div class="theater-card-box">
            <div class="theater-card-label">Somatic Check-In Prompt (${pIdx + 1}/${lore.prompts.length})</div>
            <p class="theater-prompt-text">${lore.prompts[pIdx]}</p>
          </div>
          <div class="theater-card-box">
            <div class="theater-card-label">Sanctuary Affirmation</div>
            <p class="theater-affirmation-quote">“${lore.affirmation}”</p>
          </div>
          <div class="theater-action-row">
            <button type="button" class="theater-mini-btn" onclick="window.sanctuaryCinema.nextTheaterPrompt()">✨ Next Prompt</button>
            <button type="button" class="theater-mini-btn" onclick="window.sanctuaryCinema.playBowl()">🔔 Chime Bowl</button>
          </div>
          <div class="theater-action-row">
            ${['fire', 'water', 'earth', 'air', 'ether']
              .map(
                (k) =>
                  `<button type="button" class="theater-mini-btn ${k === elKey ? 'active' : ''}" onclick="window.sanctuaryCinema.selectTheaterElement('${k}')">${ELEMENT_LORE[k].badge.split(' ')[0]} ${k.charAt(0).toUpperCase() + k.slice(1)}</button>`
              )
              .join('')}
          </div>
        `;
      } else if (key === 'mixer') {
        const currentVol = window.soundscape ? Math.round((window.soundscape.volume || 0.5) * 100) : 50;
        const soundPlaying = !!(window.soundscape && window.soundscape.isPlaying);
        bodyEl.innerHTML = `
          <div class="theater-breath-orb-stage">
            <div class="theater-breath-orb" id="theaterBreathOrb" data-phase="idle">4·4·4·4</div>
            <div style="flex:1;min-width:0;">
              <div id="theaterBreathPhaseName" style="font-weight:800;font-size:0.84rem;color:#FCE6A2;">Ready for 4-4-4-4 Breath</div>
              <div id="theaterBreathPhaseHint" style="font-size:0.74rem;color:#CBD7D0;margin:2px 0 8px;">Pace your inhale, hold, exhale &amp; settle.</div>
              <button type="button" id="theaterBreathToggleBtn" class="theater-mini-btn" onclick="window.sanctuaryCinema.toggleTheaterBreath()">▶ Start Breath</button>
            </div>
          </div>
          <div class="theater-card-box">
            <div class="theater-card-label">Ambient Soundscape Mixer</div>
            <div class="theater-action-row" style="margin-bottom:8px;">
              <button type="button" id="theaterMixerSoundBtn" class="theater-mini-btn ${soundPlaying ? 'active' : ''}" onclick="window.sanctuaryCinema.theaterToggleSound()">${soundPlaying ? '🔊 Sound Playing (Pause)' : '🔈 Start Nature Soundscape'}</button>
            </div>
            <label for="theaterVolumeRange" style="display:flex;justify-content:space-between;font-size:0.72rem;color:#CBD7D0;margin-bottom:4px;">
              <span>Nature Volume</span><span id="theaterVolReadout">${currentVol}%</span>
            </label>
            <input id="theaterVolumeRange" class="theater-slider" type="range" min="0" max="100" value="${currentVol}" />
          </div>
          <div class="theater-action-row">
            <button type="button" class="theater-mini-btn" onclick="window.sanctuaryCinema.toggleVoiceGrounding()">🎙️ 20s Voice Grounding</button>
            <button type="button" class="theater-mini-btn" onclick="window.sanctuaryCinema.playBowl()">🔔 432Hz Bowl</button>
            <button type="button" class="theater-mini-btn theater-mini-btn--green" id="theaterSpotifyEmbedBtn" onclick="window.sanctuaryCinema.toggleTheaterSpotify()">🎧 ${showTheaterSpotify ? 'Hide Spotify' : 'Spotify 432Hz'}</button>
          </div>
          ${
            showTheaterSpotify
              ? `<iframe title="Sanctuary 432Hz Spotify Mini Player" style="border-radius:12px;width:100%;height:80px;border:0;" src="https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`
              : ''
          }
        `;
        const slider = bodyEl.querySelector('#theaterVolumeRange');
        const readout = bodyEl.querySelector('#theaterVolReadout');
        if (slider) {
          slider.addEventListener('input', (ev) => {
            const pct = Number(ev.target.value);
            if (readout) readout.textContent = `${pct}%`;
            if (window.soundscape && typeof window.soundscape.setVolume === 'function') {
              window.soundscape.setVolume(pct / 100);
            }
            const mainSlider = document.getElementById('soundscape-volume');
            if (mainSlider) mainSlider.value = String(pct);
          });
        }
        updateBreathWidgetUI();
      } else if (key === 'reel') {
        const clip = MINI_REEL_CLIPS[miniReelIdx % MINI_REEL_CLIPS.length];
        bodyEl.innerHTML = `
          <div class="theater-reel-media-box">
            ${
              clip.type === 'video'
                ? `<video autoplay muted loop playsinline poster="${clip.poster}"><source src="${clip.webm}" type="video/webm" /><source src="${clip.mp4}" type="video/mp4" /></video>`
                : `<img src="${clip.src}" alt="${clip.title}" />`
            }
            <span class="theater-reel-chip">${clip.chip} (${(miniReelIdx % MINI_REEL_CLIPS.length) + 1}/${MINI_REEL_CLIPS.length})</span>
          </div>
          <div>
            <div style="font-family:'Cinzel',serif;font-size:0.96rem;color:#FFFDF7;font-weight:700;">${clip.title}</div>
            <p style="margin:3px 0 0;font-size:0.78rem;color:#CBD7D0;">${clip.desc}</p>
          </div>
          <div class="theater-action-row" style="justify-content:space-between;">
            <div class="theater-action-row">
              <button type="button" class="theater-mini-btn" onclick="window.sanctuaryCinema.stepMiniReel(-1)">‹ Prev</button>
              <button type="button" class="theater-mini-btn" onclick="window.sanctuaryCinema.stepMiniReel(1)">Next ›</button>
            </div>
            <button type="button" class="theater-mini-btn" onclick="window.sanctuaryCinema.openInviteFlyer && window.sanctuaryCinema.openInviteFlyer()">🎨 Dec 10 Flyer</button>
          </div>
        `;
      } else if (key === 'notes') {
        bodyEl.innerHTML = `
          <div class="theater-subtabs" role="tablist">
            <button type="button" class="theater-subtab-btn ${notesTab === 'note' ? 'active' : ''}" onclick="window.sanctuaryCinema.setTheaterNotesTab('note')">🌻 Gratitude Notes</button>
            <button type="button" class="theater-subtab-btn ${notesTab === 'dec10' ? 'active' : ''}" onclick="window.sanctuaryCinema.setTheaterNotesTab('dec10')">🎶 Dec 10 Jam Night</button>
          </div>
          ${
            notesTab === 'note'
              ? `
                <form id="theaterQuickNoteForm" style="display:flex;flex-direction:column;gap:7px;">
                  <input id="theaterNoteName" class="theater-input" type="text" maxlength="50" placeholder="Your first name or nickname (optional)" />
                  <textarea id="theaterNoteMsg" class="theater-textarea" rows="2" maxlength="260" placeholder="Drop a gentle wish or gratitude spark for the wall..."></textarea>
                  <div class="theater-action-row" style="justify-content:space-between;">
                    <span id="theaterNoteStatus" style="font-size:0.72rem;color:#86EFAC;"></span>
                    <button type="submit" id="theaterNoteSubmit" class="theater-mini-btn theater-mini-btn--green">✨ Pin Live Note</button>
                  </div>
                </form>
                <div class="theater-card-label" style="margin-top:2px;">Latest Live Wall Sparks</div>
                <div id="theaterNotesRecentList" style="display:flex;flex-direction:column;gap:6px;">
                  <div class="theater-note-item">Loading recent sanctuary notes...</div>
                </div>
              `
              : `
                <div class="theater-card-box">
                  <div class="theater-card-label">Next Gathering • Orange County</div>
                  <div style="font-family:'Cinzel',serif;font-size:0.96rem;color:#FFFDF7;font-weight:700;margin-bottom:4px;">Jam Session: The Unplugged Playground</div>
                  <div style="font-size:0.78rem;color:#CBD7D0;">📅 Thu, Dec 10, 2026 • 6:00 – 8:00 PM PST</div>
                  <div style="font-size:0.78rem;color:#86EFAC;margin-top:3px;">📍 1501 W Alton Ave, Santa Ana, CA</div>
                  <div style="font-size:0.74rem;color:#F8D98C;margin-top:4px;">100% Free Admission • Substance-Free • All Welcome</div>
                </div>
                <div class="theater-action-row">
                  <a href="https://www.meetup.com/socal-creatives-collective/events/317462800/" target="_blank" rel="noopener noreferrer" class="theater-mini-btn theater-mini-btn--green">🎟️ RSVP on Meetup ↗</a>
                  <button type="button" class="theater-mini-btn" onclick="window.sanctuaryCinema.openInviteFlyer && window.sanctuaryCinema.openInviteFlyer()">🎨 Bring-a-Friend Flyer</button>
                  <button type="button" class="theater-mini-btn" onclick="if(typeof openZeffyModal==='function') openZeffyModal(event)">🌱 $1 Community Seed</button>
                </div>
              `
          }
          <div class="theater-action-row" style="padding-top:6px;border-top:1px solid rgba(245,215,127,0.18);">
            <button type="button" class="theater-mini-btn" onclick="window.sanctuaryEcho && window.sanctuaryEcho.open('chat')">✨ Chat with Echo</button>
            <button type="button" class="theater-mini-btn" onclick="if(window.sanctuaryPauseBooth){window.sanctuaryPauseBooth.open();}else if(typeof openPauseModal==='function'){openPauseModal(event);}">🍃 60s Pause Booth</button>
          </div>
        `;
        if (notesTab === 'note') {
          const form = bodyEl.querySelector('#theaterQuickNoteForm');
          if (form) form.addEventListener('submit', submitTheaterNote);
          if (cachedNotes.length) renderRecentTheaterNotes();
          else loadRecentTheaterNotes();
        }
      }
    }

    function attachWindowDragging(win) {
      const header = win.querySelector('.theater-pop-header');
      if (!header) return;
      let startX = 0;
      let startY = 0;
      let baseLeft = 0;
      let baseTop = 0;
      let dragging = false;

      header.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button')) return;
        if (window.innerWidth <= 768) return;
        const stage = document.getElementById('theaterPopupStage');
        if (!stage) return;

        dragging = true;
        zCounter += 1;
        win.style.zIndex = String(zCounter);

        const stageRect = stage.getBoundingClientRect();
        const winRect = win.getBoundingClientRect();
        baseLeft = winRect.left - stageRect.left;
        baseTop = winRect.top - stageRect.top;
        win.style.left = `${baseLeft}px`;
        win.style.top = `${baseTop}px`;
        win.style.right = 'auto';
        win.style.bottom = 'auto';

        startX = e.clientX;
        startY = e.clientY;
        header.setPointerCapture(e.pointerId);
      });

      header.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const stage = document.getElementById('theaterPopupStage');
        if (!stage) return;
        const stageRect = stage.getBoundingClientRect();
        const maxLeft = Math.max(0, stageRect.width - win.offsetWidth);
        const maxTop = Math.max(0, stageRect.height - win.offsetHeight);
        const nextLeft = Math.min(maxLeft, Math.max(0, baseLeft + (e.clientX - startX)));
        const nextTop = Math.min(maxTop, Math.max(0, baseTop + (e.clientY - startY)));
        win.style.left = `${nextLeft}px`;
        win.style.top = `${nextTop}px`;
      });

      const endDrag = (e) => {
        if (!dragging) return;
        dragging = false;
        try {
          header.releasePointerCapture(e.pointerId);
        } catch (_) {}
      };
      header.addEventListener('pointerup', endDrag);
      header.addEventListener('pointercancel', endDrag);
    }

    function openTheaterPopup(key, forceOpen) {
      const stage = document.getElementById('theaterPopupStage');
      const meta = POPUP_META[key];
      if (!stage || !meta) return;

      if (isStargaze) {
        isStargaze = false;
        syncTheaterUI();
      }

      const existing = document.getElementById(`theaterWin-${key}`);
      if (existing) {
        if (forceOpen === true) {
          zCounter += 1;
          existing.style.zIndex = String(zCounter);
          existing.classList.remove('is-minimized');
          return;
        }
        existing.remove();
        syncDockPopupButtons();
        return;
      }

      if (forceOpen === false) return;

      const win = document.createElement('section');
      win.id = `theaterWin-${key}`;
      win.className = `theater-pop-window${meta.wide ? ' is-wide' : ''}`;
      win.setAttribute('aria-label', meta.title);
      zCounter += 1;
      win.style.zIndex = String(zCounter);

      // Position cleanly per corner on desktop
      if (meta.defaultPos.x >= 0) win.style.left = `${meta.defaultPos.x}px`;
      else win.style.right = `${Math.abs(meta.defaultPos.x)}px`;
      if (meta.defaultPos.y >= 0) win.style.top = `${meta.defaultPos.y}px`;
      else win.style.bottom = `${Math.abs(meta.defaultPos.y)}px`;

      win.innerHTML = `
        <header class="theater-pop-header">
          <div class="theater-pop-title-group">
            <span class="theater-pop-badge">${meta.title}</span>
          </div>
          <div class="theater-pop-win-btns">
            <button type="button" class="theater-win-btn" data-win-min aria-label="Minimize window" title="Minimize">―</button>
            <button type="button" class="theater-win-btn theater-win-btn--close" data-win-close aria-label="Close window" title="Close">✕</button>
          </div>
        </header>
        <div class="theater-pop-body"></div>
      `;

      win.addEventListener('pointerdown', () => {
        zCounter += 1;
        win.style.zIndex = String(zCounter);
      });

      win.querySelector('[data-win-min]').addEventListener('click', () => {
        win.classList.toggle('is-minimized');
      });
      win.querySelector('[data-win-close]').addEventListener('click', () => {
        win.remove();
        if (key === 'mixer') stopBreathTimer();
        syncDockPopupButtons();
      });

      renderPopupBody(key, win.querySelector('.theater-pop-body'));
      attachWindowDragging(win);
      stage.appendChild(win);
      syncDockPopupButtons();
    }

    window.sanctuaryCinema.toggleTheaterPopup = function (key, forceOpen) {
      openTheaterPopup(key, forceOpen);
    };

    window.sanctuaryCinema.selectTheaterElement = function (elKey) {
      if (window.switchElementTheme) window.switchElementTheme(elKey, true);
      syncElementCopy();
    };

    window.sanctuaryCinema.nextTheaterPrompt = function () {
      const elKey = getActiveElementKey();
      promptCursor[elKey] = ((promptCursor[elKey] || 0) + 1) % ELEMENT_LORE[elKey].prompts.length;
      const win = document.getElementById('theaterWin-ritual');
      if (win) renderPopupBody('ritual', win.querySelector('.theater-pop-body'));
    };

    window.sanctuaryCinema.stepMiniReel = function (delta) {
      miniReelIdx = (miniReelIdx + delta + MINI_REEL_CLIPS.length) % MINI_REEL_CLIPS.length;
      const win = document.getElementById('theaterWin-reel');
      if (win) renderPopupBody('reel', win.querySelector('.theater-pop-body'));
    };

    window.sanctuaryCinema.setTheaterNotesTab = function (tab) {
      notesTab = tab;
      const win = document.getElementById('theaterWin-notes');
      if (win) renderPopupBody('notes', win.querySelector('.theater-pop-body'));
    };

    window.sanctuaryCinema.toggleTheaterSpotify = function () {
      showTheaterSpotify = !showTheaterSpotify;
      const win = document.getElementById('theaterWin-mixer');
      if (win) renderPopupBody('mixer', win.querySelector('.theater-pop-body'));
    };

    window.sanctuaryCinema.toggleStargaze = function (force) {
      isStargaze = typeof force === 'boolean' ? force : !isStargaze;
      syncTheaterUI();
    };

    window.sanctuaryCinema.toggleTheater = function (forceState) {
      isTheater = typeof forceState === 'boolean' ? forceState : !isTheater;
      const isMobileViewport = window.innerWidth <= 768;
      if (!isTheater) {
        isStargaze = false;
        stopBreathTimer();
        stopParticleLoop();
        stopSlideTimer();
        if (window.sanctuaryCinema.toggleStageDrawer) window.sanctuaryCinema.toggleStageDrawer(false);
        document.body.classList.remove('cinema-theater-idle', 'cinema-theater-typing', 'cinema-theater-has-popup', 'cinema-theater-stage-drawer-open');
      } else {
        mountTheaterSlides();
        startParticleLoop();
        startSlideTimer();
        wakeDockIdleTimer();
      }

      syncTheaterUI();

      if (isTheater && window.soundscape && !window.soundscape.isPlaying) {
        try {
          window.soundscape.start();
          setTimeout(syncTheaterUI, 90);
        } catch (_) {}
      }

      if (!isMobileViewport && isTheater && document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (!isTheater && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };

    window.sanctuaryCinema.setBackdropMode = function (mode) {
      if (!['living', 'video', 'slideshow', 'nature'].includes(mode)) return;
      backdropMode = mode;
      currentSlideIdx = 0;
      mountTheaterSlides(true);
      if (mode === 'living') {
        stopSlideTimer();
      } else {
        startSlideTimer();
      }
      syncTheaterUI();
      wakeDockIdleTimer();
    };

    window.sanctuaryCinema.stepSlide = function (delta) {
      const list = getActivePlaylist();
      if (!list.length) return;
      currentSlideIdx = (currentSlideIdx + delta + list.length) % list.length;
      updateSlideUI();
      if (isSlideshowPlaying) startSlideTimer();
      wakeDockIdleTimer();
    };

    window.sanctuaryCinema.selectSlide = function (idx) {
      const list = getActivePlaylist();
      if (!list.length) return;
      currentSlideIdx = ((idx % list.length) + list.length) % list.length;
      updateSlideUI();
      if (isSlideshowPlaying) startSlideTimer();
      wakeDockIdleTimer();
    };

    window.sanctuaryCinema.toggleAutoPlaySlides = function (force) {
      isSlideshowPlaying = typeof force === 'boolean' ? force : !isSlideshowPlaying;
      if (isSlideshowPlaying) {
        startSlideTimer();
      } else {
        stopSlideTimer();
      }
      updateSlideUI();
      wakeDockIdleTimer();
    };

    window.sanctuaryCinema.toggleStageDrawer = function (force) {
      stageDrawerOpen = typeof force === 'boolean' ? force : !stageDrawerOpen;
      document.body.classList.toggle('cinema-theater-stage-drawer-open', isTheater && stageDrawerOpen);
      if (stageDrawerOpen) renderStageDrawer();
      const drawer = document.getElementById('theaterStageDrawer');
      const trigger = document.getElementById('theaterStageDrawerBtn');
      if (drawer) {
        drawer.style.display = stageDrawerOpen ? 'flex' : 'none';
        drawer.setAttribute('aria-hidden', stageDrawerOpen ? 'false' : 'true');
      }
      if (trigger) {
        trigger.classList.toggle('active', stageDrawerOpen || backdropMode !== 'living');
        trigger.setAttribute('aria-pressed', stageDrawerOpen ? 'true' : 'false');
      }
      wakeDockIdleTimer();
    };

    window.sanctuaryCinema.toggleChaptersDrawer = window.sanctuaryCinema.toggleStageDrawer;

    window.sanctuaryCinema.theaterToggleSound = function () {
      if (window.soundscape) {
        window.soundscape.toggle();
        syncTheaterUI();
      }
    };

    // Track pointer activity & input focus inside Theater stage
    const stageEl = document.getElementById('cinemaTheaterStage');
    if (stageEl) {
      stageEl.addEventListener('pointermove', wakeDockIdleTimer, { passive: true });
      stageEl.addEventListener('pointerdown', wakeDockIdleTimer, { passive: true });
      stageEl.addEventListener('focusin', (e) => {
        if (/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '')) {
          document.body.classList.add('cinema-theater-typing');
        }
      });
      stageEl.addEventListener('focusout', (e) => {
        if (/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '')) {
          document.body.classList.remove('cinema-theater-typing');
          wakeDockIdleTimer();
        }
      });

      // Mobile touch swipe to transition photos
      let touchStartX = 0;
      let touchStartY = 0;
      stageEl.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      stageEl.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          const deltaY = e.changedTouches[0].clientY - touchStartY;
          if (Math.abs(deltaX) > 44 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
            if (e.target && e.target.closest && e.target.closest('#cinemaTheaterDock, .theater-pop-window, #theaterStageDrawer')) {
              return;
            }
            if (deltaX < 0) {
              window.sanctuaryCinema.stepSlide(1);
            } else {
              window.sanctuaryCinema.stepSlide(-1);
            }
          }
        }
      }, { passive: true });
    }

    // Keep Theater synced if visitor switches Element outside Theater or via voice
    const observer = new MutationObserver(() => {
      if (isTheater) syncElementCopy();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-element'] });

    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag) || (e.target && e.target.isContentEditable)) return;

      if (e.key === 'Escape' && isTheater) {
        if (stageDrawerOpen) {
          window.sanctuaryCinema.toggleStageDrawer(false);
          return;
        }
        window.sanctuaryCinema.toggleTheater(false);
      } else if ((e.key === 'f' || e.key === 'F') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (document.getElementById('cinemaTheaterStage')) {
          window.sanctuaryCinema.toggleTheater();
        }
      } else if (isTheater && backdropMode !== 'living') {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          window.sanctuaryCinema.stepSlide(1);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          window.sanctuaryCinema.stepSlide(-1);
        } else if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          window.sanctuaryCinema.toggleAutoPlaySlides();
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
