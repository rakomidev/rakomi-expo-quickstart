// SPDX-License-Identifier: MIT

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/**
 * Shown while `startSocialSignIn()` is awaiting the `rakomi-expo://` redirect back from the
 * system browser (Android/iOS `expo-web-browser` "auth session"), and while the SDK restores a
 * session from storage on cold start.
 *
 * Unlike a web quickstart, there is no separate URL-routed "/oauth/callback" page here:
 * `expo-web-browser`'s `openAuthSessionAsync` (wired inside `@rakomi/react-native`'s
 * `startSocialSignIn`) intercepts the `rakomi-expo://` redirect itself and resolves the
 * in-flight promise with the callback URL — this screen is the visual equivalent of that wait,
 * not a route the OS navigates to.
 */
export function CallbackScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>Signing you in…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  text: { fontSize: 15, opacity: 0.7 },
});
