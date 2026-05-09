const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

/**
 * JS resolves `@boltearth/react-native-sdk` from the repo root for fast refresh while developing.
 * Native Android still comes from the unpacked tarball under `node_modules` (run `npm pack` in `..` first).
 */
module.exports = mergeConfig(getDefaultConfig(projectRoot), {
  watchFolders: [monorepoRoot],
  resolver: {
    extraNodeModules: {
      '@boltearth/react-native-sdk': monorepoRoot,
    },
  },
});
