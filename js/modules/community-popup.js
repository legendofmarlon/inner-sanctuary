/**
 * Inner Sanctuary Wellness Foundation — Community Circle & Newsletter Pop-Up
 * Automatic gentle arrival invitation + instant routing to leadership inboxes
 */
(function() {
  'use strict';

  const STORAGE_KEY_SUBSCRIBED = 'sanctuary_circle_subscribed';
  const STORAGE_KEY_DISMISSED = 'sanctuary_circle_dismissed_until';
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  let activeSource = 'welcome-popup';
  let activeState = null;

  function renderModalStructure() {
    if (document.getElementById('sanctuaryCircleModal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'sanctuaryCircleModal';
    overlay.className = 'sanctuary-circle-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'circleModalHeading');

    overlay.innerHTML = `
      <div class="sanctuary-circle-modal">
        <button type="button" class="circle-modal-close" id="circleModalCloseBtn" aria-label="Close Community Window">✕</button>

        <!-- Step 1: Signup Form -->
        <div id="circleSignupContent">
          <div class="circle-modal-emblem">✨</div>
          <span class="circle-modal-tag">✦ 60-Second Reset &amp; Schedule</span>
          <h2 id="circleModalHeading" class="circle-modal-title">Give Yourself Permission to Pause</h2>
          <p class="circle-modal-sub">
            Sign up to receive our monthly guided breathwork audio, somatic grounding micro-practices for busy days, and priority invites to our live healing circles across Orange County &amp; the Inland Empire.
          </p>

          <form id="circleSignupForm" class="circle-signup-form" method="POST" name="sanctuary-newsletter" data-netlify="true" netlify-honeypot="bot-field">
            <input type="hidden" name="form-name" value="sanctuary-newsletter">
            <p style="display:none;" aria-hidden="true">
              <label>Leave this empty: <input name="bot-field"></label>
            </p>
            <input type="hidden" name="_subject" value="✨ New Community Member • Permission to Pause Subscriber">
            <input type="hidden" name="_to" value="legendofmarlon@gmail.com,innersanctuary0@gmail.com">

            <div class="circle-input-wrap">
              <input type="text" id="circleNameInput" name="name" class="circle-input" placeholder="Your Name or Chosen Name" autocomplete="name">
            </div>

            <div class="circle-input-wrap">
              <input type="email" id="circleEmailInput" name="email" class="circle-input" placeholder="Your Email Address" required autocomplete="email">
            </div>

            <button type="submit" id="circleSubmitBtn" class="circle-submit-btn">
              <span>Send Me Gentle Reminders</span>
              <span>✨</span>
            </button>
          </form>

          <button type="button" class="circle-dismiss-link" id="circleDismissBtn">
            Maybe later • Take me to the Sanctuary
          </button>

          <div class="circle-privacy-note">
            🔒 We protect your peace and never share your information.
          </div>
        </div>

        <!-- Step 2: Optimistic Success Message -->
        <div id="circleSuccessContent" class="circle-success-view">
          <div class="circle-success-icon">🕊️</div>
          <span class="circle-modal-tag">✦ You Are Held Here</span>
          <h3 class="circle-modal-title" style="margin-bottom: 8px;">Welcome to the Circle</h3>
          <p class="circle-modal-sub" style="margin-bottom: 20px;">
            Thank you for connecting with us. An alert has been routed directly to leadership, and your welcome reflection is on its way.
          </p>
          <button type="button" id="circleDoneBtn" class="btn btn-gold" style="padding: 10px 24px; border-radius: 999px; font-weight: 700; cursor: pointer;">
            <span>✨ Continue Exploring</span>
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(overlay);
    attachCircleListeners();
  }

  function attachCircleListeners() {
    const overlay = document.getElementById('sanctuaryCircleModal');
    const closeBtn = document.getElementById('circleModalCloseBtn');
    const dismissBtn = document.getElementById('circleDismissBtn');
    const doneBtn = document.getElementById('circleDoneBtn');
    const form = document.getElementById('circleSignupForm');

    const handleDismiss = () => {
      window.sanctuaryCommunityModal.close();
    };

    closeBtn.addEventListener('click', handleDismiss);
    dismissBtn.addEventListener('click', handleDismiss);
    if (doneBtn) doneBtn.addEventListener('click', () => window.sanctuaryCommunityModal.close());

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) handleDismiss();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        handleDismiss();
      }
    });

    // Handle Form Submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('circleSubmitBtn');
      const nameInput = document.getElementById('circleNameInput');
      const emailInput = document.getElementById('circleEmailInput');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';

      if (!email) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Connecting...</span> <span>✦</span>';
      }

      const payload = {
        name: name,
        email: email,
        source: activeSource,
        state: activeState
      };

      // 1. Dual dispatch: Send to serverless API
      fetch('/.netlify/functions/community-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.warn('[CommunityModal] Function note:', err));

      // 2. Dual dispatch: Submit to Netlify native forms endpoint for leadership inbox notifications
      const formData = new FormData(form);
      formData.set('name', name);
      formData.set('email', email);
      formData.set('source_origin', activeSource);

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      }).finally(() => {
        // Mark as subscribed permanently
        try {
          localStorage.setItem(STORAGE_KEY_SUBSCRIBED, 'true');
        } catch (e) {}

        // Show success screen
        const s1 = document.getElementById('circleSignupContent');
        const s2 = document.getElementById('circleSuccessContent');
        if (s1) s1.style.display = 'none';
        if (s2) s2.classList.add('active');

        // Automatically close after 3.5 seconds
        setTimeout(() => {
          window.sanctuaryCommunityModal.close();
        }, 3500);
      });
    });
  }

  function isEligibleForAutoPopup() {
    try {
      // If already subscribed, don't show
      if (localStorage.getItem(STORAGE_KEY_SUBSCRIBED) === 'true') return false;
      // Allow popping up on page load for immediate community engagement
      return true;
    } catch (e) {}
    return true;
  }

  // Public API
  window.sanctuaryCommunityModal = {
    open: function(source = 'manual-click', state = null) {
      activeSource = source;
      activeState = state;
      renderModalStructure();
      const modal = document.getElementById('sanctuaryCircleModal');
      const s1 = document.getElementById('circleSignupContent');
      const s2 = document.getElementById('circleSuccessContent');
      const submitBtn = document.getElementById('circleSubmitBtn');

      if (s1) s1.style.display = 'block';
      if (s2) s2.classList.remove('active');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Send Me Gentle Reminders</span> <span>✨</span>';
      }

      if (modal) {
        document.body.style.overflow = 'hidden';
        modal.classList.add('active');
      }
    },
    close: function() {
      const modal = document.getElementById('sanctuaryCircleModal');
      if (modal) modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Auto trigger 1.5 seconds after opening the site
  function scheduleArrivalPopup() {
    renderModalStructure();
    
    // Check URL override: ?join=true or #join
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('join') === 'true' || window.location.hash === '#join-circle' || window.location.hash === '#newsletter') {
      window.sanctuaryCommunityModal.open('url-direct');
      return;
    }

    if (!isEligibleForAutoPopup()) return;

    setTimeout(() => {
      // Ensure no conflicting modal is active before opening
      const pauseModal = document.getElementById('pauseBoothModal');
      const isPauseActive = pauseModal && pauseModal.classList.contains('active');
      if (!isPauseActive && isEligibleForAutoPopup()) {
        window.sanctuaryCommunityModal.open('arrival-timer');
      }
    }, 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleArrivalPopup);
  } else {
    scheduleArrivalPopup();
  }
})();
