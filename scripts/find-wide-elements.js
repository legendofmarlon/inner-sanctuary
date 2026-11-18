const fs = require('fs');

const html = fs.readFileSync('C:\\Users\\danie\\OneDrive\\Documents\\GitHub\\inner-sanctuary\\index.html', 'utf8');

const regex = /style="[^"]*(?:min-width|width):\s*([0-9]{3,4})px[^"]*"/gi;
let match;
while ((match = regex.exec(html)) !== null) {
  const w = parseInt(match[1], 10);
  if (w > 320) {
    console.log(`Found wide inline style (${w}px):`, match[0].slice(0, 150));
  }
}
