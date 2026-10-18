// Inner Sanctuary Wellness Foundation — Interactive Scripts & Forest Exploration Engine

document.addEventListener('DOMContentLoaded', () => {

  let soundscape = null;

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

    // Active Element State
    let currentElement = 'earth';

    const elementThemes = {
      earth: {
        name: "🌿 Earth & Forest Sanctuary",
        quote: "Root down so your branches may reach without fear. Feel your feet on the soil.",
        freq: 432,
        bg: "#F6F3EC",
        soundLabel: "Audible Forest Breeze • 432 Hz"
      },
      water: {
        name: "🌊 Water & Ocean Surf",
        quote: "Giving yourself permission to feel without judgment. Tears washing away hurry.",
        freq: 528,
        bg: "#EDF3F5",
        soundLabel: "Audible Ocean Waves • 528 Hz"
      },
      air: {
        name: "🌬️ Air & Mountain Wind",
        quote: "Unburdening the chest. Sounding your sacred voice and reclaiming your frequency.",
        freq: 639,
        bg: "#F2F5F8",
        soundLabel: "Audible Mountain Breeze • 639 Hz"
      },
      fire: {
        name: "🔥 Fire & Warm Hearth",
        quote: "Moving energy freely without permission or choreography. Pure creative spark.",
        freq: 741,
        bg: "#FAF2EC",
        soundLabel: "Crackling Warm Hearth • 741 Hz"
      },
      ether: {
        name: "🌌 Ether & Celestial Chimes",
        quote: "Realizing the sanctuary isn't a place we have to find; it is within you.",
        freq: 852,
        bg: "#F3EEF8",
        soundLabel: "Celestial Koshi Chimes • 852 Hz"
      }
    };

    // -------------------------------------------------------------
    // ELEMENT ANIMATION ENGINES (UNIQUE FOR EACH ELEMENT)
    // -------------------------------------------------------------

    // 1. EARTH: Fireflies & Floating Botanical Leaves
    class Firefly {
      constructor(startX, startY, isBurst = false) {
        this.x = startX !== undefined ? startX : Math.random() * width;
        this.y = startY !== undefined ? startY : Math.random() * height;
        this.size = Math.random() * 2.8 + 1.2;
        this.baseSize = this.size;
        this.isBurst = isBurst;
        this.alpha = Math.random() * 0.6 + 0.2;
        this.pulseSpeed = Math.random() * 0.03 + 0.01;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.vx = (Math.random() - 0.5) * (isBurst ? 2.5 : 0.6);
        this.vy = (Math.random() - 0.5) * (isBurst ? 2.5 : 0.6) - (isBurst ? 0.5 : 0.2);
        this.lifespan = isBurst ? 180 : Infinity;
        this.age = 0;
      }

      update() {
        this.age++;
        this.pulsePhase += this.pulseSpeed;
        this.vx += (Math.random() - 0.5) * 0.04;
        this.vy += (Math.random() - 0.5) * 0.04 - 0.005;

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
        const pulse = (Math.sin(this.pulsePhase) + 1) / 2;
        const currentAlpha = this.alpha * (0.3 + pulse * 0.7);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(197, 154, 63, ${currentAlpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(95, 123, 107, ${currentAlpha * 0.25})`;
        ctx.fill();
      }
    }

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
        this.color = Math.random() > 0.4 ? 'rgba(95, 123, 107, 0.22)' : 'rgba(197, 154, 63, 0.2)';
      }

      update() {
        this.time += this.oscillationSpeed;
        this.y += this.speedY;
        this.x = this.startX + Math.sin(this.time) * this.oscillationAmp;
        this.angle += this.rotationSpeed;
        if (this.y > height + 40) this.reset();
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.quadraticCurveTo(this.size * 0.7, 0, 0, this.size);
        ctx.quadraticCurveTo(-this.size * 0.7, 0, 0, -this.size);
        ctx.fill();
        ctx.restore();
      }
    }

    // 2. WATER: Translucent Shimmering Bubbles & Concentric Ripples
    class WaterBubble {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 20;
        this.radius = Math.random() * 6 + 3;
        this.speedY = Math.random() * 0.8 + 0.4;
        this.oscSpeed = Math.random() * 0.03 + 0.01;
        this.oscAmp = Math.random() * 18 + 8;
        this.startX = this.x;
        this.time = Math.random() * 50;
        this.alpha = Math.random() * 0.35 + 0.15;
      }

      update() {
        this.time += this.oscSpeed;
        this.y -= this.speedY;
        this.x = this.startX + Math.sin(this.time) * this.oscAmp;
        if (this.y < -30) this.reset();
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(92, 168, 185, ${this.alpha * 0.25})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(180, 225, 235, ${this.alpha * 0.8})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.35, this.y - this.radius * 0.35, this.radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.9})`;
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
          maxRadius: Math.random() * 40 + 35,
          alpha: 0.35
        });
      }
    });

    // 3. AIR: Flowing Wind Streams & Dandelion Seeds
    class DandelionSeed {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = init ? Math.random() * width : -30;
        this.y = Math.random() * height;
        this.speedX = Math.random() * 1.4 + 0.8;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 4 + 3;
        this.angle = Math.random() * Math.PI * 2;
        this.alpha = Math.random() * 0.3 + 0.2;
      }

      update() {
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

        if (this.x > width + 40 || this.y < -40 || this.y > height + 40) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.strokeStyle = `rgba(180, 210, 225, ${this.alpha})`;
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
        ctx.fillStyle = `rgba(150, 185, 205, ${this.alpha * 1.2})`;
        ctx.fill();
        ctx.restore();
      }
    }

    // 4. FIRE: Crackling Rising Embers & Sparks
    class FireEmber {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 10;
        this.size = Math.random() * 3 + 1.2;
        this.speedY = Math.random() * 1.8 + 0.9;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.alpha = Math.random() * 0.6 + 0.4;
        this.flickerSpeed = Math.random() * 0.1 + 0.05;
        this.hue = Math.random() > 0.4 ? '235, 125, 45' : '245, 190, 60';
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX + Math.sin(this.y * 0.03) * 0.6;
        this.alpha -= 0.0025;

        if (this.y < -20 || this.alpha <= 0) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.hue}, ${Math.max(0, this.alpha)})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.hue}, ${Math.max(0, this.alpha * 0.25)})`;
        ctx.fill();
      }
    }

    // 5. ETHER: Twinkling Starlight & Orbiting Stardust
    class CelestialStar {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.8;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.03 + 0.01;
        this.color = Math.random() > 0.5 ? 'rgba(197, 154, 63, ' : 'rgba(180, 150, 220, ';
      }

      update() {
        this.phase += this.speed;
      }

      draw() {
        const twinkle = (Math.sin(this.phase) + 1) / 2;
        const a = 0.2 + twinkle * 0.65;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}${a})`;
        ctx.fill();

        if (twinkle > 0.8) {
          ctx.strokeStyle = `${this.color}${a * 0.7})`;
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
      constructor() {
        this.angle = Math.random() * Math.PI * 2;
        this.radius = Math.random() * 120 + 30;
        this.speed = (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
        this.size = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.4 + 0.2;
      }

      update() {
        this.angle += this.speed;
      }

      draw() {
        const ox = mouse.x + Math.cos(this.angle) * this.radius;
        const oy = mouse.y + Math.sin(this.angle) * (this.radius * 0.6);
        ctx.beginPath();
        ctx.arc(ox, oy, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(185, 145, 235, ${this.alpha})`;
        ctx.fill();
      }
    }

    // Initialize particle arrays
    const earthFireflies = [];
    for (let i = 0; i < 40; i++) earthFireflies.push(new Firefly());

    const earthLeaves = [];
    for (let i = 0; i < 12; i++) earthLeaves.push(new DriftingLeaf());

    const waterBubbles = [];
    for (let i = 0; i < 30; i++) waterBubbles.push(new WaterBubble());

    const airSeeds = [];
    for (let i = 0; i < 25; i++) airSeeds.push(new DandelionSeed());

    const fireEmbers = [];
    for (let i = 0; i < 45; i++) fireEmbers.push(new FireEmber());

    const etherStars = [];
    for (let i = 0; i < 60; i++) etherStars.push(new CelestialStar());

    const etherOrbiters = [];
    for (let i = 0; i < 20; i++) etherOrbiters.push(new OrbitingStardust());

    // Main animation render loop
    function animate() {
      ctx.clearRect(0, 0, width, height);

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
        // Multi-layered Rolling Ocean Swell Waves
        const time = Date.now() * 0.001;
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
        ctx.fillStyle = 'rgba(92, 168, 185, 0.06)';
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
        ctx.fillStyle = 'rgba(142, 204, 218, 0.08)';
        ctx.fill();
        ctx.restore();

        // Water Mouse Ripples
        for (let r = waterRipples.length - 1; r >= 0; r--) {
          const rip = waterRipples[r];
          rip.radius += 0.8;
          rip.alpha -= 0.008;
          if (rip.alpha <= 0 || rip.radius > rip.maxRadius) {
            waterRipples.splice(r, 1);
          } else {
            ctx.beginPath();
            ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(142, 204, 218, ${rip.alpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }

        // Render Water Bubbles
        waterBubbles.forEach(b => {
          b.update();
          b.draw();
        });
      } else if (currentElement === 'air') {
        // Sweeping Wind Breeze Streaks
        const t = Date.now() * 0.001;
        ctx.save();
        ctx.strokeStyle = 'rgba(180, 215, 230, 0.12)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          const yBase = height * (0.25 + i * 0.2);
          ctx.beginPath();
          ctx.moveTo(-50, yBase);
          for (let x = -50; x <= width + 50; x += 30) {
            const y = yBase + Math.sin(x * 0.004 + t * (1.2 + i * 0.3)) * 24;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();

        // Render Dandelion Seeds
        airSeeds.forEach(s => {
          s.update();
          s.draw();
        });
      } else if (currentElement === 'fire') {
        // Warm Pulsing Hearth Glow at bottom
        const fireTime = Date.now() * 0.002;
        const hearthPulse = (Math.sin(fireTime) + 1) / 2;
        const hearthGrad = ctx.createRadialGradient(width / 2, height + 40, 20, width / 2, height + 40, height * 0.6);
        hearthGrad.addColorStop(0, `rgba(235, 125, 45, ${0.14 + hearthPulse * 0.06})`);
        hearthGrad.addColorStop(0.6, `rgba(245, 185, 60, ${0.05 + hearthPulse * 0.03})`);
        hearthGrad.addColorStop(1, 'rgba(250, 242, 236, 0)');
        ctx.fillStyle = hearthGrad;
        ctx.fillRect(0, 0, width, height);

        // Render Rising Embers
        fireEmbers.forEach(e => {
          e.update();
          e.draw();
        });
      } else if (currentElement === 'ether') {
        // Render Sacred Celestial Rings in Center
        const ringTime = Date.now() * 0.001;
        const ringPulse = (Math.sin(ringTime * 0.5) + 1) / 2;
        ctx.save();
        ctx.strokeStyle = `rgba(180, 150, 220, ${0.06 + ringPulse * 0.05})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(width / 2, height * 0.45, 120 + ringPulse * 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(width / 2, height * 0.45, 200 + ringPulse * 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Render Celestial Stars
        etherStars.forEach(s => {
          s.update();
          s.draw();
        });

        // Orbiting Stardust motes around cursor
        etherOrbiters.forEach(o => {
          o.update();
          o.draw();
        });
      } else {
        // Earth: Drifting Leaves & Fireflies
        earthLeaves.forEach(l => {
          l.update();
          l.draw();
        });
        earthFireflies.forEach(f => {
          f.update();
          f.draw();
        });
      }

      requestAnimationFrame(animate);
    }

    animate();

    // =========================================================================
    // 1B. AUTHENTIC STUDIO SOUNDSCAPE ENGINE (REAL NATURAL AUDIO STEMS)
    // =========================================================================
    class RealAudioSoundscape {
      constructor() {
        this.isPlaying = false;
        this.currentElement = 'earth';
        this.volume = 0.7;
        this.audioCache = {};
        this.activeAudio = null;
        this.fadeInterval = null;
        this.breathInterval = null;
        this.isBreathingSync = false;

        // High-definition authentic natural recordings
        this.tracks = {
          earth: 'audio/birds.mp3',      // Lush forest canopy & morning birdsong
          water: 'audio/ocean.mp3',      // Rolling Pacific ocean surf & breaking waves
          air: 'audio/wind.mp3',        // Deep mountain wind & airy breeze
          fire: 'audio/fireplace.mp3',  // Crackling wood fireplace with real pops & embers
          ether: 'audio/ether.ogg'      // Inviting celestial Koshi wind chimes
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
            this.fadeIn(audio, this.volume, 900);
          }).catch(() => {
            // Browser autoplay suppression handled gracefully
          });
        }
      }

      fadeIn(audio, targetVolume, duration = 800) {
        clearInterval(this.fadeInterval);
        const stepTime = 40;
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
        const stepTime = 40;
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

      crossfadeTo(newElement) {
        const prevAudio = this.activeAudio;
        const nextAudio = this.getAudio(newElement);
        this.activeAudio = nextAudio;

        const playPromise = nextAudio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            this.fadeIn(nextAudio, this.volume, 900);
            if (prevAudio && prevAudio !== nextAudio) {
              this.fadeOut(prevAudio, () => {
                prevAudio.pause();
              }, 700);
            }
          }).catch(() => {});
        }
      }

      // Real-time breathwork volume swell & release
      syncBreath(stepName, durationSec) {
        if (!this.isPlaying || !this.activeAudio) return;
        this.isBreathingSync = true;
        const targetVol = this.volume;

        if (stepName === 'inhale') {
          // Breeze/surf swells up
          this.rampVolume(this.activeAudio, Math.min(1.0, targetVol * 1.35), durationSec * 1000);
        } else if (stepName === 'hold') {
          // Gentle floating calm
          this.rampVolume(this.activeAudio, targetVol * 1.1, durationSec * 1000);
        } else if (stepName === 'exhale') {
          // Gently washes away and recedes
          this.rampVolume(this.activeAudio, Math.max(0.12, targetVol * 0.42), durationSec * 1000);
        } else {
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
          labelElem.textContent = playing ? 'Soundscape: Playing' : 'Soundscape: Off';
        }
      }
    }

    soundscape = new RealAudioSoundscape();
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
    // 1C. ELEMENT THEME SWITCHING COORDINATOR
    // =========================================================================
    function switchElementTheme(elKey, userTriggered = true) {
      if (!elementThemes[elKey]) return;
      currentElement = elKey;
      const theme = elementThemes[elKey];

      // Update Top Bar Pills
      document.querySelectorAll('.element-pill-btn').forEach(pill => {
        const matches = pill.dataset.element === elKey;
        pill.classList.toggle('active', matches);
        pill.setAttribute('aria-selected', matches ? 'true' : 'false');
      });

      // Update Labels
      const nameElem = document.getElementById('active-element-name');
      const quoteElem = document.getElementById('active-element-quote');
      if (nameElem) nameElem.textContent = theme.name;
      if (quoteElem) quoteElem.textContent = `"${theme.quote}"`;

      // Update Body Theme attribute for smooth background shift
      document.body.setAttribute('data-element', elKey);

      // Update Soundscape
      soundscape.setElement(elKey);

      if (userTriggered) {
        playHarmonicTone(theme.freq, 0.9);
        createHeartFlourish();
        showToast(`✨ Tuned into ${theme.name}: ${theme.soundLabel}`);
      }
    }

    // Bind Top Bar Element Selector Pills (One-Tap Immersion)
    document.querySelectorAll('.element-pill-btn').forEach(pill => {
      pill.addEventListener('click', () => {
        switchElementTheme(pill.dataset.element, true);
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
      placeholder: 'Tell us about your craft (poetry, music, storytelling, visual art), or share how you’d like to join or perform in our upcoming circle...',
      buttonText: 'Send to Sanctuary Leadership ✉️'
    },
    'donor': {
      selectVal: '$1 Community Seed Donor',
      placeholder: 'Let us know how you’d like to support the $1 movement, or leave a word of encouragement for our creative circle...',
      buttonText: 'Send to Sanctuary Leadership ✉️'
    },
    'sponsor': {
      selectVal: 'Corporate / Business Sponsor',
      placeholder: 'Share your organization name, preferred sponsorship tier ($500 Presenting Partner or $100 Community Neighbor), and CRA objectives...',
      buttonText: 'Request Sponsorship Details ✉️'
    },
    'raffle': {
      selectVal: 'Raffle & In-Kind Donor',
      placeholder: 'Tell us about your gift card contribution (1–5 $5 cards) or botanical/refreshment donations for our community showcase series...',
      buttonText: 'Pledge Raffle Item ✉️'
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
  // 7. SOMATIC BREATHING & PAUSE ORB ENGINE
  // =========================================================================
  const orb = document.getElementById('somatic-orb');
  const orbBtn = document.getElementById('orb-toggle-btn');
  const orbLabel = document.getElementById('orb-btn-label');
  const guideText = document.getElementById('breathing-guide-text');
  const orbIcon = document.getElementById('orb-icon');

  const countdownBadge = document.getElementById('breathing-countdown-badge');
  const countdownText = document.getElementById('countdown-text');
  const boxPhaseTitle = document.getElementById('box-phase-title');
  const boxPhaseCountdown = document.getElementById('box-phase-countdown');
  const tracerDot = document.getElementById('box-tracer-dot');

  let countdownTimer = null;
  let breathInterval = null;
  let breathStep = 0;
  let isBreathingActive = false;
  let tracerAnimId = null;
  let phaseStartTime = null;

  // Warm Female Voice Guide System
  let isVoiceGuideEnabled = true;
  const voiceGuideToggleBtn = document.getElementById('voice-guide-toggle-btn');
  const voiceGuideStatus = document.getElementById('voice-guide-status');

  const voiceAudioTracks = {
    0: new Audio('audio/voice_inhale.wav'),
    1: new Audio('audio/voice_hold.wav'),
    2: new Audio('audio/voice_exhale.wav'),
    3: new Audio('audio/voice_remember.wav')
  };

  Object.values(voiceAudioTracks).forEach(a => {
    a.preload = 'auto';
    a.volume = 0.95;
  });

  if (voiceGuideToggleBtn) {
    voiceGuideToggleBtn.addEventListener('click', () => {
      isVoiceGuideEnabled = !isVoiceGuideEnabled;
      voiceGuideToggleBtn.classList.toggle('active', isVoiceGuideEnabled);
      voiceGuideToggleBtn.classList.toggle('muted', !isVoiceGuideEnabled);
      voiceGuideToggleBtn.setAttribute('aria-pressed', isVoiceGuideEnabled ? 'true' : 'false');
      if (voiceGuideStatus) {
        voiceGuideStatus.textContent = isVoiceGuideEnabled ? 'On (Warm Voice)' : 'Off (Muted)';
      }
      showToast(isVoiceGuideEnabled ? '🎙️ Warm female guided voice enabled.' : '🔇 Guided voice muted.');
    });
  }

  function speakVoiceGuide(stepIdx) {
    if (!isVoiceGuideEnabled) return;

    let speechUsed = false;
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const phrases = [
          "Inhale gently. One... two... three... four.",
          "Hold in stillness. One... two... three... four.",
          "Exhale slowly. One... two... three... four.",
          "Hold and remember. One... two... three... four."
        ];
        const text = phrases[stepIdx];
        if (text) {
          const utter = new SpeechSynthesisUtterance(text);
          utter.rate = 0.82;
          utter.pitch = 1.0;
          utter.volume = 0.95;

          const voices = window.speechSynthesis.getVoices();
          const femaleVoice = voices.find(v => 
            (v.name.includes('Jenny') || v.name.includes('Aria') || v.name.includes('Zira') || 
             v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen') ||
             v.name.includes('Female') || v.name.includes('Google US English')) &&
            !v.name.includes('David') && !v.name.includes('Mark') && !v.name.includes('Male')
          );
          if (femaleVoice) {
            utter.voice = femaleVoice;
            window.speechSynthesis.speak(utter);
            speechUsed = true;
          }
        }
      } catch (err) {
        speechUsed = false;
      }
    }

    if (!speechUsed && voiceAudioTracks[stepIdx]) {
      try {
        const clip = voiceAudioTracks[stepIdx];
        clip.currentTime = 0;
        clip.play().catch(() => {});
      } catch (e) {}
    }
  }

  // 4x4 Box Breathing Coordinates on SVG Canvas (320x320)
  const boxEdgeCoords = [
    { startX: 30, startY: 290, endX: 30, endY: 30, title: "INHALE", badgeId: "box-badge-left", lineId: "box-line-left", guide: "↑ Up left side: Inhale deeply opening your inner sanctuary", icon: "🌱" },
    { startX: 30, startY: 30, endX: 290, endY: 30, title: "HOLD", badgeId: "box-badge-top", lineId: "box-line-top", guide: "→ Across top: Hold in stillness feeling peace within", icon: "✨" },
    { startX: 290, startY: 30, endX: 290, endY: 290, title: "EXHALE", badgeId: "box-badge-right", lineId: "box-line-right", guide: "↓ Down right side: Exhale slowly releasing what you carry", icon: "💨" },
    { startX: 290, startY: 290, endX: 30, endY: 290, title: "HOLD & REMEMBER", badgeId: "box-badge-bottom", lineId: "box-line-bottom", guide: "← Across bottom: Hold & remember sanctuary is within you", icon: "🕊️" }
  ];

  function updateTracer(now) {
    if (!isBreathingActive) return;
    if (!phaseStartTime) phaseStartTime = now;
    const elapsed = now - phaseStartTime;
    const progress = Math.min(1, elapsed / 4000);
    const edge = boxEdgeCoords[breathStep];

    const curX = edge.startX + (edge.endX - edge.startX) * progress;
    const curY = edge.startY + (edge.endY - edge.startY) * progress;

    if (tracerDot) {
      tracerDot.setAttribute('cx', curX);
      tracerDot.setAttribute('cy', curY);
    }

    // Dynamic Central Orb Expansion/Contraction
    if (orb) {
      if (breathStep === 0) {
        const s = 1.0 + progress * 0.35;
        orb.style.transform = `scale(${s})`;
      } else if (breathStep === 1) {
        const float = Math.sin(progress * Math.PI) * 0.04;
        orb.style.transform = `scale(${1.35 + float})`;
      } else if (breathStep === 2) {
        const s = 1.35 - progress * 0.35;
        orb.style.transform = `scale(${s})`;
      } else {
        orb.style.transform = `scale(1.0)`;
      }
    }

    if (progress < 1) {
      tracerAnimId = requestAnimationFrame(updateTracer);
    }
  }

  function startSomaticBreath() {
    if (isBreathingActive) {
      stopSomaticBreath();
      return;
    }

    isBreathingActive = true;
    if (orb) orb.classList.add('active');
    if (orbLabel) orbLabel.textContent = "Pause Box Breath";
    if (orbBtn) orbBtn.style.background = "var(--forest-green)";
    if (orbBtn) orbBtn.style.color = "#FFFFFF";

    // Auto-immerse with real audio soundscape
    if (soundscape && !soundscape.isPlaying) {
      soundscape.start();
      showToast("🍃 Natural soundscape is now breathing in sync with your breath...");
    }

    breathStep = 0;
    runBreathStep();
  }

  function runBreathStep() {
    if (!isBreathingActive) return;

    const edge = boxEdgeCoords[breathStep];
    if (guideText) guideText.textContent = edge.guide;
    if (orbIcon) orbIcon.textContent = edge.icon;
    if (boxPhaseTitle) boxPhaseTitle.textContent = edge.title;

    // Highlight active side badge and SVG line
    document.querySelectorAll('.box-side-badge').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.box-edge-line').forEach(l => l.classList.remove('active'));

    const currentBadge = document.getElementById(edge.badgeId);
    const currentLine = document.getElementById(edge.lineId);
    if (currentBadge) currentBadge.classList.add('active');
    if (currentLine) currentLine.classList.add('active');

    // Smooth tracer dot animation
    phaseStartTime = performance.now();
    cancelAnimationFrame(tracerAnimId);
    tracerAnimId = requestAnimationFrame(updateTracer);

    // Harmonic Solfeggio Chime on each breath transition
    const stepFrequencies = [432, 528, 396, 852];
    playHarmonicTone(stepFrequencies[breathStep] || 432, 0.9);

    // Warm female guided voice with 1-2-3-4 count
    speakVoiceGuide(breathStep);

    // Real-time breathwork sync with authentic soundscape
    if (soundscape && soundscape.isPlaying) {
      if (breathStep === 0) {
        soundscape.syncBreath('inhale', 4.0);
      } else if (breathStep === 1) {
        soundscape.syncBreath('hold', 4.0);
      } else if (breathStep === 2) {
        soundscape.syncBreath('exhale', 4.0);
      } else {
        soundscape.syncBreath('hold', 4.0);
      }
    }

    // Second-by-second countdown display
    let secondsLeft = 4;
    clearInterval(countdownTimer);
    if (boxPhaseCountdown) boxPhaseCountdown.textContent = `${secondsLeft}s`;
    if (countdownText) countdownText.textContent = `${edge.title}: ${secondsLeft}s`;

    countdownTimer = setInterval(() => {
      secondsLeft--;
      if (secondsLeft > 0) {
        if (boxPhaseCountdown) boxPhaseCountdown.textContent = `${secondsLeft}s`;
        if (countdownText) countdownText.textContent = `${edge.title}: ${secondsLeft}s`;
      } else {
        clearInterval(countdownTimer);
      }
    }, 1000);

    breathStep = (breathStep + 1) % boxEdgeCoords.length;
    breathInterval = setTimeout(runBreathStep, 4000);
  }

  function stopSomaticBreath() {
    isBreathingActive = false;
    clearTimeout(breathInterval);
    clearInterval(countdownTimer);
    cancelAnimationFrame(tracerAnimId);

    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    Object.values(voiceAudioTracks).forEach(a => {
      try { a.pause(); a.currentTime = 0; } catch (e) {}
    });

    if (orb) {
      orb.classList.remove('active');
      orb.style.transform = 'scale(1.0)';
    }
    if (orbLabel) orbLabel.textContent = "Begin 4x4 Somatic Box Breathing";
    if (orbBtn) orbBtn.style.background = "";
    if (orbBtn) orbBtn.style.color = "";
    if (guideText) guideText.textContent = "Click the orb or button to begin Somatic Box Breath";
    if (orbIcon) orbIcon.textContent = "🌿";
    if (boxPhaseTitle) boxPhaseTitle.textContent = "PAUSE";
    if (boxPhaseCountdown) boxPhaseCountdown.textContent = "4s";

    // Reset tracer dot to bottom-left origin
    if (tracerDot) {
      tracerDot.setAttribute('cx', 30);
      tracerDot.setAttribute('cy', 290);
    }
    document.querySelectorAll('.box-side-badge').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.box-edge-line').forEach(l => l.classList.remove('active'));
  }

  if (orb) {
    orb.addEventListener('click', startSomaticBreath);
  }
  if (orbBtn) {
    orbBtn.addEventListener('click', startSomaticBreath);
  }

  // =========================================================================
  // 8. OUR MEDICINE: LSD INTERACTIVE FREQUENCY RESONANCE
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
        const title = titleElem ? titleElem.textContent.trim() : 'LSD Medicine';
        showToast(`✨ Tuning into ${title}: Giving ourselves permission to be human.`);
      }
    });
  });

  // Pure Web Audio API Harmonic Chime (Grounding Somatic Frequencies)
  function playHarmonicTone(frequency, durationSec = 1.0) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const audioCtx = new AudioContext();
      
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + durationSec);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + durationSec);
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
      showToast("✦ Joining the circle on Meetup! Opening community group...");
    });
  }

  // =========================================================================
  // 10. "STAY IN THE LOOP" NEWSLETTER / CIRCLE FORM (DUAL EMAIL ROUTING)
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
      const originalText = btn ? btn.innerHTML : 'Join the Circle 🌿';
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
            _subject: `New Member Joined The Circle: ${name} (${email}) • Inner Sanctuary`
          })
        });
      } catch (err) {
        // Fallback continues smoothly
      } finally {
        if (btn) btn.innerHTML = originalText;
      }

      playHarmonicTone(528, 1.2);
      createHeartFlourish();
      showToast(`🌿 Welcome to the circle, ${name}! Both hello@innersanctuarywellnessfoundation.org & innersanctuary0@gmail.com have received your email.`);
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

});

