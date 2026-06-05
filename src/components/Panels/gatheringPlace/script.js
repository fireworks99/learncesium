import { P } from "../tools";

const gatheringPlaceParams = {
  t: 0.4,
};

// * 获取聚集地坐标
function getGatheringPlacePositions(pnts) {
  if (pnts.length == 2) {
    const mid = P.PlotUtils.mid(pnts[0], pnts[1]);
    const d = P.PlotUtils.distance(pnts[0], mid) / 0.9;
    const pnt = P.PlotUtils.getThirdPoint(
      pnts[0],
      mid,
      P.Constants.HALF_PI,
      d,
      true
    );
    pnts = [pnts[0], pnt, pnts[1]];
  }
  const mid = P.PlotUtils.mid(pnts[0], pnts[2]);
  pnts.push(mid, pnts[0], pnts[1]);

  let normals = [];
  for (let i = 0; i < pnts.length - 2; i++) {
    const pnt1 = pnts[i];
    const pnt2 = pnts[i + 1];
    const pnt3 = pnts[i + 2];
    const normalPoints = P.PlotUtils.getBisectorNormals(
      gatheringPlaceParams.t,
      pnt1,
      pnt2,
      pnt3
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

// 过程载体
export function createEntity(pointList) {
  const update = () => {
    const arr = [];
    for (let i = 0; i < pointList.length; ++i) {
      const lonLat = P.PlotUtils.cartesian3ToLonLat(pointList[i]);
      arr.push(lonLat);
    }

    if (arr.length === 2) {
      arr.push([arr[1][0] + 1e-7, arr[1][1]]);
    }

    // 计算图形
    const res = getGatheringPlacePositions(arr);
    return new Cesium.PolygonHierarchy(res);
  };

  return viewer.entities.add({
    polygon: {
      hierarchy: new Cesium.CallbackProperty(update, false),
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
  const res = getGatheringPlacePositions(arr);

  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(res)
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
  const gatheringPlaceParams = {
    t: 0.4,
  };

  // * 获取聚集地坐标
  function getGatheringPlacePositions(pnts) {
    if (pnts.length == 2) {
      const mid = P.PlotUtils.mid(pnts[0], pnts[1]);
      const d = P.PlotUtils.distance(pnts[0], mid) / 0.9;
      const pnt = P.PlotUtils.getThirdPoint(
        pnts[0],
        mid,
        P.Constants.HALF_PI,
        d,
        true
      );
      pnts = [pnts[0], pnt, pnts[1]];
    }
    const mid = P.PlotUtils.mid(pnts[0], pnts[2]);
    pnts.push(mid, pnts[0], pnts[1]);

    let normals = [];
    for (let i = 0; i < pnts.length - 2; i++) {
      const pnt1 = pnts[i];
      const pnt2 = pnts[i + 1];
      const pnt3 = pnts[i + 2];
      const normalPoints = P.PlotUtils.getBisectorNormals(
        gatheringPlaceParams.t,
        pnt1,
        pnt2,
        pnt3
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

  // 过程载体
  function createEntity(pointList) {
    const update = () => {
      const arr = [];
      for (let i = 0; i < pointList.length; ++i) {
        const lonLat = P.PlotUtils.cartesian3ToLonLat(pointList[i]);
        arr.push(lonLat);
      }

      if (arr.length === 2) {
        arr.push([arr[1][0] + 1e-7, arr[1][1]]);
      }

      // 计算图形
      const res = getGatheringPlacePositions(arr);
      return new Cesium.PolygonHierarchy(res);
    };

    return viewer.entities.add({
      polygon: {
        hierarchy: new Cesium.CallbackProperty(update, false),
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
    const res = getGatheringPlacePositions(arr);

    const instance = new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(res)
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
    minP: 4,
    createEntity,
    showPrimitiveOnMap
  });
`;