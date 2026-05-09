/**
 * Bolt Earth UI SDK bridge demo — Android only for native module.
 *
 * @format
 */

import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  ensureLoggedIn,
  hasValidSession,
  initialize,
  isBoltEarthUiSdkAvailable,
  openChargerBookingFlow,
  openUsersBookingsList,
  wrapContextWithTheme,
} from './src/boltEarthUiSdk';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const [userId, setUserId] = useState('');
  const [sdkToken, setSdkToken] = useState('');
  const [sdkPackage, setSdkPackage] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  const [busy, setBusy] = useState<'init' | 'login' | 'list' | 'charger' | null>(
    null,
  );

  const refreshSession = useCallback(async () => {
    if (!isBoltEarthUiSdkAvailable || !initialized) {
      setSessionValid(null);
      return;
    }
    try {
      const ok = await hasValidSession();
      setSessionValid(ok);
    } catch {
      setSessionValid(null);
    }
  }, [initialized]);

  const onInitialize = async () => {
    if (!isBoltEarthUiSdkAvailable) {
      return;
    }
    const uid = userId.trim();
    const token = sdkToken.trim();
    if (!uid || !token) {
      Alert.alert('Missing config', 'Enter user id and sdk token first.');
      return;
    }
    setBusy('init');
    try {
      initialize({
        userId: uid,
        sdkToken: token,
        ...(sdkPackage.trim() ? { sdkPackage: sdkPackage.trim() } : {}),
        ...(primaryColor.trim() ? { primaryColor: primaryColor.trim() } : {}),
      });
      await wrapContextWithTheme();
      setInitialized(true);
      await refreshSession();
      Alert.alert('SDK ready', 'Initialized and theme applied.');
    } catch (e) {
      Alert.alert('Initialize failed', String(e));
      setInitialized(false);
    } finally {
      setBusy(null);
    }
  };

  const onBookingLoginFlow = async () => {
    if (!isBoltEarthUiSdkAvailable) {
      return;
    }
    if (!initialized) {
      Alert.alert('Not initialized', 'Tap “Initialize SDK” first.');
      return;
    }
    setBusy('login');
    try {
      const result = await ensureLoggedIn();
      await refreshSession();
      if (result.type === 'success') {
        Alert.alert('Login / session', 'Success (ensureLoggedIn).');
      } else {
        Alert.alert(
          'Login / session',
          result.errorMessage ?? result.type ?? 'Unknown result',
        );
      }
    } catch (e) {
      Alert.alert('ensureLoggedIn failed', String(e));
    } finally {
      setBusy(null);
    }
  };

  const onOpenBookingsList = async () => {
    if (!isBoltEarthUiSdkAvailable) {
      return;
    }
    if (!initialized) {
      Alert.alert('Not initialized', 'Tap “Initialize SDK” first.');
      return;
    }
    setBusy('list');
    try {
      await openUsersBookingsList();
    } catch (e) {
      Alert.alert('openUsersBookingsList failed', String(e));
    } finally {
      setBusy(null);
    }
  };

  const onOpenChargerBooking = async () => {
    if (!isBoltEarthUiSdkAvailable) {
      return;
    }
    if (!initialized) {
      Alert.alert('Not initialized', 'Tap “Initialize SDK” first.');
      return;
    }
    setBusy('charger');
    try {
      await openChargerBookingFlow();
    } catch (e) {
      Alert.alert('openChargerBookingFlow failed', String(e));
    } finally {
      setBusy(null);
    }
  };

  const palette = isDark ? colors.dark : colors.light;
  const disabled = busy != null;

  if (Platform.OS !== 'android') {
    return (
      <View
        style={[
          styles.centered,
          { paddingTop: safeAreaInsets.top, backgroundColor: palette.bg },
        ]}>
        <Text style={[styles.title, { color: palette.text }]}>
          Bolt Earth UI SDK
        </Text>
        <Text style={[styles.hint, { color: palette.muted }]}>
          The native bridge module is only wired on Android in this sample app.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: palette.bg }]}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: safeAreaInsets.top + 12,
          paddingBottom: safeAreaInsets.bottom + 24,
        },
      ]}
      keyboardShouldPersistTaps="handled">
      <Text style={[styles.title, { color: palette.text }]}>
        Bolt Earth UI SDK
      </Text>
      <Text style={[styles.hint, { color: palette.muted }]}>
        Initialize with your backend user id and token, then open the booking
        login or listings screens.
      </Text>

      {!isBoltEarthUiSdkAvailable ? (
        <Text style={[styles.warn, { color: palette.warn }]}>
          Native module BoltEarthUiSdk was not found. Rebuild the Android app.
        </Text>
      ) : null}

      <Label palette={palette} text="User id" />
      <TextInput
        value={userId}
        onChangeText={setUserId}
        placeholder="userId from your app / backend"
        placeholderTextColor={palette.muted}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!disabled}
        style={[styles.input, { color: palette.text, borderColor: palette.border }]}
      />

      <Label palette={palette} text="SDK token" />
      <TextInput
        value={sdkToken}
        onChangeText={setSdkToken}
        placeholder="sdkToken"
        placeholderTextColor={palette.muted}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        editable={!disabled}
        style={[styles.input, { color: palette.text, borderColor: palette.border }]}
      />

      <Label palette={palette} text="SDK package (optional)" />
      <TextInput
        value={sdkPackage}
        onChangeText={setSdkPackage}
        placeholder="e.g. your application id"
        placeholderTextColor={palette.muted}
        autoCapitalize="none"
        editable={!disabled}
        style={[styles.input, { color: palette.text, borderColor: palette.border }]}
      />

      <Label palette={palette} text="Primary color hex (optional)" />
      <TextInput
        value={primaryColor}
        onChangeText={setPrimaryColor}
        placeholder="#FF5722"
        placeholderTextColor={palette.muted}
        autoCapitalize="none"
        editable={!disabled}
        style={[styles.input, { color: palette.text, borderColor: palette.border }]}
      />

      <View style={styles.row}>
        <Text style={[styles.session, { color: palette.muted }]}>
          Session valid:{' '}
          <Text style={{ color: palette.text }}>
            {sessionValid == null ? '—' : sessionValid ? 'yes' : 'no'}
          </Text>
        </Text>
        <Pressable
          onPress={refreshSession}
          disabled={disabled || !initialized}
          style={({ pressed }) => [
            styles.smallBtn,
            {
              borderColor: palette.border,
              opacity: pressed ? 0.7 : disabled || !initialized ? 0.4 : 1,
            },
          ]}>
          <Text style={{ color: palette.accent, fontWeight: '600' }}>Refresh</Text>
        </Pressable>
      </View>

      <PrimaryButton
        label={busy === 'init' ? 'Initializing…' : 'Initialize SDK'}
        onPress={onInitialize}
        disabled={disabled}
        palette={palette}
      />
      {busy === 'init' ? (
        <ActivityIndicator color={palette.accent} style={styles.spinner} />
      ) : null}

      <Text style={[styles.section, { color: palette.text }]}>Booking flows</Text>

      <PrimaryButton
        label={
          busy === 'login' ? 'Opening login / session…' : 'Booking login / session'
        }
        subtitle="Maps to ensureLoggedIn()"
        onPress={onBookingLoginFlow}
        disabled={disabled}
        palette={palette}
      />
      {busy === 'login' ? (
        <ActivityIndicator color={palette.accent} style={styles.spinner} />
      ) : null}

      <PrimaryButton
        label={busy === 'list' ? 'Opening list…' : 'My bookings (listing)'}
        subtitle="Maps to openUsersBookingsList()"
        onPress={onOpenBookingsList}
        disabled={disabled}
        palette={palette}
      />
      {busy === 'list' ? (
        <ActivityIndicator color={palette.accent} style={styles.spinner} />
      ) : null}

      <PrimaryButton
        label={busy === 'charger' ? 'Opening charger booking…' : 'Charger booking flow'}
        subtitle="Host activity + SDK navigation"
        onPress={onOpenChargerBooking}
        disabled={disabled}
        palette={palette}
      />
      {busy === 'charger' ? (
        <ActivityIndicator color={palette.accent} style={styles.spinner} />
      ) : null}
    </ScrollView>
  );
}

