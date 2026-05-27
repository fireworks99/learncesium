import { P } from '../tools';

const doubleArrowParams = {
  headHeightFactor: 0.25,
  headWidthFactor: 0.3,
  neckHeightFactor: 0.85,
  neckWidthFactor: 0.15,
};

// * 计算对称点
function getTempPoint4(pnt1, pnt2, point) {
  const midPnt = P.PlotUtils.mid(pnt1, pnt2);
  const len = P.PlotUtils.distance(midPnt, point);
  const angle = P.PlotUtils.getAngleOfThreePoints(pnt1, midPnt, point);
  let symPnt, distance1, distance2, mid;
  if (angle < P.Constants.HALF_PI) {
    distance1 = len * Math.sin(angle);
    distance2 = len * Math.cos(angle);
    mid = P.PlotUtils.getThirdPoint(
      pnt1,
      midPnt,
      P.Constants.HALF_PI,
      distance1,
      false
    );
    symPnt = P.PlotUtils.getThirdPoint(
      midPnt,
      mid,
      P.Constants.HALF_PI,
      distance2,
      true
    );
  } else if (angle >= P.Constants.HALF_PI && angle < Math.PI) {
    distance1 = len * Math.sin(Math.PI - angle);
    distance2 = len * Math.cos(Math.PI - angle);
    mid = P.PlotUtils.getThirdPoint(
      pnt1,
      midPnt,
      P.Constants.HALF_PI,
      distance1,
      false
    );
    symPnt = P.PlotUtils.getThirdPoint(
      midPnt,
      mid,
      P.Constants.HALF_PI,
      distance2,
      false
    );
  } else if (angle >= Math.PI && angle < Math.PI * 1.5) {
    distance1 = len * Math.sin(angle - Math.PI);
    distance2 = len * Math.cos(angle - Math.PI);
    mid = P.PlotUtils.getThirdPoint(
      pnt1,
      midPnt,
      P.Constants.HALF_PI,
      distance1,
      true
    );
    symPnt = P.PlotUtils.getThirdPoint(
      midPnt,
      mid,
      P.Constants.HALF_PI,
      distance2,
      true
    );
  } else {
    distance1 = len * Math.sin(Math.PI * 2 - angle);
    distance2 = len * Math.cos(Math.PI * 2 - angle);
    mid = P.PlotUtils.getThirdPoint(
      pnt1,
      midPnt,
      P.Constants.HALF_PI,
      distance1,
      true
    );
    symPnt = P.PlotUtils.getThirdPoint(
      midPnt,
      mid,
      P.Constants.HALF_PI,
      distance2,
      false
    );
  }
  return symPnt;
}

