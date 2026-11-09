/**
 * Wilson Score 95% Confidence Interval Calculator
 * Implements Section 7.2 of MediSense Specification v7.0
 */
export function calculateWilson95(successes: number, total: number): [number, number] {
  if (total <= 0) return [0, 0];
  const z = 1.96; // 95% confidence level
  const p = Math.max(0, Math.min(1, successes / total));
  const z2 = z * z;
  
  const denominator = 1 + z2 / total;
  const center = (p + z2 / (2 * total)) / denominator;
  const spread = (z * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total))) / denominator;

  const lower = Math.max(0, center - spread);
  const upper = Math.min(1, center + spread);

  return [Math.round(lower * 1000) / 10, Math.round(upper * 1000) / 10]; // formatted as percentage with 1 decimal
}

export interface MaskedStatResult {
  displayValue: string;
  isMasked: boolean;
  maskReason?: string;
  intervalStr?: string;
  rawRate?: number;
}

/**
 * Anti-trickery safeguard (Section 7.3)
 * - n < 10: Masked
 * - 10 <= n <= 29: small sample warning, no ranking
 * - events < 5: insufficient events
 */
export function formatStatWithSafeguard(
  events: number,
  total: number,
  isSecondaryMasked = false
): MaskedStatResult {
  if (total < 10 || isSecondaryMasked) {
    return {
      displayValue: 'Masqué (n < 10)',
      isMasked: true,
      maskReason: 'Protection de la vie privée (Règle anti-réidentification CDC §7.3)'
    };
  }

  const rate = (events / total) * 100;
  const [lower, upper] = calculateWilson95(events, total);
  const intervalStr = `[${lower.toFixed(1)}% – ${upper.toFixed(1)}%]`;

  if (total <= 29) {
    return {
      displayValue: `${rate.toFixed(1)}%`,
      isMasked: false,
      maskReason: 'Petit effectif (10-29) : pas de conclusion comparative',
      intervalStr,
      rawRate: rate
    };
  }

  if (events < 5) {
    return {
      displayValue: `${rate.toFixed(1)}%`,
      isMasked: false,
      maskReason: 'Événements insuffisants (< 5) : interpréter avec prudence',
      intervalStr,
      rawRate: rate
    };
  }

  return {
    displayValue: `${rate.toFixed(1)}%`,
    isMasked: false,
    intervalStr,
    rawRate: rate
  };
}
