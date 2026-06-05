// 过程载体
export function createEntity(pointList) {
  const update = () => {
    return pointList;
  };

  return viewer.entities.add({
    polyline: {
      positions: new Cesium.CallbackProperty(update, false),
      width: 10,
      material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.SNOW.withAlpha(0.7)),
      clampToGround: false,
    },
  });
}

// 最终载体
export function showPrimitiveOnMap(pointList) {

  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.GroundPolylineGeometry({
      positions: pointList,
      width: 10,
    })
  });

  return viewer.scene.groundPrimitives.add(
    new Cesium.GroundPolylinePrimitive({
      geometryInstances: instance,
      appearance: new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType("PolylineArrow", {
          color: Cesium.Color.SNOW.withAlpha(0.7)
        })
      })
    })
  );
}

export const script = `
  // 过程载体
  function createEntity(pointList) {
    const update = () => {
      return pointList;
    };

    return viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(update, false),
        width: 10,
        material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.SNOW.withAlpha(0.7)),
        clampToGround: false,
      },
    });
  }

  // 最终载体
  function showPrimitiveOnMap(pointList) {

    const instance = new Cesium.GeometryInstance({
      geometry: new Cesium.GroundPolylineGeometry({
        positions: pointList,
        width: 10,
      })
    });

    return viewer.scene.groundPrimitives.add(
      new Cesium.GroundPolylinePrimitive({
        geometryInstances: instance,
        appearance: new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType("PolylineArrow", {
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
