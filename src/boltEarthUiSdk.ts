import { NativeModules, Platform } from 'react-native';

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
  /** Maps to `SdkEnvironment.Production` or `SdkEnvironment.Development` on the native side. */
  environment?: 'production' | 'development';
  primaryColor?: string;
  localeLanguageTag?: string;
  fontOverrides?: FontOverridesInput;
};

export type LogoutResultMap = {
  type: 'success' | 'failure' | 'unknown';
  errorMessage?: string;
  errorClass?: string;
};

/** Mirrors the slim native module — maps to [BoltEarthUiSdk] on Android only. */
type NativeBoltEarthUiSdk = {
  initialize: (config: Record<string, unknown>) => Promise<null>;
  logout: () => Promise<LogoutResultMap>;
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

export function initialize(config: BoltEarthUiSdkInitConfig): Promise<void> {
  const n = requireNative();
  const map: Record<string, unknown> = {
    userId: config.userId,
    sdkToken: config.sdkToken,
    environment: config.environment === 'production' ? 'production' : 'development',
  };
  if (config.primaryColor != null) {
    map.primaryColor = config.primaryColor;
  }
  if (config.localeLanguageTag != null) {
    map.localeLanguageTag = config.localeLanguageTag;
  }
  if (config.fontOverrides != null) {
    map.fontOverrides = config.fontOverrides;
  }
  return n.initialize(map).then(() => undefined);
}

export function logout(): Promise<LogoutResultMap> {
  return requireNative().logout();
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
