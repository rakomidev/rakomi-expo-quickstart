// SPDX-License-Identifier: MIT

import type { NativeAuthAdapter } from '@rakomi/react-native';
import { useAuth } from '@rakomi/react-native';

import { useOAuthSignIn } from './hooks/useOAuthSignIn.js';
import { CallbackScreen } from './screens/CallbackScreen.js';
import { DashboardScreen } from './screens/DashboardScreen.js';
import { HomeScreen } from './screens/HomeScreen.js';

export interface RootProps {
  /** The SAME adapter instance <RakomiProvider nativeAdapter> was given — see useOAuthSignIn.ts. */
  adapter: NativeAuthAdapter;
}

/** Dispatches between the three screens on session state — no navigation library, the same
 * dependency-free-router reasoning the sibling web quickstarts use: three destinations is not
 * enough surface to justify the dependency. */
export function Root({ adapter }: RootProps) {
  const auth = useAuth();
  const oauth = useOAuthSignIn(adapter);

  // isLoaded is false while the SDK restores a session from secure storage on cold start.
  // 'signing-in' covers the system-browser round trip — see CallbackScreen.tsx.
  if (!auth.isLoaded || oauth.status === 'signing-in') {
    return <CallbackScreen />;
  }
  if (auth.isSignedIn) {
    return <DashboardScreen />;
  }
  return <HomeScreen onSignIn={() => void oauth.signIn()} error={oauth.error} busy={false} />;
}
