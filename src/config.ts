// SPDX-License-Identifier: MIT

/** Rakomi API base URL. Defaults to the production platform. */
export const RAKOMI_BASE_URL: string = process.env.EXPO_PUBLIC_RAKOMI_BASE_URL ?? 'https://api.rakomi.com';

/** OAuth client id issued for this application (a PUBLIC client — PKCE alone proves possession). */
export const RAKOMI_CLIENT_ID: string = process.env.EXPO_PUBLIC_RAKOMI_CLIENT_ID ?? '';

/**
 * Optional biometric-unlock path — OFF by default. When `"true"`, a signed-in session's stored
 * refresh token can only be read after the device screen lock (Face ID / Touch ID / fingerprint
 * / passcode) succeeds — see README "Biometric unlock". Wired straight into
 * `<RakomiProvider biometric>`; this quickstart adds no biometric code of its own.
 */
export const BIOMETRIC_UNLOCK_ENABLED: boolean = process.env.EXPO_PUBLIC_BIOMETRIC_UNLOCK === 'true';

/**
 * The OAuth redirect URI. `app.json`'s `"scheme": "rakomi-expo"` registers this scheme with the
 * OS; `expo-web-browser`'s `openAuthSessionAsync` (wired inside `@rakomi/react-native`'s
 * `startSocialSignIn`) is what actually intercepts the redirect — see
 * `src/screens/CallbackScreen.tsx`.
 *
 * A literal constant, deliberately NOT built via `expo-linking`'s `Linking.createURL()` (the
 * usual Expo-idiomatic construction, and the same problem `expo-auth-session`'s own
 * `makeRedirectUri()` solves): that call reaches a native module at import time, which would
 * make this file — and every test that transitively imports it — depend on a live Expo
 * runtime. This constant is correct for a dev-client or standalone build with `app.json`'s
 * `"scheme"` registered; it does NOT resolve inside Expo Go (which uses its own `exp://` proxy
 * scheme instead) — run this quickstart with `npx expo run:ios` / `run:android`, or a dev
 * client build, not plain Expo Go.
 */
export const REDIRECT_URI = 'rakomi-expo://callback';
