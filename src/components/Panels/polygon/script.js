// 新增
export const createScript = `
  let state = -1;             // 1 => 创建中, 2 => 编辑中, -1 => 静止态
  let handler = null;         // 创建用到的handler
  let modifyHandler = null;   // 编辑用到的handler
  let pointList = [];         // 所有点
  let floatPoint = null;      // 当前移动点
  let entity = null;          // 绘制过程中的动态载体
  let primitive = null;       // 绘制结束得到的结果载体

  const img = \`data:image/svg+xml;base64,
    PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/
    PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBT
    VkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBo
    aWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIx
    Nzc4MDY0MDg2Nzc2IiBjbGFzcz0iaWNvbiIgdmlld0JveD0i
    MCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0i
    aHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE1
    Mjk4IiB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHhtbG5zOnhs
    aW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48
    cGF0aCBkPSJNNTEyIDUxMm0tNTEyIDBhNTEyIDUxMiAwIDEg
    MCAxMDI0IDAgNTEyIDUxMiAwIDEgMC0xMDI0IDBaIiBmaWxs
    PSJyZWQiIHAtaWQ9IjE1Mjk5Ij48L3BhdGg+PHBhdGggZD0i
    TTUxMiA1MTJtLTI1NiAwYTI1NiAyNTYgMCAxIDAgNTEyIDAg
    MjU2IDI1NiAwIDEgMC01MTIgMFoiIGZpbGw9InllbGxvdyIg
    cC1pZD0iMTUzMDAiPjwvcGF0aD48L3N2Zz4=\`;

  // 移除相关handler
  function clearHandlers() {
    if (handler) {
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
      handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      handler.destroy();
      handler = null;
    }
    if (modifyHandler) {
      modifyHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      modifyHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      modifyHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
      modifyHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      modifyHandler.destroy();
      modifyHandler = null;
    }
  }

  // 动态点
  function createPoint(cartesian) {
    if (!viewer.billboards) {
      viewer.billboards = viewer.scene.primitives.add(
        new Cesium.BillboardCollection({ scene: viewer.scene })
      );
    }
    return viewer.billboards.add({
      position: cartesian,
      image: img,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    })
  }

  // 过程载体
  function createEntity() {

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
  function showPrimitiveOnMap() {

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

  // 开始绘制
  function startDraw() {
    state = 1;

    if (handler) {
      handler.destroy();
      handler = null;
    }
    handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

    // 左键单击 => 确定各点
    handler.setInputAction((evt) => {

      const ray = viewer.camera.getPickRay(evt.position);
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (!cartesian) return;
      pointList.push(cartesian.clone());

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // 鼠标移动 => 满足条件则动态绘制
    handler.setInputAction((evt) => {

      const ray = viewer.camera.getPickRay(evt.endPosition);
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (!cartesian) return;

      // 动态点的物理载体
      if (floatPoint) floatPoint.position = cartesian.clone();
      else floatPoint = createPoint(cartesian.clone());

      // 动态点的数据载体
      if (pointList.length === 1) pointList.push(cartesian.clone());

      // 若点击了一次就创建entity使用callback进行数据更新
      if (pointList.length === 2 && !entity) {
        entity = createEntity();
      } else {
        // 当鼠标移动时，修改最后一个值
        if (pointList.length >= 2) {
          pointList.splice(pointList.length - 1, 1, cartesian.clone());
        }
      }

    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // 左键双击 => 完成绘制
    handler.setInputAction((evt) => {

      if (pointList.length < 3) return;

      // 删除双击带来的两个重复点
      pointList.splice(pointList.length - 2, 2);

      state = -1;
      primitive = showPrimitiveOnMap();

      // 清理工作
      viewer.billboards.remove(floatPoint);
      floatPoint = null;
      viewer.entities.remove(entity);
      entity = null;
      clearHandlers();

    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    // 右键单击 => 取消绘制
    handler.setInputAction((evt) => {
      clearDraw();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

  }

  // 取消绘制 && 清除绘制
  function clearDraw() {
    state = -1;
    clearHandlers();
    pointList = [];
    if (floatPoint) {
      viewer.billboards.remove(floatPoint);
      floatPoint = null;
    }
    if (entity) {
      viewer.entities.remove(entity);
      entity = null;
    }
    if (primitive) {
      viewer.scene.groundPrimitives.remove(primitive);
      primitive = null;
    }

    if (floatPointArr) {
      floatPointArr.forEach(p => {
        viewer.billboards.remove(p);
      });
      floatPointArr = [];
    }
  }

  startDraw();
`;

// 删除
export const deleteScript = `
  // 取消绘制 && 清除绘制
  function clearDraw() {
    state = -1;
    clearHandlers();
    pointList = [];
    if (floatPoint) {
      viewer.billboards.remove(floatPoint);
      floatPoint = null;
    }
    if (entity) {
      viewer.entities.remove(entity);
      entity = null;
    }
    if (primitive) {
      viewer.scene.groundPrimitives.remove(primitive);
      primitive = null;
    }

    if (floatPointArr) {
      floatPointArr.forEach(p => {
        viewer.billboards.remove(p);
      });
      floatPointArr = [];
    }
  }

  clearDraw();
`;

// 编辑
export const updateScript = `
  let floatPointArr = [];     // 编辑时用到的浮动点
  let step = -1;              // 编辑时浮动点的下标

  // 开始编辑
  function startModify() {
    if (!modifyHandler) {
      modifyHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    }
    state = 2;
    pointList.forEach(p => {
      const billboard = createPoint(p);
      floatPointArr.push(billboard);
    });

    // 将创建好的primitive删除，并添加entity过程载体
    entity = createEntity();
    viewer.scene.groundPrimitives.remove(primitive);
    primitive = null;

    // 左键单击 => 选择点 or 放置点
    modifyHandler.setInputAction(evt => {
      const ray = viewer.camera.getPickRay(evt.position);
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (!cartesian) return;

      // 如果有移动点在跟随鼠标移动，则在单击的时候放置该点
      if (step !== -1) {
        pointList[step] = cartesian.clone();
        step = -1;

        floatPoint = null;
        return;
      } else {
        // 如果没有移动点跟随鼠标移动，则在单击的时候查看是否有要素，如有则设置跟随点
        const feature = viewer.scene.pick(evt.position);
        if (Cesium.defined(feature) && feature.primitive instanceof Cesium.Billboard) {
          // 选中点
          floatPoint = feature.primitive;
          step = floatPointArr.indexOf(floatPoint);
        } else {
          // 结束绘制
          overModify();
        }
      }

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // 鼠标移动
    modifyHandler.setInputAction(evt => {
      if (step != -1 && floatPoint) {
        const ray = viewer.camera.getPickRay(evt.endPosition);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (!cartesian) return;

        floatPoint.position = cartesian.clone();
        pointList[step] = cartesian.clone();
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  // 结束编辑
  function overModify() {
    //取消“面”的选中，结束本次修改
    if (floatPoint) {
      viewer.billboards.remove(floatPoint);
      floatPoint = null;
    }
    state = -1;
    step = -1;

    if (floatPointArr) {
      floatPointArr.forEach(p => {
        viewer.billboards.remove(p);
      });
      floatPointArr = [];
    }

    primitive = showPrimitiveOnMap();

    viewer.entities.remove(entity);
    entity = null;

    clearHandlers();
  }

  startModify();
`;