<template>
  <div class="sidebar_wrapper">
    <el-menu class="my-el-menu" background-color="transparent" text-color="#E0E0E0"
      active-text-color="#00AFFF" @select="handleSelect">

      <el-submenu index="draw">
        <template slot="title">
          <i class="el-icon-s-operation"></i>
          <span>图形绘制</span>
        </template>

        <el-submenu v-for="item in graph" :key="item.value" :index="'draw-' + item.value">
          <template slot="title">
            <img :src="require(`@/assets/icons/${item.value}.svg`)" alt="">
            <span>{{ item.label }}</span>
          </template>
          <el-menu-item :index="'draw-' + item.value + '-direct'">
            <i class="el-icon-edit-outline"></i>
            <span>直接绘制</span>
          </el-menu-item>
          <el-menu-item :index="'draw-' + item.value + '-interact'">
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
      graph: [
        { label: '点', value: 'point' },
        { label: '弧线', value: 'arc' },
        { label: '曲线', value: 'curve' },
        { label: '折线', value: 'polyline' },
        { label: '自由线', value: 'freeHandPolyline' },
        { label: '圆', value: 'circle' },
        { label: '椭圆', value: 'ellipse' },
        { label: '弓形', value: 'lune' },
        { label: '扇形', value: 'sector' },
        { label: '矩形', value: 'rectangle' },
        { label: '曲线面', value: 'closedCurve' },
        { label: '多边形', value: 'polygon' },
        { label: '自由面', value: 'freeHandPolygon' },
        { label: '聚集地', value: 'gatheringPlace' },
        { label: '钳击', value: 'doubleArrow' },
        { label: '直箭头', value: 'straightArrow' },
        { label: '细直箭头', value: 'fineArrow' },
        { label: '突击方向', value: 'assaultDirection' },
        { label: '进攻方向', value: 'attackArrow' },
        { label: '进攻方向（尾）', value: 'tailedAttackArrow' },
        { label: '分队战斗行动', value: 'squadCombat' },
        { label: '分队战斗行动（尾）', value: 'tailedSquadCombat' }
      ]
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

<style lang="scss">
.my-el-menu {
  overflow-x: hidden;
  overflow-y: auto;

  img {
    width: 32px;
    height: 32px;
    padding-right: 8px;
  }
}
</style>