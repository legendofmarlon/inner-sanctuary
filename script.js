// Inner Sanctuary Wellness Foundation — Interactive Scripts & Forest Exploration Engine

document.addEventListener('DOMContentLoaded', () => {

  // Floating $1 Seed Action Button on Scroll (Auto-hides when donation section is in view)
  const floatingSeedPill = document.getElementById('floating-seed-pill');
  const pwaBanner = document.getElementById('pwaInstallBanner');
  if (floatingSeedPill) {
    window.addEventListener('scroll', () => {
      const circleGrowth = document.getElementById('circle-growth');
      let isOverDonation = false;
      if (circleGrowth) {
        const rect = circleGrowth.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80 && rect.bottom > 80) {
          isOverDonation = true;
        }
      }
      if (window.scrollY > 340 && !isOverDonation) {
        floatingSeedPill.classList.add('is-visible');
      } else {
        floatingSeedPill.classList.remove('is-visible');
      }
      if (pwaBanner && isOverDonation && pwaBanner.style.display !== 'none') {
        pwaBanner.classList.add('pwa-tuck-away');
      } else if (pwaBanner) {
        pwaBanner.classList.remove('pwa-tuck-away');
      }
    }, { passive: true });
  }


  let soundscape = null;

  // =========================================================================
  // 1. INTERACTIVE FOREST ATMOSPHERE & EXPLORATION ENGINE
  // =========================================================================
  const canvas = document.getElementById('elemental-sanctuary-bg') || document.getElementById('forest-canvas');
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

    // Active Element State
    let currentElement = 'fire';

    const elementThemes = {
      earth: {
        shortName: "Earth",
        icon: "🌿",
        name: "🌿 Earth & Forest Sanctuary",
        quote: "Root down so your branches may reach without fear. Feel your feet on the soil.",
        bg: "#F6F3EC",
        soundLabel: "Lush Forest Canopy & Morning Birdsong"
      },
      water: {
        shortName: "Water",
        icon: "🌊",
        name: "🌊 Water & Forest Creek Sanctuary",
        quote: "A gentle mountain creek flowing over smooth stones. Washes away hurry.",
        bg: "#EDF3F5",
        soundLabel: "Soothing Babbling Forest Stream"
      },
      air: {
        shortName: "Air",
        icon: "🌬️",
        name: "🌬️ Air & Ocean Breeze Sanctuary",
        quote: "Unburdening the chest. Open ocean breeze creating space for clarity and weightless peace.",
        bg: "#F2F5F8",
        soundLabel: "Gentle Ocean Wind & Airy Breeze"
      },
      fire: {
        shortName: "Fire",
        icon: "🔥",
        name: "🔥 Fire & Warm Hearth Sanctuary",
        quote: "Moving energy freely without permission. Cozy hearthside warmth.",
        bg: "#FAF2EC",
        soundLabel: "Crackling Wood Fireplace & Warm Hearth"
      },
      ether: {
        shortName: "Ether",
        icon: "🌌",
        name: "🌌 Ether & Celestial Sanctuary",
        quote: "Realizing the sanctuary isn't a place we have to find; it is within you.",
        bg: "#F3EEF8",
        soundLabel: "Gentle Koshi Wind Chimes"
      }
    };

    // -------------------------------------------------------------
    // ELEMENT ANIMATION ENGINES (UNIQUE FOR EACH ELEMENT)
    // -------------------------------------------------------------

    // Somatic Breathwork Universal Particle Physics Synchronizer
    function applySomaticBreathPhysics(particle) {
      if (!window.sanctuaryBreathSync || !window.sanctuaryBreathSync.active) return;
      const step = window.sanctuaryBreathSync.step; // 0: Inhale (solid 4s), 1: Exhale (solid 4s)
      const ease = window.sanctuaryBreathSync.ease || 0.5;
      const centerX = width / 2;
      const centerY = height * 0.42;

      const dx = centerX - particle.x;
      const dy = centerY - particle.y;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = dx / dist;
      const ny = dy / dist;

      if (step === 0) {
        // INHALE: Gentle somatic gravitational pull drawing inward toward sanctuary center
        const force = ease * 0.22;
        particle.vx += nx * force;
        particle.vy += ny * force;
      } else {
        // EXHALE: Gentle expansive dispersion wave radiating outward
        const force = ease * 0.25;
        particle.vx -= nx * force;
        particle.vy -= ny * force;
      }
    }

    // 1. EARTH: Fireflies & Floating Botanical Leaves
    class Firefly {
      constructor(startX, startY, isBurst = false) {
        this.x = startX !== undefined ? (isBurst ? startX + (Math.random() - 0.5) * 30 : startX) : Math.random() * width;
        this.y = startY !== undefined ? (isBurst ? startY + (Math.random() - 0.5) * 30 : startY) : Math.random() * height;
        this.size = Math.random() * 2.6 + 1.2;
        this.baseSize = this.size;
        this.isBurst = isBurst;
        this.alpha = Math.random() * 0.5 + 0.35;
        this.pulseSpeed = Math.random() * 0.024 + 0.012;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.vx = (Math.random() - 0.5) * (isBurst ? 3.5 : 0.45);
        this.vy = (Math.random() - 0.5) * (isBurst ? 3.5 : 0.45) - (isBurst ? 0.8 : 0.15);
        this.lifespan = isBurst ? Math.random() * 90 + 60 : Infinity;
        this.age = 0;
        this.hueShift = Math.random() > 0.4 ? '248, 217, 140' : '175, 215, 160';
      }

      update() {
        this.age++;
        this.pulsePhase += this.pulseSpeed;
        this.vx += (Math.random() - 0.5) * 0.03;
        this.vy += (Math.random() - 0.5) * 0.03 - 0.003;

        // Synchronize with whole-page somatic breath pulse
        applySomaticBreathPhysics(this);

        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force * 0.3;
          this.vy += Math.sin(angle) * force * 0.3;
          this.size = this.baseSize * (1 + force * 0.7);
        } else {
          this.size = this.baseSize;
        }

        this.vx *= 0.98;
        this.vy *= 0.98;
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -20) this.x = width + 20;
        if (this.x > width + 20) this.x = -20;
        if (this.y < -20) this.y = height + 20;
        if (this.y > height + 20) this.y = -20;

        return this.lifespan === Infinity || this.age < this.lifespan;
      }

      draw() {
        // Natural Lampyridae double-sine flash curve
        const rawPulse = Math.sin(this.pulsePhase) * Math.sin(this.pulsePhase * 0.45);
        const pulse = Math.max(0, rawPulse);
        const fade = this.isBurst ? Math.max(0, 1 - this.age / this.lifespan) : 1;
        const currentAlpha = this.alpha * (0.12 + pulse * 0.88) * fade;

        // Wide atmospheric emerald halo
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 5.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(95, 123, 107, ${currentAlpha * 0.16})`;
        ctx.fill();

        // Warm luminous mid-glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.hueShift}, ${currentAlpha * 0.45})`;
        ctx.fill();

        // Sharp glowing core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 252, 235, ${currentAlpha * 0.95})`;
        ctx.fill();
      }
    }

    class DriftingLeaf {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : -35;
        this.size = Math.random() * 8 + 6;
        this.speedY = Math.random() * 0.4 + 0.3;
        this.oscSpeed = Math.random() * 0.018 + 0.009;
        this.oscAmp = Math.random() * 32 + 18;
        this.angleZ = Math.random() * Math.PI * 2;
        this.angleY = Math.random() * Math.PI * 2; // 3D flip angle
        this.rotSpeedZ = (Math.random() - 0.5) * 0.015;
        this.rotSpeedY = Math.random() * 0.02 + 0.01;
        this.startX = this.x;
        this.time = Math.random() * 100;
        this.isAmber = Math.random() > 0.45;
      }

      update() {
        this.time += this.oscSpeed;
        this.y += this.speedY;
        this.x = this.startX + Math.sin(this.time) * this.oscAmp;
        this.angleZ += this.rotSpeedZ;
        this.angleY += this.rotSpeedY;

        // Breathwork sync: leaves gently float upward on inhale, drift softly down on exhale
        if (window.sanctuaryBreathSync && window.sanctuaryBreathSync.active) {
          const bStep = window.sanctuaryBreathSync.step;
          const bEase = window.sanctuaryBreathSync.ease || 0.5;
          this.y += (bStep === 0 ? -0.45 : 0.40) * bEase;
        }

        if (this.y > height + 40) this.reset();
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angleZ);
        // 3D yaw squish simulation
        const flip = Math.cos(this.angleY);
        ctx.scale(flip, 1);

        const fillColor = this.isAmber 
          ? (flip >= 0 ? 'rgba(197, 154, 63, 0.22)' : 'rgba(224, 182, 88, 0.16)')
          : (flip >= 0 ? 'rgba(95, 123, 107, 0.24)' : 'rgba(125, 160, 140, 0.18)');

        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 1.2);
        ctx.quadraticCurveTo(this.size * 0.75, 0, 0, this.size * 1.2);
        ctx.quadraticCurveTo(-this.size * 0.75, 0, 0, -this.size * 1.2);
        ctx.fill();

        // Central vein
        ctx.strokeStyle = this.isAmber ? 'rgba(165, 125, 45, 0.22)' : 'rgba(70, 95, 80, 0.22)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 1.1);
        ctx.lineTo(0, this.size * 1.1);
        ctx.stroke();

        ctx.restore();
      }
    }

    // 2. WATER: Translucent Shimmering Bubbles & Specular Highlights
    class WaterBubble {
      constructor(startX, startY, isBurst = false) {
        this.reset(startX === undefined, startX, startY, isBurst);
      }

      reset(init = false, startX, startY, isBurst = false) {
        this.isBurst = isBurst;
        this.age = 0;
        this.lifespan = isBurst ? Math.random() * 80 + 50 : Infinity;
        this.x = startX !== undefined ? startX + (Math.random() - 0.5) * 36 : Math.random() * width;
        this.y = startY !== undefined ? startY + (Math.random() - 0.5) * 36 : (init ? Math.random() * height : height + 25);
        this.radius = isBurst ? (Math.random() * 6.5 + 2.5) : (Math.random() * 5.5 + 2.5);
        this.speedY = isBurst ? (Math.random() * 2.2 + 0.9) : (Math.random() * 0.7 + 0.35);
        this.speedX = isBurst ? (Math.random() - 0.5) * 2.2 : 0;
        this.oscSpeed = Math.random() * 0.025 + 0.01;
        this.oscAmp = Math.random() * 16 + 6;
        this.startX = this.x;
        this.time = Math.random() * 50;
        this.alpha = Math.random() * 0.32 + 0.14;
      }

      update() {
        this.age++;
        this.time += this.oscSpeed;
        this.y -= this.speedY;
        if (this.speedX) {
          this.x += this.speedX;
          this.speedX *= 0.98;
        }
        this.x = this.startX + Math.sin(this.time) * this.oscAmp;

        // Breathwork sync: rising aquatic buoyancy on inhale, calm dispersion on exhale
        if (window.sanctuaryBreathSync && window.sanctuaryBreathSync.active) {
          const bStep = window.sanctuaryBreathSync.step;
          const bEase = window.sanctuaryBreathSync.ease || 0.5;
          this.y += (bStep === 0 ? -0.55 : 0.25) * bEase;
        }

        if (this.isBurst && (this.age > this.lifespan || this.y < -30)) return false;
        if (this.y < -30) this.reset();
        return true;
      }

      draw() {
        const fade = this.isBurst ? Math.max(0, 1 - this.age / this.lifespan) : 1;
        const currentAlpha = this.alpha * fade;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(92, 168, 185, ${currentAlpha * 0.18})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(180, 225, 235, ${currentAlpha * 0.75})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();

        // Primary specular highlight (top left)
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.35, this.y - this.radius * 0.35, this.radius * 0.26, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha * 0.92})`;
        ctx.fill();

        // Secondary rim refraction (bottom right)
        ctx.beginPath();
        ctx.arc(this.x + this.radius * 0.28, this.y + this.radius * 0.28, this.radius * 0.14, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 230, 245, ${currentAlpha * 0.65})`;
        ctx.fill();
        ctx.restore();
      }
    }

    const waterRipples = [];
    window.addEventListener('mousemove', (e) => {
      if (currentElement === 'water' && Math.random() > 0.65) {
        waterRipples.push({
          x: e.clientX,
          y: e.clientY,
          radius: 4,
          maxRadius: Math.random() * 45 + 35,
          alpha: 0.35
        });
      } else if (currentElement === 'fire' && Math.random() > 0.75) {
        fireEmbers.push(new FireEmber(e.clientX, e.clientY, true));
      } else if (currentElement === 'air' && Math.random() > 0.75) {
        airMotes.push(new SunbeamMote(e.clientX, e.clientY, true));
      } else if (currentElement === 'earth' && Math.random() > 0.88) {
        earthFireflies.push(new Firefly(e.clientX, e.clientY, true));
      }
    });

    // 3. AIR: Flowing Wind Streams & Weightless Sunbeam Motes
    class DandelionSeed {
      constructor(startX, startY, isBurst = false) {
        this.reset(startX === undefined, startX, startY, isBurst);
      }

      reset(init = false, startX, startY, isBurst = false) {
        this.isBurst = isBurst;
        this.age = 0;
        this.lifespan = isBurst ? Math.random() * 120 + 80 : Infinity;
        this.x = startX !== undefined ? startX + (Math.random() - 0.5) * 20 : (init ? Math.random() * width : -30);
        this.y = startY !== undefined ? startY + (Math.random() - 0.5) * 20 : Math.random() * height;
        this.speedX = isBurst ? (Math.random() * 2.8 + 1.2) : (Math.random() * 1.4 + 0.8);
        this.speedY = isBurst ? (Math.random() - 0.5) * 1.8 : ((Math.random() - 0.5) * 0.3);
        this.size = Math.random() * 4 + 3;
        this.angle = Math.random() * Math.PI * 2;
        this.alpha = Math.random() * 0.35 + 0.2;
      }

      update() {
        this.age++;
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          this.speedX += 0.08;
          this.x += (dx / dist) * 2;
          this.y += (dy / dist) * 2;
        }

        // Breathwork sync: seeds drift inward toward center on inhale, swirl outward on exhale
        if (window.sanctuaryBreathSync && window.sanctuaryBreathSync.active) {
          const bStep = window.sanctuaryBreathSync.step;
          const bEase = window.sanctuaryBreathSync.ease || 0.5;
          const cDx = (width / 2) - this.x;
          this.x += (bStep === 0 ? (cDx > 0 ? 0.35 : -0.35) : (cDx > 0 ? -0.45 : 0.45)) * bEase;
        }

        this.x += this.speedX;
        this.y += this.speedY;
        this.angle += 0.02;

        if (this.isBurst && (this.age > this.lifespan || this.x > width + 40)) return false;
        if (this.x > width + 40 || this.y < -40 || this.y > height + 40) {
          this.reset();
        }
        return true;
      }

      draw() {
        const fade = this.isBurst ? Math.max(0, 1 - this.age / this.lifespan) : 1;
        const currentAlpha = this.alpha * fade;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.strokeStyle = `rgba(180, 210, 225, ${currentAlpha})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI - Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * this.size * 2, Math.sin(a) * this.size * 2);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 185, 205, ${currentAlpha * 1.2})`;
        ctx.fill();
        ctx.restore();
      }
    }

    class SunbeamMote {
      constructor(startX, startY, isBurst = false) {
        this.reset(startX === undefined, startX, startY, isBurst);
      }

      reset(init = false, startX, startY, isBurst = false) {
        this.isBurst = isBurst;
        this.age = 0;
        this.lifespan = isBurst ? Math.random() * 90 + 60 : Infinity;
        this.x = startX !== undefined ? startX + (Math.random() - 0.5) * 35 : Math.random() * width;
        this.y = startY !== undefined ? startY + (Math.random() - 0.5) * 35 : (init ? Math.random() * height : height + 15);
        this.size = isBurst ? (Math.random() * 3.0 + 1.2) : (Math.random() * 2.2 + 0.8);
        this.speedY = isBurst ? (Math.random() * 2.2 + 0.8) : (Math.random() * 0.35 + 0.18);
        this.speedX = isBurst ? (Math.random() - 0.5) * 2.0 : (Math.random() * 0.2 + 0.05);
        this.alpha = Math.random() * 0.55 + 0.25;
        this.phase = Math.random() * Math.PI * 2;
      }

      update() {
        this.age++;
        this.y -= this.speedY;
        this.x += this.speedX + Math.sin(this.y * 0.015) * 0.35;
        this.phase += 0.025;

        // Breathwork sync: motes lift subtly on inhale, float down gently on exhale
        if (window.sanctuaryBreathSync && window.sanctuaryBreathSync.active) {
          const bStep = window.sanctuaryBreathSync.step;
          const bEase = window.sanctuaryBreathSync.ease || 0.5;
          this.y += (bStep === 0 ? -0.42 : 0.35) * bEase;
        }

        if (this.isBurst && (this.age > this.lifespan || this.y < -20)) return false;
        if (this.y < -20) this.reset();
        return true;
      }

      draw() {
        const twinkle = (Math.sin(this.phase) + 1) / 2;
        const fade = this.isBurst ? Math.max(0, 1 - this.age / this.lifespan) : 1;
        const a = this.alpha * (0.35 + twinkle * 0.65) * fade;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 217, 140, ${a})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 245, 210, ${a * 0.22})`;
        ctx.fill();
      }
    }

    // 4. FIRE: Thermodynamic Embers & Swirling Heat Turbulence
    class FireEmber {
      constructor(startX, startY, isBurst = false) {
        this.reset(startX === undefined, startX, startY, isBurst);
      }

      reset(init = false, startX, startY, isBurst = false) {
        this.isBurst = isBurst;
        this.age = 0;
        this.maxLife = isBurst ? Math.random() * 70 + 40 : (Math.random() * 140 + 80);
        this.x = startX !== undefined ? startX + (Math.random() - 0.5) * 30 : (width * 0.5 + (Math.random() - 0.5) * (width * 0.85));
        this.y = startY !== undefined ? startY + (Math.random() - 0.5) * 30 : (init ? Math.random() * height : height + 12);
        this.size = isBurst ? (Math.random() * 3.4 + 1.4) : (Math.random() * 2.8 + 1.2);
        this.speedY = isBurst ? (Math.random() * 3.2 + 1.6) : (Math.random() * 1.9 + 1.0);
        this.speedX = isBurst ? (Math.random() - 0.5) * 3.0 : ((Math.random() - 0.5) * 0.9);
        this.wobbleAmp = Math.random() * 2.2 + 0.8;
        this.alpha = Math.random() * 0.75 + 0.35;
        if (!isBurst && init) {
          this.age = Math.random() * this.maxLife;
        }
      }

      update() {
        this.age++;
        this.y -= this.speedY;
        this.x += this.speedX + Math.sin(this.y * 0.025) * this.wobbleAmp;

        // Breathwork sync: Inhale stokes and draws embers with rising thermal draft; exhale lets them drift gently
        if (window.sanctuaryBreathSync && window.sanctuaryBreathSync.active) {
          const bStep = window.sanctuaryBreathSync.step;
          const bEase = window.sanctuaryBreathSync.ease || 0.5;
          this.y -= (bStep === 0 ? 0.55 : -0.22) * bEase;
        }

        const lifeProgress = this.age / this.maxLife;
        this.alpha = (1 - lifeProgress) * 0.85;

        if (this.y < -20 || this.age >= this.maxLife) {
          if (this.isBurst) return false;
          this.reset();
        }
        return true;
      }

      draw() {
        const lifeProgress = this.age / this.maxLife;
        let color;
        if (lifeProgress < 0.25) {
          color = '255, 245, 180'; // Hot golden spark
        } else if (lifeProgress < 0.6) {
          color = '245, 155, 45';  // Radiant amber
        } else {
          color = '215, 65, 30';   // Deep ruby ember
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${Math.max(0, this.alpha)})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${Math.max(0, this.alpha * 0.22)})`;
        ctx.fill();
      }
    }

    // 5. ETHER: Twinkling Starlight & Sacred Orbiting Stardust
    class CelestialStar {
      constructor(startX, startY, isBurst = false) {
        this.isBurst = isBurst;
        this.age = 0;
        this.lifespan = isBurst ? Math.random() * 100 + 60 : Infinity;
        this.x = startX !== undefined ? startX + (Math.random() - 0.5) * 35 : Math.random() * width;
        this.y = startY !== undefined ? startY + (Math.random() - 0.5) * 35 : Math.random() * height;
        this.vx = isBurst ? (Math.random() - 0.5) * 3.5 : 0;
        this.vy = isBurst ? (Math.random() - 0.5) * 3.5 : 0;
        this.size = isBurst ? (Math.random() * 3.0 + 1.4) : (Math.random() * 2 + 0.8);
        this.phase = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.04 + 0.01;
        this.color = Math.random() > 0.5 ? 'rgba(197, 154, 63, ' : 'rgba(180, 150, 220, ';
      }

      update() {
        this.age++;
        this.phase += this.speed;

        // Breathwork sync: synchronize starlight pulse and shimmering with the sacred breath
        if (window.sanctuaryBreathSync && window.sanctuaryBreathSync.active) {
          const bEase = window.sanctuaryBreathSync.ease || 0.5;
          this.phase += bEase * 0.035;
        }

        if (this.isBurst) {
          this.x += this.vx;
          this.y += this.vy;
          this.vx *= 0.96;
          this.vy *= 0.96;
          return this.age < this.lifespan;
        }
        return true;
      }

      draw() {
        const twinkle = (Math.sin(this.phase) + 1) / 2;
        const fade = this.isBurst ? Math.max(0, 1 - this.age / this.lifespan) : 1;
        const a = (0.2 + twinkle * 0.65) * fade;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}${Math.max(0, a)})`;
        ctx.fill();

        if (twinkle > 0.8) {
          ctx.strokeStyle = `${this.color}${Math.max(0, a * 0.7)})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(this.x - 4, this.y);
          ctx.lineTo(this.x + 4, this.y);
          ctx.moveTo(this.x, this.y - 4);
          ctx.lineTo(this.x, this.y + 4);
          ctx.stroke();
        }
      }
    }

    class OrbitingStardust {
      constructor(startX, startY, isBurst = false) {
        this.isBurst = isBurst;
        this.originX = startX;
        this.originY = startY;
        this.age = 0;
        this.lifespan = isBurst ? Math.random() * 90 + 50 : Infinity;
        this.angle = Math.random() * Math.PI * 2;
        this.radius = isBurst ? (Math.random() * 70 + 20) : (Math.random() * 120 + 30);
        this.speed = (Math.random() * 0.03 + 0.015) * (Math.random() > 0.5 ? 1 : -1);
        this.size = isBurst ? (Math.random() * 2.8 + 1.4) : (Math.random() * 2 + 1);
        this.alpha = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.age++;
        this.angle += this.speed;

        // Breathwork sync: Inhale contracts orbit radius softly inward; exhale expands outward
        if (window.sanctuaryBreathSync && window.sanctuaryBreathSync.active) {
          const bStep = window.sanctuaryBreathSync.step;
          const bEase = window.sanctuaryBreathSync.ease || 0.5;
          this.radius += (bStep === 0 ? -0.18 : 0.20) * bEase;
          this.radius = Math.max(15, Math.min(190, this.radius));
        }

        if (this.isBurst) {
          this.radius += 0.4;
          return this.age < this.lifespan;
        }
        return true;
      }

      draw() {
        const centerRefX = this.isBurst ? (this.originX || mouse.x) : mouse.x;
        const centerRefY = this.isBurst ? (this.originY || mouse.y) : mouse.y;
        const ox = centerRefX + Math.cos(this.angle) * this.radius;
        const oy = centerRefY + Math.sin(this.angle) * (this.radius * 0.6);
        ctx.beginPath();
        ctx.arc(ox, oy, this.size, 0, Math.PI * 2);
        const a = this.isBurst ? this.alpha * (1 - this.age / this.lifespan) : this.alpha;
        ctx.fillStyle = `rgba(185, 145, 235, ${Math.max(0, a)})`;
        ctx.fill();
      }
    }

    // Initialize particle arrays
    const earthFireflies = [];
    for (let i = 0; i < 40; i++) earthFireflies.push(new Firefly());

    const earthLeaves = [];
    for (let i = 0; i < 14; i++) earthLeaves.push(new DriftingLeaf());

    const waterBubbles = [];
    for (let i = 0; i < 30; i++) waterBubbles.push(new WaterBubble());

    const airSeeds = [];
    for (let i = 0; i < 22; i++) airSeeds.push(new DandelionSeed());

    const airMotes = [];
    for (let i = 0; i < 35; i++) airMotes.push(new SunbeamMote());

    const fireEmbers = [];
    for (let i = 0; i < 50; i++) fireEmbers.push(new FireEmber());

    const etherStars = [];
    for (let i = 0; i < 60; i++) etherStars.push(new CelestialStar());

    const etherOrbiters = [];
    for (let i = 0; i < 20; i++) etherOrbiters.push(new OrbitingStardust());

    // Interactive Elemental Click Bursts
    function spawnElementalBurst(x, y) {
      if (currentElement === 'earth') {
        for (let i = 0; i < 16; i++) {
          earthFireflies.push(new Firefly(x, y, true));
        }
      } else if (currentElement === 'water') {
        for (let i = 0; i < 3; i++) {
          waterRipples.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            radius: 4,
            maxRadius: Math.random() * 55 + 40,
            alpha: 0.45
          });
        }
        for (let i = 0; i < 18; i++) {
          waterBubbles.push(new WaterBubble(x, y, true));
        }
      } else if (currentElement === 'air') {
        for (let i = 0; i < 20; i++) {
          airMotes.push(new SunbeamMote(x, y, true));
        }
        for (let i = 0; i < 4; i++) {
          airSeeds.push(new DandelionSeed(x, y, true));
        }
      } else if (currentElement === 'fire') {
        for (let i = 0; i < 25; i++) {
          fireEmbers.push(new FireEmber(x, y, true));
        }
      } else if (currentElement === 'ether') {
        for (let i = 0; i < 20; i++) {
          etherStars.push(new CelestialStar(x, y, true));
        }
        for (let i = 0; i < 6; i++) {
          etherOrbiters.push(new OrbitingStardust(x, y, true));
        }
      }
    }

    window.addEventListener('click', (e) => {
      if (e.target.closest('button, a, input, select, textarea, .box-breathing-container, #sacred-breathing-portal, .contact-card, .tier-box, .lsd-focus-card, .modal, .funder-doc-card, .intake-tab-bar, nav')) {
        return;
      }
      spawnElementalBurst(e.clientX, e.clientY);
    });

    // Global bridge for 4x4 Somatic Breathwork Sync with Canvas
    window.sanctuaryBreathSync = {
      active: false,
      step: 0,
      progress: 0,
      scale: 1.0
    };

    // Main animation render loop
    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Render Dynamic Somatic Breathwork Canvas Aura when solid 4s breathing is active
      if (window.sanctuaryBreathSync && window.sanctuaryBreathSync.active) {
        const step = window.sanctuaryBreathSync.step; // 0: Inhale (solid 4s), 1: Exhale (solid 4s)
        const ease = window.sanctuaryBreathSync.ease || 0.5;
        const centerX = width / 2;
        const centerY = height * 0.42;

        const maxAura = Math.min(width, height) * 0.52;
        const auraRadius = step === 0 ? (maxAura * (0.65 + ease * 0.35)) : (maxAura * (1.00 - ease * 0.35));

        let auraColorInner, auraColorMid;
        if (currentElement === 'water') {
          auraColorInner = step === 0 ? `rgba(142, 204, 218, ${0.12 + ease * 0.08})` : `rgba(92, 168, 185, ${0.20 - ease * 0.08})`;
          auraColorMid = `rgba(180, 225, 235, ${0.04 + ease * 0.03})`;
        } else if (currentElement === 'fire') {
          auraColorInner = step === 0 ? `rgba(245, 175, 25, ${0.14 + ease * 0.09})` : `rgba(235, 125, 45, ${0.23 - ease * 0.09})`;
          auraColorMid = `rgba(255, 220, 140, ${0.05 + ease * 0.03})`;
        } else if (currentElement === 'ether') {
          auraColorInner = step === 0 ? `rgba(180, 150, 220, ${0.13 + ease * 0.08})` : `rgba(140, 105, 195, ${0.21 - ease * 0.08})`;
          auraColorMid = `rgba(215, 195, 245, ${0.04 + ease * 0.03})`;
        } else if (currentElement === 'air') {
          auraColorInner = step === 0 ? `rgba(255, 248, 225, ${0.14 + ease * 0.09})` : `rgba(220, 240, 250, ${0.23 - ease * 0.09})`;
          auraColorMid = `rgba(197, 154, 63, ${0.05 + ease * 0.03})`;
        } else {
          // Earth
          auraColorInner = step === 0 ? `rgba(248, 217, 140, ${0.13 + ease * 0.08})` : `rgba(95, 123, 107, ${0.21 - ease * 0.08})`;
          auraColorMid = `rgba(197, 154, 63, ${0.05 + ease * 0.03})`;
        }

        const breathAura = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, Math.max(50, auraRadius));
        breathAura.addColorStop(0, auraColorInner);
        breathAura.addColorStop(0.65, auraColorMid);
        breathAura.addColorStop(1, 'rgba(246, 243, 236, 0)');

        ctx.fillStyle = breathAura;
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(50, auraRadius), 0, Math.PI * 2);
        ctx.fill();
      }

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Draw subtle warm lantern illumination pool in canvas
      const glowGrad = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, 220);
      if (currentElement === 'water') {
        glowGrad.addColorStop(0, 'rgba(92, 168, 185, 0.10)');
        glowGrad.addColorStop(0.5, 'rgba(142, 204, 218, 0.04)');
      } else if (currentElement === 'fire') {
        glowGrad.addColorStop(0, 'rgba(235, 125, 45, 0.12)');
        glowGrad.addColorStop(0.5, 'rgba(245, 185, 60, 0.04)');
      } else if (currentElement === 'ether') {
        glowGrad.addColorStop(0, 'rgba(180, 150, 220, 0.12)');
        glowGrad.addColorStop(0.5, 'rgba(197, 154, 63, 0.04)');
      } else if (currentElement === 'air') {
        glowGrad.addColorStop(0, 'rgba(160, 200, 225, 0.09)');
        glowGrad.addColorStop(0.5, 'rgba(215, 235, 245, 0.03)');
      } else {
        glowGrad.addColorStop(0, 'rgba(197, 154, 63, 0.08)');
        glowGrad.addColorStop(0.5, 'rgba(95, 123, 107, 0.03)');
      }
      glowGrad.addColorStop(1, 'rgba(246, 243, 236, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 220, 0, Math.PI * 2);
      ctx.fill();

      // ELEMENT-SPECIFIC VISUAL RENDERS:
      if (currentElement === 'water') {
        const time = Date.now() * 0.001;

        // 1. Liquid Oceanic Caustics Refraction Grid
        ctx.save();
        ctx.strokeStyle = 'rgba(142, 204, 218, 0.055)';
        ctx.lineWidth = 2.2;
        for (let c = 0; c < 3; c++) {
          ctx.beginPath();
          const cY = height * (0.64 + c * 0.11);
          ctx.moveTo(0, cY);
          for (let x = 0; x <= width; x += 40) {
            const y = cY + Math.sin(x * 0.005 + time * 1.4 + c) * 16 + Math.cos(x * 0.003 - time * 0.8) * 10;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();

        // 2. Multi-layered Rolling Ocean Swell Waves
        ctx.save();
        ctx.beginPath();
        const baseWaveY1 = height * 0.86;
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 20) {
          const y = baseWaveY1 + Math.sin(x * 0.005 + time * 1.2) * 16 + Math.cos(x * 0.003 + time * 0.8) * 8;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = 'rgba(92, 168, 185, 0.07)';
        ctx.fill();

        ctx.beginPath();
        const baseWaveY2 = height * 0.90;
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 20) {
          const y = baseWaveY2 + Math.sin(x * 0.007 - time * 0.9) * 12 + Math.cos(x * 0.004 + time * 0.7) * 6;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = 'rgba(142, 204, 218, 0.09)';
        ctx.fill();
        ctx.restore();

        // 3. Spontaneous Ambient Rain Droplet Ripples
        if (Math.random() < 0.012) {
          waterRipples.push({
            x: Math.random() * width,
            y: height * (0.35 + Math.random() * 0.6),
            radius: 3,
            maxRadius: Math.random() * 50 + 35,
            alpha: 0.28
          });
        }

        // 4. Water Mouse Ripples & Ambient Ripples
        for (let r = waterRipples.length - 1; r >= 0; r--) {
          const rip = waterRipples[r];
          rip.radius += 0.85;
          rip.alpha -= 0.006;
          if (rip.alpha <= 0 || rip.radius > rip.maxRadius) {
            waterRipples.splice(r, 1);
          } else {
            ctx.beginPath();
            ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(142, 204, 218, ${rip.alpha})`;
            ctx.lineWidth = 1.3;
            ctx.stroke();

            // Inner harmonic ring
            if (rip.radius > 12) {
              ctx.beginPath();
              ctx.arc(rip.x, rip.y, rip.radius * 0.55, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(180, 225, 235, ${rip.alpha * 0.45})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }

        // 5. Render Water Bubbles
        for (let i = waterBubbles.length - 1; i >= 0; i--) {
          const b = waterBubbles[i];
          const alive = b.update();
          b.draw();
          if (b.isBurst && !alive) waterBubbles.splice(i, 1);
        }

      } else if (currentElement === 'air') {
        const t = Date.now() * 0.001;

        // 1. Atmospheric Volumetric God-Rays (Golden Morning Sunbeams)
        const rayTime = Date.now() * 0.0004;
        ctx.save();
        for (let i = 0; i < 4; i++) {
          const rayAlpha = (Math.sin(rayTime + i * 1.4) * 0.5 + 0.5) * 0.035 + 0.015;
          const rayGrad = ctx.createLinearGradient(0, 0, width * 0.8, height);
          rayGrad.addColorStop(0, `rgba(248, 225, 160, ${rayAlpha * 1.6})`);
          rayGrad.addColorStop(0.5, `rgba(255, 248, 220, ${rayAlpha})`);
          rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          const startX = width * (0.08 + i * 0.25);
          ctx.moveTo(startX, 0);
          ctx.lineTo(startX + 140, 0);
          ctx.lineTo(startX - 180 + width * 0.48, height);
          ctx.lineTo(startX - 340 + width * 0.48, height);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // 2. Sweeping Wind Breeze Streaks
        ctx.save();
        ctx.strokeStyle = 'rgba(180, 215, 230, 0.12)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          const yBase = height * (0.22 + i * 0.22);
          ctx.beginPath();
          ctx.moveTo(-50, yBase);
          for (let x = -50; x <= width + 50; x += 30) {
            const y = yBase + Math.sin(x * 0.004 + t * (1.2 + i * 0.3)) * 24;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();

        // 3. Render Sunbeam Golden Motes
        for (let i = airMotes.length - 1; i >= 0; i--) {
          const m = airMotes[i];
          const alive = m.update();
          m.draw();
          if (m.isBurst && !alive) airMotes.splice(i, 1);
        }

        // 4. Render Dandelion Seeds
        for (let i = airSeeds.length - 1; i >= 0; i--) {
          const s = airSeeds[i];
          const alive = s.update();
          s.draw();
          if (s.isBurst && !alive) airSeeds.splice(i, 1);
        }

      } else if (currentElement === 'fire') {
        // 1. Warm Pulsing Hearth Glow at bottom
        const fireTime = Date.now() * 0.002;
        const hearthPulse = (Math.sin(fireTime) + 1) / 2;
        const hearthGrad = ctx.createRadialGradient(width / 2, height + 40, 20, width / 2, height + 40, height * 0.65);
        hearthGrad.addColorStop(0, `rgba(235, 125, 45, ${0.16 + hearthPulse * 0.07})`);
        hearthGrad.addColorStop(0.5, `rgba(245, 185, 60, ${0.06 + hearthPulse * 0.03})`);
        hearthGrad.addColorStop(1, 'rgba(250, 242, 236, 0)');
        ctx.fillStyle = hearthGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Render Rising Thermodynamic Embers
        for (let i = fireEmbers.length - 1; i >= 0; i--) {
          const e = fireEmbers[i];
          const alive = e.update();
          e.draw();
          if (e.isBurst && !alive) fireEmbers.splice(i, 1);
        }

      } else if (currentElement === 'ether') {
        // 1. Render Sacred Celestial Rings in Center
        const ringTime = Date.now() * 0.001;
        const ringPulse = (Math.sin(ringTime * 0.5) + 1) / 2;
        ctx.save();
        ctx.strokeStyle = `rgba(180, 150, 220, ${0.07 + ringPulse * 0.05})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(width / 2, height * 0.45, 120 + ringPulse * 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(width / 2, height * 0.45, 200 + ringPulse * 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 2. Render Celestial Stars
        for (let i = etherStars.length - 1; i >= 0; i--) {
          const s = etherStars[i];
          const alive = s.update();
          s.draw();
          if (s.isBurst && !alive) etherStars.splice(i, 1);
        }

        // 3. Orbiting Stardust motes around cursor
        for (let i = etherOrbiters.length - 1; i >= 0; i--) {
          const o = etherOrbiters[i];
          const alive = o.update();
          o.draw();
          if (o.isBurst && !alive) etherOrbiters.splice(i, 1);
        }

      } else {
        // Earth: Golden Root Filaments, 3D Drifting Leaves & Bioluminescent Fireflies
        const earthTime = Date.now() * 0.0012;
        const rootPulse = (Math.sin(earthTime) + 1) / 2;

        // Subtle grounding root gradient along bottom
        const earthGlow = ctx.createRadialGradient(width / 2, height + 30, 10, width / 2, height + 30, height * 0.45);
        earthGlow.addColorStop(0, `rgba(197, 154, 63, ${0.06 + rootPulse * 0.03})`);
        earthGlow.addColorStop(0.7, `rgba(95, 123, 107, ${0.03 + rootPulse * 0.02})`);
        earthGlow.addColorStop(1, 'rgba(246, 243, 236, 0)');
        ctx.fillStyle = earthGlow;
        ctx.fillRect(0, height * 0.6, width, height * 0.4);

        // Render 3D Tumbling Botanical Leaves
        earthLeaves.forEach(l => {
          l.update();
          l.draw();
        });

        // Render Bioluminescent Fireflies
        for (let i = earthFireflies.length - 1; i >= 0; i--) {
          const f = earthFireflies[i];
          const alive = f.update();
          f.draw();
          if (f.isBurst && !alive) earthFireflies.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    }

    animate();

    // Hero Medallion 3D Tilt & Touch Shimmer Interaction
    const emblemContainer = document.getElementById('hero-emblem-container');
    if (emblemContainer) {
      const handleMedallionMove = (clientX, clientY) => {
        const rect = emblemContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (clientX - centerX) / (rect.width / 2);
        const deltaY = (clientY - centerY) / (rect.height / 2);

        const tiltX = Math.max(-14, Math.min(14, -deltaY * 12));
        const tiltY = Math.max(-14, Math.min(14, deltaX * 12));

        emblemContainer.style.transform = `perspective(900px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale(1.03)`;
      };

      emblemContainer.addEventListener('mousemove', (e) => {
        handleMedallionMove(e.clientX, e.clientY);
      });

      emblemContainer.addEventListener('mouseleave', () => {
        emblemContainer.style.transform = '';
      });

      emblemContainer.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          handleMedallionMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      emblemContainer.addEventListener('touchend', () => {
        emblemContainer.style.transform = '';
      });

      // Whimsical Nature & Falling Leaves Celebration on Click
      emblemContainer.addEventListener('click', (e) => {
        const rect = emblemContainer.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top + rect.height / 2;
        triggerFallingNatureLeaves(originX, originY);

        // Gently start soothing nature soundscape if not playing yet
        if (soundscape && !soundscape.isPlaying) {
          soundscape.start();
        }
      });
    }

    // Interactive Falling Botanical Leaves & White Magnolia Petals
    function triggerFallingNatureLeaves(originX, originY) {
      if (emblemContainer) {
        emblemContainer.classList.remove('clicked');
        void emblemContainer.offsetWidth; // force reflow
        emblemContainer.classList.add('clicked');
      }

      // 5 Variety Botanical SVGs (Monstera, Golden Oak, White Magnolia Petal, Emerald Fern, Solar Mote)
      const leafSVGs = [
        `<svg width="34" height="34" viewBox="0 0 32 32" fill="none"><path d="M16 2C24 6 30 14 26 24C23 30 16 30 16 30C16 30 9 30 6 24C2 14 8 6 16 2Z" fill="#2B4436" fill-opacity="0.9"/><path d="M16 2V30M16 10C20 12 24 16 24 16M16 16C20 18 24 22 24 22M16 10C12 12 8 16 8 16M16 16C12 18 8 22 8 22" stroke="#F8D98C" stroke-width="1.2"/></svg>`,
        `<svg width="30" height="30" viewBox="0 0 28 28" fill="none"><path d="M14 2C20 8 26 14 22 22C18 26 14 26 14 26C14 26 10 26 6 22C2 14 8 8 14 2Z" fill="#C59A3F" fill-opacity="0.95"/><path d="M14 2V26M14 9C18 11 21 14 21 14M14 15C18 17 21 20 21 20M14 9C10 11 7 14 7 14M14 15C10 17 7 20 7 20" stroke="#FFF2D6" stroke-width="1"/></svg>`,
        `<svg width="32" height="32" viewBox="0 0 30 30" fill="none"><path d="M15 2C22 8 27 15 24 23C21 28 15 28 15 28C15 28 9 28 6 23C3 15 8 8 15 2Z" fill="#FAF8F5" fill-opacity="0.98" stroke="#C59A3F" stroke-width="1.4"/><circle cx="15" cy="20" r="3" fill="#F8D98C"/></svg>`,
        `<svg width="28" height="28" viewBox="0 0 26 26" fill="none"><path d="M13 2C19 7 24 13 20 20C16 24 13 24 13 24C13 24 10 24 6 20C2 13 7 7 13 2Z" fill="#5F7B6B" fill-opacity="0.9"/><path d="M13 2V24" stroke="#FAF8F5" stroke-width="1.2"/></svg>`,
        `<svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 0L12.5 7.5L20 10L12.5 12.5L10 20L7.5 12.5L0 10L7.5 7.5L10 0Z" fill="#F8D98C"/></svg>`
      ];

      const count = 30;
      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'nature-leaf-particle';
        particle.innerHTML = leafSVGs[i % leafSVGs.length];

        const startX = originX + (Math.random() - 0.5) * 200;
        const startY = originY + (Math.random() - 0.5) * 90;
        const midX = (Math.random() - 0.5) * 260;
        const midX2 = (Math.random() - 0.5) * 380;
        const endX = (Math.random() - 0.5) * 520;
        const rotMid = `${(Math.random() - 0.5) * 200}deg`;
        const rotMid2 = `${(Math.random() - 0.5) * 400}deg`;
        const rotEnd = `${(Math.random() - 0.5) * 720}deg`;
        const duration = 2.5 + Math.random() * 2.3;
        const delay = Math.random() * 0.45;

        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        particle.style.setProperty('--mid-x', `${midX}px`);
        particle.style.setProperty('--mid-x2', `${midX2}px`);
        particle.style.setProperty('--end-x', `${endX}px`);
        particle.style.setProperty('--rot-mid', rotMid);
        particle.style.setProperty('--rot-mid2', rotMid2);
        particle.style.setProperty('--rot-end', rotEnd);
        particle.style.animation = `flutterAndFall ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s forwards`;

        document.body.appendChild(particle);

        setTimeout(() => {
          particle.remove();
        }, (duration + delay + 0.3) * 1000);
      }

      // Spawn ambient canvas burst
      if (typeof earthFireflies !== 'undefined' && Array.isArray(earthFireflies)) {
        for (let i = 0; i < 16; i++) {
          earthFireflies.push(new Firefly(originX, originY, true));
        }
      }
      if (typeof earthLeaves !== 'undefined' && Array.isArray(earthLeaves)) {
        for (let i = 0; i < 8; i++) {
          earthLeaves.push(new DriftingLeaf());
        }
      }

      showToast("🍃 A breath of forest calm... You are grounded and held.");
    }

    // =========================================================================
    // 1B. AUTHENTIC NATURAL SOUNDSCAPE ENGINE (REAL FIELD RECORDINGS - ZERO RINGING)
    // =========================================================================
    class NaturalStudioSoundscape {
      constructor() {
        this.isPlaying = false;
        this.currentElement = 'earth';
        this.volume = 0.7;
        this.audioCache = {};
        this.activeAudio = null;
        this.fadeInterval = null;
        this.breathInterval = null;
        this.isBreathingSync = false;

        // High-definition authentic organic natural recordings
        this.tracks = {
          earth: 'audio/birds.mp3',       // Lush forest canopy & morning birdsong
          water: 'audio/creek.ogg',       // Soothing babbling mountain creek stream
          air: 'audio/wind.mp3',          // Deep mountain wind & airy breeze
          fire: 'audio/fireplace.mp3',   // Warm crackling wood fireplace with real pops & embers
          ether: 'audio/ether.ogg'       // Gentle celestial Koshi wind chimes
        };
      }

      getAudio(element) {
        const key = this.tracks[element] ? element : 'earth';
        if (!this.audioCache[key]) {
          const audio = new Audio(this.tracks[key]);
          audio.loop = true;
          audio.preload = 'auto';
          audio.volume = 0;
          this.audioCache[key] = audio;
        }
        return this.audioCache[key];
      }

      start() {
        this.isPlaying = true;
        this.playElement(this.currentElement);
        this.updateUI(true);
      }

      stop() {
        this.isPlaying = false;
        if (this.activeAudio) {
          this.fadeOut(this.activeAudio, () => {
            this.activeAudio.pause();
          }, 600);
        }
        this.updateUI(false);
      }

      toggle() {
        if (this.isPlaying) {
          this.stop();
        } else {
          this.start();
        }
      }

      setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        if (this.activeAudio && !this.isBreathingSync) {
          this.activeAudio.volume = this.volume;
        }
      }

      setElement(element) {
        if (!this.tracks[element]) return;
        const prevElement = this.currentElement;
        this.currentElement = element;

        if (this.isPlaying && prevElement !== element) {
          this.crossfadeTo(element);
        }
      }

      playElement(element) {
        const audio = this.getAudio(element);
        this.activeAudio = audio;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            this.fadeIn(audio, this.volume, 800);
          }).catch(() => {
            // Autoplay permissions handled gracefully
          });
        }
      }

      crossfadeTo(newElement) {
        const prevAudio = this.activeAudio;
        const nextAudio = this.getAudio(newElement);
        this.activeAudio = nextAudio;

        const playPromise = nextAudio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            this.fadeIn(nextAudio, this.volume, 800);
            if (prevAudio && prevAudio !== nextAudio) {
              this.fadeOut(prevAudio, () => {
                prevAudio.pause();
                prevAudio.currentTime = 0;
              }, 600);
            }
          }).catch(() => {});
        }
      }

      fadeIn(audio, targetVolume, duration = 800) {
        clearInterval(this.fadeInterval);
        const stepTime = 30;
        const steps = duration / stepTime;
        const stepVolume = targetVolume / steps;
        audio.volume = 0;
        this.fadeInterval = setInterval(() => {
          if (audio.volume + stepVolume >= targetVolume) {
            audio.volume = targetVolume;
            clearInterval(this.fadeInterval);
          } else {
            audio.volume = Math.min(targetVolume, audio.volume + stepVolume);
          }
        }, stepTime);
      }

      fadeOut(audio, onComplete, duration = 600) {
        clearInterval(this.fadeInterval);
        const stepTime = 30;
        const steps = duration / stepTime;
        const stepVolume = (audio.volume || this.volume) / steps;
        this.fadeInterval = setInterval(() => {
          if (audio.volume - stepVolume <= 0.02) {
            audio.volume = 0;
            clearInterval(this.fadeInterval);
            if (onComplete) onComplete();
          } else {
            audio.volume = Math.max(0, audio.volume - stepVolume);
          }
        }, stepTime);
      }

      // Smooth breathwork volume swell & release sync
      syncBreath(stepName, durationSec) {
        if (!this.isPlaying || !this.activeAudio) return;
        this.isBreathingSync = true;
        const targetVol = this.volume;

        if (stepName === 'inhale') {
          // Swells gently with the inhalation wave
          this.rampVolume(this.activeAudio, Math.min(1.0, targetVol * 1.3), durationSec * 1000);
        } else if (stepName === 'hold') {
          // Sustains steady natural atmosphere
          this.rampVolume(this.activeAudio, targetVol * 1.05, durationSec * 1000);
        } else if (stepName === 'exhale') {
          // Softly washes away
          this.rampVolume(this.activeAudio, Math.max(0.15, targetVol * 0.45), durationSec * 1000);
        } else {
          // Rest / settle
          this.rampVolume(this.activeAudio, targetVol, durationSec * 1000);
        }
      }

      rampVolume(audio, target, durationMs) {
        clearInterval(this.breathInterval);
        const start = audio.volume;
        const startTime = Date.now();
        const diff = target - start;

        this.breathInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(1, elapsed / durationMs);
          audio.volume = Math.max(0, Math.min(1, start + diff * progress));
          if (progress >= 1) {
            clearInterval(this.breathInterval);
          }
        }, 40);
      }

      updateUI(playing) {
        const toggleBtn = document.getElementById('soundscape-toggle-btn');
        const iconElem = document.getElementById('soundscape-icon');
        const labelElem = document.getElementById('soundscape-label');

        if (toggleBtn) {
          toggleBtn.classList.toggle('playing', playing);
          toggleBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
        }
        if (iconElem) {
          iconElem.textContent = playing ? '🔊' : '🔈';
        }
        if (labelElem) {
          const activeTheme = elementThemes[this.currentElement] || elementThemes.earth;
        labelElem.textContent = playing ? `Immersed in ${activeTheme.shortName}` : 'Tune In';
        }
      }
    }

    soundscape = new NaturalStudioSoundscape();
    window.soundscape = soundscape;

    // Soundscape Toggle Button
    const soundToggleBtn = document.getElementById('soundscape-toggle-btn');
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        soundscape.toggle();
        createHeartFlourish();
        if (soundscape.isPlaying) {
          const cfg = elementThemes[currentElement] || elementThemes.earth;
          showToast(`🔊 Soundscape active: Immersed in ${cfg.name}.`);
        } else {
          showToast("🔈 Soundscape paused.");
        }
      });
    }

    // Volume Slider
    const volumeSlider = document.getElementById('soundscape-volume');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const val = Number(e.target.value) / 100;
        soundscape.setVolume(val);
      });
    }

    // =========================================================================
    // 1C. AUTOMATIC WEEKLY ELEMENT ROTATION & COORDINATOR
    // =========================================================================
    const WEEKLY_ELEMENT_CYCLE = ['earth', 'water', 'air', 'fire', 'ether'];

    function getThisWeeksSchedule() {
      const now = new Date();
      const currentDay = now.getDay();
      const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
      const monday = new Date(now.getFullYear(), now.getMonth(), diffToMonday);
      const sunday = new Date(now.getFullYear(), now.getMonth(), diffToMonday + 6);
      const fmt = (dt) => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dateRangeStr = `${fmt(monday)} – ${fmt(sunday)}`;

      // Fire Week: Active celebration of the Hearth & Community Warmth
      return {
        key: 'fire',
        weekNo: 46,
        dateRange: dateRangeStr
      };
    }

    // =========================================================================
    // 1D. REALISTIC 8K NATURE BACKGROUND PLATE CROSSFADER
    // =========================================================================
    let currentPlateElement = null;
    let activePlateIndex = 0; // 0: primary, 1: secondary
    const ELEMENTAL_CLASSES = ['plate-earth', 'plate-water', 'plate-air', 'plate-fire', 'plate-ether'];

    function crossfadeNatureSkyPlate(elKey) {
      const platePrimary = document.getElementById('skyPlatePrimary');
      const plateSecondary = document.getElementById('skyPlateSecondary');
      if (!platePrimary || !plateSecondary) return;

      if (currentPlateElement === elKey) return;

      // On initial run or if no plate is initialized yet
      if (!currentPlateElement) {
        currentPlateElement = elKey;
        platePrimary.className = `sky-plate sky-plate-primary active plate-${elKey}`;
        plateSecondary.className = 'sky-plate sky-plate-secondary inactive';
        return;
      }

      currentPlateElement = elKey;
      const targetClass = `plate-${elKey}`;

      // Pick incoming and outgoing plates
      const incomingPlate = activePlateIndex === 0 ? plateSecondary : platePrimary;
      const outgoingPlate = activePlateIndex === 0 ? platePrimary : plateSecondary;

      // Prepare incoming plate with new element artwork & animation
      incomingPlate.classList.remove('active', 'inactive', ...ELEMENTAL_CLASSES);
      incomingPlate.classList.add(targetClass);

      // Force layout reflow so transition is seamless and guaranteed
      void incomingPlate.offsetWidth;

      // Execute cinematic crossfade
      incomingPlate.classList.add('active');
      outgoingPlate.classList.remove('active');
      outgoingPlate.classList.add('inactive');

      // Toggle active plate index
      activePlateIndex = activePlateIndex === 0 ? 1 : 0;
    }

    // Preload all 5 realistic 8K environmental plates in background for instant switching
    const ELEMENTAL_8K_PLATES = [
      'images/nature-earth-8k.jpg',
      'images/nature-water-8k.jpg',
      'images/sky-air-8k.jpg',
      'images/nature-fire-8k.jpg',
      'images/nature-ether-8k.jpg'
    ];
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          ELEMENTAL_8K_PLATES.forEach(src => {
            const img = new Image();
            img.src = src;
          });
        });
      } else {
        setTimeout(() => {
          ELEMENTAL_8K_PLATES.forEach(src => {
            const img = new Image();
            img.src = src;
          });
        }, 800);
      }
    }

    window.switchElementTheme = function(elKey, userTriggered) { return switchElementTheme(elKey, userTriggered); };
    function switchElementTheme(elKey, userTriggered = true) {
      if (!elementThemes[elKey]) return;
      currentElement = elKey;
      const theme = elementThemes[elKey];

      // Update Top Bar Headline
      const nameElem = document.getElementById('active-element-name');
      const quoteElem = document.getElementById('active-element-quote');
      if (nameElem) {
        nameElem.innerHTML = `Tune into this week's element: <strong>${theme.icon} ${theme.shortName}</strong>`;
      const pillTitle = document.getElementById('active-pill-title');
      if (pillTitle) pillTitle.textContent = `${theme.shortName} & Sanctuary`;
      }
      if (quoteElem) quoteElem.textContent = `"${theme.quote}"`;

      // Update Cycle Indicator Dots
      document.querySelectorAll('.cycle-dot').forEach(dot => {
        const matches = dot.dataset.element === elKey;
        dot.classList.toggle('active', matches);
        dot.setAttribute('aria-selected', matches ? 'true' : 'false');
      });

      // Update Body Theme attribute for smooth background shift
      document.body.setAttribute('data-element', elKey);

      // Crossfade Realistic 8K Environmental Nature Plates
      crossfadeNatureSkyPlate(elKey);

      // Notify 3D Sanctuary Engine
      if (window.sanctuary3D && typeof window.sanctuary3D.setElement === 'function') {
        window.sanctuary3D.setElement(elKey);
      }

      // Update Active Weekly Pill Icon & Subtitle
      const activePill = document.getElementById('active-weekly-pill');
      if (activePill) {
        const iconSpan = activePill.querySelector('.pill-icon');
        const vibeSpan = activePill.querySelector('.pill-vibe-tag');
        if (iconSpan) iconSpan.textContent = theme.icon;
        if (vibeSpan) vibeSpan.textContent = theme.shortName;
        activePill.title = "Active Element: " + theme.name;
      }

      // Smoothly crossfade natural field recording soundscape
      soundscape.setElement(elKey);

      // Update Soundscape Toggle Button Label
      const soundLabel = document.getElementById('soundscape-label');
      if (soundLabel) {
        soundLabel.textContent = soundscape.isPlaying ? `Immersed in ${theme.shortName}` : 'Tune In';
      }

      if (userTriggered) {
        createHeartFlourish();
        showToast(`🌿 Tuned into this week's element: ${theme.name}`);
      }
    }

    // Initialize to This Week's Element automatically
    const thisWeek = getThisWeeksSchedule();
    const dateRangeElem = document.getElementById('active-element-date');
    if (dateRangeElem) dateRangeElem.textContent = thisWeek.dateRange;
    switchElementTheme(thisWeek.key, false);

    // Bind Cycle Dots for Exploring / Previewing
    document.querySelectorAll('.cycle-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        switchElementTheme(dot.dataset.element, true);
        if (!soundscape.isPlaying) {
          soundscape.start();
        }
      });
    });
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
        donateBtn.innerHTML = `<span>Plant Your $${selectedAmount} Seed</span> <span>🌿</span>`;
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
          impactText.textContent = `Every $${val} seeds unhurried creative wellness and community safety for our sanctuary.`;
        }
        if (donateBtn) {
          donateBtn.innerHTML = `<span>Plant Your $${val} Seed</span> <span>🌿</span>`;
        }
      }
    });
  }

  // Golden Seed Particle Burst & Major-9th Crystal Bowl/Harp Sanctuary Chime
  function triggerGoldenSeedBurst(originX, originY) {
    const container = document.body;
    const count = 32;
    const emojis = ['🌱', '🍃', '✨', '✦', '🌿', '💛'];
    const colors = ['#C59A3F', '#F8D98C', '#E2ECE5', '#5F7B6B', '#FFFFFF'];

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'seed-particle';

      const isEmoji = i % 3 === 0;
      if (isEmoji) {
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.fontSize = `${Math.random() * 14 + 14}px`;
      } else {
        const size = Math.random() * 10 + 6;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.boxShadow = `0 0 14px ${colors[Math.floor(Math.random() * 2)]}`;
      }

      el.style.left = `${originX}px`;
      el.style.top = `${originY}px`;

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 150 + 60;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 45; // upward sanctuary lift
      const rot = (Math.random() - 0.5) * 360;

      el.style.setProperty('--tx', `${tx}px`);
      el.style.setProperty('--ty', `${ty}px`);
      el.style.setProperty('--rot', `${rot}deg`);

      container.appendChild(el);
      setTimeout(() => el.remove(), 1500);
    }
  }

  function playSanctuaryHarmonicChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      // Lush major-9th crystal bowl & harp chord tuned in sacred 432Hz harmony
      // A3 (216Hz), C#4 (270Hz), E4 (324Hz), G#4 (405Hz), B4 (486Hz), E5 (648Hz shimmer)
      const chordFrequencies = [216, 270, 324, 405, 486, 648];
      const now = ctx.currentTime;

      const chordMaster = ctx.createGain();
      chordMaster.gain.setValueAtTime(0.32, now);
      chordMaster.connect(ctx.destination);

      chordFrequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Micro-detune for organic shimmering crystal chorus
        const detune = (idx - 2.5) * 2.4;
        osc.detune.setValueAtTime(detune, now);

        // Staggered arpeggiated attack like a celestial harp sweep
        const noteDelay = idx * 0.055;
        const noteStart = now + noteDelay;

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.linearRampToValueAtTime(0.24 / (idx * 0.2 + 1), noteStart + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 3.2);

        osc.connect(gain);
        gain.connect(chordMaster);

        osc.start(noteStart);
        osc.stop(noteStart + 3.4);
      });
    } catch (e) {}
  }

  if (donateBtn) {
    donateBtn.addEventListener('click', () => {
      const rect = donateBtn.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      triggerGoldenSeedBurst(originX, originY);
      playSanctuaryHarmonicChime();
      showToast(`🌱 Your Seed Has Been Planted in the Sanctuary • Opening Zeffy...`);
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
      placeholder: 'Tell us about your craft (poetry, music, storytelling, visual art), or share how you’d like to join or perform in our upcoming circle...',
      buttonText: 'Send to Sanctuary Leadership ✉️'
    },
    'volunteer': {
      selectVal: 'General Volunteer / Community Care',
      placeholder: 'Tell us how you’d like to help (bracelet making station, sharing Sanctuary Sparks, welcoming neighbors, stage setup, community care), and your availability...',
      buttonText: 'Join Volunteer Circle ✉️'
    },
    'donor': {
      selectVal: '$1 Community Seed Donor',
      placeholder: 'Let us know how you’d like to support the $1 movement, or leave a word of encouragement for our creative circle...',
      buttonText: 'Send to Sanctuary Leadership ✉️'
    },
    'sponsor': {
      selectVal: 'Corporate Sponsor / Bank CRA Partner',
      placeholder: 'Share your organization name, preferred sponsorship tier ($1,000–$2,500 Presenting, $250–$500 Community Neighbor, or $5,000+ Underwriter), and CRA/CSR objectives...',
      buttonText: 'Request Sponsorship Due Diligence Kit ✉️'
    },
    'grantmaker': {
      selectVal: 'Institutional Grantmaker / Foundation RFP',
      placeholder: 'Please share your foundation or grantmaking entity name, RFP focus area, due diligence requirements (IRS letter, Logic Model, Form 990), or grant guidelines...',
      buttonText: 'Submit Grant Inquiry / RFP ✉️'
    },
    'raffle': {
      selectVal: 'Raffle & In-Kind Donor',
      placeholder: 'Tell us about your gift card contribution (1–5 $5 cards) or botanical/refreshment donations for our community showcase series...',
      buttonText: 'Pledge Raffle Item ✉️'
    }
  };

  window.selectIntakeTab = function(role) {
    const targetTab = document.querySelector(`.intake-tab[data-role="${role}"]`);
    if (targetTab) {
      targetTab.click();
      const formSection = document.getElementById('connect');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
      }
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
    intakeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentSubmitBtn = document.getElementById('form-submit-btn');
      const originalText = currentSubmitBtn ? currentSubmitBtn.innerHTML : 'Send to Sanctuary Leadership ✉️';

      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const roleSelectElem = document.getElementById('role-select');
      const handleInput = document.getElementById('form-handle');
      const messageInput = document.getElementById('form-message');

      const name = nameInput ? nameInput.value.trim() : 'Friend';
      const email = emailInput ? emailInput.value.trim() : '';
      const role = roleSelectElem ? roleSelectElem.value : 'Community Message';
      const handle = handleInput ? handleInput.value.trim() : 'N/A';
      const message = messageInput ? messageInput.value.trim() : '';

      if (currentSubmitBtn) {
        currentSubmitBtn.disabled = true;
        currentSubmitBtn.innerHTML = '<span>Sending to Leadership Inboxes...</span> <span>🌿</span>';
      }

      try {
        const formData = new FormData(intakeForm);
        formData.set('form-name', 'sanctuary-intake');
        await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString()
        });
      } catch (err) {
        // Fallback to formsubmit.co if running on local file system
        try {
          await fetch('https://formsubmit.co/ajax/hello@innersanctuarywellnessfoundation.org', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              name,
              email,
              role,
              contact_info: handle,
              message,
              _cc: 'innersanctuary0@gmail.com',
              _subject: `New Community Message from ${name} (${role}) • Inner Sanctuary`
            })
          });
        } catch (e) {}
      } finally {
        if (currentSubmitBtn) {
          currentSubmitBtn.disabled = false;
          currentSubmitBtn.innerHTML = originalText;
        }
        const firstTab = document.querySelector('.intake-tab');
        if (firstTab) firstTab.click();
      }

      playHarmonicTone(528, 1.2);
      createHeartFlourish();
      showToast(`✨ Thank you, ${name}! Your message has been received with reverence.`);
      intakeForm.reset();

      // Show inline success state
      const successBox = document.getElementById('circle-intake-success');
      if (successBox) {
        intakeForm.style.display = 'none';
        successBox.style.display = 'block';
      }
    });
  }

  // =========================================================================
  // 5. MOBILE NAVIGATION DRAWER
  // =========================================================================
  window.toggleMobileNavDrawer = toggleMobileNavDrawer;
  function toggleMobileNavDrawer(e) {
    if (e && e.preventDefault) e.preventDefault();
    const mobileMenu = document.getElementById('mobile-nav-drawer');
    if (!mobileMenu) return;
    const isHidden = mobileMenu.style.display === 'none' || mobileMenu.classList.contains('hidden') || getComputedStyle(mobileMenu).display === 'none';
    mobileMenu.style.display = isHidden ? 'block' : 'none';
    if (isHidden) {
      mobileMenu.classList.remove('hidden');
    } else {
      mobileMenu.classList.add('hidden');
    }
  }

  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileMenu = document.getElementById('mobile-nav-drawer');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', toggleMobileNavDrawer);

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
  window.showToast = showToast;
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

  // =========================================================================
  // 7. ZEN LIVING BREATH ORB ENGINE (SIMPLE, CONTINUOUS, ZERO PAUSES)
  // Palette: Deep Obsidian (#0B0F17), Golden Hour Amber (#F5AF19), Prism Cyan (#00F2FE)
  // =========================================================================

  // -------------------------------------------------------------------------
  // SOOTHING PROCEDURAL BREATH AUDIO SYNTHESIZER (Web Audio API)
  // Organic, whisper-soft pink-noise formant filter (Zero ringing, zero harshness)
  // -------------------------------------------------------------------------
  class SoothingBreathAudioEngine {
    constructor() {
      this.ctx = null;
      this.isEnabled = true;
      this.volume = 0.42;
      this.noiseBuffer = null;
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Generate 5 seconds of organic pink noise
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = sampleRate * 5;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.045;
        b6 = white * 0.115926;
      }
    }

    playInhale(durationSec) {
      if (!this.isEnabled) return;
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      src.loop = true;

      // Resonant formant filter for gentle inhalation
      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(380, now);
      bandpass.frequency.exponentialRampToValueAtTime(720, now + durationSec);
      bandpass.Q.value = 1.7;

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(800, now);
      lowpass.frequency.exponentialRampToValueAtTime(1250, now + durationSec * 0.8);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      // Gentle, smooth swell
      gain.gain.exponentialRampToValueAtTime(0.32 * this.volume, now + durationSec * 0.8);
      gain.gain.linearRampToValueAtTime(0.0001, now + durationSec);

      src.connect(bandpass);
      bandpass.connect(lowpass);
      lowpass.connect(gain);
      gain.connect(this.ctx.destination);

      src.start(now);
      src.stop(now + durationSec + 0.05);
    }

    playExhale(durationSec) {
      if (!this.isEnabled) return;
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      src.loop = true;

      // Deep, soothing warm mouth sigh
      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(600, now);
      bandpass.frequency.exponentialRampToValueAtTime(260, now + durationSec);
      bandpass.Q.value = 1.3;

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(1050, now);
      lowpass.frequency.exponentialRampToValueAtTime(500, now + durationSec);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      // Soft gentle onset, long soothing release
      gain.gain.exponentialRampToValueAtTime(0.38 * this.volume, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      src.connect(bandpass);
      bandpass.connect(lowpass);
      lowpass.connect(gain);
      gain.connect(this.ctx.destination);

      src.start(now);
      src.stop(now + durationSec + 0.05);
    }

    toggle() {
      this.isEnabled = !this.isEnabled;
      return this.isEnabled;
    }
  }

  const breathAudio = new SoothingBreathAudioEngine();

  // DOM Elements for the Living Breath Orb
  const somaticOrb = document.getElementById('somatic-orb');
  const somaticHalo = document.getElementById('somatic-halo');
  const orbInnerGlow = document.getElementById('orb-inner-glow');
  const orbBreathWord = document.getElementById('orb-breath-word');
  const orbStatusPrompt = document.getElementById('orb-status-prompt');
  const orbBtn = document.getElementById('orb-toggle-btn');
  const orbLabel = document.getElementById('orb-btn-label');
  const btnCtrlIcon = document.getElementById('btn-ctrl-icon');
  const breathSoundBtn = document.getElementById('breath-sound-toggle-btn');
  const breathSoundIcon = document.getElementById('breath-sound-icon');
  const breathSoundLabel = document.getElementById('breath-sound-label');
  const breathWorkshopCtaBtn = document.getElementById('breath-workshop-cta-btn');

  // State Configuration: Calm, Solid 4.0s Inhale / 4.0s Exhale (Zero Pauses)
  const PHASE_DURATION_MS = 4000; // Solid 4.0 seconds per phase (8.0s cycle)
  const CYCLE_DURATION_MS = 8000;
  let isBreathingActive = false;
  let breathStartTime = null;
  let breathAnimId = null;
  let completedCycles = 0;
  let hasFiredGA4_3Cycles = false;
  let lastReportedCycleIndex = -1;
  let lastTriggeredPhase = -1;

  // Google Ad Grants / GA4 Hook
  function fireGA4WidgetEngagement(source) {
    if (typeof gtag === 'function') {
      try {
        gtag('event', 'wellness_widget_engaged', {
          event_category: 'somatic_breathwork',
          event_label: source || 'zen_breath_orb',
          completed_cycles: completedCycles,
          value: 1
        });
      } catch (e) {
        console.warn('[GA4] Event dispatch error:', e);
      }
    }
    console.log('[Inner Sanctuary GA4] Event fired: wellness_widget_engaged | Source:', source);
  }

  // -------------------------------------------------------------------------
  // LIVING BREATH ORB UPDATE LOOP (ZERO PAUSES)
  // Animate the breath in and out directly within and upon the Orb
  // -------------------------------------------------------------------------
  function updateSacredBreathLoop(now) {
    if (!isBreathingActive) return;
    if (!breathStartTime) breathStartTime = now;

    const totalElapsed = now - breathStartTime;
    const cycleTime = totalElapsed % CYCLE_DURATION_MS;

    // Track cycle completions
    const cycleIdx = Math.floor(totalElapsed / CYCLE_DURATION_MS);
    if (cycleIdx > lastReportedCycleIndex) {
      if (lastReportedCycleIndex !== -1) {
        completedCycles++;
        if (completedCycles === 3 && !hasFiredGA4_3Cycles) {
          hasFiredGA4_3Cycles = true;
          fireGA4WidgetEngagement('completed_3_cycles');
          showToast('✨ Nervous System Grounded! 3 Cycles Complete.');
        } else if (completedCycles === 5) {
          showToast('🏆 Full Reset Complete! Deep stillness is with you.');
        }
      }
      lastReportedCycleIndex = cycleIdx;
    }

    // Phase determination (0: INHALE, 1: EXHALE - ZERO PAUSES)
    const phaseIndex = Math.floor(cycleTime / PHASE_DURATION_MS);
    const phaseElapsed = cycleTime % PHASE_DURATION_MS;
    const p = phaseElapsed / PHASE_DURATION_MS; // 0.0 to 1.0
    const ease = (1 - Math.cos(p * Math.PI)) / 2;

    // Trigger soothing breath sounds and update phase copy ONCE right at transition
    if (phaseIndex !== lastTriggeredPhase) {
      lastTriggeredPhase = phaseIndex;
      if (phaseIndex === 0) {
        breathAudio.playInhale(4.0);
        if (orbBreathWord) orbBreathWord.textContent = 'Inhale';
        if (orbStatusPrompt) orbStatusPrompt.textContent = 'Breathe in deeply...';
      } else {
        breathAudio.playExhale(4.0);
        if (orbBreathWord) orbBreathWord.textContent = 'Exhale';
        if (orbStatusPrompt) orbStatusPrompt.textContent = 'Breathe out slowly...';
      }
    }

    if (phaseIndex === 0) {
      // INHALE: Orb smoothly expands (1.00 -> 1.46) with warm inner glow & flame sparks
      const orbScale = 1.00 + ease * 0.46;
      const haloScale = 1.00 + ease * 0.80;
      const haloOpacity = 0.35 + ease * 0.55;
      const glowScale = 1.00 + ease * 0.60;
      const glowOpacity = 0.30 + ease * 0.60;

      if (somaticOrb) {
        somaticOrb.style.transform = `scale3d(${orbScale.toFixed(3)}, ${orbScale.toFixed(3)}, 1)`;
        somaticOrb.style.boxShadow = `0 ${(14 + ease * 14).toFixed(1)}px ${(40 + ease * 35).toFixed(1)}px rgba(0,0,0,0.65), 0 0 ${(55 + ease * 50).toFixed(1)}px rgba(212, 168, 79, ${(0.75 + ease * 0.25).toFixed(2)}), 0 0 ${(90 + ease * 60).toFixed(1)}px rgba(248, 217, 140, ${(0.45 + ease * 0.30).toFixed(2)}), inset 0 3px 14px rgba(255,255,255,0.95), inset 0 -8px 24px rgba(154, 111, 26, 0.75)`;
      }
      if (somaticHalo) {
        somaticHalo.style.transform = `scale3d(${haloScale.toFixed(3)}, ${haloScale.toFixed(3)}, 1)`;
        somaticHalo.style.opacity = haloOpacity.toFixed(2);
      }
      if (orbInnerGlow) {
        orbInnerGlow.style.transform = `scale3d(${glowScale.toFixed(3)}, ${glowScale.toFixed(3)}, 1)`;
        orbInnerGlow.style.opacity = glowOpacity.toFixed(2);
      }
    } else {
      // EXHALE: Orb smoothly releases and contracts (1.46 -> 1.00)
      const orbScale = 1.46 - ease * 0.46;
      const haloScale = 1.80 - ease * 0.80;
      const haloOpacity = 0.90 - ease * 0.55;
      const glowScale = 1.60 - ease * 0.60;
      const glowOpacity = 0.90 - ease * 0.60;

      if (somaticOrb) {
        somaticOrb.style.transform = `scale3d(${orbScale.toFixed(3)}, ${orbScale.toFixed(3)}, 1)`;
        somaticOrb.style.boxShadow = `0 ${(28 - ease * 14).toFixed(1)}px ${(75 - ease * 35).toFixed(1)}px rgba(0,0,0,0.65), 0 0 ${(105 - ease * 50).toFixed(1)}px rgba(212, 168, 79, ${(1.00 - ease * 0.25).toFixed(2)}), 0 0 ${(150 - ease * 60).toFixed(1)}px rgba(248, 217, 140, ${(0.75 - ease * 0.30).toFixed(2)}), inset 0 3px 14px rgba(255,255,255,0.95), inset 0 -8px 24px rgba(154, 111, 26, 0.75)`;
      }
      if (somaticHalo) {
        somaticHalo.style.transform = `scale3d(${haloScale.toFixed(3)}, ${haloScale.toFixed(3)}, 1)`;
        somaticHalo.style.opacity = haloOpacity.toFixed(2);
      }
      if (orbInnerGlow) {
        orbInnerGlow.style.transform = `scale3d(${glowScale.toFixed(3)}, ${glowScale.toFixed(3)}, 1)`;
        orbInnerGlow.style.opacity = glowOpacity.toFixed(2);
      }
    }

    // Whole-Screen Atmospheric Inhale/Exhale Living Scale (1.000 to 1.026)
    const bgScale = phaseIndex === 0 ? 1.00 + ease * 0.026 : 1.026 - ease * 0.026;
    document.documentElement.style.setProperty('--breath-bg-scale', bgScale.toFixed(4));

    // Sync ambient background canvas breathing aura directly
    if (window.sanctuaryBreathSync) {
      window.sanctuaryBreathSync.active = true;
      window.sanctuaryBreathSync.step = phaseIndex;
      window.sanctuaryBreathSync.progress = p;
      window.sanctuaryBreathSync.ease = ease;
      window.sanctuaryBreathSync.scale = phaseIndex === 0 ? 1.0 + ease * 0.46 : 1.46 - ease * 0.46;
    }

    breathAnimId = requestAnimationFrame(updateSacredBreathLoop);
  }

  // -------------------------------------------------------------------------
  // SESSION CONTROLS: START / PAUSE / SOUND TOGGLE
  // -------------------------------------------------------------------------
  function startSomaticBreath() {
    if (isBreathingActive) {
      stopSomaticBreath();
      return;
    }

    isBreathingActive = true;
    breathStartTime = performance.now();
    lastReportedCycleIndex = -1;
    lastTriggeredPhase = -1;

    const orbCard = document.querySelector('.sanctuary-orb-card');
    if (orbCard) orbCard.classList.add('active');
    if (somaticOrb) somaticOrb.classList.add('active');

    if (orbBtn) {
      orbBtn.classList.add('active');
    }
    if (orbLabel) {
      orbLabel.textContent = 'Pause';
    }
    if (btnCtrlIcon) {
      btnCtrlIcon.textContent = '⏸';
    }

    cancelAnimationFrame(breathAnimId);
    breathAnimId = requestAnimationFrame(updateSacredBreathLoop);
    showToast('🍃 Breath Orb active. Follow the gentle in and out...');
  }

  function stopSomaticBreath() {
    isBreathingActive = false;
    breathStartTime = null;
    lastTriggeredPhase = -1;
    cancelAnimationFrame(breathAnimId);

    const orbCard = document.querySelector('.sanctuary-orb-card');
    if (orbCard) orbCard.classList.remove('active');
    if (somaticOrb) somaticOrb.classList.remove('active');

    // Reset Whole-Screen Atmospheric Living Scale
    document.documentElement.style.setProperty('--breath-bg-scale', '1.0');

    if (window.sanctuaryBreathSync) {
      window.sanctuaryBreathSync.active = false;
    }

    if (somaticOrb) {
      somaticOrb.style.transform = 'scale(1.0)';
      somaticOrb.style.boxShadow = '';
    }
    if (somaticHalo) {
      somaticHalo.style.transform = 'scale(1.0)';
      somaticHalo.style.opacity = '0.35';
    }
    if (orbInnerGlow) {
      orbInnerGlow.style.transform = 'scale(1.0)';
      orbInnerGlow.style.opacity = '0.3';
    }
    if (orbBreathWord) {
      orbBreathWord.textContent = 'Breathe';
    }
    if (orbStatusPrompt) {
      orbStatusPrompt.textContent = 'Tap the orb or press begin below';
    }

    if (orbBtn) {
      orbBtn.classList.remove('active');
    }
    if (orbLabel) {
      orbLabel.textContent = 'Begin';
    }
    if (btnCtrlIcon) {
      btnCtrlIcon.textContent = '▶';
    }

    showToast('🕊️ Breath paused. Resting at center.');
  }

  // Tap directly on the Living Breath Orb or its breathing stage wrapper
  const breathingOrbStage = document.getElementById('breathing-orb-stage');
  if (breathingOrbStage) {
    breathingOrbStage.addEventListener('click', (e) => {
      // Prevent double toggle if event bubbled from somaticOrb
      if (e.target.closest('#somatic-orb') && somaticOrb) return;
      startSomaticBreath();
    });
    breathingOrbStage.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        startSomaticBreath();
      }
    });
  }

  if (somaticOrb) {
    somaticOrb.addEventListener('click', startSomaticBreath);
    somaticOrb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        startSomaticBreath();
      }
    });
  }

  // Breath Sound Toggle
  if (breathSoundBtn) {
    breathSoundBtn.addEventListener('click', () => {
      const isSoundOn = breathAudio.toggle();
      if (isSoundOn) {
        breathSoundBtn.classList.remove('muted');
        if (breathSoundIcon) breathSoundIcon.textContent = '🔊';
        if (breathSoundLabel) breathSoundLabel.textContent = 'Sound: ON';
        showToast('🔊 Soothing breath sounds enabled');
      } else {
        breathSoundBtn.classList.add('muted');
        if (breathSoundIcon) breathSoundIcon.textContent = '🔇';
        if (breathSoundLabel) breathSoundLabel.textContent = 'Sound: OFF';
        showToast('🔇 Breath sounds muted');
      }
    });
  }

  if (orbBtn) {
    orbBtn.addEventListener('click', startSomaticBreath);
  }

  // GA4 Hook on CTA Button Click
  if (breathWorkshopCtaBtn) {
    breathWorkshopCtaBtn.addEventListener('click', () => {
      fireGA4WidgetEngagement('cta_workshop_click');
      if (typeof selectIntakeTab === 'function') {
        selectIntakeTab('attendee');
      }
    });
  }

  // =========================================================================
  // 8. OUR METHOD: THE THREEFOLD RELEASE INTERACTIVE RESONANCE
  // =========================================================================
  const lsdCards = document.querySelectorAll('.lsd-focus-card, .lsdc-card');
  const frequencyMap = {
    'laughing': 528,   // Transformation & Miracles / Joy
    'singing': 639,    // Heart & Harmonious Relationships
    'dancing': 432     // Grounding & Root Earth Connection
  };

  lsdCards.forEach(card => {
    card.addEventListener('click', () => {
      const isAlreadyActive = card.classList.contains('active');
      lsdCards.forEach(c => c.classList.remove('active'));

      if (!isAlreadyActive) {
        card.classList.add('active');
        const element = card.dataset.element;
        const freq = frequencyMap[element] || 528;
        playHarmonicTone(freq, 0.9);
        createHeartFlourish();
        const titleElem = card.querySelector('.lsd-focus-title') || card.querySelector('.lsdc-title-clean') || card.querySelector('.lsdc-title');
        const title = titleElem ? titleElem.textContent.trim() : 'The Threefold Release';
        showToast(`✨ Tuning into ${title}: Giving ourselves permission to be human.`);
      }
    });
  });

  // Pure Web Audio API Harmonic Tibetan Singing Bowl Chime (Grounding Somatic Frequencies)
  function playHarmonicTone(frequency = 432, durationSec = 1.6, peakGain = 0.012) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const audioCtx = new AudioContext();
      
      // Fundamental crystal tone
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(frequency, audioCtx.currentTime);

      // Warm overtone (2.0x fundamental with subtle chorus warmth)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(frequency * 2.002, audioCtx.currentTime);

      // Lowpass filter to ensure silky warmth
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, audioCtx.currentTime);

      const now = audioCtx.currentTime;

      // Gentle attack curve (no abrupt click/ding)
      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.exponentialRampToValueAtTime(peakGain, now + 0.18);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      gain2.gain.setValueAtTime(0.0001, now);
      gain2.gain.exponentialRampToValueAtTime(peakGain * 0.18, now + 0.22);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + durationSec * 0.85);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain1);
      gain1.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + durationSec);
      osc2.stop(now + durationSec);
    } catch (e) {
      // Audio autoplay gracefully suppressed if user hasn't interacted
    }
  }

  // =========================================================================
  // 9. CALENDAR ICS GENERATOR & EVENT ACTIONS
  // =========================================================================
  const calendarBtn = document.getElementById('btn-add-calendar');
  if (calendarBtn) {
    calendarBtn.addEventListener('click', () => {
      // Generate standard iCalendar file (.ics)
      const icsData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Inner Sanctuary Wellness Foundation//Community Open Mic//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:innersanctuary-openmic-20261115@innersanctuarywellnessfoundation.org',
        'DTSTAMP:20261018T160000Z',
        'DTSTART:20261115T220000Z',
        'DTEND:20261116T000000Z',
        'SUMMARY:Community Open Mic & Pause Activations • Inner Sanctuary & SoCal Creatives',
        'DESCRIPTION:Come laugh\\, sing\\, share\\, listen\\, cry\\, create\\, or simply be. Open Mic stage + Somatic Pause Activations (botanical herbal tea\\, guided 4-4-4 breath intervals\\, 432 Hz sound bowls). No performance necessary. Just come as you are.\\n\\nMeetup Details & RSVP: https://www.meetup.com/socal-creatives-collective/events/316432286/',
        'LOCATION:Our Sanctuary Clubhouse\\, Orange County\\, CA',
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'Inner-Sanctuary-Community-Open-Mic-Nov-15-2026.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      playHarmonicTone(528, 0.7);
      createHeartFlourish();
      showToast("📅 Added to Calendar! See you on Sunday, November 15, 2026 (2–4 PM) at Our Sanctuary Clubhouse.");
    });
  }

  const meetupBtn = document.getElementById('meetup-action-btn');
  if (meetupBtn) {
    meetupBtn.addEventListener('click', () => {
      createHeartFlourish();
      showToast("✦ Connecting with our community on Meetup! Opening community group...");
    });
  }

  // =========================================================================
  // 10. "STAY IN THE LOOP" NEWSLETTER / COMMUNITY FORM (NETLIFY + FALLBACK)
  // =========================================================================
  const stayLoopForm = document.getElementById('stay-loop-form');
  if (stayLoopForm) {
    stayLoopForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('loop-name');
      const emailInput = document.getElementById('loop-email');
      const name = nameInput ? nameInput.value.trim() : 'Friend';
      const email = emailInput ? emailInput.value.trim() : '';

      const btn = stayLoopForm.querySelector('button');
      const originalText = btn ? btn.innerHTML : 'Join Our Community 🌿';
      if (btn) btn.innerHTML = '<span>Joining...</span> <span>🌿</span>';

      try {
        const formData = new FormData(stayLoopForm);
        formData.set('form-name', 'community-loop');
        await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString()
        });
      } catch (err) {
        // Fallback to formsubmit.co if running locally outside Netlify
        try {
          await fetch('https://formsubmit.co/ajax/hello@innersanctuarywellnessfoundation.org', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              name,
              email,
              type: 'Stay in the Loop Member',
              _cc: 'innersanctuary0@gmail.com',
              _subject: `New Community Member Joined: ${name} (${email}) • Inner Sanctuary`
            })
          });
        } catch (e) {}
      } finally {
        if (btn) btn.innerHTML = originalText;
      }

      playHarmonicTone(528, 1.2);
      createHeartFlourish();
      showToast(`🌿 Welcome to our sanctuary community, ${name}!`);
      stayLoopForm.reset();

      // Show inline success state
      const successBox = document.getElementById('stay-loop-success');
      if (successBox) {
        stayLoopForm.style.display = 'none';
        successBox.style.display = 'block';
      }
    });
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



  // =========================================================================
  // ARGON 4.0 MAX VISUAL & ANIMATION SUITE
  // =========================================================================
  // ==========================================================================
