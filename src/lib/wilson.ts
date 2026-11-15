/**
 * Shared 95% Wilson score interval.
 *
 * Server-side safeguards pass the versioned z value (privacy threshold
 * document); the UI can use the default 1.96 for pooled headline intervals.
 */
export interface WilsonInterval {
  proportion: number; // 0 to 100
  lower: number; // 0 to 100
  upper: number; // 0 to 100
}

export function computeWilson95(
  successes: number,
  total: number,
  z = 1.96
): WilsonInterval {
  if (total <= 0) {
    return { proportion: 0, lower: 0, upper: 0 };
  }
  const p = successes / total;
  const z2 = z * z;
  const denom = 1 + z2 / total;
  const center = (p + z2 / (2 * total)) / denom;
  const halfWidth =
    (z * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total * total))) / denom;

  return {
    proportion: Math.round(p * 1000) / 10,
    lower: Math.max(0, Math.round((center - halfWidth) * 1000) / 10),
    upper: Math.min(100, Math.round((center + halfWidth) * 1000) / 10),
  };
}
