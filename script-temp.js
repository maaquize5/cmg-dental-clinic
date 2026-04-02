const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const p1 = html.indexOf('<section id="hero"');
const p2 = html.indexOf('</section>', p1);
console.log(html.substring(p1, p2 + 10));
