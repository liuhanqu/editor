interface MouseData {
  deltaX: number,
  deltaY: number,
  lastX: number,
  lastY: number,
}

export function createMouseData(draggable: any, x: number, y: number): MouseData {
  const { state } = draggable;
  const isStart = Number.isNaN(state.lastX);

  if (isStart) {
    return {
      deltaX: 0,
      deltaY: 0,
      lastX: x,
      lastY: y,
    };
  } else {
    return {
      deltaX: x - state.lastX,
      deltaY: y - state.lastY,
      lastX: x,
      lastY: y,
    };
  }
}

export function createUIData(draggable: any, mouseData: MouseData) {
  const { state } = draggable;

  return {
    tx: state.tx + mouseData.deltaX,
    ty: state.ty + mouseData.deltaY,
  };
}
