const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  reactScriptsVersion: 'react-scripts',
  typescript: {
    enableTypeChecking: false,
  },
  webpack: {
    plugins: {
      add: [new NodePolyfillPlugin()],
    },
    configure: {
      resolve: {
        fallback: {
          path: require.resolve('path-browserify'),
          fs: false,
        },
      },
    },
  },
};
