<template>
  <div class="home_wrapper">
    <Sidebar />
    <Earth />
    <PosTip />
  </div>
</template>

<script>
import Earth from '@/components/Earth.vue';
import PosTip from '@/components/PosTip.vue';
import Sidebar from '@/components/Sidebar.vue';

export default {
  name: 'Home',
  components: {
    Earth,
    PosTip,
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