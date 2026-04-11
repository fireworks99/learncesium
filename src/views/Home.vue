<template>
  <div class="home_wrapper">
    <Sidebar />
    <Earth />
  </div>
</template>

<script>
import Earth from '@/components/Earth.vue';
import Sidebar from '@/components/Sidebar.vue';

export default {
  name: 'Home',
  components: {
    Earth,
    Sidebar
  },
  data() {
    return {

    }
  }
}
</script>

<style scoped lang="scss">
.home_wrapper {
  display: flex;
}
</style>