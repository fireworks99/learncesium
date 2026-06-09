import { P } from "../tools";

const curseParams = {
  t: 0.3,
};

// * 获取曲线坐标
function getCurvePoints(controlPoints) {
  return P.PlotUtils.getCurvePoints(curseParams.t, controlPoints);
}

// 过程载体
export function createEntity(pointList) {
  const update = () => {
    if (pointList.length === 2) {
      return pointList;
    } else {
      const arr = [];
      for (let i = 0; i < pointList.length; ++i) {
        const lonLat = P.PlotUtils.cartesian3ToLonLat(pointList[i]);
        arr.push(lonLat);
      }
      const res = getCurvePoints(arr);
      const index = JSON.stringify(res).indexOf('null');
      return index === -1 ? res : [];
    }
  };

  return viewer.entities.add({
    polyline: {
      positions: new Cesium.CallbackProperty(update, false),
      material: Cesium.Color.SNOW.withAlpha(0.7),
      clampToGround: false,
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
  const res = getCurvePoints(arr);

  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.GroundPolylineGeometry({
      positions: res,
      width: 2,
    })
  });

  return viewer.scene.groundPrimitives.add(
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

export const script = `
  const curseParams = {
    t: 0.3,
  };

  // * 获取曲线坐标
  function getCurvePoints(controlPoints) {
    return P.PlotUtils.getCurvePoints(curseParams.t, controlPoints);
  }

  // 过程载体
  function createEntity(pointList) {
    const update = () => {
      if (pointList.length === 2) {
        return pointList;
      } else {
        const arr = [];
        for (let i = 0; i < pointList.length; ++i) {
          const lonLat = P.PlotUtils.cartesian3ToLonLat(pointList[i]);
          arr.push(lonLat);
        }
        const res = getCurvePoints(arr);
        const index = JSON.stringify(res).indexOf('null');
        return index === -1 ? res : [];
      }
    };

    return viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(update, false),
        material: Cesium.Color.SNOW.withAlpha(0.7),
        clampToGround: false,
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
    const res = getCurvePoints(arr);

    const instance = new Cesium.GeometryInstance({
      geometry: new Cesium.GroundPolylineGeometry({
        positions: res,
        width: 2,
      })
    });

    return viewer.scene.groundPrimitives.add(
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

  const {
    startDraw,
    clearDraw,
    startModify
  } = useUnfixed({
    minP: 2,
    createEntity,
    showPrimitiveOnMap
  });
`;
