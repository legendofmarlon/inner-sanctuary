const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\danie\\OneDrive\\Documents\\GitHub\\inner-sanctuary';
const indexFile = path.join(rootDir, 'index.html');
const scriptFile = path.join(rootDir, 'script.js');

let html = fs.readFileSync(indexFile, 'utf8');
let js = fs.readFileSync(scriptFile, 'utf8');

// =========================================================================
// 1. REMOVE DISCOVERY OS SECTION FROM MAIN FLOW OF INDEX.HTML
// =========================================================================
// Remove section #discovery-os (from <!-- === 3D SANCTUARY SEARCH & DISCOVERY OS === --> to </section>)
const sectionStart = html.indexOf('<!-- ==================== 3D SANCTUARY SEARCH & DISCOVERY OS ==================== -->');
const sectionEndStr = '</section>\n\n  <!-- ==================== OUR FUTURE VISION ==================== -->';
const sectionEnd = html.indexOf(sectionEndStr);

if (sectionStart !== -1 && sectionEnd !== -1) {
  console.log('Found discovery-os section, removing from main flow...');
  html = html.slice(0, sectionStart) + '<!-- ==================== OUR FUTURE VISION ==================== -->' + html.slice(sectionEnd + sectionEndStr.length);
} else {
  console.log('Warning: could not locate exact discovery-os section bounds.');
}

// Remove script tag for js/sanctuary-discovery-os.js from index.html (it is loaded by sanctuary-discovery-os.html popup)
html = html.replace(/\s*<script src="js\/sanctuary-discovery-os\.js\?v=[^"]+"><\/script>/g, '');

// =========================================================================
// 2. CLEAN UP TOP & MOBILE HEADER NAVIGATION LINKS
// =========================================================================
// Desktop nav item
const desktopNavPattern = /\s*<li>\s*<a href="#discovery-os" class="nav-link-dual">[\s\S]*?<\/a>\s*<\/li>/;
html = html.replace(desktopNavPattern, '');

// Mobile nav item
const mobileNavPattern = /\s*<li>\s*<a href="#discovery-os" class="mobile-nav-item"[\s\S]*?<\/a>\s*<\/li>/;
html = html.replace(mobileNavPattern, '');

// =========================================================================
// 3. ADD BUTTON AT BOTTOM OF PAGE (FOOTER) TO POP OPEN DISCOVERY OS WINDOW
// =========================================================================
// Add under Quick Navigation in footer
const quickNavTarget = '<li><a href="#connect">Get Involved With Us</a></li>';
const quickNavReplacement = `<li><a href="#connect">Get Involved With Us</a></li>\n            <li><a href="javascript:void(0)" onclick="openDiscoveryOsWindow()" style="color: var(--sunburst-gold); font-weight: 600;">📡 Open Discovery OS (3D Window) ↗</a></li>`;
html = html.replace(quickNavTarget, quickNavReplacement);

// Add elegant banner button right above footer-bottom
const footerBottomTarget = '<!-- Footer Bottom -->';
const footerBannerButton = `<!-- Sanctuary Discovery OS Popup Window Banner -->
      <div class="footer-os-banner" style="margin: 36px 0 24px; padding: 22px 26px; background: rgba(0, 0, 0, 0.45); border: 1.5px solid rgba(197, 154, 63, 0.4); border-radius: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; backdrop-filter: blur(8px);">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="font-size: 2rem; line-height: 1;">📡</div>
          <div>
            <div style="font-family: 'Cinzel', serif; font-size: 1.05rem; font-weight: 700; color: #FFFDF7; letter-spacing: 0.04em;">
              Sanctuary Discovery OS
            </div>
            <div style="font-size: 0.82rem; color: #CBD7D0; margin-top: 3px; max-width: 580px; line-height: 1.5;">
              Pop open our 3D Search &amp; Radar Command Center: real-time AI visibility radar, entity knowledge graph, and autonomous weekly guardian telemetry.
            </div>
          </div>
        </div>
        <div>
          <button type="button" class="btn btn-gold" onclick="openDiscoveryOsWindow()" style="padding: 12px 24px; font-size: 0.86rem; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 18px rgba(197, 154, 63, 0.35); cursor: pointer;" aria-label="Pop open 3D Sanctuary Discovery OS in a dedicated window">
            <span>⚡ Pop Open Discovery OS</span>
            <span style="font-size: 0.82rem;">↗</span>
          </button>
        </div>
      </div>

      <!-- Footer Bottom -->`;
html = html.replace(footerBottomTarget, footerBannerButton);

