const fs = require('fs');
const path = require('path');

const repoDir = 'C:\\Users\\danie\\OneDrive\\Documents\\GitHub\\inner-sanctuary';
const stylesPath = path.join(repoDir, 'styles.css');
const indexPath = path.join(repoDir, 'index.html');
const scriptPath = path.join(repoDir, 'script.js');
const swPath = path.join(repoDir, 'sw.js');

console.log('=== FIXING MOBILE OVERFLOW & ZEFFY EMBED (CRLF SAFE) ===');

function normalize(str) {
  return str.replace(/\r\n/g, '\n');
}

// 1. UPDATE styles.css
let css = normalize(fs.readFileSync(stylesPath, 'utf8'));

// Target 1: Base html & body
const targetBody = `body {
  background-color: transparent;
  color: var(--earth-charcoal);
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  line-height: 1.75;
  overflow-x: hidden;
  position: relative;
}`;

const replBody = `html {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

body {
  background-color: transparent;
  color: var(--earth-charcoal);
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  line-height: 1.75;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  position: relative;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}

*, *::before, *::after {
  box-sizing: border-box;
}`;

if (css.includes(targetBody)) {
  css = css.replace(targetBody, replBody);
  console.log('✅ Updated base html/body rules in styles.css');
} else {
  console.warn('⚠️ targetBody not found in styles.css');
}

// Target 2: Line 6133 @media (max-width: 768px) html, body
const targetMediaRoot = `@media (max-width: 768px) {
  html, body {
    width: 100% !important;
    max-width: 100vw !important;
    overflow-x: clip !important;
  }`;

const replMediaRoot = `@media (max-width: 768px) {
  html, body {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
    position: relative !important;
  }

  .realistic-sky-bg {
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    height: 100% !important;
  }`;

if (css.includes(targetMediaRoot)) {
  css = css.replace(targetMediaRoot, replMediaRoot);
  console.log('✅ Updated @media 768px root overflow & realistic-sky-bg in styles.css');
} else {
  console.warn('⚠️ targetMediaRoot not found in styles.css');
}

// Target 3: Remove negative margins from .dollar-fiduciary-bottom-strip
const targetFiduciaryDesktop = `.dollar-fiduciary-bottom-strip {
  margin-top: 32px;
  padding: 18px 28px;
  background: rgba(10, 24, 16, 0.75);
  border-top: 1.5px solid rgba(197, 154, 63, 0.35);
  border-radius: 0 0 24px 24px;
  margin-left: -38px;
  margin-right: -38px;
  margin-bottom: -44px;`;

const replFiduciaryDesktop = `.dollar-fiduciary-bottom-strip {
  margin-top: 24px;
  padding: 18px 20px;
  background: rgba(10, 24, 16, 0.75);
  border-top: 1.5px solid rgba(197, 154, 63, 0.35);
  border-radius: 16px;
  margin-left: 0;
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
  box-sizing: border-box;`;

if (css.includes(targetFiduciaryDesktop)) {
  css = css.replace(targetFiduciaryDesktop, replFiduciaryDesktop);
  console.log('✅ Removed negative margins from .dollar-fiduciary-bottom-strip desktop in styles.css');
} else {
  console.warn('⚠️ targetFiduciaryDesktop not found in styles.css');
}

// Target 4: Media 980px negative margins
const targetFiduciary980 = `@media (max-width: 980px) {
  .dollar-fiduciary-bottom-strip {
    margin-left: -20px;
    margin-right: -20px;
    margin-bottom: -30px;
    padding: 16px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}`;

const replFiduciary980 = `@media (max-width: 980px) {
  .dollar-fiduciary-bottom-strip {
    margin-left: 0 !important;
    margin-right: 0 !important;
    margin-bottom: 0 !important;
    padding: 16px 14px !important;
    border-radius: 12px !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 10px !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
}`;

if (css.includes(targetFiduciary980)) {
  css = css.replace(targetFiduciary980, replFiduciary980);
  console.log('✅ Removed negative margins from .dollar-fiduciary-bottom-strip 980px in styles.css');
} else {
  console.warn('⚠️ targetFiduciary980 not found in styles.css');
}

// Target 5: Bulletproof Zeffy iframe responsive sizing (WebKit 1px width fix)
const targetZeffyFrame = `  .zeffy-inline-frame-wrap {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    margin: 0 auto !important;
    border-radius: 10px !important;
  }
  #zeffy-inline-iframe {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }`;

const replZeffyFrame = `  .zeffy-inline-frame-wrap {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    margin: 0 auto !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    position: relative !important;
    box-sizing: border-box !important;
    -webkit-overflow-scrolling: touch !important;
  }
  #zeffy-inline-iframe {
    width: 1px !important;
    min-width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    border: 0 !important;
    display: block !important;
  }
  body.viewing-donation #floating-seed-pill {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }`;

if (css.includes(targetZeffyFrame)) {
  css = css.replace(targetZeffyFrame, replZeffyFrame);
  console.log('✅ Added WebKit 1px iframe fix and donation viewing pill hide in styles.css');
} else {
  console.warn('⚠️ targetZeffyFrame not found in styles.css');
}

// Target 6: Line 6540 zeffy-inline-frame-wrap in 768px
const targetZeffy768 = `  .zeffy-inline-frame-wrap {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }

  #zeffy-inline-iframe {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }`;

