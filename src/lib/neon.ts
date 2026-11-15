/**
 * src/lib/neon.ts
 * Central wiring for all Neon backend services:
 *   - Postgres  → src/db/index.ts (DATABASE_URL)
 *   - Auth      → NEON_AUTH_BASE_URL / NEON_AUTH_JWKS_URL (JWKS verifier alongside Firebase)
 *   - AI Gateway → NEON_AI_GATEWAY_BASE_URL / NEON_AI_GATEWAY_TOKEN (OpenAI-compatible endpoint)
 *   - Functions  → NEON_FUNCTION_HOST_SUFFIX (build URLs for deployed functions)
 *   - Realtime  → NEON_REALTIME_URL / NEON_REALTIME_SECRET (server-side seal helper)
 */

// ─── AI Gateway ─────────────────────────────────────────────────────────────

/**
 * Returns an OpenAI-compatible fetch wrapper pointed at the Neon AI Gateway.
 * Drop-in replacement for fetch calls to OpenAI/Google; pass the returned
 * baseURL + Authorization header to any OpenAI-SDK-compatible client.
 */
export function getNeonAIGatewayConfig() {
  const baseURL = process.env.NEON_AI_GATEWAY_BASE_URL;
  const token = process.env.NEON_AI_GATEWAY_TOKEN;
  if (!baseURL || !token) {
    throw new Error('NEON_AI_GATEWAY_BASE_URL and NEON_AI_GATEWAY_TOKEN must be set');
  }
  return {
    baseURL: `${baseURL}/v1`,
    apiKey: token,
    defaultHeaders: { Authorization: `Bearer ${token}` },
  };
}

/**
 * Lightweight AI Gateway health check: hits /v1/models and returns the list.
 */
export async function listAIGatewayModels(): Promise<string[]> {
  const { baseURL, apiKey } = getNeonAIGatewayConfig();
  const res = await fetch(`${baseURL}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI Gateway /models returned ${res.status}: ${text}`);
  }
  const json = await res.json() as { data?: Array<{ id: string }> };
  return (json.data ?? []).map((m) => m.id);
}

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Build the HTTPS URL for a deployed Neon Function.
 * @param branchId  e.g. "br-polished-queen-b9ykfgq9"  (NEON_BRANCH_ID)
 * @param slug      function slug as declared in neon.ts, e.g. "hello"
 */
export function getFunctionURL(slug: string): string {
  const branchId = process.env.NEON_BRANCH_ID;
  const suffix = process.env.NEON_FUNCTION_HOST_SUFFIX;
  if (!branchId || !suffix) {
    throw new Error('NEON_BRANCH_ID and NEON_FUNCTION_HOST_SUFFIX must be set');
  }
  return `https://${branchId}-${slug}${suffix}/`;
}

// ─── Auth (JWKS) ─────────────────────────────────────────────────────────────

/**
 * URL for the Neon Auth JWKS endpoint, used to verify Neon Auth JWTs.
 * The app currently uses Firebase for auth; this is exposed so a future
 * migration to Neon Managed Better Auth can re-use the JWKS verifier.
 */
export function getNeonAuthJwksUrl(): string {
  const url = process.env.NEON_AUTH_JWKS_URL;
  if (!url) throw new Error('NEON_AUTH_JWKS_URL must be set');
  return url;
}

export function getNeonAuthBaseUrl(): string {
  const url = process.env.NEON_AUTH_BASE_URL;
  if (!url) throw new Error('NEON_AUTH_BASE_URL must be set');
  return url;
}

// ─── Realtime ─────────────────────────────────────────────────────────────────

/**
 * Seal a SQL query for the Neon Realtime client.
 * Uses the HMAC-SHA256 signing that @neon/realtime/server performs internally.
 * We replicate it here without the package so we avoid the extra dep until
 * @neon/realtime is added explicitly.
 */
export async function sealRealtimeQuery(
  sql: string,
  params: unknown[] = [],
): Promise<{ token: string; url: string }> {
  const secret = process.env.NEON_REALTIME_SECRET;
  const wsUrl = process.env.NEON_REALTIME_URL;
  if (!secret || !wsUrl) {
    throw new Error('NEON_REALTIME_SECRET and NEON_REALTIME_URL must be set');
  }

  // Build the payload the Realtime WS server expects
  const payload = { sql, params, iat: Math.floor(Date.now() / 1000) };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

  // HMAC-SHA256 sign with the secret
  const crypto = await import('node:crypto');
  const mac = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');

  const token = `${payloadB64}.${mac}`;
  return { token, url: wsUrl };
}