// =========================================================================
// 4. KEEP BLACK-LED IN BACKGROUND CODING ONLY (SOFTEN FOREFRONT VISUAL TEXT)
// =========================================================================
// Note: JSON-LD schema (lines ~60-280) and <meta> tags in <head> remain 100% INTACT in the background!
// Only upfront visible UI text is softened until leadership greenlight:

// A. Hero Trust Badge:
html = html.replace(
  '<span style="color: #F8D98C; font-weight: 700;">✦ Black-Founded &amp; Black-Led</span>',
  '<span style="color: #F8D98C; font-weight: 700;">✦ Grassroots Sanctuary &amp; Somatic Care</span>'
);

// B. Trust Ribbon:
html = html.replace(
  '<span>Black-Founded &amp; Black-Led</span>',
  '<span>Community-Grounded Healing</span>'
);

// C. Mission Pill:
html = html.replace(
  '✦ Black-Founded &amp; Black-Led 501(c)(3) Public Charity • EIN: 39-3757168',
  '✦ Official 501(c)(3) Public Charity • EIN: 39-3757168'
);

// D. Fiduciary Checkmark:
html = html.replace(
  '<span style="color: #C2DEC9;">✓ Black-Founded &amp; Black-Led</span>',
  '<span style="color: #C2DEC9;">✓ IRS 501(c)(3) Public Charity</span>'
);

// E. Fiduciary Card 1 Title & Description:
html = html.replace(
  '<div class="fiduciary-value">Black-Led 501(c)(3) Charity</div>',
  '<div class="fiduciary-value">501(c)(3) Public Charity</div>'
);
html = html.replace(
  '100% Black-founded and Black-led public charity affirmed under Internal Revenue Code § 501(c)(3). Contributions are fully tax-deductible to the extent allowed by law under IRC § 170(b)(1)(A)(vi). Purpose-built for donors, grantmakers, and community members seeking verified Black-led wellness spaces.',
  'Affirmed tax-exempt public charity under Internal Revenue Code § 501(c)(3). Contributions are fully tax-deductible to the extent allowed by law under IRC § 170(b)(1)(A)(vi). Purpose-built for community wellness, mindful open mics, somatic health equity, and transparent grassroots stewardship.'
);
html = html.replace(
  '<span class="fiduciary-badge-pill">✦ Black-Founded &amp; Led</span>',
  '<span class="fiduciary-badge-pill">✦ IRS Tax-Exempt Status</span>'
);

// F. Due Diligence Card:
html = html.replace(
  'seeking a verified Black-founded &amp; Black-led 501(c)(3) public charity partner?',
  'seeking a verified California 501(c)(3) public charity partner?'
);

// G. Footer Leadership pill & bottom text:
html = html.replace(
  '✦ Black-Founded &amp; Black-Led\n          </div>',
  '✦ Community Sanctuary Leadership\n          </div>'
);
html = html.replace(
  'Inner Sanctuary Wellness Foundation is a Black-Founded &amp; Black-Led 501(c)(3) public charity (Federal EIN: 39-3757168).',
  'Inner Sanctuary Wellness Foundation is an official California 501(c)(3) public charity (Federal EIN: 39-3757168).'
);

// Cache-bust assets to v5.6
html = html.replace(/styles\.css\?v=[0-9.]+/g, 'styles.css?v=5.6');
html = html.replace(/script\.js\?v=[0-9.]+/g, 'script.js?v=5.6');

fs.writeFileSync(indexFile, html, 'utf8');
console.log('index.html updated successfully!');

// =========================================================================
// 5. UPDATE SCRIPT.JS WITH OPENDISCOVERYOSWINDOW
// =========================================================================
if (!js.includes('openDiscoveryOsWindow')) {
  const windowFunctionCode = `
  // ------------------------------------------------------------------------
  // SANCTUARY DISCOVERY OS POPUP WINDOW HANDLER
  // ------------------------------------------------------------------------
  window.openDiscoveryOsWindow = function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const w = Math.min(1280, window.screen.availWidth - 40);
    const h = Math.min(900, window.screen.availHeight - 60);
    const left = Math.max(0, Math.floor((window.screen.availWidth - w) / 2));
    const top = Math.max(0, Math.floor((window.screen.availHeight - h) / 2));
    const features = \`width=\${w},height=\${h},left=\${left},top=\${top},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no\`;
    const popWin = window.open('sanctuary-discovery-os.html', 'SanctuaryDiscoveryOS', features);
    if (popWin && !popWin.closed) {
      popWin.focus();
    } else {
      window.location.href = 'sanctuary-discovery-os.html';
    }
  };
`;
  js += '\n' + windowFunctionCode;
  fs.writeFileSync(scriptFile, js, 'utf8');
  console.log('script.js updated with openDiscoveryOsWindow!');
} else {
  console.log('openDiscoveryOsWindow already present in script.js');
}
