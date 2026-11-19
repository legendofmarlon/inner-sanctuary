const fs = require('fs');
const path = require('path');

const repoRoot = 'C:/Users/danie/OneDrive/Documents/GitHub/inner-sanctuary';
const html = fs.readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const imgRegex = /<img[^>]*>/gi;
let match;
let count = 0;
const results = [];

while ((match = imgRegex.exec(html)) !== null) {
  count++;
  const tag = match[0];
  const srcMatch = tag.match(/src="([^"]+)"/i);
  const src = srcMatch ? srcMatch[1] : 'no-src';
  const lazy = /loading="lazy"/i.test(tag);
  const asyncDecode = /decoding="async"/i.test(tag);
  
  let sizeKB = 0;
  const filePath = path.join(repoRoot, src.split('?')[0]);
  if (fs.existsSync(filePath)) {
    sizeKB = (fs.statSync(filePath).size / 1024).toFixed(1);
  }
  
  results.push({ count, src, sizeKB: Number(sizeKB), lazy, asyncDecode, tag: tag.substring(0, 100) });
}

console.log(`Found ${results.length} <img> tags:`);
results.forEach(r => {
  console.log(`#${r.count} [${r.sizeKB} KB] lazy=${r.lazy} async=${r.asyncDecode} -> ${r.src}`);
});
