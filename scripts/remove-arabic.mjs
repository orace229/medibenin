// remove-arabic.mjs - Remove all Arabic (isAr) references from components
// Run: node scripts/remove-arabic.mjs

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const files = [
  'src/components/AuthPages.tsx',
  'src/components/ClinicianPortal.tsx',
  'src/components/EvidenceGovernance.tsx',
  'src/components/LandingPage.tsx',
  'src/components/PatientPortal.tsx',
  'src/components/PopulationPortals.tsx',
  'src/components/MediBeninUI.tsx',
  'src/lib/i18n.tsx',
  'src/App.tsx',
  'server.ts',
].map(f => join(ROOT, f.replace(/\//g, process.platform === 'win32' ? '\\' : '/')));

for (const filePath of files) {
  let src = readFileSync(filePath, 'utf8');
  const original = src;

  // 1. Remove: const isAr = locale === 'ar';
  src = src.replace(/\n?\s*const isAr = locale === ['"]ar['"];?\s*\n/g, '\n');

  // 2. Remove: const isAr = language === 'ar';
  src = src.replace(/\n?\s*const isAr = language === ['"]ar['"];?\s*\n/g, '\n');

  // 3. Simplify: isAr ? X : isFr ? Y : Z  →  isFr ? Y : Z
  // Handle multi-line and single-line patterns
  src = src.replace(/isAr\s*\?\s*[^:]+\s*:\s*(isFr\s*\?)/g, '$1');

  // 4. Simplify: isFr ? Y : isAr ? X : Z  →  isFr ? Y : Z
  src = src.replace(/(isFr\s*\?[^:]+:\s*)isAr\s*\?[^:]+:\s*/g, '$1');

  // 5. Remove leftover isAr ternaries with string literals (single line)
  // Pattern: isAr ? 'arabic text' : 
  src = src.replace(/isAr\s*\?\s*'[^']*'\s*:\s*/g, '');
  // Pattern: isAr ? "arabic text" : 
  src = src.replace(/isAr\s*\?\s*"[^"]*"\s*:\s*/g, '');

  // 6. locale === 'ar' standalone → false
  src = src.replace(/locale === ['"]ar['"]/g, 'false');

  // 7. Remove DemoBanner ar branch: locale === 'ar' ? '...' :
  // Already handled by rule 6

  // 8. Remove RTL / dir="rtl" references tied to isAr
  src = src.replace(/\s*dir=\{isAr\s*\?\s*['"]rtl['"]\s*:\s*['"]ltr['"]\}/g, '');
  src = src.replace(/\s*className=\{[^}]*isAr[^}]*\}/g, (match) => {
    // Only remove if it's purely about RTL text direction
    if (match.includes('rtl') || match.includes('text-right') || match.includes('font-arabic')) {
      return '';
    }
    return match;
  });

  // 9. Remove import of ar translation if still present
  src = src.replace(/^import \{ ar \} from ['"]\.\/i18n\/ar\.ts['"];?\r?\n/m, '');

  // 10. Remove 'ar' from translations object
  src = src.replace(/const translations[^=]+=\s*\{[^}]*,\s*ar\s*\}/g, (m) => m.replace(/,\s*ar/, ''));

  // 11. Remove isRtl logic
  src = src.replace(/const isRtl = locale === ['"]ar['"];/g, 'const isRtl = false;');

  if (src !== original) {
    writeFileSync(filePath, src, 'utf8');
    console.log('Updated:', filePath.replace(ROOT, '').replace(/\\/g, '/'));
  } else {
    console.log('No change:', filePath.replace(ROOT, '').replace(/\\/g, '/'));
  }
}

console.log('\nDone.');
