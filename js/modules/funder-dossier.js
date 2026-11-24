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