// * 获取箭头坐标
function getArrowHeadPoints(points) {
  const len = P.PlotUtils.getBaseLength(points);
  const headHeight = len * doubleArrowParams.headHeightFactor;
  const headPnt = points[points.length - 1];
  const headWidth = headHeight * doubleArrowParams.headWidthFactor;
  const neckWidth = headHeight * doubleArrowParams.neckWidthFactor;
  const neckHeight = headHeight * doubleArrowParams.neckHeightFactor;
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

// * 获取钳击箭身坐标
function getArrowBodyPoints(points, neckLeft, neckRight, tailWidthFactor) {
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

// * 获取箭头点
function getArrowPoints(pnt1, pnt2, pnt3, clockWise) {
  const midPnt = P.PlotUtils.mid(pnt1, pnt2);
  const len = P.PlotUtils.distance(midPnt, pnt3);
  let midPnt1 = P.PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.3, true);
  let midPnt2 = P.PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.5, true);
  midPnt1 = P.PlotUtils.getThirdPoint(
    midPnt,
    midPnt1,
    P.Constants.HALF_PI,
    len / 5,
    clockWise
  );
  midPnt2 = P.PlotUtils.getThirdPoint(
    midPnt,
    midPnt2,
    P.Constants.HALF_PI,
    len / 4,
    clockWise
  );

  const points = [midPnt, midPnt1, midPnt2, pnt3];
  // 计算箭头部分
  const arrowPnts = getArrowHeadPoints(
    points,
    doubleArrowParams.headHeightFactor,
    doubleArrowParams.headWidthFactor,
    doubleArrowParams.neckHeightFactor,
    doubleArrowParams.neckWidthFactor
  );
  const neckLeftPoint = arrowPnts[0];
  const neckRightPoint = arrowPnts[4];
  // 计算箭身部分
  const tailWidthFactor =
    P.PlotUtils.distance(pnt1, pnt2) /
    P.PlotUtils.getBaseLength(points) /
    2;
  const bodyPnts = getArrowBodyPoints(
    points,
    neckLeftPoint,
    neckRightPoint,
    tailWidthFactor
  );
  const n = bodyPnts.length;
  let lPoints = bodyPnts.slice(0, n / 2);
  let rPoints = bodyPnts.slice(n / 2, n);
  lPoints.push(neckLeftPoint);
  rPoints.push(neckRightPoint);
  lPoints = lPoints.reverse();
  lPoints.push(pnt2);
  rPoints = rPoints.reverse();
  rPoints.push(pnt1);
  return lPoints.reverse().concat(arrowPnts, rPoints);
}

