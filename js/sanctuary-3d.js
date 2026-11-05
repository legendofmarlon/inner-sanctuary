/**
 * =============================================================================
 * INNER SANCTUARY WELLNESS FOUNDATION — 3D ELEMENTAL SANCTUARY ENGINE
 * =============================================================================
 * An ultra-smooth, lightweight Three.js 3D atmospheric world that reflects the
 * sanctuary's Element of the Week.
 * 
 * CURRENT FOCUS (AIR WEEK):
 * A relaxing, breezy 3D sky over undulating nature hills and forest canopies,
 * complete with volumetric drifting cumulus clouds, flowing wind breeze ribbons,
 * and airborne dandelion wisps floating lazily toward the viewer.
 * 
 * Supports dynamic weekly switching:
 *   - 🌬️ Air:   Relaxing Breezy Sky over Nature Hills & Clouds
 *   - 🌿 Earth: Sunlit Forest Canopy, Tumbling Leaves & Fireflies
 *   - 🌊 Water: Reflective Lake Waves, Concentric Ripples & Shore Mist
 *   - 🔥 Fire:  Cozy Stone Hearth & Rising Thermodynamic Embers
 *   - 🌌 Ether: Sacred Geometry Mandalas, Cosmic Nebula & Starfield
 * 
 * Fully reversible at any time via in-page toggle and localStorage persistence.
 * =============================================================================
 */

