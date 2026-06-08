import { P } from '../tools';

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

const assaultDirectionParams = {
  tailWidthFactor: 0.2,
  neckWidthFactor: 0.25,
  headWidthFactor: 0.3,
  headAngle: Math.PI / 4,
  neckAngle: Math.PI * 0.17741,
};

function getFineArrow(pnts) {
  return getFineOrAssault(pnts, assaultDirectionParams);
}

// 过程载体
export function createEntity(pointList) {
  const update = () => {
    const arr = [];
    for (let i = 0; i < pointList.length; ++i) {
      const lonLat = P.PlotUtils.cartesian3ToLonLat(pointList[i]);
      arr.push(lonLat);
    }

    //保证至少有三个点，且不在同一直线上
    if (arr.length === 2 || arr[1].toString() === arr[2].toString()) {
      arr.push([arr[1][0] + 1e-7, arr[1][1]]);
    }

    // 计算图形
    const res = getFineArrow(arr);
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
  const res = getFineArrow(arr);

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

  const assaultDirectionParams = {
    tailWidthFactor: 0.2,
    neckWidthFactor: 0.25,
    headWidthFactor: 0.3,
    headAngle: Math.PI / 4,
    neckAngle: Math.PI * 0.17741,
  };

  function getFineArrow(pnts) {
    return getFineOrAssault(pnts, assaultDirectionParams);
  }

  // 过程载体
  function createEntity(pointList) {
    const update = () => {
      const arr = [];
      for (let i = 0; i < pointList.length; ++i) {
        const lonLat = P.PlotUtils.cartesian3ToLonLat(pointList[i]);
        arr.push(lonLat);
      }

      //保证至少有三个点，且不在同一直线上
      if (arr.length === 2 || arr[1].toString() === arr[2].toString()) {
        arr.push([arr[1][0] + 1e-7, arr[1][1]]);
      }

      // 计算图形
      const res = getFineArrow(arr);
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
    const res = getFineArrow(arr);

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
    minP: 2,
    createEntity,
    showPrimitiveOnMap
  });
`;
