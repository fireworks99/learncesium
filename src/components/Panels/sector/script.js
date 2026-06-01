import { P } from '../tools';

function getSectorPositions(pnts) {
  const center = pnts[0];
  const radius = P.PlotUtils.distance(pnts[1], center);
  const startAngle = P.PlotUtils.getAzimuth(pnts[1], center);
  const endAngle = P.PlotUtils.getAzimuth(pnts[2], center);
  const pList = P.PlotUtils.getArcPoints(
    center,
    radius,
    startAngle,
    endAngle
  );
  pList.push(P.PlotUtils.lonLatToCartesian3(center), pList[0]);
  return pList;
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

    const res = getSectorPositions(arr);
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
        getSectorPositions(arr)
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
  function getSectorPositions(pnts) {
    const center = pnts[0];
    const radius = P.PlotUtils.distance(pnts[1], center);
    const startAngle = P.PlotUtils.getAzimuth(pnts[1], center);
    const endAngle = P.PlotUtils.getAzimuth(pnts[2], center);
    const pList = P.PlotUtils.getArcPoints(
      center,
      radius,
      startAngle,
      endAngle
    );
    pList.push(P.PlotUtils.lonLatToCartesian3(center), pList[0]);
    return pList;
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

      const res = getSectorPositions(arr);
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
          getSectorPositions(arr)
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
