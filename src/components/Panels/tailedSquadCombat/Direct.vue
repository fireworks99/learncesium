<template>
  <Layout :panel_show.sync="panel_show" title="分队战斗行动（尾）绘制-直接绘制">
    <el-tabs v-model="activeName" type="card">

      <!-- 1. 新增 -->
      <el-tab-pane label="新增" name="insert">
        <div style="margin-bottom: 16px;">
          <PolygonRange :pointList.sync="pointList" @confirm="create" />
        </div>

        <Collapse title="①工具函数 + ②以下代码，即可完成创建">
          <CodeBrower :code="createScript" language="javascript" :max-height="maxHeight"/>
        </Collapse>
      </el-tab-pane>

      <!-- 2. 删除 -->
      <el-tab-pane label="删除" name="delete">
        <div style="text-align: center; margin-bottom: 8px;">
          <el-button type="danger" @click="clear">删除</el-button>
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
import PolygonRange from '@/components/PolygonRange.vue';
import Collapse from '@/components/Collapse.vue';
import { mapState } from 'vuex';
import { P } from '../tools';

let primitive = null;
let pointList = [];

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

function create() {
  clear();

  const res = getTailedSquadCombat(pointList);

  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(res)
    })
  });

  primitive = viewer.scene.groundPrimitives.add(
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

function clear() {
  if (primitive) {
    viewer.scene.groundPrimitives.remove(primitive);
    primitive = null;
  }
}

export default {
  name: 'TailedSquadCombatDirect',
  components: {
    Layout,
    CodeBrower,
    PolygonRange,
    Collapse
  },
  data() {
    return {
      panel_show: false,
      activeName: 'insert',
      pointList: [
        [110, 24],
        [120, 28],
        [130, 20]
      ]
    }
  },
  computed: {
    ...mapState(['curSelect']),

    createScript() {
      let s = "";
      this.pointList.forEach(item => {
        s += `[${item[0]}, ${item[1]}],`;
      });
      return `
        let primitive = null;
        let pointList = [${s}];
        
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

        function create() {
          clear();

          const res = getTailedSquadCombat(pointList);

          const instance = new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
              polygonHierarchy: new Cesium.PolygonHierarchy(res)
            })
          });

          primitive = viewer.scene.groundPrimitives.add(
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

        function clear() {
          if (primitive) {
            viewer.scene.groundPrimitives.remove(primitive);
            primitive = null;
          }
        }

        create();
      `;
    },

    deleteScript() {
      return `
        function clear() {
          if (primitive) {
            viewer.scene.groundPrimitives.remove(primitive);
            primitive = null;
          }
        }
        clear();
      `;
    },

    maxHeight() {
      return parseFloat(innerHeight) - 450;
    }
  },
  watch: {
    curSelect(val) {
      val === "draw-tailedSquadCombat-direct" && (this.panel_show = true);
    }
  },
  beforeDestroy() {
    this.clear();
  },
  methods: {
    create() {
      pointList = [...this.pointList];
      create();
    },
    clear() {
      clear();
    }

  }// methods end
}
</script>