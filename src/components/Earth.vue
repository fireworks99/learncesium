<template>
  <div id="cesium_container">

    <el-popover placement="left" trigger="click" ref="popover">
      <el-button v-for="(item, index) in publicScripts" :key="item.label" :type="item.type" @click="handleScript(index)">
        {{ item.label }}
      </el-button>

      <div class="mock-btn" title="公共脚本" slot="reference">
        <img src="@/assets/images/js.svg" alt="">
      </div>
    </el-popover>

    <CustomDrawer :visible.sync="drawerOpen" :title="curScript?.label">
      <CodeBrower :code="curScript?.value || ''" language="javascript" :maxHeight="maxHeight" />
    </CustomDrawer>

    <RectDirect />
    <RectInteract />

    <PolygonDirect />
    <PolygonInteract />

    <TailedSquadCombatDirect />
    <TailedSquadCombatInteract />

  </div>
</template>

<script>
import { PlotUtilsScript } from "./Panels/tools";
import { useUnfixedScript } from "./Panels/useUnfixed";

export default {
  name: 'Earth',
  components: {
    CustomDrawer: () => import("./CustomDrawer.vue"),
    CodeBrower: () => import("./CodeBrower.vue"),
    RectDirect: () => import("./Panels/rectangle/Direct.vue"),
    RectInteract: () => import("./Panels/rectangle/Interact.vue"),
    PolygonDirect: () => import("./Panels/polygon/Direct.vue"),
    PolygonInteract: () => import("./Panels/polygon/Interact.vue"),
    TailedSquadCombatDirect: () => import("./Panels/tailedSquadCombat/Direct.vue"),
    TailedSquadCombatInteract: () => import("./Panels/tailedSquadCombat/Interact.vue"),
  },

  data() {
    return {
      drawerOpen: false,
      publicScripts: [
        { type: 'success', label: '工具函数 (P.PlotUtils)', value: PlotUtilsScript },
        { type: 'primary', label: '固定点数图形-公共方法', value: '' },
        { type: 'primary', label: '无数点数图形-公共方法', value: useUnfixedScript },
      ],
      curScript: {}
    }
  },

  computed: {
    maxHeight() {
      return parseFloat(innerHeight) - 32 - 16 - 16 * 2 - 44;
    }
  },

  mounted() {
    this.initEarth();
  },

  beforeDestroy() {
    if (window.viewer) {
      window.viewer.destroy();
      window.viewer = null;
    }
  },

  methods: {
    initEarth() {
      Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiY2ExNmYyOC0yYjk5LTRjOGMtYTI0ZC0xZmFmMDAwMzhlZDUiLCJpZCI6NTI1MjgsImlhdCI6MTYxODY2NjE5N30.ETTMOAYLjTMplvAxKehiZCrzT1o2s--bFqREAOSP3fg';
      const viewer = new Cesium.Viewer('cesium_container', {
        infoBox: false,//不设为false会报错
        geocoder: false,//右上角搜索按钮
        navigationHelpButton: false,//右上角帮助按钮
        selectionIndicator: false,//点击后地图上显示的选择控件
        baseLayerPicker: false,//右上角图层选择器
        showRenderLoopErrors: false,//HTML面板中显示错误信息
        fullscreenButton: true,//右下角全屏按钮
        sceneModePicker: true,//右上角2D和3D之间的切换
        scene3DOnly: false, // 改为false以启用2D/3D切换
        timeline: false, // 页面下方的时间条
        homeButton: false,
        animation: false, // 左下角圆盘 速度控制器
        imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
          enablePickFeatures: false,
        }),
        terrainProvider: Cesium.createWorldTerrain({
          requestVertexNormals: true,
          requestWaterMask: true
        })
      });

      //隐藏 商标版权与数据源
      viewer.cesiumWidget.creditContainer.style.display = 'none';

      // 设置相机的初始视图
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(100, 30, 5000000),
      });

      window.viewer = viewer;
    },

    handleScript(idx) {

      this.curScript = this.publicScripts.length > idx ? this.publicScripts[idx] : {};

      // 1. 先让当前活动元素失去焦点，转移到 body 或其他安全元素
      if (document.activeElement && document.activeElement.blur) {
        // 解决 aria-hidden="true" 警告
        document.activeElement.blur();
      }

      // 2. 再关闭 Popover
      this.$refs.popover.doClose();

      // 3. 打开抽屉
      this.drawerOpen = true;
    }
  }// methods end
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

#cesium_container {
  height: 100vh;
  flex: 1;

  .mock-btn {
    position: absolute;
    top: calc(5px + 32px + 8px);
    right: 5px;
    z-index: 1;
    padding: 4px;

    margin: 0 3px;
    width: 32px;
    height: 32px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: #303336;
    border: 1px solid #444;
    border-radius: 14%;
    cursor: pointer;

    &:hover {
      background: #48b;
      border-color: #aef;
      box-shadow: 0 0 8px #fff;
    }

    img {
      width: 100%;
    }
  }
}
</style>