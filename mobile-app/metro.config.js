const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  stream: require.resolve('stream-browserify'),
  buffer: require.resolve('buffer'),
  events: require.resolve('events'),
  process: require.resolve('process'),
  util: require.resolve('util'),
  // Silence @noble/hashes subpath warning by aliasing to exported entry
  '@noble/hashes/crypto.js': require.resolve('@noble/hashes/crypto'),
};

module.exports = config;
