import { P } from '../tools';

// 过程载体
export function createEntity(pointList) {
  const update = () => {
    const arr = [];
    for (let i = 0; i < pointList.length; ++i) {
      const lonLat = P.PlotUtils.cartesian3ToLonLat(pointList[i]);
      arr.push(lonLat);
    }

    return new Cesium.Rectangle.fromDegrees(
      Math.min(arr[0][0], arr[1][0]),
      Math.min(arr[0][1], arr[1][1]),
      Math.max(arr[0][0], arr[1][0]),
      Math.max(arr[0][1], arr[1][1])
    );
  };

  return viewer.entities.add({
    rectangle: {
      coordinates: new Cesium.CallbackProperty(update, false),
      material: Cesium.Color.SNOW.withAlpha(0.7),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
  });
}

// 最终载体
export function showPrimitiveOnMap(pointList) {
  const arr = [];
  for (let i = 0; i < pointList.length; ++i) {
    const lonLat = P.PlotUtils.cartesian3ToLonLat(pointList[i]);
    arr.push(lonLat);
  }

  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.RectangleGeometry({
      rectangle: new Cesium.Rectangle.fromDegrees(
        Math.min(arr[0][0], arr[1][0]),
        Math.min(arr[0][1], arr[1][1]),
        Math.max(arr[0][0], arr[1][0]),
        Math.max(arr[0][1], arr[1][1])
      )
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

export const script = `
  // 过程载体
  function createEntity(pointList) {
    const update = () => {
      const arr = [];
      for (let i = 0; i < pointList.length; ++i) {
        const lonLat = P.PlotUtils.cartesian3ToLonLat(pointList[i]);
        arr.push(lonLat);
      }

      return new Cesium.Rectangle.fromDegrees(
        Math.min(arr[0][0], arr[1][0]),
        Math.min(arr[0][1], arr[1][1]),
        Math.max(arr[0][0], arr[1][0]),
        Math.max(arr[0][1], arr[1][1])
      );
    };

    return viewer.entities.add({
      rectangle: {
        coordinates: new Cesium.CallbackProperty(update, false),
        material: Cesium.Color.SNOW.withAlpha(0.7),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
  }

  // 最终载体
  function showPrimitiveOnMap(pointList) {
    const arr = [];
    for (let i = 0; i < pointList.length; ++i) {
      const lonLat = P.PlotUtils.cartesian3ToLonLat(pointList[i]);
      arr.push(lonLat);
    }

    const instance = new Cesium.GeometryInstance({
      geometry: new Cesium.RectangleGeometry({
        rectangle: new Cesium.Rectangle.fromDegrees(
          Math.min(arr[0][0], arr[1][0]),
          Math.min(arr[0][1], arr[1][1]),
          Math.max(arr[0][0], arr[1][0]),
          Math.max(arr[0][1], arr[1][1])
        )
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

  const {
    startDraw,
    clearDraw,
    startModify
  } = useFixed({
    minP: 2,
    createEntity,
    showPrimitiveOnMap
  });
`;
