import { readFileSync, writeFileSync } from 'fs';

const filePath = 'c:/Users/Uriel/PROJETS_GITHUB/medisense/src/components/LandingPage.tsx';

const buf = readFileSync(filePath);
const hasBOM = buf[0] === 0xFF && buf[1] === 0xFE;
console.log('BOM detected:', hasBOM, '| Buffer size:', buf.length);

let src = buf.toString(hasBOM ? 'utf16le' : 'utf8');
// Remove BOM char
if (src.charCodeAt(0) === 0xFEFF) src = src.slice(1);

// Normalize CRLF -> LF
src = src.replace(/\r\n/g, '\n');

// Write as UTF-8 (no BOM)
writeFileSync(filePath, src, 'utf8');
console.log('✓ Converted to UTF-8. Chars:', src.length);

// Quick sanity check
const verify = readFileSync(filePath, 'utf8');
console.log('First 80 chars:', JSON.stringify(verify.slice(0, 80)));
