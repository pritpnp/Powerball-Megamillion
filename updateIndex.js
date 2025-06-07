const fs = require('fs');

const data = JSON.parse(fs.readFileSync('lottery.json', 'utf-8'));
const html = fs.readFileSync('index.html', 'utf-8');

function replaceInHTML(html, label, obj) {
  return html.replace(
    new RegExp(`const ${label} = {[^}]+}`, 'm'),
    `const ${label} = ${JSON.stringify(obj, null, 2)}`
  );
}

let updated = html;
updated = replaceInHTML(updated, 'megaMillions', data.megaMillions);
updated = replaceInHTML(updated, 'powerball', data.powerball);

fs.writeFileSync('index.html', updated);
console.log("✅ index.html updated with latest lottery data.");
