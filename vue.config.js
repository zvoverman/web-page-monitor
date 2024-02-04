const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  publicPath: '/client',
  transpileDependencies: true,

  // configureWebpack is used to extend webpack configuration
  configureWebpack: {
    entry: {
      app: './client/src/main.js',
    },
  },
});
