<template>
  <Layout :panel_show.sync="panel_show" title="自由线绘制-直接绘制">
    <el-tabs v-model="activeName" type="card">

      <!-- 1. 新增 -->
      <el-tab-pane label="新增" name="insert">
        <div style="margin-bottom: 16px;">
          <PolygonRange :pointList.sync="pointList" @confirm="create"/>
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

function create() {
  clear();

  const arr = [];
  pointList.forEach(item => {
    arr.push(P.PlotUtils.lonLatToCartesian3(item));
  });

  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.GroundPolylineGeometry({
      positions: arr,
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
  name: 'FreeHandPolylineDirect',
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
        [159.67, 9.93], [158.57, 15.84], [155.51, 21.25], [150.70, 25.70],
        [144.45, 28.83], [137.12, 30.38], [129.13, 30.21], [120.92, 28.29],
        [112.94, 24.70], [105.62, 19.63], [99.38, 13.36], [94.57, 6.23],
        [91.46, -1.26], [90.22, -8.67], [90.91, -15.63], [93.47, -21.79],
        [97.70, -26.84], [103.28, -30.54], [109.80, -32.72], [116.81, -33.28],
        [123.84, -32.21], [130.44, -29.58], [136.19, -25.55], [140.73, -20.37],
        [143.77, -14.35], [145.12, -7.84], [144.70, -1.22], [142.54, 4.97],
        [138.77, 10.26], [133.64, 14.28], [127.46, 16.73], [120.62, 17.43],
        [113.55, 16.29], [106.74, 13.34], [100.66, 8.71], [95.78, 2.64],
        [92.51, -4.15], [91.23, -10.96], [92.20, -17.18], [95.56, -22.29],
        [101.27, -25.85], [108.17, -27.60], [115.92, -27.41], [123.11, -25.30],
        [128.36, -21.46], [130.70, -16.30], [129.58, -10.49], [125.08, -5.04],
        [118.19, -1.17], [110.00, 0.47]
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
        
        function create() {
          clear();

          const arr = [];
          pointList.forEach(item => {
            arr.push(P.PlotUtils.lonLatToCartesian3(item));
          });

          const instance = new Cesium.GeometryInstance({
            geometry: new Cesium.GroundPolylineGeometry({
              positions: arr,
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
      return parseFloat(innerHeight) - 580;
    }
  },
  watch: {
    curSelect(val) {
      val === "draw-freeHandPolyline-direct" && (this.panel_show = true);
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