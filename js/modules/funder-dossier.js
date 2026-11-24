/**
 * Inner Sanctuary Wellness Foundation — Institutional Funder & Grantmaker Dossier
 * Direct, dignified gateway for foundation program officers, CRA bank evaluators, and corporate partners.
 */
(function() {
  'use strict';

  let activeTab = 'summary';

  window.openFunderModal = function(e, tabName) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const modal = document.getElementById('funderDossierModal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (tabName) {
      window.switchFunderTab(tabName);
    }
  };

  window.openFunderDossierModal = window.openFunderModal;

  window.copyFunderEIN = function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    window.copyFunderText('39-3757168', 'EIN (39-3757168)');
  };

  window.closeFunderModal = function() {
    const modal = document.getElementById('funderDossierModal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  window.switchFunderTab = function(tabName) {
    activeTab = tabName;
    const tabs = ['summary', 'leadership', 'outcomes', 'theory'];
    tabs.forEach(t => {
      const btn = document.getElementById('tabBtnFunder' + t.charAt(0).toUpperCase() + t.slice(1));
      const pane = document.getElementById('tabPaneFunder' + t.charAt(0).toUpperCase() + t.slice(1));
      if (btn) btn.classList.toggle('active', t === tabName);
      if (pane) {
        pane.style.display = t === tabName ? 'block' : 'none';
        pane.classList.toggle('active', t === tabName);
      }
    });
  };

  window.copyFunderText = function(text, label) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showFunderToast(`✓ Copied ${label} to clipboard!`);
      }).catch(() => {
        fallbackCopy(text, label);
      });
    } else {
      fallbackCopy(text, label);
    }
  };

  function fallbackCopy(text, label) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showFunderToast(`✓ Copied ${label} to clipboard!`);
    } catch (e) {
      showFunderToast(`Failed to copy: ${text}`);
    }
    document.body.removeChild(ta);
  }

  function showFunderToast(msg) {
    let toast = document.getElementById('funderToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'funderToast';
      toast.className = 'funder-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 3000);
  }

  window.downloadFunderDossier = function() {
    window.print();
  };

  // =========================================================================
  // GRANTMAKER IMPACT SIMULATOR ("WHAT YOUR GRANT FUNDS")
  // Conservative illustrative ranges with mutually exclusive budget slices
  // (never double-counted & non-binding prior to joint grant agreement)
  // =========================================================================
  let currentSimulatedGrantAmount = 5000;
  let currentSimulatorFocus = 'balanced';

  const SIM_FOCUS_WEIGHTS = {
    balanced: {
      label: 'Balanced Care Mix',
      gatherShare: 0.50,
      artistShare: 0.30,
      pauseShare: 0.20
    },
    stage: {
      label: 'Open Mic & Jam Stage Priority',
      gatherShare: 0.60,
      artistShare: 0.35,
      pauseShare: 0.05
    },
    pause: {
      label: 'Mobile Pause Activation Priority',
      gatherShare: 0.15,
      artistShare: 0.25,
      pauseShare: 0.60
    }
  };

  window.setGrantSimulatorFocus = function(focusKey) {
    if (!SIM_FOCUS_WEIGHTS[focusKey]) return;
    currentSimulatorFocus = focusKey;
    document.querySelectorAll('.sim-focus-pill').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-sim-focus') === focusKey);
    });
    window.updateGrantImpactSimulator(currentSimulatedGrantAmount);
  };

  window.updateGrantImpactSimulator = function(rawAmount) {
    const amount = Math.min(25000, Math.max(500, Number(rawAmount) || 5000));
    currentSimulatedGrantAmount = amount;
    const weights = SIM_FOCUS_WEIGHTS[currentSimulatorFocus] || SIM_FOCUS_WEIGHTS.balanced;

    // Conservative 85% direct program slice / 15% insurance, audit & admin buffer
    const directBudget = amount * 0.85;
    const gatherBudget = directBudget * weights.gatherShare;
    const artistBudget = directBudget * weights.artistShare;
    const pauseBudget = directBudget * weights.pauseShare;

    // Conservative min-max ranges so we never over-promise fixed quotas
    const seatMin = Math.max(12, Math.floor(directBudget / 32));
    const seatMax = Math.max(seatMin + 5, Math.ceil(directBudget / 23));

    const gatherMin = Math.max(1, Math.floor(gatherBudget / 1100));
    const gatherMax = Math.max(gatherMin, Math.round(gatherBudget / 720));

    const stipendMin = Math.max(1, Math.floor(artistBudget / 150));
    const stipendMax = Math.max(stipendMin, Math.round(artistBudget / 100));

    const kitMin = pauseBudget < 200 ? 0 : Math.max(1, Math.floor(pauseBudget / 450));
    const kitMax = pauseBudget < 200 ? 1 : Math.max(kitMin, Math.round(pauseBudget / 280));

    const fmt = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });

    const formatRange = (lo, hi) => (lo === hi ? `~${lo}` : `~${lo}–${hi}`);

    const setEl = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setEl('simGrantAmountVal', fmt.format(amount));
    setEl('simNeighborsVal', `~${seatMin}–${seatMax}`);
    setEl('simGatheringsVal', formatRange(gatherMin, gatherMax));
    setEl('simStipendsVal', formatRange(stipendMin, stipendMax));
    setEl('simPauseKitsVal', kitMin === 0 ? 'Optional' : formatRange(kitMin, kitMax));
    setEl('simGatherSub', `${Math.round(weights.gatherShare * 100)}% slice (${fmt.format(Math.round(gatherBudget))}) • venue & tea`);
    setEl('simStipendSub', `${Math.round(weights.artistShare * 100)}% slice (${fmt.format(Math.round(artistBudget))}) • artist honorariums`);
    setEl('simPauseSub', `${Math.round(weights.pauseShare * 100)}% slice (${fmt.format(Math.round(pauseBudget))}) • mobile booth supplies`);
    setEl('simDirectDollarsText', `${fmt.format(Math.round(directBudget))} Est. Direct Programs (85% Slice)`);
    setEl('simAdminDollarsText', `${fmt.format(Math.round(amount - directBudget))} Insurance, Compliance & Admin Buffer (15%)`);

    const slider = document.getElementById('grantImpactSlider');
    if (slider && Number(slider.value) !== amount) {
      slider.value = String(amount);
    }

    document.querySelectorAll('.sim-tier-pill').forEach((btn) => {
      const tierAmt = Number(btn.getAttribute('data-grant-amount'));
      btn.classList.toggle('active', tierAmt === amount);
    });
  };

  window.applyGrantTierToIntake = function() {
    const amount = currentSimulatedGrantAmount || 5000;
    const weights = SIM_FOCUS_WEIGHTS[currentSimulatorFocus] || SIM_FOCUS_WEIGHTS.balanced;
    const directBudget = amount * 0.85;
    const seatMin = Math.max(12, Math.floor(directBudget / 32));
    const seatMax = Math.max(seatMin + 5, Math.ceil(directBudget / 23));
    const gatherMin = Math.max(1, Math.floor((directBudget * weights.gatherShare) / 1100));
    const gatherMax = Math.max(gatherMin, Math.round((directBudget * weights.gatherShare) / 720));

    if (typeof window.selectIntakeTab === 'function') {
      window.selectIntakeTab('grantmaker');
    }

    const msgBox = document.getElementById('form-message');
    if (msgBox) {
      const formattedAmt = `$${amount.toLocaleString()}`;
      msgBox.value =
        `Grant / Sponsorship Alignment Inquiry (${formattedAmt} Illustrative Planning Scenario — ${weights.label}):\n` +
        `• Non-binding planning estimate: ~${seatMin}–${seatMax} neighborhood visits across ~${gatherMin}${gatherMax > gatherMin ? '–' + gatherMax : ''} community gatherings/activations (exact deliverables & schedule co-designed per grant agreement).\n` +
        `• Please share your IRS 501(c)(3) Determination Letter, signed Form W-9, and CRA / RFP partnership overview.`;
    }

    const connectSection = document.getElementById('connect');
    if (connectSection) {
      connectSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    showFunderToast(`✓ Illustrative inquiry drafted for $${amount.toLocaleString()} tier!`);
  };

  // =========================================================================
  // 1-CLICK 30-SECOND EXECUTIVE FUNDER QUICK-VIEW LENS
  // =========================================================================
  window.toggleFunderQuickView = function(event, forceState) {
    if (event) event.preventDefault();
    const isCurrentlyActive = document.body.classList.contains('funder-quick-view-active');
    const nextState = typeof forceState === 'boolean' ? forceState : !isCurrentlyActive;

    document.body.classList.toggle('funder-quick-view-active', nextState);

    const bar = document.getElementById('funderQuickViewBar');
    if (bar) {
      bar.hidden = !nextState;
    }

    const btns = [
      document.getElementById('btnFunderQuickViewToggle'),
      document.getElementById('btnDossierModalQuickView')
    ].filter(Boolean);

    btns.forEach((btn) => {
      btn.setAttribute('aria-pressed', nextState ? 'true' : 'false');
      const labelSpan = btn.querySelector('span');
      if (labelSpan) {
        labelSpan.textContent = nextState ? '✕ Exit Funder Quick-View' : '⚡ 30-Sec Funder Quick-View';
      }
    });

    if (nextState) {
      showFunderToast('🏛️ 30-Sec Funder Quick-View active — compliance, outcomes & grant calculator ready');
    } else {
      showFunderToast('Returned to full community experience');
    }
  };

  // Initialize simulator & optional ?funder=1 executive lens on load
  document.addEventListener('DOMContentLoaded', () => {
    window.updateGrantImpactSimulator(5000);
    const params = new URLSearchParams(window.location.search);
    if (params.get('funder') === '1' || window.location.hash === '#grant-calculator') {
      if (params.get('funder') === '1') {
        window.toggleFunderQuickView(null, true);
      }
    }
  });

  // Close on Escape or Backdrop
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('funderDossierModal');
      if (modal && modal.style.display !== 'none') {
        closeFunderModal();
      }
    }
  });

  document.addEventListener('click', (e) => {
    const modal = document.getElementById('funderDossierModal');
    if (modal && e.target === modal) {
      closeFunderModal();
    }
  });

})();
