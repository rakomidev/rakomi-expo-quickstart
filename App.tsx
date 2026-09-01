// SPDX-License-Identifier: MIT

import { useMemo } from 'react';

import { createDefaultExpoAdapter, type NativeAuthAdapter, RakomiProvider } from '@rakomi/react-native';

import { BIOMETRIC_UNLOCK_ENABLED, RAKOMI_BASE_URL, RAKOMI_CLIENT_ID, REDIRECT_URI } from './src/config.js';
import { Root } from './src/Root.js';

export default function App() {
  // ONE adapter instance, shared between <RakomiProvider> (which freezes it on mount and drives
  // token refresh/storage from it) and useOAuthSignIn() (which drives the PKCE ceremony from
  // the SAME storage/crypto/browser). Passing `nativeAdapter` explicitly — rather than letting
  // the provider build its own internally — is what keeps them the same object.
  const adapter = useMemo<NativeAuthAdapter>(() => createDefaultExpoAdapter(), []);

  return (
    <RakomiProvider
      publishableKey={RAKOMI_CLIENT_ID}
      baseUrl={RAKOMI_BASE_URL}
      redirectUri={REDIRECT_URI}
      nativeAdapter={adapter}
      biometric={BIOMETRIC_UNLOCK_ENABLED}
    >
      <Root adapter={adapter} />
    </RakomiProvider>
  );
}
