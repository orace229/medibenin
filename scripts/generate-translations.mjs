/**
 * scripts/generate-translations.mjs
 * Génère fr.ts et ar.ts automatiquement via MyMemory (100% gratuit, aucune clé).
 * https://mymemory.translated.net/doc/spec.php
 *
 * Usage: node scripts/generate-translations.mjs
 * Optionnel (10 000 mots/jour au lieu de 1 000): node scripts/generate-translations.mjs --email votre@email.com
 */

import { writeFileSync } from 'fs';
import { argv } from 'process';

// ─── Clés source (anglais, source de vérité) ────────────────────────────────
const EN = {
  demoBanner: 'Demonstration environment – 100% synthetic data · Not for clinical use',
  brandTagline: 'Precision Prevention & Screening',
  navProblem: 'The Problem',
  navHowItWorks: 'How It Works',
  navForWhom: 'Who It Serves',
  navResponsibility: 'Responsible AI',
  navFaq: 'FAQ',
  signIn: 'Sign In',
  accessDashboard: 'Try the live demo',
  levelRed: 'Urgent',
  levelOrange: 'Priority',
  levelYellow: 'To schedule',
  levelGreen: 'Up to date',
  levelGrey: 'Insufficient data',
  certaintyHigh: 'High certainty',
  certaintyMedium: 'Medium certainty',
  certaintyLow: 'Low certainty (To confirm)',
  certaintyHighTooltip: 'Recent and complete clinical measurements',
  certaintyMediumTooltip: 'Some data is self-reported or older than 12 months',
  certaintyLowTooltip: 'To be confirmed with a new clinical measurement',
  stateCreated: 'Created',
  stateValidated: 'Validated',
  stateInvited: 'Invited',
  stateScheduled: 'Scheduled',
  statePostponed: 'Postponed',
  stateOverdue: 'Overdue',
  stateDone: 'Done ✓',
  stateRefused: 'Declined',
  aiSuggestionBadge: 'Automatic summary from rules',
  validateBtn: 'Validate',
  editBtn: 'Modify',
  ignoreBtn: 'Ignore',
  confirmBtn: 'Confirm',
  postponeBtn: 'Reschedule',
  refuseBtn: 'Decline (No impact on care)',
  passQrLabel: 'Present this 8-character pass at the health centre reception',
};

// ─── Argument optionnel --email ──────────────────────────────────────────────
const emailArg = argv.indexOf('--email');
const email = emailArg !== -1 ? argv[emailArg + 1] : null;

// ─── MyMemory API ────────────────────────────────────────────────────────────
async function translateOne(text, langpair) {
  const params = new URLSearchParams({ q: text, langpair });
  if (email) params.set('de', email);
  const url = `https://api.mymemory.translated.net/get?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status} for "${text}"`);
  const json = await res.json();
  if (json.responseStatus !== 200) {
    throw new Error(`MyMemory error ${json.responseStatus}: ${json.responseDetails}`);
  }
  return json.responseData.translatedText;
}

// Délai pour ne pas dépasser le rate-limit (5 req/s max)
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function translateAll(langpair, label) {
  console.log(`\n🌍  Traduction → ${label} (${langpair})…`);
  const result = {};
  const entries = Object.entries(EN);
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    // Protéger le ✓ et le · pendant la traduction
    const protected_ = value.replace('✓', '__CHECKMARK__').replace('·', '__DOT__');
    let translated = await translateOne(protected_, langpair);
    translated = translated.replace('__CHECKMARK__', '✓').replace('__DOT__', '·');
    result[key] = translated;
    process.stdout.write(`  [${i + 1}/${entries.length}] ${key} → ${translated}\n`);
    await delay(220); // ~4.5 req/s
  }
  return result;
}

// ─── Écriture du fichier .ts ─────────────────────────────────────────────────
function toTsFile(varName, label, dict) {
  const lines = [
    `// ${label} dictionary – généré automatiquement via MyMemory (100% gratuit).`,
    `// Pour régénérer : node scripts/generate-translations.mjs`,
    `// Source de vérité : src/lib/i18n/en.ts`,
    `export const ${varName}: Record<string, string> = {`,
  ];
  for (const [k, v] of Object.entries(dict)) {
    const escaped = String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    lines.push(`  ${k}: '${escaped}',`);
  }
  lines.push('};', '');
  return lines.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('MyMemory Translation Generator');
  console.log(`Quota : ${email ? '10 000' : '1 000'} mots/jour${email ? ` (email: ${email})` : ' (sans email)'}`);

  const fr = await translateAll('en|fr', 'Français');
  const ar = await translateAll('en|ar', 'العربية');

  const frPath = 'src/lib/i18n/fr.ts';
  const arPath = 'src/lib/i18n/ar.ts';

  writeFileSync(frPath, toTsFile('fr', 'French', fr), 'utf-8');
  writeFileSync(arPath, toTsFile('ar', 'Arabic', ar), 'utf-8');

  console.log('\n✅  Fichiers écrits :');
  console.log('  ', frPath);
  console.log('  ', arPath);
  console.log('\n👁   Relisez les traductions médicales avant de committer.');
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
