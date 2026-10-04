// Inner Sanctuary Wellness Foundation — Interactive Scripts & Forest Exploration Engine

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. INTERACTIVE FOREST ATMOSPHERE & EXPLORATION ENGINE
  // =========================================================================
  const canvas = document.getElementById('forest-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    // Mouse tracking with lerp for smooth exploration
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isMoving: false,
      radius: 140
    };

    let moveTimeout;
    window.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isMoving = true;
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => { mouse.isMoving = false; }, 2000);

      // Parallax botanical silhouettes in corners
      const moveX = (e.clientX - width / 2) / (width / 2);
      const moveY = (e.clientY - height / 2) / (height / 2);
      document.querySelectorAll('.botanical-canopy').forEach((canopy, idx) => {
        const factor = (idx + 1) * 7;
        canopy.style.transform = `translate(${moveX * factor}px, ${moveY * factor}px)${canopy.classList.contains('botanical-top-right') ? ' scaleX(-1)' : ''}`;
      });

      // Update Lantern Aura element
      const lantern = document.getElementById('lantern-aura');
      if (lantern) {
        lantern.style.left = `${e.clientX}px`;
        lantern.style.top = `${e.clientY}px`;
      }
    });

    // Spawn burst of fireflies on click
    window.addEventListener('click', (e) => {
      // Don't interrupt form clicks or buttons
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'A' || e.target.tagName === 'SELECT') return;
      for (let i = 0; i < 7; i++) {
        particles.push(new Firefly(e.clientX, e.clientY, true));
      }
    });

    // Fireflies / Sacred Spores
    class Firefly {
      constructor(startX, startY, isBurst = false) {
        this.x = startX !== undefined ? startX : Math.random() * width;
        this.y = startY !== undefined ? startY : Math.random() * height;
        this.size = Math.random() * 2.8 + 1.2;
        this.baseSize = this.size;
        
        // Colors: Sunburst gold, botanical sage, warm amber
        const colors = [
          'rgba(197, 154, 63, ',   // Gold
          'rgba(216, 170, 73, ',   // Light Gold
          'rgba(95, 123, 107, ',   // Botanical Sage
          'rgba(142, 172, 153, '   // Soft Sage
        ];
        this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
        
        this.alpha = Math.random() * 0.6 + 0.2;
        this.pulseSpeed = Math.random() * 0.03 + 0.01;
        this.pulsePhase = Math.random() * Math.PI * 2;
        
        this.vx = (Math.random() - 0.5) * (isBurst ? 2.5 : 0.6);
        this.vy = (Math.random() - 0.5) * (isBurst ? 2.5 : 0.6) - (isBurst ? 0.5 : 0.2); // subtle upward drift
        this.lifespan = isBurst ? 180 : Infinity;
        this.age = 0;
      }

      update() {
        this.age++;
        this.pulsePhase += this.pulseSpeed;
        
        // Natural pulsing glow
        const currentAlpha = Math.max(0.08, (Math.sin(this.pulsePhase) + 1.1) / 2.2 * this.alpha);
        
        // Wander slightly
        this.vx += (Math.random() - 0.5) * 0.04;
        this.vy += (Math.random() - 0.5) * 0.04 - 0.005; // gentle thermal rise
        
        // Exploration Mouse interaction (gentle natural breeze / curiosity)
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force * 0.35;
          this.vy += Math.sin(angle) * force * 0.35;
          this.size = this.baseSize * (1 + force * 0.8);
        } else {
          this.size = this.baseSize;
        }

        // Apply velocity with air damping
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around boundaries
        if (this.x < -20) this.x = width + 20;
        if (this.x > width + 20) this.x = -20;
        if (this.y < -20) this.y = height + 20;
        if (this.y > height + 20) this.y = -20;

        return this.lifespan === Infinity || this.age < this.lifespan;
      }

      draw() {
        const pulse = (Math.sin(this.pulsePhase) + 1) / 2;
        const currentAlpha = this.alpha * (0.3 + pulse * 0.7);

        // Core Spore
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `${this.colorPrefix}${currentAlpha})`;
        ctx.fill();

        // Ambient Soft Halo
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `${this.colorPrefix}${currentAlpha * 0.2})`;
        ctx.fill();
      }
    }

    // Drifting Botanical Leaf / Petal
    class DriftingLeaf {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : -30;
        this.size = Math.random() * 9 + 7;
        this.speedY = Math.random() * 0.45 + 0.35;
        this.oscillationSpeed = Math.random() * 0.02 + 0.01;
        this.oscillationAmp = Math.random() * 35 + 20;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.startX = this.x;
        this.time = Math.random() * 100;
        // Leaf colors: sage green, soft bronze, cream gold
        this.color = Math.random() > 0.4 ? 'rgba(95, 123, 107, 0.22)' : 'rgba(197, 154, 63, 0.2)';
      }

      update() {
        this.time += this.oscillationSpeed;
        this.y += this.speedY;
        this.x = this.startX + Math.sin(this.time) * this.oscillationAmp;
        this.angle += this.rotationSpeed;

        if (this.y > height + 40) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Stylized organic leaf petal shape
        ctx.moveTo(0, -this.size);
        ctx.quadraticCurveTo(this.size * 0.7, 0, 0, this.size);
        ctx.quadraticCurveTo(-this.size * 0.7, 0, 0, -this.size);
        ctx.fill();

        ctx.restore();
      }
    }

    // Initialize particles
    const particles = [];
    const numFireflies = Math.min(50, Math.floor(width / 26));
    for (let i = 0; i < numFireflies; i++) {
      particles.push(new Firefly());
    }

    const leaves = [];
    const numLeaves = Math.min(12, Math.floor(width / 110));
    for (let i = 0; i < numLeaves; i++) {
      leaves.push(new DriftingLeaf());
    }

    // Main animation render loop
    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Draw subtle warm lantern illumination pool in canvas
      const glowGrad = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, 220);
      glowGrad.addColorStop(0, 'rgba(197, 154, 63, 0.06)');
      glowGrad.addColorStop(0.5, 'rgba(95, 123, 107, 0.025)');
      glowGrad.addColorStop(1, 'rgba(246, 243, 236, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 220, 0, Math.PI * 2);
      ctx.fill();

      // Render Drifting Leaves
      leaves.forEach(leaf => {
        leaf.update();
        leaf.draw();
      });

      // Render Fireflies
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const alive = p.update();
        if (alive) {
          p.draw();
        } else {
          particles.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  // =========================================================================
  // 2. THE $1 COMMUNITY CAMPAIGN DYNAMIC WIDGET
  // =========================================================================
  const presetChips = document.querySelectorAll('.preset-chip');
  const impactText = document.getElementById('impact-text');
  const donateBtn = document.getElementById('btn-donate-action');
  const customAmountInput = document.getElementById('custom-donation-amount');

  const impactMap = {
    '1': 'Spawns 1 community stage token, organic herbal tea & welcoming presence for a grassroots artist.',
    '5': 'Directly sponsors 1 community raffle gift card, blessing a neighborhood performer.',
    '10': 'Funds healthy botanical refreshments and printed event guides for 15 local neighbors.',
    '25': 'Subsidizes live acoustic sound engineering and venue setup for an unhurried showcase.'
  };

  let selectedAmount = '1';

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedAmount = chip.dataset.amount;
      
      if (customAmountInput) customAmountInput.value = '';

      if (impactText && impactMap[selectedAmount]) {
        impactText.style.opacity = '0';
        setTimeout(() => {
          impactText.textContent = impactMap[selectedAmount];
          impactText.style.opacity = '1';
        }, 150);
      }

      if (donateBtn) {
        donateBtn.innerHTML = `<span>Give $${selectedAmount} With Love</span> <span>🌿</span>`;
      }
    });
  });

  if (customAmountInput) {
    customAmountInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val && !isNaN(val) && Number(val) > 0) {
        presetChips.forEach(c => c.classList.remove('active'));
        selectedAmount = val;
        if (impactText) {
          impactText.textContent = `Every $${val} seeds unhurried creative wellness and community safety for our circle.`;
        }
        if (donateBtn) {
          donateBtn.innerHTML = `<span>Give $${val} With Love</span> <span>🌿</span>`;
        }
      }
    });
  }

  if (donateBtn) {
    donateBtn.addEventListener('click', () => {
      createHeartFlourish();
      showToast(`🌿 Blessings! Opening the secure Zeffy portal to plant your $${selectedAmount} seed in the Sanctuary...`);
    });
  }

  // =========================================================================
  // 3. INTERACTIVE INTAKE FORM & ROLE TAB SWITCHER
  // =========================================================================
  const intakeTabs = document.querySelectorAll('.intake-tab');
  const roleSelect = document.getElementById('role-select');
  const messageField = document.getElementById('form-message');
  const submitBtn = document.getElementById('form-submit-btn');
  const intakeForm = document.getElementById('circle-intake-form');

  const tabConfigs = {
    'artist': {
      selectVal: 'Artist / Performer',
      placeholder: 'Tell us about your craft (poetry, music, storytelling, visual art), link to your 30-sec video, or note if you’d like to share in our upcoming circle...',
      buttonText: 'Submit Creator Application'
    },
    'donor': {
      selectVal: '$1 Community Seed Donor',
      placeholder: 'Let us know how you’d like to support the $1 movement, or leave a word of encouragement for our creative circle...',
      buttonText: 'Drop Into The Circle'
    },
    'sponsor': {
      selectVal: 'Corporate / Business Sponsor',
      placeholder: 'Share your organization name, preferred sponsorship tier ($500 Presenting Partner or $100 Community Neighbor), and CRA objectives...',
      buttonText: 'Request Sponsorship Package'
    },
    'raffle': {
      selectVal: 'Raffle & In-Kind Donor',
      placeholder: 'Tell us about your gift card contribution (1–5 $5 cards) or botanical/refreshment donations for our community showcase series...',
      buttonText: 'Pledge Raffle Item'
    }
  };

  intakeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      intakeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const role = tab.dataset.role;

      if (tabConfigs[role]) {
        if (roleSelect) roleSelect.value = tabConfigs[role].selectVal;
        if (messageField) messageField.placeholder = tabConfigs[role].placeholder;
        if (submitBtn) submitBtn.textContent = tabConfigs[role].buttonText;
      }
    });
  });

  if (roleSelect) {
    roleSelect.addEventListener('change', () => {
      const selected = roleSelect.value;
      for (const [key, config] of Object.entries(tabConfigs)) {
        if (config.selectVal === selected) {
          intakeTabs.forEach(t => {
            t.classList.toggle('active', t.dataset.role === key);
          });
          if (messageField) messageField.placeholder = config.placeholder;
          if (submitBtn) submitBtn.textContent = config.buttonText;
          break;
        }
      }
    });
  }

  if (intakeForm) {
    intakeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('form-name');
      const name = nameInput ? nameInput.value.trim() : 'Friend';
      
      showToast(`✨ Welcome to the circle, ${name}! Your submission has been received. Our leadership will reach out shortly.`);
      intakeForm.reset();
      
      const firstTab = document.querySelector('.intake-tab');
      if (firstTab) firstTab.click();
    });
  }

  // =========================================================================
  // 4. INTERACTIVE BLUEPRINT CARD CLICK
  // =========================================================================
  const blueprintSteps = document.querySelectorAll('.blueprint-step');
  blueprintSteps.forEach((step) => {
    step.style.cursor = 'pointer';
    step.addEventListener('click', () => {
      blueprintSteps.forEach(s => {
        s.style.borderColor = 'rgba(197, 154, 63, 0.3)';
        s.style.transform = 'none';
      });
      step.style.borderColor = 'var(--sunburst-gold)';
      step.style.transform = 'translateY(-4px)';
      step.style.boxShadow = '0 8px 24px rgba(197, 154, 63, 0.22)';
    });
  });

  // =========================================================================
  // 5. MOBILE NAVIGATION DRAWER
  // =========================================================================
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileMenu = document.getElementById('mobile-nav-drawer');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isHidden = mobileMenu.style.display === 'none' || mobileMenu.classList.contains('hidden');
      mobileMenu.style.display = isHidden ? 'block' : 'none';
      mobileMenu.classList.toggle('hidden');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.style.display = 'none';
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // =========================================================================
  // 6. TOAST NOTIFICATION SYSTEM
  // =========================================================================
  function showToast(message) {
    let toast = document.getElementById('sanctuary-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sanctuary-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        max-width: 420px;
        background: #1E3328;
        color: #F6F3EC;
        border: 1.5px solid #C59A3F;
        border-radius: 12px;
        padding: 16px 22px;
        box-shadow: 0 16px 40px rgba(0,0,0,0.3);
        font-family: 'Montserrat', sans-serif;
        font-size: 0.92rem;
        line-height: 1.6;
        transform: translateY(30px);
        opacity: 0;
        transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        gap: 12px;
      `;
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <span style="font-size: 1.3rem;">🌿</span>
      <span style="flex: 1;">${message}</span>
    `;

    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateY(30px)';
      toast.style.opacity = '0';
    }, 4500);
  }

  // Celebratory visual particles
  function createHeartFlourish() {
    for (let i = 0; i < 8; i++) {
      const spark = document.createElement('div');
      spark.textContent = ['🌿', '✨', '💛', '🌸'][Math.floor(Math.random() * 4)];
      spark.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: ${60 + (i * 24)}px;
        font-size: ${20 + Math.random() * 14}px;
        pointer-events: none;
        z-index: 10000;
        transition: all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
        transform: translateY(0) scale(0.6);
        opacity: 1;
      `;
      document.body.appendChild(spark);

      setTimeout(() => {
        spark.style.transform = `translateY(-${100 + Math.random() * 120}px) scale(1.2)`;
        spark.style.opacity = '0';
      }, 50);

      setTimeout(() => {
        spark.remove();
      }, 1300);
    }
  }

});
