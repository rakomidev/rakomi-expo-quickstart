// SPDX-License-Identifier: MIT

import { useMemo, useState } from 'react';

import { createRnHttpClient, getErrorMessage, type NativeAuthAdapter, useSubmitOAuthTokens } from '@rakomi/react-native';

import { RAKOMI_BASE_URL } from '../config.js';
import { performOAuthSignIn } from '../oauth-sign-in.js';

export type OAuthSignInStatus = 'idle' | 'signing-in' | 'error';

export interface UseOAuthSignInResult {
  status: OAuthSignInStatus;
  error: string | null;
  /** Opens the system browser (RFC 8252), awaits the `rakomi-expo://` redirect, and exchanges
   * the code. Resolves once the SDK has persisted the session — `useAuth().isSignedIn` flips
   * to `true` right after. See `../oauth-sign-in.ts` for the request-level contract. */
  signIn: () => Promise<void>;
}

/**
 * `adapter` MUST be the SAME `NativeAuthAdapter` instance passed to `<RakomiProvider
 * nativeAdapter={adapter}>` — sharing it is what lets the PKCE/state stash (written via
 * `adapter.storage`) and the provider's own token runtime (reading from the same storage)
 * agree. Building a second, independent adapter here would silently split that state.
 */
export function useOAuthSignIn(adapter: NativeAuthAdapter): UseOAuthSignInResult {
  const http = useMemo(() => createRnHttpClient({ baseUrl: RAKOMI_BASE_URL }), []);
  const submitOAuthTokens = useSubmitOAuthTokens();
  const [status, setStatus] = useState<OAuthSignInStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const signIn = async (): Promise<void> => {
    setStatus('signing-in');
    setError(null);
    const result = await performOAuthSignIn({ adapter, http, submitOAuthTokens });
    if (!result.ok) {
      setStatus(result.error.code === 'OAUTH_CALLBACK_ERROR' && result.error.oauthError === 'oauth_user_cancelled' ? 'idle' : 'error');
      setError(getErrorMessage(result.error));
      return;
    }
    setStatus('idle');
  };

  return { status, error, signIn };
}
