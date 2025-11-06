// scripts/generate-favicon.js
// Decodifica assets/favicon.png.base64 a favicon.png en la raíz del proyecto
const fs = require('fs');
const path = require('path');

const base64Path = path.join(__dirname, '..', 'assets', 'favicon.png.base64');
const outPath = path.join(__dirname, '..', 'favicon.png');

if (!fs.existsSync(base64Path)) {
  console.error('No se encontró', base64Path);
  process.exit(1);
}

const b64 = fs.readFileSync(base64Path, 'utf8').trim();
const buf = Buffer.from(b64, 'base64');
fs.writeFileSync(outPath, buf);
console.log('favicon.png generado en', outPath);
