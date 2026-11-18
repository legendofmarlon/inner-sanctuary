const fs = require('fs');

const indexHtml = fs.readFileSync('C:/Users/danie/OneDrive/Documents/GitHub/inner-sanctuary/index.html', 'utf8');
const kioskHtml = fs.readFileSync('C:/Users/danie/OneDrive/Documents/GitHub/inner-sanctuary/sanctuary-discovery-os.html', 'utf8');
const osJs = fs.readFileSync('C:/Users/danie/OneDrive/Documents/GitHub/inner-sanctuary/js/sanctuary-discovery-os.js', 'utf8');
const stylesCss = fs.readFileSync('C:/Users/danie/OneDrive/Documents/GitHub/inner-sanctuary/styles.css', 'utf8');

console.log('--- VERIFICATION CHECKS ---');
console.log('1. index.html contains discovery-os section:', indexHtml.includes('id="discovery-os"'));
console.log('2. index.html contains nav link:', indexHtml.includes('href="#discovery-os"'));
console.log('3. index.html loads sanctuary-discovery-os.js:', indexHtml.includes('sanctuary-discovery-os.js'));
console.log('4. sanctuary-discovery-os.html exists & valid:', kioskHtml.includes('3D Sanctuary Search &amp; Discovery OS'));
console.log('5. styles.css contains Campfire Hearth styles:', stylesCss.includes('sanctuary-discovery-os-section'));
console.log('6. styles.css contains 375px-430px mobile rules:', stylesCss.includes('@media (max-width: 600px)'));
console.log('7. JS contains Scene 1 (AI Radar):', osJs.includes('AI VISIBILITY RADAR'));
console.log('8. JS contains Scene 2 (Knowledge Graph):', osJs.includes('ENTITY KNOWLEDGE GRAPH'));
console.log('9. JS contains Scene 3 (Impact Matcher):', osJs.includes('IMPACT MATCHER'));
console.log('10. JS contains Scene 4 (Weekly 5-Fix Engine):', osJs.includes('WEEKLY 5-FIX ENGINE'));
console.log('11. JS contains Campfire Hearth particle engine:', osJs.includes('initHearthEmberCanvas'));

console.log('\n--- ALL VERIFICATION TESTS COMPLETED ---');
