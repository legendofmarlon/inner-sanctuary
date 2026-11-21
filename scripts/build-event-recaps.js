/**
 * Inner Sanctuary Wellness Foundation — Event-to-Sponsor Build Machine
 * Parses /content/recaps/*.md, recalculates live homepage impact metrics,
 * generates Past Events cards, and compiles 1-page print-ready sponsor receipts.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const RECAPS_DIR = path.join(ROOT_DIR, 'content', 'recaps');
const RECEIPTS_DIR = path.join(ROOT_DIR, 'reports', 'receipts');
const INDEX_HTML_PATH = path.join(ROOT_DIR, 'index.html');
const MANIFEST_PATH = path.join(ROOT_DIR, 'content', 'recaps-index.json');

// Simple native YAML frontmatter parser (zero npm dependencies)
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const rawYaml = match[1];
  const body = match[2];
  const meta = {};

  let currentKey = null;
  let inArray = false;

  rawYaml.split(/\r?\n/).forEach(line => {
    line = line.trimEnd();
    if (!line || line.startsWith('#')) return;

    // Array item
    if (line.trim().startsWith('- ')) {
      const val = line.trim().slice(2).replace(/^['"]|['"]$/g, '');
      if (currentKey && Array.isArray(meta[currentKey])) {
        meta[currentKey].push(val);
      }
      return;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx > -1) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();

      if (val === '') {
        // Possible array or object
        meta[key] = [];
        currentKey = key;
        inArray = true;
      } else {
        inArray = false;
        currentKey = key;
        val = val.replace(/^['"]|['"]$/g, '');
        if (!isNaN(val) && val !== '') {
          val = Number(val);
        }
        meta[key] = val;
      }
    }
  });

  return { meta, body };
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateSponsorReceiptHtml(slug, meta, body) {
  const dateFormatted = new Date(meta.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Community Impact &amp; Sponsor Receipt | ${meta.title}</title>
  <meta name="description" content="Official IRS 501(c)(3) Public Charity Community Impact &amp; Sponsorship Receipt for Inner Sanctuary Wellness Foundation.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: letter portrait;
      margin: 0.5in;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Montserrat', sans-serif;
      color: #1C1B18;
      background: #F8F6F0;
      font-size: 13px;
      line-height: 1.5;
      padding: 24px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .receipt-container {
      max-width: 780px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1.5px solid rgba(197, 154, 63, 0.5);
      border-radius: 16px;
      padding: 36px 36px 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      position: relative;
    }
    .receipt-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #C59A3F;
      padding-bottom: 18px;
      margin-bottom: 20px;
    }
    .org-title {
      font-family: 'Cinzel', serif;
      font-size: 20px;
      font-weight: 800;
      color: #2B4436;
      letter-spacing: 0.04em;
    }
    .org-sub {
      font-size: 10px;
      font-weight: 700;
      color: #8C6212;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .org-fiduciary-meta {
      font-size: 11px;
      color: #555;
      margin-top: 6px;
      line-height: 1.4;
    }
    .receipt-badge-box {
      text-align: right;
    }
    .cra-badge {
      display: inline-block;
      background: #2B4436;
      color: #F8D98C;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 999px;
      margin-bottom: 6px;
    }
    .receipt-num {
      font-size: 11px;
      font-weight: 600;
      color: #666;
    }
    .event-title-banner {
      background: rgba(43, 68, 54, 0.06);
      border-left: 4px solid #C59A3F;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .event-name {
      font-family: 'Cinzel', serif;
      font-size: 16px;
      font-weight: 700;
      color: #2B4436;
    }
    .event-details-row {
      font-size: 11px;
      color: #444;
      margin-top: 4px;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .metric-cell {
      background: #FAF8F3;
      border: 1px solid rgba(197, 154, 63, 0.3);
      border-radius: 10px;
      padding: 12px 10px;
      text-align: center;
    }
    .metric-value {
      font-family: 'Cinzel', serif;
      font-size: 22px;
      font-weight: 700;
      color: #2B4436;
    }
    .metric-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #8C6212;
      margin-top: 2px;
    }
    .section-heading {
      font-family: 'Cinzel', serif;
      font-size: 12px;
      font-weight: 700;
      color: #2B4436;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
      border-bottom: 1px solid rgba(197, 154, 63, 0.25);
      padding-bottom: 4px;
    }
    .highlights-list {
      list-style: none;
      margin-bottom: 18px;
    }
    .highlights-list li {
      font-size: 11.5px;
      color: #333;
      margin-bottom: 5px;
      padding-left: 14px;
      position: relative;
    }
    .highlights-list li::before {
      content: '✦';
      position: absolute;
      left: 0;
      color: #C59A3F;
      font-size: 10px;
    }
    .quote-box {
      background: rgba(197, 154, 63, 0.08);
      border-left: 3px solid #C59A3F;
      padding: 10px 14px;
      border-radius: 6px;
      font-style: italic;
      color: #2B4436;
      font-size: 12px;
      margin-bottom: 22px;
    }
    .quote-author {
      font-style: normal;
      font-weight: 700;
      font-size: 10px;
      color: #8C6212;
      margin-top: 4px;
      text-align: right;
    }
    .fiduciary-affirmation {
      font-size: 10px;
      color: #555;
      background: #FAF8F3;
      padding: 10px 12px;
      border-radius: 6px;
      border: 1px dashed rgba(197, 154, 63, 0.4);
      margin-bottom: 24px;
      line-height: 1.45;
    }
    .signatures-row {
      display: flex;
      justify-content: space-between;
      gap: 30px;
      margin-top: 10px;
      padding-top: 14px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }
    .sig-block {
      flex: 1;
      text-align: center;
    }
    .sig-line {
      height: 1px;
      background: #C59A3F;
      margin: 18px 0 6px;
    }
    .sig-name {
      font-family: 'Cinzel', serif;
      font-size: 12px;
      font-weight: 700;
      color: #2B4436;
    }
    .sig-title {
      font-size: 9.5px;
      color: #777;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .print-btn-bar {
      margin-top: 20px;
      text-align: center;
    }
    @media print {
      .print-btn-bar {
        display: none;
      }
      body {
        padding: 0;
        background: #FFFFFF;
      }
      .receipt-container {
        border: none;
        box-shadow: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>

  <div class="receipt-container">
    
    <!-- Header -->
    <div class="receipt-header">
      <div>
        <h1 class="org-title">INNER SANCTUARY WELLNESS FOUNDATION</h1>
        <div class="org-sub">Official 501(c)(3) Public Charity • Community Arts &amp; Somatic Care</div>
        <div class="org-fiduciary-meta">
          <strong>IRS EIN:</strong> 39-3757168 • IRC Section 170(b)(1)(A)(vi) Public Charity<br>
          <strong>Headquarters:</strong> Santa Ana, Orange County &amp; Inland Empire, California<br>
          <strong>Web:</strong> innersanctuarywellnessfoundation.org • <strong>Direct:</strong> hello@innersanctuarywellnessfoundation.org
        </div>
      </div>
      <div class="receipt-badge-box">
        <span class="cra-badge">CRA Community Development</span>
        <div class="receipt-num">Receipt #: ISW-${slug.toUpperCase()}</div>
        <div style="font-size: 10px; color: #777; margin-top: 2px;">Issued: ${dateFormatted}</div>
      </div>
    </div>

    <!-- Event Banner -->
    <div class="event-title-banner">
      <div class="event-name">${meta.title}</div>
      <div class="event-details-row">
        <span>📍 <strong>Location:</strong> ${meta.location}</span>
        <span>📅 <strong>Date:</strong> ${dateFormatted}</span>
        <span>🤝 <strong>Supported by:</strong> ${meta.sponsor || 'Community Seed Partners'}</span>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="metrics-grid">
      <div class="metric-cell">
        <div class="metric-value">${meta.headcount || 0}</div>
        <div class="metric-label">Community Attendees</div>
      </div>
      <div class="metric-cell">
        <div class="metric-value">${meta.performers || 0}</div>
        <div class="metric-label">Featured Artists</div>
      </div>
      <div class="metric-cell">
        <div class="metric-value">${meta.impactHours || 0} hrs</div>
        <div class="metric-label">Documented Care</div>
      </div>
      <div class="metric-cell">
        <div class="metric-value">100%</div>
        <div class="metric-label">Substance-Free Safe Space</div>
      </div>
    </div>

    <!-- Verified Highlights -->
    <div class="section-heading">Documented Impact &amp; Program Highlights</div>
    <ul class="highlights-list">
      ${(meta.highlights || []).map(h => `<li>${h}</li>`).join('\n      ')}
    </ul>

    <!-- Direct Community Voice Quote -->
    ${meta.quote ? `
    <div class="quote-box">
      "${meta.quote}"
      <div class="quote-author">— ${meta.attendeeVoice || 'Gathering Participant'}</div>
    </div>` : ''}

    <!-- Fiduciary Tax & CRA Statement -->
    <div class="fiduciary-affirmation">
      <strong>Fiduciary &amp; Tax-Exempt Acknowledgment:</strong> Inner Sanctuary Wellness Foundation certifies that no goods or services were provided in exchange for the financial and in-kind sponsorship provided for this activation other than intangible religious, somatic, and community benefits per IRC Section 170(f)(8). These documented hours support low-to-moderate-income (LMI) community mental wellness and qualify for California Arts Council and Community Reinvestment Act (CRA) development consideration.
    </div>

    <!-- Executive Signatures -->
    <div class="signatures-row">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">Teshia Campbell</div>
        <div class="sig-title">Executive Director &amp; Founder</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-name">Marlon Smith</div>
        <div class="sig-title">President &amp; Stage Curator</div>
      </div>
    </div>

  </div>

  <div class="print-btn-bar">
    <button onclick="window.print()" style="background: #2B4436; color: #F8D98C; border: none; padding: 10px 24px; border-radius: 999px; font-weight: 700; cursor: pointer; font-family: 'Cinzel', serif; font-size: 13px;">
      🖨️ Print / Save as 1-Page PDF Receipt
    </button>
  </div>

</body>
</html>`;
}

function runBuild() {
  console.log('⚡ Starting Inner Sanctuary Event-to-Sponsor Build Machine...');

  ensureDir(RECAPS_DIR);
  ensureDir(RECEIPTS_DIR);

  const files = fs.readdirSync(RECAPS_DIR).filter(f => f.endsWith('.md'));
  console.log(`📂 Found ${files.length} recap files in ${RECAPS_DIR}`);

  const recaps = [];
  let totalHeadcount = 0;
  let totalPerformers = 0;
  let totalHours = 0;

  files.forEach(file => {
    const filePath = path.join(RECAPS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { meta, body } = parseFrontmatter(content);
    const slug = file.replace(/\.md$/, '');

    meta.slug = slug;
    recaps.push(meta);

    totalHeadcount += (Number(meta.headcount) || 0);
    totalPerformers += (Number(meta.performers) || 0);
    totalHours += (Number(meta.impactHours) || 0);

    // Generate individual print-ready 1-page HTML/PDF receipts
    const receiptHtml = generateSponsorReceiptHtml(slug, meta, body);
    const receiptPath = path.join(RECEIPTS_DIR, `${slug}-impact-receipt.html`);
    fs.writeFileSync(receiptPath, receiptHtml, 'utf8');
    console.log(`✅ Generated Sponsor Receipt: ${slug}-impact-receipt.html`);
  });

  // Sort recaps descending by date
  recaps.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Write recaps manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify({
    generatedAt: new Date().toISOString(),
    metrics: {
      totalGatherings: recaps.length,
      totalHeadcount: totalHeadcount,
      totalPerformers: totalPerformers,
      totalHours: totalHours
    },
    recaps: recaps
  }, null, 2), 'utf8');
  console.log(`📄 Recaps Manifest saved to ${MANIFEST_PATH}`);

  // Generate HTML Cards for the homepage Past Gatherings section
  const pastEventsCardsHtml = recaps.map(r => {
    const formattedDate = new Date(r.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const photo = (r.photos && r.photos[0]) ? r.photos[0] : 'emblem.png';

    return `
            <!-- Event Card: ${r.slug} -->
            <div class="calendar-event-card" style="background: rgba(30, 49, 39, 0.96); border: 1.5px solid rgba(197, 154, 63, 0.45); border-radius: 18px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.25);">
              <div style="position: relative; height: 180px; overflow: hidden;">
                <img src="${photo}" alt="${r.title}" style="width: 100%; height: 100%; object-fit: cover;">
                <div style="position: absolute; top: 12px; left: 12px; background: rgba(18, 30, 24, 0.90); border: 1px solid #C59A3F; color: #F8D98C; font-size: 0.72rem; font-weight: 700; padding: 4px 10px; border-radius: 999px;">
                  ✦ ${r.impactType || 'Gathering'}
                </div>
              </div>
              <div style="padding: 20px; display: flex; flex-direction: column; flex: 1;">
                <div style="font-size: 0.76rem; color: #F5D77F; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
                  ${formattedDate} • ${r.location}
                </div>
                <h4 style="font-family: 'Cinzel', serif; font-size: 1.25rem; color: #FFFFFF; font-weight: 700; margin-bottom: 10px; line-height: 1.35;">
                  ${r.title}
                </h4>
                <div style="display: flex; gap: 12px; margin-bottom: 14px; font-size: 0.82rem; color: #CBD7D0;">
                  <span>👥 <strong>${r.headcount}</strong> Neighbors</span>
                  <span>🎙️ <strong>${r.performers}</strong> Artists</span>
                  <span>⏳ <strong>${r.impactHours}</strong> Care Hrs</span>
                </div>
                ${r.quote ? `
                <div style="background: rgba(0, 0, 0, 0.22); border-left: 2px solid #C59A3F; padding: 8px 12px; border-radius: 4px; font-size: 0.82rem; color: #EDE8DD; font-style: italic; margin-bottom: 16px;">
                  "${r.quote}"
                </div>` : ''}
                <div style="margin-top: auto; display: flex; gap: 8px;">
                  <a href="reports/receipts/${r.slug}-impact-receipt.html" target="_blank" class="btn btn-outline" style="border-color: #C59A3F; color: #F8D98C; font-size: 0.78rem; padding: 6px 14px; border-radius: 999px; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                    <span>📄 Sponsor &amp; Impact Receipt</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            </div>`;
  }).join('\n');

  // Update index.html metrics and past events grid
  if (fs.existsSync(INDEX_HTML_PATH)) {
    let html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

    // Update Headcount and Performer metrics if present
    const metricsBarRegex = /<!-- Community Impact Metrics Bar -->[\s\S]*?<\/div>[\s\S]*?<\/div>/;
    const updatedMetricsBar = `<!-- Community Impact Metrics Bar -->
        <div class="community-impact-metrics-bar">
          <div class="impact-metric-card">
            <div class="impact-metric-num" id="metric-headcount-total">${totalHeadcount}+</div>
            <div class="impact-metric-label">Documented Community Attendees</div>
            <div class="impact-metric-sub">Across ${recaps.length} verified Santa Ana &amp; OC circles</div>
          </div>
          <div class="impact-metric-card">
            <div class="impact-metric-num" id="metric-performers-total">${totalPerformers}+</div>
            <div class="impact-metric-label">Featured Performers &amp; Healers</div>
            <div class="impact-metric-sub">Poets, singers, acoustic sets &amp; comedians</div>
          </div>
          <div class="impact-metric-card">
            <div class="impact-metric-num" id="metric-hours-total">${totalHours}h</div>
            <div class="impact-metric-label">Trauma-Informed Care Delivered</div>
            <div class="impact-metric-sub">Substance-free somatic wellness sanctuary</div>
          </div>
          <div class="impact-metric-card">
            <div class="impact-metric-num">$0</div>
            <div class="impact-metric-label">Barrier to Entry</div>
            <div class="impact-metric-sub">100% free community admission for all</div>
          </div>
        </div>`;

    if (html.includes('<!-- Community Impact Metrics Bar -->')) {
      html = html.replace(metricsBarRegex, updatedMetricsBar);
    }

    // Update Past Events Grid if anchor exists
    if (html.includes('id="past-gatherings-cards-container"')) {
      const pastGridRegex = /<div class="calendar-cards-grid" id="past-gatherings-cards-container">[\s\S]*?<\/div>/;
      const updatedPastGrid = `<div class="calendar-cards-grid" id="past-gatherings-cards-container">\n${pastEventsCardsHtml}\n        </div>`;
      html = html.replace(pastGridRegex, updatedPastGrid);
    }

    fs.writeFileSync(INDEX_HTML_PATH, html, 'utf8');
    console.log(`✅ Updated index.html with live impact metrics: ${totalHeadcount}+ attendees, ${totalPerformers}+ performers, ${totalHours} hours.`);
  }

  console.log('🎉 One-Drop Event-to-Sponsor Build completed successfully!');
}

runBuild();
