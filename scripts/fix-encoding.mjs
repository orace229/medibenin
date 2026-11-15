// fix-encoding.mjs - Fix Latin-1/Windows-1252 double-encoded UTF-8 corruption
// Run: node scripts/fix-encoding.mjs

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const SKIP = ['node_modules', 'dist', '.git', 'scripts'];
const EXTS = new Set(['.ts', '.tsx', '.html', '.md', '.mjs', '.json']);

// Latin-1 / Windows-1252 decode table for bytes 0x80-0xFF
// We detect corruption by checking for the UTF-8 encoding of common Latin-1 sequences
// that result from reading UTF-8 bytes as Latin-1.
// e.g. UTF-8 "é" = bytes C3 A9 → read as Latin-1 → "Ã©"
// So if the file (now UTF-8) contains "Ã©", it was double-encoded.

function decodeLatin1(buf) {
  // iconv-lite not available; use manual table
  // Windows-1252 to Unicode for 0x80-0x9F (rest is identical to Latin-1)
  const W1252 = {
    0x80: 0x20AC, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E, 0x85: 0x2026,
    0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02C6, 0x89: 0x2030, 0x8A: 0x0160,
    0x8B: 0x2039, 0x8C: 0x0152, 0x8E: 0x017D, 0x91: 0x2018, 0x92: 0x2019,
    0x93: 0x201C, 0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
    0x98: 0x02DC, 0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A, 0x9C: 0x0153,
    0x9E: 0x017E, 0x9F: 0x0178,
  };
  let result = '';
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (b < 0x80) {
      result += String.fromCharCode(b);
    } else if (W1252[b] !== undefined) {
      result += String.fromCharCode(W1252[b]);
    } else {
      result += String.fromCharCode(b);
    }
  }
  return result;
}

function isCorrupted(str) {
  // Check for telltale double-encoding patterns
  return /\xC3[\x80-\xBF]|â€["\u2018\u2019\u201C\u201D\u2013\u2014]|Â[·°§]/.test(str)
    || str.includes('\xC3\xA9')   // Ã©
    || str.includes('\xC3\xA0')   // Ã 
    || str.includes('\xC3\xA8')   // Ã¨
    || str.includes('\xE2\x80')   // â€
    || str.includes('Ã©')
    || str.includes('Ã ')
    || str.includes('Ã¨')
    || str.includes('â€')
    || str.includes('Â·')
    || str.includes('Â°');
}

function walkFiles(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.includes(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walkFiles(full, results);
    else if (EXTS.has(extname(entry))) results.push(full);
  }
  return results;
}

let fixed = 0;
let clean = 0;

for (const filePath of walkFiles(ROOT)) {
  let buf = readFileSync(filePath);
  
  // Strip BOM
  if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    buf = buf.slice(3);
  }
  
  let str = buf.toString('utf8');
  let passes = 0;
  
  while (isCorrupted(str) && passes < 6) {
    // The file was originally Latin-1 / Windows-1252 encoded.
    // Re-decode it as Latin-1 to get the real Unicode string.
    str = decodeLatin1(buf);
    // Now re-encode to UTF-8 for next iteration check
    buf = Buffer.from(str, 'utf8');
    passes++;
  }
  
  if (passes > 0) {
    writeFileSync(filePath, buf);
    console.log(`Fixed (${passes}x): ${filePath.replace(ROOT, '')}`);
    fixed++;
  } else {
    clean++;
  }
}

console.log(`\nDone: ${fixed} fixed, ${clean} already clean`);
