<template>
  <Layout :panel_show.sync="panel_show" title="曲线面绘制-直接绘制">
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

const curseParams = {
  t: 0.3,
};

// * 获取曲线面坐标
function getClosedCurvePositions(pnts) {
  if (pnts.length == 2 || pnts[1].toString() == pnts[2].toString()) {
    const mid = P.PlotUtils.mid(pnts[0], pnts[1]);
    const d = P.PlotUtils.distance(pnts[0], mid);
    const pnt = P.PlotUtils.getThirdPoint(
      pnts[0],
      mid,
      P.Constants.HALF_PI,
      d,
      true
    );
    pnts.push(pnt);
  }
  pnts.push(pnts[0], pnts[1]);
  let normals = [];
  for (let i = 0; i < pnts.length - 2; i++) {
    const normalPoints = P.PlotUtils.getBisectorNormals(
      curseParams.t,
      pnts[i],
      pnts[i + 1],
      pnts[i + 2]
    );
    normals = normals.concat(normalPoints);
  }
  const count = normals.length;
  normals = [normals[count - 1]].concat(normals.slice(0, count - 1));

  const pList = [];
  for (let i = 0; i < pnts.length - 2; i++) {
    const pnt1 = pnts[i];
    const pnt2 = pnts[i + 1];
    pList.push(pnt1);
    for (let t = 0; t <= P.Constants.FITTING_COUNT; t++) {
      const pnt = P.PlotUtils.getCubicValue(
        t / P.Constants.FITTING_COUNT,
        pnt1,
        normals[i * 2],
        normals[i * 2 + 1],
        pnt2
      );
      pList.push(pnt);
    }
    pList.push(pnt2);
  }
  const cartesianList = [];
  for (let i = 0, len = pList.length; i < len - 1; i++) {
    cartesianList.push(P.PlotUtils.lonLatToCartesian3(pList[i]));
  }
  return cartesianList;
}

function create() {
  clear();

  const res = getClosedCurvePositions(pointList);

  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(res),
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
  name: 'ClosedCurveDirect',
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
        [110, 10],
        [110, 20],
        [115, 15]
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

        const curseParams = {
          t: 0.3,
        };

        // * 获取曲线面坐标
        function getClosedCurvePositions(pnts) {
          if (pnts.length == 2 || pnts[1].toString() == pnts[2].toString()) {
            const mid = P.PlotUtils.mid(pnts[0], pnts[1]);
            const d = P.PlotUtils.distance(pnts[0], mid);
            const pnt = P.PlotUtils.getThirdPoint(
              pnts[0],
              mid,
              P.Constants.HALF_PI,
              d,
              true
            );
            pnts.push(pnt);
          }
          pnts.push(pnts[0], pnts[1]);
          let normals = [];
          for (let i = 0; i < pnts.length - 2; i++) {
            const normalPoints = P.PlotUtils.getBisectorNormals(
              curseParams.t,
              pnts[i],
              pnts[i + 1],
              pnts[i + 2]
            );
            normals = normals.concat(normalPoints);
          }
          const count = normals.length;
          normals = [normals[count - 1]].concat(normals.slice(0, count - 1));

          const pList = [];
          for (let i = 0; i < pnts.length - 2; i++) {
            const pnt1 = pnts[i];
            const pnt2 = pnts[i + 1];
            pList.push(pnt1);
            for (let t = 0; t <= P.Constants.FITTING_COUNT; t++) {
              const pnt = P.PlotUtils.getCubicValue(
                t / P.Constants.FITTING_COUNT,
                pnt1,
                normals[i * 2],
                normals[i * 2 + 1],
                pnt2
              );
              pList.push(pnt);
            }
            pList.push(pnt2);
          }
          const cartesianList = [];
          for (let i = 0, len = pList.length; i < len - 1; i++) {
            cartesianList.push(P.PlotUtils.lonLatToCartesian3(pList[i]));
          }
          return cartesianList;
        }

        function create() {
          clear();

          const res = getClosedCurvePositions(pointList);

          const instance = new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
              polygonHierarchy: new Cesium.PolygonHierarchy(res),
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
      return parseFloat(innerHeight) - 488;
    }
  },
  watch: {
    curSelect(val) {
      val === "draw-closedCurve-direct" && (this.panel_show = true);
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