/**
 * Inner Sanctuary Wellness Foundation
 * Zero-Cookie Engagement Telemetry & Adaptive Visitor Lens Controller
 *
 * Phase 1: Privacy-preserving IntersectionObserver section dwell & CTA tracking (zero PII).
 * Phase 2: Adaptive Visitor Lens (?lens=funder | ?lens=neighbor | default) via CSS order.
 */
(function () {
  'use strict';

  const TELEMETRY_KEY = 'sanctuary_engagement_v1';
  const LENS_STORAGE_KEY = 'sanctuary_visitor_lens_v1';
  const VALID_LENSES = ['default', 'funder', 'neighbor'];

  const sectionEnteredAt = new Map();
  let currentLens = 'default';

  function loadTelemetry() {
    try {
      const parsed = JSON.parse(localStorage.getItem(TELEMETRY_KEY) || '{}');
      return {
        sections: parsed.sections || {},
        ctas: parsed.ctas || {},
        lensSelections: parsed.lensSelections || {},
        updatedAt: parsed.updatedAt || null
      };
    } catch (_) {
      return { sections: {}, ctas: {}, lensSelections: {}, updatedAt: null };
    }
  }

  function saveTelemetry(state) {
    try {
      state.updatedAt = new Date().toISOString();
      localStorage.setItem(TELEMETRY_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  function recordSectionDwell(sectionId, dwellMs) {
    if (!sectionId || dwellMs < 800) return;
    const state = loadTelemetry();
    if (!state.sections[sectionId]) {
      state.sections[sectionId] = { views: 0, totalDwellMs: 0, lastLens: currentLens };
    }
    state.sections[sectionId].views += 1;
    state.sections[sectionId].totalDwellMs += Math.round(dwellMs);
    state.sections[sectionId].lastLens = currentLens;
    saveTelemetry(state);

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'section_dwell', {
        section_id: sectionId,
        dwell_ms: Math.round(dwellMs),
        visitor_lens: currentLens
      });
    }
  }

  function recordCtaInteraction(ctaKey) {
    if (!ctaKey) return;
    const state = loadTelemetry();
    state.ctas[ctaKey] = (state.ctas[ctaKey] || 0) + 1;
    saveTelemetry(state);

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'sanctuary_cta_click', {
        cta_key: ctaKey,
        visitor_lens: currentLens
      });
    }
  }

  function flushVisibleSections() {
    const now = performance.now();
    sectionEnteredAt.forEach((startedAt, sectionId) => {
      recordSectionDwell(sectionId, now - startedAt);
    });
    sectionEnteredAt.clear();
  }

  function initScrollDwellObserver() {
    if (!('IntersectionObserver' in window)) return;
    const observedSections = document.querySelectorAll('main section[id], main section.trust-ribbon');
    if (!observedSections.length) return;

    const observer = new IntersectionObserver((entries) => {
      const now = performance.now();
      entries.forEach((entry) => {
        const sec = entry.target;
        const id = sec.id || (sec.classList.contains('trust-ribbon') ? 'trust-ribbon' : '');
        if (!id) return;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          if (!sectionEnteredAt.has(id)) {
            sectionEnteredAt.set(id, now);
          }
        } else if (sectionEnteredAt.has(id)) {
          const dwellMs = now - sectionEnteredAt.get(id);
          sectionEnteredAt.delete(id);
          recordSectionDwell(id, dwellMs);
        }
      });
    }, { threshold: [0.35, 0.55] });

    observedSections.forEach((sec) => observer.observe(sec));

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushVisibleSections();
      }
    });
    window.addEventListener('pagehide', flushVisibleSections);
  }

  function initCtaDelegation() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (!target) return;

      let ctaKey = target.getAttribute('data-track-cta');
      if (!ctaKey) {
        if (target.closest('#funderQuickViewBar')) {
          ctaKey = 'funder_quick_view:' + (target.textContent || '').trim().slice(0, 32);
        } else if (target.closest('#sanctuarySubnavBar')) {
          ctaKey = 'subnav:' + (target.getAttribute('href') || 'link');
        } else if (target.closest('#grantImpactSimulator') && target.classList.contains('sim-tier-pill')) {
          ctaKey = 'grant_sim_tier:' + (target.getAttribute('data-grant-amount') || 'custom');
        } else if (target.classList.contains('moment-filter-btn')) {
          ctaKey = 'coverflow_filter:' + (target.getAttribute('data-moment-filter') || 'all');
        } else if (target.classList.contains('btn-open-wheel-modal')) {
          ctaKey = 'open_coverflow_lightbox';
        }
      }

      if (ctaKey) {
        recordCtaInteraction(ctaKey);
      }
    });
  }

  function setLens(lens, options) {
    const opts = options || {};
    const nextLens = VALID_LENSES.includes(lens) ? lens : 'default';
    currentLens = nextLens;

    document.body.classList.remove('lens-funder', 'lens-neighbor');
    if (nextLens === 'funder') {
      document.body.classList.add('lens-funder');
    } else if (nextLens === 'neighbor') {
      document.body.classList.add('lens-neighbor');
    }

    document.querySelectorAll('.lens-switch-btn').forEach((btn) => {
      const isSelected = btn.getAttribute('data-lens') === nextLens;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    const elevatedBadge = document.getElementById('funderElevatedNotice');
    if (elevatedBadge) {
      elevatedBadge.hidden = nextLens !== 'funder';
    }

    const neighborNotice = document.getElementById('neighborElevatedNotice');
    if (neighborNotice) {
      neighborNotice.hidden = nextLens !== 'neighbor';
    }

    const liveNote = document.getElementById('lensStatusReadout');
    if (liveNote) {
      if (nextLens === 'funder') {
        liveNote.textContent = 'Grantmaker Priority Active — Fiduciary Dossier, Sponsorship & Grant Calculator moved straight below the 3D Gallery';
      } else if (nextLens === 'neighbor') {
        liveNote.textContent = 'Neighbor Priority Active — Open Mic Schedule & Dec 10 Countdown moved straight below the 3D Gallery';
      } else {
        liveNote.textContent = 'Full Journey View — Mission, Gatherings & Partnerships in story order';
      }
    }

    if (opts.persist !== false) {
      try {
        localStorage.setItem(LENS_STORAGE_KEY, nextLens);
      } catch (_) {}
      const state = loadTelemetry();
      state.lensSelections[nextLens] = (state.lensSelections[nextLens] || 0) + 1;
      saveTelemetry(state);
    }

    if (opts.scrollToFocus && nextLens === 'funder') {
      const target = document.getElementById('sponsorship');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (opts.scrollToFocus && nextLens === 'neighbor') {
      const target = document.getElementById('open-mic');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function resolveInitialLens() {
    const params = new URLSearchParams(window.location.search);
    const paramLens = (params.get('lens') || '').toLowerCase();
    if (VALID_LENSES.includes(paramLens)) return paramLens;
    if (params.get('funder') === '1') return 'funder';

    try {
      const saved = localStorage.getItem(LENS_STORAGE_KEY);
      if (VALID_LENSES.includes(saved)) return saved;
    } catch (_) {}

    return 'default';
  }

  window.sanctuaryTelemetry = {
    getSummary: loadTelemetry,
    recordCta: recordCtaInteraction,
    flush: flushVisibleSections
  };

  window.sanctuaryLens = {
    set: function (lens, persist, scrollToFocus) {
      setLens(lens, { persist: persist !== false, scrollToFocus: Boolean(scrollToFocus) });
    },
    get: function () {
      return currentLens;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const initialLens = resolveInitialLens();
    setLens(initialLens, { persist: false, scrollToFocus: false });
    initScrollDwellObserver();
    initCtaDelegation();
  });
})();
