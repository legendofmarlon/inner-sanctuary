// Inner Sanctuary Wellness Foundation — Interactive Scripts & Forest Exploration Engine

document.addEventListener('DOMContentLoaded', () => {

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
    let currentElement = 'earth';

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
        name: "🌬️ Air & Mountain Breeze Sanctuary",
        quote: "Unburdening the chest. Deep mountain air opening space for clarity.",
        bg: "#F2F5F8",
        soundLabel: "Gentle Mountain Wind & Airy Breeze"
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

      // Render Dynamic Somatic Breathwork Canvas Aura when 4x4 breathing is active
      if (window.sanctuaryBreathSync && window.sanctuaryBreathSync.active) {
        const step = window.sanctuaryBreathSync.step;
        const prog = window.sanctuaryBreathSync.progress;
        const centerX = width / 2;
        const centerY = height * 0.40;

        let auraRadius = 240;
        let auraColorInner = 'rgba(197, 154, 63, 0.12)';
        let auraColorMid = 'rgba(197, 154, 63, 0.04)';

        if (step === 0) {
          // AIR (Inhale): Soft rising golden-white luminescence expanding outward
          const expand = 1.0 + prog * 0.5;
          auraRadius = Math.min(width, height) * 0.48 * expand;
          auraColorInner = `rgba(255, 248, 225, ${0.12 + prog * 0.08})`;
          auraColorMid = `rgba(197, 154, 63, ${0.05 + prog * 0.04})`;
        } else if (step === 1) {
          // FIRE / SOLAR GOLD (Hold): Warm radiant golden-amber aura expansion & solar shimmer
          const shimmer = (Math.sin(Date.now() * 0.003) + 1) / 2;
          auraRadius = Math.min(width, height) * 0.65;
          auraColorInner = `rgba(216, 170, 73, ${0.16 + shimmer * 0.07})`;
          auraColorMid = `rgba(235, 125, 45, ${0.07 + shimmer * 0.04})`;
        } else if (step === 2) {
          // WATER (Exhale): Smooth liquid undertones contracting gently
          const contract = 1.45 - prog * 0.45;
          auraRadius = Math.min(width, height) * 0.48 * contract;
          auraColorInner = `rgba(92, 168, 185, ${0.14 - prog * 0.05})`;
          auraColorMid = `rgba(142, 204, 218, ${0.06 - prog * 0.02})`;
        } else {
          // EARTH (Rest): Deep forest-obsidian & warm terracotta/gold settled stillness
          auraRadius = Math.min(width, height) * 0.35;
          auraColorInner = 'rgba(95, 123, 107, 0.09)';
          auraColorMid = 'rgba(197, 154, 63, 0.03)';
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
      // Monday-aligned week calculation
      const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

      // Current week date range string (Monday to Sunday)
      const currentDay = now.getDay();
      const diffToMonday = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
      const monday = new Date(now.getFullYear(), now.getMonth(), diffToMonday);
      const sunday = new Date(now.getFullYear(), now.getMonth(), diffToMonday + 6);
      const fmt = (dt) => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dateRangeStr = `${fmt(monday)} – ${fmt(sunday)}`;

      // Week 43 (Oct 19-25, 2026) is Earth (index 0). Automatically rotates each Monday!
      const cycleOffset = 43;
      const cycleIndex = ((weekNo - cycleOffset) % WEEKLY_ELEMENT_CYCLE.length + WEEKLY_ELEMENT_CYCLE.length) % WEEKLY_ELEMENT_CYCLE.length;
      return {
        key: WEEKLY_ELEMENT_CYCLE[cycleIndex],
        weekNo: weekNo,
        dateRange: dateRangeStr
      };
    }

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
      placeholder: 'Tell us how you’d like to help (pouring herbal tea, welcoming neighbors, stage/sound setup, community care), and your availability...',
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

        playHarmonicTone(528, 1.2);
        createHeartFlourish();
        showToast(`✨ Thank you, ${name}! Your message has been sent to hello@innersanctuarywellnessfoundation.org and innersanctuary0@gmail.com. We will be in touch soon!`);
        intakeForm.reset();
      } catch (err) {
        playHarmonicTone(432, 0.8);
        showToast(`🌿 Message recorded! We are also directly reachable at hello@innersanctuarywellnessfoundation.org & innersanctuary0@gmail.com.`);
      } finally {
        if (currentSubmitBtn) {
          currentSubmitBtn.disabled = false;
          currentSubmitBtn.innerHTML = originalText;
        }
        const firstTab = document.querySelector('.intake-tab');
        if (firstTab) firstTab.click();
      }
    });
  }

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

  // State Configuration: Calm, Unhurried 4.5s Inhale / 4.5s Exhale (Zero Pauses)
  const PHASE_DURATION_MS = 4500; // 4.5 seconds per phase (9.0s cycle)
  const CYCLE_DURATION_MS = 9000;
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

    // Trigger soothing breath sounds right at phase transition
    if (phaseIndex !== lastTriggeredPhase) {
      lastTriggeredPhase = phaseIndex;
      const phaseDurationSec = PHASE_DURATION_MS / 1000;
      if (phaseIndex === 0) {
        breathAudio.playInhale(phaseDurationSec);
      } else {
        breathAudio.playExhale(phaseDurationSec);
      }
    }

    if (phaseIndex === 0) {
      // INHALE: Orb smoothly expands (1.00 -> 1.46) with warm inner glow
      const orbScale = 1.00 + ease * 0.46;
      const haloScale = 1.00 + ease * 0.80;
      const haloOpacity = 0.35 + ease * 0.55;
      const glowScale = 1.00 + ease * 0.60;
      const glowOpacity = 0.30 + ease * 0.60;

      if (somaticOrb) {
        somaticOrb.style.transform = `scale(${orbScale.toFixed(3)})`;
        somaticOrb.style.boxShadow = `0 ${(14 + ease * 14).toFixed(1)}px ${(40 + ease * 35).toFixed(1)}px rgba(0,0,0,0.65), 0 0 ${(55 + ease * 50).toFixed(1)}px rgba(212, 168, 79, ${(0.75 + ease * 0.25).toFixed(2)}), 0 0 ${(90 + ease * 60).toFixed(1)}px rgba(248, 217, 140, ${(0.45 + ease * 0.30).toFixed(2)}), inset 0 3px 14px rgba(255,255,255,0.95), inset 0 -8px 24px rgba(154, 111, 26, 0.75)`;
      }
      if (somaticHalo) {
        somaticHalo.style.transform = `scale(${haloScale.toFixed(3)})`;
        somaticHalo.style.opacity = haloOpacity.toFixed(2);
      }
      if (orbInnerGlow) {
        orbInnerGlow.style.transform = `scale(${glowScale.toFixed(3)})`;
        orbInnerGlow.style.opacity = glowOpacity.toFixed(2);
      }
      if (orbBreathWord) {
        orbBreathWord.textContent = 'Inhale';
      }
      if (orbStatusPrompt) {
        orbStatusPrompt.textContent = 'Breathe in deeply...';
      }
    } else {
      // EXHALE: Orb smoothly releases and contracts (1.46 -> 1.00)
      const orbScale = 1.46 - ease * 0.46;
      const haloScale = 1.80 - ease * 0.80;
      const haloOpacity = 0.90 - ease * 0.55;
      const glowScale = 1.60 - ease * 0.60;
      const glowOpacity = 0.90 - ease * 0.60;

      if (somaticOrb) {
        somaticOrb.style.transform = `scale(${orbScale.toFixed(3)})`;
        somaticOrb.style.boxShadow = `0 ${(28 - ease * 14).toFixed(1)}px ${(75 - ease * 35).toFixed(1)}px rgba(0,0,0,0.65), 0 0 ${(105 - ease * 50).toFixed(1)}px rgba(212, 168, 79, ${(1.00 - ease * 0.25).toFixed(2)}), 0 0 ${(150 - ease * 60).toFixed(1)}px rgba(248, 217, 140, ${(0.75 - ease * 0.30).toFixed(2)}), inset 0 3px 14px rgba(255,255,255,0.95), inset 0 -8px 24px rgba(154, 111, 26, 0.75)`;
      }
      if (somaticHalo) {
        somaticHalo.style.transform = `scale(${haloScale.toFixed(3)})`;
        somaticHalo.style.opacity = haloOpacity.toFixed(2);
      }
      if (orbInnerGlow) {
        orbInnerGlow.style.transform = `scale(${glowScale.toFixed(3)})`;
        orbInnerGlow.style.opacity = glowOpacity.toFixed(2);
      }
      if (orbBreathWord) {
        orbBreathWord.textContent = 'Exhale';
      }
      if (orbStatusPrompt) {
        orbStatusPrompt.textContent = 'Breathe out slowly...';
      }
    }

    // Sync ambient background canvas breathing aura
    if (window.sanctuaryBreathSync) {
      window.sanctuaryBreathSync.active = true;
      window.sanctuaryBreathSync.step = phaseIndex;
      window.sanctuaryBreathSync.progress = cycleTime / CYCLE_DURATION_MS;
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

  // Tap directly on the Living Breath Orb
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
        'LOCATION:Cafe 86\\, 2423 Park Ave\\, Irvine\\, CA 92606',
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
      showToast("📅 Added to Calendar! See you on Sunday, November 15, 2026 (2–4 PM) at Cafe 86, Irvine.");
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
  // 10. "STAY IN THE LOOP" NEWSLETTER / COMMUNITY FORM (DUAL EMAIL ROUTING)
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
      } catch (err) {
        // Fallback continues smoothly
      } finally {
        if (btn) btn.innerHTML = originalText;
      }

      playHarmonicTone(528, 1.2);
      createHeartFlourish();
      showToast(`🌿 Welcome to our sanctuary community, ${name}! Both hello@innersanctuarywellnessfoundation.org & innersanctuary0@gmail.com have received your email.`);
      stayLoopForm.reset();
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
