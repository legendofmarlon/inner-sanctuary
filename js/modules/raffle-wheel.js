/**
 * Inner Sanctuary Wellness Foundation — Speakeasy Raffle Gacha Wheel
 * Embedded inside the secret speakeasy window unlocked after 3 knocks on the medallion.
 * Passkeys:
 *   - Regular Attendees: '777', 'sanctuary777', 'hearth', 'friendsgiving', 'innersanctuary'
 *   - VIP Godmode (Marlon): 'jag7393'
 *   - VIP Godmode (Teshia): 'guitar123'
 * Strict Cap: 2 total tries for regular attendees. VIPs get unlimited spins.
 * Post-Win: Fair-play claim capture (Name, Email, IG) + Instagram Story 9:16 Canvas Generator.
 */
(function() {
  'use strict';

  const STORAGE_KEY_TOKENS = 'sanctuary_raffle_spins_left';
  const STORAGE_KEY_UNLOCKED = 'sanctuary_speakeasy_wheel_unlocked';
  const STORAGE_KEY_VIP = 'sanctuary_wheel_vip';
  const STORAGE_KEY_CLAIMS = 'sanctuary_raffle_claims';
  const STORAGE_KEY_ACTIVE_CLAIM = 'sanctuary_raffle_active_claim';

  const VALID_PASSKEYS = ['777', 'sanctuary777', 'hearth', 'friendsgiving', 'innersanctuary'];
  const VIP_PASSKEYS = {
    'jag7393': 'Marlon',
    'guitar123': 'Teshia'
  };

  // Weighted Prize Pool
  const PRIZE_POOL = [
    {
      typeId: 'headphones',
      name: 'Studio Audio Headphones',
      icon: '🎧',
      rarity: 'rare',
      rarityLabel: '✦ RARE DROP (5% Odds) ✦',
      rarityClass: 'rarity-pill-rare',
      weight: 5,
      sponsor: 'Sound Sanctuary Partner',
      desc: 'High-fidelity audio headphones designed for immersive mindful listening, sound journeys, and acoustic music.'
    },
    {
      typeId: 'gear',
      name: 'Inner Sanctuary Official Gear',
      icon: '👕',
      rarity: 'uncommon',
      rarityLabel: '✦ UNCOMMON (20% Odds) ✦',
      rarityClass: 'rarity-pill-uncommon',
      weight: 20,
      sponsor: 'Inner Sanctuary Wellness Foundation',
      desc: 'Signature Inner Sanctuary community wellness apparel, intentional comfort wear, and organic totes.'
    },
    {
      typeId: 'innout',
      name: 'In-N-Out Meal Card',
      icon: '🍔',
      rarity: 'sponsored',
      rarityLabel: '✦ SPONSORED DROP (25% Odds) ✦',
      rarityClass: 'rarity-pill-sponsored',
      weight: 25,
      sponsor: 'In-N-Out Burger (Official Sponsor)',
      desc: 'Fresh meal card sponsored by In-N-Out Burger! Redeemable for a fresh Double-Double, fries, and beverage.'
    },
    {
      typeId: 'bracelet',
      name: 'Intention Stone Bracelet',
      icon: '🌿',
      rarity: 'common',
      rarityLabel: '✦ COMMON (30% Odds) ✦',
      rarityClass: 'rarity-pill-common',
      weight: 30,
      sponsor: 'Artisan Bracelet Studio',
      desc: 'Hand-woven grounding bracelet crafted with volcanic stone, sandalwood, and sacred intention beads.'
    },
    {
      typeId: 'elixir',
      name: 'Clubhouse Herbal Elixir',
      icon: '🍵',
      rarity: 'common',
      rarityLabel: '✦ COMMON (20% Odds) ✦',
      rarityClass: 'rarity-pill-common',
      weight: 20,
      sponsor: 'Our Sanctuary Clubhouse',
      desc: 'Fresh artisan herbal brew and botanical adaptogen elixir token at the gathering tea station.'
    }
  ];

  // 8 Slices on the Visual Wheel (Symmetric 45° sectors)
  const WHEEL_SLICES = [
    {
      typeId: 'innout',
      name: 'In-N-Out Card',
      icon: '🍔',
      bg: '#7F1D1D',
      text: '#FDE047',
      accent: '#DC2626'
    },
    {
      typeId: 'bracelet',
      name: 'Stone Bracelet',
      icon: '🌿',
      bg: '#78350F',
      text: '#FDE68A',
      accent: '#B45309'
    },
    {
      typeId: 'headphones',
      name: 'Headphones ✦',
      icon: '🎧',
      bg: '#115E59',
      text: '#99F6E4',
      accent: '#0D9488'
    },
    {
      typeId: 'gear',
      name: 'Sanctuary Gear',
      icon: '👕',
      bg: '#14532D',
      text: '#BBF7D0',
      accent: '#15803D'
    },
    {
      typeId: 'bracelet',
      name: 'Intention Bead',
      icon: '🌿',
      bg: '#92400E',
      text: '#FEF3C7',
      accent: '#D97706'
    },
    {
      typeId: 'innout',
      name: 'In-N-Out Card',
      icon: '🍔',
      bg: '#881337',
      text: '#FECDD3',
      accent: '#BE123C'
    },
    {
      typeId: 'elixir',
      name: 'Botanical Tea',
      icon: '🍵',
      bg: '#365314',
      text: '#D9F99D',
      accent: '#4D7C0F'
    },
    {
      typeId: 'gear',
      name: 'Sanctuary Merch',
      icon: '👕',
      bg: '#1E3A2B',
      text: '#F5D77F',
      accent: '#2A523D'
    }
  ];

  let canvas = null;
  let ctx = null;
  let currentRotation = 0;
  let isSpinning = false;
  let currentTokens = 2; // Strict 2-spin cap for attendees
  let audioCtx = null;
  let lastTickIndex = -1;
  let currentWonPrize = null;
  let forcedPrizeTypeId = null;

  function isWheelUnlocked() {
    return sessionStorage.getItem(STORAGE_KEY_UNLOCKED) === 'true';
  }

  function getVIPUser() {
    return sessionStorage.getItem(STORAGE_KEY_VIP);
  }

  // Sound Engine
  function playTickSound() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(528, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(264, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {
      // Audio fallback silent
    }
  }

  function playUnlockSound() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      [432, 528, 864].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.12, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.5);
      });
    } catch (e) {}
  }

  function playWinSound(isRare) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      const notes = isRare ? [528, 660, 792, 1056] : [432, 540, 648];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = isRare ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);
        gain.gain.setValueAtTime(0.15, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.8);
      });
    } catch (e) {}
  }

  // Token Management (Strict 2 Total Spins vs VIP Godmode)
  function loadTokens() {
    const vip = getVIPUser();
    if (vip) {
      currentTokens = 9999;
    } else {
      const saved = localStorage.getItem(STORAGE_KEY_TOKENS);
      if (saved === null) {
        currentTokens = 2;
        localStorage.setItem(STORAGE_KEY_TOKENS, '2');
      } else {
        currentTokens = parseInt(saved, 10);
      }
    }
    updateTokenDisplay();
    updateVipAdminDeck();
  }

  function deductToken() {
    const vip = getVIPUser();
    if (vip) {
      // VIPs don't consume spins
      return;
    }
    currentTokens = Math.max(0, currentTokens - 1);
    localStorage.setItem(STORAGE_KEY_TOKENS, currentTokens.toString());
    updateTokenDisplay();
  }

  function updateTokenDisplay() {
    const el = document.getElementById('raffleTokenCount');
    const pill = document.getElementById('raffleTokenPill');
    const btn = document.getElementById('raffleSpinBtn');
    const btnCount = document.getElementById('raffleSpinBtnCount');
    const vip = getVIPUser();

    if (vip) {
      if (el) el.textContent = '∞';
      if (pill) pill.innerHTML = `👑 <strong>VIP Godmode:</strong> Unlimited Free Spins (${vip})`;
      if (btn) {
        btn.disabled = false;
        if (btnCount) btnCount.textContent = '(👑 VIP)';
      }
      return;
    }

    if (el) el.textContent = currentTokens;

    if (btn) {
      if (currentTokens > 0) {
        btn.disabled = false;
        if (btnCount) btnCount.textContent = `(${currentTokens} Left)`;
        if (pill) pill.innerHTML = `🎟️ Free Gathering Spins: <strong style="color: #FFFFFF;">${currentTokens}</strong> of 2 Remaining`;
      } else {
        btn.disabled = true;
        if (btnCount) btnCount.textContent = `(0 Left)`;
        if (pill) pill.innerHTML = `🔒 <strong>Limit Reached:</strong> 2 of 2 Free Spins Used — Claim Prize Below`;
      }
    }
  }

  // Password Unlock Gate (Normal & VIP)
  function unlockWithPasskey() {
    const input = document.getElementById('speakeasyWheelPassInput');
    const errEl = document.getElementById('speakeasyWheelGateError');
    if (!input) return;

    const val = input.value.trim().toLowerCase();

    // Check VIP first
    if (VIP_PASSKEYS[val]) {
      const vipName = VIP_PASSKEYS[val];
      sessionStorage.setItem(STORAGE_KEY_VIP, vipName);
      sessionStorage.setItem(STORAGE_KEY_UNLOCKED, 'true');
      if (errEl) errEl.style.display = 'none';
      playUnlockSound();
      updateWheelGateVisibility();
      loadTokens();
      setTimeout(() => {
        initWheelCanvas();
      }, 50);
      alert(`👑 Welcome ${vipName}! VIP Godmode activated with unlimited spins & admin deck.`);
      return;
    }

    // Check standard attendee keys
    if (VALID_PASSKEYS.includes(val)) {
      if (errEl) errEl.style.display = 'none';
      sessionStorage.setItem(STORAGE_KEY_UNLOCKED, 'true');
      playUnlockSound();
      updateWheelGateVisibility();
      loadTokens();
      setTimeout(() => {
        initWheelCanvas();
      }, 50);
    } else {
      if (errEl) {
        errEl.style.display = 'block';
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 400);
      }
    }
  }

  function updateWheelGateVisibility() {
    const gateCard = document.getElementById('speakeasyWheelGate');
    const unlockedStage = document.getElementById('speakeasyWheelUnlocked');
    if (isWheelUnlocked()) {
      if (gateCard) gateCard.style.display = 'none';
      if (unlockedStage) unlockedStage.style.display = 'block';
    } else {
      if (gateCard) gateCard.style.display = 'block';
      if (unlockedStage) unlockedStage.style.display = 'none';
    }
    updateVipAdminDeck();
  }

  function updateVipAdminDeck() {
    const deck = document.getElementById('raffleVipAdminDeck');
    const vip = getVIPUser();
    if (deck) {
      if (vip && isWheelUnlocked()) {
        deck.style.display = 'block';
        const titleEl = document.getElementById('raffleVipUserTitle');
        if (titleEl) titleEl.textContent = `${vip} Mode`;
      } else {
        deck.style.display = 'none';
      }
    }
  }

  // Draw Visual Wheel
  function drawWheel() {
    if (!canvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 18;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation);

    const numSlices = WHEEL_SLICES.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    for (let i = 0; i < numSlices; i++) {
      const slice = WHEEL_SLICES[i];
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Slice Path
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      // Radial slice gradient
      const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, radius);
      grad.addColorStop(0, slice.bg);
      grad.addColorStop(1, slice.accent);
      ctx.fillStyle = grad;
      ctx.fill();

      // Border between slices
      ctx.strokeStyle = '#FCE6A2';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Slice text & icon
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Icon
      ctx.font = '28px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
      ctx.fillText(slice.icon, radius - 20, 0);

      // Label text
      ctx.fillStyle = slice.text;
      ctx.font = 'bold 14px "Cinzel", serif, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(slice.name, radius - 60, 0);

      ctx.restore();
    }

    // Outer Golden Ring
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    const ringGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
    ringGrad.addColorStop(0, '#FFFDF7');
    ringGrad.addColorStop(0.3, '#F5D77F');
    ringGrad.addColorStop(0.7, '#C59A3F');
    ringGrad.addColorStop(1, '#8A6820');
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 10;
    ctx.stroke();

    // Rivets on ring
    for (let j = 0; j < numSlices * 2; j++) {
      const rivetAngle = (j * Math.PI) / numSlices;
      const rx = (radius - 5) * Math.cos(rivetAngle);
      const ry = (radius - 5) * Math.sin(rivetAngle);
      ctx.beginPath();
      ctx.arc(rx, ry, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFECA8';
      ctx.fill();
      ctx.strokeStyle = '#3A2E12';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();

    // Center Golden Hub
    ctx.save();
    ctx.translate(centerX, centerY);

    ctx.beginPath();
    ctx.arc(0, 0, 46, 0, 2 * Math.PI);
    const hubGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 46);
    hubGrad.addColorStop(0, '#FFECA8');
    hubGrad.addColorStop(0.5, '#C59A3F');
    hubGrad.addColorStop(1, '#111D16');
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = '#FCE6A2';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#111D16';
    ctx.font = 'bold 11px "Cinzel", serif, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isSpinning ? 'SPINNING' : '✦ SPIN ✦', 0, 0);

    ctx.restore();
  }

  function getActiveIndex() {
    const numSlices = WHEEL_SLICES.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    let normalized = ((-Math.PI / 2 - currentRotation) % (2 * Math.PI));
    if (normalized < 0) normalized += 2 * Math.PI;
    return Math.floor(normalized / sliceAngle) % numSlices;
  }

  function selectWeightedPrize() {
    if (forcedPrizeTypeId) {
      const forced = PRIZE_POOL.find(p => p.typeId === forcedPrizeTypeId);
      if (forced) return forced;
    }

    const roll = Math.random() * 100;
    let cumulative = 0;
    for (const prize of PRIZE_POOL) {
      cumulative += prize.weight;
      if (roll <= cumulative) return prize;
    }
    return PRIZE_POOL[PRIZE_POOL.length - 1];
  }

  function getMatchingSliceIndex(targetTypeId) {
    const matching = [];
    WHEEL_SLICES.forEach((s, idx) => {
      if (s.typeId === targetTypeId) matching.push(idx);
    });
    return matching[Math.floor(Math.random() * matching.length)] || 0;
  }

  // Spin Function
  function spin() {
    if (isSpinning) return;

    if (!isWheelUnlocked()) {
      alert('🔒 Speakeasy vault locked. Please enter the secret password first!');
      return;
    }

    const vip = getVIPUser();
    if (!vip && currentTokens <= 0) {
      alert('🔒 You have used all 2 of your gathering spins! Please fill in the claim form below to lock in your prize.');
      const resultCard = document.getElementById('raffleResultCard');
      if (resultCard) resultCard.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    deductToken();
    isSpinning = true;

    const resultCard = document.getElementById('raffleResultCard');
    if (resultCard) resultCard.classList.remove('active');

    const pointer = document.getElementById('rafflePointer');

    const wonPrize = selectWeightedPrize();
    currentWonPrize = wonPrize;
    const targetSlice = getMatchingSliceIndex(wonPrize.typeId);

    const numSlices = WHEEL_SLICES.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const targetAngleOnCircle = targetSlice * sliceAngle + sliceAngle / 2;
    const desiredFinalRotation = -Math.PI / 2 - targetAngleOnCircle;

    const extraRotations = (5 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
    const currentNormalized = currentRotation % (2 * Math.PI);
    const totalRotationDelta = extraRotations + ((desiredFinalRotation - currentNormalized) % (2 * Math.PI)) + (2 * Math.PI);

    const startRotation = currentRotation;
    const endRotation = startRotation + totalRotationDelta;
    const duration = 4600;
    const startTime = performance.now();

    function animate(time) {
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3.2);
      currentRotation = startRotation + (endRotation - startRotation) * ease;

      const activeIdx = getActiveIndex();
      if (activeIdx !== lastTickIndex) {
        lastTickIndex = activeIdx;
        playTickSound();
        if (pointer) {
          pointer.classList.add('tick-bump');
          setTimeout(() => pointer.classList.remove('tick-bump'), 60);
        }
      }

      drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isSpinning = false;
        currentRotation = endRotation % (2 * Math.PI);
        drawWheel();
        finishSpin(wonPrize);
      }
    }

    requestAnimationFrame(animate);
  }

  function finishSpin(wonPrize) {
    const isRare = wonPrize.rarity === 'rare';
    playWinSound(isRare);

    const resultCard = document.getElementById('raffleResultCard');
    const resultIcon = document.getElementById('raffleResultIcon');
    const resultTitle = document.getElementById('raffleResultTitle');
    const resultSponsor = document.getElementById('raffleResultSponsor');
    const resultDesc = document.getElementById('raffleResultDesc');
    const resultRarity = document.getElementById('raffleResultRarity');

    if (resultCard && wonPrize) {
      if (resultIcon) resultIcon.textContent = wonPrize.icon;
      if (resultTitle) resultTitle.textContent = wonPrize.name;
      if (resultSponsor) resultSponsor.textContent = `✦ ${wonPrize.sponsor}`;
      if (resultDesc) resultDesc.textContent = wonPrize.desc;
      if (resultRarity) {
        resultRarity.textContent = wonPrize.rarityLabel;
        resultRarity.className = `raffle-result-rarity ${wonPrize.rarityClass}`;
      }
      resultCard.classList.add('active');

      // Check if user already submitted a claim
      const activeClaimJson = sessionStorage.getItem(STORAGE_KEY_ACTIVE_CLAIM);
      if (activeClaimJson) {
        const claim = JSON.parse(activeClaimJson);
        renderVerifiedClaim(claim);
      } else {
        // Show claim form
        const formWrap = document.getElementById('raffleClaimFormWrap');
        const verWrap = document.getElementById('raffleVerifiedWrap');
        if (formWrap) formWrap.style.display = 'block';
        if (verWrap) verWrap.style.display = 'none';

        // Draw initial story preview with placeholder attendee
        renderStoryCanvasPreview(wonPrize, null);
      }

      resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Claim Submission (Attendee Info Capture & Ledger Tracking)
  function submitClaim() {
    const nameInput = document.getElementById('raffleClaimName');
    const emailInput = document.getElementById('raffleClaimEmail');
    const igInput = document.getElementById('raffleClaimIG');
    const errEl = document.getElementById('raffleClaimError');

    if (!nameInput || !emailInput || !igInput) return;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    let ig = igInput.value.trim().replace(/^@/, '');

    if (!name || name.length < 2) {
      showClaimError('Please enter your full name or stage name.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showClaimError('Please enter a valid email address.');
      return;
    }
    if (!ig || ig.length < 2) {
      showClaimError('Please enter your Instagram handle so we can verify your story.');
      return;
    }

    if (errEl) errEl.style.display = 'none';

    // Retrieve claims ledger
    let claims = [];
    try {
      claims = JSON.parse(localStorage.getItem(STORAGE_KEY_CLAIMS) || '[]');
    } catch (e) {
      claims = [];
    }

    // Fair-play check: Has this email or IG handle already claimed?
    const existing = claims.find(c => c.email.toLowerCase() === email || c.ig.toLowerCase() === ig.toLowerCase());

    let activeClaim = null;
    if (existing) {
      activeClaim = existing;
      alert(`✦ Welcome back ${existing.name}! Your verified prize claim is already recorded as: ${existing.prize} (Code: ${existing.code}).`);
    } else {
      // Generate clean tamper-proof code
      const hex = Math.random().toString(16).substring(2, 6).toUpperCase();
      const code = `IS-777-${hex}`;

      activeClaim = {
        id: 'CLAIM-' + Date.now(),
        code: code,
        name: name,
        email: email,
        ig: ig,
        prize: currentWonPrize ? currentWonPrize.name : 'Sanctuary Blessing',
        rarity: currentWonPrize ? currentWonPrize.rarity : 'common',
        timestamp: new Date().toISOString(),
        downloadCount: 0
      };

      claims.push(activeClaim);
      localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(claims));
    }

    sessionStorage.setItem(STORAGE_KEY_ACTIVE_CLAIM, JSON.stringify(activeClaim));
    renderVerifiedClaim(activeClaim);
    playUnlockSound();
  }

  function showClaimError(msg) {
    const errEl = document.getElementById('raffleClaimError');
    if (errEl) {
      errEl.textContent = `⚠️ ${msg}`;
      errEl.style.display = 'block';
    }
  }

  function renderVerifiedClaim(claim) {
    const formWrap = document.getElementById('raffleClaimFormWrap');
    const verWrap = document.getElementById('raffleVerifiedWrap');
    const codeEl = document.getElementById('raffleVerifiedCode');
    const userEl = document.getElementById('raffleVerifiedUser');
    const dlBadge = document.getElementById('raffleDownloadCountBadge');

    if (formWrap) formWrap.style.display = 'none';
    if (verWrap) verWrap.style.display = 'block';

    if (codeEl) codeEl.textContent = claim.code;
    if (userEl) userEl.textContent = `Awarded to ${claim.name} (@${claim.ig})`;
    if (dlBadge) dlBadge.textContent = `${claim.downloadCount || 0} Downloads`;

    renderStoryCanvasPreview(currentWonPrize, claim);
  }

  // Instagram Story 9:16 Canvas Graphic Engine
  function drawInstagramStoryCard(targetCanvas, prize, claim, width, height) {
    const sCtx = targetCanvas.getContext('2d');
    targetCanvas.width = width;
    targetCanvas.height = height;

    // 1. Radiant Background
    const bgGrad = sCtx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, height * 0.7);
    bgGrad.addColorStop(0, '#153625');
    bgGrad.addColorStop(0.5, '#0B1C13');
    bgGrad.addColorStop(1, '#050D09');
    sCtx.fillStyle = bgGrad;
    sCtx.fillRect(0, 0, width, height);

    // Subtle star dust
    sCtx.fillStyle = 'rgba(255, 253, 247, 0.25)';
    for (let s = 0; s < 45; s++) {
      const sx = ((s * 97) % width);
      const sy = ((s * 151) % height);
      const sr = (s % 3) + 1;
      sCtx.beginPath();
      sCtx.arc(sx, sy, sr, 0, Math.PI * 2);
      sCtx.fill();
    }

    // 2. Ornate Gold Filigree Border
    const pad = Math.floor(width * 0.05);
    sCtx.strokeStyle = '#C59A3F';
    sCtx.lineWidth = Math.max(3, Math.floor(width * 0.008));
    sCtx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

    sCtx.strokeStyle = 'rgba(245, 215, 127, 0.45)';
    sCtx.lineWidth = 1.5;
    sCtx.strokeRect(pad + 10, pad + 10, width - pad * 2 - 20, height - pad * 2 - 20);

    // 3. Header
    sCtx.textAlign = 'center';
    sCtx.fillStyle = '#FCE6A2';
    sCtx.font = `700 ${Math.floor(width * 0.032)}px "Cinzel", serif, sans-serif`;
    sCtx.fillText('✦ INNER SANCTUARY WELLNESS FOUNDATION ✦', width / 2, pad + 60);

    sCtx.fillStyle = '#86EFAC';
    sCtx.font = `600 ${Math.floor(width * 0.026)}px sans-serif`;
    sCtx.fillText('SPEAKEASY GREENROOM RAFFLE WINNER', width / 2, pad + 100);

    sCtx.fillStyle = '#FFFFFF';
    sCtx.font = `900 ${Math.floor(width * 0.052)}px "Cinzel", serif, sans-serif`;
    sCtx.fillText('I WON AT INNER SANCTUARY!', width / 2, pad + 160);

    // 4. Centerpiece Prize Box
    const boxX = pad + 30;
    const boxY = pad + 200;
    const boxW = width - (pad + 30) * 2;
    const boxH = Math.floor(height * 0.38);

    sCtx.fillStyle = 'rgba(17, 29, 22, 0.85)';
    sCtx.strokeStyle = '#F5D77F';
    sCtx.lineWidth = Math.max(2, Math.floor(width * 0.005));
    sCtx.beginPath();
    sCtx.roundRect(boxX, boxY, boxW, boxH, 24);
    sCtx.fill();
    sCtx.stroke();

    // Prize Icon
    const prizeIcon = prize ? prize.icon : '🎁';
    sCtx.font = `${Math.floor(width * 0.18)}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    sCtx.fillText(prizeIcon, width / 2, boxY + boxH * 0.36);

    // Prize Name
    const prizeName = prize ? prize.name : 'Sanctuary Blessing';
    sCtx.fillStyle = '#FFFDF7';
    sCtx.font = `800 ${Math.floor(width * 0.052)}px "Cinzel", serif, sans-serif`;
    sCtx.fillText(prizeName, width / 2, boxY + boxH * 0.62);

    // Rarity Badge Pill
    const rarityLabel = prize ? prize.rarityLabel : '✦ GATHERING DROP ✦';
    sCtx.fillStyle = prize && prize.rarity === 'rare' ? '#115E59' : '#78350F';
    sCtx.beginPath();
    sCtx.roundRect(width / 2 - 160, boxY + boxH * 0.72, 320, 38, 999);
    sCtx.fill();
    sCtx.strokeStyle = '#FCE6A2';
    sCtx.lineWidth = 1.5;
    sCtx.stroke();

    sCtx.fillStyle = '#FFECA8';
    sCtx.font = `800 ${Math.floor(width * 0.026)}px sans-serif`;
    sCtx.fillText(rarityLabel, width / 2, boxY + boxH * 0.72 + 25);

    // Sponsor
    const sponsor = prize ? prize.sponsor : 'Inner Sanctuary Wellness Foundation';
    sCtx.fillStyle = '#A7F3D0';
    sCtx.font = `600 ${Math.floor(width * 0.028)}px sans-serif`;
    sCtx.fillText(`✦ ${sponsor}`, width / 2, boxY + boxH * 0.90);

    // 5. Winner Verification Card
    const winBoxY = boxY + boxH + 30;
    const winBoxH = Math.floor(height * 0.20);
    sCtx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    sCtx.strokeStyle = 'rgba(197, 154, 63, 0.45)';
    sCtx.lineWidth = 1.5;
    sCtx.beginPath();
    sCtx.roundRect(boxX, winBoxY, boxW, winBoxH, 18);
    sCtx.fill();
    sCtx.stroke();

    sCtx.fillStyle = '#CBD7D0';
    sCtx.font = `600 ${Math.floor(width * 0.025)}px sans-serif`;
    sCtx.fillText('OFFICIAL REDEMPTION CODE', width / 2, winBoxY + 36);

    const code = claim ? claim.code : 'IS-777-WIN';
    sCtx.fillStyle = '#FDE047';
    sCtx.font = `900 ${Math.floor(width * 0.065)}px monospace`;
    sCtx.fillText(code, width / 2, winBoxY + 85);

    const userLine = claim ? `${claim.name} • @${claim.ig}` : 'Claim at Welcome Table';
    sCtx.fillStyle = '#FFFFFF';
    sCtx.font = `700 ${Math.floor(width * 0.034)}px sans-serif`;
    sCtx.fillText(`Awarded to: ${userLine}`, width / 2, winBoxY + 125);

    // 6. Action Call & Gathering Lore
    const botY = winBoxY + winBoxH + 45;
    sCtx.fillStyle = '#FCE6A2';
    sCtx.font = `800 ${Math.floor(width * 0.032)}px "Cinzel", serif, sans-serif`;
    sCtx.fillText('👉 SHARE ON INSTAGRAM STORY & TAG @INNERSANCTUARY', width / 2, botY);

    sCtx.fillStyle = '#CBD7D0';
    sCtx.font = `500 ${Math.floor(width * 0.024)}px sans-serif`;
    sCtx.fillText('Show this card at Our Sanctuary Clubhouse to receive your physical prize!', width / 2, botY + 35);

    sCtx.fillStyle = '#86EFAC';
    sCtx.font = `700 ${Math.floor(width * 0.025)}px sans-serif`;
    sCtx.fillText('🍂 Friendsgiving Gathering • Sunday, Nov 22, 2026 • 2:00 PM PST', width / 2, botY + 70);

    sCtx.fillStyle = 'rgba(255, 253, 247, 0.6)';
    sCtx.font = `400 ${Math.floor(width * 0.022)}px sans-serif`;
    sCtx.fillText('🎶 Tuned to 528Hz & 432Hz | Substance-Free Community', width / 2, botY + 100);
  }

  function renderStoryCanvasPreview(prize, claim) {
    const previewCanvas = document.getElementById('raffleStoryCanvas');
    if (!previewCanvas) return;
    drawInstagramStoryCard(previewCanvas, prize, claim, 360, 640);
  }

  // Download Story Card (.PNG) & Increment Download Count
  function downloadStoryCard() {
    let claim = null;
    try {
      claim = JSON.parse(sessionStorage.getItem(STORAGE_KEY_ACTIVE_CLAIM));
    } catch (e) {}

    const code = claim ? claim.code : 'IS-777-WIN';
    const offscreen = document.createElement('canvas');
    drawInstagramStoryCard(offscreen, currentWonPrize, claim, 1080, 1920);

    const link = document.createElement('a');
    link.download = `inner-sanctuary-win-${code}.png`;
    link.href = offscreen.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Update download counter in ledger
    if (claim) {
      claim.downloadCount = (claim.downloadCount || 0) + 1;
      sessionStorage.setItem(STORAGE_KEY_ACTIVE_CLAIM, JSON.stringify(claim));

      try {
        const claims = JSON.parse(localStorage.getItem(STORAGE_KEY_CLAIMS) || '[]');
        const idx = claims.findIndex(c => c.code === claim.code);
        if (idx !== -1) {
          claims[idx].downloadCount = claim.downloadCount;
          localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(claims));
        }
      } catch (e) {}

      const badge = document.getElementById('raffleDownloadCountBadge');
      if (badge) badge.textContent = `${claim.downloadCount} Downloads`;
    }

    playUnlockSound();
    alert('📸 Instagram Story Card downloaded! Post it to your story, tag @innersanctuary, and show it at the door to claim your prize!');
  }

  // Share to Instagram / Copy Tag
  function shareToInstagram() {
    let claim = null;
    try {
      claim = JSON.parse(sessionStorage.getItem(STORAGE_KEY_ACTIVE_CLAIM));
    } catch (e) {}

    const prizeName = currentWonPrize ? currentWonPrize.name : 'a gathering blessing';
    const code = claim ? claim.code : 'IS-777-WIN';
    const caption = `I just won ${prizeName} at the Inner Sanctuary Speakeasy! 🌿🎁 Claim Code: ${code} • Tagging @innersanctuary #InnerSanctuary #Friendsgiving`;

    if (navigator.share) {
      navigator.share({
        title: 'I won at Inner Sanctuary!',
        text: caption,
        url: window.location.href
      }).catch(() => {});
    } else {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(caption);
        alert('📋 Instagram caption copied to clipboard!\n\nOpen Instagram, add your downloaded winner graphic to your story, and tag @innersanctuary!');
      } else {
        alert(caption);
      }
    }
  }

  // VIP Admin Deck Functions (Marlon & Teshia)
  function exportClaimsCSV() {
    let claims = [];
    try {
      claims = JSON.parse(localStorage.getItem(STORAGE_KEY_CLAIMS) || '[]');
    } catch (e) {
      claims = [];
    }

    if (!claims || claims.length === 0) {
      alert('📋 No prize claims recorded yet in the ledger.');
      return;
    }

    const headers = ['Timestamp', 'Claim Code', 'Full Name', 'Email', 'Instagram Handle', 'Prize Won', 'Rarity', 'Download Count'];
    const rows = claims.map(c => [
      `"${c.timestamp || ''}"`,
      `"${c.code || ''}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.ig || '').replace(/"/g, '""')}"`,
      `"${(c.prize || '').replace(/"/g, '""')}"`,
      `"${c.rarity || ''}"`,
      c.downloadCount || 0
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inner-sanctuary-raffle-claims-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function resetTestSpins() {
    sessionStorage.removeItem(STORAGE_KEY_VIP);
    localStorage.setItem(STORAGE_KEY_TOKENS, '2');
    currentTokens = 2;
    updateTokenDisplay();
    updateVipAdminDeck();
    alert('🔄 Test spins reset to 2! VIP mode temporarily toggled off to simulate attendee experience.');
  }

  function setForcedPrize(typeId) {
    forcedPrizeTypeId = typeId || null;
    if (forcedPrizeTypeId) {
      console.log(`[VIP] Forced prize drop set to: ${forcedPrizeTypeId}`);
    } else {
      console.log(`[VIP] Prize drops set to random weighted.`);
    }
  }

  function initWheelCanvas() {
    canvas = document.getElementById('raffleWheelCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 480 * dpr;
    canvas.height = 480 * dpr;

    drawWheel();
  }

  // Knock 3 Times & Open Speakeasy directly on Wheel Tab
  function openSpeakeasyWheel() {
    if (typeof window.handleSpeakeasyKnock === 'function') {
      window.handleSpeakeasyKnock();
      setTimeout(() => {
        window.handleSpeakeasyKnock();
      }, 250);
      setTimeout(() => {
        window.handleSpeakeasyKnock();
      }, 500);
    } else if (typeof window.openSpeakeasyModal === 'function') {
      window.openSpeakeasyModal();
    }

    setTimeout(() => {
      if (typeof window.switchSpeakeasyTab === 'function') {
        window.switchSpeakeasyTab('wheel');
      }
      updateWheelGateVisibility();
      if (isWheelUnlocked()) {
        initWheelCanvas();
      } else {
        const input = document.getElementById('speakeasyWheelPassInput');
        if (input) input.focus();
      }
    }, 800);
  }

  // Public API
  window.sanctuaryRaffleWheel = {
    initWheelCanvas: initWheelCanvas,
    unlockWithPasskey: unlockWithPasskey,
    openSpeakeasyWheel: openSpeakeasyWheel,
    spin: spin,
    isUnlocked: isWheelUnlocked,
    submitClaim: submitClaim,
    downloadStoryCard: downloadStoryCard,
    shareToInstagram: shareToInstagram,
    exportClaimsCSV: exportClaimsCSV,
    resetTestSpins: resetTestSpins,
    setForcedPrize: setForcedPrize
  };

  function initSpeakeasyWheelListeners() {
    loadTokens();
    updateWheelGateVisibility();

    const spinBtn = document.getElementById('raffleSpinBtn');
    const spinAgainBtn = document.getElementById('raffleSpinAgainBtn');
    const wheelCanvas = document.getElementById('raffleWheelCanvas');

    if (spinBtn) spinBtn.addEventListener('click', spin);
    if (spinAgainBtn) spinAgainBtn.addEventListener('click', spin);
    if (wheelCanvas) wheelCanvas.addEventListener('click', spin);

    // Hash check #raffle or #raffle-wheel
    if (window.location.hash === '#raffle' || window.location.hash === '#raffle-wheel') {
      openSpeakeasyWheel();
    }
  }

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#raffle' || window.location.hash === '#raffle-wheel') {
      openSpeakeasyWheel();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpeakeasyWheelListeners);
  } else {
    initSpeakeasyWheelListeners();
  }
})();
