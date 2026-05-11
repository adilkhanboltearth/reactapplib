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
  initialize,
  isBoltEarthUiSdkAvailable,
  logout,
  openChargerBookingFlow,
  openUsersBookingsList,
} from '@boltearth/react-native-sdk';

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

  const [userId, setUserId] = useState('');
  const [sdkToken, setSdkToken] = useState('');
  const [sdkPackage, setSdkPackage] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [busy, setBusy] = useState<
    'init' | 'logout' | 'list' | 'charger' | null
  >(null);

  const onInitialize = useCallback(async () => {
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
      setInitialized(true);
      Alert.alert('SDK ready', 'Initialized.');
    } catch (e) {
      Alert.alert('Initialize failed', String(e));
      setInitialized(false);
    } finally {
      setBusy(null);
    }
  }, [userId, sdkToken, sdkPackage, primaryColor]);

  const onLogout = useCallback(async () => {
    if (!isBoltEarthUiSdkAvailable || !initialized) {
      return;
    }
    setBusy('logout');
    try {
      const result = await logout();
      if (result.type === 'success') {
        Alert.alert('Logout', 'Session cleared.');
      } else {
        Alert.alert(
          'Logout',
          result.errorMessage ?? result.type ?? 'Unknown result',
        );
      }
    } catch (e) {
      Alert.alert('logout failed', String(e));
    } finally {
      setBusy(null);
    }
  }, [initialized]);

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
        Initialize with your backend user id and token, then open booking
        screens. Login gates run inside the native SDK when needed.
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

      <PrimaryButton
        label={busy === 'init' ? 'Initializing…' : 'Initialize SDK'}
        onPress={onInitialize}
        disabled={disabled}
        palette={palette}
      />
      {busy === 'init' ? (
        <ActivityIndicator color={palette.accent} style={styles.spinner} />
      ) : null}

      <Text style={[styles.section, { color: palette.text }]}>Session</Text>

      <PrimaryButton
        label={busy === 'logout' ? 'Logging out…' : 'Logout (native)'}
        subtitle="Clears tokens and SDK caches on device"
        onPress={onLogout}
        disabled={disabled || !initialized}
        palette={palette}
      />
      {busy === 'logout' ? (
        <ActivityIndicator color={palette.accent} style={styles.spinner} />
      ) : null}

      <Text style={[styles.section, { color: palette.text }]}>Booking flows</Text>

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
        subtitle="Maps to openChargerBookingFlow()"
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
