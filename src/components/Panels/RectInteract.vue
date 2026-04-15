<template>
  <Layout :panel_show.sync="panel_show" title="矩形绘制-交互绘制">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="执行" name="exec">
        <el-button @click="clear">清除</el-button>
        <el-button type="primary" @click="startDraw">开始绘制</el-button>
      </el-tab-pane>
      <el-tab-pane label="代码" name="code">
        <CodeBrower :code="codeStr" language="javascript"/>
      </el-tab-pane>
    </el-tabs>
  </Layout>
</template>

<script>
import Layout from '../Layout.vue';
import CodeBrower from '../CodeBrower.vue';
import { mapState } from 'vuex';

let handler = null;
let startPoint = null;
let rectangleEntity = null;
let drawing = false;

function startDrawRectangle() {
  if (handler) {
    handler.destroy();
    handler = null;
  }

  if (rectangleEntity) {
    viewer.entities.remove(rectangleEntity);
    rectangleEntity = null;
  }

  handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  drawing = true;
  startPoint = null;

  // 左键点击
  handler.setInputAction((event) => {
    const ray = viewer.camera.getPickRay(event.position);
    const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    if (!cartesian) return;

    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const lon = Cesium.Math.toDegrees(cartographic.longitude);
    const lat = Cesium.Math.toDegrees(cartographic.latitude);

    // 第一次点击
    if (!startPoint) {
      startPoint = { lon, lat };

      rectangleEntity = viewer.entities.add({
        rectangle: {
          coordinates: new Cesium.CallbackProperty(() => {
            return Cesium.Rectangle.fromDegrees(
              startPoint.lon,
              startPoint.lat,
              startPoint.lon,
              startPoint.lat
            );
          }, false),
          material: Cesium.Color.WHITE.withAlpha(0.3),
          height: 0,
          outline: true,
          outlineColor: Cesium.Color.RED
        }
      });
    }
    // 第二次点击 -> 结束
    else {
      const rect = rectangleEntity.rectangle.coordinates.getValue();
      console.log(rect);

      drawing = false;
      handler.destroy();
      handler = null;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // 鼠标移动
  handler.setInputAction((event) => {
    if (!drawing || !startPoint) return;

    const ray = viewer.camera.getPickRay(event.endPosition);
    const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    if (!cartesian) return;

    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const lon = Cesium.Math.toDegrees(cartographic.longitude);
    const lat = Cesium.Math.toDegrees(cartographic.latitude);

    // 更新矩形
    rectangleEntity.rectangle.coordinates = new Cesium.CallbackProperty(() => {
      return Cesium.Rectangle.fromDegrees(
        Math.min(startPoint.lon, lon),
        Math.min(startPoint.lat, lat),
        Math.max(startPoint.lon, lon),
        Math.max(startPoint.lat, lat)
      );
    }, false);
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

export default {
  name: 'RectInteract',
  components: {
    Layout,
    CodeBrower
  },
  data() {
    return {
      panel_show: false,
      activeName: 'exec',
      codeStr: `let handler = null;
                let startPoint = null;
                let rectangleEntity = null;
                let drawing = false;

                function startDrawRectangle() {
                  if (handler) {
                    handler.destroy();
                    handler = null;
                  }

                  if (rectangleEntity) {
                    viewer.entities.remove(rectangleEntity);
                    rectangleEntity = null;
                  }

                  handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
                  drawing = true;
                  startPoint = null;

                  // 左键点击
                  handler.setInputAction((event) => {
                    const ray = viewer.camera.getPickRay(event.position);
                    const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
                    if (!cartesian) return;

                    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    const lon = Cesium.Math.toDegrees(cartographic.longitude);
                    const lat = Cesium.Math.toDegrees(cartographic.latitude);

                    // 第一次点击
                    if (!startPoint) {
                      startPoint = { lon, lat };

                      rectangleEntity = viewer.entities.add({
                        rectangle: {
                          coordinates: new Cesium.CallbackProperty(() => {
                            return Cesium.Rectangle.fromDegrees(
                              startPoint.lon,
                              startPoint.lat,
                              startPoint.lon,
                              startPoint.lat
                            );
                          }, false),
                          material: Cesium.Color.WHITE.withAlpha(0.3),
                          height: 0,
                          outline: true,
                          outlineColor: Cesium.Color.RED
                        }
                      });
                    }
                    // 第二次点击 -> 结束
                    else {
                      const rect = rectangleEntity.rectangle.coordinates.getValue();
                      console.log(rect);

                      drawing = false;
                      handler.destroy();
                      handler = null;
                    }
                  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

                  // 鼠标移动
                  handler.setInputAction((event) => {
                    if (!drawing || !startPoint) return;

                    const ray = viewer.camera.getPickRay(event.endPosition);
                    const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
                    if (!cartesian) return;

                    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    const lon = Cesium.Math.toDegrees(cartographic.longitude);
                    const lat = Cesium.Math.toDegrees(cartographic.latitude);

                    // 更新矩形
                    rectangleEntity.rectangle.coordinates = new Cesium.CallbackProperty(() => {
                      return Cesium.Rectangle.fromDegrees(
                        Math.min(startPoint.lon, lon),
                        Math.min(startPoint.lat, lat),
                        Math.max(startPoint.lon, lon),
                        Math.max(startPoint.lat, lat)
                      );
                    }, false);
                  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                }
                startDrawRectangle();`
    }
  },
  computed: {
    ...mapState(['curSelect'])
  },
  watch: {
    curSelect(val) {
      val === "draw-rect-interact" && (this.panel_show = true);
    }
  },
  beforeDestroy() {
    this.clear();
  },
  methods: {
    clear() {
      if (handler) {
        handler.destroy();
        handler = null;
      }

      if (rectangleEntity) {
        viewer.entities.remove(rectangleEntity);
        rectangleEntity = null;
      }
    },

    startDraw() {
      startDrawRectangle();
    }

  }// methods end
}
</script>