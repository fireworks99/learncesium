<template>
  <div id="posinfo"></div>
</template>

<script>
import { decimalToDMS } from "@/utils";

export default {
  name: 'PosTip',
  data() {
    return {

    }
  },
  mounted() {
    this.initPosTip();
  },
  beforeDestroy() {

  },
  methods: {
    initPosTip() {
      const handler = new Cesium.ScreenSpaceEventHandler(window.viewer.scene.canvas);

      handler.setInputAction((movement) => {
        const ray = window.viewer.camera.getPickRay(movement.endPosition);
        const cartesian = window.viewer.scene.globe.pick(ray, window.viewer.scene);

        const posinfo = document.getElementById("posinfo");

        if (Cesium.defined(cartesian)) {
          const text = this.getLonLatTip(cartesian);
          if (text) {
            posinfo.innerHTML = text;
            posinfo.style.display = "block";
          } else {
            posinfo.style.display = "none";
          }
        } else {
          posinfo.style.display = "none";
        }

      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    getLonLatTip(cartesian) {
      const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
      let longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
      let latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
      longitudeString = decimalToDMS(longitudeString, 1);
      latitudeString = decimalToDMS(latitudeString, 2);
      return `${longitudeString}, ${latitudeString}`;
    },
  }
}
</script>

<style lang="scss" scoped>
#posinfo {
  position: absolute;
  left: 50%;
  bottom: 0;
  
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 5px;
  border-radius: 3px;
  pointer-events: none;
  display: none;
}
</style>