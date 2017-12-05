import * as ReactDOM from 'react-dom';

// 中心点的坐标
function getCenterPosition(resize: React.ReactInstance) {
  const node = ReactDOM.findDOMNode(resize);
  const { left, top, width, height } = node.getBoundingClientRect();

  return {
    centerX: left + width / 2,
    centerY: top + height / 2,
  };
}

// 鼠标坐标，相对于视窗
function getMousePosition(evt: React.MouseEvent<HTMLElement>) {
  return {
    x: evt.clientX,
    y: evt.clientY,
  };
}

// 拉伸点相对于中心点的镜像点
function getReferPosition(x: number, y: number, centerX: number, centerY: number) {
  // const referX = 2 * centerX - x;
  // const referY = 2 * centerY - y;
  // 在对角线上延伸一段距离，移动的距离才会出现负值
  const referX = centerX - (x - centerX) * 10;
  const referY = centerY - (y - centerY) * 10;
  return { referX, referY };
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
function calcDistance(
  referX: number,
  referY: number,
  startX: number,
  startY: number,
  currentX: number,
  currentY: number
) {
  const original = getDistance(referX, referY, startX, startY);
  const curr = getDistance(referX, referY, currentX, currentY);

  return curr - original;
}

// 获取两点间的距离
function getDistance(x1: number, y1: number, x2: number, y2: number) {
  const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
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

// 鼠标、中心点、镜像坐标
export function getPositions(evt: React.MouseEvent<HTMLElement>, resize: React.ReactInstance) {
  const { x, y } = getMousePosition(evt);
  const { centerX, centerY } = getCenterPosition(resize);
  const { referX, referY } = getReferPosition(x, y, centerX, centerY);
  const node = ReactDOM.findDOMNode(resize) as HTMLElement;
  const width = node.offsetWidth;
  const height = node.offsetHeight;

  return {
    startX: x,
    startY: y,
    centerX,
    centerY,
    referX,
    referY,
    width,
    height,
  };
}

// 计算旋转的角度
export function calcRotateDeg(evt: React.MouseEvent<HTMLElement>, resize: React.ReactInstance) {
  const { x, y } = getMousePosition(evt);
  const { centerX, centerY } = getCenterPosition(resize);

  let radian = Math.atan2(y - centerY, x - centerX);
  if (radian > -Math.PI && radian < -Math.PI / 2) {
    radian = radian + 2 * Math.PI;
  }
  const deg = Math.round(radian2Degree(radian) + 90);
  return deg;
}

// 拉伸时，计算出新的top、left、width、height
export function calcPosition(evt: React.MouseEvent<HTMLElement>, resize: React.Component<any, any>) {
  // 当前的鼠标坐标
  const { x, y } = getMousePosition(evt);

  const { props, state } = resize;
  
  // 旋转的角度
  const { rotate } = props;
  const offsetParent = document.querySelector('.canvas') as HTMLElement;

  // start -- 开始拉伸(mousedown)时，鼠标的坐标
  // center -- 中心点的坐标
  // refer -- 拉伸点相对于中心点的镜像坐标
  // direction -- 拉伸的方向
  // width -- 拉伸前的宽度
  // height -- 拉伸前的高度
  const { startX, startY, centerX, centerY, referX, referY, direction, width, height } = state;

  // 对角线的值
  const diagonal = Math.sqrt(width ** 2 + height ** 2);

  // 移动的距离
  let distance = calcDistance(referX, referY, startX, startY, x, y);
  distance = distance < -diagonal ? -diagonal : distance;

  const { top: outerTop, left: outerLeft } = offsetParent.getBoundingClientRect();

  const alpha = Math.atan2(height, width) + degree2Radian(rotate);
  const beta = Math.atan2(width, height) + degree2Radian(rotate);

  const scale = distance / diagonal < -1 ? -1 : distance / diagonal;

  let newTop, newLeft, newHeight, newWidth, newCenterX, newCenterY, dx, dy;

  switch (direction) {
    case 'e':
    case 'w':
      distance = distance < -width ? -width : distance;
      newWidth = width + distance;
      newHeight = height;
      dx = distance * Math.cos(degree2Radian(rotate)) / 2;
      dy = distance * Math.sin(degree2Radian(rotate)) / 2;
      newCenterX = direction === 'e' ? centerX + dx : centerX - dx;
      newCenterY = direction === 'e' ? centerY + dy : centerY - dy;
      ({ newLeft, newTop } = calcTopLeft(newCenterX, newCenterY, newWidth, newHeight));
      break;
    case 'n':
    case 's':
      distance = distance < -height ? -height : distance;
      newHeight = height + distance;
      newWidth = width;
      dx = distance * Math.sin(degree2Radian(rotate)) / 2;
      dy = distance * Math.cos(degree2Radian(rotate)) / 2;
      newCenterX = direction === 's' ? centerX - dx : centerX + dx;
      newCenterY = direction === 's' ? centerY + dy : centerY - dy;
      ({ newLeft, newTop } = calcTopLeft(newCenterX, newCenterY, newWidth, newHeight));
      break;
    case 'se':
    case 'nw':
      newWidth = width * (1 + scale);
      newHeight = height * (1 + scale);
      dx = distance * Math.cos(alpha) / 2;
      dy = distance * Math.sin(alpha) / 2;
      if (direction === 'se') {
        newCenterX = centerX + dx;
        newCenterY = centerY + dy;
      } else if (direction === 'nw') {
        newCenterX = centerX - dx;
        newCenterY = centerY - dy;
      }
      ({ newLeft, newTop } = calcTopLeft(newCenterX, newCenterY, newWidth, newHeight));
      break;
    case 'sw':
    case 'ne':
      newWidth = width * (1 + scale);
      newHeight = height * (1 + scale);
      dx = distance * Math.sin(beta) / 2;
      dy = distance * Math.cos(beta) / 2;
      newCenterX = centerX + dx;
      newCenterY = centerY + dy;

      if (direction === 'ne') {
        newCenterX = centerX + dx;
        newCenterY = centerY - dy;
      } else if (direction === 'sw') {
        newCenterX = centerX - dx;
        newCenterY = centerY + dy;
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

