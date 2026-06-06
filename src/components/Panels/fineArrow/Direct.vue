<template>
  <Layout :panel_show.sync="panel_show" title="细直绘制-直接绘制">
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
import { P } from '../tools';

let primitive = null;
let pointList = [];

// * 获取细直箭头或者突击方向箭头坐标
function getFineOrAssault(pnts, param) {
  const pnt1 = pnts[0];
  const pnt2 = pnts[1];
  const len = P.PlotUtils.getBaseLength(pnts);
  const tailWidth = len * param.tailWidthFactor;
  const neckWidth = len * param.neckWidthFactor;
  const headWidth = len * param.headWidthFactor;
  const tailLeft = P.PlotUtils.getThirdPoint(
    pnt2,
    pnt1,
    P.Constants.HALF_PI,
    tailWidth,
    true
  );
  const tailRight = P.PlotUtils.getThirdPoint(
    pnt2,
    pnt1,
    P.Constants.HALF_PI,
    tailWidth,
    false
  );
  const headLeft = P.PlotUtils.getThirdPoint(
    pnt1,
    pnt2,
    param.headAngle,
    headWidth,
    false
  );
  const headRight = P.PlotUtils.getThirdPoint(
    pnt1,
    pnt2,
    param.headAngle,
    headWidth,
    true
  );
  const neckLeft = P.PlotUtils.getThirdPoint(
    pnt1,
    pnt2,
    param.neckAngle,
    neckWidth,
    false
  );
  const neckRight = P.PlotUtils.getThirdPoint(
    pnt1,
    pnt2,
    param.neckAngle,
    neckWidth,
    true
  );
  return [
    P.PlotUtils.lonLatToCartesian3(tailLeft),
    P.PlotUtils.lonLatToCartesian3(neckLeft),
    P.PlotUtils.lonLatToCartesian3(headLeft),
    P.PlotUtils.lonLatToCartesian3(pnt2),
    P.PlotUtils.lonLatToCartesian3(headRight),
    P.PlotUtils.lonLatToCartesian3(neckRight),
    P.PlotUtils.lonLatToCartesian3(tailRight),
  ];
}

const fineArrowParams = {
  tailWidthFactor: 0.15,
  neckWidthFactor: 0.2,
  headWidthFactor: 0.25,
  headAngle: Math.PI / 8.5,
  neckAngle: Math.PI / 13,
};

// * 获取细直箭头坐标
function getFineArrow(pnts) {
  return getFineOrAssault(pnts, fineArrowParams);
}

function create() {
  clear();

  const res = getFineArrow(pointList);

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
  name: 'FineArrowDirect',
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
        
        // * 获取细直箭头或者突击方向箭头坐标
        function getFineOrAssault(pnts, param) {
          const pnt1 = pnts[0];
          const pnt2 = pnts[1];
          const len = P.PlotUtils.getBaseLength(pnts);
          const tailWidth = len * param.tailWidthFactor;
          const neckWidth = len * param.neckWidthFactor;
          const headWidth = len * param.headWidthFactor;
          const tailLeft = P.PlotUtils.getThirdPoint(
            pnt2,
            pnt1,
            P.Constants.HALF_PI,
            tailWidth,
            true
          );
          const tailRight = P.PlotUtils.getThirdPoint(
            pnt2,
            pnt1,
            P.Constants.HALF_PI,
            tailWidth,
            false
          );
          const headLeft = P.PlotUtils.getThirdPoint(
            pnt1,
            pnt2,
            param.headAngle,
            headWidth,
            false
          );
          const headRight = P.PlotUtils.getThirdPoint(
            pnt1,
            pnt2,
            param.headAngle,
            headWidth,
            true
          );
          const neckLeft = P.PlotUtils.getThirdPoint(
            pnt1,
            pnt2,
            param.neckAngle,
            neckWidth,
            false
          );
          const neckRight = P.PlotUtils.getThirdPoint(
            pnt1,
            pnt2,
            param.neckAngle,
            neckWidth,
            true
          );
          return [
            P.PlotUtils.lonLatToCartesian3(tailLeft),
            P.PlotUtils.lonLatToCartesian3(neckLeft),
            P.PlotUtils.lonLatToCartesian3(headLeft),
            P.PlotUtils.lonLatToCartesian3(pnt2),
            P.PlotUtils.lonLatToCartesian3(headRight),
            P.PlotUtils.lonLatToCartesian3(neckRight),
            P.PlotUtils.lonLatToCartesian3(tailRight),
          ];
        }

        const fineArrowParams = {
          tailWidthFactor: 0.15,
          neckWidthFactor: 0.2,
          headWidthFactor: 0.25,
          headAngle: Math.PI / 8.5,
          neckAngle: Math.PI / 13,
        };

        // * 获取细直箭头坐标
        function getFineArrow(pnts) {
          return getFineOrAssault(pnts, fineArrowParams);
        }

        function create() {
          clear();

          const res = getFineArrow(pointList);

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
      val === "draw-fineArrow-direct" && (this.panel_show = true);
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