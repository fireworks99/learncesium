import Vue from 'vue';

// 自动引入 ./modules 目录下所有 .js 文件
const context = require.context('./modules', false, /\.js$/);

context.keys().forEach((fileName) => {
  const directive = context(fileName).default;
  if (directive && directive.name) {
    Vue.directive(directive.name, directive);
  }
});
