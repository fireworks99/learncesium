import { P } from '../tools';

function getArcPositions(pnts) {
  let pnt;
  if (pnts.length == 2 || pnts[1].toString() == pnts[2].toString()) {
    const mid = P.PlotUtils.mid(pnts[0], pnts[1]);
    const d = P.PlotUtils.distance(pnts[0], mid);
    pnt = P.PlotUtils.getThirdPoint(pnts[0], mid, P.Constants.HALF_PI, d, true);
  }
  const pnt1 = pnts[0];
  const pnt2 = pnts[1];
  const pnt3 = pnt ? pnt : pnts[2];
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
  const pntArr = P.PlotUtils.getArcPoints(
    center,
    radius,
    startAngle,
    endAngle
  );
  return pntArr;
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
      arr.push([arr[1][0] + 1e-7, arr[1][1]])
    }

    const res = getArcPositions(arr);
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

  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(
        getArcPositions(arr)
      ),
    }),
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
  function getArcPositions(pnts) {
    let pnt;
    if (pnts.length == 2 || pnts[1].toString() == pnts[2].toString()) {
      const mid = P.PlotUtils.mid(pnts[0], pnts[1]);
      const d = P.PlotUtils.distance(pnts[0], mid);
      pnt = P.PlotUtils.getThirdPoint(pnts[0], mid, P.Constants.HALF_PI, d, true);
    }
    const pnt1 = pnts[0];
    const pnt2 = pnts[1];
    const pnt3 = pnt ? pnt : pnts[2];
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
    const pntArr = P.PlotUtils.getArcPoints(
      center,
      radius,
      startAngle,
      endAngle
    );
    return pntArr;
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
        arr.push([arr[1][0] + 1e-7, arr[1][1]])
      }

      const res = getArcPositions(arr);
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

    const instance = new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(
          getArcPositions(arr)
        ),
      }),
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
    minP: 3,
    createEntity,
    showPrimitiveOnMap
  });
`;
