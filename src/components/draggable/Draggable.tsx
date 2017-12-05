import * as React from 'react';

import { throttle } from 'utils/throttle';
import { addEventsToDocument, removeEventsFromDocument, getMousePosition } from 'utils/event';
import { createMouseData, createUIData } from 'utils/drag';

import './style.css';

interface UIData {
  tx: number;
  ty: number;
}

interface DraggableProps {
  onMouseDown?: (evt: MouseEvent) => {};
  onStart?: (data: UIData) => void;
  onDrag?: (data: UIData) => void;
  onStop?: (data: UIData) => void;
  disabled?: boolean;
  grid?: [number, number];
  defaultPosition?: {
    x: number;
    y: number;
  };
  position?: {
    x: number;
    y: number;
  };
  children: React.ReactNode;
}

interface DraggableState {
  dragging: boolean;
  tx: number;
  ty: number;
  lastX: number;
  lastY: number;
}

class Draggable extends React.Component<DraggableProps, DraggableState> {
  throttleDrag: (evt: MouseEvent) => void;

  static defaultProps = {
    defaultPosition: { x: 0, y: 0 },
    position: null,
    disabled: false,
  };

  constructor(props: DraggableProps) {
    super(props);
    this.state = {
      dragging: false,
      // transform，移动的距离
      tx: props.position ? props.position.x : props.defaultPosition!.x,
      ty: props.position ? props.position.y : props.defaultPosition!.y,
      // 上一次鼠标的坐标(snap时，需要用到)
      lastX: NaN,
      lastY: NaN,
    };
    this.throttleDrag = throttle(this.handleDrag);
  }

  handleMouseDown = (evt: MouseEvent) => {
    if (this.props.onMouseDown) {
      this.props.onMouseDown(evt);
    }
    this.handleStart(evt);
  };

  handleStart = (evt: MouseEvent) => {
    if (this.props.disabled) {
      return;
    }

    const { x, y } = getMousePosition(evt);
    // { tx, ty }
    const uiData = createUIData(this, createMouseData(this, x, y));

    let shouldUpdate: void | boolean = true;
    if (this.props.onStart) {
      shouldUpdate = this.props.onStart(uiData);
    }
    if (shouldUpdate === false) {
      return;
    }

    this.setState({
      dragging: true,
      lastX: x,
      lastY: y,
    });

    addEventsToDocument({
      mousemove: this.throttleDrag,
      mouseup: this.handleStop,
    });
  };

  handleDrag = (evt: MouseEvent) => {
    if (!this.state.dragging) {
      return;
    }
    let { x, y } = getMousePosition(evt);
    if (this.props.grid) {
      let deltaX = x - this.state.lastX;
      let deltaY = y - this.state.lastY;
      // [deltaX, deltaY] = snapToGrid(this.props.grid, deltaX, deltaY);
      if (!deltaX && !deltaY) {
        return;
      }
      x = this.state.lastX + deltaX;
      y = this.state.lastY + deltaY;
    }

    // { deltaX, deltaY, lastX, lastY }
    const mouseData = createMouseData(this, x, y);
    // { tx, ty }
    const uiData = createUIData(this, mouseData);

    if (this.props.onDrag) {
      this.props.onDrag(uiData);
    }

    // todo -- bounding handle

    this.setState({
      lastX: mouseData.lastX,
      lastY: mouseData.lastY,
      ...uiData,
    });
  };

  handleStop = (evt: MouseEvent) => {
    if (!this.state.dragging) {
      return;
    }
    const { tx, ty } = this.state;
    const isControl = !!this.props.position;
    if (isControl) {
      this.setState({
        tx: this.props.position!.x,
        ty: this.props.position!.y,
      });
    }

    this.setState({
      dragging: false,
      lastX: NaN,
      lastY: NaN,
    });

    if (this.props.onStop) {
      this.props.onStop({ tx, ty });
    }

    removeEventsFromDocument({
      mousemove: this.throttleDrag,
      mouseup: this.handleStop,
    });
  };

  render() {
    const isControl = !!this.props.position;
    const draggable = !isControl || this.state.dragging;
    const { tx, ty } = this.state;

    const transformOpts = {
      x: draggable ? tx : this.props.position!.x,
      y: draggable ? ty : this.props.position!.y,
    };

    let style = {};
    if (transformOpts.x || transformOpts.y) {
      style = {
        transform: `translate(${+transformOpts.x}px, ${+transformOpts.y}px)`,
      };
    }
    return React.cloneElement(React.Children.only(this.props.children), {
      style: { ...(this.props.children as any).props.style, ...style },
      onMouseDown: this.handleMouseDown,
    });
  }
}

export default Draggable;
