<template>
  <div class="sidebar_wrapper">
    <el-menu class="el-menu-vertical-demo" background-color="transparent"
      text-color="#E0E0E0" active-text-color="#00AFFF" @select="handleSelect">

      <el-submenu index="draw">
        <template slot="title">
          <i class="el-icon-s-operation"></i>
          <span>图形绘制</span>
        </template>

        <el-submenu index="draw-rect">
          <template slot="title">
            <i class="el-icon-c-scale-to-original"></i>
            <span>矩形</span>
          </template>
          <el-menu-item index="draw-rect-direct">
            <i class="el-icon-edit-outline"></i>
            <span>直接绘制</span>
          </el-menu-item>
          <el-menu-item index="draw-rect-interact">
            <i class="el-icon-mouse"></i>
            <span>交互绘制</span>
          </el-menu-item>
        </el-submenu>

      </el-submenu>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  data() {
    return {
      
    }
  },
  methods: {
    handleSelect(index, indexPath) {
      this.$store.commit("SET_CUR_SELECT", index);
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/variables.scss';

.sidebar_wrapper {
  width: $sidebar-width;
  background: linear-gradient(135deg, rgba(9, 43, 77, 0.95), rgba(6, 30, 55, 0.98));
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(0, 175, 255, 0.2);
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}
</style>