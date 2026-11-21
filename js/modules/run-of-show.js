/**
 * Inner Sanctuary Wellness Foundation — Run-of-Show Stage Command Board
 * Live Host Dashboard for Open Mic Stage Curators & Hosts (Marlon & Teshia)
 */
(function() {
  'use strict';

  const STORAGE_KEY_PASSKEY = 'sanctuary_host_passkey';
  let activeRoster = null;

  function renderModalStructure() {
    if (document.getElementById('stageBoardModal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'stageBoardModal';
    overlay.className = 'stage-board-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'stageBoardTitleHeading');

    overlay.innerHTML = `
      <div class="stage-board-modal">
        
        <!-- Header -->
        <div class="stage-board-header">
          <div>
            <span style="font-size: 0.72rem; color: #F5D77F; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
              ✦ Stage Command &amp; Live Run-of-Show
            </span>
            <h2 id="stageBoardTitleHeading" class="stage-board-title">Our Sanctuary Stage Board</h2>
            <div class="stage-board-meta" id="stageBoardSubtitle">Host: Marlon Smith • Co-Curator: Teshia Campbell</div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <button type="button" id="stageRefreshBtn" class="stage-action-icon-btn" title="Refresh Stage Roster">
              <span>🔄 Refresh</span>
            </button>
            <button type="button" class="stage-board-close-btn" id="stageBoardCloseBtn" aria-label="Close Stage Board">✕</button>
          </div>
        </div>

        <!-- View 1: Passkey Gate -->
        <div id="stageGateView" class="stage-gate-stage">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">🗝️</div>
          <h3 class="stage-board-title" style="margin-bottom: 6px;">Host &amp; Stage Passkey</h3>
          <p style="font-size: 0.86rem; color: #CBD7D0; max-width: 360px;">
            Enter the host passkey to unlock the live run-of-show, manage stage cues, and generate artist promo cards.
          </p>
          <div class="stage-gate-input-row">
            <input type="password" id="stagePasskeyInput" class="stage-gate-input" placeholder="Passkey (default: sanctuary432)">
            <button type="button" id="stagePasskeySubmitBtn" class="stage-gate-btn">Unlock</button>
          </div>
          <div id="stageGateError" style="color: #F87171; font-size: 0.78rem; margin-top: 10px; display: none;">
            Invalid Passkey. Please verify with leadership.
          </div>
        </div>

        <!-- View 2: Live Roster Board -->
        <div id="stageRosterView" class="stage-roster-body" style="display: none;">
          <div id="stageActsContainer" style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Rendered Acts -->
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(overlay);
    attachStageListeners();
  }

  function attachStageListeners() {
    const overlay = document.getElementById('stageBoardModal');
    const closeBtn = document.getElementById('stageBoardCloseBtn');
    const unlockBtn = document.getElementById('stagePasskeySubmitBtn');
    const passkeyInput = document.getElementById('stagePasskeyInput');
    const refreshBtn = document.getElementById('stageRefreshBtn');

    const handleClose = () => window.sanctuaryStageBoard.close();
    closeBtn.addEventListener('click', handleClose);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) handleClose();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        handleClose();
      }
    });

    unlockBtn.addEventListener('click', () => {
      const pass = (passkeyInput.value || '').trim();
      validateAndLoad(pass);
    });

    passkeyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const pass = (passkeyInput.value || '').trim();
        validateAndLoad(pass);
      }
    });

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        const pass = sessionStorage.getItem(STORAGE_KEY_PASSKEY) || 'sanctuary432';
        fetchRoster(pass);
      });
    }
  }

  function validateAndLoad(passkey) {
    const errEl = document.getElementById('stageGateError');
    if (errEl) errEl.style.display = 'none';

    fetchRoster(passkey, (success) => {
      if (success) {
        sessionStorage.setItem(STORAGE_KEY_PASSKEY, passkey);
      } else {
        if (errEl) errEl.style.display = 'block';
      }
    });
  }

  function fetchRoster(passkey, callback) {
    fetch('/.netlify/functions/open-mic-triage', {
      headers: { 'x-stage-passkey': passkey }
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        activeRoster = data.roster;
        renderRosterUI(activeRoster);
        showRosterView();
        if (callback) callback(true);
      })
      .catch(err => {
        console.warn('[StageBoard] Load error:', err);
        if (callback) callback(false);
      });
  }

  function showRosterView() {
    const v1 = document.getElementById('stageGateView');
    const v2 = document.getElementById('stageRosterView');
    if (v1) v1.style.display = 'none';
    if (v2) v2.style.display = 'flex';
  }

  function renderRosterUI(roster) {
    const container = document.getElementById('stageActsContainer');
    const subtitle = document.getElementById('stageBoardSubtitle');
    if (!container || !roster) return;

    if (subtitle) {
      subtitle.textContent = `${roster.eventTitle} • ${roster.eventDate} (${roster.location || 'Sanctuary Clubhouse'})`;
    }

    let prizesHtml = '';
    if (roster.rafflePrizes && roster.rafflePrizes.length > 0) {
      prizesHtml = `
        <div class="stage-prizes-card" style="background: rgba(197, 154, 63, 0.12); border: 1.5px solid rgba(197, 154, 63, 0.45); border-radius: 14px; padding: 14px 18px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 6px; font-size: 0.76rem; font-weight: 800; color: #F5D77F; text-transform: uppercase; letter-spacing: 0.1em;">
              <span>🎁</span> Active Gathering Prizes &amp; Raffle
            </div>
            <button type="button" class="stage-action-icon-btn" onclick="window.sanctuaryStageBoard.copyRaffleAnnouncement()" style="padding: 5px 12px; font-size: 0.74rem;">
              <span>🎙️ Copy Host Script</span>
            </button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            ${roster.rafflePrizes.map(p => `
              <div style="background: rgba(17, 29, 22, 0.85); border: 1px solid rgba(197, 154, 63, 0.25); border-radius: 10px; padding: 10px 12px;">
                <div style="font-weight: 700; color: #FFFFFF; font-size: 0.88rem; margin-bottom: 2px;">${p.badge || p.name}</div>
                <div style="font-size: 0.72rem; color: #86EFAC; font-weight: 600; margin-bottom: 4px;">✦ ${p.sponsor}</div>
                <div style="font-size: 0.74rem; color: #CBD7D0; line-height: 1.4;">${p.description}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (!roster.performers || roster.performers.length === 0) {
      container.innerHTML = prizesHtml + `
        <div style="text-align: center; padding: 40px; color: #CBD7D0;">
          No artists registered on the stage board yet.
        </div>
      `;
      return;
    }

    const actsHtml = roster.performers.map((p, idx) => {
      const isOnStage = p.stageStatus === 'on-stage';
      return `
        <div class="stage-act-card ${isOnStage ? 'on-stage' : ''}" data-act-id="${p.id}">
          <div class="stage-slot-pill">${p.slot}</div>
          
          <div class="stage-artist-info">
            <div class="stage-artist-name">${p.name}</div>
            <div class="stage-artist-meta">
              <span style="color: #F8D98C; font-weight: 600;">✦ ${p.category}</span>
              <span>•</span>
              <span>⏳ ${p.durationMinutes} min</span>
              ${p.instagram ? `<span>•</span> <span>${p.instagram}</span>` : ''}
              ${p.pieceTitle ? `<span>•</span> <span style="font-style: italic;">"${p.pieceTitle}"</span>` : ''}
            </div>
          </div>

          <div class="stage-act-actions">
            <!-- Stage Status Select -->
            <select class="stage-status-select" onchange="window.sanctuaryStageBoard.updateStatus('${p.id}', this.value)">
              <option value="ready" ${p.stageStatus === 'ready' ? 'selected' : ''}>Ready</option>
              <option value="on-deck" ${p.stageStatus === 'on-deck' ? 'selected' : ''}>On Deck ⏳</option>
              <option value="on-stage" ${p.stageStatus === 'on-stage' ? 'selected' : ''}>On Stage 🎤</option>
              <option value="complete" ${p.stageStatus === 'complete' ? 'selected' : ''}>Completed ✓</option>
            </select>

            <!-- Promo Graphic Trigger -->
            <button type="button" class="stage-action-icon-btn" onclick="window.sanctuaryStageBoard.launchPromo('${p.id}')" title="Generate Branded Social Media Card">
              <span>🎨 Promo</span>
            </button>

            <!-- Spoken Intro Trigger -->
            <button type="button" class="stage-action-icon-btn" onclick="window.sanctuaryStageBoard.copyIntro('${p.id}')" title="Copy Host Spoken Stage Intro">
              <span>🎙️ Intro</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = prizesHtml + actsHtml;
  }

  // Public API
  window.sanctuaryStageBoard = {
    open: function() {
      renderModalStructure();
      const modal = document.getElementById('stageBoardModal');
      if (modal) {
        document.body.style.overflow = 'hidden';
        modal.classList.add('active');
      }

      // Check if already authenticated this session
      const savedPass = sessionStorage.getItem(STORAGE_KEY_PASSKEY);
      if (savedPass) {
        fetchRoster(savedPass);
      }
    },
    close: function() {
      const modal = document.getElementById('stageBoardModal');
      if (modal) modal.classList.remove('active');
      document.body.style.overflow = '';
    },
    updateStatus: function(actId, newStatus) {
      const pass = sessionStorage.getItem(STORAGE_KEY_PASSKEY) || 'sanctuary432';
      fetch('/.netlify/functions/open-mic-triage', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-stage-passkey': pass
        },
        body: JSON.stringify({ performerId: actId, stageStatus: newStatus })
      })
        .then(res => res.json())
        .then(data => {
          if (data.roster) {
            activeRoster = data.roster;
            renderRosterUI(activeRoster);
          }
        });
    },
    launchPromo: function(actId) {
      if (!activeRoster || !activeRoster.performers) return;
      const act = activeRoster.performers.find(p => p.id === actId);
      if (act && window.sanctuaryPromoCard) {
        window.sanctuaryPromoCard.open({
          artistName: act.name,
          category: act.category,
          slot: act.slot,
          date: activeRoster.eventDate || 'Sunday, November 22, 2026',
          location: activeRoster.location || 'Our Sanctuary Clubhouse, OC'
        });
      }
    },
    copyIntro: function(actId) {
      if (!activeRoster || !activeRoster.performers) return;
      const act = activeRoster.performers.find(p => p.id === actId);
      if (!act) return;

      const intro = `Sanctuary family, take a deep grounding breath with me. Next up to the sacred mic, bringing ${act.category.toLowerCase()}, let's give warm community love to ${act.name}!`;
      navigator.clipboard.writeText(intro).then(() => {
        alert(`Copied Host Intro to Clipboard:\n\n"${intro}"`);
      }).catch(() => {
        alert(`Host Intro:\n\n"${intro}"`);
      });
    },
    copyRaffleAnnouncement: function() {
      const script = "Sanctuary family! A massive heartfelt shoutout to our community partners and generous sponsors—including In-N-Out Burger for sponsoring fresh meal cards, plus our high-fidelity headphones and official Inner Sanctuary gear! Make sure your community tickets are in before we draw today's giveaway!";
      navigator.clipboard.writeText(script).then(() => {
        alert(`Copied Host Raffle Script to Clipboard:\n\n"${script}"`);
      }).catch(() => {
        alert(`Host Raffle Script:\n\n"${script}"`);
      });
    }
  };

  // Check URL hashtag #stage-command or #greenroom-board
  function checkStageHash() {
    if (window.location.hash === '#stage-command' || window.location.hash === '#stage-board') {
      window.sanctuaryStageBoard.open();
    }
  }

  window.addEventListener('hashchange', checkStageHash);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkStageHash);
  } else {
    checkStageHash();
  }
})();
