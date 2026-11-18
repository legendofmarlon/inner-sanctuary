const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\danie\\OneDrive\\Documents\\GitHub\\inner-sanctuary';
const indexFile = path.join(rootDir, 'index.html');
const swFile = path.join(rootDir, 'sw.js');

let html = fs.readFileSync(indexFile, 'utf8');

// 1. Add Fiduciary 1-Pager link in dollar-fiduciary-bottom-strip
const stripTarget = '<div style="display: flex; align-items: center; gap: 8px;">\n            <span style="color: #CFE3D6; font-size: 0.82rem;">Foundation Grantmaker or CRA Partner?</span>';
const stripReplacement = `<div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <a href="reports/inner-sanctuary-fiduciary-one-pager.html" target="_blank" rel="noopener noreferrer" class="btn btn-gold" style="font-size: 0.76rem; padding: 6px 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; font-weight: 700; text-decoration: none; box-shadow: 0 2px 10px rgba(197, 154, 63, 0.3);">
              <span>📄 View 1-Page Fiduciary Dossier</span> <span>↗</span>
            </a>
            <span style="color: #CFE3D6; font-size: 0.82rem;">Foundation Grantmaker or CRA Partner?</span>`;

if (html.includes(stripTarget)) {
  html = html.replace(stripTarget, stripReplacement);
  console.log('Added Fiduciary 1-Pager link to dollar strip!');
}

// 2. Add Fiduciary 1-Pager button in funder-action-buttons
const funderTarget = '<div class="funder-action-buttons" style="display: flex; flex-direction: column; gap: 10px;">';
const funderReplacement = `<div class="funder-action-buttons" style="display: flex; flex-direction: column; gap: 10px;">
              <!-- 1-Page Fiduciary Dossier Instant Download -->
              <a href="reports/inner-sanctuary-fiduciary-one-pager.html" target="_blank" rel="noopener noreferrer" class="btn btn-gold" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 18px; font-size: 0.82rem; font-weight: 700; text-decoration: none; box-shadow: 0 4px 18px rgba(197, 154, 63, 0.35);">
                <span>📄 Instant 1-Page Fiduciary Dossier (Printable / PDF)</span> <span>↗</span>
              </a>`;

if (html.includes(funderTarget)) {
  html = html.replace(funderTarget, funderReplacement);
  console.log('Added Fiduciary Dossier button to Institutional Due Diligence section!');
}

// Bump asset query strings to v5.8
html = html.replace(/styles\.css\?v=[0-9.]+/g, 'styles.css?v=5.8');
html = html.replace(/script\.js\?v=[0-9.]+/g, 'script.js?v=5.8');

fs.writeFileSync(indexFile, html, 'utf8');

// Update sw.js to v19
let sw = fs.readFileSync(swFile, 'utf8');
sw = sw.replace(/const CACHE_NAME = 'inner-sanctuary-cache-v[0-9]+';/, "const CACHE_NAME = 'inner-sanctuary-cache-v19';");
fs.writeFileSync(swFile, sw, 'utf8');
console.log('sw.js bumped to cache-v19');
