import { NativeModules, Platform } from 'react-native';

export type AuthResultMap = {
  type: 'success' | 'failure' | 'unknown';
  errorMessage?: string;
  errorClass?: string;
};

export type FontOverridesInput = {
  light?: number;
  regular?: number;
  medium?: number;
  semiBold?: number;
  bold?: number;
};

export type BoltEarthUiSdkInitConfig = {
  userId: string;
  sdkToken: string;
  sdkPackage?: string;
  primaryColor?: string;
  localeLanguageTag?: string;
  enableNetworkLogging?: boolean;
  fontOverrides?: FontOverridesInput;
};

/** Native methods that use RN Promise bridging (last Promise arg on Android). */
type NativeBoltEarthUiSdk = {
  initialize: (config: Record<string, unknown>) => void;
  setNetworkLoggingEnabled: (enabled: boolean) => void;
  setNetworkLoggingEnabledForContext: (enabled: boolean) => void;
  ensureLoggedIn: () => Promise<AuthResultMap>;
  ensureLoggedInForcingRelogin: () => Promise<AuthResultMap>;
  logout: () => Promise<{
    type: string;
    errorMessage?: string;
    errorClass?: string;
  }>;
  hasValidSession: () => Promise<boolean>;
  applyStatusBarColor: () => Promise<null>;
  tintViewTree: (reactTag: number) => Promise<null>;
  wrapContextWithTheme: () => Promise<null>;
  resetLocalSessionBeforeUserSwitch: () => Promise<null>;
  openUsersBookingsList: () => Promise<null>;
  openChargerBookingFlow: () => Promise<null>;
};

const native = NativeModules.BoltEarthUiSdk as NativeBoltEarthUiSdk | undefined;

export const isBoltEarthUiSdkAvailable =
  Platform.OS === 'android' && native != null;

function requireNative(): NativeBoltEarthUiSdk {
  if (!native) {
    throw new Error(
      'BoltEarthUiSdk native module is only available on Android in this project.',
    );
  }
  return native;
}

export function initialize(config: BoltEarthUiSdkInitConfig): void {
  const n = requireNative();
  const map: Record<string, unknown> = {
    userId: config.userId,
    sdkToken: config.sdkToken,
  };
  if (config.sdkPackage != null) {
    map.sdkPackage = config.sdkPackage;
  }
  if (config.primaryColor != null) {
    map.primaryColor = config.primaryColor;
  }
  if (config.localeLanguageTag != null) {
    map.localeLanguageTag = config.localeLanguageTag;
  }
  if (config.enableNetworkLogging != null) {
    map.enableNetworkLogging = config.enableNetworkLogging;
  }
  if (config.fontOverrides != null) {
    map.fontOverrides = config.fontOverrides;
  }
  n.initialize(map);
}

export function ensureLoggedIn(): Promise<AuthResultMap> {
  return requireNative().ensureLoggedIn();
}

export function ensureLoggedInForcingRelogin(): Promise<AuthResultMap> {
  return requireNative().ensureLoggedInForcingRelogin();
}

export function openUsersBookingsList(): Promise<void> {
  return requireNative()
    .openUsersBookingsList()
    .then(() => undefined);
}

export function openChargerBookingFlow(): Promise<void> {
  return requireNative()
    .openChargerBookingFlow()
    .then(() => undefined);
}

export function hasValidSession(): Promise<boolean> {
  return requireNative().hasValidSession();
}

export function wrapContextWithTheme(): Promise<void> {
  return requireNative()
    .wrapContextWithTheme()
    .then(() => undefined);
}