// ARGON 4.0 MAX VISUAL & ANIMATION SUITE SCRIPTS
// ==========================================================================

(function initArgon4Suite() {

  // ------------------------------------------------------------------------
  // 1. PRELOADED ZEFFY QUICK DONATE MODAL
  // ------------------------------------------------------------------------
  const modal = document.getElementById('ZeffyQuickDonateModal');
  const modalIframe = document.getElementById('zeffy-modal-iframe');
  const ZEFFY_FORM_EMBED = 'https://www.zeffy.com/embed/donation-form/donate-to-make-a-difference-inner-sanctuary-wellness-foundation';
  const ZEFFY_THERMO_EMBED = 'https://www.zeffy.com/en-US/live/thermometer/donate-to-make-a-difference-inner-sanctuary-wellness-foundation';
  const ZEFFY_DIRECT_URL = 'https://www.zeffy.com/donation-form/donate-to-make-a-difference-inner-sanctuary-wellness-foundation';

  function openZeffyModal(e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
    const targetModal = document.getElementById('ZeffyQuickDonateModal');
    if (!targetModal) return;

    const iframe = document.getElementById('zeffy-modal-iframe');
    if (iframe && (!iframe.src || iframe.src === 'about:blank' || !iframe.src.includes('zeffy.com/embed/donation-form/'))) {
      iframe.src = ZEFFY_FORM_EMBED;
    }

    targetModal.style.display = 'flex';
    // Trigger reflow for CSS transition
    void targetModal.offsetWidth;
    targetModal.classList.add('is-open');
    targetModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeZeffyModal() {
    const targetModal = document.getElementById('ZeffyQuickDonateModal');
    if (!targetModal) return;

    targetModal.classList.remove('is-open');
    targetModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!targetModal.classList.contains('is-open')) {
        targetModal.style.display = 'none';
      }
    }, 320);
  }

  window.openZeffyModal = openZeffyModal;
  window.closeZeffyModal = closeZeffyModal;

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeZeffyModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeZeffyModal();
      }
    });
  }

  // ------------------------------------------------------------------------
  // 2. FORCE-REWIRE EXISTING DONATE BUTTONS (EXCEPT DIRECT OUTBOUND LINKS)
  // ------------------------------------------------------------------------
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('a, button');
    if (!trigger) return;

    // Never intercept direct outbound checkout links or explicitly bypassed controls
    if (trigger.classList.contains('zeffy-direct-link')) return;
    if (trigger.getAttribute('target') === '_blank') return;
    if (trigger.classList.contains('zeffy-bypass-modal')) return;

    // Skip intake tabs, form submits, soundscape/breath controls, close buttons, tab switchers
    if (trigger.classList.contains('intake-tab')) return;
    if (trigger.type === 'submit' && trigger.closest('form')) return;
    if (trigger.id === 'mobile-nav-toggle' || trigger.closest('#mobile-nav-toggle')) return;
    if (trigger.closest('.soundscape-controls-wrap') || trigger.closest('.weekly-soundscape-action-wrap')) return;
    if (trigger.closest('#orb-toggle-btn') || trigger.closest('#breath-sound-toggle-btn')) return;
    if (trigger.classList.contains('donate-tab-btn') || trigger.closest('.donate-tab-switcher')) return;
    if (trigger.classList.contains('zeffy-modal-close') || trigger.closest('.zeffy-modal-close')) return;
    if (trigger.classList.contains('preset-chip')) return;
    if (trigger.classList.contains('seed-chip-btn') || trigger.classList.contains('seed-freq-btn')) return;
    if (trigger.id === 'breath-workshop-cta-btn') return;

    const href = trigger.getAttribute('href') || '';
    const text = (trigger.textContent || '').trim();

    const isZeffyHref = href.includes('zeffy.com');
    const isDonateHash = href === '#circle-growth' || href === '#dollar-campaign-anchor' || href === '#donate';
    const hasDonateKeywords = /\b(donate|support the foundation|support this initiative|\$1 seed movement|\$1\/month|join the \$1\/month)\b/i.test(text);
    const hasExplicitTrigger = trigger.classList.contains('zeffy-trigger') || trigger.classList.contains('btn-open-zeffy');

    if (isZeffyHref || hasExplicitTrigger || (isDonateHash && hasDonateKeywords)) {
      e.preventDefault();
      e.stopPropagation();
      openZeffyModal();
    }
  }, true);

  // ------------------------------------------------------------------------
  // 2B. NATIVE SEED KEYPAD LOGIC (100% RELIABLE, ZERO BROKEN IFRAMES)
  // ------------------------------------------------------------------------
  let currentSeedFreq = 'monthly';
  let currentSeedAmount = 1;

  window.selectSeedFreq = function(freq) {
    currentSeedFreq = freq;
    const btnMonthly = document.getElementById('seed-freq-monthly');
    const btnOnce = document.getElementById('seed-freq-once');
    if (btnMonthly && btnOnce) {
      if (freq === 'monthly') {
        btnMonthly.classList.add('active');
        btnOnce.classList.remove('active');
      } else {
        btnOnce.classList.add('active');
        btnMonthly.classList.remove('active');
      }
    }
    updateSeedPayButton();
  };

  window.selectSeedAmount = function(amount) {
    currentSeedAmount = amount;
    [1, 5, 10, 25].forEach(amt => {
      const chip = document.getElementById('chip-' + amt);
      if (chip) {
        if (amt === amount) chip.classList.add('active');
        else chip.classList.remove('active');
      }
    });

    const impactText = document.getElementById('seed-impact-text');
    if (impactText) {
      if (amount === 1) {
        impactText.innerHTML = '✨ <strong>100% Community Pass-Through:</strong> $1/month covers 1 free trauma-informed youth healing journal and subsidizes community somatic seats. 0% deducted by Zeffy.';
      } else if (amount === 5) {
        impactText.innerHTML = '✨ <strong>Supporter Impact:</strong> $5 provides trauma-informed reflection kits and sound healing equipment upkeep for our monthly community open mic.';
      } else if (amount === 10) {
        impactText.innerHTML = '✨ <strong>Caregiver Impact:</strong> $10 funds full somatic workshop materials and unhurried meditation supplies for vulnerable creatives.';
      } else {
        impactText.innerHTML = '✨ <strong>Sanctuary Pillar:</strong> $25 anchors our venue safety, artist travel subsidies, and community wellness stipends with 100% fiduciary transparency.';
      }
    }
    updateSeedPayButton();
  };

  function updateSeedPayButton() {
    const payLabel = document.getElementById('seed-pay-btn-label');
    if (!payLabel) return;
    const freqLabel = currentSeedFreq === 'monthly' ? 'Monthly Seed' : 'Gift';
    payLabel.textContent = `🌱 Plant $${currentSeedAmount} ${freqLabel} (Apple Pay • Google Pay)`;
  }

  window.toggleEmbeddedZeffy = function() {
    const wrap = document.getElementById('zeffy-inline-embed-wrap');
    const iframe = document.getElementById('inpage-zeffy-iframe');
    const toggleText = document.getElementById('embed-toggle-text');
    if (!wrap) return;

    if (wrap.style.display === 'none' || !wrap.style.display) {
      wrap.style.display = 'block';
      if (toggleText) toggleText.textContent = '▴ Hide embedded checkout frame';
      if (iframe && iframe.getAttribute('data-src') && (!iframe.src || iframe.src === 'about:blank')) {
        iframe.src = iframe.getAttribute('data-src');
      }
    } else {
      wrap.style.display = 'none';
      if (toggleText) toggleText.textContent = '▾ Or preview embedded checkout frame directly in-card';
    }
  };

  // ------------------------------------------------------------------------
  // 3. 2-TAB SWITCHER IN #donate (KEYPAD vs THERMOMETER)
  // ------------------------------------------------------------------------
  window.switchDonateTab = function(tabName) {
    const btnKeypad = document.getElementById('tab-btn-keypad');
    const btnThermo = document.getElementById('tab-btn-thermometer');
    const paneKeypad = document.getElementById('donate-pane-keypad');
    const paneThermo = document.getElementById('donate-pane-thermometer');
    const thermoIframe = document.getElementById('inpage-thermometer-iframe');

    if (tabName === 'thermometer') {
      if (btnKeypad) {
        btnKeypad.classList.remove('active');
        btnKeypad.setAttribute('aria-selected', 'false');
      }
      if (btnThermo) {
        btnThermo.classList.add('active');
        btnThermo.setAttribute('aria-selected', 'true');
      }
      if (paneKeypad) paneKeypad.style.display = 'none';
      if (paneThermo) {
        paneThermo.style.display = 'block';
        if (thermoIframe && (!thermoIframe.src || thermoIframe.src === 'about:blank')) {
          thermoIframe.src = ZEFFY_THERMO_EMBED;
        }
      }
    } else {
      if (btnThermo) {
        btnThermo.classList.remove('active');
        btnThermo.setAttribute('aria-selected', 'false');
      }
      if (btnKeypad) {
        btnKeypad.classList.add('active');
        btnKeypad.setAttribute('aria-selected', 'true');
      }
      if (paneThermo) paneThermo.style.display = 'none';
      if (paneKeypad) paneKeypad.style.display = 'block';
    }
  };

  // ------------------------------------------------------------------------
  // 4. INTERACTIVE $1/MONTH COMMUNITY POWER SLIDER
  // ------------------------------------------------------------------------
  const powerSlider = document.getElementById('power-members-slider');
  const countEl = document.getElementById('power-slider-count');
  const monthlyFuelEl = document.getElementById('metric-monthly-fuel');
  const annualTotalEl = document.getElementById('metric-annual-total');
  const journalsEl = document.getElementById('metric-journals-funded');
  const presetChips = document.querySelectorAll('.preset-chip');

  function updateCommunityPower(members) {
    const num = parseInt(members, 10) || 50;
    if (countEl) countEl.textContent = `${num.toLocaleString()} Members`;
    if (monthlyFuelEl) monthlyFuelEl.textContent = `$${num.toLocaleString()}`;
    if (annualTotalEl) annualTotalEl.textContent = `$${(num * 12).toLocaleString()}`;
    if (journalsEl) journalsEl.textContent = `${(num * 3).toLocaleString()}`;

    if (powerSlider) {
      powerSlider.value = num;
      const min = parseInt(powerSlider.min, 10) || 50;
      const max = parseInt(powerSlider.max, 10) || 1000;
      const percent = ((num - min) / (max - min)) * 100;
      powerSlider.style.background = `linear-gradient(to right, #9A6F1A 0%, #D4A84F ${percent}%, #D5DFD8 ${percent}%, #D5DFD8 100%)`;
    }

    presetChips.forEach(chip => {
      const chipVal = parseInt(chip.getAttribute('data-value'), 10);
      if (chipVal === num) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  window.setSliderValue = function(val) {
    updateCommunityPower(val);
  };

  if (powerSlider) {
    powerSlider.addEventListener('input', (e) => {
      updateCommunityPower(e.target.value);
    });
    powerSlider.addEventListener('change', (e) => {
      updateCommunityPower(e.target.value);
    });
    // Initial run
    updateCommunityPower(powerSlider.value || 250);
  }

  // ------------------------------------------------------------------------
  // 5. FIXED GOLDEN HOUR BOTANICAL DUST MOTES CANVAS (#argon-dust-canvas)
  // ------------------------------------------------------------------------
  const dustCanvas = document.getElementById('argon-dust-canvas');
  if (dustCanvas) {
    const dctx = dustCanvas.getContext('2d');
    let dWidth = dustCanvas.width = window.innerWidth;
    let dHeight = dustCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      dWidth = dustCanvas.width = window.innerWidth;
      dHeight = dustCanvas.height = window.innerHeight;
    });

    const moteCount = Math.min(65, Math.floor((dWidth * dHeight) / 22000));
    const motes = [];
    const colors = [
      'rgba(212, 168, 79, ',  // Burnished gold
      'rgba(248, 217, 140, ', // Sunburst gold
      'rgba(154, 111, 26, ',  // Deep bronze gold
      'rgba(255, 246, 219, '  // Golden cream
    ];

    for (let i = 0; i < moteCount; i++) {
      motes.push({
        x: Math.random() * dWidth,
        y: Math.random() * dHeight,
        radius: 1.2 + Math.random() * 2.8,
        baseAlpha: 0.15 + Math.random() * 0.45,
        alpha: 0.2,
        colorPrefix: colors[Math.floor(Math.random() * colors.length)],
        vy: -(0.25 + Math.random() * 0.55), // Drift upward
        vx: (Math.random() - 0.5) * 0.35,
        pulseSpeed: 0.015 + Math.random() * 0.03,
        pulseOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.008 + Math.random() * 0.015,
        swayOffset: Math.random() * Math.PI * 2
      });
    }

    let lastTime = performance.now();
    function animateDust(now) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      dctx.clearRect(0, 0, dWidth, dHeight);

      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.y += m.vy;
        m.x += m.vx + Math.sin(now * m.swaySpeed + m.swayOffset) * 0.3;

        // Wrap around borders
        if (m.y < -10) {
          m.y = dHeight + 10;
          m.x = Math.random() * dWidth;
        }
        if (m.x < -10) m.x = dWidth + 10;
        if (m.x > dWidth + 10) m.x = -10;

        // Pulsing glow
        const currentAlpha = m.baseAlpha * (0.65 + 0.35 * Math.sin(now * m.pulseSpeed + m.pulseOffset));

        dctx.beginPath();
        dctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        dctx.fillStyle = m.colorPrefix + currentAlpha + ')';
        dctx.fill();

        // Subtle soft halo
        if (m.radius > 2.0) {
          dctx.beginPath();
          dctx.arc(m.x, m.y, m.radius * 2.2, 0, Math.PI * 2);
          dctx.fillStyle = m.colorPrefix + (currentAlpha * 0.25) + ')';
          dctx.fill();
        }
      }

      requestAnimationFrame(animateDust);
    }
    requestAnimationFrame(animateDust);
  }

  // ------------------------------------------------------------------------
  // 6. SCROLL REVEAL (cubic-bezier(0.16, 1, 0.3, 1))
  // ------------------------------------------------------------------------
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      el.classList.add('is-visible');
    });
  }

})();



  // =========================================================================
  // PARTNER WITH US: TIER FREQUENCY SELECTION & SPONSORSHIP INTAKE
  // =========================================================================
  const tierConfigData = {
    friend: {
      name: 'Community Friend',
      onetime: {
        priceHtml: '$250 <span style="font-size: 0.78rem; font-weight: 600; color: #526359;">One-Time • 1 Event</span>',
        desc: '<strong>One-Time — $250:</strong> Sponsor one community event.',
        btnText: 'Select One-Time ($250) →',
        roleVal: 'Community Friend — One-Time ($250)',
        message: 'I would like to sponsor as a Community Friend (One-Time — $250) to sponsor one community gathering. Please send partnership agreement and invoice details.'
      },
      quarterly: {
        priceHtml: '$250 <span style="font-size: 0.78rem; font-weight: 600; color: #526359;">/ qtr • $1,000/yr</span>',
        desc: '<strong>Quarterly — $250/qtr:</strong> Sponsor all four quarterly events throughout the year ($1,000 annually). Once every 3 months.',
        btnText: 'Select Quarterly ($250/qtr) →',
        roleVal: 'Community Friend — Quarterly ($250/qtr)',
        message: 'I would like to partner as a quarterly Community Friend ($250 per quarter / $1,000 annually, billed once every three months) sponsoring all four quarterly community events throughout the year. Please send partnership agreement and coordination details.'
      }
    },
    builder: {
      name: 'Community Builder',
      onetime: {
        priceHtml: '$500 <span style="font-size: 0.78rem; font-weight: 600; color: #526359;">One-Time • 1 Event</span>',
        desc: '<strong>One-Time — $500:</strong> Sponsor one community event.',
        btnText: 'Select One-Time ($500) →',
        roleVal: 'Community Builder — One-Time ($500)',
        message: 'I would like to sponsor as a Community Builder (One-Time — $500) to sponsor one community gathering. Please send partnership agreement and invoice details.'
      },
      quarterly: {
        priceHtml: '$500 <span style="font-size: 0.78rem; font-weight: 600; color: #526359;">/ qtr • $2,000/yr</span>',
        desc: '<strong>Quarterly — $500/qtr:</strong> Sponsor all four quarterly events throughout the year ($2,000 annually). Once every 3 months.',
        btnText: 'Select Quarterly ($500/qtr) →',
        roleVal: 'Community Builder — Quarterly ($500/qtr)',
        message: 'I would like to partner as a quarterly Community Builder ($500 per quarter / $2,000 annually, billed once every three months) sponsoring all four quarterly community events throughout the year. Please send partnership agreement and coordination details.'
      }
    },
    champion: {
      name: 'Community Champion',
      onetime: {
        priceHtml: '$1,000 <span style="font-size: 0.78rem; font-weight: 600; color: #526359;">One-Time • 1 Event</span>',
        desc: '<strong>One-Time — $1,000:</strong> Sponsor one community event.',
        btnText: 'Select One-Time ($1,000) →',
        roleVal: 'Community Champion — One-Time ($1,000)',
        message: 'I would like to sponsor as a Community Champion (One-Time — $1,000) to sponsor one community gathering. Please send our corporate / CRA due diligence packet and invoice details.'
      },
      quarterly: {
        priceHtml: '$1,000 <span style="font-size: 0.78rem; font-weight: 600; color: #526359;">/ qtr • $4,000/yr</span>',
        desc: '<strong>Quarterly — $1,000/qtr:</strong> Sponsor all four quarterly events throughout the year ($4,000 annually). Once every 3 months.',
        btnText: 'Select Quarterly ($1,000/qtr) →',
        roleVal: 'Community Champion — Quarterly ($1,000/qtr)',
        message: 'I would like to partner as a quarterly Community Champion ($1,000 per quarter / $4,000 annually, billed once every three months) sponsoring all four quarterly community events throughout the year. Please send our corporate / CRA due diligence packet and coordination details.'
      }
    },
    inkind: {
      name: 'In-Kind Community Partner',
      onetime: {
        priceHtml: '$25+ <span style="font-size: 0.78rem; font-weight: 600; color: #526359;">Est. Value • 1 Event</span>',
        desc: '<strong>One-Time Contribution:</strong> Donate goods or services for one event, with an estimated value starting at $25.',
        btnText: 'Pledge In-Kind ($25+) →',
        roleVal: 'In-Kind Partner — One-Time ($25+ value)',
        message: 'I would like to contribute as an In-Kind Community Partner (One-Time, est. $25+ value) for an upcoming community gathering. Details of goods, refreshments, supplies, or services we wish to provide:'
      },
      quarterly: {
        priceHtml: '$25+ <span style="font-size: 0.78rem; font-weight: 600; color: #526359;">/ qtr • 4 Events</span>',
        desc: '<strong>Quarterly Contribution:</strong> Provide goods or services for each of our four quarterly events, with an estimated value starting at $25 per quarter (once every 3 months).',
        btnText: 'Pledge Quarterly In-Kind →',
        roleVal: 'In-Kind Partner — Quarterly ($25+/qtr value)',
        message: 'I would like to contribute as an In-Kind Community Partner (Quarterly, est. $25+ value per quarter across all 4 quarterly gatherings). Details of goods, refreshments, supplies, or services we wish to provide:'
      }
    }
  };

  const activeTierFrequencies = {
    friend: 'onetime',
    builder: 'onetime',
    champion: 'onetime',
    inkind: 'onetime'
  };

  window.setTierFrequency = function(tierKey, freqKey) {
    if (!tierConfigData[tierKey] || !tierConfigData[tierKey][freqKey]) return;
    activeTierFrequencies[tierKey] = freqKey;

    const card = document.getElementById('tier-card-' + tierKey);
    if (card) {
      const btns = card.querySelectorAll('.tier-freq-btn');
      btns.forEach(btn => {
        const isTarget = btn.textContent.trim().toLowerCase().includes(freqKey === 'onetime' ? 'one-time' : 'quarterly');
        btn.classList.toggle('active', isTarget);
      });
    }

    const priceEl = document.getElementById('tier-price-' + tierKey);
    if (priceEl) priceEl.innerHTML = tierConfigData[tierKey][freqKey].priceHtml;

    const descEl = document.getElementById('tier-desc-' + tierKey);
    if (descEl) descEl.innerHTML = tierConfigData[tierKey][freqKey].desc;

    const btnEl = document.getElementById('tier-btn-' + tierKey);
    if (btnEl) btnEl.innerHTML = tierConfigData[tierKey][freqKey].btnText;
  };

  window.selectSponsorshipPackage = function(tierKey) {
    const freqKey = activeTierFrequencies[tierKey] || 'onetime';
    const config = tierConfigData[tierKey] && tierConfigData[tierKey][freqKey];
    if (!config) return;

    // 1. Select the appropriate intake tab
    if (typeof selectIntakeTab === 'function') {
      selectIntakeTab(tierKey === 'inkind' ? 'raffle' : 'sponsor');
    }

    // 2. Select matching role in dropdown
    const roleSelect = document.getElementById('role-select');
    if (roleSelect) {
      let found = false;
      for (let i = 0; i < roleSelect.options.length; i++) {
        if (roleSelect.options[i].value === config.roleVal || roleSelect.options[i].text.includes(config.roleVal)) {
          roleSelect.selectedIndex = i;
          found = true;
          break;
        }
      }
      if (!found) {
        const newOpt = new Option(config.roleVal, config.roleVal, true, true);
        roleSelect.add(newOpt);
      }
    }

    // 3. Prefill message
    const msgEl = document.getElementById('form-message');
    if (msgEl) {
      msgEl.value = config.message;
      msgEl.focus();
    }

    // 4. Smooth scroll to form
    const formSection = document.getElementById('connect');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // =========================================================================
  // SANCTUARY SOMATIC ORACLE & REFLECTION CARD (INTERACTIVE 3D FLIP + SYNTHESIS)
  // =========================================================================
  const SOMATIC_ORACLE_DB = {
    earth: [
      {
        badge: "✦ EARTH • ROOT ME ✦",
        theme: "Root Me",
        element: "earth",
        quote: "Where in your body are you holding yesterday? Soften your jaw, drop your heavy shoulders into gravity, and let this breath belong only to right now.",
        freq: 432
      },
      {
        badge: "✦ EARTH • GROUNDING TO BONE ✦",
        theme: "Root Me",
        element: "earth",
        quote: "Feel the undeniable support of the floor beneath you. The Earth is not asking you to hold yourself up alone; let your weight settle completely.",
        freq: 432
      },
      {
        badge: "✦ EARTH • QUIET TRUST ✦",
        theme: "Root Me",
        element: "earth",
        quote: "A seed does not question the dark soil before it sprouts. Trust the quiet, unhurried root system forming beneath what the eye can see.",
        freq: 432
      },
      {
        badge: "✦ EARTH • UNBURDENING ✦",
        theme: "Root Me",
        element: "earth",
        quote: "You do not have to perform peace to be worthy of it. Let your feet be heavy, your belly soften, and simply exist without explanation for five minutes.",
        freq: 432
      }
    ],
    water: [
      {
        badge: "✦ WATER • WASH CLEAN ✦",
        theme: "Wash Clean",
        element: "water",
        quote: "Water never forces its way through stone; it simply softens, flows, and finds the opening. Soften the walls around your heart and let your breath flow freely.",
        freq: 528
      },
      {
        badge: "✦ WATER • EMOTIONAL RELEASE ✦",
        theme: "Wash Clean",
        element: "water",
        quote: "Tears and grief are not signs of brokenness; they are the ocean within you returning to equilibrium. Let whatever needs to flow, wash cleanly through you.",
        freq: 528
      },
      {
        badge: "✦ WATER • GENTLE COMPASSION ✦",
        theme: "Wash Clean",
        element: "water",
        quote: "What would feel 5% softer in your chest and throat right now? Drink a slow sip of cool water and give yourself that gentle 5%.",
        freq: 528
      },
      {
        badge: "✦ WATER • INNER CLEANSING ✦",
        theme: "Wash Clean",
        element: "water",
        quote: "You do not need to carry the emotional tides of everyone around you. Exhale what was never yours to hold and return to your clear, sacred stream.",
        freq: 528
      }
    ],
    air: [
      {
        badge: "✦ AIR • CLEAR CHEST ✦",
        theme: "Clear Chest",
        element: "air",
        quote: "Name one urgent expectation you have permission to set down today. Notice the wide, breezy breath that rushes in to fill that sacred space.",
        freq: 639
      },
      {
        badge: "✦ AIR • UNHURRIED RHYTHM ✦",
        theme: "Clear Chest",
        element: "air",
        quote: "Your healing does not have to be hurried. The wind does not rush the changing leaves; everything unfolds in its own effortless season.",
        freq: 639
      },
      {
        badge: "✦ AIR • EXPANSIVE PRESENCE ✦",
        theme: "Clear Chest",
        element: "air",
        quote: "Breathe in permission. Exhale performance. You are already whole, complete, and welcome in this exact heartbeat.",
        freq: 639
      },
      {
        badge: "✦ AIR • COLLARBONE RELEASE ✦",
        theme: "Clear Chest",
        element: "air",
        quote: "Lift your chin slightly and feel the air widen across your collarbones. The storm in your thoughts is just weather; you are the vast sky it passes through.",
        freq: 639
      }
    ],
    fire: [
      {
        badge: "✦ FIRE • IGNITE JOY ✦",
        theme: "Ignite Joy",
        element: "fire",
        quote: "Sing when words fail. Laugh when tension crests. Dance when the body needs to remember it is sovereign, vibrant, and alive.",
        freq: 741
      },
      {
        badge: "✦ FIRE • SOVEREIGN SPARK ✦",
        theme: "Ignite Joy",
        element: "fire",
        quote: "Even beneath deep exhaustion, your inner ember remains unquenched. Fan it not with forceful effort, but with unhurried joy and creative play.",
        freq: 741
      },
      {
        badge: "✦ FIRE • EMOTIONAL TRUTH ✦",
        theme: "Ignite Joy",
        element: "fire",
        quote: "Raw authenticity is a sacred flame. You do not need to dull your light or pretend to be small to keep the peace of others.",
        freq: 741
      },
      {
        badge: "✦ FIRE • VITAL WARMTH ✦",
        theme: "Ignite Joy",
        element: "fire",
        quote: "Place your hand over your solar plexus and inhale golden warmth. You have survived every cold winter; your spring fire is stirring.",
        freq: 741
      }
    ],
    ether: [
      {
        badge: "✦ ETHER • INFINITE SPACE ✦",
        theme: "Infinite Space",
        element: "ether",
        quote: "The peace you are searching for is not something to be earned or manufactured; it is the silent, sacred space underneath all the noise.",
        freq: 852
      },
      {
        badge: "✦ ETHER • SACRED WITNESS ✦",
        theme: "Infinite Space",
        element: "ether",
        quote: "Close your eyes for one deep cycle. You are not just a body surviving a busy world; you are the timeless consciousness experiencing it.",
        freq: 852
      },
      {
        badge: "✦ ETHER • COLLECTIVE SANCTUARY ✦",
        theme: "Infinite Space",
        element: "ether",
        quote: "When the horizon feels overwhelming, remember: we are all breathing from the very same sky. You are never alone in this sanctuary.",
        freq: 852
      },
      {
        badge: "✦ ETHER • BOUNDLESS STILLNESS ✦",
        theme: "Infinite Space",
        element: "ether",
        quote: "In the stillness between your inhale and your exhale lies your true home. Step into that gap and rest without time.",
        freq: 852
      }
    ]
  };

  // Flattened array for backwards compatibility
  const SANCTUARY_REFLECTIONS = [
    ...SOMATIC_ORACLE_DB.earth,
    ...SOMATIC_ORACLE_DB.water,
    ...SOMATIC_ORACLE_DB.air,
    ...SOMATIC_ORACLE_DB.fire,
    ...SOMATIC_ORACLE_DB.ether
  ];

  let currentReflectionIndex = 0;
  let activeSomaticElement = 'earth';
  window.activeOracleReflection = null;

  function synthesizeSomaticReflection(input) {
    const clean = (input || '').trim();
    const lower = clean.toLowerCase();

    // 1. Circadian / Time-of-Day Somatic Calibration
    const hour = new Date().getHours();
    let timeOfDayAnchor = '';
    let circadianPill = 'TWILIGHT HARBOR';

    if (hour >= 5 && hour < 12) {
      circadianPill = 'MORNING AWAKENING';
      timeOfDayAnchor = 'As morning light opens this day, you do not have to rush ahead of your breath.';
    } else if (hour >= 12 && hour < 17) {
      circadianPill = 'MIDDAY HARBOR';
      timeOfDayAnchor = 'In the middle of the world\'s hurry, this pause is your sacred anchor.';
    } else if (hour >= 17 && hour < 22) {
      circadianPill = 'EVENING RELEASE';
      timeOfDayAnchor = 'As twilight settles over Our Sanctuary Clubhouse, let down what was carried today.';
    } else {
      circadianPill = 'NIGHT SOLITUDE';
      timeOfDayAnchor = 'In the quiet stillness of the night, your nervous system is safe to rest deeply.';
    }

    // 2. Multimodal Somatic Resonance Mapping
    let targetElement = 'earth';
    let badgeTheme = 'ROOT ME';
    let freq = 432;
    let somaticAction = '';
    let affirmation = '';

    if (lower.includes('water') || lower.includes('cry') || lower.includes('grief') || lower.includes('sad') || lower.includes('heart') || lower.includes('tear') || lower.includes('soft') || lower.includes('emotional') || lower.includes('hurt')) {
      targetElement = 'water';
      badgeTheme = 'HELD IN SOFTNESS';
      freq = 528;
      somaticAction = 'Unclench your jaw, soften the muscles behind your eyes, and place both palms gently over your heart.';
      affirmation = `Tending to ${clean || 'this tender feeling'} is not weakness; it is your soul returning to truth. Breathe out without needing to be strong right now.`;
    } else if (lower.includes('air') || lower.includes('breath') || lower.includes('anxi') || lower.includes('rush') || lower.includes('busy') || lower.includes('overwhelm') || lower.includes('mind') || lower.includes('think') || lower.includes('worry')) {
      targetElement = 'air';
      badgeTheme = 'CLEAR CHEST & SKY';
      freq = 639;
      somaticAction = 'Lift your collarbones slightly, drop your tongue from the roof of your mouth, and exhale a long, slow sigh.';
      affirmation = `Carrying ${clean || 'a racing mind'} makes the world feel narrow. You are not the storm of thoughts—you are the vast, unhurried sky they pass through.`;
    } else if (lower.includes('fire') || lower.includes('tired') || lower.includes('exhaust') || lower.includes('burnout') || lower.includes('numb') || lower.includes('stuck') || lower.includes('spark') || lower.includes('joy') || lower.includes('creative') || lower.includes('passion')) {
      targetElement = 'fire';
      badgeTheme = 'SOVEREIGN EMBER';
      freq = 741;
      somaticAction = 'Place a warm palm over your solar plexus and feel your ribs expand like wings with each breath.';
      affirmation = `Even beneath ${clean || 'deep fatigue'}, your sacred inner ember remains unquenched. You do not need to perform or produce to be worthy of joy.`;
    } else if (lower.includes('ether') || lower.includes('lost') || lower.includes('spirit') || lower.includes('peace') || lower.includes('alone') || lower.includes('space') || lower.includes('silent') || lower.includes('still')) {
      targetElement = 'ether';
      badgeTheme = 'BOUNDLESS SPACE';
      freq = 852;
      somaticAction = 'Close your eyes for one complete cycle. Drop into the quiet gap between your inhale and exhale.';
      affirmation = `Surrendering to ${clean || 'this quiet space'} dissolves the illusion of separation. You are rooted in this community, held by the infinite cosmos.`;
    } else {
      targetElement = 'earth';
      badgeTheme = 'EARTH PRESENCE';
      freq = 432;
      somaticAction = 'Feel the solid ground under your feet. Let gravity carry the physical weight of your shoulders.';
      affirmation = `Meeting ${clean || 'this exact moment'} requires zero force. You are allowed to take up space, slow down, and simply be here.`;
    }

    const synthesizedQuote = `${timeOfDayAnchor} ${somaticAction} ${affirmation}`;

    return {
      badge: `✦ GEMINI • ${circadianPill} • ${badgeTheme} ✦`,
      theme: badgeTheme,
      element: targetElement,
      quote: synthesizedQuote,
      freq: freq
    };
  }

  function initSanctuaryReflectionWidget() {
    const card3D = document.getElementById('reflectionCard3D');
    const badgeElem = document.getElementById('reflectionCardBadge');
    const quoteElem = document.getElementById('reflectionCardQuote');
    const btnDraw = document.getElementById('btnDrawNewReflection');
    const btnCopy = document.getElementById('btnCopyReflection');
    const btnShareIG = document.getElementById('btnShareIG');
    const toast = document.getElementById('reflectionCopyToast');
    const pills = document.querySelectorAll('.somatic-pill, .somatic-chip');
    const customInput = document.getElementById('somaticCustomInput');
    const btnConsult = document.getElementById('btnOracleGenerate');

    if (!card3D || !badgeElem || !quoteElem) return;

    function applyReflectionItem(item) {
      window.activeOracleReflection = item;
      badgeElem.textContent = item.badge;
      quoteElem.textContent = `"${item.quote}"`;

      // Trigger luminous shimmer pulse
      card3D.classList.remove('shimmer-pulse');
      void card3D.offsetWidth;
      card3D.classList.add('shimmer-pulse');
      setTimeout(() => card3D.classList.remove('shimmer-pulse'), 850);

      // Keep IG Story cache fresh
      window.currentStoryData = {
        quote: item.quote,
        badge: item.badge,
        source: "— Inner Sanctuary Sparks",
        filename: "inner-sanctuary-sparks.png"
      };
    }

    function applyReflection(index) {
      currentReflectionIndex = index;
      const item = SANCTUARY_REFLECTIONS[index];
      applyReflectionItem(item);
    }

    // Initialize with a fresh, living Sanctuary Spark each time the site is opened
    const initialRandomIndex = Math.floor(Math.random() * SANCTUARY_REFLECTIONS.length);
    applyReflection(initialRandomIndex);

    // Wire Elemental Pills/Chips if present
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        pills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');

        const elKey = pill.getAttribute('data-element') || 'earth';
        const freq = parseFloat(pill.getAttribute('data-freq')) || 432;
        activeSomaticElement = elKey;

        // Play element solfeggio harmonic
        playHarmonicTone(freq, 1.0, 0.02);

        // Pick reflection from that element
        const pool = SOMATIC_ORACLE_DB[elKey] || SOMATIC_ORACLE_DB.earth;
        const randomItem = pool[Math.floor(Math.random() * pool.length)];

        // Flip card smoothly if closed, or flash if open
        card3D.classList.add('is-flipped');
        applyReflectionItem(randomItem);
      });
    });

    // Wire Custom Feeling Input & Gemini Generate Button
    function handleCustomConsult() {
      const val = customInput ? customInput.value.trim() : '';
      if (!val) {
        showToast('🌿 Please share how your body feels to generate your Sanctuary Spark.');
        if (customInput) customInput.focus();
        return;
      }

      const btnText = document.getElementById('oracleBtnText');
      if (btnText) btnText.textContent = '✨ Gemini Breathing...';

      setTimeout(() => {
        const synthesized = synthesizeSomaticReflection(val);
        activeSomaticElement = synthesized.element;

        // Play matching solfeggio tone
        playHarmonicTone(synthesized.freq, 1.2, 0.02);

        // Flip card and display
        card3D.classList.add('is-flipped');
        applyReflectionItem(synthesized);

        createHeartFlourish();
        showToast('✨ Gemini Sanctuary Spark generated. Take a deep breath with your reflection.');
        if (customInput) customInput.value = '';
        if (btnText) btnText.textContent = '✨ Generate with Gemini';
      }, 300);
    }

    if (btnConsult) {
      btnConsult.addEventListener('click', handleCustomConsult);
    }
    if (customInput) {
      customInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCustomConsult();
        }
      });
    }

    // Tapping the card flips it
    card3D.addEventListener('click', () => {
      card3D.classList.toggle('is-flipped');
      playHarmonicTone(528, 0.8, 0.015);
    });

    card3D.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card3D.classList.toggle('is-flipped');
        playHarmonicTone(528, 0.8, 0.015);
      }
    });

    // Draw another Sanctuary Spark from curated deck
    if (btnDraw) {
      btnDraw.addEventListener('click', (e) => {
        e.stopPropagation();
        card3D.classList.remove('is-flipped');
        playHarmonicTone(432, 0.6, 0.015);

        setTimeout(() => {
          const nextItem = SANCTUARY_REFLECTIONS[Math.floor(Math.random() * SANCTUARY_REFLECTIONS.length)];
          applyReflectionItem(nextItem);
          card3D.classList.add('is-flipped');
          playHarmonicTone(nextItem.freq || 528, 1.0, 0.02);
          showToast('✨ Drew another Sanctuary Spark.');
        }, 300);
      });
    }

    // Copy Reflection to clipboard
    if (btnCopy) {
      btnCopy.addEventListener('click', (e) => {
        e.stopPropagation();
        const activeQuote = quoteElem.textContent.replace(/^"|"$/g, '').trim();
        const activeBadge = badgeElem.textContent.trim();
        const shareText = `"${activeQuote}"\n\n${activeBadge}\n— Inner Sanctuary Sparks • @ourinnersanctuary\nhttps://ourinnersanctuary.org`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareText).then(() => {
            showCopyFeedback();
          }).catch(() => {
            fallbackCopy(shareText);
          });
        } else {
          fallbackCopy(shareText);
        }
      });
    }

    // Share to Instagram
    if (btnShareIG) {
      btnShareIG.addEventListener('click', (e) => {
        if (typeof window.openStorySnapshotFromReflection === 'function') {
          window.openStorySnapshotFromReflection(e);
        }
      });
    }

    function fallbackCopy(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        showCopyFeedback();
      } catch (err) {
        showToast('Copied reflection to clipboard!');
      }
      document.body.removeChild(textarea);
    }

    function showCopyFeedback() {
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
      }
      showToast('✓ Reflection copied to clipboard! Ready to paste into Instagram Story or journal.');
    }
  }

  // =========================================================================
  // LIVE OPEN MIC COUNTDOWN TIMER (OUR SANCTUARY CLUBHOUSE GATHERING)
  // =========================================================================
  function initOpenMicCountdown() {
    const daysEl = document.getElementById('countdownDays');
    const hoursEl = document.getElementById('countdownHours');
    const minutesEl = document.getElementById('countdownMinutes');
    const secondsEl = document.getElementById('countdownSeconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    // Anchor: Sunday, November 15, 2026, 2:00 PM PST
    let targetTime = new Date('2026-11-15T14:00:00-08:00').getTime();

    function updateTimer() {
      const now = Date.now();
      let diff = targetTime - now;

      // Resilient fallback: If the date has passed, advance target so countdown stays live
      if (diff <= 0) {
        const nextCycle = new Date(now + 1000 * 60 * 60 * 24 * 14);
        nextCycle.setHours(14, 0, 0, 0);
        targetTime = nextCycle.getTime();
        diff = targetTime - now;
      }

      const totalSeconds = Math.max(0, Math.floor(diff / 1000));
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      daysEl.textContent = String(days).padStart(2, '0');
      hoursEl.textContent = String(hours).padStart(2, '0');
      minutesEl.textContent = String(minutes).padStart(2, '0');
      secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  // =========================================================================
  // LIVING COMMUNITY SEED GARDEN & INTENTION WALL
  // =========================================================================
  function initCommunitySeedGarden() {
    const canvas = document.getElementById('seedGardenCanvas');
    const wrap = document.getElementById('seedGardenCanvasWrap');
    const tooltip = document.getElementById('seedGardenTooltip');
    const tooltipName = document.getElementById('seedTooltipName');
    const tooltipIntention = document.getElementById('seedTooltipIntention');
    const tooltipBadge = document.getElementById('seedTooltipBadge');
    const countEl = document.getElementById('seedGardenCount');
    const form = document.getElementById('seedPlantingForm');
    const nameInput = document.getElementById('seedDonorName');
    const intentionInput = document.getElementById('seedIntentionText');
    const elementSelect = document.getElementById('seedElementType');

    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = wrap.clientWidth || 960;
    let height = canvas.height = 300;

    function handleResize() {
      if (!wrap) return;
      width = canvas.width = wrap.clientWidth;
      height = canvas.height = 300;
    }
    window.addEventListener('resize', handleResize);

    const DEFAULT_COMMUNITY_SEEDS = [
      { id: 'seed-1', name: 'Teshia & Marlon', intention: 'May every weary heart find safe harbor, deep breath, and unhurried belonging here.', element: 'earth', x: 0.10, stage: 1.0, heightRatio: 0.72 },
      { id: 'seed-2', name: 'Riverside Poet Collective', intention: 'To speak our truth without fear, and hear each other with reverent ears.', element: 'fire', x: 0.22, stage: 1.0, heightRatio: 0.85 },
      { id: 'seed-3', name: 'Maria L. (Santa Ana)', intention: 'Gentle peace for my family and healing for all mothers walking heavy roads.', element: 'water', x: 0.34, stage: 1.0, heightRatio: 0.68 },
      { id: 'seed-4', name: 'Darius K.', intention: 'Permission to stop rushing. Giving my chest room to breathe after 3 years of burnout.', element: 'air', x: 0.46, stage: 1.0, heightRatio: 0.78 },
      { id: 'seed-5', name: 'Anonymous Creative', intention: 'That the music I was too afraid to play finally finds a home in someone\'s spirit.', element: 'ether', x: 0.58, stage: 1.0, heightRatio: 0.82 },
      { id: 'seed-6', name: 'Elena G. (Irvine)', intention: 'Rooting deep in self-compassion so I can hold space for the next generation.', element: 'earth', x: 0.70, stage: 1.0, heightRatio: 0.75 },
      { id: 'seed-7', name: 'Marcus & Open Mic Circle', intention: 'Let the laughter at our open mics echo louder than the noise of the world.', element: 'fire', x: 0.82, stage: 1.0, heightRatio: 0.88 },
      { id: 'seed-8', name: 'Inland Empire Youth Circle', intention: 'Safe spaces where we don\'t have to pretend to be tough or perfect.', element: 'water', x: 0.92, stage: 1.0, heightRatio: 0.70 }
    ];

    let communitySeeds = [];
    try {
      const stored = localStorage.getItem('inner_sanctuary_community_seeds');
      if (stored) {
        communitySeeds = JSON.parse(stored);
      }
    } catch (e) {}

    if (!Array.isArray(communitySeeds) || communitySeeds.length === 0) {
      communitySeeds = [...DEFAULT_COMMUNITY_SEEDS];
    }

    if (countEl) countEl.textContent = communitySeeds.length;

    const ELEMENT_PALETTES = {
      earth: { glow: 'rgba(85, 166, 112, 0.45)', core: '#55A670', flower: '#F8D98C', freq: 432, label: 'EARTH • ROOTED SEED' },
      water: { glow: 'rgba(74, 184, 199, 0.45)', core: '#4AB8C7', flower: '#BCE7FD', freq: 528, label: 'WATER • EMOTIONAL SEED' },
      air:   { glow: 'rgba(156, 183, 216, 0.45)', core: '#9CB7D8', flower: '#EAF2FA', freq: 639, label: 'AIR • EXPANSIVE SEED' },
      fire:  { glow: 'rgba(230, 138, 46, 0.45)', core: '#E68A2E', flower: '#FAD02C', freq: 741, label: 'FIRE • JOYFUL SEED' },
      ether: { glow: 'rgba(176, 132, 204, 0.45)', core: '#B084CC', flower: '#F3E8FF', freq: 852, label: 'ETHER • SACRED SEED' }
    };

    let hoveredSeed = null;
    let gardenParticles = [];

    // Pre-populate ambient garden spores/fireflies
    for (let i = 0; i < 28; i++) {
      gardenParticles.push({
        x: Math.random(),
        y: Math.random() * 0.8 + 0.1,
        radius: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.6 + 0.2,
        speedX: (Math.random() - 0.5) * 0.0004,
        speedY: (Math.random() - 0.5) * 0.0003,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    let time = 0;
    function animateGarden() {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Sanctuary Soil Gradient & Ground Horizon
      const soilGrad = ctx.createLinearGradient(0, height - 45, 0, height);
      soilGrad.addColorStop(0, 'rgba(25, 42, 32, 0.3)');
      soilGrad.addColorStop(0.5, 'rgba(15, 26, 20, 0.85)');
      soilGrad.addColorStop(1, '#080E0A');
      ctx.fillStyle = soilGrad;
      ctx.fillRect(0, height - 45, width, 45);

      // Gold baseline hairline
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(197, 154, 63, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.moveTo(0, height - 36);
      ctx.lineTo(width, height - 36);
      ctx.stroke();

      // 2. Render Floating Ambient Spores
      gardenParticles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0.05) p.y = 0.85;
        if (p.y > 0.85) p.y = 0.05;

        const pulse = Math.sin(time * 1.5 + p.pulseOffset) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 217, 140, ${p.alpha * pulse * 0.6})`;
        ctx.fill();
      });

      // 3. Render Each Community Seed & Lotus Sprout
      const baseGroundY = height - 36;
      communitySeeds.forEach(seed => {
        if (seed.stage < 1.0) {
          seed.stage = Math.min(1.0, seed.stage + 0.02);
        }

        const palette = ELEMENT_PALETTES[seed.element] || ELEMENT_PALETTES.earth;
        const rootX = seed.x * width;
        const stemMaxHeight = height * (seed.heightRatio || 0.75) * seed.stage;
        const isHovered = (hoveredSeed && hoveredSeed.id === seed.id);

        // Organic breath sway
        const sway = Math.sin(time * 0.9 + seed.x * 6) * (isHovered ? 12 : 7);
        const headX = rootX + sway;
        const headY = baseGroundY - stemMaxHeight;

        // Draw Stem
        ctx.beginPath();
        ctx.moveTo(rootX, baseGroundY);
        ctx.quadraticCurveTo(rootX + sway * 0.4, baseGroundY - stemMaxHeight * 0.5, headX, headY);
        ctx.strokeStyle = isHovered ? '#F8D98C' : 'rgba(197, 154, 63, 0.55)';
        ctx.lineWidth = isHovered ? 2.5 : 1.6;
        ctx.stroke();

        // Draw Leaves on stem
        const leafY = baseGroundY - stemMaxHeight * 0.45;
        const leafX = rootX + sway * 0.4;
        ctx.beginPath();
        ctx.ellipse(leafX - 6, leafY, 6, 3, -0.4, 0, Math.PI * 2);
        ctx.ellipse(leafX + 6, leafY - 4, 6, 3, 0.4, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#A4D4B4' : 'rgba(85, 166, 112, 0.65)';
        ctx.fill();

        // Draw Glowing Bioluminescent Lotus Head
        const breathPulse = Math.sin(time * 1.8 + seed.x * 4) * 0.2 + 1.0;
        const auraRadius = (isHovered ? 32 : 22) * breathPulse;

        const auraGrad = ctx.createRadialGradient(headX, headY, 2, headX, headY, auraRadius);
        auraGrad.addColorStop(0, palette.flower);
        auraGrad.addColorStop(0.4, palette.glow);
        auraGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(headX, headY, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        // Petals
        const petalCount = 5;
        const petalRadius = isHovered ? 9 : 7;
        for (let p = 0; p < petalCount; p++) {
          const angle = (p / petalCount) * Math.PI * 2 + (time * 0.2);
          const px = headX + Math.cos(angle) * (petalRadius * 0.7);
          const py = headY + Math.sin(angle) * (petalRadius * 0.7);
          ctx.beginPath();
          ctx.arc(px, py, petalRadius * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = palette.flower;
          ctx.fill();
        }

        // Center golden heart
        ctx.beginPath();
        ctx.arc(headX, headY, isHovered ? 4.5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#F8D98C';
        ctx.shadowBlur = isHovered ? 14 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Store active coordinates for hit testing
        seed._headX = headX;
        seed._headY = headY;
      });

      requestAnimationFrame(animateGarden);
    }
    requestAnimationFrame(animateGarden);

    // Pointer Interaction (Hover & Tooltip)
    function handlePointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      const mouseX = (clientX - rect.left) * (width / rect.width);
      const mouseY = (clientY - rect.top) * (height / rect.height);

      let found = null;
      for (let i = communitySeeds.length - 1; i >= 0; i--) {
        const s = communitySeeds[i];
        if (s._headX && s._headY) {
          const dist = Math.hypot(mouseX - s._headX, mouseY - s._headY);
          if (dist < 28) {
            found = s;
            break;
          }
        }
      }

      if (found) {
        hoveredSeed = found;
        canvas.style.cursor = 'pointer';
        if (tooltip && tooltipName && tooltipIntention && tooltipBadge) {
          tooltipName.textContent = found.name;
          tooltipIntention.textContent = `"${found.intention}"`;
          const palette = ELEMENT_PALETTES[found.element] || ELEMENT_PALETTES.earth;
          tooltipBadge.textContent = `✦ ${palette.label}`;

          // Position tooltip relative to container
          const screenX = (found._headX / width) * rect.width;
          const screenY = (found._headY / height) * rect.height;
          tooltip.style.left = `${Math.max(120, Math.min(rect.width - 120, screenX))}px`;
          tooltip.style.top = `${screenY - 14}px`;
          tooltip.style.display = 'block';
        }
      } else {
        hoveredSeed = null;
        canvas.style.cursor = 'default';
        if (tooltip) tooltip.style.display = 'none';
      }
    }

    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mouseleave', () => {
      hoveredSeed = null;
      if (tooltip) tooltip.style.display = 'none';
    });
    canvas.addEventListener('touchstart', handlePointerMove, { passive: true });

    // Click/Tap on seed plays its solfeggio tone
    canvas.addEventListener('click', () => {
      if (hoveredSeed) {
        const pal = ELEMENT_PALETTES[hoveredSeed.element] || ELEMENT_PALETTES.earth;
        playHarmonicTone(pal.freq, 1.2, 0.02);
        createHeartFlourish();
      }
    });

    // Form Submission: Plant New Seed
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const intention = intentionInput ? intentionInput.value.trim() : '';
        if (!intention) {
          showToast('🌱 Please write a gentle intention before planting.');
          if (intentionInput) intentionInput.focus();
          return;
        }

        const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Anonymous Neighbor';
        const element = (elementSelect && elementSelect.value) ? elementSelect.value : 'air';

        // Distribute nicely along width avoiding identical x
        const newX = 0.08 + Math.random() * 0.84;
        const newSeed = {
          id: `seed-${Date.now()}`,
          name: name,
          intention: intention,
          element: element,
          x: newX,
          stage: 0.05,
          heightRatio: 0.65 + Math.random() * 0.22
        };

        communitySeeds.push(newSeed);

        try {
          localStorage.setItem('inner_sanctuary_community_seeds', JSON.stringify(communitySeeds));
        } catch (err) {}

        if (countEl) countEl.textContent = communitySeeds.length;

        // Play harmonic chime
        const pal = ELEMENT_PALETTES[element] || ELEMENT_PALETTES.air;
        playHarmonicTone(pal.freq, 1.4, 0.02);
        setTimeout(() => playHarmonicTone(pal.freq * 1.25, 1.0, 0.015), 180);

        createHeartFlourish();
        showToast(`🌱 Your seed and intention have been planted in the living sanctuary garden!`);
        form.reset();
      });
    }
  }

  // Initialize all feature suites
  initSanctuaryReflectionWidget();
  initOpenMicCountdown();

  // =========================================================================
  // LIVE OPEN MIC STAGE ROSTER & COMMUNITY REEL
  // =========================================================================
  window.claimOpenMicSlot = function(slotNum) {
    playHarmonicTone(639, 1.2, 0.02);
    createHeartFlourish();
    showToast(`🎤 Claiming Stage Slot ${slotNum}! Taking you to artist intake...`);

    // Switch intake tab to artist
    const artistTab = document.querySelector('.intake-tab[data-role="artist"]');
    if (artistTab) artistTab.click();

    // Prefill role select & message
    const roleSelect = document.getElementById('circle-role-select');
    if (roleSelect) roleSelect.value = 'Artist / Performer';

    const messageInput = document.getElementById('intake-message');
    if (messageInput) {
      messageInput.value = `I would like to claim Open Mic Slot #${slotNum} for the upcoming gathering at Our Sanctuary Clubhouse! Medium/genre: `;
    }

    // Smooth scroll to connect section
    const connectSec = document.getElementById('connect');
    if (connectSec) {
      connectSec.scrollIntoView({ behavior: 'smooth' });
    }
    const nameInput = document.getElementById('intake-name');
    if (nameInput) {
      setTimeout(() => nameInput.focus(), 600);
    }
  };

  const REEL_DATA = {
    all: { badge: '✦ ALL HIGHLIGHTS', title: '"The song we didn\'t know we needed to sing."', img: 'images/openmic/openmic-vocalist-yellow.jpg' },
    vocal: { badge: '✦ ACOUSTIC SOUL', title: 'Raw vocal resonance & heart harmonies at Our Sanctuary Clubhouse.', img: 'images/openmic/openmic-vocalist-yellow.jpg' },
    poetry: { badge: '✦ SPOKEN WORD', title: 'Honest verses shared without fear or pretense.', img: 'images/openmic/openmic-emcee-host.jpg' },
    somatic: { badge: '✦ SOMATIC BREATH', title: 'A collective pause to soften our shoulders and exhale.', img: 'images/openmic/openmic-crowd-applause.jpg' }
  };

  window.filterVideoReels = function(filterKey) {
    const data = REEL_DATA[filterKey] || REEL_DATA.all;
    const badgeEl = document.getElementById('reelActiveBadge');
    const titleEl = document.getElementById('reelActiveTitle');
    const imgEl = document.getElementById('reelPreviewImage');
    const tabs = document.querySelectorAll('.reel-tab');

    tabs.forEach(t => {
      if (t.getAttribute('data-filter') === filterKey) t.classList.add('active');
      else t.classList.remove('active');
    });

    if (badgeEl) badgeEl.textContent = data.badge;
    if (titleEl) titleEl.textContent = data.title;
    if (imgEl) imgEl.src = data.img;

    playHarmonicTone(432, 0.6, 0.015);
  };

  window.playCommunityReelModal = function() {
    playHarmonicTone(528, 1.2, 0.02);
    createHeartFlourish();
    if (typeof openPhotoWheelModal === 'function') {
      openPhotoWheelModal(0);
    }
    showToast('✨ Experiencing Community Highlight Reel from Our Sanctuary Clubhouse!');
  };

  // =========================================================================
  // DIGITAL INTENTION BRACELET CREATOR (PAUSE ACTIVATIONS)
  // =========================================================================
  function initDigitalBraceletCreator() {
    const beadBtns = document.querySelectorAll('.bead-btn');
    const slots = [
      document.getElementById('slot0'),
      document.getElementById('slot1'),
      document.getElementById('slot2')
    ];
    const revealedContainer = document.getElementById('revealedSpark');
    const beadSummary = document.getElementById('sparkBeadSummary');
    const quoteElem = document.getElementById('sparkQuote');
    const btnReset = document.getElementById('btnResetBracelet');
    const btnCopy = document.getElementById('btnCopySpark');
    const toast = document.getElementById('sparkToast');
    const visualizer = document.getElementById('braceletCircleVisualizer');
    const ringBeadsLayer = document.getElementById('ringBeadsLayer');

    if (!beadBtns.length || !slots[0]) return;

    let selectedBeads = [];

    const sparkMessages = [
      "Rooted in grace, held in softness, glowing from within. You don't have to carry the whole mountain today. Breathe in permission.",
      "Your heart knows the rhythm when you stop rushing. Trust the quiet growth happening beneath the surface.",
      "Tension is who you think you should be. Relaxation is who you are. Soften your jaw and let today be enough.",
      "Wear this intention as an unhurried anchor: You are worthy of peace, exactly as you are, in this exact heartbeat.",
      "When the world feels loud, return to what is real: the ground under your feet, the breath in your lungs, and the community standing beside you."
    ];

    function renderCompletedRing() {
      if (!ringBeadsLayer || selectedBeads.length !== 3) return;
      ringBeadsLayer.innerHTML = '';

      const totalBeads = 12;
      const R = 105;
      const cx = 140;
      const cy = 140;

      const cedarWoodBg = 'radial-gradient(circle at 35% 35%, #C19A6B, #8B5A2B 70%, #5C3A1E)';
      const goldBg = 'radial-gradient(circle at 35% 35%, #FFF9D2, #FFD700 65%, #C67D00)';

      for (let i = 0; i < totalBeads; i++) {
        const theta = (i / totalBeads) * Math.PI * 2 - Math.PI / 2;
        const beadEl = document.createElement('div');

        if (i === 0 || i === 4 || i === 8) {
          // Chosen Intention Gemstone Beads
          const chosenIdx = i === 0 ? 0 : (i === 4 ? 1 : 2);
          const chosen = selectedBeads[chosenIdx];
          beadEl.className = 'ring-bead main-bead';
          beadEl.style.background = chosen.bg;
          beadEl.title = `${chosen.name}: ${chosen.meaning || 'Sacred Intention'}`;
          const size = 34;
          const x = cx + R * Math.cos(theta) - size / 2;
          const y = cy + R * Math.sin(theta) - size / 2;
          beadEl.style.left = `${x}px`;
          beadEl.style.top = `${y}px`;
        } else {
          // Alternating Cedar Wood & Sunburst Gold Spacers
          beadEl.className = 'ring-bead spacer-bead';
          beadEl.style.background = (i % 2 === 0) ? cedarWoodBg : goldBg;
          const size = 18;
          const x = cx + R * Math.cos(theta) - size / 2;
          const y = cy + R * Math.sin(theta) - size / 2;
          beadEl.style.left = `${x}px`;
          beadEl.style.top = `${y}px`;
        }

        ringBeadsLayer.appendChild(beadEl);
      }
    }

    function updateBraceletStage() {
      // Update slots
      slots.forEach((slot, idx) => {
        if (!slot) return;
        const beadData = selectedBeads[idx];
        if (beadData) {
          slot.className = 'bead-slot filled';
          slot.innerHTML = `<span class="bead-circle" style="width: 100%; height: 100%; margin: 0; background: ${beadData.bg}"></span>`;
        } else {
          slot.className = 'bead-slot empty';
          slot.innerHTML = `<span class="slot-placeholder">+ Bead ${idx + 1}</span>`;
        }
      });

      // Update button active states
      beadBtns.forEach(btn => {
        const beadType = btn.dataset.bead;
        const isSelected = selectedBeads.some(b => b.type === beadType);
        if (isSelected) {
          btn.classList.add('selected');
        } else {
          btn.classList.remove('selected');
        }
      });

      // Check if 3 beads are selected
      const openModalBtn = document.getElementById('btnOpenBraceletModal');
      if (selectedBeads.length === 3) {
        if (visualizer) {
          visualizer.style.display = 'flex';
          renderCompletedRing();
        }

        if (beadSummary) {
          beadSummary.textContent = selectedBeads.map(b => b.name).join(' • ');
        }
        if (quoteElem) {
          const quoteIdx = (selectedBeads[0].name.length + selectedBeads[1].name.length) % sparkMessages.length;
          quoteElem.textContent = `"${sparkMessages[quoteIdx]}"`;
        }
        if (openModalBtn) {
          openModalBtn.style.display = 'inline-flex';
        }
      } else {
        if (openModalBtn) {
          openModalBtn.style.display = 'none';
        }
      }
    }

    window.openBraceletKeepsakeModal = function() {
      const modal = document.getElementById('braceletKeepsakeModal');
      if (modal) {
        modal.style.display = 'flex';
        renderCompletedRing();
        playHarmonicTone(528, 0.8, 0.015);
      }
    };

    window.closeBraceletKeepsakeModal = function() {
      const modal = document.getElementById('braceletKeepsakeModal');
      if (modal) {
        modal.style.display = 'none';
      }
    };

    window.resetBraceletAndCloseModal = function() {
      selectedBeads = [];
      updateBraceletStage();
      window.closeBraceletKeepsakeModal();
      playHarmonicTone(432, 0.5, 0.015);
      showToast('🔄 Weave another bracelet: Choose 3 sacred intentions.');
    };

    // Close bracelet modal on click outside or Escape
    window.addEventListener('click', (e) => {
      const modal = document.getElementById('braceletKeepsakeModal');
      if (modal && e.target === modal) {
        window.closeBraceletKeepsakeModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.closeBraceletKeepsakeModal();
      }
    });

    beadBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const beadType = btn.dataset.bead;
        const beadName = btn.dataset.name;
        const beadMeaning = btn.dataset.meaning;
        const circleElem = btn.querySelector('.bead-circle');
        const bg = circleElem ? circleElem.style.background : btn.dataset.color;

        const existingIdx = selectedBeads.findIndex(b => b.type === beadType);
        if (existingIdx !== -1) {
          selectedBeads.splice(existingIdx, 1);
          playHarmonicTone(440, 0.08, 0.02);
        } else {
          if (selectedBeads.length < 3) {
            selectedBeads.push({ type: beadType, name: beadName, meaning: beadMeaning, bg });
          } else {
            selectedBeads[2] = { type: beadType, name: beadName, meaning: beadMeaning, bg };
          }

          if (selectedBeads.length === 3) {
            // Circle completion harmony!
            playHarmonicTone(880, 0.12, 0.03);
            setTimeout(() => playHarmonicTone(528, 1.4, 0.02), 100);
            createHeartFlourish();
            showToast('✨ The circle is complete! Opening your keepsake window...');
            // Automatically open the sacred keepsake pop-up window!
            setTimeout(() => {
              window.openBraceletKeepsakeModal();
            }, 350);
          } else {
            playHarmonicTone(selectedBeads.length === 1 ? 659 : 784, 0.09, 0.03);
          }
        }
        updateBraceletStage();
      });
    });

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        selectedBeads = [];
        playHarmonicTone(432, 0.5, 0.015);
        updateBraceletStage();
      });
    }

    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        const quote = quoteElem ? quoteElem.textContent : '';
        const summary = beadSummary ? beadSummary.textContent : '';
        const shareText = `${quote}\n\n— Weaved with Love at Our Sanctuary Clubhouse • ${summary}\nInner Sanctuary Wellness Foundation ✦ @ourinnersanctuary\nhttps://ourinnersanctuary.org`;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareText).then(showToastFeedback).catch(() => fallbackCopy(shareText));
        } else {
          fallbackCopy(shareText);
        }
      });
    }

    function fallbackCopy(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        showToastFeedback();
      } catch (err) {
        showToast('✓ Copied intention to clipboard!');
      }
      document.body.removeChild(textarea);
    }

    function showToastFeedback() {
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
      }
      showToast('✓ Sanctuary Spark copied to clipboard! Ready to paste into IG Story.');
    }
  }

  // =========================================================================
  // ACCORDION FAQ CONTROLS
  // =========================================================================
  function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Optional: close other items for clean accordion
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherTrigger = other.querySelector('.faq-trigger');
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          }
        });

        if (isActive) {
          item.classList.remove('active');
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // Initialize new expansion features
  initDigitalBraceletCreator();
  initFAQAccordion();



  // Toggle Theory of Change & Program Logic Model Drawer
  window.toggleLogicModel = function() {
    const drawer = document.getElementById('logic-model-drawer');
    const btn = document.getElementById('toggle-logic-model-btn');
    if (!drawer) return;

    const isHidden = drawer.style.display === 'none' || !drawer.style.display;
    if (isHidden) {
      drawer.style.display = 'block';
      if (btn) btn.innerHTML = '<span>▴ Hide Program Logic Model</span>';
      drawer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      drawer.style.display = 'none';
      if (btn) btn.innerHTML = '<span>📊 View Program Logic Model (Steps 1–4) ▾</span>';
    }
  };

  // Direct On-Site Due Diligence Request via Contact Form (routes to both leadership emails)
  window.requestDueDiligenceForm = function() {
    if (typeof selectIntakeTab === 'function') {
      selectIntakeTab('grantmaker');
    }
    const roleSelect = document.getElementById('role-select');
    if (roleSelect) {
      roleSelect.value = 'Institutional Grantmaker / Foundation RFP';
    }
    const msgEl = document.getElementById('form-message');
    if (msgEl) {
      msgEl.value = 'Due Diligence Request: Please send our team your official IRS 501(c)(3) Determination Letter, signed Form W-9 (.pdf), and CRA Community Development Packet.\n\nOrganization:\nContact Name & Title:\nDirect Email / Phone:';
      msgEl.focus();
    }
    const formSection = document.getElementById('connect');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

});


  // =========================================================================
  // COMMUNITY PHOTO WHEEL & LIGHTBOX MODAL LOGIC
  // =========================================================================
  window.currentPhotoWheelIndex = 0;
  const photoWheelData = [
    {
      src: "images/openmic/openmic-nov15-living-room-sanctuary.jpg",
      caption: "Grounded Presence • Full Community Circle Gathered at the Hearth (Nov 15)",
      alt: "Community circle gathered in the clubhouse living room around the indoor tree"
    },
    {
      src: "images/openmic/openmic-nov15-spoken-word-circle.jpg",
      caption: "Raw Vocal Truth • Spoken Word & Acoustic Expression in the Living Room (Nov 15)",
      alt: "Spoken word performer standing before community circle in Reconnect shirt"
    },
    {
      src: "images/openmic/openmic-nov15-acoustic-duo-harmony.jpg",
      caption: "Soulful Strings & Melody • Acoustic Guitar & Vocal Harmonies in Flow (Nov 15)",
      alt: "Acoustic guitarist and soulful female singer performing together in armchair circle"
    },
    {
      src: "images/openmic/openmic-nov15-stone-hearth-celebration.jpg",
      caption: "Joyful Embodiment • Drums, Dancing & Laughter Before the Grand Hearth (Nov 15)",
      alt: "Community members dancing and drumming with pure joy before the stone fireplace"
    },
    {
      src: "images/openmic/openmic-nov15-djembe-poolside-rhythm.jpg",
      caption: "Heartbeat of the Hearth • Djembe Rhythm & Joy by the Waterside (Nov 15)",
      alt: "Musician playing red djembe drum poolside with smiling friend"
    },
    {
      src: "images/openmic/openmic-nov15-storyteller-reflection.jpg",
      caption: "Unhurried Words • Vulnerable Storytelling & Poetry by the Staircase (Nov 15)",
      alt: "Community storyteller reading from phone on wooden stool by rustic staircase"
    },
    {
      src: "images/openmic/openmic-nov15-reconnect-sisterhood.jpg",
      caption: "Radiant Fellowship • Reconnect & Joy at the Clubhouse Loft (Nov 15)",
      alt: "Two smiling community members on the wooden staircase, one wearing Reconnect shirt"
    },
    {
      src: "images/openmic/openmic-nov15-elder-wisdom-words.jpg",
      caption: "Generational Wisdom • Lived Truth & Sacred Listening (Nov 15)",
      alt: "Silver-haired elder sharing stories with attentive audience in the clubhouse"
    },
    {
      src: "images/openmic/openmic-nov15-clubhouse-pool-dusk.jpg",
      caption: "Sanctuary Haven • Twilight Reflection by the Pool & Palm Grove (Nov 15)",
      alt: "Evening view of the Sanctuary Clubhouse pool with illuminated palm trees and warm lighting"
    },
    {
      src: "images/openmic/openmic-nov15-reconnect-portrait.jpg",
      caption: "Sacred Welcome • Safe Community Haven & True Belonging (Nov 15)",
      alt: "Close portrait of community members smiling on the wooden lodge balcony"
    },
    {
      src: "images/openmic/openmic-audience-cafe86.jpg",
      caption: "Attentive Sanctuary • Neighbors & Creators Gathered in Grounded Presence",
      alt: "Attentive audience gathered at open mic"
    },
    {
      src: "images/openmic/openmic-community-joy.jpg",
      caption: "Authentic Connection & Joy • MC Marlon Smith with Community Members",
      alt: "Marlon Smith smiling with community"
    }
  ];

  let photoWheelTimer = null;

  function updatePhotoWheelUI(idx) {
    const slides = document.querySelectorAll('.photo-wheel-slide');
    const dots = document.querySelectorAll('.wheel-dot');
    if (!slides.length) return;

    window.currentPhotoWheelIndex = (idx + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === window.currentPhotoWheelIndex);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === window.currentPhotoWheelIndex);
    });
  }

  window.nextPhotoSlide = function(e) {
    if (e) e.stopPropagation();
    updatePhotoWheelUI(window.currentPhotoWheelIndex + 1);
  };

  window.prevPhotoSlide = function(e) {
    if (e) e.stopPropagation();
    updatePhotoWheelUI(window.currentPhotoWheelIndex - 1);
  };

  window.goToPhotoSlide = function(idx) {
    updatePhotoWheelUI(idx);
  };

  // Auto-advance every 5 seconds
  function startPhotoWheelAuto() {
    stopPhotoWheelAuto();
    photoWheelTimer = setInterval(() => {
      updatePhotoWheelUI(window.currentPhotoWheelIndex + 1);
    }, 5000);
  }

  function stopPhotoWheelAuto() {
    if (photoWheelTimer) clearInterval(photoWheelTimer);
  }

  const wheelCard = document.getElementById('openmic-photo-wheel');
  if (wheelCard) {
    wheelCard.addEventListener('mouseenter', stopPhotoWheelAuto);
    wheelCard.addEventListener('mouseleave', startPhotoWheelAuto);
    wheelCard.addEventListener('touchstart', stopPhotoWheelAuto, { passive: true });
    startPhotoWheelAuto();
  }

  // Fullscreen Photo Wheel Modal Window
  window.openPhotoWheelModal = function(idx = 0) {
    stopPhotoWheelAuto();
    window.currentPhotoWheelIndex = idx;
    const modal = document.getElementById('PhotoWheelModal');
    if (!modal) return;

    updateModalPhotoDisplay();
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.closePhotoWheelModal = function() {
    const modal = document.getElementById('PhotoWheelModal');
    if (!modal) return;

    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    startPhotoWheelAuto();
  };

  function updateModalPhotoDisplay() {
    const data = photoWheelData[window.currentPhotoWheelIndex];
    if (!data) return;

    const img = document.getElementById('wheelModalImg');
    const caption = document.getElementById('wheelModalCaption');
    const counter = document.getElementById('wheelModalCounter');

    if (img) {
      img.src = data.src;
      img.alt = data.alt;
    }
    if (caption) caption.textContent = data.caption;
    if (counter) counter.textContent = `Photo ${window.currentPhotoWheelIndex + 1} of ${photoWheelData.length}`;
  }

  window.modalNextPhoto = function() {
    window.currentPhotoWheelIndex = (window.currentPhotoWheelIndex + 1) % photoWheelData.length;
    updateModalPhotoDisplay();
    updatePhotoWheelUI(window.currentPhotoWheelIndex);
  };

  window.modalPrevPhoto = function() {
    window.currentPhotoWheelIndex = (window.currentPhotoWheelIndex - 1 + photoWheelData.length) % photoWheelData.length;
    updateModalPhotoDisplay();
    updatePhotoWheelUI(window.currentPhotoWheelIndex);
  };

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    const modal = document.getElementById('PhotoWheelModal');
    if (modal && modal.style.display === 'flex') {
      if (e.key === 'ArrowRight') window.modalNextPhoto();
      if (e.key === 'ArrowLeft') window.modalPrevPhoto();
      if (e.key === 'Escape') window.closePhotoWheelModal();
    }
  });

  // Modal backdrop click to close
  const modalElem = document.getElementById('PhotoWheelModal');
  if (modalElem) {
    modalElem.addEventListener('click', (e) => {
      if (e.target === modalElem) window.closePhotoWheelModal();
    });
  }

  // =========================================================================
  // INTERACTIVE BREEZE & SKY SANCTUARY PHYSICS ENGINE
  // =========================================================================
  function initInteractiveSky() {
    const feathers = document.querySelectorAll('.ambient-feather');
    const seabirds = document.querySelectorAll('.swallow');
    if (!feathers.length && !seabirds.length) return;

    // Interactive Click / Tap Flurry for Feathers
    feathers.forEach(feather => {
      function triggerFeatherGust(e) {
        if (e) e.stopPropagation();
        feather.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.5s ease';
        feather.style.filter = 'drop-shadow(0 0 24px #FFFFFF) drop-shadow(0 0 32px rgba(248, 217, 140, 0.95))';
        feather.style.transform = 'scale(1.4) rotate(380deg) translate3d(0, -40px, 0)';
        
        setTimeout(() => {
          feather.style.transform = '';
          feather.style.filter = '';
          setTimeout(() => {
            feather.style.transition = '';
          }, 600);
        }, 850);
      }

      feather.addEventListener('click', triggerFeatherGust);
      feather.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerFeatherGust();
        }
      });
    });

    // Interactive Soar for Seabirds
    seabirds.forEach(bird => {
      bird.addEventListener('click', (e) => {
        e.stopPropagation();
        bird.style.transition = 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.6s ease';
        bird.style.filter = 'drop-shadow(0 0 24px #FFFFFF) drop-shadow(0 0 36px rgba(248, 217, 140, 1))';
        bird.style.transform = 'scale(1.3) translateY(-30px) rotate(-14deg)';
        setTimeout(() => {
          bird.style.transform = '';
          bird.style.filter = '';
          setTimeout(() => {
            bird.style.transition = '';
          }, 800);
        }, 1100);
      });
    });

    // Subtle Wind Lift Vector on Mouse Movement
    let mouseThrottle = 0;
    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - mouseThrottle < 40) return;
      mouseThrottle = now;

      const normX = (e.clientX / window.innerWidth) - 0.5;
      const normY = (e.clientY / window.innerHeight) - 0.5;

      feathers.forEach((f, idx) => {
        const factor = (idx + 1) * 6;
        f.style.setProperty('--cursor-lift-x', normX * factor + 'px');
        f.style.setProperty('--cursor-lift-y', normY * factor + 'px');
      });
    }, { passive: true });
  }

  // Auto-init interactive sky
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractiveSky);
  } else {
    initInteractiveSky();
  }

  // =========================================================================
  // REAL INSTAGRAM STORY (9:16) CANVAS SNAPSHOT GENERATOR
  // =========================================================================
  window.currentStoryData = {
    quote: "Where in your body are you holding yesterday? Soften your jaw, drop your shoulders, and let this breath belong only to right now.",
    badge: "✦ DAILY SANCTUARY REFLECTION ✦",
    source: "— Inner Sanctuary Daily Reflection",
    filename: "inner-sanctuary-reflection.png"
  };

  window.openStorySnapshotFromReflection = function(e) {
    if (e) e.preventDefault();
    const activeItem = window.activeOracleReflection || ((typeof SANCTUARY_REFLECTIONS !== 'undefined' && typeof currentReflectionIndex !== 'undefined')
      ? SANCTUARY_REFLECTIONS[currentReflectionIndex]
      : null);

    const quoteEl = document.getElementById('reflectionCardQuote');
    const badgeEl = document.getElementById('reflectionCardBadge');

    const quote = activeItem ? activeItem.quote : (quoteEl ? quoteEl.textContent.trim().replace(/^"|"$/g, '') : "Pause. Breathe. Remember.");
    const badge = activeItem ? (activeItem.badge || `✦ ${activeItem.theme || activeItem.category} ✦`) : (badgeEl ? badgeEl.textContent.trim() : "✦ SANCTUARY SOMATIC ORACLE ✦");

    window.currentStoryData = {
      quote: quote,
      badge: badge,
      source: "— Inner Sanctuary Somatic Oracle",
      filename: "inner-sanctuary-somatic-oracle.png"
    };

    renderAndShowStoryModal();
  };

  window.openStorySnapshotFromSpark = function(e) {
    if (e) e.preventDefault();
    const quoteEl = document.getElementById('sparkQuote');
    const quote = quoteEl ? quoteEl.textContent.trim().replace(/^"|"$/g, '') : "Rooted in grace, held in softness, glowing from within. Breathe in permission.";
    const summaryEl = document.getElementById('sparkBeadSummary');
    const summary = summaryEl ? summaryEl.textContent.trim() : "Mindful Intention Weave";

    window.currentStoryData = {
      quote: quote,
      badge: "✦ WEAVED WITH LOVE • OUR SANCTUARY CLUBHOUSE ✦",
      source: `— Inner Sanctuary Bracelet Keepsake • ${summary}`,
      filename: "inner-sanctuary-clubhouse-keepsake.png"
    };

    renderAndShowStoryModal();
  };

  function renderAndShowStoryModal() {
    const modal = document.getElementById('igStoryModal');
    const canvas = document.getElementById('igStoryCanvas');
    const previewImg = document.getElementById('igStoryPreviewImg');
    if (!canvas || !modal) return;

    const ctx = canvas.getContext('2d');
    const W = 1080;
    const H = 1920;

    // 1. Draw Deep Forest Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#121F17');
    bgGrad.addColorStop(0.35, '#1C2E24');
    bgGrad.addColorStop(0.75, '#263D30');
    bgGrad.addColorStop(1, '#15241B');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Radial Golden Aura at top and center
    const topAura = ctx.createRadialGradient(W / 2, 280, 20, W / 2, 280, 480);
    topAura.addColorStop(0, 'rgba(248, 217, 140, 0.22)');
    topAura.addColorStop(0.6, 'rgba(197, 154, 63, 0.08)');
    topAura.addColorStop(1, 'rgba(197, 154, 63, 0)');
    ctx.fillStyle = topAura;
    ctx.fillRect(0, 0, W, 800);

    const centerAura = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 550);
    centerAura.addColorStop(0, 'rgba(248, 217, 140, 0.12)');
    centerAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = centerAura;
    ctx.fillRect(0, 600, W, 900);

    // 3. Stardust Motes
    ctx.fillStyle = 'rgba(248, 217, 140, 0.4)';
    const motes = [
      [120, 320, 3], [940, 260, 2.5], [180, 850, 2], [900, 920, 3],
      [140, 1550, 3.5], [920, 1620, 2], [320, 180, 2], [760, 210, 2.5],
      [250, 1400, 2], [820, 1340, 3]
    ];
    motes.forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Elegant Outer Gold Border
    ctx.strokeStyle = 'rgba(248, 217, 140, 0.45)';
    ctx.lineWidth = 3;
    ctx.strokeRect(54, 54, W - 108, H - 108);

    ctx.strokeStyle = 'rgba(197, 154, 63, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(66, 66, W - 132, H - 132);

    // 4 Corner Gold Flourishes
    ctx.fillStyle = '#F8D98C';
    ctx.font = '24px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', 60, 60);
    ctx.fillText('✦', W - 60, 60);
    ctx.fillText('✦', 60, H - 60);
    ctx.fillText('✦', W - 60, H - 60);

    // 5. Load and Draw Emblem Image
    const emblemImg = new Image();
    emblemImg.crossOrigin = 'anonymous';
    emblemImg.onload = function() {
      drawEmblemAndFinish();
    };
    emblemImg.onerror = function() {
      // If image fails, finish without image
      drawCardDetails(null);
    };
    emblemImg.src = 'emblem.png';

    function drawEmblemAndFinish() {
      drawCardDetails(emblemImg);
    }

    function drawCardDetails(img) {
      // Draw Emblem at top
      const emblemY = 240;
      const emblemSize = 170;
      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, emblemY, emblemSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, W / 2 - emblemSize / 2, emblemY - emblemSize / 2, emblemSize, emblemSize);
        ctx.restore();

        // Gold Ring around Emblem
        ctx.beginPath();
        ctx.arc(W / 2, emblemY, emblemSize / 2 + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#F8D98C';
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      // 6. Header Typography
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 44px Cinzel, serif';
      ctx.fillText('INNER SANCTUARY', W / 2, 385);

      ctx.fillStyle = '#F8D98C';
      ctx.font = '800 20px Montserrat, sans-serif';
      ctx.fillText('W E L L N E S S   F O U N D A T I O N', W / 2, 428);

      // 7. Category Pill Badge
      const badgeText = window.currentStoryData.badge || '✦ DAILY SANCTUARY REFLECTION ✦';
      ctx.font = '800 22px Montserrat, sans-serif';
      const badgeWidth = ctx.measureText(badgeText).width + 50;
      const badgeY = 505;
      
      ctx.fillStyle = 'rgba(248, 217, 140, 0.18)';
      ctx.beginPath();
      roundRect(ctx, W / 2 - badgeWidth / 2, badgeY, badgeWidth, 44, 22);
      ctx.fill();
      ctx.strokeStyle = 'rgba(248, 217, 140, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#F8D98C';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, W / 2, badgeY + 22);

      // 8. Frosted Glass Quote Card Frame
      const cardX = 90;
      const cardY = 590;
      const cardW = W - 180;
      const cardH = 880;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.beginPath();
      roundRect(ctx, cardX, cardY, cardW, cardH, 32);
      ctx.fill();

      ctx.strokeStyle = 'rgba(248, 217, 140, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Top flourish divider
      ctx.fillStyle = '#F8D98C';
      ctx.font = '22px Cinzel, serif';
      ctx.fillText('✦  ✦  ✦', W / 2, cardY + 55);

      // Giant decorative quote mark
      ctx.font = 'italic 140px "Cormorant Garamond", Georgia, serif';
      ctx.fillStyle = 'rgba(248, 217, 140, 0.28)';
      ctx.textAlign = 'left';
      ctx.fillText('“', cardX + 50, cardY + 160);

      // 9. Auto-Wrapped Quote Text
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFDF5';
      ctx.font = 'italic 46px "Cormorant Garamond", Georgia, serif';
      
      const cleanQuote = window.currentStoryData.quote.replace(/^"|"$/g, '');
      const maxTextWidth = cardW - 140;
      const lineHeight = 72;
      const words = cleanQuote.split(' ');
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth < maxTextWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = words[i];
        }
      }
      lines.push(currentLine);

      // Center quote vertically within card
      const totalBlockHeight = lines.length * lineHeight;
      let startY = cardY + 220 + (cardH - 340 - totalBlockHeight) / 2;
      if (startY < cardY + 160) startY = cardY + 160;

      lines.forEach((line, idx) => {
        ctx.fillText(line, W / 2, startY + (idx * lineHeight));
      });

      // Bottom source attribution inside card
      ctx.font = '600 24px Montserrat, sans-serif';
      ctx.fillStyle = '#CBD7D0';
      ctx.fillText(window.currentStoryData.source || '— Inner Sanctuary Reflection', W / 2, cardY + cardH - 65);

      // 10. Footer Sanctuary Signature & Social Handles
      ctx.font = '700 30px Cinzel, serif';
      ctx.fillStyle = '#F8D98C';
      ctx.fillText('Pause.  Breathe.  Remember.', W / 2, 1560);

      ctx.font = '700 22px Montserrat, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('@ourinnersanctuary  •  innersanctuarywellnessfoundation.org', W / 2, 1615);

      ctx.font = '500 19px Montserrat, sans-serif';
      ctx.fillStyle = '#8EA89A';
      ctx.fillText('501(c)(3) Nonprofit Public Charity  •  Santa Ana, California', W / 2, 1660);

      // 11. Export to Preview Image & Display Modal
      const dataUrl = canvas.toDataURL('image/png');
      if (previewImg) previewImg.src = dataUrl;
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
    }

    function roundRect(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }
  }

  window.closeIgStoryModal = function() {
    const modal = document.getElementById('igStoryModal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  window.downloadIgStoryImage = function() {
    const canvas = document.getElementById('igStoryCanvas');
    if (!canvas) return;

    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = window.currentStoryData.filename || 'inner-sanctuary-story.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const toast = document.getElementById('igStoryToast');
      if (toast) {
        toast.textContent = '✓ 9:16 Story card downloaded! Open Instagram to share to Story.';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
      }
    }, 'image/png');
  };

  window.shareToNativeInstagram = async function() {
    const canvas = document.getElementById('igStoryCanvas');
    if (!canvas) return;

    canvas.toBlob(async blob => {
      if (!blob) return;
      const filename = window.currentStoryData.filename || 'inner-sanctuary-story.png';
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Inner Sanctuary Daily Reflection',
            text: `"${window.currentStoryData.quote}" — @ourinnersanctuary`
          });
          return;
        } catch (err) {
          // User cancelled or share failed, fallback below
        }
      }

      // Desktop fallback: Download image and prompt user
      window.downloadIgStoryImage();
      window.open('https://www.instagram.com/', '_blank');
    }, 'image/png');
  };

  window.copyStoryQuoteText = function() {
    const quote = window.currentStoryData ? window.currentStoryData.quote : '';
    const textToCopy = `"${quote}"\n\n— Inner Sanctuary Wellness Foundation ✦ @ourinnersanctuary`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    const toast = document.getElementById('igStoryToast');
    if (toast) {
      toast.textContent = '✓ Quote text copied to clipboard!';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }
  };

  // Close modal when clicking backdrop
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('igStoryModal');
    if (modal && e.target === modal) {
      window.closeIgStoryModal();
    }
  });

  // Close modal on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeIgStoryModal();
    }
  });


