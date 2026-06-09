import { P } from "../tools";

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

// 过程载体
export function createEntity(pointList) {
  const update = () => {
    if (pointList.length === 2) {
      return pointList;
    } else if (pointList.length === 3) {
      if (JSON.stringify(pointList[1]) === JSON.stringify(pointList[2])) {
        return pointList;
      }
      const arr = [];
      for (let i = 0; i < pointList.length; ++i) {
        const lonLat = P.PlotUtils.cartesian3ToLonLat(pointList[i]);
        arr.push(lonLat);
      }
      const res = getArcPositions(...arr);
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
  const res = getArcPositions(...arr);

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

  // 过程载体
  function createEntity(pointList) {
    const update = () => {
      if (pointList.length === 2) {
        return pointList;
      } else if (pointList.length === 3) {
        if (JSON.stringify(pointList[1]) === JSON.stringify(pointList[2])) {
          return pointList;
        }
        const arr = [];
        for (let i = 0; i < pointList.length; ++i) {
          const lonLat = P.PlotUtils.cartesian3ToLonLat(pointList[i]);
          arr.push(lonLat);
        }
        const res = getArcPositions(...arr);
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
    const res = getArcPositions(...arr);

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
  } = useFixed({
    minP: 3,
    createEntity,
    showPrimitiveOnMap
  });
`;
