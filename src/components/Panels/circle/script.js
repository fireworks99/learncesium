// 过程载体
export function createEntity(pointList) {

  if (pointList.length < 2) return;

  const update = () => {
    return pointList[0];
  };

  // * 通过坐标计算半径
  const computeDistance = () => {
    return Cesium.Cartesian3.distance(pointList[0], pointList[1]);
  };

  return viewer.entities.add({
    position: new Cesium.CallbackProperty(update, false),
    ellipse: {
      material: Cesium.Color.SNOW.withAlpha(0.7),
      clampToGround: true,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      semiMajorAxis: new Cesium.CallbackProperty(computeDistance, false),
      semiMinorAxis: new Cesium.CallbackProperty(computeDistance, false),
    }
  });
}

// 最终载体
export function showPrimitiveOnMap(pointList) {

  const distance = Cesium.Cartesian3.distance(pointList[0], pointList[1]);

  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.EllipseGeometry({
      center: pointList[0],
      semiMajorAxis: distance,
      semiMinorAxis: distance,
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
  // 过程载体
  function createEntity(pointList) {

    if (pointList.length < 2) return;

    const update = () => {
      return pointList[0];
    };

    // * 通过坐标计算半径
    const computeDistance = () => {
      return Cesium.Cartesian3.distance(pointList[0], pointList[1]);
    };

    return viewer.entities.add({
      position: new Cesium.CallbackProperty(update, false),
      ellipse: {
        material: Cesium.Color.SNOW.withAlpha(0.7),
        clampToGround: true,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        semiMajorAxis: new Cesium.CallbackProperty(computeDistance, false),
        semiMinorAxis: new Cesium.CallbackProperty(computeDistance, false),
      }
    });
  }

  // 最终载体
  function showPrimitiveOnMap(pointList) {

    const distance = Cesium.Cartesian3.distance(pointList[0], pointList[1]);

    const instance = new Cesium.GeometryInstance({
      geometry: new Cesium.EllipseGeometry({
        center: pointList[0],
        semiMajorAxis: distance,
        semiMinorAxis: distance,
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
