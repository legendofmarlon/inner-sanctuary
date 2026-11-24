const fs = require('fs');
const path = require('path');

const root = 'C:/Users/danie/OneDrive/Documents/GitHub/inner-sanctuary';

console.log('=================================================================');
console.log(' INNER SANCTUARY — IMMEDIATE LOAD & SEO INTEGRITY SUITE');
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

// 3. ZERO LAZY-LOADING DELAYS ON HOMEPAGE VISUALS
const indexPath = path.join(root, 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');
const imgLazyMatches = [...indexContent.matchAll(/<img[^>]*loading="lazy"[^>]*>/gi)];
check('Zero lazy-loading on homepage images (immediate first-visit load)', imgLazyMatches.length === 0,
  `All ${[...indexContent.matchAll(/<img[^>]*>/gi)].length} images load immediately with zero delay`
);

// 4. BACKGROUND AUDIO PRELOAD PREVENTION
const scriptPath = path.join(root, 'script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');
const audioPreloadNone = /audio\.preload\s*=\s*'none'/i.test(scriptContent);
const audioPreloadOnPlay = /playElement[\s\S]*?audio\.preload\s*=\s*'auto'/i.test(scriptContent);
check('Background audio preloading prevented until user clicks play', audioPreloadNone && audioPreloadOnPlay,
  'audio.preload = none on initialization; audio.preload = auto triggered only on playElement / crossfadeTo'
);

// 5. NETLIFY REDIRECTS & CANONICAL ROUTING (ZERO REDIRECT LOOPS)
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

// 6. ZERO NOINDEX CHECK
const htmlFiles = ['index.html', 'sanctuary-discovery-os.html', 'community-hub.html', 'bracelet-weaver.html', 'digital-labyrinth.html', 'reports/inner-sanctuary-fiduciary-one-pager.html'];
let noindexFound = false;
htmlFiles.forEach(f => {
  const c = fs.readFileSync(path.join(root, f), 'utf8');
  if (c.includes('noindex')) noindexFound = true;
});
check('Zero noindex tags across all live pages', !noindexFound);

// 7. GSC VERIFICATION & REGIONAL SEO
const hasGscMeta = indexContent.includes('<meta name="google-site-verification" content="VvYyqoNCCgGNpd3VfvtneFDsGxga4o_Xyr99o77QQp0" />');
check('Google Search Console verification meta tag intact', hasGscMeta);
const hasCanonical = indexContent.includes('<link rel="canonical" href="https://innersanctuarywellnessfoundation.org/" />');
check('Canonical URL tag points to apex HTTPS intact', hasCanonical);
const hasGeo = indexContent.includes('geo.region') && indexContent.includes('geo.placename');
check('Regional SEO metadata intact', hasGeo);

console.log('\n=================================================================');
if (allPassed) {
  console.log(' 🌟 ALL CHECKS PASSED! HOMEPAGE LOADS IMMEDIATELY WITH FULL SEO');
} else {
  console.error(' ⚠️ SOME CHECKS FAILED');
}
console.log('=================================================================');
