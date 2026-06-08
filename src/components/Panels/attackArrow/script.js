import { P } from '../tools';

const attackArrowParams = {
  headHeightFactor: 0.18,
  headWidthFactor: 0.3,
  neckHeightFactor: 0.85,
  neckWidthFactor: 0.15,
  headTailFactor: 0.8,
  tailWidthFactor: 0.1,
  swallowTailFactor: 1,
};

// 获取 进攻方向 箭头坐标
function getAttackArrowHeadPoints(points, tailLeft, tailRight) {
  let len = P.PlotUtils.getBaseLength(points);
  let headHeight = len * attackArrowParams.headHeightFactor;
  const headPnt = points[points.length - 1];
  len = P.PlotUtils.distance(headPnt, points[points.length - 2]);
  const tailWidth = P.PlotUtils.distance(tailLeft, tailRight);
  if (headHeight > tailWidth * attackArrowParams.headTailFactor) {
    headHeight = tailWidth * attackArrowParams.headTailFactor;
  }
  const headWidth = headHeight * attackArrowParams.headWidthFactor;
  const neckWidth = headHeight * attackArrowParams.neckWidthFactor;
  headHeight = headHeight > len ? len : headHeight;
  const neckHeight = headHeight * attackArrowParams.neckHeightFactor;
  const headEndPnt = P.PlotUtils.getThirdPoint(
    points[points.length - 2],
    headPnt,
    0,
    headHeight,
    true
  );
  const neckEndPnt = P.PlotUtils.getThirdPoint(
    points[points.length - 2],
    headPnt,
    0,
    neckHeight,
    true
  );
  const headLeft = P.PlotUtils.getThirdPoint(
    headPnt,
    headEndPnt,
    P.Constants.HALF_PI,
    headWidth,
    false
  );
  const headRight = P.PlotUtils.getThirdPoint(
    headPnt,
    headEndPnt,
    P.Constants.HALF_PI,
    headWidth,
    true
  );
  const neckLeft = P.PlotUtils.getThirdPoint(
    headPnt,
    neckEndPnt,
    P.Constants.HALF_PI,
    neckWidth,
    false
  );
  const neckRight = P.PlotUtils.getThirdPoint(
    headPnt,
    neckEndPnt,
    P.Constants.HALF_PI,
    neckWidth,
    true
  );
  return [neckLeft, headLeft, headPnt, headRight, neckRight];
}

// 获取 进攻方向 箭身坐标
function getAttackArrowBodyPoints(points, neckLeft, neckRight, tailWidthFactor) {
  const allLen = P.PlotUtils.wholeDistance(points);
  const len = P.PlotUtils.getBaseLength(points);
  const tailWidth = len * tailWidthFactor;
  const neckWidth = P.PlotUtils.distance(neckLeft, neckRight);
  const widthDif = (tailWidth - neckWidth) / 2;
  let tempLen = 0;
  const leftBodyPnts = [],
    rightBodyPnts = [];
  for (let i = 1; i < points.length - 1; i++) {
    const angle =
      P.PlotUtils.getAngleOfThreePoints(
        points[i - 1],
        points[i],
        points[i + 1]
      ) / 2;
    tempLen += P.PlotUtils.distance(points[i - 1], points[i]);
    const w =
      (tailWidth / 2 - (tempLen / allLen) * widthDif) / Math.sin(angle);
    const left = P.PlotUtils.getThirdPoint(
      points[i - 1],
      points[i],
      Math.PI - angle,
      w,
      true
    );
    const right = P.PlotUtils.getThirdPoint(
      points[i - 1],
      points[i],
      angle,
      w,
      false
    );
    leftBodyPnts.push(left);
    rightBodyPnts.push(right);
  }
  return leftBodyPnts.concat(rightBodyPnts);
}

