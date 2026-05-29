function computeRotate(pointList) {
  const p1 = Cesium.Cartographic.fromCartesian(pointList[0]);
  const p2 = Cesium.Cartographic.fromCartesian(pointList[1]);

  return Math.atan2(
    p2.latitude - p1.latitude,
    p2.longitude - p1.longitude
  );
}

// 过程载体
export function createEntity(pointList) {

  if (pointList.length < 2) return;

  const update = () => {
    return pointList[0];
  };

  // * 通过坐标计算长半轴
  const computeMaxDistance = () => {
    const maxDistance = Cesium.Cartesian3.distance(
      pointList[0],
      pointList[1]
    );
    return maxDistance;
  };

  // * 通过坐标计算短半轴（取长半轴的一半）
  const computeMinDistance = () => {
    const minDistance = Cesium.Cartesian3.distance(
      pointList[0],
      pointList[1]
    ) / 2;
    return minDistance;
  };

  // * 计算椭圆朝向
  const computeRotation = () => {
    return computeRotate(pointList);
  };

  return viewer.entities.add({
    position: new Cesium.CallbackProperty(update, false),
    ellipse: {
      material: Cesium.Color.SNOW.withAlpha(0.7),
      clampToGround: true,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      semiMajorAxis: new Cesium.CallbackProperty(computeMaxDistance, false),
      semiMinorAxis: new Cesium.CallbackProperty(computeMinDistance, false),
      rotation: new Cesium.CallbackProperty(computeRotation, false)
    }
  });

}

// 最终载体
export function showPrimitiveOnMap(pointList) {

  const maxDistance = Cesium.Cartesian3.distance(
    pointList[0],
    pointList[1]
  );

  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.EllipseGeometry({
      center: pointList[0],
      semiMajorAxis: maxDistance,
      semiMinorAxis: maxDistance / 2,
      rotation: computeRotate(pointList)
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
  function computeRotate(pointList) {
    const p1 = Cesium.Cartographic.fromCartesian(pointList[0]);
    const p2 = Cesium.Cartographic.fromCartesian(pointList[1]);

    return Math.atan2(
      p2.latitude - p1.latitude,
      p2.longitude - p1.longitude
    );
  }

  // 过程载体
  function createEntity(pointList) {

    if (pointList.length < 2) return;

    const update = () => {
      return pointList[0];
    };

    // * 通过坐标计算长半轴
    const computeMaxDistance = () => {
      const maxDistance = Cesium.Cartesian3.distance(
        pointList[0],
        pointList[1]
      );
      return maxDistance;
    };

    // * 通过坐标计算短半轴（取长半轴的一半）
    const computeMinDistance = () => {
      const minDistance = Cesium.Cartesian3.distance(
        pointList[0],
        pointList[1]
      ) / 2;
      return minDistance;
    };

    // * 计算椭圆朝向
    const computeRotation = () => {
      return computeRotate(pointList);
    };

    return viewer.entities.add({
      position: new Cesium.CallbackProperty(update, false),
      ellipse: {
        material: Cesium.Color.SNOW.withAlpha(0.7),
        clampToGround: true,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        semiMajorAxis: new Cesium.CallbackProperty(computeMaxDistance, false),
        semiMinorAxis: new Cesium.CallbackProperty(computeMinDistance, false),
        rotation: new Cesium.CallbackProperty(computeRotation, false)
      }
    });

  }

  // 最终载体
  function showPrimitiveOnMap(pointList) {

    const maxDistance = Cesium.Cartesian3.distance(
      pointList[0],
      pointList[1]
    );

    const instance = new Cesium.GeometryInstance({
      geometry: new Cesium.EllipseGeometry({
        center: pointList[0],
        semiMajorAxis: maxDistance,
        semiMinorAxis: maxDistance / 2,
        rotation: computeRotate(pointList)
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
    minP: 2,
    createEntity,
    showPrimitiveOnMap
  });
`;
