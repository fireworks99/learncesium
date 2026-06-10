export function usePoint() {
  let state = -1; // 1 => 创建中, 2 => 编辑中, -1 => 静止态 
  let handler = null; // 创建用到的handler 
  let modifyHandler = null; // 编辑用到的handler 
  let pointList = []; // 所有点 
  let floatPoint = null; // 当前移动点 
  let primitive = null; // 绘制结束得到的结果载体 

  const img = `data:image/svg+xml;base64,
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
    cC1pZD0iMTUzMDAiPjwvcGF0aD48L3N2Zz4=`;

  const marker = `data:image/svg+xml;base64,
    PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/
    PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBT
    VkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBo
    aWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIx
    NzgxMDU0MDU5MjU3IiBjbGFzcz0iaWNvbiIgdmlld0JveD0i
    MCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0i
    aHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjY1
    OTAiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8x
    OTk5L3hsaW5rIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxw
    YXRoIGQ9Ik01NDEuMTkwODkxIDEwMDkuMjkzMjQ4QzU0NC41
    MjgzMiAxMDA1Ljg4NTI3NSA1NDguMzgzNzA3IDEwMDEuODk4
    NzA0IDU1Mi43MTM5NzggOTk3LjM2MTA5IDU2NS4wMjUzMDIg
    OTg0LjQ2MDE4NiA1NzguNzE4MzggOTY5LjY4ODg5MiA1OTMu
    NDUwMDI0IDk1My4yNjY2MjYgNjM1LjUxNDUwOSA5MDYuMzc0
    NjE4IDY3Ny41NzU0NjMgODU1LjU0ODE1MiA3MTYuODk5NzQz
    IDgwMi41MDUyODUgNzcyLjY5NDM3OSA3MjcuMjQ2MzAxIDgx
    OC4zMzY1NTggNjUzLjczMzIzMSA4NTAuMzEwNTUyIDU4My45
    MTUzMDYgODgyLjc5MTczNyA1MTIuOTkwMTA3IDkwMC4zODA5
    ODIgNDQ3LjU0NzkxMSA5MDAuMzgwOTgyIDM4OC4zODA5ODIg
    OTAwLjM4MDk4MiAxNzMuODg0MDk3IDcyNi40OTY4MTQgMCA1
    MTIgMCAyOTcuNTAzMTg2IDAgMTIzLjYxOTAxOCAxNzMuODg0
    MDk3IDEyMy42MTkwMTggMzg4LjM4MDk4MiAxMjMuNjE5MDE4
    IDQ1My45MTQ5OTQgMTQ4LjExMjQ0MiA1MjkuODk2NTYgMTky
    LjYzODkwOSA2MTUuMDI0MjY5IDIyMi44MDExMDUgNjcyLjY4
    OTk2NSAyNjEuNTYzOTk5IDczMy4zMjcxNDcgMzA2LjkxNzAx
    MSA3OTUuNjM1ODMxIDM0Ni4xNjM3OTIgODQ5LjU1NTIwNCAz
    ODguMTQ0MDY5IDkwMS43NTM0NDkgNDMwLjEyNTIyOSA5NTAu
    MzAxODY2IDQ0NC44MjQ3NDMgOTY3LjMwMDczNyA0NTguNDg1
    NjkxIDk4Mi42NDE2NDUgNDcwLjc2NTA2MiA5OTYuMDc5MDA5
    IDQ3NS4wODEwMzMgMTAwMC44MDIwMzkgNDc4LjkyMjEyMSAx
    MDA0Ljk1NjAwMyA0ODIuMjQ1MjUgMTAwOC41MTAwNzggNDg0
    LjI2ODM2MiAxMDEwLjY3MzY0MiA0ODUuNjg3MzY1IDEwMTIu
    MTc1MTk0IDQ4Ni40NTkxODQgMTAxMi45ODM4MzggNTAwLjEz
    MzkwMiAxMDI3LjMxMTE2IDUyMi45MTY2ODMgMTAyNy41ODk1
    OTQgNTM2LjkzNzU5IDEwMTMuNjAwNzQ2IDUzNy43MjI0NzIg
    MTAxMi44MTc1NzYgNTM5LjE1NDUzOSAxMDExLjM3MjUzNCA1
    NDEuMTkwODkxIDEwMDkuMjkzMjQ4Wk01MzcuNTQwODE2IDk2
    NC4yMjg0MzJDNTM2LjkzMzUyOSA5NjMuNTkyMDg3IDUzNS42
    ODAyOTUgOTYyLjI2NTgxOSA1MzMuODI0MzYzIDk2MC4yODA5
    OCA1MzAuNjgyNTM4IDk1Ni45MjEwNDQgNTI3LjAyNDM0MiA5
    NTIuOTY0NzgzIDUyMi44OTI2NzQgOTQ4LjQ0MzU4NyA1MTEu
    MDM2Mjg2IDkzNS40Njg4NzMgNDk3LjgwMjkxIDkyMC42MDgw
    NzUgNDgzLjUzOTI2NSA5MDQuMTEzMTk5IDQ0Mi43Njg3OTUg
    ODU2Ljk2NTE5NiA0MDEuOTk3NDQyIDgwNi4yNzAwMDMgMzY0
    LjAwOTM2OSA3NTQuMDc5Njg0IDMyMC41NTM1OTcgNjk0LjM3
    NzYzNiAyODMuNTk5MTQ3IDYzNi41Njk0MjIgMjU1LjIxMDk2
    OSA1ODIuMjk1NjM0IDIxNS40OTM4OTQgNTA2LjM2MjQ5MSAx
    OTQuMjMzNzQyIDQ0MC40MTEwNCAxOTQuMjMzNzQyIDM4OC4z
    ODA5ODIgMTk0LjIzMzc0MiAyMTIuODgzNTMyIDMzNi41MDI0
    NjIgNzAuNjE0NzI0IDUxMiA3MC42MTQ3MjQgNjg3LjQ5NzUz
    OCA3MC42MTQ3MjQgODI5Ljc2NjI1OCAyMTIuODgzNTMyIDgy
    OS43NjYyNTggMzg4LjM4MDk4MiA4MjkuNzY2MjU4IDQzNi4w
    Mzk2MzYgODE0LjcwOTI1NyA0OTIuMDYwMjM4IDc4Ni4xMDgx
    NzUgNTU0LjUxMjk1OSA3NTYuNDMyODY3IDYxOS4zMTE0MzEg
    NzEzLjI3MDE0NiA2ODguODMxMTMyIDY2MC4xNzM4NzYgNzYw
    LjQ1MDQ5MiA2MjIuMjYzMzAzIDgxMS41ODY0NjIgNTgxLjU3
    MjYyNyA4NjAuNzU3MSA1NDAuODg1NDgyIDkwNi4xMTM1Mzgg
    NTI2LjY1NDE0NCA5MjEuOTc4MjEyIDUxMy40NTI3MjEgOTM2
    LjIxOTA2NiA1MDEuNjI4Mjg2IDk0OC42MDk2NTUgNDk3LjUx
    MTA5NCA5NTIuOTI0MDU2IDQ5My44NjcwMjIgOTU2LjY5MjEy
    OCA0OTAuNzM5NDk1IDk1OS44ODU2OTcgNDg4Ljg5NjgwNCA5
    NjEuNzY3MzMyIDQ4Ny42NTY4MSA5NjMuMDE4NjQzIDQ4Ny4w
    NjI0MSA5NjMuNjExNTI0TDUzNy41NDA4MTYgOTY0LjIyODQz
    MlpNNjcwLjg4MzEyOSAzODguMzgwOTgyQzY3MC44ODMxMjkg
    MzAwLjYzMjI0OCA1OTkuNzQ4NjgxIDIyOS40OTc4NTMgNTEy
    IDIyOS40OTc4NTMgNDI0LjI1MTMxOSAyMjkuNDk3ODUzIDM1
    My4xMTY4NzEgMzAwLjYzMjI0OCAzNTMuMTE2ODcxIDM4OC4z
    ODA5ODIgMzUzLjExNjg3MSA0NzYuMTI5NzE1IDQyNC4yNTEz
    MTkgNTQ3LjI2NDExIDUxMiA1NDcuMjY0MTEgNTk5Ljc0ODY4
    MSA1NDcuMjY0MTEgNjcwLjg4MzEyOSA0NzYuMTI5NzE1IDY3
    MC44ODMxMjkgMzg4LjM4MDk4MlpNNDIzLjczMTU5NSAzODgu
    MzgwOTgyQzQyMy43MzE1OTUgMzM5LjYzMTY4MyA0NjMuMjUw
    NzcyIDMwMC4xMTI1NzcgNTEyIDMwMC4xMTI1NzcgNTYwLjc0
    OTIyOCAzMDAuMTEyNTc3IDYwMC4yNjg0MDUgMzM5LjYzMTY4
    MyA2MDAuMjY4NDA1IDM4OC4zODA5ODIgNjAwLjI2ODQwNSA0
    MzcuMTMwMjggNTYwLjc0OTIyOCA0NzYuNjQ5Mzg3IDUxMiA0
    NzYuNjQ5Mzg3IDQ2My4yNTA3NzIgNDc2LjY0OTM4NyA0MjMu
    NzMxNTk1IDQzNy4xMzAyOCA0MjMuNzMxNTk1IDM4OC4zODA5
    ODJaIiBmaWxsPSIjMzg5QkZGIiBwLWlkPSI2NTkxIj48L3Bh
    dGg+PC9zdmc+`;

  // 移除相关handler
  function clearHandlers() {
    if (handler) {
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      handler.destroy();
      handler = null;
    }
    if (modifyHandler) {
      modifyHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      modifyHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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

  // 开始绘制
  function startDraw() {

    clearDraw();
    state = 1;
    handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

    // 左键单击 => 确定各点
    handler.setInputAction((evt) => {

      const ray = viewer.camera.getPickRay(evt.position);
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (!cartesian) return;
      pointList.push(cartesian.clone());

      state = -1;
      primitive = showPrimitiveOnMap();

      // 清理工作
      floatPoint.show = false;

      clearHandlers();
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // 鼠标移动 => 满足条件则动态绘制
    handler.setInputAction((evt) => {

      const ray = viewer.camera.getPickRay(evt.endPosition);
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (!cartesian) return;

      // 动态点的物理载体
      if (floatPoint) floatPoint.position = cartesian.clone();
      else floatPoint = createPoint(cartesian.clone());

    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

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
    if (primitive) {
      viewer.billboards.remove(primitive);
      primitive = null;
    }
  }

  // 开始编辑
  function startModify() {
    if (!modifyHandler) {
      modifyHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    }
    state = 2;
    floatPoint.show = true;

    // 左键单击 => 选择点 or 放置点
    modifyHandler.setInputAction(evt => {
      const ray = viewer.camera.getPickRay(evt.position);
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (!cartesian) return;

      primitive && (primitive.position = cartesian);
      overModify();

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // 鼠标移动
    modifyHandler.setInputAction(evt => {

      const ray = viewer.camera.getPickRay(evt.endPosition);
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (!cartesian) return;

      if (floatPoint) {
        floatPoint.position = cartesian.clone();
        pointList.length > 0 && (pointList[0] = cartesian.clone());
      }

    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  // 结束编辑
  function overModify() {
    //取消“面”的选中，结束本次修改
    floatPoint.show = false;
    state = -1;

    clearHandlers();
  }

  function showPrimitiveOnMap() {
    if (pointList.length === 0) return null;
    const cartesian = pointList[0];

    return viewer.billboards.add({
      position: cartesian,
      image: marker,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    });
  }

  return {
    startDraw,
    clearDraw,
    startModify
  }
}

export const usePointScript = `
  function usePoint() {
    let state = -1; // 1 => 创建中, 2 => 编辑中, -1 => 静止态 
    let handler = null; // 创建用到的handler 
    let modifyHandler = null; // 编辑用到的handler 
    let pointList = []; // 所有点 
    let floatPoint = null; // 当前移动点 
    let primitive = null; // 绘制结束得到的结果载体 

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

    const marker = \`data:image/svg+xml;base64,
      PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/
      PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBT
      VkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBo
      aWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIx
      NzgxMDU0MDU5MjU3IiBjbGFzcz0iaWNvbiIgdmlld0JveD0i
      MCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0i
      aHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjY1
      OTAiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8x
      OTk5L3hsaW5rIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxw
      YXRoIGQ9Ik01NDEuMTkwODkxIDEwMDkuMjkzMjQ4QzU0NC41
      MjgzMiAxMDA1Ljg4NTI3NSA1NDguMzgzNzA3IDEwMDEuODk4
      NzA0IDU1Mi43MTM5NzggOTk3LjM2MTA5IDU2NS4wMjUzMDIg
      OTg0LjQ2MDE4NiA1NzguNzE4MzggOTY5LjY4ODg5MiA1OTMu
      NDUwMDI0IDk1My4yNjY2MjYgNjM1LjUxNDUwOSA5MDYuMzc0
      NjE4IDY3Ny41NzU0NjMgODU1LjU0ODE1MiA3MTYuODk5NzQz
      IDgwMi41MDUyODUgNzcyLjY5NDM3OSA3MjcuMjQ2MzAxIDgx
      OC4zMzY1NTggNjUzLjczMzIzMSA4NTAuMzEwNTUyIDU4My45
      MTUzMDYgODgyLjc5MTczNyA1MTIuOTkwMTA3IDkwMC4zODA5
      ODIgNDQ3LjU0NzkxMSA5MDAuMzgwOTgyIDM4OC4zODA5ODIg
      OTAwLjM4MDk4MiAxNzMuODg0MDk3IDcyNi40OTY4MTQgMCA1
      MTIgMCAyOTcuNTAzMTg2IDAgMTIzLjYxOTAxOCAxNzMuODg0
      MDk3IDEyMy42MTkwMTggMzg4LjM4MDk4MiAxMjMuNjE5MDE4
      IDQ1My45MTQ5OTQgMTQ4LjExMjQ0MiA1MjkuODk2NTYgMTky
      LjYzODkwOSA2MTUuMDI0MjY5IDIyMi44MDExMDUgNjcyLjY4
      OTk2NSAyNjEuNTYzOTk5IDczMy4zMjcxNDcgMzA2LjkxNzAx
      MSA3OTUuNjM1ODMxIDM0Ni4xNjM3OTIgODQ5LjU1NTIwNCAz
      ODguMTQ0MDY5IDkwMS43NTM0NDkgNDMwLjEyNTIyOSA5NTAu
      MzAxODY2IDQ0NC44MjQ3NDMgOTY3LjMwMDczNyA0NTguNDg1
      NjkxIDk4Mi42NDE2NDUgNDcwLjc2NTA2MiA5OTYuMDc5MDA5
      IDQ3NS4wODEwMzMgMTAwMC44MDIwMzkgNDc4LjkyMjEyMSAx
      MDA0Ljk1NjAwMyA0ODIuMjQ1MjUgMTAwOC41MTAwNzggNDg0
      LjI2ODM2MiAxMDEwLjY3MzY0MiA0ODUuNjg3MzY1IDEwMTIu
      MTc1MTk0IDQ4Ni40NTkxODQgMTAxMi45ODM4MzggNTAwLjEz
      MzkwMiAxMDI3LjMxMTE2IDUyMi45MTY2ODMgMTAyNy41ODk1
      OTQgNTM2LjkzNzU5IDEwMTMuNjAwNzQ2IDUzNy43MjI0NzIg
      MTAxMi44MTc1NzYgNTM5LjE1NDUzOSAxMDExLjM3MjUzNCA1
      NDEuMTkwODkxIDEwMDkuMjkzMjQ4Wk01MzcuNTQwODE2IDk2
      NC4yMjg0MzJDNTM2LjkzMzUyOSA5NjMuNTkyMDg3IDUzNS42
      ODAyOTUgOTYyLjI2NTgxOSA1MzMuODI0MzYzIDk2MC4yODA5
      OCA1MzAuNjgyNTM4IDk1Ni45MjEwNDQgNTI3LjAyNDM0MiA5
      NTIuOTY0NzgzIDUyMi44OTI2NzQgOTQ4LjQ0MzU4NyA1MTEu
      MDM2Mjg2IDkzNS40Njg4NzMgNDk3LjgwMjkxIDkyMC42MDgw
      NzUgNDgzLjUzOTI2NSA5MDQuMTEzMTk5IDQ0Mi43Njg3OTUg
      ODU2Ljk2NTE5NiA0MDEuOTk3NDQyIDgwNi4yNzAwMDMgMzY0
      LjAwOTM2OSA3NTQuMDc5Njg0IDMyMC41NTM1OTcgNjk0LjM3
      NzYzNiAyODMuNTk5MTQ3IDYzNi41Njk0MjIgMjU1LjIxMDk2
      OSA1ODIuMjk1NjM0IDIxNS40OTM4OTQgNTA2LjM2MjQ5MSAx
      OTQuMjMzNzQyIDQ0MC40MTEwNCAxOTQuMjMzNzQyIDM4OC4z
      ODA5ODIgMTk0LjIzMzc0MiAyMTIuODgzNTMyIDMzNi41MDI0
      NjIgNzAuNjE0NzI0IDUxMiA3MC42MTQ3MjQgNjg3LjQ5NzUz
      OCA3MC42MTQ3MjQgODI5Ljc2NjI1OCAyMTIuODgzNTMyIDgy
      OS43NjYyNTggMzg4LjM4MDk4MiA4MjkuNzY2MjU4IDQzNi4w
      Mzk2MzYgODE0LjcwOTI1NyA0OTIuMDYwMjM4IDc4Ni4xMDgx
      NzUgNTU0LjUxMjk1OSA3NTYuNDMyODY3IDYxOS4zMTE0MzEg
      NzEzLjI3MDE0NiA2ODguODMxMTMyIDY2MC4xNzM4NzYgNzYw
      LjQ1MDQ5MiA2MjIuMjYzMzAzIDgxMS41ODY0NjIgNTgxLjU3
      MjYyNyA4NjAuNzU3MSA1NDAuODg1NDgyIDkwNi4xMTM1Mzgg
      NTI2LjY1NDE0NCA5MjEuOTc4MjEyIDUxMy40NTI3MjEgOTM2
      LjIxOTA2NiA1MDEuNjI4Mjg2IDk0OC42MDk2NTUgNDk3LjUx
      MTA5NCA5NTIuOTI0MDU2IDQ5My44NjcwMjIgOTU2LjY5MjEy
      OCA0OTAuNzM5NDk1IDk1OS44ODU2OTcgNDg4Ljg5NjgwNCA5
      NjEuNzY3MzMyIDQ4Ny42NTY4MSA5NjMuMDE4NjQzIDQ4Ny4w
      NjI0MSA5NjMuNjExNTI0TDUzNy41NDA4MTYgOTY0LjIyODQz
      MlpNNjcwLjg4MzEyOSAzODguMzgwOTgyQzY3MC44ODMxMjkg
      MzAwLjYzMjI0OCA1OTkuNzQ4NjgxIDIyOS40OTc4NTMgNTEy
      IDIyOS40OTc4NTMgNDI0LjI1MTMxOSAyMjkuNDk3ODUzIDM1
      My4xMTY4NzEgMzAwLjYzMjI0OCAzNTMuMTE2ODcxIDM4OC4z
      ODA5ODIgMzUzLjExNjg3MSA0NzYuMTI5NzE1IDQyNC4yNTEz
      MTkgNTQ3LjI2NDExIDUxMiA1NDcuMjY0MTEgNTk5Ljc0ODY4
      MSA1NDcuMjY0MTEgNjcwLjg4MzEyOSA0NzYuMTI5NzE1IDY3
      MC44ODMxMjkgMzg4LjM4MDk4MlpNNDIzLjczMTU5NSAzODgu
      MzgwOTgyQzQyMy43MzE1OTUgMzM5LjYzMTY4MyA0NjMuMjUw
      NzcyIDMwMC4xMTI1NzcgNTEyIDMwMC4xMTI1NzcgNTYwLjc0
      OTIyOCAzMDAuMTEyNTc3IDYwMC4yNjg0MDUgMzM5LjYzMTY4
      MyA2MDAuMjY4NDA1IDM4OC4zODA5ODIgNjAwLjI2ODQwNSA0
      MzcuMTMwMjggNTYwLjc0OTIyOCA0NzYuNjQ5Mzg3IDUxMiA0
      NzYuNjQ5Mzg3IDQ2My4yNTA3NzIgNDc2LjY0OTM4NyA0MjMu
      NzMxNTk1IDQzNy4xMzAyOCA0MjMuNzMxNTk1IDM4OC4zODA5
      ODJaIiBmaWxsPSIjMzg5QkZGIiBwLWlkPSI2NTkxIj48L3Bh
      dGg+PC9zdmc+\`;


    // 移除相关handler
    function clearHandlers() {
      if (handler) {
        handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        handler.destroy();
        handler = null;
      }
      if (modifyHandler) {
        modifyHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        modifyHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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

    // 开始绘制
    function startDraw() {

      clearDraw();
      state = 1;
      handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

      // 左键单击 => 确定各点
      handler.setInputAction((evt) => {

        const ray = viewer.camera.getPickRay(evt.position);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (!cartesian) return;
        pointList.push(cartesian.clone());

        state = -1;
        primitive = showPrimitiveOnMap();

        // 清理工作
        floatPoint.show = false;

        clearHandlers();
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // 鼠标移动 => 满足条件则动态绘制
      handler.setInputAction((evt) => {

        const ray = viewer.camera.getPickRay(evt.endPosition);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (!cartesian) return;

        // 动态点的物理载体
        if (floatPoint) floatPoint.position = cartesian.clone();
        else floatPoint = createPoint(cartesian.clone());

      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

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
      if (primitive) {
        viewer.billboards.remove(primitive);
        primitive = null;
      }
    }

    // 开始编辑
    function startModify() {
      if (!modifyHandler) {
        modifyHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      }
      state = 2;
      floatPoint.show = true;

      // 左键单击 => 选择点 or 放置点
      modifyHandler.setInputAction(evt => {
        const ray = viewer.camera.getPickRay(evt.position);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (!cartesian) return;

        primitive && (primitive.position = cartesian);
        overModify();

      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // 鼠标移动
      modifyHandler.setInputAction(evt => {

        const ray = viewer.camera.getPickRay(evt.endPosition);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (!cartesian) return;

        if (floatPoint) {
          floatPoint.position = cartesian.clone();
          pointList.length > 0 && (pointList[0] = cartesian.clone());
        }

      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    // 结束编辑
    function overModify() {
      //取消“面”的选中，结束本次修改
      floatPoint.show = false;
      state = -1;

      clearHandlers();
    }

    function showPrimitiveOnMap() {
      if (pointList.length === 0) return null;
      const cartesian = pointList[0];

      return viewer.billboards.add({
        position: cartesian,
        image: marker,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      });
    }

    return {
      startDraw,
      clearDraw,
      startModify
    }
  }

  const {
    startDraw,
    clearDraw,
    startModify
  } = usePoint();
`;
