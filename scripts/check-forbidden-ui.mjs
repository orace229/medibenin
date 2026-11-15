#!/usr/bin/env node
/**
 * check-forbidden-ui.mjs â€” Phase A gate for MediBenin.
 *
 * Scans UI-facing source files for developer/spec vocabulary, rule identifiers,
 * thresholds and formulas that must never be visible in any portal, and for
 * leftover English/French mixing in French labels.
 *
 * Excluded from the scan:
 *   - src/components/EvidenceGovernance.tsx (the /proof evidence page, where
 *     the acceptance suite and rule identifiers are intentionally shown)
 *   - src/server/** and server.ts (server-side logic; API wording is handled
 *     separately in Phase C)
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();

// UI-facing files only.
function collectFiles(dir, exts, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue;
      collectFiles(full, exts, acc);
    } else if (exts.some((e) => entry.endsWith(e))) {
      acc.push(full);
    }
  }
  return acc;
}

const files = [
  ...collectFiles(join(ROOT, 'src'), ['.ts', '.tsx']),
].filter((f) => existsSync(f));

const EXCLUDED = [
  'EvidenceGovernance.tsx', // /proof page: rule ids and suite results are intentional
  'src/server/', // server logic (API wording handled in Phase C)
  'src/db/', // database schema comments
];

// Each pattern: [regex, human-readable label]
const PATTERNS = [
  [/\bTEST-[A-Za-z0-9]+/, 'TEST- rule id'],
  [/Section \d/i, 'spec section reference'],
  [/\bbackend\b/i, 'backend wording'],
  [/\bU2\b/, 'internal module id U2'],
  [/useRiskAnalysis/, 'internal hook name'],
  [/\bhook\b/i, 'developer wording "hook"'],
  [/\bPersona\b/, 'internal Persona wording'],
  [/\bCustom\b/, 'internal Custom wording'],
  [/\bformule\b/i, 'formula wording'],
  [/\bformula\b/i, 'formula wording'],
  [/\bpct\b/, 'pct abbreviation'],
  [/\d+\s*\/\s*26\b/, 'score /26 pts'],
  [/\bABU_DHABI_/, 'ABU_DHABI_ rule id'],
  [/Screen 1|Screen 2|Ã‰cran 1|Ã‰cran 2/, 'Screen 1/2 wording'],
  [/AI Summary/i, '"AI Summary" label'],
  [/Clinician Validated/i, '"100% Clinician Validated" claim'],
  [/Parity Guarantee/i, '"Parity Guarantee" claim'],
  [/\bDoH\b/, 'health-authority (DoH) wording'],
  [/\bIMC\b/, 'French/English mixing (IMC)'],
  [/Mesure \d/, 'French/English mixing (Mesure N)'],
  [/\bAnthropomÃ©trie\b/, 'French/English mixing (AnthropomÃ©trie)'],
  [/\bAnciennetÃ©\b/i, 'French/English mixing (AnciennetÃ©)'],
  [/ProbabilitÃ© CalibrÃ©e/i, 'French/English mixing (ProbabilitÃ© CalibrÃ©e)'],
  [/cas pris en charge/i, 'French/English mixing (cas pris en charge)'],
  // Patterns hardened in Phase E (regressions caught during Phases C/D):
  [/\(Rule [A-Z]\d+\)/, 'internal rule id in display string'],
  [/\(RÃ¨gle [A-Z]\d+\)/, 'internal rule id in display string (FR)'],
  [/\[To verify/, 'internal governance marker [To verify]'],
  [/\[Simulated/, 'internal governance marker [Simulated]'],
  [/\bAPI-level\b/, 'developer wording "API-level"'],
  [/\bengine\b/i, 'developer wording "engine"'],
  [/\bdatabase\b/i, 'developer wording "database"'],
  [/base de donnÃ©es/i, 'developer wording "base de donnÃ©es"'],
  [/C1â€“C4|C1-C4/, 'internal consent purpose codes C1â€“C4'],
];

/** Strip comments so that internal code comments are not flagged: only
 * user-visible literals and JSX text are scanned. */
function stripComments(source) {
  let out = source.replace(/\/\*[\s\S]*?\*\//g, ' ');
  out = out
    .split(/\r?\n/)
    .map((line) => {
      // Remove line comments, but keep "://" protocol occurrences intact.
      return line.replace(/(^|[^:])\/\/[^"'\n]*$/, '$1');
    })
    .join('\n');
  return out;
}

const violations = [];

for (const file of files) {
  const rel = relative(ROOT, file).split(sep).join('/');
  if (EXCLUDED.some((name) => rel.includes(name))) continue;
  const lines = stripComments(readFileSync(file, 'utf8')).split(/\r?\n/);
  lines.forEach((line, i) => {
    // Ignore the checker's own patterns documented in comments elsewhere.
    for (const [re, label] of PATTERNS) {
      if (re.test(line)) {
        violations.push({ file: rel, line: i + 1, label, text: line.trim().slice(0, 140) });
      }
    }
  });
}

if (violations.length > 0) {
  console.error('\nâœ— Forbidden UI content found:\n');
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.label}]`);
    console.error(`    ${v.text}`);
  }
  console.error(`\n${violations.length} violation(s). Clean the UI wording above.`);
  process.exit(1);
}

console.log('âœ“ check:ui passed â€” no forbidden UI content detected.');