function Label({
  text,
  palette,
}: {
  text: string;
  palette: (typeof colors)['light'];
}) {
  return <Text style={[styles.label, { color: palette.muted }]}>{text}</Text>;
}

function PrimaryButton({
  label,
  subtitle,
  onPress,
  disabled,
  palette,
}: {
  label: string;
  subtitle?: string;
  onPress: () => void;
  disabled: boolean;
  palette: (typeof colors)['light'];
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryBtn,
        {
          backgroundColor: palette.accent,
          opacity: pressed ? 0.88 : disabled ? 0.45 : 1,
        },
      ]}>
      <Text style={styles.primaryBtnText}>{label}</Text>
      {subtitle ? (
        <Text style={styles.primaryBtnSub}>{subtitle}</Text>
      ) : null}
    </Pressable>
  );
}

const colors = {
  light: {
    bg: '#F5F5F7',
    text: '#111',
    muted: '#666',
    border: '#C7C7CC',
    accent: '#007AFF',
    warn: '#C62828',
  },
  dark: {
    bg: '#0c0c0e',
    text: '#f2f2f7',
    muted: '#98989d',
    border: '#3a3a3c',
    accent: '#0A84FF',
    warn: '#FF453A',
  },
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  warn: { fontSize: 14, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  session: { fontSize: 14, flex: 1 },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryBtnSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 4,
  },
  spinner: { marginTop: 8 },
});

export default App;
