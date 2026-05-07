const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/learncesium/',
  devServer: {
    port: 9527
  }
})
