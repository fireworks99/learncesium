<template>
  <Layout :panel_show.sync="panel_show" title="分队战斗行动（尾）绘制-交互绘制">
    <el-tabs v-model="activeName" type="card">
      <!-- 1. 新增 -->
      <el-tab-pane label="新增" name="insert">
        <div style="text-align: center; margin-bottom: 8px;">
          <el-button type="primary" @click="create">开始绘制</el-button>
        </div>
      </el-tab-pane>

      <!-- 2. 编辑 -->
      <el-tab-pane label="编辑" name="update">

      </el-tab-pane>

      <!-- 3. 删除 -->
      <el-tab-pane label="删除" name="delete">

      </el-tab-pane>
    </el-tabs>
  </Layout>
</template>

<script>
import Layout from '@/components/Layout.vue';
import CodeBrower from '@/components/CodeBrower.vue';
import Collapse from '@/components/Collapse.vue';
import { mapState } from 'vuex';

import { P } from '../tools';
let state = -1;             // 1 => 创建中, 2 => 编辑中, -1 => 静止态
let handler = null;         // 创建用到的handler
let modifyHandler = null;   // 编辑用到的handler
let pointList = [];         // 所有点
let floatPoint = null;      // 当前移动点
let entity = null;          // 绘制过程中的动态载体
let primitive = null;       // 绘制结束得到的结果载体
let floatPointArr = [];     // 编辑时用到的浮动点
let step = -1;              // 编辑时浮动点的下标

let minPointsNum = 2;       // 最少能满足条件的点

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

const attackArrowParams = {
  headHeightFactor: 0.18,
  headWidthFactor: 0.3,
  neckHeightFactor: 0.85,
  neckWidthFactor: 0.15,
  headTailFactor: 0.8,
  tailWidthFactor: 0.1,
  swallowTailFactor: 1,
};

const squadCombatParams = {
  headHeightFactor: 0.18,
  headWidthFactor: 0.3,
  neckHeightFactor: 0.85,
  neckWidthFactor: 0.15,
  tailWidthFactor: 0.1,
  swallowTailFactor: 1,
};

// 获取 进攻方向 箭头坐标
function getAttackArrowHeadPoints(points, tailLeft, tailRight) {
  let len = P.PlotUtils.getBaseLength(points);
  let headHeight = len * attackArrowParams.headHeightFactor;
  const headPnt = points[points.length - 1];
  len = P.PlotUtils.distance(headPnt, points[points.length - 2]);
  const tailWidth = P.PlotUtils.distance(tailLeft, tailRight);
  if (headHeight > tailWidth * attackArrowParams.headTailFactor) {
    headHeight = tailWidth * attackArrowParams.headTailFactor;
  }
  const headWidth = headHeight * attackArrowParams.headWidthFactor;
  const neckWidth = headHeight * attackArrowParams.neckWidthFactor;
  headHeight = headHeight > len ? len : headHeight;
  const neckHeight = headHeight * attackArrowParams.neckHeightFactor;
  const headEndPnt = P.PlotUtils.getThirdPoint(
    points[points.length - 2],
    headPnt,
    0,
    headHeight,
    true
  );
  const neckEndPnt = P.PlotUtils.getThirdPoint(
    points[points.length - 2],
    headPnt,
    0,
    neckHeight,
    true
  );
  const headLeft = P.PlotUtils.getThirdPoint(
    headPnt,
    headEndPnt,
    P.Constants.HALF_PI,
    headWidth,
    false
  );
  const headRight = P.PlotUtils.getThirdPoint(
    headPnt,
    headEndPnt,
    P.Constants.HALF_PI,
    headWidth,
    true
  );
  const neckLeft = P.PlotUtils.getThirdPoint(
    headPnt,
    neckEndPnt,
    P.Constants.HALF_PI,
    neckWidth,
    false
  );
  const neckRight = P.PlotUtils.getThirdPoint(
    headPnt,
    neckEndPnt,
    P.Constants.HALF_PI,
    neckWidth,
    true
  );
  return [neckLeft, headLeft, headPnt, headRight, neckRight];
}

// 获取 进攻方向 箭身坐标
function getAttackArrowBodyPoints(points, neckLeft, neckRight, tailWidthFactor) {
  const allLen = P.PlotUtils.wholeDistance(points);
  const len = P.PlotUtils.getBaseLength(points);
  const tailWidth = len * tailWidthFactor;
  const neckWidth = P.PlotUtils.distance(neckLeft, neckRight);
  const widthDif = (tailWidth - neckWidth) / 2;
  let tempLen = 0;
  const leftBodyPnts = [],
    rightBodyPnts = [];
  for (let i = 1; i < points.length - 1; i++) {
    const angle =
      P.PlotUtils.getAngleOfThreePoints(
        points[i - 1],
        points[i],
        points[i + 1]
      ) / 2;
    tempLen += P.PlotUtils.distance(points[i - 1], points[i]);
    const w =
      (tailWidth / 2 - (tempLen / allLen) * widthDif) / Math.sin(angle);
    const left = P.PlotUtils.getThirdPoint(
      points[i - 1],
      points[i],
      Math.PI - angle,
      w,
      true
    );
    const right = P.PlotUtils.getThirdPoint(
      points[i - 1],
      points[i],
      angle,
      w,
      false
    );
    leftBodyPnts.push(left);
    rightBodyPnts.push(right);
  }
  return leftBodyPnts.concat(rightBodyPnts);
}

