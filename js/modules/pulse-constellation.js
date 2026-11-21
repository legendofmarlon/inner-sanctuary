/**
 * Inner Sanctuary Wellness Foundation — Live Pulse Constellation
 * Visualizes anonymous community somatic check-ins as an interactive, breathing celestial map
 */
(function() {
  'use strict';

  const COLOR_PALETTE = {
    processing: { r: 216, g: 170, b: 73, hex: '#D8AA49', label: 'Processing the Day' },
    tension:    { r: 95,  g: 123, b: 107, hex: '#5F7B6B', label: 'Holding Tension' },
    battery:    { r: 229, g: 178, b: 93, hex: '#E5B25D', label: 'Low on Battery' },
    peace:      { r: 77,  g: 122, b: 98, hex: '#4D7A62', label: 'At Peace & Open' }
  };

  let canvas = null;
  let ctx = null;
  let animFrameId = null;
  let nodes = [];
  let dpr = 1;

  function initConstellation() {
    canvas = document.getElementById('pulseConstellationCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', debounce(resizeCanvas, 150));

    fetchPulseTelemetry();
    startAnimationLoop();

    // Auto-poll every 60 seconds
    setInterval(fetchPulseTelemetry, 60000);
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Re-seed node positions if first run
    if (nodes.length === 0) {
      seedDefaultNodes(rect.width, rect.height);
    }
  }

  function seedDefaultNodes(w, h) {
    const states = ['peace', 'processing', 'tension', 'battery'];
    nodes = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const state = states[i % states.length];
      nodes.push(createNode(state, w, h, Math.random() * 0.5 + 0.5));
    }
  }

  function createNode(state, width, height, intensity = 0.8) {
    const w = width || (canvas ? canvas.getBoundingClientRect().width : 800);
    const h = height || (canvas ? canvas.getBoundingClientRect().height : 340);
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.15 + Math.random() * 0.25;

    return {
      x: 30 + Math.random() * (w - 60),
      y: 25 + Math.random() * (h - 50),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      state: state || 'peace',
      baseRadius: 3.5 + Math.random() * 3,
      intensity: intensity,
      pulsePhase: Math.random() * Math.PI * 2
    };
  }

  function fetchPulseTelemetry() {
    fetch('/.netlify/functions/pulse-stream')
      .then(res => res.json())
      .then(data => {
        updateTelemetryUI(data);
        if (data.nodes && Array.isArray(data.nodes) && canvas) {
          const rect = canvas.getBoundingClientRect();
          // Update or add nodes
          data.nodes.forEach((n, idx) => {
            if (!nodes[idx]) {
              nodes.push(createNode(n.state, rect.width, rect.height, n.intensity));
            } else {
              nodes[idx].state = n.state;
              nodes[idx].intensity = n.intensity;
            }
          });
        }
      })
      .catch(err => {
        // Fallback with graceful mock representation
        const mockBreakdown = {
          totalCheckins24h: nodes.length || 36,
          percentages: { processing: 32, tension: 25, battery: 18, peace: 25 }
        };
        updateTelemetryUI(mockBreakdown);
      });
  }

  function updateTelemetryUI(data) {
    const totalEl = document.getElementById('pulseTotalCount');
    if (totalEl && data.totalCheckins24h !== undefined) {
      totalEl.textContent = data.totalCheckins24h;
    }

    if (data.percentages) {
      const p1 = document.getElementById('pulsePctProcessing');
      const p2 = document.getElementById('pulsePctTension');
      const p3 = document.getElementById('pulsePctBattery');
      const p4 = document.getElementById('pulsePctPeace');

      if (p1) p1.textContent = `${data.percentages.processing}%`;
      if (p2) p2.textContent = `${data.percentages.tension}%`;
      if (p3) p3.textContent = `${data.percentages.battery}%`;
      if (p4) p4.textContent = `${data.percentages.peace}%`;
    }
  }

  function startAnimationLoop() {
    let lastTime = performance.now();

    function render(currentTime) {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!canvas || !ctx) {
        animFrameId = requestAnimationFrame(render);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // Global breath sync factor (oscillates between 0 and 1 every ~8 seconds)
      let breathEase = 0.5;
      if (window.sanctuaryBreathSync && window.sanctuaryBreathSync.ease !== undefined) {
        breathEase = window.sanctuaryBreathSync.ease;
      } else {
        breathEase = (Math.sin(currentTime * 0.0008) + 1) / 2;
      }

      // 1. Draw connecting filaments between proximate stars
      const maxDistance = 95;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - (dist / maxDistance)) * 0.28 * (0.6 + breathEase * 0.4);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(197, 154, 63, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      // 2. Draw nodes
      nodes.forEach(node => {
        // Move with soft friction
        node.x += node.vx;
        node.y += node.vy;

        // Bounce gently inside canvas boundaries
        if (node.x < 15) { node.x = 15; node.vx *= -1; }
        if (node.x > w - 15) { node.x = w - 15; node.vx *= -1; }
        if (node.y < 15) { node.y = 15; node.vy *= -1; }
        if (node.y > h - 15) { node.y = h - 15; node.vy *= -1; }

        const c = COLOR_PALETTE[node.state] || COLOR_PALETTE.peace;
        const breathRadius = node.baseRadius * (0.85 + breathEase * 0.4);

        // Soft outer glow halo
        const haloGrad = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, breathRadius * 3.5
        );
        haloGrad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${0.55 * node.intensity})`);
        haloGrad.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, ${0.18 * node.intensity})`);
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, breathRadius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Core star body
        ctx.fillStyle = `rgb(${c.r}, ${c.g}, ${c.b})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, breathRadius, 0, Math.PI * 2);
        ctx.fill();

        // White hot center sparkle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, breathRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });

      animFrameId = requestAnimationFrame(render);
    }

    animFrameId = requestAnimationFrame(render);
  }

  function debounce(fn, ms) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // Public API
  window.sanctuaryPulseConstellation = {
    init: initConstellation,
    fetchPulse: fetchPulseTelemetry,
    recordLocalPulse: function(state) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const newNode = createNode(state, rect.width, rect.height, 1.0);
      newNode.baseRadius = 7.5; // Starts large and luminous
      nodes.unshift(newNode);
      if (nodes.length > 45) nodes.pop();

      // Update counter UI
      const totalEl = document.getElementById('pulseTotalCount');
      if (totalEl) {
        totalEl.textContent = (parseInt(totalEl.textContent || '0', 10) + 1);
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConstellation);
  } else {
    initConstellation();
  }
})();
