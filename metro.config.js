const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Exclude .cache directories from Metro's watch list
config.projectRoot = __dirname;

// Add blocklist for cache directories
const baseBlockList = config.resolver?.blockList || [];
const cacheBlockList = [
  /node_modules\/.*\.cache\/.*/,
  /\.cache\/.*/,
  /\.metro-health-check\/.*/,
];

config.resolver = {
  ...config.resolver,
  blockList: [...baseBlockList, ...cacheBlockList],
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
  forceWriteFileSystem: true,
});
