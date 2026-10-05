// SPDX-License-Identifier: MIT

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@rakomi/react-native';

/** Protected screen — `<Root>` only renders this once `useAuth().isSignedIn` is `true`. Reads
 * the signed-in user straight from `useAuth().user` (decoded from the verified access token,
 * no extra network round trip). */
export function DashboardScreen() {
  const auth = useAuth();

  if (!auth.isSignedIn) {
    // Unreachable in normal flow (Root only mounts this screen while signed in) — a defensive
    // fallback in case a background token-refresh failure flips the session mid-render.
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.body}>Signed in as {auth.user.email}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        onPress={() => {
          void auth.signOut();
        }}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: '600' },
  body: { fontSize: 15, opacity: 0.7 },
  button: { backgroundColor: '#111827', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginTop: 12 },
  buttonPressed: { opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
