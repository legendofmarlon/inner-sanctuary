/**
 * Inner Sanctuary Wellness Foundation — Adaptive Atmosphere Engine
 * Automatically aligns site ambient lighting, gradients, and breath timing with the visitor's local circadian rhythm.
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'sanctuary_atmosphere_pref';
  const ATMOSPHERES = {
    dawn: {
      id: 'dawn',
      name: 'Dawn Awakening',
      icon: '🌅',
      hours: [5, 11],
      breathDuration: 8000
    },
    day: {
      id: 'day',
      name: 'Grounded Daylight',
      icon: '☀️',
      hours: [11, 16.5],
      breathDuration: 7000
    },
    golden: {
      id: 'golden',
      name: 'Golden Hour',
      icon: '🌇',
      hours: [16.5, 20],
      breathDuration: 8500
    },
    night: {
      id: 'night',
      name: 'Sanctuary Night',
      icon: '🕯️',
      hours: [20, 5],
      breathDuration: 10000
    }
  };

  function getCircadianAtmosphere() {
    const now = new Date();
    const current = now.getHours() + (now.getMinutes() / 60);

    if (current >= 5 && current < 11) return 'dawn';
    if (current >= 11 && current < 16.5) return 'day';
    if (current >= 16.5 && current < 20) return 'golden';
    return 'night';
  }

  function getStoredPreference() {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'auto';
    } catch (e) {
      return 'auto';
    }
  }

  function setStoredPreference(pref) {
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch (e) {}
  }

  function resolveEffectiveAtmosphere() {
    const pref = getStoredPreference();
    if (pref && pref !== 'auto' && ATMOSPHERES[pref]) {
      return pref;
    }
    return getCircadianAtmosphere();
  }

  function applyAtmosphere(atmosphereId, animate = true) {
    const root = document.documentElement;
    const config = ATMOSPHERES[atmosphereId] || ATMOSPHERES.day;
    
    root.setAttribute('data-atmosphere', config.id);

    // Update global somatic breath pace if available
    if (window.sanctuaryBreathSync) {
      window.sanctuaryBreathSync.cycleDuration = config.breathDuration;
    }

    // Update UI button and active indicators
    updateSwitcherUI(atmosphereId);

    // Notify listeners (canvas, audio engines, particle layers)
    window.dispatchEvent(new CustomEvent('sanctuary:atmosphere-changed', {
      detail: {
        atmosphere: config.id,
        name: config.name,
        icon: config.icon,
        isAuto: getStoredPreference() === 'auto'
      }
    }));
  }

  function updateSwitcherUI(activeAtmosphere) {
    const currentPref = getStoredPreference();
    const config = ATMOSPHERES[activeAtmosphere] || ATMOSPHERES.day;
    
    const iconEl = document.getElementById('atmosphereCurrentIcon');
    const labelEl = document.getElementById('atmosphereCurrentLabel');
    if (iconEl) iconEl.textContent = config.icon;
    if (labelEl) {
      labelEl.textContent = currentPref === 'auto' ? `${config.icon} Auto` : config.name;
    }

    // Update option buttons in dropdown if present
    document.querySelectorAll('.atmosphere-option-btn').forEach(btn => {
      const mode = btn.getAttribute('data-mode');
      const isSelected = (mode === currentPref);
      btn.classList.toggle('selected', isSelected);
      const check = btn.querySelector('.atmosphere-check-mark');
      if (check) check.textContent = isSelected ? '✓' : '';
    });
  }

  function renderSwitcherComponent() {
    // Check if placeholder exists or mount in nav-actions-group
    const existing = document.getElementById('atmosphereSwitcherMount');
    if (!existing) return;

    existing.innerHTML = `
      <div class="atmosphere-switcher-wrap" style="position: relative; display: inline-block;">
        <button type="button" id="atmosphereToggleBtn" class="atmosphere-switcher-btn" aria-haspopup="true" aria-expanded="false" title="Sanctuary Atmosphere Lighting (Automatic or Manual)">
          <span class="atmosphere-icon-slot" id="atmosphereCurrentIcon">✨</span>
          <span class="atmosphere-mode-label" id="atmosphereCurrentLabel">Atmosphere</span>
          <span style="font-size: 0.65rem; opacity: 0.7;">▾</span>
        </button>
        <div class="atmosphere-dropdown-menu" id="atmosphereMenu" role="menu">
          <div style="font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--sunburst-gold); padding: 4px 10px; font-weight: 700;">
            Circadian Lighting
          </div>
          <button type="button" class="atmosphere-option-btn" data-mode="auto" role="menuitem">
            <span>✨ Auto (Solar Time)</span>
            <span class="atmosphere-check-mark"></span>
          </button>
          <div style="height: 1px; background: rgba(197, 154, 63, 0.2); margin: 3px 0;"></div>
          <button type="button" class="atmosphere-option-btn" data-mode="dawn" role="menuitem">
            <span>🌅 Dawn Awakening</span>
            <span class="atmosphere-check-mark"></span>
          </button>
          <button type="button" class="atmosphere-option-btn" data-mode="day" role="menuitem">
            <span>☀️ Grounded Daylight</span>
            <span class="atmosphere-check-mark"></span>
          </button>
          <button type="button" class="atmosphere-option-btn" data-mode="golden" role="menuitem">
            <span>🌇 Golden Hour</span>
            <span class="atmosphere-check-mark"></span>
          </button>
          <button type="button" class="atmosphere-option-btn" data-mode="night" role="menuitem">
            <span>🕯️ Sanctuary Night</span>
            <span class="atmosphere-check-mark"></span>
          </button>
        </div>
      </div>
    `;

    const toggleBtn = document.getElementById('atmosphereToggleBtn');
    const menu = document.getElementById('atmosphereMenu');

    if (toggleBtn && menu) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menu.classList.toggle('active');
        toggleBtn.setAttribute('aria-expanded', isOpen);
      });

      document.addEventListener('click', () => {
        menu.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });

      menu.addEventListener('click', (e) => {
        const opt = e.target.closest('.atmosphere-option-btn');
        if (!opt) return;
        const mode = opt.getAttribute('data-mode');
        window.sanctuaryAtmosphere.set(mode);
        menu.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    }

    updateSwitcherUI(resolveEffectiveAtmosphere());
  }

  // Public API
  window.sanctuaryAtmosphere = {
    init: function() {
      applyAtmosphere(resolveEffectiveAtmosphere(), false);
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderSwitcherComponent);
      } else {
        renderSwitcherComponent();
      }

      // Check circadian solar time every 5 minutes
      setInterval(() => {
        if (getStoredPreference() === 'auto') {
          const target = getCircadianAtmosphere();
          if (document.documentElement.getAttribute('data-atmosphere') !== target) {
            applyAtmosphere(target, true);
          }
        }
      }, 5 * 60 * 1000);
    },
    set: function(pref) {
      setStoredPreference(pref);
      applyAtmosphere(resolveEffectiveAtmosphere(), true);
    },
    get: function() {
      return getStoredPreference();
    },
    getEffective: function() {
      return resolveEffectiveAtmosphere();
    }
  };

  // Immediate init on parse so there is zero flash of wrong theme
  window.sanctuaryAtmosphere.init();
})();
