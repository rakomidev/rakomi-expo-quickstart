<!-- SPDX-License-Identifier: MIT -->

# Rakomi Expo quickstart

A managed Expo (React Native) app that signs a user in with **PKCE over the system browser**
(RFC 8252), handles the `rakomi-expo://` deep-link redirect, and shows a protected screen built
on `@rakomi/react-native` alone — no backend of your own required for auth.

## Deploy

There is no "Deploy to Vercel" button here — a mobile app has no equivalent single-click host.
The entry point is the CLI:

```sh
npx create-rakomi-app --template expo my-app
```

which scaffolds this quickstart locally. From there, `npx expo run:ios` / `run:android` builds
and runs it on a simulator/device, and EAS Build (Expo's own build service) is the path to a
real store submission — EAS configuration is not part of this quickstart and is left to you.

## What this quickstart demonstrates

1. **Sign-in** — a button that calls `performOAuthSignIn()` (`src/oauth-sign-in.ts`), which opens
   the OS system browser (`expo-web-browser`'s `openAuthSessionAsync`, wired inside
   `@rakomi/react-native`'s `startSocialSignIn`) at `GET /oauth/authorize`, with a PKCE
   code_verifier/challenge and CSRF `state`.
2. **Deep-link callback** — the system browser redirects to `rakomi-expo://callback`
   (`app.json`'s `"scheme"`); `openAuthSessionAsync` intercepts that redirect itself and resolves
   the in-flight sign-in call with the callback URL — there is no separate `Linking` listener on
   the golden path. `src/screens/CallbackScreen.tsx` is the "Signing you in…" screen shown while
   this is in flight; see its own comment for why that is a *screen*, not a URL *route*, in an
   app with no router.
3. **Code exchange** — the SDK validates `state` (constant-time, single-use, 60s TTL) and
   exchanges the code via `POST /oauth/token`; the resulting tokens are handed to
   `useSubmitOAuthTokens()`, which persists the session.
4. **A protected screen** — `src/screens/DashboardScreen.tsx` reads the signed-in user straight
   from `useAuth().user` (decoded from the verified access token, no extra network round trip).
5. **Sign-out** — `useAuth().signOut()` clears the local session.

## Run it

```sh
npm install
cp .env.example .env.local   # set EXPO_PUBLIC_RAKOMI_CLIENT_ID
npx expo run:ios             # or: npx expo run:android
```

Your tenant's OAuth client needs `rakomi-expo://callback` registered as a redirect URI (see
Caveats below for why plain Expo Go will not work here).

## Troubleshooting

If an OAuth error interrupts sign-in against a real tenant, note the approximate timestamp and
the error code from the callback — every OAuth error response is recorded server-side with its
error code and a request identifier, which support can use to locate the exact request when
diagnosing an integration issue.

## Why no expo-router

`src/Root.tsx` is a ~15-line state dispatcher (idle / signing-in / signed-in) instead of a
routing dependency — the same reasoning the sibling React (Vite) quickstart gives for its
dependency-free pathname router: this app has exactly three destinations, and a mobile OAuth
redirect is intercepted by `expo-web-browser` directly rather than routed by any in-app router.

## Biometric unlock (optional, off by default)

`<RakomiProvider biometric={BIOMETRIC_UNLOCK_ENABLED}>` (`App.tsx`) is read straight from
`.env.example`'s `EXPO_PUBLIC_BIOMETRIC_UNLOCK` (default `false`). When `"true"`, the SDK gates
every stored refresh-token READ (not the initial sign-in) behind the device screen lock — Face
ID / Touch ID / fingerprint / passcode, via `expo-local-authentication` — using
`@rakomi/react-native`'s own built-in `biometric` prop; this quickstart adds no biometric code of
its own beyond wiring the one prop and reading the flag.

## Caveats

- Not a bare-React-Native app (no Xcode/Android Studio project of its own — this is
  Expo-managed), not an `expo-router` tutorial, and not a passkey or social-provider demo (see
  the SDK's own `usePasskeys()` docs and the guides at
  [docs.rakomi.dev](https://docs.rakomi.dev) for those).
- No region-residency configuration, and the SDK's plain sign-in path emits no audit/consent
  record — that is documented SDK behavior, not something this quickstart adds.
- `build`/`typecheck` are both `tsc --noEmit` — a real `expo export`/`expo run:ios` build needs
  Xcode, an Android SDK, and (for `expo export`) network access, so building for a real
  device/simulator/store submission is a manual step on your machine, not something this
  quickstart's own scripts verify for you.
- `rakomi-expo://callback` does not resolve inside plain Expo Go (which proxies through its own
  `exp://` scheme) — use `expo run:ios`/`run:android` or a dev-client build.