// =========================================================================
// PLANT YOUR SEED: DUAL FREQUENCY (MONTHLY VS ONE-TIME) CONTROLLER
// =========================================================================
(function initSeedFrequencyController() {
  // Verified, active 501(c)(3) Zeffy Embed Form (Supports both One-Time & Monthly)
  const ZEFFY_FORM_URL = 'https://www.zeffy.com/embed/donation-form/donate-to-make-a-difference-inner-sanctuary-wellness-foundation';

  let currentFrequency = localStorage.getItem('sanctuary_seed_freq') || 'monthly';

  window.setSeedFrequency = function(freq) {
    currentFrequency = freq === 'onetime' ? 'onetime' : 'monthly';
    try {
      localStorage.setItem('sanctuary_seed_freq', currentFrequency);
    } catch(err) {}

    // Update Inline Box Buttons
    const btnMonthly = document.getElementById('btnSeedFreqMonthly');
    const btnOnetime = document.getElementById('btnSeedFreqOnetime');
    if (btnMonthly && btnOnetime) {
      if (currentFrequency === 'monthly') {
        btnMonthly.classList.add('active');
        btnMonthly.setAttribute('aria-selected', 'true');
        btnOnetime.classList.remove('active');
        btnOnetime.setAttribute('aria-selected', 'false');
      } else {
        btnOnetime.classList.add('active');
        btnOnetime.setAttribute('aria-selected', 'true');
        btnMonthly.classList.remove('active');
        btnMonthly.setAttribute('aria-selected', 'false');
      }
    }

    // Update Modal Buttons
    const modalBtnMonthly = document.getElementById('modalBtnSeedFreqMonthly');
    const modalBtnOnetime = document.getElementById('modalBtnSeedFreqOnetime');
    if (modalBtnMonthly && modalBtnOnetime) {
      if (currentFrequency === 'monthly') {
        modalBtnMonthly.classList.add('active');
        modalBtnOnetime.classList.remove('active');
      } else {
        modalBtnOnetime.classList.add('active');
        modalBtnMonthly.classList.remove('active');
      }
    }

    // Update Explanations with clear guidance
    const badge = document.getElementById('seedFreqBadge');
    const text = document.getElementById('seedFreqText');
    if (badge && text) {
      if (currentFrequency === 'monthly') {
        badge.textContent = '✨ Monthly Sustaining Care';
        text.textContent = 'Sustains free weekly open mic stages, artist stipends, tea, and trauma-informed healing spaces month after month.';
      } else {
        badge.textContent = '🌱 Instant 1-Time Seed • $1 Sparks a Circle';
        text.textContent = 'Directly sparks this week\'s community open mic and helps provide tokens and sacred materials for local neighbors.';
      }
    }

    // Keep iframe rock-solid on the verified working form (never break into 404!)
    const inlineIframe = document.getElementById('zeffy-inline-iframe');
    const modalIframe = document.getElementById('zeffy-modal-iframe');

    if (inlineIframe && (!inlineIframe.src || !inlineIframe.src.includes('zeffy.com/embed/donation-form/'))) {
      inlineIframe.src = ZEFFY_FORM_URL;
    }
    if (modalIframe && (!modalIframe.src || !modalIframe.src.includes('zeffy.com/embed/donation-form/'))) {
      modalIframe.src = ZEFFY_FORM_URL;
    }

    // Harmonic audio chime feedback
    if (typeof playHarmonicTone === 'function') {
      playHarmonicTone(currentFrequency === 'monthly' ? 528 : 432, 0.15, 0.02);
    }
  };

  // Initialize on load
  document.addEventListener('DOMContentLoaded', () => {
    window.setSeedFrequency(currentFrequency);
  });
})();