const replZeffy768 = `  .zeffy-inline-frame-wrap {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
    position: relative !important;
    -webkit-overflow-scrolling: touch !important;
  }

  #zeffy-inline-iframe {
    width: 1px !important;
    min-width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    border: 0 !important;
    display: block !important;
  }`;

if (css.includes(targetZeffy768)) {
  css = css.replace(targetZeffy768, replZeffy768);
  console.log('✅ Updated line 6540 Zeffy iframe rules in styles.css');
} else {
  console.warn('⚠️ targetZeffy768 not found in styles.css');
}

fs.writeFileSync(stylesPath, css, 'utf8');
console.log('💾 Saved updated styles.css');


// 2. UPDATE index.html
let html = normalize(fs.readFileSync(indexPath, 'utf8'));

// Update version tags for cache busting
html = html.replace('styles.css?v=5.4', 'styles.css?v=5.5');
html = html.replace('script.js?v=5.4', 'script.js?v=5.5');

// Update section #circle-growth to enforce zero horizontal overflow
const targetSec = `<section id="circle-growth" data-section="donate" class="section-padding reveal-on-scroll" style="background: rgba(240, 236, 225, 0.90); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-bottom: 1px solid rgba(197, 154, 63, 0.25);">`;
const replSec = `<section id="circle-growth" data-section="donate" class="section-padding reveal-on-scroll" style="background: rgba(240, 236, 225, 0.90); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-bottom: 1px solid rgba(197, 154, 63, 0.25); overflow-x: hidden; max-width: 100%; box-sizing: border-box;">`;

if (html.includes(targetSec)) {
  html = html.replace(targetSec, replSec);
  console.log('✅ Added overflow-x: hidden to #circle-growth in index.html');
}

// Update #dollar-campaign-anchor
const targetAnchor = `<div id="dollar-campaign-anchor" class="dollar-campaign-wrapper">`;
const replAnchor = `<div id="dollar-campaign-anchor" class="dollar-campaign-wrapper" style="overflow: hidden; max-width: 100%; box-sizing: border-box;">`;

if (html.includes(targetAnchor)) {
  html = html.replace(targetAnchor, replAnchor);
  console.log('✅ Added overflow: hidden to #dollar-campaign-anchor in index.html');
}

// Update #zeffy-inline-iframe inline style
const targetIframeInline = `style="border: 0; width: 100%; height: 540px; min-height: 520px; background: #F6F2E9; display: block;"`;
const replIframeInline = `style="border: 0; width: 1px; min-width: 100%; max-width: 100%; height: 540px; min-height: 520px; background: #F6F2E9; display: block; box-sizing: border-box;"`;

if (html.includes(targetIframeInline)) {
  html = html.replace(targetIframeInline, replIframeInline);
  console.log('✅ Added width: 1px; min-width: 100% inline style to #zeffy-inline-iframe in index.html');
}

// Update #zeffy-modal-iframe
const targetModalIframe = `src="https://www.zeffy.com/embed/donation-form/donate-to-make-a-difference-inner-sanctuary-wellness-foundation"
          style="border:0; width:100%; height:100%; background:#F6F2E9;"`;
const replModalIframe = `src="https://www.zeffy.com/embed/donation-form/donate-to-make-a-difference-inner-sanctuary-wellness-foundation"
          style="border:0; width:1px; min-width:100%; max-width:100%; height:100%; background:#F6F2E9; display:block; box-sizing:border-box;"`;

if (html.includes(targetModalIframe)) {
  html = html.replace(targetModalIframe, replModalIframe);
  console.log('✅ Added width: 1px; min-width: 100% to #zeffy-modal-iframe in index.html');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('💾 Saved updated index.html (v5.5)');


// 3. UPDATE script.js
let js = normalize(fs.readFileSync(scriptPath, 'utf8'));

// Update floating seed pill scroll handler to completely hide when anywhere near #circle-growth
const targetJsScroll = `      const circleGrowth = document.getElementById('circle-growth');
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
      }`;

const replJsScroll = `      const circleGrowth = document.getElementById('circle-growth');
      let isOverDonation = false;
      if (circleGrowth) {
        const rect = circleGrowth.getBoundingClientRect();
        // Generous buffer so floating pill never covers Zeffy form or payment badges
        if (rect.top < window.innerHeight + 100 && rect.bottom > -100) {
          isOverDonation = true;
        }
      }
      if (isOverDonation) {
        document.body.classList.add('viewing-donation');
        floatingSeedPill.classList.remove('is-visible');
      } else {
        document.body.classList.remove('viewing-donation');
        if (window.scrollY > 340) {
          floatingSeedPill.classList.add('is-visible');
        } else {
          floatingSeedPill.classList.remove('is-visible');
        }
      }`;

if (js.includes(targetJsScroll)) {
  js = js.replace(targetJsScroll, replJsScroll);
  console.log('✅ Updated floating seed pill proximity hiding logic in script.js');
} else {
  console.warn('⚠️ targetJsScroll not found in script.js');
}

fs.writeFileSync(scriptPath, js, 'utf8');
console.log('💾 Saved updated script.js');


// 4. UPDATE sw.js
let sw = normalize(fs.readFileSync(swPath, 'utf8'));
sw = sw.replace(/inner-sanctuary-cache-v1[0-9]/g, 'inner-sanctuary-cache-v17');
fs.writeFileSync(swPath, sw, 'utf8');
console.log('💾 Saved updated sw.js (cache-v17)');

console.log('=== ALL MOBILE OVERFLOW & ZEFFY FIXES COMPLETE ===');
