<template>
  <div id="cesium_container">

    <RectDirect />
    <RectInteract />

  </div>
</template>

<script>
export default {
  name: 'Earth',
  components: {
    RectDirect: () => import("./Panels/RectDirect.vue"),
    RectInteract: () => import("./Panels/RectInteract.vue")
  },
  mounted() {
    this.initEarth();
  },
  beforeDestroy() {

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
        sceneModePicker: false,//右上角2D和3D之间的切换
        scene3DOnly: true, // 如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
        timeline: false, // 页面下方的时间条
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

    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/variables.scss';

#cesium_container {
  height: 100vh;
  flex: 1;
}
</style>