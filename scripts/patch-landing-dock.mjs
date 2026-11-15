import { readFileSync, writeFileSync } from 'fs';

// File is UTF-16 LE (BOM). Read with proper encoding.
const filePath = 'c:/Users/Uriel/PROJETS_GITHUB/medisense/src/components/LandingPage.tsx';

// Read as buffer, detect BOM
const buf = readFileSync(filePath);
const hasBOM = buf[0] === 0xFF && buf[1] === 0xFE;
console.log('BOM detected:', hasBOM);

let src = buf.toString(hasBOM ? 'utf16le' : 'utf8');
// Remove BOM char if present
if (src.charCodeAt(0) === 0xFEFF) src = src.slice(1);

// ── 1. Remove contextualCtaMap block + activeDock line ──────────────────────
const mapStartMarker = '  // Contextual Scroll-Following CTA Configuration per active section';
const activeDockMarker = '  const activeDock = contextualCtaMap[activeSection];';

const mapStart = src.indexOf(mapStartMarker);
const mapEnd = src.indexOf(activeDockMarker);

if (mapStart === -1) { console.error('ERROR: contextualCtaMap start not found'); process.exit(1); }
if (mapEnd === -1) { console.error('ERROR: activeDock line not found'); process.exit(1); }

const afterActiveDock = mapEnd + activeDockMarker.length;
// Also consume trailing newline
src = src.slice(0, mapStart) + src.slice(afterActiveDock);
console.log('✓ Removed contextualCtaMap + activeDock');

// ── 2. Fix navLinks type ────────────────────────────────────────────────────
if (src.includes('const navLinks: Array<{ id: SectionId; label: string }>')) {
  src = src.replace(
    'const navLinks: Array<{ id: SectionId; label: string }>',
    'const navLinks: Array<{ id: string; label: string }>'
  );
  console.log('✓ Fixed navLinks type');
}

// ── 3. Fix desktop nav className ───────────────────────────────────────────
{
  const idx = src.indexOf('activeSection === item.id');
  if (idx !== -1) {
    console.log('Found activeSection references, fixing...');
  }
}

// Use regex to fix both nav className occurrences
// Desktop nav pattern
src = src.replace(
  /className=\{`transition-colors whitespace-nowrap \$\{\s*activeSection === item\.id\s*\? 'text-\[#0F6B6B\] font-semibold'\s*: 'hover:text-\[#0F6B6B\] text-\[#475569\]'\s*\}`\}/g,
  "className=\"transition-colors whitespace-nowrap hover:text-[#0F6B6B] text-[#475569]\""
);

// Mobile drawer pattern
src = src.replace(
  /className=\{`px-3 py-2 rounded-xl text-xs font-semibold transition-colors \$\{\s*activeSection === item\.id\s*\? 'bg-\[#0B3B3C\] text-white'\s*: 'text-\[#334155\] hover:bg-\[#F8FAFC\]'\s*\}`\}/g,
  "className=\"px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-[#334155] hover:bg-[#F8FAFC]\""
);

const remaining = (src.match(/activeSection/g) || []).length;
console.log(`✓ Fixed nav classNames. Remaining activeSection refs: ${remaining}`);

// ── 4. Remove floating dock JSX block ─────────────────────────────────────
const dockCommentMarker = '      {/* =====================================================================\r\n       * SCROLL-FOLLOWING CONTEXTUAL CALL-TO-ACTION DOCK\r\n       * ===================================================================== */}';
const footerMarker = '      {/* Clean Institutional Footer */}';

let dockStart = src.indexOf(dockCommentMarker);
// Try without \r
if (dockStart === -1) {
  const alt = '      {/* =====================================================================\n       * SCROLL-FOLLOWING CONTEXTUAL CALL-TO-ACTION DOCK\n       * ===================================================================== */}';
  dockStart = src.indexOf(alt);
}
const footerStart = src.indexOf(footerMarker);

if (dockStart === -1) { console.error('ERROR: dock JSX comment not found'); process.exit(1); }
if (footerStart === -1) { console.error('ERROR: footer comment not found'); process.exit(1); }

src = src.slice(0, dockStart) + '\n' + src.slice(footerStart);
console.log('✓ Removed floating dock JSX block');

// ── 5. Remove useEffect from import if no longer used ────────────────────
if (!src.includes('useEffect(')) {
  src = src.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState } from 'react';"
  );
  console.log('✓ Removed useEffect from import');
}

// ── 6. Remove Sparkles from lucide import ─────────────────────────────────
if (!src.includes('Sparkles')) {
  console.log('ℹ Sparkles already removed');
} else {
  src = src.replace(/\s*Sparkles,\n/, '\n');
  console.log('✓ Removed Sparkles from import');
}

// ── Write back as UTF-16 LE with BOM ─────────────────────────────────────
const outBuf = Buffer.alloc((src.length + 1) * 2);
outBuf[0] = 0xFF; outBuf[1] = 0xFE; // BOM
for (let i = 0; i < src.length; i++) {
  const cp = src.charCodeAt(i);
  outBuf[2 + i * 2] = cp & 0xFF;
  outBuf[2 + i * 2 + 1] = (cp >> 8) & 0xFF;
}
writeFileSync(filePath, outBuf.slice(0, (src.length + 1) * 2));
console.log('✓ Written back as UTF-16 LE. Total chars:', src.length);

// Final check
console.log('\nFinal checks:');
['activeSection','showFloatingDock','SectionId','contextualCtaMap','activeDock','Sparkles','SCROLL-FOLLOWING'].forEach(r => {
  console.log(r + ':', src.includes(r) ? '⚠ STILL PRESENT' : 'NOT FOUND ✓');
});
