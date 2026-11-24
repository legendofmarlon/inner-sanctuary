/**
 * Inner Sanctuary Wellness Foundation — Auto Promo Card Generator
 * Client-Side HTML5 Canvas Engine generating high-res social media graphics for featured artists
 */
(function() {
  'use strict';

  let currentFormat = 'square'; // 'square' (1080x1080) or 'story' (1080x1920)
  let activeArtistData = {
    artistName: 'Maya Lin',
    category: 'Unplugged Acoustic & Spoken Word',
    slot: '6:30 PM',
    date: 'Thursday, December 10, 2026',
    location: '1501 W Alton Ave, Santa Ana, CA'
  };

  let emblemImg = null;

  function loadEmblemImage() {
    if (!emblemImg) {
      emblemImg = new Image();
      emblemImg.crossOrigin = 'anonymous';
      emblemImg.src = 'emblem.png';
      emblemImg.onload = () => {
        renderCanvas();
      };
      emblemImg.onerror = () => {
        emblemImg = null;
      };
    }
  }

  function renderModalStructure() {
    if (document.getElementById('promoGeneratorModal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'promoGeneratorModal';
    overlay.className = 'promo-generator-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'promoModalTitle');

    overlay.innerHTML = `
      <div class="promo-generator-modal">
        <div class="promo-generator-header">
          <div>
            <span style="font-size: 0.72rem; color: #F5D77F; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
              ✦ Stage Promotion Studio
            </span>
            <h2 id="promoModalTitle" class="promo-generator-title">Artist Promo Graphic Generator</h2>
          </div>
          <button type="button" class="stage-board-close-btn" id="promoCloseBtn" aria-label="Close Promo Studio">✕</button>
        </div>

        <div class="promo-workspace-grid">
          
          <!-- Left: Canvas Preview -->
          <div class="promo-canvas-stage">
            <canvas id="promoCardCanvas" width="1080" height="1080"></canvas>
          </div>

          <!-- Right: Controls -->
          <div class="promo-controls-col">
            
            <div class="promo-input-group">
              <label class="promo-input-label">Graphic Format</label>
              <div class="promo-format-row">
                <button type="button" class="promo-format-btn active" id="btnFormatSquare">Square (1:1 Feed)</button>
                <button type="button" class="promo-format-btn" id="btnFormatStory">Story (9:16 Vertical)</button>
              </div>
            </div>

            <div class="promo-input-group">
              <label class="promo-input-label" for="promoArtistNameInput">Artist Name</label>
              <input type="text" id="promoArtistNameInput" class="promo-input-field" value="Maya Lin">
            </div>

            <div class="promo-input-group">
              <label class="promo-input-label" for="promoCategoryInput">Performance Category</label>
              <input type="text" id="promoCategoryInput" class="promo-input-field" value="Unplugged Acoustic &amp; Spoken Word">
            </div>

            <div class="promo-input-group">
              <label class="promo-input-label" for="promoDateInput">Date &amp; Time Slot</label>
              <input type="text" id="promoDateInput" class="promo-input-field" value="Thursday, Dec 10 • 6:30 PM PST">
            </div>

            <div class="promo-input-group">
              <label class="promo-input-label" for="promoLocationInput">Sanctuary Location</label>
              <input type="text" id="promoLocationInput" class="promo-input-field" value="1501 W Alton Ave, Santa Ana, CA">
            </div>

            <button type="button" id="promoDownloadBtn" class="promo-download-btn">
              <span>📥 Download High-Res PNG (Instagram Ready)</span>
            </button>

          </div>

        </div>

      </div>
    `;

    document.body.appendChild(overlay);
    attachPromoListeners();
  }

  function attachPromoListeners() {
    const overlay = document.getElementById('promoGeneratorModal');
    const closeBtn = document.getElementById('promoCloseBtn');
    const downloadBtn = document.getElementById('promoDownloadBtn');
    const formatSq = document.getElementById('btnFormatSquare');
    const formatSt = document.getElementById('btnFormatStory');

    const nameInput = document.getElementById('promoArtistNameInput');
    const catInput = document.getElementById('promoCategoryInput');
    const dateInput = document.getElementById('promoDateInput');
    const locInput = document.getElementById('promoLocationInput');

    const handleClose = () => window.sanctuaryPromoCard.close();
    closeBtn.addEventListener('click', handleClose);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) handleClose();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        handleClose();
      }
    });

    formatSq.addEventListener('click', () => {
      currentFormat = 'square';
      formatSq.classList.add('active');
      formatSt.classList.remove('active');
      renderCanvas();
    });

    formatSt.addEventListener('click', () => {
      currentFormat = 'story';
      formatSt.classList.add('active');
      formatSq.classList.remove('active');
      renderCanvas();
    });

    // Live update on input
    [nameInput, catInput, dateInput, locInput].forEach(inp => {
      inp.addEventListener('input', () => {
        activeArtistData.artistName = nameInput.value || 'Artist';
        activeArtistData.category = catInput.value || 'Live Expression';
        activeArtistData.date = dateInput.value || 'Upcoming Gathering';
        activeArtistData.location = locInput.value || 'Sanctuary Clubhouse';
        renderCanvas();
      });
    });

    // Download action
    downloadBtn.addEventListener('click', () => {
      const canvas = document.getElementById('promoCardCanvas');
      if (!canvas) return;

      const safeName = (activeArtistData.artistName || 'artist').toLowerCase().replace(/[^a-z0-9]/g, '-');
      const filename = `inner-sanctuary-promo-${safeName}-${currentFormat}.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  function renderCanvas() {
    const canvas = document.getElementById('promoCardCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const isSquare = (currentFormat === 'square');
    const W = 1080;
    const H = isSquare ? 1080 : 1920;

    canvas.width = W;
    canvas.height = H;

    // 1. Background radial gradient
    const bgGrad = ctx.createRadialGradient(W / 2, H * 0.35, 100, W / 2, H * 0.5, H * 0.75);
    bgGrad.addColorStop(0, '#1E3328');
    bgGrad.addColorStop(0.55, '#121E18');
    bgGrad.addColorStop(1, '#0A120E');

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Subtle celestial dust particles
    ctx.fillStyle = 'rgba(248, 217, 140, 0.25)';
    for (let i = 0; i < 40; i++) {
      const px = (Math.sin(i * 99) * 0.5 + 0.5) * W;
      const py = (Math.cos(i * 37) * 0.5 + 0.5) * H;
      const pr = (i % 3) + 1.2;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Ornate gold border frame
    ctx.strokeStyle = 'rgba(197, 154, 63, 0.45)';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    ctx.strokeStyle = 'rgba(197, 154, 63, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(52, 52, W - 104, H - 104);

    // 4. Emblem at top
    const centerY = isSquare ? 480 : 760;
    const emblemY = isSquare ? 140 : 280;
    const emblemSize = isSquare ? 120 : 160;

    if (emblemImg && emblemImg.complete) {
      try {
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, emblemY, emblemSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(emblemImg, (W - emblemSize) / 2, emblemY - (emblemSize / 2), emblemSize, emblemSize);
        ctx.restore();

        // Ring around emblem
        ctx.strokeStyle = '#C59A3F';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(W / 2, emblemY, (emblemSize / 2) + 6, 0, Math.PI * 2);
        ctx.stroke();
      } catch (e) {}
    }

    // 5. Header branding typography
    ctx.textAlign = 'center';
    ctx.fillStyle = '#C59A3F';
    ctx.font = '700 24px Montserrat, sans-serif';
    ctx.letterSpacing = '6px';
    const brandY = isSquare ? 250 : 440;
    ctx.fillText('INNER SANCTUARY WELLNESS FOUNDATION', W / 2, brandY);

    ctx.fillStyle = '#CBD7D0';
    ctx.font = '500 18px Montserrat, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('OFFICIAL 501(c)(3) PUBLIC CHARITY • SACRED OPEN MIC', W / 2, brandY + 30);

    // 6. Sub-badge
    ctx.fillStyle = 'rgba(197, 154, 63, 0.2)';
    const badgeW = 340;
    const badgeH = 44;
    const badgeY = isSquare ? 350 : 600;
    roundRect(ctx, (W - badgeW) / 2, badgeY, badgeW, badgeH, 22);
    ctx.fill();
    ctx.strokeStyle = '#C59A3F';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FAD277';
    ctx.font = '700 16px Montserrat, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('✦ FEATURED ARTIST ✦', W / 2, badgeY + 28);

    // 7. Artist Name
    ctx.fillStyle = '#FFFDF7';
    ctx.font = '800 68px Cinzel, serif';
    ctx.letterSpacing = '2px';
    const nameY = isSquare ? 490 : 770;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 16;
    ctx.fillText(activeArtistData.artistName || 'Maya Lin', W / 2, nameY);
    ctx.shadowBlur = 0;

    // 8. Performance Category Pill
    ctx.fillStyle = '#F8D98C';
    ctx.font = '600 26px Montserrat, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText(`“${activeArtistData.category || 'Live Expression'}”`, W / 2, nameY + 54);

    // 9. Date & Location Card
    const cardW = 760;
    const cardH = isSquare ? 150 : 200;
    const cardY = isSquare ? 630 : 980;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    roundRect(ctx, (W - cardW) / 2, cardY, cardW, cardH, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(197, 154, 63, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#FAD277';
    ctx.font = '700 28px Cinzel, serif';
    ctx.fillText(activeArtistData.date || 'Sunday, Nov 22 • 2:00 PM PST', W / 2, cardY + (isSquare ? 60 : 75));

    ctx.fillStyle = '#CBD7D0';
    ctx.font = '500 21px Montserrat, sans-serif';
    ctx.fillText(activeArtistData.location || 'Our Sanctuary Clubhouse, Orange County, CA', W / 2, cardY + (isSquare ? 104 : 130));

    // 10. Footer Values & Impact Statement
    const footerY = isSquare ? 950 : 1700;
    ctx.fillStyle = '#8C6212';
    ctx.font = '700 18px Montserrat, sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('100% SUBSTANCE-FREE • TRAUMA-INFORMED • FREE COMMUNITY ADMISSION', W / 2, footerY);

    ctx.fillStyle = '#CBD7D0';
    ctx.font = '400 16px Montserrat, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('RSVP & Details: innersanctuarywellnessfoundation.org • @ourinnersanctuary', W / 2, footerY + 30);
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Public API
  window.sanctuaryPromoCard = {
    open: function(artistData) {
      loadEmblemImage();
      renderModalStructure();

      if (artistData) {
        activeArtistData = Object.assign(activeArtistData, artistData);

        const nameInp = document.getElementById('promoArtistNameInput');
        const catInp = document.getElementById('promoCategoryInput');
        const dateInp = document.getElementById('promoDateInput');
        const locInp = document.getElementById('promoLocationInput');

        if (nameInp) nameInp.value = activeArtistData.artistName;
        if (catInp) catInp.value = activeArtistData.category;
        if (dateInp) dateInp.value = activeArtistData.date || `${activeArtistData.slot}`;
        if (locInp) locInp.value = activeArtistData.location;
      }

      renderCanvas();

      const modal = document.getElementById('promoGeneratorModal');
      if (modal) {
        document.body.style.overflow = 'hidden';
        modal.classList.add('active');
      }
    },
    close: function() {
      const modal = document.getElementById('promoGeneratorModal');
      if (modal) modal.classList.remove('active');
      document.body.style.overflow = '';
    },
    render: renderCanvas
  };

  loadEmblemImage();
})();
