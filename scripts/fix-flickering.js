const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\danie\\OneDrive\\Documents\\GitHub\\inner-sanctuary';
const cssFile = path.join(rootDir, 'styles.css');
const jsFile = path.join(rootDir, 'script.js');

let css = fs.readFileSync(cssFile, 'utf8');
let js = fs.readFileSync(jsFile, 'utf8');

// 1. Remove display: none !important from body.viewing-donation #floating-seed-pill
css = css.replace(
  `body.viewing-donation #floating-seed-pill {\n    display: none !important;\n    opacity: 0 !important;\n    visibility: hidden !important;\n    pointer-events: none !important;\n  }`,
  `body.viewing-donation #floating-seed-pill {\n    opacity: 0 !important;\n    visibility: hidden !important;\n    pointer-events: none !important;\n    transform: translateY(24px) scale(0.9) translateZ(0) !important;\n  }`
);

// 2. Add GPU acceleration to floating-seed-pill and hide lantern-aura on mobile
const antiFlickerCSS = `
/* Mobile Hardware Acceleration & Anti-Flicker Shield */
.floating-seed-pill,
.explorer-pill,
#pwaInstallBanner,
#sanctuary-nav {
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  will-change: transform, opacity;
}

@media (max-width: 768px), (pointer: coarse) {
  /* Suppress touch-tracking 460px radial glow on mobile to eliminate GPU paint thrashing */
  .lantern-aura {
    display: none !important;
  }
}
`;

css += '\n' + antiFlickerCSS;
fs.writeFileSync(cssFile, css, 'utf8');
console.log('styles.css updated with anti-flicker hardware acceleration!');

// 3. Update script.js with rAF debouncing
const oldScrollLogic = `  if (floatingSeedPill) {
    window.addEventListener('scroll', () => {
      const circleGrowth = document.getElementById('circle-growth');
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
      }
      if (pwaBanner && isOverDonation && pwaBanner.style.display !== 'none') {
        pwaBanner.classList.add('pwa-tuck-away');
      } else if (pwaBanner) {
        pwaBanner.classList.remove('pwa-tuck-away');
      }
    }, { passive: true });
  }`;

const newScrollLogic = `  if (floatingSeedPill) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const circleGrowth = document.getElementById('circle-growth');
          let isOverDonation = false;
          if (circleGrowth) {
            const rect = circleGrowth.getBoundingClientRect();
            if (rect.top < window.innerHeight + 80 && rect.bottom > -80) {
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
          }
          if (pwaBanner) {
            if (isOverDonation && pwaBanner.style.display !== 'none') {
              pwaBanner.classList.add('pwa-tuck-away');
            } else {
              pwaBanner.classList.remove('pwa-tuck-away');
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }`;

if (js.includes(oldScrollLogic)) {
  js = js.replace(oldScrollLogic, newScrollLogic);
  fs.writeFileSync(jsFile, js, 'utf8');
  console.log('script.js updated with rAF smooth scroll debouncing!');
} else {
  console.log('Warning: could not find exact scroll logic match in script.js');
}