// * 获取钳击箭头坐标
function getDoubleArrow(pnts) {
  const pnt1 = pnts[0];
  const pnt2 = pnts[1];
  const pnt3 = pnts[2];
  let tempPoint4, connPoint;
  if (pnts.length == 3)
    tempPoint4 = getTempPoint4(pnt1, pnt2, pnt3);
  else tempPoint4 = pnts[3];
  if (pnts.length == 3 || pnts.length == 4)
    connPoint = P.PlotUtils.mid(pnt1, pnt2);
  else connPoint = pnts[4];
  let leftArrowPnts, rightArrowPnts;
  if (P.PlotUtils.isClockWise(pnt1, pnt2, pnt3)) {
    leftArrowPnts = getArrowPoints(
      pnt1,
      connPoint,
      tempPoint4,
      false
    );
    rightArrowPnts = getArrowPoints(
      connPoint,
      pnt2,
      pnt3,
      true
    );
  } else {
    leftArrowPnts = getArrowPoints(
      pnt2,
      connPoint,
      pnt3,
      false
    );
    rightArrowPnts = getArrowPoints(
      connPoint,
      pnt1,
      tempPoint4,
      true
    );
  }
  const m = leftArrowPnts.length;
  const t = (m - 5) / 2;

  const llBodyPnts = leftArrowPnts.slice(0, t);
  const lArrowPnts = leftArrowPnts.slice(t, t + 5);
  let lrBodyPnts = leftArrowPnts.slice(t + 5, m);

  let rlBodyPnts = rightArrowPnts.slice(0, t);
  const rArrowPnts = rightArrowPnts.slice(t, t + 5);
  const rrBodyPnts = rightArrowPnts.slice(t + 5, m);

  rlBodyPnts = P.PlotUtils.getBezierPoints(rlBodyPnts);
  const bodyPnts = P.PlotUtils.getBezierPoints(
    rrBodyPnts.concat(llBodyPnts.slice(1))
  );
  lrBodyPnts = P.PlotUtils.getBezierPoints(lrBodyPnts);

  const positions = rlBodyPnts.concat(
    rArrowPnts,
    bodyPnts,
    lArrowPnts,
    lrBodyPnts
  );
  const res = [];
  positions.forEach(function(pos) {
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

    //保证至少有三个点，且不在同一直线上
    if (arr.length === 2 || arr[1].toString() === arr[2].toString()) {
      arr.push([arr[1][0] + 1e-7, arr[1][1]]);
    }

    // 计算图形
    const res = getDoubleArrow(arr);
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
  const res = getDoubleArrow(arr);

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
  const doubleArrowParams = {
    headHeightFactor: 0.25,
    headWidthFactor: 0.3,
    neckHeightFactor: 0.85,
    neckWidthFactor: 0.15,
  };

  // * 计算对称点
  function getTempPoint4(pnt1, pnt2, point) {
    const midPnt = P.PlotUtils.mid(pnt1, pnt2);
    const len = P.PlotUtils.distance(midPnt, point);
    const angle = P.PlotUtils.getAngleOfThreePoints(pnt1, midPnt, point);
    let symPnt, distance1, distance2, mid;
    if (angle < P.Constants.HALF_PI) {
      distance1 = len * Math.sin(angle);
      distance2 = len * Math.cos(angle);
      mid = P.PlotUtils.getThirdPoint(
        pnt1,
        midPnt,
        P.Constants.HALF_PI,
        distance1,
        false
      );
      symPnt = P.PlotUtils.getThirdPoint(
        midPnt,
        mid,
        P.Constants.HALF_PI,
        distance2,
        true
      );
    } else if (angle >= P.Constants.HALF_PI && angle < Math.PI) {
      distance1 = len * Math.sin(Math.PI - angle);
      distance2 = len * Math.cos(Math.PI - angle);
      mid = P.PlotUtils.getThirdPoint(
        pnt1,
        midPnt,
        P.Constants.HALF_PI,
        distance1,
        false
      );
      symPnt = P.PlotUtils.getThirdPoint(
        midPnt,
        mid,
        P.Constants.HALF_PI,
        distance2,
        false
      );
    } else if (angle >= Math.PI && angle < Math.PI * 1.5) {
      distance1 = len * Math.sin(angle - Math.PI);
      distance2 = len * Math.cos(angle - Math.PI);
      mid = P.PlotUtils.getThirdPoint(
        pnt1,
        midPnt,
        P.Constants.HALF_PI,
        distance1,
        true
      );
      symPnt = P.PlotUtils.getThirdPoint(
        midPnt,
        mid,
        P.Constants.HALF_PI,
        distance2,
        true
      );
    } else {
      distance1 = len * Math.sin(Math.PI * 2 - angle);
      distance2 = len * Math.cos(Math.PI * 2 - angle);
      mid = P.PlotUtils.getThirdPoint(
        pnt1,
        midPnt,
        P.Constants.HALF_PI,
        distance1,
        true
      );
      symPnt = P.PlotUtils.getThirdPoint(
        midPnt,
        mid,
        P.Constants.HALF_PI,
        distance2,
        false
      );
    }
    return symPnt;
  }

  // * 获取箭头坐标
  function getArrowHeadPoints(points) {
    const len = P.PlotUtils.getBaseLength(points);
    const headHeight = len * doubleArrowParams.headHeightFactor;
    const headPnt = points[points.length - 1];
    const headWidth = headHeight * doubleArrowParams.headWidthFactor;
    const neckWidth = headHeight * doubleArrowParams.neckWidthFactor;
    const neckHeight = headHeight * doubleArrowParams.neckHeightFactor;
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

  // * 获取钳击箭身坐标
  function getArrowBodyPoints(points, neckLeft, neckRight, tailWidthFactor) {
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

  // * 获取箭头点
  function getArrowPoints(pnt1, pnt2, pnt3, clockWise) {
    const midPnt = P.PlotUtils.mid(pnt1, pnt2);
    const len = P.PlotUtils.distance(midPnt, pnt3);
    let midPnt1 = P.PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.3, true);
    let midPnt2 = P.PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.5, true);
    midPnt1 = P.PlotUtils.getThirdPoint(
      midPnt,
      midPnt1,
      P.Constants.HALF_PI,
      len / 5,
      clockWise
    );
    midPnt2 = P.PlotUtils.getThirdPoint(
      midPnt,
      midPnt2,
      P.Constants.HALF_PI,
      len / 4,
      clockWise
    );

    const points = [midPnt, midPnt1, midPnt2, pnt3];
    // 计算箭头部分
    const arrowPnts = getArrowHeadPoints(
      points,
      doubleArrowParams.headHeightFactor,
      doubleArrowParams.headWidthFactor,
      doubleArrowParams.neckHeightFactor,
      doubleArrowParams.neckWidthFactor
    );
    const neckLeftPoint = arrowPnts[0];
    const neckRightPoint = arrowPnts[4];
    // 计算箭身部分
    const tailWidthFactor =
      P.PlotUtils.distance(pnt1, pnt2) /
      P.PlotUtils.getBaseLength(points) /
      2;
    const bodyPnts = getArrowBodyPoints(
      points,
      neckLeftPoint,
      neckRightPoint,
      tailWidthFactor
    );
    const n = bodyPnts.length;
    let lPoints = bodyPnts.slice(0, n / 2);
    let rPoints = bodyPnts.slice(n / 2, n);
    lPoints.push(neckLeftPoint);
    rPoints.push(neckRightPoint);
    lPoints = lPoints.reverse();
    lPoints.push(pnt2);
    rPoints = rPoints.reverse();
    rPoints.push(pnt1);
    return lPoints.reverse().concat(arrowPnts, rPoints);
  }

  // * 获取钳击箭头坐标
  function getDoubleArrow(pnts) {
    const pnt1 = pnts[0];
    const pnt2 = pnts[1];
    const pnt3 = pnts[2];
    let tempPoint4, connPoint;
    if (pnts.length == 3)
      tempPoint4 = getTempPoint4(pnt1, pnt2, pnt3);
    else tempPoint4 = pnts[3];
    if (pnts.length == 3 || pnts.length == 4)
      connPoint = P.PlotUtils.mid(pnt1, pnt2);
    else connPoint = pnts[4];
    let leftArrowPnts, rightArrowPnts;
    if (P.PlotUtils.isClockWise(pnt1, pnt2, pnt3)) {
      leftArrowPnts = getArrowPoints(
        pnt1,
        connPoint,
        tempPoint4,
        false
      );
      rightArrowPnts = getArrowPoints(
        connPoint,
        pnt2,
        pnt3,
        true
      );
    } else {
      leftArrowPnts = getArrowPoints(
        pnt2,
        connPoint,
        pnt3,
        false
      );
      rightArrowPnts = getArrowPoints(
        connPoint,
        pnt1,
        tempPoint4,
        true
      );
    }
    const m = leftArrowPnts.length;
    const t = (m - 5) / 2;

    const llBodyPnts = leftArrowPnts.slice(0, t);
    const lArrowPnts = leftArrowPnts.slice(t, t + 5);
    let lrBodyPnts = leftArrowPnts.slice(t + 5, m);

    let rlBodyPnts = rightArrowPnts.slice(0, t);
    const rArrowPnts = rightArrowPnts.slice(t, t + 5);
    const rrBodyPnts = rightArrowPnts.slice(t + 5, m);

    rlBodyPnts = P.PlotUtils.getBezierPoints(rlBodyPnts);
    const bodyPnts = P.PlotUtils.getBezierPoints(
      rrBodyPnts.concat(llBodyPnts.slice(1))
    );
    lrBodyPnts = P.PlotUtils.getBezierPoints(lrBodyPnts);

    const positions = rlBodyPnts.concat(
      rArrowPnts,
      bodyPnts,
      lArrowPnts,
      lrBodyPnts
    );
    const res = [];
    positions.forEach(function(pos) {
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

      //保证至少有三个点，且不在同一直线上
      if (arr.length === 2 || arr[1].toString() === arr[2].toString()) {
        arr.push([arr[1][0] + 1e-7, arr[1][1]]);
      }

      // 计算图形
      const res = getDoubleArrow(arr);
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
    const res = getDoubleArrow(arr);

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
