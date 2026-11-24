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
  // Anchored to documented ~$18/seat cost & 88%+ direct program allocation
  // =========================================================================
  let currentSimulatedGrantAmount = 5000;

  window.updateGrantImpactSimulator = function(rawAmount) {
    const amount = Math.min(25000, Math.max(500, Number(rawAmount) || 5000));
    currentSimulatedGrantAmount = amount;

    const directBudget = amount * 0.88;
    const neighbors = Math.max(20, Math.round(directBudget / 18));
    const gatherings = Math.max(1, Math.round(directBudget / 735));
    const stipends = Math.max(2, Math.round((amount * 0.30) / 100));
    const pauseKits = Math.max(1, Math.round(directBudget / 550));

    const fmt = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });

    const setEl = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setEl('simGrantAmountVal', fmt.format(amount));
    setEl('simNeighborsVal', `~${neighbors.toLocaleString()}+`);
    setEl('simGatheringsVal', `${gatherings}`);
    setEl('simStipendsVal', `${stipends}+`);
    setEl('simPauseKitsVal', `${pauseKits}`);
    setEl('simDirectDollarsText', `${fmt.format(Math.round(directBudget))} Direct Community Programs (88%)`);
    setEl('simAdminDollarsText', `${fmt.format(Math.round(amount - directBudget))} Civic & Insurance Oversight (12%)`);

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
    const directBudget = amount * 0.88;
    const neighbors = Math.max(20, Math.round(directBudget / 18));
    const gatherings = Math.max(1, Math.round(directBudget / 735));
    const stipends = Math.max(2, Math.round((amount * 0.30) / 100));

    if (typeof window.selectIntakeTab === 'function') {
      window.selectIntakeTab('grantmaker');
    }

    const msgBox = document.getElementById('form-message');
    if (msgBox) {
      const formattedAmt = `$${amount.toLocaleString()}`;
      msgBox.value =
        `Grant / Sponsorship Alignment Inquiry (${formattedAmt} Tier):\n` +
        `• Estimated Direct Impact: ~${neighbors}+ neighborhood participants across ${gatherings} substance-free Open Mic / Jam gatherings and ${stipends}+ local artist & facilitator stipends.\n` +
        `• Please share your IRS 501(c)(3) Determination Letter, signed Form W-9, and CRA / RFP partnership brief.`;
    }

    const connectSection = document.getElementById('connect');
    if (connectSection) {
      connectSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    showFunderToast(`✓ Grant inquiry pre-filled for $${amount.toLocaleString()} tier!`);
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
