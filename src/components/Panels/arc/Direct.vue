<template>
  <Layout :panel_show.sync="panel_show" title="弧线绘制-直接绘制">
    <el-tabs v-model="activeName" type="card">

      <!-- 1. 新增 -->
      <el-tab-pane label="新增" name="insert">
        <div style="margin-bottom: 16px;">
          <PolygonRange :pointList.sync="pointList" @confirm="create" :fixed="true"/>
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
import { P } from "../tools";

let primitive = null;
let pointList = [];

// * 获取弧线坐标
function getArcPositions(pnt1, pnt2, pnt3) {
  const center = P.PlotUtils.getCircleCenterOfThreePoints(pnt1, pnt2, pnt3);
  const radius = P.PlotUtils.distance(pnt1, center);
  const angle1 = P.PlotUtils.getAzimuth(pnt1, center);
  const angle2 = P.PlotUtils.getAzimuth(pnt2, center);
  let startAngle, endAngle;
  if (P.PlotUtils.isClockWise(pnt1, pnt2, pnt3)) {
    startAngle = angle2;
    endAngle = angle1;
  } else {
    startAngle = angle1;
    endAngle = angle2;
  }
  return P.PlotUtils.getArcPoints(center, radius, startAngle, endAngle);
}

function create() {
  clear();

  const res = getArcPositions(...pointList);

  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.GroundPolylineGeometry({
      positions: res,
      width: 2,
    })
  });

  primitive = viewer.scene.groundPrimitives.add(
    new Cesium.GroundPolylinePrimitive({
      geometryInstances: instance,
      appearance: new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType("Color", {
          color: Cesium.Color.SNOW.withAlpha(0.7)
        })
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
  name: 'ArcDirect',
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
        [100, 30],
        [110, 30],
        [106, 35],
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
        
        // * 获取弧线坐标
        function getArcPositions(pnt1, pnt2, pnt3) {
          const center = P.PlotUtils.getCircleCenterOfThreePoints(pnt1, pnt2, pnt3);
          const radius = P.PlotUtils.distance(pnt1, center);
          const angle1 = P.PlotUtils.getAzimuth(pnt1, center);
          const angle2 = P.PlotUtils.getAzimuth(pnt2, center);
          let startAngle, endAngle;
          if (P.PlotUtils.isClockWise(pnt1, pnt2, pnt3)) {
            startAngle = angle2;
            endAngle = angle1;
          } else {
            startAngle = angle1;
            endAngle = angle2;
          }
          return P.PlotUtils.getArcPoints(center, radius, startAngle, endAngle);
        }

        function create() {
          clear();

          const res = getArcPositions(...pointList);

          const instance = new Cesium.GeometryInstance({
            geometry: new Cesium.GroundPolylineGeometry({
              positions: res,
              width: 2,
            })
          });

          primitive = viewer.scene.groundPrimitives.add(
            new Cesium.GroundPolylinePrimitive({
              geometryInstances: instance,
              appearance: new Cesium.PolylineMaterialAppearance({
                material: Cesium.Material.fromType("Color", {
                  color: Cesium.Color.SNOW.withAlpha(0.7)
                })
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
      return parseFloat(innerHeight) - 538;
    }
  },
  watch: {
    curSelect(val) {
      val === "draw-arc-direct" && (this.panel_show = true);
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