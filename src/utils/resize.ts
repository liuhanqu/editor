import * as ReactDOM from 'react-dom';

interface Point {
  x: number;
  y: number;
}

// 中心点的坐标
function getCenterPosition(resize: React.ReactInstance): Point {
  const node = ReactDOM.findDOMNode(resize);
  const { left, top, width, height } = node.getBoundingClientRect();

  return {
    x: left + width / 2,
    y: top + height / 2,
  };
}

// 鼠标坐标，相对于视窗
function getMousePosition(evt: React.MouseEvent<HTMLElement>): Point {
  return {
    x: evt.clientX,
    y: evt.clientY,
  };
}

// 拉伸点相对于中心点的镜像点
function getRefPosition(start: Point, center: Point): Point {
  // 在对角线上延伸一段距离，移动的距离才会出现负值
  const x = center.x - (start.x - center.x) * 10;
  const y = center.y - (start.y - center.y) * 10;
  return { x, y };
}

function calcTopLeft(centerX: number, centerY: number, width: number, height: number) {
  const left = centerX - width / 2;
  const top = centerY - height / 2;
  return {
    newLeft: left,
    newTop: top,
  };
}

// 计算移动的距离
function calcMovedDistance(ref: Point, start: Point, current: Point): number {
  const original = calcDistanceBetweenTwoPoint(ref, start);
  const curr = calcDistanceBetweenTwoPoint(ref, current);

  return curr - original;
}

// 获取两点间的距离
function calcDistanceBetweenTwoPoint(pointA: Point, pointB: Point): number {
  // const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const distance = Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
  return distance;
}

function degree2Radian(deg: number) {
  const radian = deg * Math.PI / 180;
  return radian;
}

function radian2Degree(radian: number) {
  const deg = radian * 180 / Math.PI;
  return deg;
}

// 鼠标、中心点、镜像坐标及宽高
export function getSizeAndPositions(
  evt: React.MouseEvent<HTMLElement>,
  resize: React.ReactInstance
) {
  const start = getMousePosition(evt);
  const center = getCenterPosition(resize);
  const ref = getRefPosition(start, center);
  const node = ReactDOM.findDOMNode(resize) as HTMLElement;
  const width = node.offsetWidth;
  const height = node.offsetHeight;

  return {
    start,
    center,
    ref,
    width,
    height,
  };
}

// 计算旋转的角度
export function calcRotateDeg(
  evt: React.MouseEvent<HTMLElement>,
  resize: React.ReactInstance
): number {
  const current = getMousePosition(evt);
  const center = getCenterPosition(resize);

  let radian = Math.atan2(current.y - center.y, current.x - center.x);
  if (radian > -Math.PI && radian < -Math.PI / 2) {
    radian = radian + 2 * Math.PI;
  }
  const deg = Math.round(radian2Degree(radian) + 90);
  return deg;
}

// 拉伸时，计算出新的top、left、width、height
export function calcRect(evt: React.MouseEvent<HTMLElement>, resize: React.Component<any, any>) {
  // 当前的鼠标坐标
  const current = getMousePosition(evt);

  const { props, state } = resize;

  // 旋转的角度
  const { rotate } = props;
  const offsetParent = document.querySelector('.canvas') as HTMLElement;

  // start -- 开始拉伸(mousedown)时，鼠标的坐标
  // center -- 中心点的坐标
  // refer -- 拉伸点往中心点方向延伸的坐标
  // direction -- 拉伸的方向
  // width -- 拉伸前的宽度
  // height -- 拉伸前的高度
  const { start, center, ref, direction, width, height } = state;

  // 对角线的值
  // const diagonal = Math.sqrt(width ** 2 + height ** 2);
  const diagonal = Math.hypot(width + height);

  // 移动的距离
  let distance = calcMovedDistance(ref, start, current);
  // 会有些许偏差，导致宽高小于0，所以要保证移动的距离的绝对值不能大于对角线的大小
  distance = distance < -diagonal ? -diagonal : distance;

  // 新的top、left是相对于视口的，还需要减去画布相对于视口的top、left
  const { top: outerTop, left: outerLeft } = offsetParent.getBoundingClientRect();

  const alpha = Math.atan2(height, width) + degree2Radian(rotate);
  const beta = Math.atan2(width, height) + degree2Radian(rotate);

  // const scale = distance / diagonal < -1 ? -1 : distance / diagonal;
  const scale = distance / diagonal;

  let newTop, newLeft, newHeight, newWidth, newCenterX, newCenterY, dx, dy;

  switch (direction) {
    case 'e':
    case 'w':
      distance = distance < -width ? -width : distance;
      newWidth = width + distance;
      newHeight = height;
      dx = distance * Math.cos(degree2Radian(rotate)) / 2;
      dy = distance * Math.sin(degree2Radian(rotate)) / 2;
      newCenterX = direction === 'e' ? center.x + dx : center.x - dx;
      newCenterY = direction === 'e' ? center.y + dy : center.y - dy;
      ({ newLeft, newTop } = calcTopLeft(newCenterX, newCenterY, newWidth, newHeight));
      break;
    case 'n':
    case 's':
      distance = distance < -height ? -height : distance;
      newHeight = height + distance;
      newWidth = width;
      dx = distance * Math.sin(degree2Radian(rotate)) / 2;
      dy = distance * Math.cos(degree2Radian(rotate)) / 2;
      newCenterX = direction === 's' ? center - dx : center.x + dx;
      newCenterY = direction === 's' ? center.y + dy : center.y - dy;
      ({ newLeft, newTop } = calcTopLeft(newCenterX, newCenterY, newWidth, newHeight));
      break;
    case 'se':
    case 'nw':
      newWidth = width * (1 + scale);
      newHeight = height * (1 + scale);
      dx = distance * Math.cos(alpha) / 2;
      dy = distance * Math.sin(alpha) / 2;
      if (direction === 'se') {
        newCenterX = center.x + dx;
        newCenterY = center.y + dy;
      } else if (direction === 'nw') {
        newCenterX = center.x - dx;
        newCenterY = center.y - dy;
      }
      ({ newLeft, newTop } = calcTopLeft(newCenterX, newCenterY, newWidth, newHeight));
      break;
    case 'sw':
    case 'ne':
      newWidth = width * (1 + scale);
      newHeight = height * (1 + scale);
      dx = distance * Math.sin(beta) / 2;
      dy = distance * Math.cos(beta) / 2;
      // newCenterX = center.x + dx;
      // newCenterY = center.y + dy;

      if (direction === 'ne') {
        newCenterX = center.x + dx;
        newCenterY = center.y - dy;
      } else if (direction === 'sw') {
        newCenterX = center.x - dx;
        newCenterY = center.y + dy;
      }
      ({ newLeft, newTop } = calcTopLeft(newCenterX, newCenterY, newWidth, newHeight));
      break;
  }
  return {
    left: Math.round((newLeft as number) - outerLeft),
    top: Math.round((newTop as number) - outerTop),
    width: Math.round(newWidth),
    height: Math.round(newHeight),
  };
}