// =========================================================================
// SANCTUARY IN YOUR POCKET: UNIVERSAL PWA CONTROLLER (ALL PHONE TYPES)
// =========================================================================
(function initSanctuaryPwaController() {
  let deferredPwaPrompt = null;
  const DISMISS_DURATION_DAYS = 5;
  const DISMISS_KEY = 'sanctuary_pwa_dismissed';

  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      if (window.location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('./sw.js')
          .then((registration) => {
            console.log('[Sanctuary PWA] Service Worker active with scope:', registration.scope);
          })
          .catch((err) => {
            console.warn('[Sanctuary PWA] Service Worker registration failed:', err);
          });
      }
    });
  }

  // Device Detectors
  function isIosDevice() {
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua);
  }

  function isAndroidDevice() {
    const ua = window.navigator.userAgent.toLowerCase();
    return /android/.test(ua);
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && navigator.standalone);
  }

  // Universal Modal Tab Switcher
  window.switchPwaModalTab = function(targetOs) {
    const tabs = ['ios', 'android', 'desktop'];
    tabs.forEach((os) => {
      const btn = document.getElementById('pwaTabBtn' + os.charAt(0).toUpperCase() + os.slice(1));
      const pane = document.getElementById('pwaPane' + os.charAt(0).toUpperCase() + os.slice(1));
      if (btn && pane) {
        if (os === targetOs) {
          btn.classList.add('active');
          pane.classList.add('active');
        } else {
          btn.classList.remove('active');
          pane.classList.remove('active');
        }
      }
    });
    if (typeof playHarmonicTone === 'function') playHarmonicTone(587, 0.1, 0.015);
  };

  // 2. Capture install prompt on Chromium / Android / Desktop
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;

    const navBtn = document.getElementById('btnPwaNavInstall');
    if (navBtn && !isStandalone()) navBtn.style.display = 'inline-flex';

    const mobileItem = document.getElementById('mobilePwaInstallItem');
    if (mobileItem && !isStandalone()) mobileItem.style.display = 'block';
  });

  // Ensure download buttons are visible across all devices & surface welcoming prompt on join
  document.addEventListener('DOMContentLoaded', () => {
    if (!isStandalone()) {
      const navBtn = document.getElementById('btnPwaNavInstall');
      if (navBtn) navBtn.style.display = 'inline-flex';
      const mobileItem = document.getElementById('mobilePwaInstallItem');
      if (mobileItem) mobileItem.style.display = 'block';

      // Gentle welcome window reveal 2.2 seconds after landing on the page
      setTimeout(() => {
        const dismissedAt = localStorage.getItem(DISMISS_KEY);
        const sessionDismissed = sessionStorage.getItem('sanctuary_welcome_dismissed');
        const now = Date.now();
        const isDismissedRecently = dismissedAt && (now - parseInt(dismissedAt, 10)) < (DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000);

        if (!isDismissedRecently && !sessionDismissed && !isStandalone()) {
          const banner = document.getElementById('pwaInstallBanner');
          if (banner) {
            banner.style.display = 'block';
          }
        }
      }, 2200);
    }
  });

  // Direct trigger prompt for Android button inside modal
  window.triggerPwaPromptDirect = function() {
    if (deferredPwaPrompt) {
      deferredPwaPrompt.prompt();
      deferredPwaPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          if (typeof playHarmonicTone === 'function') playHarmonicTone(528, 1.2, 0.03);
          if (typeof showToast === 'function') showToast('✨ Sanctuary installed to your Home Screen! Welcome home.');
          window.closePwaIosModal();
        }
        deferredPwaPrompt = null;
      });
    } else {
      if (typeof showToast === 'function') {
        showToast('📱 Tap your browser menu (⋮) and tap "Install App" or "Add to Home screen"');
      }
    }
  };

  // Universal User Trigger: Clicked Install anywhere
  window.triggerPwaInstall = function(e) {
    if (e && e.preventDefault) e.preventDefault();

    if (isStandalone()) {
      if (typeof showToast === 'function') showToast('✨ Inner Sanctuary is already installed and active on your device!');
      return;
    }

    if (deferredPwaPrompt) {
      deferredPwaPrompt.prompt();
      deferredPwaPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          if (typeof playHarmonicTone === 'function') playHarmonicTone(528, 1.2, 0.03);
          if (typeof showToast === 'function') showToast('✨ Inner Sanctuary installed to your Home Screen!');
        }
        deferredPwaPrompt = null;
        window.dismissPwaBanner();
      });
      return;
    }

    // Open Universal Modal with OS tab preselected
    const modal = document.getElementById('pwaIosModal');
    if (modal) {
      modal.style.display = 'flex';
      if (isIosDevice()) {
        window.switchPwaModalTab('ios');
      } else if (isAndroidDevice()) {
        window.switchPwaModalTab('android');
      } else {
        window.switchPwaModalTab('desktop');
      }
      if (typeof playHarmonicTone === 'function') playHarmonicTone(659, 0.2, 0.02);
    }
  };

  window.acceptPwaInstall = function() {
    window.triggerPwaInstall();
  };

  window.dismissPwaBanner = function() {
    const banner = document.getElementById('pwaInstallBanner');
    if (banner) banner.style.display = 'none';
    sessionStorage.setItem('sanctuary_welcome_dismissed', 'true');
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  window.closePwaIosModal = function() {
    const modal = document.getElementById('pwaIosModal');
    if (modal) modal.style.display = 'none';
  };

  window.addEventListener('appinstalled', () => {
    deferredPwaPrompt = null;
    const banner = document.getElementById('pwaInstallBanner');
    if (banner) banner.style.display = 'none';
    const navBtn = document.getElementById('btnPwaNavInstall');
    if (navBtn) navBtn.style.display = 'none';
    const mobileItem = document.getElementById('mobilePwaInstallItem');
    if (mobileItem) mobileItem.style.display = 'none';

    if (typeof playHarmonicTone === 'function') {
      playHarmonicTone(528, 1.5, 0.03);
      setTimeout(() => playHarmonicTone(880, 1.0, 0.02), 150);
    }
    if (typeof createHeartFlourish === 'function') createHeartFlourish();
    if (typeof showToast === 'function') {
      showToast('🕊️ Inner Sanctuary successfully installed! Your sanctuary is always one tap away.');
    }
  });

  window.addEventListener('click', (e) => {
    const modal = document.getElementById('pwaIosModal');
    if (modal && e.target === modal) {
      window.closePwaIosModal();
    }
  });
})();