// * 获取进攻方向坐标
function getAttackArrow(pnts) {
  // 计算箭尾
  let tailLeft = pnts[0];
  let tailRight = pnts[1];
  if (P.PlotUtils.isClockWise(pnts[0], pnts[1], pnts[2])) {
    tailLeft = pnts[1];
    tailRight = pnts[0];
  }
  const midTail = P.PlotUtils.mid(tailLeft, tailRight);
  const bonePnts = [midTail].concat(pnts.slice(2));
  // 计算箭头
  const headPnts = getAttackArrowHeadPoints(
    bonePnts,
    tailLeft,
    tailRight
  );
  const neckLeft = headPnts[0];
  const neckRight = headPnts[4];
  const tailWidthFactor =
    P.PlotUtils.distance(tailLeft, tailRight) /
    P.PlotUtils.getBaseLength(bonePnts);
  // 计算箭身
  const bodyPnts = getAttackArrowBodyPoints(
    bonePnts,
    neckLeft,
    neckRight,
    tailWidthFactor
  );
  // 整合
  const count = bodyPnts.length;
  let leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
  leftPnts.push(neckLeft);
  let rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
  rightPnts.push(neckRight);

  leftPnts = P.PlotUtils.getQBSplinePoints(leftPnts);
  rightPnts = P.PlotUtils.getQBSplinePoints(rightPnts);
  const positions = leftPnts.concat(headPnts, rightPnts.reverse());
  const res = [];
  positions.forEach(pos => {
    res.push(P.PlotUtils.lonLatToCartesian3(pos));
  });
  return res;
}

