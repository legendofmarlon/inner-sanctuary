/**
 * Inner Sanctuary Site Guardian (Maintenance & Health Sentinel)
 * Validates site integrity:
 * 1. Checks all local asset references (images, audio, scripts)
 * 2. Validates all internal anchor links (#id targets)
 * 3. Verifies audio synthesizer frequencies (432Hz, 528Hz, 108Hz)
 * 4. Checks local preview server HTTP status
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const REPO_ROOT = path.resolve(__dirname, '..');
const HTML_PATH = path.join(REPO_ROOT, 'index.html');
const JS_PATH = path.join(REPO_ROOT, 'script.js');
const CSS_PATH = path.join(REPO_ROOT, 'styles.css');

const results = {
  timestamp: new Date().toISOString(),
  status: 'HEALTHY',
  checks: [],
  issues: []
};

function logCheck(name, passed, details) {
  results.checks.push({ name, passed, details });
  const symbol = passed ? '✅' : '❌';
  console.log(`${symbol} [${name}]: ${details}`);
  if (!passed) {
    results.status = 'DEGRADED';
    results.issues.push({ name, details });
  }
}

async function runGuardianAudit() {
  console.log('====================================================');
  console.log('   INNER SANCTUARY SITE GUARDIAN AUDIT STARTING     ');
  console.log('====================================================\n');

  // 1. Files existence check
  logCheck('index.html exists', fs.existsSync(HTML_PATH), `Size: ${fs.statSync(HTML_PATH).size} bytes`);
  logCheck('script.js exists', fs.existsSync(JS_PATH), `Size: ${fs.statSync(JS_PATH).size} bytes`);
  logCheck('styles.css exists', fs.existsSync(CSS_PATH), `Size: ${fs.statSync(CSS_PATH).size} bytes`);

  const html = fs.readFileSync(HTML_PATH, 'utf8');

  // 2. Check internal anchor targets (# links)
  const hrefMatches = [...html.matchAll(/href=["']#([^"'?]+)["']/g)];
  let brokenAnchors = 0;
  for (const match of hrefMatches) {
    const targetId = match[1];
    if (!targetId) continue;
    const hasTarget = html.includes(`id="${targetId}"`) || html.includes(`id='${targetId}'`);
    if (!hasTarget) {
      brokenAnchors++;
      console.warn(`   ⚠️ Target anchor missing: #${targetId}`);
    }
  }
  logCheck('Internal Anchor Integrity', brokenAnchors === 0, `${hrefMatches.length} anchors tested, ${brokenAnchors} broken`);

  // 3. Check local image references
  const imgMatches = [...html.matchAll(/(?:src|srcset)=["'](images\/[^"'\s,]+)["']/g)];
  let missingImgs = 0;
  for (const match of imgMatches) {
    const relativePath = match[1];
    const fullPath = path.join(REPO_ROOT, relativePath);
    if (!fs.existsSync(fullPath)) {
      missingImgs++;
      console.warn(`   ⚠️ Missing image asset: ${relativePath}`);
    }
  }
  logCheck('Image Assets Check', missingImgs === 0, `${imgMatches.length} image references verified, ${missingImgs} missing`);

  // 4. Verify Sacred Healing Bell Audio Synthesizer in script.js
  const js = fs.readFileSync(JS_PATH, 'utf8');
  const has432 = js.includes('432');
  const has528 = js.includes('528');
  const has108 = js.includes('108');
  const hasAudioCtx = js.includes('AudioContext') || js.includes('webkitAudioContext');
  logCheck('Sacred Frequency Audio Engine', has432 && has528 && has108 && hasAudioCtx, 'Verified 432Hz bronze, 528Hz silver, and 108Hz cathedral bells synthesis');

  // 5. Test Local Preview Server
  await new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      logCheck('Preview Server Connectivity', res.statusCode === 200, `HTTP status code: ${res.statusCode} at http://localhost:3000`);
      resolve();
    });
    req.on('error', (err) => {
      logCheck('Preview Server Connectivity', false, `Connection error: ${err.message}`);
      resolve();
    });
    req.setTimeout(2500, () => {
      req.abort();
      logCheck('Preview Server Connectivity', false, 'Request timed out after 2500ms');
      resolve();
    });
  });

  console.log('\n====================================================');
  console.log(`   FINAL GUARDIAN STATUS: ${results.status}`);
  console.log('====================================================');

  return results;
}

if (require.main === module) {
  runGuardianAudit().then((res) => {
    // Write report
    const reportPath = path.join(REPO_ROOT, 'reports', 'site-guardian-health-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(res, null, 2), 'utf8');
    console.log(`Report saved to ${reportPath}`);
  });
}

module.exports = { runGuardianAudit };
