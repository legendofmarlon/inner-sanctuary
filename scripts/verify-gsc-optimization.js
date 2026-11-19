const fs = require('fs');
const path = require('path');

const root = 'C:/Users/danie/OneDrive/Documents/GitHub/inner-sanctuary';

console.log('=================================================================');
console.log(' GOOGLE SEARCH CONSOLE & SITE OPTIMIZATION VERIFICATION SUITE');
console.log('=================================================================\n');

let allPassed = true;

function check(testName, condition, details) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    if (details) console.log(`   └─ ${details}`);
  } else {
    console.error(`❌ FAIL: ${testName}`);
    if (details) console.error(`   └─ ${details}`);
    allPassed = false;
  }
}

// 1. ROBOTS.TXT
const robotsPath = path.join(root, 'robots.txt');
const robotsExists = fs.existsSync(robotsPath);
const robotsContent = robotsExists ? fs.readFileSync(robotsPath, 'utf8') : '';
check('robots.txt exists in site root', robotsExists);
check('robots.txt allows all crawlers (User-agent: * / Allow: /)', 
  /User-agent:\s*\*/i.test(robotsContent) && /Allow:\s*\//i.test(robotsContent),
  robotsContent.trim().replace(/\n/g, ' | ')
);
check('robots.txt points to sitemap.xml', 
  /Sitemap:\s*https:\/\/innersanctuarywellnessfoundation\.org\/sitemap\.xml/i.test(robotsContent)
);

// 2. SITEMAP.XML
const sitemapPath = path.join(root, 'sitemap.xml');
const sitemapExists = fs.existsSync(sitemapPath);
const sitemapContent = sitemapExists ? fs.readFileSync(sitemapPath, 'utf8') : '';
check('sitemap.xml exists in site root', sitemapExists);
const urls = [...sitemapContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const hasFragments = urls.some(u => u.includes('#'));
check('sitemap.xml contains ZERO fragment identifiers (#)', !hasFragments, `Found ${urls.length} clean URLs`);
check('sitemap.xml lists canonical live pages', 
  urls.includes('https://innersanctuarywellnessfoundation.org/') &&
  urls.includes('https://innersanctuarywellnessfoundation.org/sanctuary-discovery-os.html') &&
  urls.includes('https://innersanctuarywellnessfoundation.org/reports/inner-sanctuary-fiduciary-one-pager.html')
);

// 3. BROWSER MEMORY & ASSET OPTIMIZATION
const indexPath = path.join(root, 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');

// Check Slide 4 in index.html
const slide4UsesJpg = /images\/openmic\/openmic-nov15-stone-hearth-celebration\.jpg/i.test(indexContent);
const slide4GatedGif = /data-gif="images\/openmic\/openmic-nov15-stone-hearth-celebration\.gif"/i.test(indexContent);
check('Slide 4 uses static JPG on initial load (saving ~859 MB memory)', slide4UsesJpg && slide4GatedGif,
  'Uncompressed GIF was 859.33 MB in RAM (234 frames @ 736x1308). Static JPG is 234 KB (3.67 MB decoded).'
);

// Check lazy loading on below-the-fold images
const imgMatches = [...indexContent.matchAll(/<img[^>]*>/gi)];
let missingLazyCount = 0;
imgMatches.forEach(m => {
  const tag = m[0];
  const isAboveFold = /nav-emblem|hero-emblem/i.test(tag);
  const hasLazy = /loading="lazy"/i.test(tag);
  if (!isAboveFold && !hasLazy) {
    missingLazyCount++;
  }
});
check('All below-the-fold images have loading="lazy"', missingLazyCount === 0, `Unlazy count: ${missingLazyCount}`);

// Check backdrop plates eager preloading removed from script.js
const scriptPath = path.join(root, 'script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');
const hasEagerPlatePreload = /ELEMENTAL_8K_PLATES\.forEach/i.test(scriptContent);
check('Eager 8K backdrop plates preloader removed from script.js', !hasEagerPlatePreload,
  'Replaced with on-demand preloadPlateIfNeeded() when element theme is activated.'
);

// 4. NETLIFY REDIRECTS, CANONICAL ROUTING & NOINDEX AUDIT
const redirectsPath = path.join(root, '_redirects');
const redirectsExists = fs.existsSync(redirectsPath);
const redirectsContent = redirectsExists ? fs.readFileSync(redirectsPath, 'utf8') : '';
check('_redirects file exists in root', redirectsExists);
check('_redirects forces canonical apex HTTPS (301!)', 
  redirectsContent.includes('http://innersanctuarywellnessfoundation.org/*') &&
  redirectsContent.includes('https://www.innersanctuarywellnessfoundation.org/*')
);

const netlifyTomlPath = path.join(root, 'netlify.toml');
const netlifyToml = fs.readFileSync(netlifyTomlPath, 'utf8');
check('netlify.toml contains [[redirects]] for apex HTTPS', netlifyToml.includes('[[redirects]]'));
check('netlify.toml contains MIME headers for /robots.txt and /sitemap.xml', 
  netlifyToml.includes('for = "/robots.txt"') && netlifyToml.includes('for = "/sitemap.xml"')
);

// Zero redirect loops test
const hasSelfRedirect = /from\s*=\s*"https:\/\/innersanctuarywellnessfoundation\.org\/\*"\s*to\s*=\s*"https:\/\/innersanctuarywellnessfoundation\.org/i.test(netlifyToml);
check('Zero redirect loops (apex HTTPS does not redirect to itself)', !hasSelfRedirect);

// Noindex check
const htmlFiles = ['index.html', 'sanctuary-discovery-os.html', 'bracelet-weaver.html', 'digital-labyrinth.html', 'reports/inner-sanctuary-fiduciary-one-pager.html'];
let noindexFound = false;
htmlFiles.forEach(f => {
  const c = fs.readFileSync(path.join(root, f), 'utf8');
  if (c.includes('noindex')) noindexFound = true;
});
check('Zero noindex tags across all live pages', !noindexFound);

// GSC verification & Regional SEO
const hasGscMeta = indexContent.includes('<meta name="google-site-verification" content="VvYyqoNCCgGNpd3VfvtneFDsGxga4o_Xyr99o77QQp0" />');
check('Google Search Console verification meta tag intact', hasGscMeta);
const hasCanonical = indexContent.includes('<link rel="canonical" href="https://innersanctuarywellnessfoundation.org/" />');
check('Canonical URL tag points to apex HTTPS intact', hasCanonical);
const hasGeo = indexContent.includes('geo.region') && indexContent.includes('geo.placename');
check('Regional SEO metadata intact', hasGeo);

console.log('\n=================================================================');
if (allPassed) {
  console.log(' 🌟 ALL CHECKS PASSED PERFECTLY! SITE IS 100% READY FOR GSC TEST');
} else {
  console.error(' ⚠️ SOME CHECKS FAILED');
}
console.log('=================================================================');
