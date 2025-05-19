// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.assetExts.push('db', 'sqlite', 'png', 'jpg', 'jpeg', 'webp');
config.resolver.sourceExts.push('svg');

module.exports = config;
