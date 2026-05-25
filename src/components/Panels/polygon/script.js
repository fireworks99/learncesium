// 过程载体
export function createEntity(pointList) {

  // 动态线
  const linePositions = new Cesium.CallbackProperty(() => {
    return pointList.length < 3 ? [...pointList] : [...pointList, pointList[0]];
  }, false);

  // 动态面
  const polygonHierarchy = new Cesium.CallbackProperty(() => {
    return new Cesium.PolygonHierarchy([...pointList]);
  }, false);

  return viewer.entities.add({
    polyline: new Cesium.PolylineGraphics({
      positions: linePositions,
      width: 2,
      material: Cesium.Color.RED,
      clampToGround: true,
    }),

    polygon: new Cesium.PolygonGraphics({
      hierarchy: polygonHierarchy,
      material: Cesium.Color.SNOW.withAlpha(0.7),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      show: new Cesium.CallbackProperty(() => {
        return pointList.length >= 3;
      }, false),
    }),
  });

}

// 最终载体
export function showPrimitiveOnMap(pointList) {

  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(pointList),
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
  // 过程载体
  function createEntity(pointList) {

    // 动态线
    const linePositions = new Cesium.CallbackProperty(() => {
      return pointList.length < 3 ? [...pointList] : [...pointList, pointList[0]];
    }, false);

    // 动态面
    const polygonHierarchy = new Cesium.CallbackProperty(() => {
      return new Cesium.PolygonHierarchy([...pointList]);
    }, false);

    return viewer.entities.add({
      polyline: new Cesium.PolylineGraphics({
        positions: linePositions,
        width: 2,
        material: Cesium.Color.RED,
        clampToGround: true,
      }),

      polygon: new Cesium.PolygonGraphics({
        hierarchy: polygonHierarchy,
        material: Cesium.Color.SNOW.withAlpha(0.7),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        show: new Cesium.CallbackProperty(() => {
          return pointList.length >= 3;
        }, false),
      }),
    });

  }

  // 最终载体
  function showPrimitiveOnMap(pointList) {

    const instance = new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(pointList),
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