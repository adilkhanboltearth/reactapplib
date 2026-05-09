# Bolt Earth React Native SDK (`@boltearth/react-native-sdk`)

Android-only React Native library: TypeScript API in `src/` plus the native module in `android/`. There is no iOS implementation in this package.

## Consuming the library

Add the dependency (from npm, a private registry, or a packed tarball), then wire the Android Gradle module and host app requirements (Hilt, data binding, Bolt Earth UI SDK Maven coordinates, etc.) per your integration guide.

```json
{
  "dependencies": {
    "@boltearth/react-native-sdk": "^1.0.0"
  }
}
```

The published npm artifact includes `src/`, `android/build.gradle`, and `android/src/` (see `package.json` → `files`).

## Local development (`example/`)

The `example/` app is an Android-only host for manual testing. Symlinking the parent folder as a dependency can break resource merging on some AGP versions, so the example depends on a tarball produced at the repo root:

```sh
npm install          # root: TypeScript only
npm pack             # creates boltearth-react-native-sdk-1.0.0.tgz at repo root
cd example && npm install && npm run android
```

Metro resolves JavaScript from the repo root (`extraNodeModules`); after native Kotlin changes, run `npm pack` again and reinstall in `example/`.
