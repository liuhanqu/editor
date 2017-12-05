import * as React from 'react';

import { addEventsToDocument, removeEventsFromDocument } from 'utils/event';
import { calcRotateDeg, getPositions, calcPosition } from 'utils/resize';
import { throttle } from 'utils/throttle';

import './style.css';

const directionMap = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
const WAIT = 20;

interface ResizeProps {
  rotate: number;
  directions: string[];
  canRotate: boolean;
  onRotateStart?: Function;
  onRotate: Function;
  onRotateStop: Function;
  onScaleStart?: () => {};
  onScale: Function;
  onScaleStop: Function;
  // offsetParent: Element
}

interface ResizeState {
  scaling: boolean;
  direction: string;
  startX: number;
  startY: number;
  centerX: number;
  centerY: number;
  referX: number;
  referY: number;
  width: number;
  height: number;
}

class Resize extends React.Component<any, ResizeState> {
  throttleRotate: (evt: MouseEvent) => void;
  throttleScale: (evt: MouseEvent) => void;

  resizeNode: HTMLElement | null;

  static defaultProps = {
    directions: directionMap,
  };

  constructor(props: ResizeProps) {
    super(props);
    this.state = {
      scaling: false,
      direction: '',
      startX: NaN,
      startY: NaN,
      centerX: NaN,
      centerY: NaN,
      referX: NaN,
      referY: NaN,
      width: NaN,
      height: NaN,
    };
    this.throttleRotate = throttle(this.handleRotate, WAIT);
    this.throttleScale = throttle(this.handleScale, WAIT);
  }

  handleRotateStart: React.MouseEventHandler<HTMLElement> = evt => {
    evt.stopPropagation();
    if (this.props.onRotateStart) {
      this.props.onRotateStart();
    }

    addEventsToDocument({
      mousemove: this.throttleRotate,
      mouseup: this.handleRotateStop,
    });
  };

  handleRotate: React.MouseEventHandler<HTMLElement> = evt => {
    const deg = calcRotateDeg(evt, this);

    if (this.props.onRotate) {
      this.props.onRotate(deg);
    }
  };

  handleRotateStop = () => {
    if (this.props.onRotateStop) {
      this.props.onRotateStop();
    }

    removeEventsFromDocument({
      mousemove: this.throttleRotate,
      mouseup: this.handleRotateStop,
    });
  };

  handleScaleStart: React.MouseEventHandler<HTMLElement> = evt => {
    evt.stopPropagation();
    if (this.props.onScaleStart) {
      this.props.onScaleStart();
    }
    const direction = (evt.target as HTMLElement).getAttribute('data-direction') as string;

    // { startX, startY, centerX, centerY , referX, referY, width, height }
    const positions = getPositions(evt, this);

    this.setState({
      scaling: true,
      direction,
      ...positions,
    });

    addEventsToDocument({
      mousemove: this.throttleScale,
      mouseup: this.handleScaleStop,
    });
  };

  handleScale: React.MouseEventHandler<HTMLElement> = evt => {
    const position = calcPosition(evt, this);

    if (this.props.onScale) {
      this.props.onScale(position);
    }
  };

  handleScaleStop = () => {
    if (this.props.onScaleStop) {
      this.props.onScaleStop();
    }
    this.setState({
      direction: '',
      startX: NaN,
      startY: NaN,
      centerX: NaN,
      centerY: NaN,
      referX: NaN,
      referY: NaN,
      width: NaN,
      height: NaN,
    });

    removeEventsFromDocument({
      mousemove: this.throttleScale,
      mouseup: this.handleScaleStop,
    });
  };

  renderDots(directions: string[], rotate: number) {
    const n = Math.round((rotate % 360) / 45);
    const cursors = directionMap.map((direction, i) => directionMap[(i + n) % 8] + '-resize');
    return directionMap.map((direction: string, idx: number) => {
      if (directions.indexOf(direction) === -1) {
        return null;
      }
      return (
        <span
          key={direction}
          className={`dot dot-${direction}`}
          style={{ cursor: cursors[idx] }}
          data-direction={direction}
          onMouseDown={this.handleScaleStart}
        />
      );
    });
  }

  render() {
    const { directions, canRotate, rotate, style } = this.props;
    return (
      <div className="operate" style={style} ref={node => (this.resizeNode = node)}>
        {canRotate ? (
          <span className="rotate" onMouseDown={this.handleRotateStart}>
            <i className="icon icon-rotate" />
          </span>
        ) : null}
        {this.renderDots(directions, rotate)}
      </div>
    );
  }
}

export default Resize;