// 获取 分队战斗行动（尾）——尾点
function getTailedTailPoints(points) {
  const allLen = P.PlotUtils.getBaseLength(points);
  const tailWidth = allLen * squadCombatParams.tailWidthFactor;
  const tailLeft = P.PlotUtils.getThirdPoint(
    points[1],
    points[0],
    P.Constants.HALF_PI,
    tailWidth,
    false
  );
  const tailRight = P.PlotUtils.getThirdPoint(
    points[1],
    points[0],
    P.Constants.HALF_PI,
    tailWidth,
    true
  );
  const len = tailWidth * squadCombatParams.swallowTailFactor;
  const swallowTailPnt = P.PlotUtils.getThirdPoint(
    points[1],
    points[0],
    0,
    len,
    true
  );
  return [tailLeft, swallowTailPnt, tailRight];
}

// 获取 分队战斗行动（尾）——坐标
function getTailedSquadCombat(pnts) {
  const tailPnts = getTailedTailPoints(pnts);
  const headPnts = getAttackArrowHeadPoints(
    pnts,
    tailPnts[0],
    tailPnts[2]
  );
  const neckLeft = headPnts[0];
  const neckRight = headPnts[4];
  const bodyPnts = getAttackArrowBodyPoints(
    pnts,
    neckLeft,
    neckRight,
    squadCombatParams.tailWidthFactor
  );
  const count = bodyPnts.length;
  let leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, count / 2));
  leftPnts.push(neckLeft);
  let rightPnts = [tailPnts[2]].concat(bodyPnts.slice(count / 2, count));
  rightPnts.push(neckRight);

  leftPnts = P.PlotUtils.getQBSplinePoints(leftPnts);
  rightPnts = P.PlotUtils.getQBSplinePoints(rightPnts);
  const positions = leftPnts.concat(headPnts, rightPnts.reverse(), [
    tailPnts[1],
    leftPnts[0],
  ]);

  const res = [];
  positions.forEach(pos => {
    res.push(P.PlotUtils.lonLatToCartesian3(pos));
  });

  return res;
}

// 过程载体
function createEntity() {

  const update = () => {

    const arr = [];
    for (let i = 0; i < pointList.length; ++i) {
      const lonLat = P.PlotUtils.cartesian3ToLonLat(pointList[i]);
      arr.push(lonLat);
    }

    // 预处理点集
    if (arr.length === 2) {
      arr.push([arr[1][0] + 1e-7, arr[1][1]]);
    } else if (
      arr[arr.length - 1].toString() ===
      arr[arr.length - 2].toString() &&
      arr.length > 3
    ) {
      arr.pop();
    } else {
      arr[arr.length - 1][0] += 1e-7;
    }

    // 计算图形
    const res = getTailedSquadCombat(arr);
    return new Cesium.PolygonHierarchy(res);
  };

  return viewer.entities.add({
    polygon: {
      hierarchy: new Cesium.CallbackProperty(update, false),
      material: Cesium.Color.SNOW.withAlpha(0.7),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
  });

}

// 最终载体
function showPrimitiveOnMap() {

  const arr = [];
  for (let i = 0; i < pointList.length; ++i) {
    const lonLat = P.PlotUtils.cartesian3ToLonLat(pointList[i]);
    arr.push(lonLat);
  }
  const res = getTailedSquadCombat(arr);

  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(res)
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

  clearDraw();
  state = 1;
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

    if (pointList.length < minPointsNum) return;

    // 删除双击带来的两个重复点
    pointList.splice(pointList.length - 2, 2);

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

  if (floatPointArr) {
    floatPointArr.forEach(p => {
      viewer.billboards.remove(p);
    });
    floatPointArr = [];
  }
}

export default {
  name: 'TailedSquadCombatInteract',
  components: {
    Layout,
    CodeBrower,
    Collapse
  },
  data() {
    return {
      panel_show: false,
      activeName: 'insert',
    }
  },
  computed: {
    ...mapState(['curSelect', 'stopLast'])
  },
  watch: {
    curSelect(val) {
      val === "draw-tailedSquadCombat-interact" && (this.panel_show = true);
    }
  },
  beforeDestroy() {
    this.clear();
  },
  methods: {
    clear() {
      // clearDraw();
    },

    create() {
      this.stopLast && this.stopLast();
      this.$store.commit("SET_STOP_LAST", this.clear);
      startDraw();
    },

    update() {
      // startModify();
    }

  }// methods end
}
</script>