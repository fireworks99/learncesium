<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    document.documentElement.classList.add("dark");//element暗黑模式
  },
  beforeDestroy() {
    document.documentElement.classList.remove("dark");
  }
}
</script>