// 过程载体
export function createEntity(pointList) {
  const update = () => {
    const arr = [];
    for (let i = 0; i < pointList.length; ++i) {
      const lonLat = P.PlotUtils.cartesian3ToLonLat(pointList[i]);
      arr.push(lonLat);
    }

    // 预处理点集
    if (arr.length === 2) {
      arr.push([arr[1][0] + 1e-7, arr[1][1]]);
    } else if (
      arr[arr.length - 1].toString() ===
      arr[arr.length - 2].toString() &&
      arr.length > 3
    ) {
      arr.pop();
    } else {
      arr[arr.length - 1][0] += 1e-7;
    }

    // 计算图形
    const res = getAttackArrow(arr);
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
  const res = getAttackArrow(arr);

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
  const attackArrowParams = {
    headHeightFactor: 0.18,
    headWidthFactor: 0.3,
    neckHeightFactor: 0.85,
    neckWidthFactor: 0.15,
    headTailFactor: 0.8,
    tailWidthFactor: 0.1,
    swallowTailFactor: 1,
  };

  // 获取 进攻方向 箭头坐标
  function getAttackArrowHeadPoints(points, tailLeft, tailRight) {
    let len = P.PlotUtils.getBaseLength(points);
    let headHeight = len * attackArrowParams.headHeightFactor;
    const headPnt = points[points.length - 1];
    len = P.PlotUtils.distance(headPnt, points[points.length - 2]);
    const tailWidth = P.PlotUtils.distance(tailLeft, tailRight);
    if (headHeight > tailWidth * attackArrowParams.headTailFactor) {
      headHeight = tailWidth * attackArrowParams.headTailFactor;
    }
    const headWidth = headHeight * attackArrowParams.headWidthFactor;
    const neckWidth = headHeight * attackArrowParams.neckWidthFactor;
    headHeight = headHeight > len ? len : headHeight;
    const neckHeight = headHeight * attackArrowParams.neckHeightFactor;
    const headEndPnt = P.PlotUtils.getThirdPoint(
      points[points.length - 2],
      headPnt,
      0,
      headHeight,
      true
    );
    const neckEndPnt = P.PlotUtils.getThirdPoint(
      points[points.length - 2],
      headPnt,
      0,
      neckHeight,
      true
    );
    const headLeft = P.PlotUtils.getThirdPoint(
      headPnt,
      headEndPnt,
      P.Constants.HALF_PI,
      headWidth,
      false
    );
    const headRight = P.PlotUtils.getThirdPoint(
      headPnt,
      headEndPnt,
      P.Constants.HALF_PI,
      headWidth,
      true
    );
    const neckLeft = P.PlotUtils.getThirdPoint(
      headPnt,
      neckEndPnt,
      P.Constants.HALF_PI,
      neckWidth,
      false
    );
    const neckRight = P.PlotUtils.getThirdPoint(
      headPnt,
      neckEndPnt,
      P.Constants.HALF_PI,
      neckWidth,
      true
    );
    return [neckLeft, headLeft, headPnt, headRight, neckRight];
  }

  // 获取 进攻方向 箭身坐标
  function getAttackArrowBodyPoints(points, neckLeft, neckRight, tailWidthFactor) {
    const allLen = P.PlotUtils.wholeDistance(points);
    const len = P.PlotUtils.getBaseLength(points);
    const tailWidth = len * tailWidthFactor;
    const neckWidth = P.PlotUtils.distance(neckLeft, neckRight);
    const widthDif = (tailWidth - neckWidth) / 2;
    let tempLen = 0;
    const leftBodyPnts = [],
      rightBodyPnts = [];
    for (let i = 1; i < points.length - 1; i++) {
      const angle =
        P.PlotUtils.getAngleOfThreePoints(
          points[i - 1],
          points[i],
          points[i + 1]
        ) / 2;
      tempLen += P.PlotUtils.distance(points[i - 1], points[i]);
      const w =
        (tailWidth / 2 - (tempLen / allLen) * widthDif) / Math.sin(angle);
      const left = P.PlotUtils.getThirdPoint(
        points[i - 1],
        points[i],
        Math.PI - angle,
        w,
        true
      );
      const right = P.PlotUtils.getThirdPoint(
        points[i - 1],
        points[i],
        angle,
        w,
        false
      );
      leftBodyPnts.push(left);
      rightBodyPnts.push(right);
    }
    return leftBodyPnts.concat(rightBodyPnts);
  }

  // * 获取进攻方向坐标
  function getAttackArrow(pnts) {
    // 计算箭尾
    let tailLeft = pnts[0];
    let tailRight = pnts[1];
    if (P.PlotUtils.isClockWise(pnts[0], pnts[1], pnts[2])) {
      tailLeft = pnts[1];
      tailRight = pnts[0];
    }
    const midTail = P.PlotUtils.mid(tailLeft, tailRight);
    const bonePnts = [midTail].concat(pnts.slice(2));
    // 计算箭头
    const headPnts = getAttackArrowHeadPoints(
      bonePnts,
      tailLeft,
      tailRight
    );
    const neckLeft = headPnts[0];
    const neckRight = headPnts[4];
    const tailWidthFactor =
      P.PlotUtils.distance(tailLeft, tailRight) /
      P.PlotUtils.getBaseLength(bonePnts);
    // 计算箭身
    const bodyPnts = getAttackArrowBodyPoints(
      bonePnts,
      neckLeft,
      neckRight,
      tailWidthFactor
    );
    // 整合
    const count = bodyPnts.length;
    let leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
    leftPnts.push(neckLeft);
    let rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
    rightPnts.push(neckRight);

    leftPnts = P.PlotUtils.getQBSplinePoints(leftPnts);
    rightPnts = P.PlotUtils.getQBSplinePoints(rightPnts);
    const positions = leftPnts.concat(headPnts, rightPnts.reverse());
    const res = [];
    positions.forEach(pos => {
      res.push(P.PlotUtils.lonLatToCartesian3(pos));
    });
    return res;
  }

  // 过程载体
  function createEntity(pointList) {
    const update = () => {
      const arr = [];
      for (let i = 0; i < pointList.length; ++i) {
        const lonLat = P.PlotUtils.cartesian3ToLonLat(pointList[i]);
        arr.push(lonLat);
      }

      // 预处理点集
      if (arr.length === 2) {
        arr.push([arr[1][0] + 1e-7, arr[1][1]]);
      } else if (
        arr[arr.length - 1].toString() ===
        arr[arr.length - 2].toString() &&
        arr.length > 3
      ) {
        arr.pop();
      } else {
        arr[arr.length - 1][0] += 1e-7;
      }

      // 计算图形
      const res = getAttackArrow(arr);
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
    const res = getAttackArrow(arr);

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
  } = useUnfixed({
    minP: 3,
    createEntity,
    showPrimitiveOnMap
  });
`;
