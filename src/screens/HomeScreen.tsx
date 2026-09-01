// SPDX-License-Identifier: MIT

import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface HomeScreenProps {
  onSignIn: () => void;
  error: string | null;
  busy: boolean;
}

/** Sign-in entry point. Renders a single "Sign in" button — no email/password form, no social
 * provider list: this quickstart demonstrates ONE flow, Rakomi's own hosted PKCE sign-in page. */
export function HomeScreen({ onSignIn, error, busy }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rakomi Expo quickstart</Text>
      <Text style={styles.subtitle}>Sign in with PKCE to reach the protected screen.</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sign in"
        disabled={busy}
        onPress={onSignIn}
        style={({ pressed }) => [styles.button, (pressed || busy) && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>{busy ? 'Opening sign-in…' : 'Sign in'}</Text>
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: '600' },
  subtitle: { fontSize: 15, textAlign: 'center', opacity: 0.7 },
  button: { backgroundColor: '#111827', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginTop: 12 },
  buttonPressed: { opacity: 0.7 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center', marginTop: 8 },
});
