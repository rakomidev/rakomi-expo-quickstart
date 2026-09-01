// SPDX-License-Identifier: MIT

import type { AuthError, HttpClient, NativeAuthAdapter } from '@rakomi/react-native';
import { deriveAuthorizationEndpointFallback, startSocialSignIn, useSubmitOAuthTokens } from '@rakomi/react-native';

import { RAKOMI_BASE_URL, RAKOMI_CLIENT_ID, REDIRECT_URI } from './config.js';

export type PerformOAuthSignInResult = { ok: true } | { ok: false; error: AuthError };

// `@rakomi/react-native` does not re-export `OAuthTokenResponse` by name — deriving the
// parameter type from `useSubmitOAuthTokens`'s own return signature (compile-time only; this
// never calls the hook) keeps this function's contract tied to the real call site instead of
// reaching past the package's public surface for an unexported type.
type SubmitOAuthTokens = ReturnType<typeof useSubmitOAuthTokens>;

export interface PerformOAuthSignInOptions {
  adapter: NativeAuthAdapter;
  http: HttpClient;
  submitOAuthTokens: SubmitOAuthTokens;
  /** Defaults from `./config.ts` — overridable so a test can point this at a local fake without
   * depending on process.env at module-import time. */
  baseUrl?: string;
  clientId?: string;
  redirectUri?: string;
}

interface DiscoveryDocument {
  authorization_endpoint?: unknown;
}

/**
 * Try live OIDC discovery — returns the discovered `authorization_endpoint`, or `null` on ANY
 * failure (network error, non-2xx, malformed document). Never throws.
 */
async function tryDiscoverAuthorizationEndpoint(http: HttpClient, baseUrl: string): Promise<string | null> {
  try {
    const res = await http.fetch(`${baseUrl}/.well-known/openid-configuration`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const doc = (await res.json()) as DiscoveryDocument;
    if (typeof doc.authorization_endpoint !== 'string' || doc.authorization_endpoint.length === 0) return null;
    return doc.authorization_endpoint;
  } catch {
    return null;
  }
}

/**
 * Resolve the REAL `authorization_endpoint` — the issuer's routing host (`baseUrl`) is not
 * always the host that renders the hosted login UI, and a browser sent to the wrong host gets a
 * JSON API response instead of a login form. Tries live OIDC discovery first, falls back to the
 * platform's documented `api.` <-> `accounts.` host-naming convention when discovery fails.
 * Returns `null` when NEITHER path applies (e.g. a non-`api.`-shaped `baseUrl` with unreachable
 * discovery) — the caller surfaces this as a clear sign-in error rather than guessing a URL.
 */
async function resolveAuthorizationEndpoint(http: HttpClient, baseUrl: string): Promise<string | null> {
  const discovered = await tryDiscoverAuthorizationEndpoint(http, baseUrl);
  if (discovered) return discovered;
  try {
    return deriveAuthorizationEndpointFallback(baseUrl);
  } catch {
    return null;
  }
}

/**
 * Opens the system browser (RFC 8252) at the resolved `authorization_endpoint` (via OIDC
 * discovery, falling back to the platform's host-naming convention), awaits the `redirectUri`
 * callback, exchanges the code via `POST <baseUrl>/oauth/token`, then hands the resulting tokens
 * to `submitOAuthTokens` (normally `useSubmitOAuthTokens()`, so the SDK persists the session).
 */
export async function performOAuthSignIn(options: PerformOAuthSignInOptions): Promise<PerformOAuthSignInResult> {
  const baseUrl = options.baseUrl ?? RAKOMI_BASE_URL;

  const authorizationEndpoint = await resolveAuthorizationEndpoint(options.http, baseUrl);
  if (!authorizationEndpoint) {
    return {
      ok: false,
      error: { code: 'SIGN_IN_FAILED', message: `Could not resolve the OAuth authorization_endpoint for ${baseUrl}` },
    };
  }

  const outcome = await startSocialSignIn({
    adapter: options.adapter,
    http: options.http,
    authorizationEndpoint,
    tokenEndpoint: `${baseUrl}/oauth/token`,
    clientId: options.clientId ?? RAKOMI_CLIENT_ID,
    redirectUri: options.redirectUri ?? REDIRECT_URI,
    // No social-provider hint — routes to Rakomi's own hosted sign-in page.
    provider: '',
  });
  if (!outcome.ok) return { ok: false, error: outcome.error };
  await options.submitOAuthTokens(outcome.tokens);
  return { ok: true };
}
