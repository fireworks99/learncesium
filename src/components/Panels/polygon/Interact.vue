<template>
  <Layout :panel_show.sync="panel_show" title="多边形绘制-交互绘制">
    <el-tabs v-model="activeName" type="card">

      <!-- 1. 新增 -->
      <el-tab-pane label="新增" name="insert">
        <div style="text-align: center; margin-bottom: 8px;">
          <el-button type="primary" @click="start">开始绘制</el-button>
        </div>

        <Collapse title="代码">
          <CodeBrower :code="createScript" language="javascript" />
        </Collapse>
      </el-tab-pane>

      <!-- 2. 编辑 -->
      <el-tab-pane label="编辑" name="update">

      </el-tab-pane>

      <!-- 3. 删除 -->
      <el-tab-pane label="删除" name="delete">
        <div style="text-align: center; margin-bottom: 8px;">
          <el-button @click="clear">删除</el-button>
        </div>
        
        <Collapse title="代码">
          <CodeBrower :code="deleteScript" language="javascript" />
        </Collapse>
      </el-tab-pane>

    </el-tabs>
  </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue';
import CodeBrower from '@/components/CodeBrower.vue';
import Collapse from '@/components/Collapse.vue';
import { createScript, deleteScript } from './script';
import { mapState } from 'vuex';

let state = -1;             // 1 => 创建中, 2 => 编辑中, -1 => 静止态
let handler = null;         // 创建用到的handler
let modifyHandler = null;   // 编辑用到的handler
let pointList = [];         // 所有点
let floatPoint = null;      // 当前移动点
let entity = null;          // 绘制过程中的动态载体
let primitive = null;       // 绘制结束得到的结果载体

const img = `data:image/svg+xml;base64,
  PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/
  PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBT
  VkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBo
  aWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIx
  Nzc4MDY0MDg2Nzc2IiBjbGFzcz0iaWNvbiIgdmlld0JveD0i
  MCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0i
  aHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE1
  Mjk4IiB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHhtbG5zOnhs
  aW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48
  cGF0aCBkPSJNNTEyIDUxMm0tNTEyIDBhNTEyIDUxMiAwIDEg
  MCAxMDI0IDAgNTEyIDUxMiAwIDEgMC0xMDI0IDBaIiBmaWxs
  PSJyZWQiIHAtaWQ9IjE1Mjk5Ij48L3BhdGg+PHBhdGggZD0i
  TTUxMiA1MTJtLTI1NiAwYTI1NiAyNTYgMCAxIDAgNTEyIDAg
  MjU2IDI1NiAwIDEgMC01MTIgMFoiIGZpbGw9InllbGxvdyIg
  cC1pZD0iMTUzMDAiPjwvcGF0aD48L3N2Zz4=`;

// 移除相关handler
function clearHandlers() {
  if (handler) {
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    handler.destroy();
    handler = null;
  }
  if (modifyHandler) {
    modifyHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    modifyHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    modifyHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    modifyHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    modifyHandler.destroy();
    modifyHandler = null;
  }
}

// 动态点
function createPoint(cartesian) {
  if (!viewer.billboards) {
    viewer.billboards = viewer.scene.primitives.add(
      new Cesium.BillboardCollection({ scene: viewer.scene })
    );
  }
  return viewer.billboards.add({
    position: cartesian,
    image: img,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  })
}

// 过程载体
function createEntity() {

  // 动态线
  const linePositions = new Cesium.CallbackProperty(() => {
    return pointList.length < 3 ? [...pointList] : [...pointList, pointList[0]];
  }, false);

  // 动态面
  const polygonHierarchy = new Cesium.CallbackProperty(() => {
    return new Cesium.PolygonHierarchy([...pointList]);
  }, false);

  return viewer.entities.add({
    polyline: new Cesium.PolylineGraphics({
      positions: linePositions,
      width: 2,
      material: Cesium.Color.RED,
      clampToGround: true,
    }),

    polygon: new Cesium.PolygonGraphics({
      hierarchy: polygonHierarchy,
      material: Cesium.Color.SNOW.withAlpha(0.7),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      show: new Cesium.CallbackProperty(() => {
        return pointList.length >= 3;
      }, false),
    }),
  });

}

// 最终载体
function showPrimitiveOnMap() {

  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(pointList),
    })
  });

  return viewer.scene.groundPrimitives.add(
    new Cesium.GroundPrimitive({
      geometryInstances: instance,
      appearance: new Cesium.Appearance({
        material: Cesium.Material.fromType("Color", {
          color: Cesium.Color.SNOW.withAlpha(0.7)
        }),
      })
    })
  );

}

// 开始绘制
function startDraw() {
  state = 1;

  if (handler) {
    handler.destroy();
    handler = null;
  }
  handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

  // 左键单击 => 确定各点
  handler.setInputAction((evt) => {

    const ray = viewer.camera.getPickRay(evt.position);
    const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    if (!cartesian) return;
    pointList.push(cartesian.clone());

  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // 鼠标移动 => 满足条件则动态绘制
  handler.setInputAction((evt) => {

    const ray = viewer.camera.getPickRay(evt.endPosition);
    const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    if (!cartesian) return;

    // 动态点的物理载体
    if (floatPoint) floatPoint.position = cartesian.clone();
    else floatPoint = createPoint(cartesian.clone());

    // 动态点的数据载体
    if (pointList.length === 1) pointList.push(cartesian.clone());

    // 若点击了一次就创建entity使用callback进行数据更新
    if (pointList.length === 2 && !entity) {
      entity = createEntity();
    } else {
      // 当鼠标移动时，修改最后一个值
      if (pointList.length >= 2) {
        pointList.splice(pointList.length - 1, 1, cartesian.clone());
      }
    }

  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // 左键双击 => 完成绘制
  handler.setInputAction((evt) => {

    if (pointList.length < 3) return;
    state = -1;
    primitive = showPrimitiveOnMap();

    // 清理工作
    viewer.billboards.remove(floatPoint);
    floatPoint = null;
    viewer.entities.remove(entity);
    entity = null;
    clearHandlers();

  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

  // 右键单击 => 取消绘制
  handler.setInputAction((evt) => {
    clearDraw();
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

}

// 取消绘制 && 清除绘制
function clearDraw() {
  state = -1;
  clearHandlers();
  pointList = [];
  if (floatPoint) {
    viewer.billboards.remove(floatPoint);
    floatPoint = null;
  }
  if (entity) {
    viewer.entities.remove(entity);
    entity = null;
  }
  if (primitive) {
    viewer.scene.groundPrimitives.remove(primitive);
    primitive = null;
  }
}

export default {
  name: 'PolygonInteract',
  components: {
    Layout,
    CodeBrower,
    Collapse
  },
  data() {
    return {
      panel_show: false,
      activeName: 'insert',
      createScript,
      deleteScript
    }
  },
  computed: {
    ...mapState(['curSelect'])
  },
  watch: {
    curSelect(val) {
      val === "draw-polygon-interact" && (this.panel_show = true);
    }
  },
  beforeDestroy() {
    this.clear();
  },
  methods: {
    clear() {
      clearDraw();
    },

    start() {
      startDraw();
    }

  }// methods end
}
</script>