(function () {
  'use strict';

  // Protect against duplicate initialization
  if (window.sanctuary3D) return;

  // Configuration & Performance tuning
  const CONFIG = {
    fov: 55,
    near: 1,
    far: 2200,
    maxPixelRatio: 1.5, // Protect battery & mobile GPUs
    cloudCount: window.innerWidth < 768 ? 7 : 12,
    dandelionCount: window.innerWidth < 768 ? 60 : 120,
    windRibbonCount: window.innerWidth < 768 ? 3 : 5,
    leafCount: window.innerWidth < 768 ? 35 : 70,
    fireflyCount: window.innerWidth < 768 ? 25 : 50,
    waterRippleCount: 6,
    emberCount: window.innerWidth < 768 ? 50 : 110,
    starCount: window.innerWidth < 768 ? 160 : 350
  };

  // State
  let renderer = null;
  let scene = null;
  let camera = null;
  let canvas = null;
  let animId = null;
  let isRunning = false;
  let is3DEnabled = true;
  let currentElement = 'air'; // Default to this week's active element
  let clock = null;

  // Mouse & Scroll Parallax State
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let scrollY = 0;
  let targetScrollY = 0;

  // Element Groups
  const elementGroups = {
    air: null,
    earth: null,
    water: null,
    fire: null,
    ether: null
  };

  // Color palettes & Fog definitions for each element
  const THEMES = {
    air: {
      fogColor: 0xedf3f7,
      fogDensity: 0.0016,
      ambientColor: 0xf8fbfd,
      ambientIntensity: 0.95,
      sunColor: 0xfff3db,
      sunIntensity: 1.15,
      sunPos: [160, 240, -100]
    },
    earth: {
      fogColor: 0xf1eee7,
      fogDensity: 0.0018,
      ambientColor: 0xf5f3ed,
      ambientIntensity: 0.9,
      sunColor: 0xffe8ba,
      sunIntensity: 1.1,
      sunPos: [100, 200, 50]
    },
    water: {
      fogColor: 0xe9f2f5,
      fogDensity: 0.0017,
      ambientColor: 0xecf6f9,
      ambientIntensity: 0.9,
      sunColor: 0xd6f0fa,
      sunIntensity: 1.0,
      sunPos: [0, 220, -150]
    },
    fire: {
      fogColor: 0xf7ede5,
      fogDensity: 0.0019,
      ambientColor: 0xfdf3ec,
      ambientIntensity: 0.85,
      sunColor: 0xffd4aa,
      sunIntensity: 1.25,
      sunPos: [80, 150, -80]
    },
    ether: {
      fogColor: 0xf2ebf7,
      fogDensity: 0.0015,
      ambientColor: 0xf5effa,
      ambientIntensity: 0.95,
      sunColor: 0xdfc9f8,
      sunIntensity: 1.1,
      sunPos: [0, 250, 0]
    }
  };

  // Main directional light & ambient light references
  let dirLight = null;
  let ambLight = null;

  // Updatable items inside elements
  const updatables = {
    air: { clouds: [], dandelions: [], ribbons: [], terrain: null, trees: [] },
    earth: { leaves: [], fireflies: [], ground: null },
    water: { waterMesh: null, ripples: [], mist: [] },
    fire: { embers: [], hearthGlow: null },
    ether: { mandalas: [], stars: null, nebulas: [] }
  };

  // ---------------------------------------------------------------------------
  // 1. INITIALIZATION & SETUP
  // ---------------------------------------------------------------------------
  function init() {
    if (typeof THREE === 'undefined') {
      console.warn('[Sanctuary3D] Three.js not yet loaded. Retrying in 100ms...');
      setTimeout(init, 100);
      return;
    }

    // Check localStorage preference (defaults to true)
    const savedPref = localStorage.getItem('sanctuary_3d_mode');
    if (savedPref !== null) {
      is3DEnabled = savedPref === 'true';
    }

    clock = new THREE.Clock();

    // Locate or create Canvas
    canvas = document.getElementById('sanctuary-3d-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'sanctuary-3d-canvas';
      canvas.className = 'sanctuary-3d-canvas';
      // Insert right after classic elemental background
      const classicBg = document.getElementById('elemental-sanctuary-bg') || document.body.firstChild;
      if (classicBg && classicBg.parentNode) {
        classicBg.parentNode.insertBefore(canvas, classicBg.nextSibling);
      } else {
        document.body.prepend(canvas);
      }
    }

    // WebGL Renderer Setup
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: window.devicePixelRatio < 2,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.maxPixelRatio));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputEncoding = THREE.sRGBEncoding;
    } catch (e) {
      console.warn('[Sanctuary3D] WebGL not supported on this device. Gracefully falling back to 2D canvas.', e);
      is3DEnabled = false;
      return;
    }

    // Scene & Perspective Camera
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(THEMES.air.fogColor, THEMES.air.fogDensity);

    camera = new THREE.PerspectiveCamera(CONFIG.fov, window.innerWidth / window.innerHeight, CONFIG.near, CONFIG.far);
    camera.position.set(0, 30, 220);
    camera.lookAt(0, 40, -100);

    // Global Lights
    ambLight = new THREE.AmbientLight(THEMES.air.ambientColor, THEMES.air.ambientIntensity);
    scene.add(ambLight);

    dirLight = new THREE.DirectionalLight(THEMES.air.sunColor, THEMES.air.sunIntensity);
    dirLight.position.set(...THEMES.air.sunPos);
    scene.add(dirLight);

    // Create container groups for each element
    Object.keys(elementGroups).forEach(key => {
      const group = new THREE.Group();
      group.name = `element-${key}`;
      group.visible = false;
      scene.add(group);
      elementGroups[key] = group;
    });

    // Build the 3D environments
    buildAirWorld();
    buildEarthWorld();
    buildWaterWorld();
    buildFireWorld();
    buildEtherWorld();

    // Check active element on page
    const bodyElem = document.body.getAttribute('data-element');
    if (bodyElem && elementGroups[bodyElem]) {
      currentElement = bodyElem;
    }

    // Activate the current element
    setElement(currentElement, true);

    // Bind event listeners
    bindEvents();

    // Apply initial visibility
    applyModeState();

    // Start render loop
    isRunning = true;
    animate();

    console.log(`[Sanctuary3D] Initialized successfully. Active element: ${currentElement}. Mode: ${is3DEnabled ? '3D Active' : '2D Classic'}`);
  }

  // ---------------------------------------------------------------------------
  // 2. WORLD BUILDER: AIR (Breezy Sky over Nature, Clouds, Wind Ribbons)
  // ---------------------------------------------------------------------------
  function buildAirWorld() {
    const group = elementGroups.air;

    // A. DISTANT ROLLING NATURE HILLS & HORIZON
    const terrainGeo = new THREE.PlaneGeometry(1600, 600, 40, 18);
    terrainGeo.rotateX(-Math.PI * 0.44);

    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      // Gentle natural elevation waves
      const hill1 = Math.sin(vx * 0.005) * 55;
      const hill2 = Math.cos(vz * 0.008) * 35;
      const micro = Math.sin(vx * 0.02 + vz * 0.02) * 8;
      pos.setY(i, hill1 + hill2 + micro - 120);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshLambertMaterial({
      color: 0x547562, // Warm forest sage
      roughness: 0.9,
      flatShading: true,
      transparent: true,
      opacity: 0.82
    });

    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.position.set(0, -60, -380);
    group.add(terrain);
    updatables.air.terrain = terrain;

    // B. DISTANT PINE TREES ON RIDGES
    const treeGeo = new THREE.ConeGeometry(5, 18, 5);
    const treeMat = new THREE.MeshLambertMaterial({
      color: 0x365042,
      flatShading: true,
      transparent: true,
      opacity: 0.8
    });

    for (let i = 0; i < 45; i++) {
      const tree = new THREE.Mesh(treeGeo, treeMat);
      const tx = (Math.random() - 0.5) * 1100;
      const tz = -250 - Math.random() * 250;
      const ty = Math.sin(tx * 0.005) * 45 - 85;
      tree.position.set(tx, ty, tz);
      const s = 0.8 + Math.random() * 1.4;
      tree.scale.set(s, s, s);
      tree.userData = { initialRotZ: 0, swaySpeed: 1.2 + Math.random() * 1.5, phase: Math.random() * Math.PI * 2 };
      group.add(tree);
      updatables.air.trees.push(tree);
    }

    // C. PROCEDURAL VOLUMETRIC CUMULUS CLOUDS
    const cloudMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      roughness: 0.8,
      flatShading: true,
      transparent: true,
      opacity: 0.76
    });

    for (let c = 0; c < CONFIG.cloudCount; c++) {
      const cloud = new THREE.Group();
      const puffCount = 5 + Math.floor(Math.random() * 4);

      for (let p = 0; p < puffCount; p++) {
        const radius = 18 + Math.random() * 22;
        const puffGeo = new THREE.DodecahedronGeometry(radius, 1);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set(
          (p - puffCount / 2) * 22 + (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 18
        );
        puff.scale.set(1.2, 0.75, 0.9);
        cloud.add(puff);
      }

      // Distribute clouds across sky depths
      const cx = (Math.random() - 0.5) * 1200;
      const cy = 40 + Math.random() * 130;
      const cz = -100 - Math.random() * 600;
      cloud.position.set(cx, cy, cz);

      // Breeze speed proportional to depth (parallax)
      const speed = 0.12 + ((cz + 700) / 700) * 0.28;
      cloud.userData = {
        speed: speed,
        seed: Math.random() * 100,
        bobSpeed: 0.6 + Math.random() * 0.5
      };

      group.add(cloud);
      updatables.air.clouds.push(cloud);
    }

    // D. FLOWING WIND BREEZE RIBBONS
    for (let r = 0; r < CONFIG.windRibbonCount; r++) {
      const curvePoints = [];
      const baseY = 20 + r * 35;
      const baseZ = -50 - r * 80;
      for (let pt = 0; pt <= 10; pt++) {
        const px = -600 + pt * 120;
        const py = baseY + Math.sin(pt * 0.8) * 16;
        const pz = baseZ + Math.cos(pt * 0.6) * 20;
        curvePoints.push(new THREE.Vector3(px, py, pz));
      }
      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const tubeGeo = new THREE.TubeGeometry(curve, 36, 1.2, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0xbed6e3,
        transparent: true,
        opacity: 0.32
      });
      const ribbon = new THREE.Mesh(tubeGeo, tubeMat);
      ribbon.userData = { curvePoints, baseY, baseZ, phase: r * 1.3 };
      group.add(ribbon);
      updatables.air.ribbons.push(ribbon);
    }

    // E. AIRBORNE DANDELION SEEDS & GOLDEN WISPS
    const seedMat = new THREE.MeshBasicMaterial({
      color: 0xfdf7ea,
      transparent: true,
      opacity: 0.75
    });

    const dandelionGroup = new THREE.Group();
    for (let d = 0; d < CONFIG.dandelionCount; d++) {
      const dGeo = new THREE.OctahedronGeometry(1.6 + Math.random() * 1.8, 0);
      const seed = new THREE.Mesh(dGeo, seedMat);
      seed.position.set(
        (Math.random() - 0.5) * 500,
        -40 + Math.random() * 180,
        -250 + Math.random() * 400
      );
      seed.userData = {
        vx: 0.35 + Math.random() * 0.45,
        vy: (Math.random() - 0.5) * 0.18,
        vz: 0.2 + Math.random() * 0.35,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        swayPhase: Math.random() * Math.PI * 2
      };
      dandelionGroup.add(seed);
      updatables.air.dandelions.push(seed);
    }
    group.add(dandelionGroup);
  }

  // ---------------------------------------------------------------------------
  // 3. WORLD BUILDER: EARTH (Sunlit Canopy, Tumbling Leaves, Fireflies)
  // ---------------------------------------------------------------------------
  function buildEarthWorld() {
    const group = elementGroups.earth;

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(1400, 600, 24, 12);
    groundGeo.rotateX(-Math.PI * 0.46);
    const groundMat = new THREE.MeshLambertMaterial({
      color: 0x48644f,
      roughness: 0.95,
      flatShading: true,
      transparent: true,
      opacity: 0.78
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.set(0, -90, -300);
    group.add(ground);

    // Tumbling Botanical Leaves
    const leafMat = new THREE.MeshLambertMaterial({
      color: 0xc89e46,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });

    const leafGeo = new THREE.PlaneGeometry(4.5, 7, 2, 2);
    // Curl leaf slightly
    const pos = leafGeo.attributes.position;
    pos.setZ(2, 1.2);
    leafGeo.computeVertexNormals();

    for (let i = 0; i < CONFIG.leafCount; i++) {
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(
        (Math.random() - 0.5) * 450,
        -20 + Math.random() * 180,
        -150 + Math.random() * 320
      );
      leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      leaf.userData = {
        vy: -0.25 - Math.random() * 0.3,
        vx: (Math.random() - 0.5) * 0.2,
        rotSpeedX: (Math.random() - 0.5) * 0.03,
        rotSpeedY: (Math.random() - 0.5) * 0.025,
        rotSpeedZ: (Math.random() - 0.5) * 0.02
      };
      group.add(leaf);
      updatables.earth.leaves.push(leaf);
    }

    // Glowing Bioluminescent Fireflies
    const fireflyMat = new THREE.MeshBasicMaterial({
      color: 0xfce48b,
      transparent: true,
      opacity: 0.9
    });

    for (let f = 0; f < CONFIG.fireflyCount; f++) {
      const fGeo = new THREE.SphereGeometry(1.4, 6, 6);
      const firefly = new THREE.Mesh(fGeo, fireflyMat);
      firefly.position.set(
        (Math.random() - 0.5) * 400,
        -50 + Math.random() * 130,
        -100 + Math.random() * 260
      );
      firefly.userData = {
        baseX: firefly.position.x,
        baseY: firefly.position.y,
        baseZ: firefly.position.z,
        speed: 0.8 + Math.random() * 1.2,
        orbitRadius: 15 + Math.random() * 25,
        phase: Math.random() * Math.PI * 2
      };
      group.add(firefly);
      updatables.earth.fireflies.push(firefly);
    }
  }

  // ---------------------------------------------------------------------------
  // 4. WORLD BUILDER: WATER (Reflective Lake, Expanding Ripples)
  // ---------------------------------------------------------------------------
  function buildWaterWorld() {
    const group = elementGroups.water;

    // Undulating water surface plane
    const waterGeo = new THREE.PlaneGeometry(1500, 800, 48, 30);
    waterGeo.rotateX(-Math.PI * 0.48);

    const waterMat = new THREE.MeshLambertMaterial({
      color: 0x4f8ba3,
      transparent: true,
      opacity: 0.72,
      roughness: 0.25,
      flatShading: true
    });

    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, -60, -280);
    group.add(waterMesh);
    updatables.water.waterMesh = waterMesh;

    // Expanding concentric ripple rings
    for (let r = 0; r < CONFIG.waterRippleCount; r++) {
      const ripGeo = new THREE.RingGeometry(2, 3.5, 32);
      ripGeo.rotateX(-Math.PI * 0.48);
      const ripMat = new THREE.MeshBasicMaterial({
        color: 0xa9d9e8,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      const rip = new THREE.Mesh(ripGeo, ripMat);
      rip.position.set(
        (Math.random() - 0.5) * 500,
        -58,
        -150 - Math.random() * 250
      );
      rip.userData = {
        scale: 1 + Math.random() * 8,
        maxScale: 14 + Math.random() * 16,
        growSpeed: 0.08 + Math.random() * 0.06
      };
      group.add(rip);
      updatables.water.ripples.push(rip);
    }
  }

  // ---------------------------------------------------------------------------
  // 5. WORLD BUILDER: FIRE (Cozy Hearth, Rising Thermodynamic Embers)
  // ---------------------------------------------------------------------------
  function buildFireWorld() {
    const group = elementGroups.fire;

    // Warm hearth glow disc at bottom
    const glowGeo = new THREE.CircleGeometry(160, 24);
    glowGeo.rotateX(-Math.PI * 0.45);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xdf5926,
      transparent: true,
      opacity: 0.28
    });
    const hearthGlow = new THREE.Mesh(glowGeo, glowMat);
    hearthGlow.position.set(0, -75, -200);
    group.add(hearthGlow);
    updatables.fire.hearthGlow = hearthGlow;

    // Rising thermodynamic embers
    const emberGeo = new THREE.DodecahedronGeometry(1.6, 0);
    const emberMat = new THREE.MeshBasicMaterial({
      color: 0xffaa44,
      transparent: true,
      opacity: 0.85
    });

    for (let e = 0; e < CONFIG.emberCount; e++) {
      const ember = new THREE.Mesh(emberGeo, emberMat);
      ember.position.set(
        (Math.random() - 0.5) * 260,
        -80 + Math.random() * 190,
        -100 + Math.random() * 220
      );
      ember.userData = {
        vy: 0.4 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 0.25,
        vz: (Math.random() - 0.5) * 0.2,
        swayPhase: Math.random() * Math.PI * 2,
        baseY: -80
      };
      group.add(ember);
      updatables.fire.embers.push(ember);
    }
  }

  // ---------------------------------------------------------------------------
  // 6. WORLD BUILDER: ETHER (Sacred Geometry Mandalas, Twinkling Starfield)
  // ---------------------------------------------------------------------------
  function buildEtherWorld() {
    const group = elementGroups.ether;

    // Twinkling 3D Starfield
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(CONFIG.starCount * 3);
    for (let s = 0; s < CONFIG.starCount; s++) {
      starPositions[s * 3] = (Math.random() - 0.5) * 1200;
      starPositions[s * 3 + 1] = -50 + Math.random() * 450;
      starPositions[s * 3 + 2] = -200 - Math.random() * 800;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xded5f2,
      size: 2.2,
      transparent: true,
      opacity: 0.75
    });
    const starField = new THREE.Points(starGeo, starMat);
    group.add(starField);
    updatables.ether.stars = starField;

    // Sacred Geometry Mandalas (Nested Gold Wireframes)
    const mandalaGroup = new THREE.Group();
    mandalaGroup.position.set(0, 45, -280);

    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(75, 0.8, 12, 48),
      new THREE.MeshBasicMaterial({ color: 0xc59a3f, wireframe: true, transparent: true, opacity: 0.35 })
    );
    const ring2 = new THREE.Mesh(
      new THREE.IcosahedronGeometry(50, 1),
      new THREE.MeshBasicMaterial({ color: 0xa87edb, wireframe: true, transparent: true, opacity: 0.25 })
    );
    const ring3 = new THREE.Mesh(
      new THREE.OctahedronGeometry(95, 0),
      new THREE.MeshBasicMaterial({ color: 0xd9b360, wireframe: true, transparent: true, opacity: 0.2 })
    );

    mandalaGroup.add(ring1);
    mandalaGroup.add(ring2);
    mandalaGroup.add(ring3);
    group.add(mandalaGroup);
    updatables.ether.mandalas = [ring1, ring2, ring3, mandalaGroup];
  }

  // ---------------------------------------------------------------------------
  // 7. DYNAMIC ELEMENT TRANSITIONING
  // ---------------------------------------------------------------------------
  function setElement(elementKey, immediate = false) {
    if (!elementGroups[elementKey]) return;
    currentElement = elementKey;
    const theme = THEMES[elementKey] || THEMES.air;

    // Smoothly transition Fog & Lighting
    if (scene && scene.fog) {
      scene.fog.color.setHex(theme.fogColor);
      scene.fog.density = theme.fogDensity;
    }
    if (ambLight) {
      ambLight.color.setHex(theme.ambientColor);
      ambLight.intensity = theme.ambientIntensity;
    }
    if (dirLight) {
      dirLight.color.setHex(theme.sunColor);
      dirLight.intensity = theme.sunIntensity;
      dirLight.position.set(...theme.sunPos);
    }

    // Toggle Group Visibilities
    Object.keys(elementGroups).forEach(key => {
      const grp = elementGroups[key];
      if (key === elementKey) {
        grp.visible = true;
      } else {
        grp.visible = false;
      }
    });

    console.log(`[Sanctuary3D] Switched 3D atmosphere to: ${elementKey}`);
  }

  // ---------------------------------------------------------------------------
  // 8. ANIMATION & RENDER LOOP
  // ---------------------------------------------------------------------------
  function animate() {
    if (!isRunning) return;
    animId = requestAnimationFrame(animate);

    // If 3D mode is toggled off or tab is hidden, skip rendering to save CPU/battery
    if (!is3DEnabled || document.hidden) return;

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Smooth lerp mouse & scroll parallax
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;
    scrollY += (targetScrollY - scrollY) * 0.08;

    // Camera sway with mouse and gentle scroll elevation
    camera.position.x = mouse.x * 28;
    camera.position.y = 30 + mouse.y * 18 - scrollY * 0.035;
    camera.lookAt(mouse.x * 12, 40 + mouse.y * 8 - scrollY * 0.02, -100);

    // ---------------------------------------------------------
    // A. UPDATE ACTIVE ELEMENT WORLD
    // ---------------------------------------------------------
    if (currentElement === 'air') {
      // 1. Clouds horizontal drifting and bobbing
      updatables.air.clouds.forEach(cloud => {
        cloud.position.x += cloud.userData.speed;
        cloud.position.y += Math.sin(time * cloud.userData.bobSpeed + cloud.userData.seed) * 0.06;
        if (cloud.position.x > 750) {
          cloud.position.x = -750;
        }
      });

      // 2. Breeze Wind Ribbons undulation
      updatables.air.ribbons.forEach((ribbon, idx) => {
        const posAttr = ribbon.geometry.attributes.position;
        if (posAttr) {
          ribbon.position.x = Math.sin(time * 0.6 + ribbon.userData.phase) * 14;
        }
      });

      // 3. Dandelion Seeds & Golden Wisps flight
      updatables.air.dandelions.forEach(d => {
        d.position.x += d.userData.vx;
        d.position.y += d.userData.vy + Math.sin(time * 1.5 + d.userData.swayPhase) * 0.12;
        d.position.z += d.userData.vz;
        d.rotation.x += d.userData.rotSpeed;
        d.rotation.y += d.userData.rotSpeed * 0.7;

        // Mouse avoidance breeze force
        const dx = d.position.x - mouse.x * 150;
        const dy = d.position.y - mouse.y * 80;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          d.position.x += (dx / dist) * 0.6;
          d.position.y += (dy / dist) * 0.6;
        }

        // Loop boundaries
        if (d.position.x > 320) d.position.x = -320;
        if (d.position.z > 180) d.position.z = -250;
        if (d.position.y < -60) d.position.y = 120;
      });

      // 4. Distant Ridge Trees swaying in breeze
      updatables.air.trees.forEach(t => {
        t.rotation.z = Math.sin(time * t.userData.swaySpeed + t.userData.phase) * 0.04;
      });

    } else if (currentElement === 'earth') {
      // 1. Tumbling Botanical Leaves
      updatables.earth.leaves.forEach(leaf => {
        leaf.position.y += leaf.userData.vy;
        leaf.position.x += leaf.userData.vx + Math.sin(time * 1.8) * 0.15;
        leaf.rotation.x += leaf.userData.rotSpeedX;
        leaf.rotation.y += leaf.userData.rotSpeedY;
        leaf.rotation.z += leaf.userData.rotSpeedZ;
        if (leaf.position.y < -80) {
          leaf.position.y = 150;
          leaf.position.x = (Math.random() - 0.5) * 450;
        }
      });

      // 2. Bioluminescent Fireflies orbiting
      updatables.earth.fireflies.forEach(f => {
        const angle = time * f.userData.speed + f.userData.phase;
        f.position.x = f.userData.baseX + Math.cos(angle) * f.userData.orbitRadius;
        f.position.y = f.userData.baseY + Math.sin(angle * 1.4) * (f.userData.orbitRadius * 0.6);
        f.position.z = f.userData.baseZ + Math.sin(angle * 0.8) * (f.userData.orbitRadius * 0.5);
      });

    } else if (currentElement === 'water') {
      // 1. Lake surface wave oscillation
      const wm = updatables.water.waterMesh;
      if (wm) {
        const pos = wm.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i);
          const vz = pos.getZ(i);
          const wave = Math.sin(vx * 0.015 + time * 1.5) * 4 + Math.cos(vz * 0.02 + time * 1.2) * 3;
          pos.setY(i, wave);
        }
        wm.geometry.computeVertexNormals();
        wm.geometry.attributes.position.needsUpdate = true;
      }

      // 2. Water ripples expanding
      updatables.water.ripples.forEach(rip => {
        rip.scale.x += rip.userData.growSpeed;
        rip.scale.y += rip.userData.growSpeed;
        if (rip.scale.x > rip.userData.maxScale) {
          rip.scale.set(1, 1, 1);
          rip.position.x = (Math.random() - 0.5) * 450;
          rip.position.z = -150 - Math.random() * 250;
        }
      });

    } else if (currentElement === 'fire') {
      // 1. Rising thermodynamic embers
      updatables.fire.embers.forEach(ember => {
        ember.position.y += ember.userData.vy;
        ember.position.x += ember.userData.vx + Math.sin(time * 2.5 + ember.userData.swayPhase) * 0.2;
        ember.position.z += ember.userData.vz;
        if (ember.position.y > 140) {
          ember.position.y = ember.userData.baseY;
          ember.position.x = (Math.random() - 0.5) * 220;
        }
      });

      // 2. Hearth glow pulse
      if (updatables.fire.hearthGlow) {
        const pulse = 0.24 + Math.sin(time * 3.0) * 0.06;
        updatables.fire.hearthGlow.material.opacity = pulse;
      }

    } else if (currentElement === 'ether') {
      // 1. Sacred geometry rotating mandalas
      const mandalas = updatables.ether.mandalas;
      if (mandalas && mandalas.length >= 4) {
        mandalas[0].rotation.z += 0.003;
        mandalas[1].rotation.x += 0.004;
        mandalas[1].rotation.y += 0.005;
        mandalas[2].rotation.y -= 0.002;
        mandalas[3].position.y = 45 + Math.sin(time * 0.5) * 6;
      }
    }

    renderer.render(scene, camera);
  }

  // ---------------------------------------------------------------------------
  // 9. EVENT LISTENERS & RESIZE
  // ---------------------------------------------------------------------------
  function bindEvents() {
    window.addEventListener('resize', onWindowResize, { passive: true });

    window.addEventListener('mousemove', e => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    window.addEventListener('scroll', () => {
      targetScrollY = window.pageYOffset || document.documentElement.scrollTop;
    }, { passive: true });

    // Battery & CPU optimization when tab is backgrounded
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clock.stop();
      } else {
        clock.start();
      }
    });
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.maxPixelRatio));
  }

  // ---------------------------------------------------------------------------
  // 10. TOGGLE 3D / 2D MODE & PARTNER PREVIEW INTEGRATION
  // ---------------------------------------------------------------------------
  function applyModeState() {
    const classicCanvas = document.getElementById('elemental-sanctuary-bg');
    if (canvas) {
      canvas.style.opacity = is3DEnabled ? '1' : '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.display = is3DEnabled ? 'block' : 'none';
    }
    if (classicCanvas) {
      classicCanvas.style.opacity = is3DEnabled ? '0' : '1';
      classicCanvas.style.display = is3DEnabled ? 'none' : 'block';
    }

    // Update UI toggle button if present
    const label = document.getElementById('mode-state-label');
    const btn = document.getElementById('btn-toggle-3d');
    if (label) label.textContent = is3DEnabled ? 'ON' : 'OFF';
    if (btn) {
      btn.setAttribute('aria-pressed', is3DEnabled ? 'true' : 'false');
      btn.classList.toggle('active', is3DEnabled);
    }
  }

  function toggle3D(forceBool) {
    if (typeof forceBool === 'boolean') {
      is3DEnabled = forceBool;
    } else {
      is3DEnabled = !is3DEnabled;
    }
    localStorage.setItem('sanctuary_3d_mode', is3DEnabled ? 'true' : 'false');
    applyModeState();

    // Trigger visual toast if showToast exists
    if (typeof window.showToast === 'function') {
      window.showToast(is3DEnabled
        ? '✨ 3D Relaxing Sky Mode Active! (Element of the Week: Air)'
        : '🌿 Classic 2D Sanctuary Canvas Restored'
      );
    }
    return is3DEnabled;
  }

  // ---------------------------------------------------------------------------
  // 11. EXPOSE GLOBAL API
  // ---------------------------------------------------------------------------
  window.sanctuary3D = {
    init: init,
    setElement: setElement,
    toggle3D: toggle3D,
    isEnabled: () => is3DEnabled,
    getCurrentElement: () => currentElement
  };

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