// =========================================================================
// LIVING CAMPFIRE HEARTH & THERMODYNAMIC EMBER CANVAS ENGINE
// =========================================================================
(function initLivingCampfireHearthEngine() {
  const canvas = document.getElementById('sanctuary-3d-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Hearth origin location (aligned with campfire in nature-fire-8k.jpg)
  function getHearthOrigin() {
    return {
      x: width * 0.50,
      y: height < 600 ? height * 0.88 : (height * 0.82)
    };
  }

  // Interactive Sparks on Cursor / Touch
  const interactiveSparks = [];
  function addSparksAt(px, py, count = 4) {
    for (let i = 0; i < count; i++) {
      interactiveSparks.push({
        x: px + (Math.random() - 0.5) * 16,
        y: py + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 3.5,
        vy: -(Math.random() * 3.2 + 1.2),
        size: Math.random() * 3.0 + 1.2,
        life: 0,
        maxLife: Math.random() * 45 + 30,
        colorPrefix: Math.random() > 0.4 ? '255, 245, 180' : '255, 165, 30'
      });
    }
  }

  window.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.65) addSparksAt(e.clientX, e.clientY, 2);
  });

  window.addEventListener('click', (e) => {
    addSparksAt(e.clientX, e.clientY, 8);
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0] && Math.random() > 0.60) {
      addSparksAt(e.touches[0].clientX, e.touches[0].clientY, 2);
    }
  }, { passive: true });

  // Twilight Dusk Stars in Sky
  const skyStars = [];
  const starCount = Math.min(32, Math.floor(width / 45));
  for (let i = 0; i < starCount; i++) {
    skyStars.push({
      x: Math.random() * width,
      y: Math.random() * (height * 0.42),
      radius: Math.random() * 1.5 + 0.6,
      baseAlpha: Math.random() * 0.45 + 0.15,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      twinklePhase: Math.random() * Math.PI * 2
    });
  }

  // Living Flame Plumes
  const flameCount = width < 768 ? 16 : 24;
  const flameParticles = [];
  for (let i = 0; i < flameCount; i++) {
    flameParticles.push({
      relX: (Math.random() - 0.5) * 60,
      y: 0,
      radius: Math.random() * 16 + 10,
      speedY: Math.random() * 2.2 + 1.4,
      swaySpeed: Math.random() * 0.04 + 0.02,
      swayOffset: Math.random() * Math.PI * 2,
      age: Math.random() * 50,
      maxAge: Math.random() * 40 + 35
    });
  }

  // Thermodynamic Ascending Embers
  const emberCount = width < 768 ? 38 : 72;
  const hearthEmbers = [];
  for (let i = 0; i < emberCount; i++) {
    hearthEmbers.push({
      x: (Math.random() - 0.5) * (width * 0.65),
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -(Math.random() * 1.8 + 0.8),
      size: Math.random() * 2.6 + 1.2,
      alpha: Math.random() * 0.75 + 0.25,
      swaySpeed: Math.random() * 0.02 + 0.01,
      swayOffset: Math.random() * Math.PI * 2,
      swayAmp: Math.random() * 1.8 + 0.8,
      age: Math.random() * 160,
      maxAge: Math.random() * 140 + 80
    });
  }

// Wavy lines & wind currents removed per user request

  let interactiveWind = 0;
  window.addEventListener('mousemove', () => {
    interactiveWind = Math.min(interactiveWind + 0.04, 1.0);
  });
  window.addEventListener('touchmove', () => {
    interactiveWind = Math.min(interactiveWind + 0.06, 1.0);
  }, { passive: true });

  let isEngineRunning = true;

  function renderLivingCampfire(now) {
    if (!isEngineRunning) return;
    requestAnimationFrame(renderLivingCampfire);

    if (document.hidden) return;

    ctx.clearRect(0, 0, width, height);

    const hearth = getHearthOrigin();
    const t = now * 0.001;

    // Somatic Breathwork Stoking Dynamics
    let breathStoke = 1.0;
    if (window.sanctuaryBreathSync && window.sanctuaryBreathSync.active) {
      const bStep = window.sanctuaryBreathSync.step; // 0 = Inhale, 1 = Exhale
      const bEase = window.sanctuaryBreathSync.ease || 0.5;
      // Inhale stokes the fire with thermal oxygen; exhale relaxes into deep cozy warmth
      breathStoke = bStep === 0 ? (1.0 + bEase * 0.40) : (1.0 - bEase * 0.15);
    }

    // Wavy lines & wave ribbons removed per user request

    // 1. Render Twilight Stars in Upper Atmosphere
    for (let i = 0; i < skyStars.length; i++) {
      const s = skyStars[i];
      const twinkle = (Math.sin(now * s.twinkleSpeed + s.twinklePhase) + 1) * 0.5;
      const alpha = s.baseAlpha * (0.4 + twinkle * 0.6);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 248, 220, ${alpha})`;
      ctx.fill();
    }

    // 2. Ambient Hearth Radiant Warmth Aura (Warm firelight flickers across ground)
    const flickerPulse = Math.sin(t * 7.5) * 0.03 + Math.sin(t * 14.2) * 0.02;
    const hearthGlowRadius = Math.min(width * 0.48, 360) * breathStoke;
    const hearthGrad = ctx.createRadialGradient(hearth.x, hearth.y, 10, hearth.x, hearth.y - 30, hearthGlowRadius);
    const baseGlowAlpha = (0.20 + flickerPulse) * breathStoke;
    hearthGrad.addColorStop(0, `rgba(255, 185, 75, ${baseGlowAlpha * 0.85})`);
    hearthGrad.addColorStop(0.35, `rgba(240, 110, 30, ${baseGlowAlpha * 0.50})`);
    hearthGrad.addColorStop(0.70, `rgba(180, 45, 15, ${baseGlowAlpha * 0.20})`);
    hearthGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = hearthGrad;
    ctx.fillRect(0, 0, width, height);

    // 3. Living Campfire Flame Tongues (Dancing Fire Plumes)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < flameParticles.length; i++) {
      const f = flameParticles[i];
      f.age += 1;
      f.y -= f.speedY * breathStoke;
      const sway = Math.sin(now * f.swaySpeed + f.swayOffset) * 14;

      const progress = f.age / f.maxAge;
      if (progress >= 1.0) {
        f.age = 0;
        f.y = 0;
        f.relX = (Math.random() - 0.5) * 55;
        f.radius = Math.random() * 16 + 10;
      }

      const currentRadius = f.radius * (1 - progress * 0.75) * breathStoke;
      const curX = hearth.x + f.relX + sway;
      const curY = hearth.y + f.y;

      let flameColor;
      if (progress < 0.28) {
        flameColor = '255, 252, 230'; // Hot golden-white core
      } else if (progress < 0.65) {
        flameColor = '255, 175, 40';  // Radiant sunburst orange
      } else {
        flameColor = '225, 60, 20';   // Ruby flame apex
      }

      const flameAlpha = (1 - progress) * 0.55 * breathStoke;
      ctx.beginPath();
      ctx.arc(curX, curY, Math.max(1, currentRadius), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${flameColor}, ${flameAlpha})`;
      ctx.fill();
    }
    ctx.restore();

    // 4. Thermodynamic Ascending Embers & Wind Eddies
    ctx.save();
    for (let i = 0; i < hearthEmbers.length; i++) {
      const e = hearthEmbers[i];
      e.age += 1;
      e.y += e.vy * breathStoke;
      e.x += e.vx + Math.sin(now * e.swaySpeed + e.swayOffset) * e.swayAmp;

      const progress = e.age / e.maxAge;
      if (e.y < -20 || progress >= 1.0) {
        e.age = 0;
        e.x = hearth.x + (Math.random() - 0.5) * 50;
        e.y = hearth.y + (Math.random() - 0.5) * 15;
        e.vy = -(Math.random() * 2.0 + 0.9);
        e.vx = (Math.random() - 0.5) * 1.2;
      }

      let emberColor;
      if (progress < 0.25) {
        emberColor = '255, 245, 180'; // Hot golden spark
      } else if (progress < 0.60) {
        emberColor = '255, 160, 45';  // Radiant amber
      } else {
        emberColor = '215, 65, 25';   // Deep ruby ember
      }

      const emberAlpha = (1 - progress) * e.alpha * breathStoke;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size * (1 - progress * 0.4), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${emberColor}, ${emberAlpha})`;
      ctx.fill();

      // Soft ember halo
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size * 2.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${emberColor}, ${emberAlpha * 0.25})`;
      ctx.fill();
    }
    ctx.restore();

    // 5. Interactive Cursor Sparks
    for (let i = interactiveSparks.length - 1; i >= 0; i--) {
      const sp = interactiveSparks[i];
      sp.life += 1;
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vy += 0.05; // Gentle gravity

      const spProg = sp.life / sp.maxLife;
      if (spProg >= 1.0) {
        interactiveSparks.splice(i, 1);
        continue;
      }

      const spAlpha = (1 - spProg) * 0.95;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size * (1 - spProg * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${sp.colorPrefix}, ${spAlpha})`;
      ctx.fill();
    }
  }

  requestAnimationFrame(renderLivingCampfire);

  // Global toggle control
  window.toggleSanctuaryCampfire = function(state) {
    if (state !== undefined) {
      isEngineRunning = !!state;
    } else {
      isEngineRunning = !isEngineRunning;
    }
    canvas.style.opacity = isEngineRunning ? '0.98' : '0';
    return isEngineRunning;
  };
})();

// Global Pulse Presence Modal Handler
window.openPulsePresenceModal = function(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const breathTarget = document.getElementById('box-breathing-section') || document.querySelector('.box-breathing-container') || document.getElementById('remember');
  if (breathTarget) {
    breathTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};


/* ========================================================
   THE SANCTUARY GREENROOM (SPEAKEASY & COMMUNITY MIC)
   ======================================================== */

(function() {
  // 1. Knock System State
  let knockCount = 0;
  let knockTimer = null;
  let activeTab = 'vinyl';

  // 2. Play wooden knock tone using Web Audio
  function playWoodenKnock(pitchMultiplier = 1.0) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380 * pitchMultiplier, ctx.currentTime);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 * pitchMultiplier, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45 * pitchMultiplier, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch (e) {
      console.warn('Knock audio suppressed:', e);
    }
  }

  // 3. Play needle drop crackle sound
  function playNeedleDrop() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const bufferSize = ctx.sampleRate * 0.45;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const pop = Math.random() > 0.985 ? (Math.random() * 0.4 - 0.2) : 0;
        data[i] = (Math.random() * 0.03 - 0.015 + pop) * (1 - t / 0.45);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (e) {}
  }

  
  // =========================================================================
  // SACRED HEALING FREQUENCY BELLS (432Hz • 528Hz • CATHEDRAL TOLL)
  // =========================================================================
  function playHealingBellKnock(stage = 1) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);

      if (stage === 1) {
        // 🌿 KNOCK 1: 432 Hz Root / Grounding Bronze Bell
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.38, now + 0.012);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

        const partials = [
          { f: 216.0, g: 0.35, d: 3.2 },
          { f: 432.0, g: 0.60, d: 2.8 },
          { f: 864.0, g: 0.25, d: 2.0 },
          { f: 1296.0, g: 0.15, d: 1.4 },
          { f: 1728.0, g: 0.08, d: 0.9 }
        ];

        partials.forEach(p => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(p.f, now);
          g.gain.setValueAtTime(p.g, now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + p.d);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(now);
          osc.stop(now + p.d + 0.05);
        });

      } else if (stage === 2) {
        // ✨ KNOCK 2: 528 Hz Heart / Miracle Transformation Silver Bell
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.42, now + 0.012);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        const partials = [
          { f: 264.0, g: 0.30, d: 3.8 },
          { f: 528.0, g: 0.65, d: 3.4 },
          { f: 1056.0, g: 0.30, d: 2.4 },
          { f: 1584.0, g: 0.18, d: 1.6 },
          { f: 2112.0, g: 0.10, d: 1.0 }
        ];

        partials.forEach(p => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(p.f + 0.6, now);
          g.gain.setValueAtTime(p.g, now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + p.d);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(now);
          osc.stop(now + p.d + 0.05);
        });

      } else {
        // 🔔 KNOCK 3: Resounding Cathedral Sanctuary Bell (Notre Dame Cathedral Toll)
        masterGain.gain.setValueAtTime(0.001, now);
        masterGain.gain.linearRampToValueAtTime(0.55, now + 0.02);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 6.0);

        const partials = [
          { f: 108.0, g: 0.70, d: 5.8 },
          { f: 216.0, g: 0.45, d: 5.0 },
          { f: 432.0, g: 0.50, d: 4.4 },
          { f: 648.0, g: 0.25, d: 3.6 },
          { f: 864.0, g: 0.20, d: 3.0 },
          { f: 963.0, g: 0.18, d: 2.4 },
          { f: 1296.0, g: 0.12, d: 1.8 }
        ];

        partials.forEach((p, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          const detune = (idx % 2 === 0 ? 0.8 : -0.8);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(p.f + detune, now);
          g.gain.setValueAtTime(p.g, now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + p.d);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(now);
          osc.stop(now + p.d + 0.05);
        });

        // Clapper strike transient
        const bufferSize = Math.floor(ctx.sampleRate * 0.04);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1050, now);
        noiseFilter.Q.setValueAtTime(2.5, now);
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.20, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);
        noise.start(now);
      }

      // Visual Bell Resonance Shockwave on Medallions
      const targets = document.querySelectorAll('.hero-emblem, .nav-emblem, .hero-emblem-ring, .hero-emblem-halo');
      targets.forEach(el => {
        el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease';
        el.style.transform = stage === 3 ? 'scale(1.18)' : 'scale(1.08)';
        el.style.filter = stage === 3 
          ? 'drop-shadow(0 0 30px rgba(248, 217, 140, 1)) brightness(1.3)' 
          : 'drop-shadow(0 0 16px rgba(197, 154, 63, 0.8)) brightness(1.15)';
        setTimeout(() => {
          el.style.transform = '';
          el.style.filter = '';
        }, stage === 3 ? 1000 : 500);
      });

    } catch (err) {
      console.warn('[HealingBell] Audio error:', err);
    }
  }

  // 4. Handle Knock on Nav Key Badge
  // 4. Handle Knock on Medallion or Nav Key Badge (Healing Frequency Bells)
  window.handleSpeakeasyKnock = function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    knockCount++;
    const counterEl = document.getElementById('speakeasyKnockCounter');
    
    // Clear reset timer
    if (knockTimer) clearTimeout(knockTimer);
    knockTimer = setTimeout(() => {
      knockCount = 0;
      if (counterEl) counterEl.textContent = '✦';
    }, 4500);

    // Visual & Healing Frequency Bell Audio Feedback
    if (knockCount === 1) {
      playHealingBellKnock(1);
      if (counterEl) counterEl.textContent = '1/3';
      showKnockToast('🔔 432 Hz Sanctuary Bell (Knock 1/3) — Grounding & Presence');
    } else if (knockCount === 2) {
      playHealingBellKnock(2);
      if (counterEl) counterEl.textContent = '2/3';
      showKnockToast('✨ 528 Hz Healing Bell (Knock 2/3) — Transformation & Harmony');
    } else if (knockCount >= 3) {
      playHealingBellKnock(3);
      if (counterEl) counterEl.textContent = '🔓';
      showKnockToast('🕊️ Cathedral Sanctuary Bell Tolls... Door Unlocked! Welcome Backstage.');
      knockCount = 0;
      setTimeout(() => {
        if (counterEl) counterEl.textContent = '✦';
        openSpeakeasyModal();
      }, 450);
    }
  };

  function showKnockToast(msg) {
    const existing = document.querySelector('.speakeasy-knock-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'speakeasy-knock-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 320);
    }, 1800);
  }

  // 5. Open / Close Speakeasy Modal
  window.openSpeakeasyModal = function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const modal = document.getElementById('speakeasyModal');
    if (!modal) return;
    
    playNeedleDrop();
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Initialize Guestbook on first open
    renderGuestbook();
  };

  window.closeSpeakeasyModal = function() {
    const modal = document.getElementById('speakeasyModal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Stop playback when closed to be respectful
    stopGreenroomAudio();
  };

  // Close on Escape or Backdrop Click
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('speakeasyModal');
      if (modal && modal.style.display !== 'none') {
        closeSpeakeasyModal();
      }
    }
  });

  document.addEventListener('click', (e) => {
    const modal = document.getElementById('speakeasyModal');
    if (modal && e.target === modal) {
      closeSpeakeasyModal();
    }
  });

  // 6. Tab Switching
  window.switchSpeakeasyTab = function(tabName) {
    activeTab = tabName;
    const tabs = ['vinyl', 'mic', 'pass'];
    tabs.forEach(t => {
      const btn = document.getElementById('tabBtn' + t.charAt(0).toUpperCase() + t.slice(1));
      const pane = document.getElementById('tabPane' + t.charAt(0).toUpperCase() + t.slice(1));
      if (btn) btn.classList.toggle('active', t === tabName);
      if (pane) {
        pane.style.display = t === tabName ? (t === 'vinyl' ? 'flex' : 'block') : 'none';
        pane.classList.toggle('active', t === tabName);
      }
    });
  };

  // 7. Greenroom Web Audio Synthesis Engine (3 Tracks)
  const TRACKS = [
    {
      title: "Midnight Embers & 432Hz Dusk",
      credits: "Acoustic Guitar, Fire Cracks & Grounding Harmonics • Live Session",
      badge: "NOW PLAYING • TRACK 01",
      notes: [146.83, 220.00, 293.66, 369.99, 440.00, 554.37, 587.33] // D-Major pentatonic acoustic guitar arpeggios
    },
    {
      title: "Rain on MacArthur & Cello",
      credits: "C2/G2 Drone, Singing Bowls & Evening Rain • Live Session",
      badge: "NOW PLAYING • TRACK 02",
      notes: [65.41, 98.00, 130.81, 196.00, 261.63, 392.00] // Deep cello resonance
    },
    {
      title: "Sanctuary Exhale & Chimes",
      credits: "4-4 Somatic Breath Cycle & Bamboo Windchimes • Live Session",
      badge: "NOW PLAYING • TRACK 03",
      notes: [659.25, 783.99, 880.00, 987.77, 1174.66, 1318.51] // Pentatonic chimes
    }
  ];

  let currentTrackIdx = 0;
  let isPlaying = false;
  let audioCtx = null;
  let masterGain = null;
  let synthInterval = null;
  let noiseNode = null;

  function initAudioCtx() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play a single warm synthesized guitar or chime pluck
  function playSynthPluck(freq, decay = 1.6) {
    if (!audioCtx || !isPlaying) return;
    try {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      // Pluck timbre
      osc.type = currentTrackIdx === 1 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(currentTrackIdx === 1 ? 260 : 780, audioCtx.currentTime);

      const now = audioCtx.currentTime;
      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.linearRampToValueAtTime(0.06, now + 0.015);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + decay);
    } catch (e) {}
  }

  // Start the background ambient crackle/rain texture
  function startAmbientTexture() {
    if (!audioCtx) return;
    try {
      const bufferSize = audioCtx.sampleRate * 2;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        // Soft pink noise with warm random pops
        const pop = Math.random() > 0.992 ? (Math.random() * 0.15 - 0.075) : 0;
        data[i] = (Math.random() * 0.02 - 0.01) + pop;
      }

      noiseNode = audioCtx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      const noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(currentTrackIdx === 1 ? 800 : 1400, audioCtx.currentTime);

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.025, audioCtx.currentTime);

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);

      noiseNode.start();
    } catch (e) {}
  }

  function startGreenroomAudio() {
    initAudioCtx();
    isPlaying = true;
    startAmbientTexture();

    const track = TRACKS[currentTrackIdx];
    let noteStep = 0;

    // Pattern arpeggiator
    synthInterval = setInterval(() => {
      if (!isPlaying) return;
      const freq = track.notes[noteStep % track.notes.length];
      playSynthPluck(freq, currentTrackIdx === 2 ? 2.5 : 1.8);
      noteStep++;
    }, currentTrackIdx === 1 ? 950 : (currentTrackIdx === 2 ? 1400 : 480));

    // UI Updates
    updateVinylUI(true);
  }

  function stopGreenroomAudio() {
    isPlaying = false;
    if (synthInterval) clearInterval(synthInterval);
    if (noiseNode) {
      try { noiseNode.stop(); } catch (e) {}
      noiseNode = null;
    }
    updateVinylUI(false);
  }

  window.toggleGreenroomPlayback = function() {
    if (isPlaying) {
      stopGreenroomAudio();
    } else {
      startGreenroomAudio();
    }
  };

  function updateVinylUI(playing) {
    const disc = document.getElementById('speakeasyVinylDisc');
    const arm = document.getElementById('speakeasyToneArm');
    const playIcon = document.getElementById('speakeasyPlayIcon');

    if (disc) disc.classList.toggle('spinning', playing);
    if (arm) arm.classList.toggle('playing', playing);
    if (playIcon) playIcon.textContent = playing ? '⏸' : '▶';
  }

  window.selectGreenroomTrack = function(idx) {
    currentTrackIdx = idx;
    const track = TRACKS[idx];

    // Update track display
    const titleEl = document.getElementById('speakeasyTrackTitle');
    const creditsEl = document.getElementById('speakeasyTrackCredits');
    const badgeEl = document.getElementById('speakeasyTrackBadge');

    if (titleEl) titleEl.textContent = track.title;
    if (creditsEl) creditsEl.textContent = track.credits;
    if (badgeEl) badgeEl.textContent = track.badge;

    // Update Pill Buttons
    for (let i = 0; i < TRACKS.length; i++) {
      const btn = document.getElementById('btnTrack' + i);
      if (btn) btn.classList.toggle('active', i === idx);
    }

    if (isPlaying) {
      stopGreenroomAudio();
      startGreenroomAudio();
    }
  };

  window.prevGreenroomTrack = function() {
    const nextIdx = (currentTrackIdx - 1 + TRACKS.length) % TRACKS.length;
    selectGreenroomTrack(nextIdx);
  };

  window.nextGreenroomTrack = function() {
    const nextIdx = (currentTrackIdx + 1) % TRACKS.length;
    selectGreenroomTrack(nextIdx);
  };

  // 8. "Pass the Mic" Voice Recorder Logic
  let mediaRecorder = null;
  let audioChunks = [];
  let recordTimerInterval = null;
  let recordedBlobUrl = null;

  window.toggleVoiceRecording = async function() {
    const recordBtn = document.getElementById('btnStartVoiceRecord');
    const activeBar = document.getElementById('voiceRecordingActiveBar');
    const timerEl = document.getElementById('recordingTimer');

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        clearInterval(recordTimerInterval);
        if (activeBar) activeBar.style.display = 'none';
        if (recordBtn) {
          recordBtn.style.display = 'inline-flex';
          const label = document.getElementById('voiceRecordLabel');
          if (label) label.textContent = 'Record 10s Voice Note';
        }
        
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        recordedBlobUrl = URL.createObjectURL(blob);
        
        // Show preview card
        const previewCard = document.getElementById('voicePreviewCard');
        if (previewCard) previewCard.style.display = 'block';

        // Stop all tracks to release microphone
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      if (recordBtn) recordBtn.style.display = 'none';
      if (activeBar) activeBar.style.display = 'flex';

      let secondsLeft = 10;
      if (timerEl) timerEl.textContent = '0:10';
      recordTimerInterval = setInterval(() => {
        secondsLeft--;
        if (timerEl) timerEl.textContent = '0:0' + secondsLeft;
        if (secondsLeft <= 0) {
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }
      }, 1000);

    } catch (err) {
      console.warn('Microphone unavailable, switching to written whisper:', err);
      toggleTextWhisperForm();
    }
  };

  window.playVoicePreview = function() {
    if (!recordedBlobUrl) return;
    const audio = new Audio(recordedBlobUrl);
    audio.play();
  };

  window.discardVoiceRecording = function() {
    recordedBlobUrl = null;
    const previewCard = document.getElementById('voicePreviewCard');
    if (previewCard) previewCard.style.display = 'none';
    const recordBtn = document.getElementById('btnStartVoiceRecord');
    if (recordBtn) recordBtn.style.display = 'inline-flex';
  };

  window.saveVoiceNoteToGuestbook = function() {
    if (!recordedBlobUrl) return;
    addWhisperToGuestbook({
      id: 'voice_' + Date.now(),
      author: 'A Backstage Soul • Whispered Note',
      text: '🎙️ [10-Second Voice Keepsake Recorded Live]',
      time: 'Just now',
      isVoice: true,
      audioUrl: recordedBlobUrl,
      warmth: 1
    });

    discardVoiceRecording();
    showWhisperToast('✓ Your voice note is now live in the Greenroom Hearth!');
  };

  // Written Whisper Form Toggle
  window.toggleTextWhisperForm = function() {
    const form = document.getElementById('textWhisperForm');
    if (!form) return;
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    if (form.style.display === 'block') {
      const input = document.getElementById('textWhisperInput');
      if (input) input.focus();
    }
  };

  window.submitTextWhisper = function() {
    const textEl = document.getElementById('textWhisperInput');
    const authorEl = document.getElementById('textWhisperAuthor');
    if (!textEl) return;

    const text = textEl.value.trim();
    if (!text) return;
    const author = (authorEl && authorEl.value.trim()) || 'A Gentle Soul • Greenroom';

    addWhisperToGuestbook({
      id: 'text_' + Date.now(),
      author: author,
      text: text,
      time: 'Just now',
      isVoice: false,
      warmth: 1
    });

    textEl.value = '';
    if (authorEl) authorEl.value = '';
    document.getElementById('textWhisperForm').style.display = 'none';
    showWhisperToast('✓ Your whisper was pinned to the Sanctuary Greenroom!');
  };

  function showWhisperToast(msg) {
    const toast = document.getElementById('whisperToast');
    if (toast) {
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 3400);
    }
  }

  // 9. Guestbook Management & LocalStorage
  const DEFAULT_WHISPERS = [
    { id: 'w1', author: 'Elena S. • Orange County', text: 'Breathe in permission, exhale comparison. You are right on time.', time: '2 hours ago', warmth: 14 },
    { id: 'w2', author: 'Marcus • Irvine', text: 'Tonight was the first time in years I read my poetry out loud without shaking. Thank you for this space.', time: 'Yesterday', warmth: 28 },
    { id: 'w3', author: 'Jordan • Santa Ana', text: "To whoever is listening late tonight: you don't have to carry the whole mountain. Rest your spirit.", time: '2 days ago', warmth: 35 }
  ];

  function getStoredWhispers() {
    try {
      const data = localStorage.getItem('sanctuary_greenroom_guestbook');
      return data ? JSON.parse(data) : DEFAULT_WHISPERS;
    } catch (e) {
      return DEFAULT_WHISPERS;
    }
  }

  function addWhisperToGuestbook(item) {
    const list = getStoredWhispers();
    list.unshift(item);
    try {
      localStorage.setItem('sanctuary_greenroom_guestbook', JSON.stringify(list));
    } catch (e) {}
    renderGuestbook();
  }

  function renderGuestbook() {
    const container = document.getElementById('guestbookCardsList');
    if (!container) return;
    const whispers = getStoredWhispers();

    container.innerHTML = whispers.map((w, index) => {
      return `
        <div class="guestbook-card" id="whisperCard_${w.id}">
          <p class="guestbook-card-quote">"${escapeHtml(w.text)}"</p>
          <div class="guestbook-card-meta">
            <span><strong>${escapeHtml(w.author)}</strong> • ${w.time}</span>
            <button type="button" class="guestbook-warmth-btn" onclick="sendWarmthToWhisper('${w.id}')">
              <span>🕯️</span> <span id="warmthCount_${w.id}">${w.warmth || 1}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  window.sendWarmthToWhisper = function(id) {
    const countEl = document.getElementById('warmthCount_' + id);
    if (countEl) {
      let count = parseInt(countEl.textContent, 10) || 1;
      countEl.textContent = count + 1;
      playWoodenKnock(1.8); // Gentle harmonic pop
    }
  };

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  // 10. Instagram Story Snapshot for Backstage Pass
  window.openBackstagePassSnapshot = function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    window.currentStoryData = {
      badge: "✦ VIP BACKSTAGE GREENROOM PASS ✦",
      quote: "You have arrived. Unhurried voices, raw acoustics, and late-night community poetry recorded live at Our Sanctuary Clubhouse.",
      source: `— All-Access Pass #0842 • Admitted on ${today} • innersanctuarywellnessfoundation.org`,
      filename: "inner-sanctuary-backstage-pass.png"
    };

    if (typeof renderAndShowStoryModal === 'function') {
      renderAndShowStoryModal();
    }
  };

  // Copy Speakeasy Invite Link
  window.copySpeakeasyInviteLink = function() {
    const url = window.location.origin + window.location.pathname + '#greenroom';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showInviteToast();
      }).catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
  };

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showInviteToast();
  }

  function showInviteToast() {
    const toast = document.getElementById('inviteToast');
    if (toast) {
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 3200);
    }
  }

  // 11. Check URL Hash on Load for Direct Link
  if (window.location.hash === '#greenroom' || window.location.search.includes('greenroom=1')) {
    setTimeout(() => {
      openSpeakeasyModal();
    }, 600);
  }

  /* ==========================================================================
     12. THE HEARTH MIRROR (GEMINI WISDOM COMPANION)
     ========================================================================== */
  function initHearthMirror() {
    const hearthPortal = document.getElementById('hearth-mirror-portal');
    if (!hearthPortal) return;

    const inputArea = document.getElementById('hearthReflectionInput');
    const btnReceive = document.getElementById('btnReceiveReflection');
    const btnChime432 = document.getElementById('btnChime432');
    const btnChime528 = document.getElementById('btnChime528');
    const pillBtns = document.querySelectorAll('.hearth-pill-btn');
    const resultBox = document.getElementById('hearthReflectionResult');
    const resultTag = document.getElementById('hearthResultTag');
    const resultQuote = document.getElementById('hearthResultQuote');
    const resultPractice = document.getElementById('hearthResultPractice');
    const btnText = document.getElementById('hearthBtnText');
    const btnSpinner = document.getElementById('hearthBtnSpinner');

    let selectedEmotion = 'seeking-peace';

    const reflectionsDatabase = {
      'overwhelmed': {
        tag: 'Release & Soften',
        quote: '"You have been carrying the sky on your shoulders today. Let this breath belong only to you. You do not have to fix everything right this second. Soften your jaw, drop your hands, and let the room hold you."',
        practice: '🌿 Grounding Micro-Practice: Unclench your teeth, place one hand on your heart, and take 3 slow breaths with the Living Breath Orb above.'
      },
      'heavy-heart': {
        tag: 'Gentle Witness',
        quote: '"Grief and heaviness are sacred messengers—they show how deeply you love and feel. You don’t have to rush past this moment or explain it to anyone. In our circle, every heavy heart is met with warmth and belonging."',
        practice: '🌿 Grounding Micro-Practice: Inhale for 4 seconds, whisper \"I am here\", and exhale for 8 seconds. You are never alone in what you feel.'
      },
      'seeking-peace': {
        tag: 'Unhurried Presence',
        quote: '"Peace is not the absence of noise; it is the quiet room you build inside yourself in the middle of it all. Pause. Breathe. Remember who you are when the demands of the world fade away."',
        practice: '🌿 Grounding Micro-Practice: Listen closely to the 432 Hz bronze bell tone until it completely melts into silence.'
      },
      'creative-spark': {
        tag: 'Honor Your Voice',
        quote: '"That subtle inner tug is your soul asking to play. Whether it is two lines of poetry, a hummingbird melody, or an honest conversation—your truth deserves to take up space. Bring it to the hearth."',
        practice: '🌿 Grounding Micro-Practice: Jot down the first 3 honest words that come to your mind without editing them. That is your poem for today.'
      },
      'lonely': {
        tag: 'Sacred Belonging',
        quote: '"Isolation is a trick of the mind. Underneath the surface, we are all navigating the same tender human experience. The journey home to yourself was never meant to be walked alone."',
        practice: '🌿 Grounding Micro-Practice: Look outside at the open sky or a living leaf. Connect with the breath shared by all of us.'
      },
      'grateful': {
        tag: 'Living Abundance',
        quote: '"Gratitude turns what we have into enough. In honoring this moment of sweetness, you water the seeds of peace for everyone who crosses your path today. As within, so without."',
        practice: '🌿 Grounding Micro-Practice: Send a silent blessing of gratitude to someone who held space for you when you needed it most.'
      }
    };

    // Emotion Pill Selection
    pillBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        pillBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedEmotion = btn.getAttribute('data-emotion') || 'seeking-peace';
        
        const emotionLabel = btn.innerText.replace(/[^\w\s]/gi, '').trim();
        inputArea.setAttribute('placeholder', `Exploring "${emotionLabel}"... Add your own words or tap "Receive Hearth Reflection"`);
      });
    });

    // 432 Hz Bell Button
    if (btnChime432) {
      btnChime432.addEventListener('click', () => {
        playHealingBellKnock(1);
      });
    }

    // 528 Hz Bell Button
    if (btnChime528) {
      btnChime528.addEventListener('click', () => {
        playHealingBellKnock(2);
      });
    }

    // Receive Reflection Handler
    if (btnReceive) {
      btnReceive.addEventListener('click', async () => {
        const userText = (inputArea.value || '').trim();

        btnSpinner.style.display = 'inline-block';
        btnText.innerText = 'Listening to the Hearth...';
        btnReceive.disabled = true;

        // Play 432 Hz grounding chime on reflection request
        playHealingBellKnock(1);

        try {
          const apiKey = window.GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
          let customReflection = null;

          if (apiKey && userText.length > 5) {
            try {
              const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{
                    parts: [{
                      text: `You are the compassionate Hearth Keeper of Inner Sanctuary Wellness Foundation (IRS 501(c)(3)).
Our pillars: Pause. Breathe. Remember. Come home to yourself. Threefold method: Tune In (witness yourself), Express (honor your voice), Connect (experience belonging).
The visitor shares: "${userText}".
Provide a deeply compassionate, grounded 2-3 sentence reflection. Never use clinical medical jargon or robot corporate platitudes. Address them with warmth, poetic presence, and unhurried calm. Remind them they are worthy of rest and belonging. End with one gentle grounding action.`
                    }]
                  }]
                })
              });
              const data = await response.json();
              if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
                customReflection = data.candidates[0].content.parts[0].text.trim();
              }
            } catch (err) {
              console.warn('Gemini API fetch fallback to curated wisdom:', err);
            }
          }

          // Unhurried thoughtful pause (700ms)
          await new Promise(r => setTimeout(r, 700));

          if (customReflection) {
            resultTag.innerText = 'Gemini Reflection Spark';
            resultQuote.innerText = `"${customReflection}"`;
            resultPractice.innerHTML = '<strong>🌿 Grounding Micro-Practice:</strong> Take 3 conscious breaths with the Living Breath Orb above. As within, so without.';
          } else {
            const data = reflectionsDatabase[selectedEmotion] || reflectionsDatabase['seeking-peace'];
            resultTag.innerText = data.tag;
            resultQuote.innerText = data.quote;
            resultPractice.innerHTML = data.practice;
          }

          resultBox.style.display = 'block';
          resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        } catch (e) {
          console.error(e);
        } finally {
          btnSpinner.style.display = 'none';
          btnText.innerText = '✦ Receive Hearth Reflection';
          btnReceive.disabled = false;
        }
      });
    }
  }

  initHearthMirror();

  /* ==========================================================================
     13. LIVING TWILIGHT CONSTELLATION (ATMOSPHERIC BACKGROUND)
     ========================================================================== */
  function initTwilightConstellation() {
    const canvas = document.getElementById('twilightConstellationCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationId = null;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // 36 Ambient Living Stars & Hearth Embers
    const STAR_COUNT = 36;
    const stars = [];
    const colors = ['#FFFDF7', '#FCE6A2', '#C59A3F', '#E2C275'];

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.8,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.18 - 0.04, // Gentle upward drifting hearth breath
        baseAlpha: Math.random() * 0.45 + 0.35,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: Math.random() * 0.02 + 0.012,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      // Connective subtle constellation lines
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            const lineAlpha = (1 - dist / 90) * 0.16;
            ctx.strokeStyle = `rgba(197, 154, 63, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.phase += s.phaseSpeed;

        // Loop boundaries
        if (s.y < -10) s.y = height + 10;
        if (s.x < -10) s.x = width + 10;
        if (s.x > width + 10) s.x = -10;

        const currentAlpha = s.baseAlpha + Math.sin(s.phase) * 0.28;
        const clampedAlpha = Math.max(0.1, Math.min(1.0, currentAlpha));

        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(197, 154, 63, 0.4)';
        ctx.globalAlpha = clampedAlpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    }

    // Pause animation when tab is not active to save battery/CPU
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animationId) cancelAnimationFrame(animationId);
      } else {
        animationId = requestAnimationFrame(render);
      }
    });

    animationId = requestAnimationFrame(render);
  }

  initTwilightConstellation();

  /* ==========================================================================
     14. DIGITAL LABYRINTH MODAL CONTROLLER
     ========================================================================== */
  function initLabyrinthModal() {
    const modal = document.getElementById('labyrinthModal');
    const btnOpen = document.getElementById('btnOpenLabyrinth');
    const btnClose = document.getElementById('btnCloseLabyrinthModal');
    const travelerOrb = document.getElementById('modalTravelerOrb');
    const guidePath = document.getElementById('modalGuidePath');
    const thresholdBadge = document.getElementById('modalThresholdBadge');
    const thresholdQuote = document.getElementById('modalThresholdQuote');
    const btnAutoWalk = document.getElementById('btnModalAutoWalk');
    const btnChime528 = document.getElementById('btnModalChime528');
    const centerHearth = document.getElementById('modalCenterHearth');
    const labyrinthSvg = document.getElementById('modalLabyrinthSvg');

    if (!modal || !btnOpen) return;

    let isAutoWalking = false;
    let walkProgress = 0;
    let animId = null;
    let pathLength = 0;

    const thresholds = [
      { p: 0.0, badge: 'Threshold 1 • The Entry Gate', quote: '"Leave behind what you have been carrying outside the gate. Soften your jaw and let the room hold you."' },
      { p: 0.35, badge: 'Threshold 2 • The Turn Inward', quote: '"Notice the breath moving through you right now. There is nowhere else you need to be."' },
      { p: 0.70, badge: 'Threshold 3 • The Surrender', quote: '"You are safe to release the noise of the world. Peace is not found—it is remembered."' },
      { p: 0.96, badge: 'Threshold 4 • The Hearth Center', quote: '"You have arrived at the center of yourself. As within, so without."' }
    ];

    function updateTraveler(prg) {
      if (!guidePath) return;
      if (!pathLength) pathLength = guidePath.getTotalLength();
      const clamped = Math.max(0, Math.min(1, prg));
      const pt = guidePath.getPointAtLength(clamped * pathLength);
      travelerOrb.setAttribute('cx', pt.x);
      travelerOrb.setAttribute('cy', pt.y);

      let cur = thresholds[0];
      for (const t of thresholds) {
        if (clamped >= t.p) cur = t;
      }
      thresholdBadge.textContent = cur.badge;
      thresholdQuote.textContent = cur.quote;

      if (clamped >= 0.97) {
        playHealingBellKnock(2); // 528 Hz Silver chime
      }
    }

    function openModal() {
      modal.style.display = 'flex';
      playHealingBellKnock(1); // 432 Hz Bronze entrance chime
      setTimeout(() => {
        if (guidePath) pathLength = guidePath.getTotalLength();
        updateTraveler(0);
      }, 50);
    }

    function closeModal() {
      modal.style.display = 'none';
      if (isAutoWalking) {
        isAutoWalking = false;
        if (animId) cancelAnimationFrame(animId);
        btnAutoWalk.textContent = '▶ Begin Guided Walk';
      }
    }

    btnOpen.addEventListener('click', openModal);
    if (btnClose) btnClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Auto Walk
    btnAutoWalk.addEventListener('click', () => {
      if (walkProgress >= 1) walkProgress = 0;
      if (isAutoWalking) {
        isAutoWalking = false;
        btnAutoWalk.textContent = '▶ Resume Walk';
        if (animId) cancelAnimationFrame(animId);
      } else {
        isAutoWalking = true;
        btnAutoWalk.textContent = '⏸ Pause Walk';
        playHealingBellKnock(1);
        const duration = 20000;
        let start = null;
        const initial = walkProgress;

        function step(ts) {
          if (!start) start = ts;
          const el = ts - start;
          walkProgress = initial + (el / duration);
          if (walkProgress >= 1) {
            walkProgress = 1;
            updateTraveler(1);
            isAutoWalking = false;
            btnAutoWalk.textContent = '↺ Walk Again';
            return;
          }
          updateTraveler(walkProgress);
          if (isAutoWalking) animId = requestAnimationFrame(step);
        }
        animId = requestAnimationFrame(step);
      }
    });

    if (btnChime528) {
      btnChime528.addEventListener('click', () => playHealingBellKnock(2));
    }
    if (centerHearth) {
      centerHearth.addEventListener('click', () => {
        walkProgress = 1;
        updateTraveler(1);
      });
    }

    // Touch & Mouse Dragging on SVG
    let isDragging = false;
    function handleMove(e) {
      if (!isDragging || !guidePath) return;
      const rect = labyrinthSvg.getBoundingClientRect();
      const cx = e.clientX || (e.touches && e.touches[0].clientX);
      const cy = e.clientY || (e.touches && e.touches[0].clientY);
      if (!cx || !cy) return;

      const svgX = ((cx - rect.left) / rect.width) * 320;
      const svgY = ((cy - rect.top) / rect.height) * 320;

      if (!pathLength) pathLength = guidePath.getTotalLength();
      let bestDist = Infinity;
      let bestP = walkProgress;
      for (let i = 0; i <= 50; i++) {
        const prg = i / 50;
        const pt = guidePath.getPointAtLength(prg * pathLength);
        const dist = (pt.x - svgX) ** 2 + (pt.y - svgY) ** 2;
        if (dist < bestDist) {
          bestDist = dist;
          bestP = prg;
        }
      }
      if (bestDist < 1400) {
        walkProgress = bestP;
        updateTraveler(walkProgress);
      }
    }

    labyrinthSvg.addEventListener('mousedown', () => { isDragging = true; });
    window.addEventListener('mouseup', () => { isDragging = false; });
    labyrinthSvg.addEventListener('mousemove', handleMove);

    labyrinthSvg.addEventListener('touchstart', () => { isDragging = true; }, { passive: true });
    window.addEventListener('touchend', () => { isDragging = false; });
    labyrinthSvg.addEventListener('touchmove', handleMove, { passive: true });
  }

  initLabyrinthModal();

})();
